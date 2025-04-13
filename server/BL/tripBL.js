const Trip = require("../models/trip");
const Bag = require("../models/bag");
const Item = require("../models/item");
const Category = require("../models/category");
const mongoose = require("mongoose");
const uploadToS3 = require("../utils/uploadToS3");
const deleteFromS3 = require("../utils/deleteFromS3");
const copyS3ObjectWithNewKey = require("../utils/copyS3ObjectWithNewKey");
const axios = require("axios")


const WEIGHT_CONVERSION = {
  lb: { lb: 1, kg: 0.45359237, g: 453.59237, oz: 16 },
  kg: { lb: 2.2046226218, kg: 1, g: 1000, oz: 35.27396195 },
  g: { lb: 0.0022046226, kg: 0.001, g: 1, oz: 0.03527396195 },
  oz: { lb: 0.0625, kg: 0.0283495231, g: 28.3495231, oz: 1 },
};

exports.createTrip = async (tripData, file, userId) => {
  let imageUrl = null;

  if (file) {
    try {
      imageUrl = await uploadToS3(file, "trips");
    } catch (err) {
      console.error("Error uploading to S3:", err);
      throw new Error("Failed to upload trip image");
    }
  } else {
    // Fetch a random hiking image from Unsplash
    try {
      const response = await axios.get(
        "https://api.unsplash.com/search/photos",
        {
          params: {
            query: "hiking",
            per_page: 20,
            client_id: process.env.UNSPLASH_ACCESS_KEY, // Store your key in .env
          },
        }
      );

      const results = response.data.results;
      if (results && results.length > 0) {
        const randomIndex = Math.floor(Math.random() * results.length);
        imageUrl = results[randomIndex].urls.regular;
      } else {
        console.warn("No Unsplash images found, continuing without image.");
      }
    } catch (err) {
      console.error("Error fetching Unsplash image:", err.message);
      throw new Error("Failed to fetch hiking image from Unsplash");
    }
  }

  const trip = new Trip({
    ...tripData,
    startDate: new Date(tripData.startDate),
    endDate: new Date(tripData.endDate),
    imageUrl,
    owner: userId,
  });

  return await trip.save();
};


exports.getTrips = async (userId, page, limit, searchTerm, weightUnit) => {
  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 7;

  const query = {
    owner: userId,
    ...(searchTerm && { name: { $regex: searchTerm, $options: "i" } }),
  };

  const trips = await Trip.find(query)
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .exec();

  const total = await Trip.countDocuments(query);

  // Fetch latest updated bag
  const latestBag = await Bag.findOne({ owner: userId }).sort({ updatedAt: -1 }).exec();

  let latestBagData = null;
  if (latestBag) {
    const totalItems = await Item.countDocuments({ bagId: latestBag._id });
    const totalCategories = await Category.countDocuments({ bagId: latestBag._id });

    const items = await Item.find({ bagId: latestBag._id });

    const totalBaseWeight = items.reduce((acc, item) => {
      const weight = parseFloat(item.weight?.toString() || "0");
      const qty = parseFloat(item.qty?.toString() || "1");
      const fromUnit = item.weightOption || weightUnit || "lb";

      const convertedWeight = weight * qty * (WEIGHT_CONVERSION[fromUnit][weightUnit] || 1);

      return item.worn ? acc : acc + convertedWeight;
    }, 0);

    latestBagData = {
      ...latestBag.toObject(),
      totalItems,
      totalCategories,
      totalBaseWeight: totalBaseWeight.toFixed(2),
    };
  }

  return { data: trips, total, page: pageNumber, limit: pageSize, latestBag: latestBagData };
};

exports.getTripById = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid Trip ID format");
  }
  const trip = await Trip.findOne({ _id: id, owner: userId });
  if (!trip) {
    throw new Error("Trip not found or access denied");
  }
  return trip;
};


exports.updateTrip = async (tripId, tripData, file, userId) => {
  const existingTrip = await Trip.findOne({ _id: tripId, owner: userId });

  if (!existingTrip) {
    throw new Error("Trip not found or access denied");
  }

  let imageUrl = existingTrip.imageUrl; // Default to existing image

  if (file) {
    try {
      // Delete the old image only if it's from AWS S3
      if (
        existingTrip.imageUrl &&
        existingTrip.imageUrl.includes('light-pack-planner.s3.eu-north-1.amazonaws.com')
      ) {
        console.log(`Deleting old trip image from S3: ${existingTrip.imageUrl}`);
        try {
          await deleteFromS3(existingTrip.imageUrl);
        } catch (err) {
          console.warn("Failed to delete old trip image from S3:", err.message);
          // Continue with upload
        }
      } else {
        console.log("Old trip image is not from AWS S3, skipping deletion.");
      }

      // Upload the new image to S3
      imageUrl = await uploadToS3(file, "trips");
    } catch (err) {
      console.error("Error uploading new trip image to S3:", err);
      throw new Error("Failed to update trip image");
    }
  }

  // Update trip data
  const updatedTrip = await Trip.findOneAndUpdate(
    { _id: tripId, owner: userId },
    {
      ...tripData,
      imageUrl,
      startDate: tripData.startDate ? new Date(tripData.startDate) : undefined,
      endDate: tripData.endDate ? new Date(tripData.endDate) : undefined,
    },
    { new: true }
  );

  if (!updatedTrip) {
    throw new Error("Trip update failed");
  }

  return updatedTrip;
};




exports.deleteTrip = async (tripId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    throw new Error("Invalid Trip ID format");
  }

  const trip = await Trip.findOne({ _id: tripId, owner: userId });
  if (!trip) {
    throw new Error("Trip not found or access denied");
  }

  try {
    // Delete trip image from S3 only if it's from AWS S3
    if (trip.imageUrl && trip.imageUrl.includes('light-pack-planner.s3.eu-north-1.amazonaws.com')) {
      console.log(`Deleting trip image from S3: ${trip.imageUrl}`);
      await deleteFromS3(trip.imageUrl);
    } else {
      console.log("Trip image is not from AWS S3, skipping deletion.");
    }

    // Fetch all bags under the trip (to delete bag images)
    const bags = await Bag.find({ tripId: trip._id });

    const deleteBagImagePromises = bags
      .filter(bag => bag.imageUrl && bag.imageUrl.includes('light-pack-planner.s3.eu-north-1.amazonaws.com'))
      .map(bag => {
        console.log(`Deleting bag image from S3: ${bag.imageUrl}`);
        return deleteFromS3(bag.imageUrl);
      });

    // Fetch all items under these bags (to delete item images)
    const bagIds = bags.map(bag => bag._id);
    const items = await Item.find({ bagId: { $in: bagIds } });

    const deleteItemImagePromises = items
      .filter(item => item.imageUrl && item.imageUrl.includes('light-pack-planner.s3.eu-north-1.amazonaws.com'))
      .map(item => {
        console.log(`Deleting item image from S3: ${item.imageUrl}`);
        return deleteFromS3(item.imageUrl);
      });

    // Delete all bag and item images in parallel
    await Promise.all([...deleteBagImagePromises, ...deleteItemImagePromises]);

    // Now delete the trip (pre-hook will handle DB deletions of bags, categories, and items)
    await Trip.findOneAndDelete({ _id: tripId, owner: userId });

    return { message: "Trip and all associated images deleted successfully" };
  } catch (error) {
    console.error("Error deleting trip and images:", error);
    throw new Error("Failed to delete trip and images");
  }
};



exports.duplicateTrip = async (tripId, userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      throw new Error("Invalid Trip ID format");
    }

    const originalTrip = await Trip.findById(tripId).lean();
    if (!originalTrip) throw new Error("Trip not found");

    const { _id, createdAt, updatedAt, imageUrl: originalImageUrl, ...tripData } = originalTrip;

    let newImageUrl = originalImageUrl;
    if (originalImageUrl && originalImageUrl.includes('light-pack-planner.s3.eu-north-1.amazonaws.com')) {
      try {
        newImageUrl = await copyS3ObjectWithNewKey(originalImageUrl, "trips");
      } catch (err) {
        console.error("Failed to duplicate trip image:", err);
        throw new Error("Failed to duplicate trip image");
      }
    }
    const newTrip = await new Trip({
      ...tripData,
      owner: userId,
      imageUrl: newImageUrl,
    }).save();

    const bags = await Bag.find({ tripId }).lean();
    const newBagIds = {};
    
    const newBags = await Promise.all(bags.map(async (bag) => {
      const { _id, createdAt, updatedAt, imageUrl: bagImageUrl, ...bagData } = bag;

      let newBagImageUrl = bagImageUrl;
      if (bagImageUrl && bagImageUrl.includes('light-pack-planner.s3.eu-north-1.amazonaws.com')) {
        try {
          newBagImageUrl = await copyS3ObjectWithNewKey(bagImageUrl, "bags");
        } catch (err) {
          console.error(`Failed to duplicate bag image for bag ${bag._id}:`, err);
          throw new Error("Failed to duplicate bag image");
        }
      }

      const newBag = new Bag({ 
        ...bagData, 
        tripId: newTrip._id, 
        owner: userId, 
        imageUrl: newBagImageUrl 
      });

      newBagIds[bag._id] = newBag._id;
      return newBag;
    }));
    await Bag.insertMany(newBags);

    const oldBagIds = Object.keys(newBagIds);
    const categories = await Category.find({ bagId: { $in: oldBagIds } }).lean();

    const newCategoryIds = {};
    const newCategories = categories.map((category) => {
      const { _id, createdAt, updatedAt, ...categoryData } = category;
      const newCategory = new Category({
        ...categoryData,
        tripId: newTrip._id,
        bagId: newBagIds[category.bagId],
        owner: userId,
      });
      newCategoryIds[category._id] = newCategory._id;
      return newCategory;
    });
    await Category.insertMany(newCategories);

    const oldCategoryIds = Object.keys(newCategoryIds);
    const items = await Item.find({ categoryId: { $in: oldCategoryIds } }).lean();

    const newItems = await Promise.all(items.map(async (item) => {
      const { _id, createdAt, updatedAt, imageUrl: itemImageUrl, ...itemData } = item;

      let newItemImageUrl = itemImageUrl;
      if (itemImageUrl && itemImageUrl.includes('light-pack-planner.s3.eu-north-1.amazonaws.com')) {
        try {
          newItemImageUrl = await copyS3ObjectWithNewKey(itemImageUrl, "items");
        } catch (err) {
          console.error(`Failed to duplicate item image for item ${item._id}:`, err);
          throw new Error("Failed to duplicate item image");
        }
      }

      return new Item({
        ...itemData,
        tripId: newTrip._id,
        bagId: newBagIds[item.bagId],
        categoryId: newCategoryIds[item.categoryId],
        owner: userId,
        imageUrl: newItemImageUrl,
      });
    }));
    await Item.insertMany(newItems);

    return newTrip;
  } catch (error) {
    console.error("Failed to duplicate trip:", error);
    throw new Error("Failed to duplicate trip: " + error.message);
  }
};
