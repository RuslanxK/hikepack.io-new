const Article = require("../models/article");
const mongoose = require("mongoose");
const uploadToS3 = require("../utils/uploadToS3")
const deleteFromS3 = require("../utils/deleteFromS3");


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


exports.updateArticle = async (articleId, updatedFields) => {
  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    throw new Error("Invalid Article ID format");
  }

  const article = await Article.findById(articleId);
  if (!article) {
    throw new Error("Article not found");
  }

  // Only update fields that are allowed
  if (updatedFields.description !== undefined) {
    article.description = updatedFields.description;
  }

  // Optionally add: title, imageUrl, etc.

  const updatedArticle = await article.save();
  return updatedArticle;
};


exports.deleteArticle = async (articleId, isAdmin) => {
  if (!isAdmin) {
    throw new Error("Access Denied: Admins only");
  }

  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    throw new Error("Invalid Article ID format");
  }

  const article = await Article.findById(articleId);
  if (!article) {
    throw new Error("Article not found");
  }

  if (
    article.imageUrl &&
    article.imageUrl.includes('light-pack-planner.s3.eu-north-1.amazonaws.com')
  ) {
    try {
      console.log(`Deleting article image from S3: ${article.imageUrl}`);
      await deleteFromS3(article.imageUrl);
    } catch (err) {
      console.warn("Failed to delete article image from S3:", err.message);
    }
  } else {
    console.log("Article image is not from S3 or does not exist, skipping deletion.");
  }

  // ✅ Delete the article from MongoDB
  const deletedArticle = await Article.findByIdAndDelete(articleId);
  return deletedArticle;
};
