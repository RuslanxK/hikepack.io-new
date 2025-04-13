const express = require("express");
const authMiddleware = require("../middleware/auth");
const { getAllUsers, getUserById, registerUser, loginUser, googleLogin, updateUser, updatePassword, checkEmailExists} = require("../BL/userBL");
const User = require("../models/user")
const upload = require("../configs/upload");

const router = express.Router();

router.get("/me", authMiddleware, (req, res) => {
  res.send(req.user);
});

router.get("/all", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

router.post("/register", upload.single("imageUrl"), async (req, res) => {
  try {
    const response = await registerUser(req.body, req.file);
    res.status(201).json(response);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await loginUser(email, password);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/google-login", async (req, res) => {
  try {
    const response = await googleLogin(req.body.token, res);
    res.json(response);
  } catch (error) {
    console.error("Google login error:", error.message);
    res.status(500).json({ message: "Google login failed", error: error.message });
  }
});

router.put("/update", authMiddleware, upload.single("imageUrl"), async (req, res) => {
  try {
    const updatedUser = await updateUser(req.user._id, req.body, req.file);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/update-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    const response = await updatePassword(token, password);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/check-email", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email }).lean(); 

    if (existingUser) {
      return res.status(200).json({ exists: true, message: "This email is already registered." });
    }

    res.status(200).json({ exists: false, message: "Email is available." });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ message: "Error checking email", error: error.message });
  }
});


router.post("/reset-email-check", async (req, res) => {
  try {
    const response = await checkEmailExists(req.body.email); 
    res.status(200).json(response);
  } catch (error) {
    console.error("Error resetting email:", error);
    res.status(500).json({ message: "Error resetting email", error: error.message });
  }
});



router.post("/check-username", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required." });
    }

    const existingUser = await User.findOne({ username: { $regex: `^${username}$`, $options: "i" } });
    if (existingUser) {
      return res.status(200).json({ exists: true, message: "This username is already taken." });
    }

    res.status(200).json({ exists: false, message: "Username is available." });
  } catch (error) {
    console.error("Error checking username:", error);
    res.status(500).json({ message: "Error checking username", error: error.message });
  }
});



router.put("/:id", async (req, res) => {
  try {
    const { verified } = req.body;
    if (typeof verified !== "boolean") {
      return res.status(400).json({ message: "Invalid request. 'verified' must be a boolean." });
    }
    const updatedUser = await updateUser(req.params.id, { verified });
    res.status(200).json({ message: "User verified successfully", user: updatedUser });
  } catch (error) {
    console.error("Error verifying user:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
