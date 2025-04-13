const Bag = require("../models/bag");
const Item = require("../models/item")
const Trip = require('../models/trip')
const User = require("../models/user")
const Category = require("../models/category")
const mongoose = require("mongoose");
const { fetchCommunityBags } = require("./community");
const uploadToS3 = require("../utils/uploadToS3");
const deleteFromS3 = require("../utils/deleteFromS3");
const copyS3ObjectWithNewKey = require("../utils/copyS3ObjectWithNewKey");


exports.createBag = async (bagData, file, userId) => {
  let imageUrl = bagData.imageUrl || null; 
  if (file) {
    try {
      imageUrl = await uploadToS3(file, "bags"); 
    } catch (err) {
      console.error("Error uploading bag image to S3:", err);
      throw new Error("Failed to upload bag image");
    }
  }
  const bag = new Bag({...bagData, imageUrl: imageUrl, owner: userId });
  return await bag.save();
};


exports.duplicateBag = async (bagId, userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(bagId)) {
      throw new Error("Invalid Bag ID format");
    }

    const originalBag = await Bag.findById(bagId).lean();
    if (!originalBag) throw new Error("Bag not found");

    const { _id, createdAt, updatedAt, imageUrl: originalImageUrl, ...bagData } = originalBag;

    // Duplicate bag image only if it's from S3
    let newImageUrl = null;
    if (originalImageUrl && originalImageUrl.includes('light-pack-planner.s3.eu-north-1.amazonaws.com')) {
      console.log("Copying bag image from S3:", originalImageUrl);
      try {
        newImageUrl = await copyS3ObjectWithNewKey(originalImageUrl, "bags");
      } catch (err) {
        console.error("Failed to duplicate bag image:", err);
        throw new Error("Failed to duplicate bag image");
      }
    } else {
      newImageUrl = originalImageUrl; // Use original URL if not from S3
    }

    const newBag = await new Bag({ ...bagData, owner: userId, imageUrl: newImageUrl }).save();

    const categories = await Category.find({ bagId }).lean();
    const newCategoryIds = {};
    const newCategories = categories.map((category) => {
      const { _id, createdAt, updatedAt, ...categoryData } = category;
      const newCategory = new Category({ ...categoryData, bagId: newBag._id, owner: userId });
      newCategoryIds[category._id] = newCategory._id;
      return newCategory;
    });

    await Category.insertMany(newCategories);

    const items = await Item.find({ bagId }).lean();

    const newItems = await Promise.all(items.map(async (item) => {
      const { _id, createdAt, updatedAt, imageUrl: itemImageUrl, ...itemData } = item;

      let newItemImageUrl = null;
      if (itemImageUrl && itemImageUrl.includes('light-pack-planner.s3.eu-north-1.amazonaws.com')) {
        console.log(`Copying item image from S3: ${itemImageUrl}`);
        try {
          newItemImageUrl = await copyS3ObjectWithNewKey(itemImageUrl, "items");
        } catch (err) {
          console.error(`Failed to duplicate item image for item ${item._id}:`, err);
          throw new Error("Failed to duplicate item image");
        }
      } else {
        newItemImageUrl = itemImageUrl; // Use original URL if not from S3
      }

      return new Item({
        ...itemData,
        bagId: newBag._id,
        categoryId: newCategoryIds[item.categoryId],
        owner: userId,
        imageUrl: newItemImageUrl
      });
    }));

    await Item.insertMany(newItems);

    return newBag;
  } catch (error) {
    console.error("Failed to duplicate bag:", error);
    throw new Error("Failed to duplicate bag: " + error.message);
  }
};




exports.deleteBag = async (bagId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(bagId)) {
    throw new Error("Invalid Bag ID format");
  }

  const bag = await Bag.findOne({ _id: bagId, owner: userId });

  if (!bag) {
    throw new Error("Bag not found or access denied");
  }

  try {
    // Delete bag image from S3 only if it's from your S3 bucket
    if (bag.imageUrl && bag.imageUrl.includes('light-pack-planner.s3.eu-north-1.amazonaws.com')) {
      console.log(`Deleting bag image from S3: ${bag.imageUrl}`);
      try {
        await deleteFromS3(bag.imageUrl);
      } catch (err) {
        console.warn("Failed to delete bag image from S3:", err.message);
        // Continue to item deletions
      }
    } else {
      console.log("Bag image URL is not from S3, skipping deletion.");
    }

    // Fetch items for the bag
    const items = await Item.find({ bagId });

    // Delete each item image from S3 only if it's from your S3 bucket
    for (const item of items) {
      if (item.imageUrl && item.imageUrl.includes('light-pack-planner.s3.eu-north-1.amazonaws.com')) {
        console.log(`Deleting item image from S3: ${item.imageUrl}`);
        try {
          await deleteFromS3(item.imageUrl);
        } catch (err) {
          console.warn(`Failed to delete item image for item ${item._id}:`, err.message);
        }
      } else {
        console.log(`Item ${item._id} image URL is not from S3, skipping deletion.`);
      }
    }

    // Delete the bag (associated categories and items are deleted via schema middleware)
    await Bag.findOneAndDelete({ _id: bagId, owner: userId });

    return { message: "Bag, item images, and associated data deleted successfully" };
  } catch (error) {
    console.error("Error deleting bag and item images:", error);
    throw new Error("Failed to delete bag and item images");
  }
};



exports.getBags = async (userId, tripId, page, limit, searchTerm) => {
  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 7;
  const query = {
    owner: userId,
    tripId,
    ...(searchTerm && { name: { $regex: searchTerm, $options: "i" } }),
  };

  const bags = await Bag.find(query)
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .exec();

  const total = await Bag.countDocuments(query);

  return { data: bags, total, page: pageNumber, limit: pageSize };
};



exports.updateBag = async (bagId, bagData, file, userId) => {
  const existingBag = await Bag.findOne({ _id: bagId, owner: userId });

  if (!existingBag) {
    throw new Error("Bag not found or access denied");
  }

  let imageUrl = existingBag.imageUrl; // Default to existing image

  if (file) {
    try {
      // Only delete old image if it IS an AWS S3 URL
      if (
        existingBag.imageUrl &&
        existingBag.imageUrl.includes('light-pack-planner.s3.eu-north-1.amazonaws.com')
      ) {
        console.log(`Deleting old S3 image: ${existingBag.imageUrl}`);
        try {
          await deleteFromS3(existingBag.imageUrl);
        } catch (err) {
          console.warn("Failed to delete old S3 image:", err.message);
        }
      } else {
        console.log("Old image is not from S3, skipping deletion.");
      }

      // Upload new image to S3
      imageUrl = await uploadToS3(file, "bags");
    } catch (err) {
      console.error("Error uploading new bag image to S3:", err);
      throw new Error("Failed to update bag image");
    }
  }

  const updatedBag = await Bag.findOneAndUpdate(
    { _id: bagId, owner: userId },
    { ...bagData, imageUrl },
    { new: true }
  );

  if (!updatedBag) {
    throw new Error("Bag update failed");
  }

  return updatedBag;
};



exports.getLatestBags = async (userId, limit) => {
  return await Bag.find({ owner: userId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10))
    .exec();
};

exports.getCommunityBags = async () => {
  return await fetchCommunityBags();
};

exports.getBagById = async (bagId, userId, authDisabled) => {
  if (!mongoose.Types.ObjectId.isValid(bagId)) {
    throw new Error("Invalid Bag ID format");
  }

  if (authDisabled) {
    const bag = await Bag.findById(bagId);
    if (!bag) {
      throw new Error("Bag not found");
    }
    return bag;
  }

  const bag = await Bag.findOne({ _id: bagId, owner: userId });
  if (!bag) {
    throw new Error("Bag not found or access denied");
  }

  return bag;
};


exports.getTripAndUserByBagId = async (bagId) => {
  if (!mongoose.Types.ObjectId.isValid(bagId)) {
    throw new Error("Invalid Bag ID format");
  }

  const bag = await Bag.findById(bagId).lean();
  if (!bag) {
    throw new Error("Bag not found");
  }

  const trip = await Trip.findById(bag.tripId).lean();
  if (!trip) {
    throw new Error("Trip not found");
  }

  const user = await User.findById(bag.owner)
    .select("username email imageUrl")
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  return { trip, user };
};
