const Category = require("../models/category");
const Item = require("../models/item");
const calculateCategoryWeights = require("../utils/calculateCategoryWeights");
const deleteFromS3 = require("../utils/deleteFromS3");


exports.getCategories = async (bagId, auth, user) => {
  const isAuthDisabled = auth === "false";
  const queryConditions = isAuthDisabled ? { bagId } : { owner: user._id, bagId };

  const categories = await Category.find(queryConditions).lean();
  const categoriesWithItems = await Promise.all(
    categories.map(async (category) => {
      const items = await Item.find({ categoryId: category._id }).lean();
      return { ...category, items };
    })
  );

  const categoriesWithWeights = isAuthDisabled
    ? await Promise.all(categoriesWithItems.map(async (category) => {
        return calculateCategoryWeights([category], category.owner);
      })).then((weights) => weights.flat())
    : await calculateCategoryWeights(categoriesWithItems, user._id);

  return categoriesWithWeights;
};

exports.getCategoryById = async (id, user) => {
  const category = await Category.findById({ _id: id, owner: user._id });
  if (!category) {
    throw new Error("Category not found");
  }
  return category;
};

exports.createCategory = async (categoryData, user) => {
  const { bagId } = categoryData;
  const categoriesCount = await Category.countDocuments({ bagId, owner: user._id });

  const newCategory = new Category({
    ...categoryData,
    owner: user._id,
    order: categoriesCount + 1,
  });

  return await newCategory.save();
};

exports.updateCategory = async (categoryId, categoryData, user) => {
  const updatedCategory = await Category.findOneAndUpdate(
    { _id: categoryId, owner: user._id },
    categoryData,
    { new: true, runValidators: true }
  );

  if (!updatedCategory) {
    throw new Error("Category not found or access denied");
  }

  return updatedCategory;
};


exports.deleteCategory = async (categoryId, user) => {
  const category = await Category.findOne({
    _id: categoryId,
    owner: user._id,
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const items = await Item.find({ categoryId: category._id, owner: user._id });

  for (const item of items) {
    if (item.imageUrl) {
      try {
        await deleteFromS3(item.imageUrl);
      } catch (err) {
        console.error(`Failed to delete image for item ${item._id}:`, err);
      }
    }
  }
  await Item.deleteMany({ categoryId: category._id, owner: user._id });

  await Category.findOneAndDelete({
    _id: categoryId,
    owner: user._id,
  });

  await Category.updateMany(
    {
      bagId: category.bagId,
      owner: user._id,
      order: { $gt: category.order },
    },
    { $inc: { order: -1 } }
  );

  return { message: "Category and associated items/images deleted successfully" };
};