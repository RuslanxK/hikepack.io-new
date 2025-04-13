const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const conditionalAuthMiddleware = require("../middleware/conditionalAuth");
const { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require("../BL/categoryBL");

router.get("/", conditionalAuthMiddleware, async (req, res) => {
  try {
    const { bagId, auth } = req.query;
    const categories = await getCategories(bagId, auth, req.user);
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories with items:", error.message);
    res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const category = await getCategoryById(req.params.id, req.user);
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch category", error: error.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const savedCategory = await createCategory(req.body, req.user);
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ message: "Failed to create category.", error: error.message });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedCategory = await updateCategory(req.params.id, req.body, req.user);
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: "Failed to update category", error: error.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await deleteCategory(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category", error: error.message });
  }
});

module.exports = router;
