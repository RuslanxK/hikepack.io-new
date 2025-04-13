const express = require("express");
const authMiddleware = require("../middleware/auth");
const upload = require("../configs/upload");
const {createTrip, getTrips, getTripById, updateTrip, deleteTrip, duplicateTrip} = require("../BL/tripBL");

const router = express.Router();

router.post("/", authMiddleware, upload.single("imageUrl"), async (req, res) => {
  try {
    
    const savedTrip = await createTrip(req.body, req.file, req.user._id);
    res.status(201).json(savedTrip);
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { page, limit, searchTerm, weightUnit } = req.query;
    const response = await getTrips(req.user._id, page, limit, searchTerm, weightUnit);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const trip = await getTripById(req.params.id, req.user._id);
    res.status(200).json(trip);
  } catch (error) {
    console.error("Error fetching trip by ID:", error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", authMiddleware, upload.single("imageUrl"), async (req, res) => {
  try {
    const updatedTrip = await updateTrip(req.params.id, req.body, req.file, req.user._id);
    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const response = await deleteTrip(req.params.id, req.user._id);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/duplicate", authMiddleware, async (req, res) => {
  try {
    
    const savedTrip = await duplicateTrip(req.body._id, req.user._id );
    res.status(201).json(savedTrip);
  } catch (error) {
    console.error("Error duplicating trip:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
