const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const axios = require("axios");
const crypto = require("crypto");
const { generateJwtToken, setTokenCookie, findOrCreateUser } = require("../utils/authUtils");
const { generateRegisterHTML, sendEmail, generateForgotPasswordHTML } = require("../emails/email");
const uploadToS3 = require("../utils/uploadToS3");
const deleteFromS3 = require("../utils/deleteFromS3");

exports.getAllUsers = async () => {
  return await User.find().select("-password");
};

exports.getUserById = async (id) => {
  return await User.findById(id).select("-password");
};


exports.registerUser = async (userData, file) => {
  const { email } = userData;
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map(email => email.trim()) : [];
  const isAdmin = adminEmails.includes(email);
  let imageUrl = null;
  if (file) {
    try {
      imageUrl = await uploadToS3(file, "users"); 
    } catch (err) {
      console.error("Error uploading to S3:", err);
      throw new Error("Failed to upload image");
    }
  }

  const newUser = new User({...userData,isAdmin,imageUrl });
  await newUser.save();
  const emailContent = generateRegisterHTML(newUser._id);
  await sendEmail(email, "Welcome to hikepack.io", emailContent);

  return { message: "User registered successfully", isAdmin };
};



exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("User not found");
  if (!user.verified) throw new Error("Account not verified. Please check your email.");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Invalid password");

  user.lastLoggedIn = new Date();
  user.hasCompletedProfile = true;
  await user.save();

  const token = jwt.sign(user._doc, process.env.JWT_SECRET, { expiresIn: "7d" });
  

  const userResponse = user.toObject();
  delete userResponse.password;

  return { message: "Login successful", token, user: userResponse };
};


exports.googleLogin = async (googleAccessToken, res) => {
  const response = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", {
    headers: { Authorization: `Bearer ${googleAccessToken}` },
  });

  const profile = response.data;
  if (!profile.email) throw new Error("Invalid Google token");

  const user = await findOrCreateUser(profile);
  const jwtToken = generateJwtToken(user);
  setTokenCookie(res, jwtToken);

  return { token: jwtToken, user };
};

exports.updateUser = async (userId, updates, file) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (file) {
    try {
      // Delete previous image if it exists
      if (user.imageUrl) {
        await deleteFromS3(user.imageUrl);
      }

      // Upload new image
      const newImageUrl = await uploadToS3(file, "users");
      user.imageUrl = newImageUrl;
    } catch (err) {
      console.error("Failed to update user image:", err);
      throw new Error("Failed to update user image");
    }
  }

  // Apply other updates to the user object
  Object.keys(updates).forEach((key) => {
    user[key] = updates[key];
  });

  const updatedUser = await user.save();
  const userObj = updatedUser.toObject();
  delete userObj.password;

  return userObj;
};


exports.updatePassword = async (token, newPassword) => {
  if (!token || !newPassword) throw new Error("Token and new password are required.");

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error("Invalid or expired token.");

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return { message: "Password updated successfully." };
};

exports.checkEmailExists = async (email) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    existingUser.resetPasswordToken = resetToken;
    existingUser.resetPasswordExpires = resetTokenExpiry;
    await existingUser.save();

    const emailContent = generateForgotPasswordHTML(resetToken);
    await sendEmail(email, "Action Required: Reset Your Hikepack.io Password (Expires in 15 Minutes)", emailContent);
    
    return { exists: true };
  }

  return { exists: false };
};
