const express = require('express');
const { sendReportEmail, reportEmail } = require('../emails/email');
const User = require('../models/user'); 
const authMiddleware = require('../middleware/auth'); 
const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { title, description } = req.body;

  try {
    const user = await User.findById(req.user._id); 

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const emailHtml = reportEmail(title, description, user);

    const result = await sendReportEmail(
      user.email,
      `New ${title} Report from ${user.username}`,
      emailHtml
    );

    if (!result.success) {
      return res.status(500).json({ error: "Failed to send report email" });
    }

    return res.status(200).json({ message: "Report email sent successfully" });
  } catch (error) {
    console.error("Error sending report email:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
