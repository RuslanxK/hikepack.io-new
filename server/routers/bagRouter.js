const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const upload = require("../configs/upload");
const mongoose = require("mongoose")
const conditionalAuthMiddleware = require("../middleware/conditionalAuth");
const {
  createBag,
  duplicateBag,
  deleteBag,
  getBags,
  updateBag,
  getLatestBags,
  getBagById,
  getCommunityBags,
  getTripAndUserByBagId
} = require("../BL/bagBL");

router.post("/", authMiddleware, upload.single("imageUrl"), async (req, res) => {
  try {
    const savedBag = await createBag(req.body, req.file, req.user._id);
    res.status(201).json(savedBag);
  } catch (error) {
    console.error("Error creating bag:", error);
    res.status(500).json({ message: "Failed to create bag", error: error.message });
  }
});

router.post("/duplicate", authMiddleware, async (req, res) => {
  try {
    const bag = req.body;
    const savedBag = await duplicateBag(bag._id, req.user._id);
    res.status(201).json(savedBag);
  } catch (error) {
    console.error("Error duplicating bag:", error);
    res.status(500).json({ message: "Failed to duplicate bag", error: error.message });
  }
});


router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await deleteBag(req.params.id, req.user._id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting bag:", error);
    res.status(500).json({ message: "Failed to delete bag", error: error.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { tripId, page, limit, searchTerm } = req.query;
    const bagsData = await getBags(req.user._id, tripId, page, limit, searchTerm);
    res.status(200).json(bagsData);
  } catch (error) {
    console.error("Error fetching bags:", error);
    res.status(500).json({ message: "Failed to fetch bags", error: error.message });
  }
});

router.put("/:id", authMiddleware, upload.single("imageUrl"), async (req, res) => {
  try {
    const updatedBag = await updateBag(req.params.id, req.body, req.file, req.user._id);
    res.status(200).json(updatedBag);
  } catch (error) {
    console.error("Error updating bag:", error);
    res.status(500).json({ message: "Failed to update bag", error: error.message });
  }
});

router.get("/latest", authMiddleware, async (req, res) => {
  try {
    const latestBags = await getLatestBags(req.user._id, req.query.limit);
    res.status(200).json(latestBags);
  } catch (error) {
    console.error("Error fetching latest bags:", error);
    res.status(500).json({ message: "Failed to fetch latest bags", error: error.message });
  }
});

router.get("/community", authMiddleware, async (req, res) => {
  try {
    const communityBags = await getCommunityBags();
    res.status(200).json(communityBags);
  } catch (error) {
    console.error("Error fetching community bags:", error);
    res.status(500).json({ message: "Failed to fetch community bags", error: error.message });
  }
});


router.get("/:id/owner-and-trip", async (req, res) => {
  try {
    const bagId = req.params.id;
    const { trip, user } = await getTripAndUserByBagId(bagId);
    res.status(200).json({ trip, user });
  } catch (error) {
    console.error("Error fetching trip and user by bag ID:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/:id", conditionalAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const authDisabled = req.query.auth === "false";
    const userId = authDisabled ? null : req.user?._id; // Only use userId when auth is enabled

    const bag = await getBagById(id, userId, authDisabled);

    res.status(200).json(bag);
  } catch (error) {
    console.error("Error fetching bag by ID:", error);
    res.status(500).json({ message: "Failed to fetch bag", error: error.message });
  }
});

module.exports = router;
