const express = require("express");
const router = express.Router();
const upload = require("../configs/upload");
const authMiddleware = require("../middleware/auth");
const { getAllArticles, getArticleById, createArticle, deleteArticle, updateArticle} = require("../BL/articleBL");

router.get("/", async (req, res) => {
  try {
    const articles = await getAllArticles();
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch articles", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const article = await getArticleById(req.params.id);
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch article", error: error.message });
  }
});

router.post("/", upload.single("imageUrl"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;
    const savedArticle = await createArticle(title, description, file);
    res.status(201).json(savedArticle);
  } catch (error) {
    res.status(500).json({ message: "Failed to create article", error: error.message });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const updatedArticle = await updateArticle(req.params.id, req.body);
    res.status(200).json(updatedArticle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedArticle = await deleteArticle(req.params.id, req.user.isAdmin);
    res.status(200).json({ message: "Article deleted successfully", deletedArticle });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete article", error: error.message });
  }
});

module.exports = router;
