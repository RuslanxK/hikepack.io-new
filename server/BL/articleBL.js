const Article = require("../models/article");
const mongoose = require("mongoose");
const uploadToS3 = require("../utils/uploadToS3")

exports.getAllArticles = async () => {
  return await Article.find();
};

exports.getArticleById = async (articleId) => {
  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    throw new Error("Invalid Article ID format");
  }
  const article = await Article.findById(articleId);
  if (!article) {
    throw new Error("Article not found");
  }
  return article;
};

exports.createArticle = async (title, description, file) => {
  if (!title || !description) {
    throw new Error("Title and description are required");
  }

  let imageUrl = null;

  if (file) {
    try {
      imageUrl = await uploadToS3(file, "articles");
    } catch (err) {
      console.error("Error uploading article image to S3:", err);
      throw new Error("Failed to upload article image");
    }
  }

  const newArticle = new Article({
    title,
    description,
    imageUrl, // will be null if no image uploaded
  });

  return await newArticle.save();
};

exports.deleteArticle = async (articleId, isAdmin) => {
  if (!isAdmin) {
    throw new Error("Access Denied: Admins only");
  }

  const deletedArticle = await Article.findByIdAndDelete(articleId);
  if (!deletedArticle) {
    throw new Error("Article not found");
  }

  return deletedArticle;
};
