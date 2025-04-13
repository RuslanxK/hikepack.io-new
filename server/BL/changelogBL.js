const ChangeLog = require("../models/changelog");

exports.getChangelogs = async () => {
  return await ChangeLog.find().sort({ createdAt: -1 });
};

exports.createChangelog = async (changelogData) => {
  const { title, description } = changelogData;

  if (!title || !description) {
    throw new Error("Title and description are required");
  }

  const newChangeLog = new ChangeLog({ title, description });
  return await newChangeLog.save();
};

exports.deleteChangelog = async (id, user) => {
  if (!user || !user.isAdmin) {
    throw new Error("Access denied. Admins only.");
  }

  const deletedChangeLog = await ChangeLog.findByIdAndDelete(id);

  if (!deletedChangeLog) {
    throw new Error("Changelog not found");
  }

  return { message: "Changelog deleted successfully", changelog: deletedChangeLog };
};
