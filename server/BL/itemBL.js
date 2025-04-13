const Item = require("../models/item");
const mongoose = require("mongoose");
const uploadToS3 = require("../utils/uploadToS3");
const deleteFromS3 = require("../utils/deleteFromS3");
const copyS3ObjectWithNewKey = require("../utils/copyS3ObjectWithNewKey");

exports.getItems = async (userId, tripId, bagId, categoryId) => {
  return await Item.find({ tripId, bagId, categoryId, owner: userId });
};

exports.getItemById = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid Item ID format");
  }
  const item = await Item.findOne({ _id: id, owner: userId });
  if (!item) {
    throw new Error("Item not found or access denied");
  }
  return item;
};


exports.getAllItemsByUser = async (userId) => {
  return await Item.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        name: { $exists: true, $ne: "" },
      },
    },
    { $sort: { updatedAt: -1 } }, // sort by latest updated
    {
      $group: {
        _id: "$name", // group by name
        doc: { $first: "$$ROOT" }, // take most recently updated item per name
      },
    },
    { $replaceRoot: { newRoot: "$doc" } },
    { $sort: { updatedAt: -1 } }, // ensure final sorted order
    { $limit: 50 },
  ]);
};



exports.createItem = async (itemData, userId) => {
  const { categoryId } = itemData;
  const itemsCount = await Item.countDocuments({ categoryId, owner: userId });

  let newImageUrl = null;

  if (itemData.imageUrl) {
    try {
      newImageUrl = await copyS3ObjectWithNewKey(itemData.imageUrl, "items");
    } catch (err) {
      console.error("Failed to duplicate item image:", err);
      throw new Error("Failed to duplicate item image");
    }
  }

  const newItem = new Item({
    ...itemData,
    imageUrl: newImageUrl || null,
    owner: userId,
    order: itemsCount + 1,
  });

  return await newItem.save();
};


exports.updateItem = async (itemId, itemData, userId, file) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new Error("Invalid Item ID format");
  }

  const item = await Item.findOne({ _id: itemId, owner: userId });

  if (!item) {
    throw new Error("Item not found or access denied");
  }

  if (file) {
    try {
      if (item.imageUrl) {
        await deleteFromS3(item.imageUrl);
      }

      const newImageUrl = await uploadToS3(file, "items");
      item.imageUrl = newImageUrl;
    } catch (err) {
      console.error("Failed to update item image:", err);
      throw new Error("Failed to update item image");
    }
  }

  Object.keys(itemData).forEach((key) => {
    item[key] = itemData[key];
  });

  const updatedItem = await item.save();
  return updatedItem;
};


exports.updateItemOrder = async (itemId, order) => {
  const updatedItem = await Item.findByIdAndUpdate(
    itemId,
    { order },
    { new: true, runValidators: true }
  );

  if (!updatedItem) {
    throw new Error("Item not found");
  }

  return updatedItem;
};



exports.deleteItems = async (ids, userId) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Invalid or empty IDs array");
  }

  const items = await Item.find({
    _id: { $in: ids },
    owner: userId,
  });

  if (items.length === 0) {
    throw new Error("No items found to delete");
  }

  for (const item of items) {
    if (item.imageUrl) {
      try {
        await deleteFromS3(item.imageUrl);
      } catch (err) {
        console.error(`Failed to delete image for item ${item._id}:`, err);
      }
    }
  }
  const result = await Item.deleteMany({
    _id: { $in: ids },
    owner: userId,
  });

  return { message: "Items and associated images deleted successfully", deletedCount: result.deletedCount };
};