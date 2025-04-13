const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {getItems, getItemById, createItem, updateItem, updateItemOrder, deleteItems, getAllItemsByUser} = require("../BL/itemBL");
const upload = require("../configs/upload");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { tripId, bagId, categoryId } = req.query;
    const items = await getItems(req.user._id, tripId, bagId, categoryId);
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch items", error: error.message });
  }
});


router.get("/all/by-user", authMiddleware, async (req, res) => {
  try {
    const items = await getAllItemsByUser(req.user._id);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch items", error: error.message });
  }
});


router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const item = await getItemById(req.params.id, req.user._id);
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch item", error: error.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const savedItem = await createItem(req.body, req.user._id);
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: "Failed to add item", error: error.message });
  }
});

router.put("/:id", authMiddleware, upload.single("imageUrl"), async (req, res) => {
  try {
    const updatedItem = await updateItem(req.params.id, req.body, req.user._id, req.file);
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Failed to update item", error: error.message });
  }
});

router.put("/order/:id", authMiddleware, async (req, res) => {
  try {
    const { order } = req.body;
    const updatedItem = await updateItemOrder(req.params.id, order);
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Failed to update item order", error: error.message });
  }
});

router.delete("/", authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await deleteItems(ids, req.user._id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete items", error: error.message });
  }
});

module.exports = router;
