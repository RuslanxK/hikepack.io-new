const Article = require("../models/article");
const mongoose = require("mongoose");

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
  const imageUrlPath = file ? file.originalname : null;

  if (!title || !description || !file) {
    throw new Error("All fields are required");
  }

  const newArticle = new Article({
    title,
    description,
    imageUrl: imageUrlPath,
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
