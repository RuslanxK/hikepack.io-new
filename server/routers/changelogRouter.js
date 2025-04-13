const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { getChangelogs, createChangelog, deleteChangelog } = require("../BL/changelogBL");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const changelogs = await getChangelogs();
    res.status(200).json(changelogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching changelogs", error: error.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const savedChangeLog = await createChangelog(req.body);
    res.status(201).json({
      message: "Changelog added successfully",
      changelog: savedChangeLog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding changelog", error: error.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await deleteChangelog(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting changelog", error: error.message });
  }
});

module.exports = router;
