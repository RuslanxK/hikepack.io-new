const mongoose = require("mongoose");
const Bag = require("../models/bag");
const User = require("../models/user");
const Category = require("../models/category");
const Item = require("../models/item");

async function fetchCommunityBags() {
  const sharedBags = await Bag.find({ exploreBags: true });
  const bagDetails = await Promise.all(
    sharedBags.map(async (bag) => {
      const owner = await User.findById(bag.owner, "username imageUrl");
      const categories = await Category.find({ bagId: bag._id });
      const itemsCount = await Item.countDocuments({
        categoryId: { $in: categories.map((cat) => cat._id) },
      });

      return {
        bagId: bag._id,
        bagName: bag.name,
        bagDescription: bag.description,
        likes: bag.likes || 0,
        ownerId: owner?._id || null,
        ownerName: owner?.username || "Unknown",
        ownerImageUrl: owner?.imageUrl || null,
        categoriesCount: categories.length,
        itemsCount,
      };
    })
  );

  return bagDetails;
}

module.exports = {
  fetchCommunityBags,
};
