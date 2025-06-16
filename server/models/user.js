const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  birthdate: { type: String, default: "1990-01-01T00:00:00.000Z" },
  password: { type: String, required: true },
  weightOption: { type: String, default: "lb" },
  imageUrl: { type: String },
  verified: { type: Boolean, default: false },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: String, default: null },
  hasCompletedProfile: {type: Boolean},
  distance: { type: String, default: "miles" },
  emailVerificationToken: { type: String, default: null },
  emailVerificationExpires: { type: String, default: null },
  googleId: String,
  gender: { type: String, default: "other" },
  activityLevel: { type: String, default: "beginner" },
  country: { type: String, default: "United States" },
  isAdmin: { type: Boolean, default: false },
  coins: {type: Number, default: 2 },
  lastLoggedIn: { type: Date, default: null },
  isActive: { type: Boolean, default: true },

}, { timestamps: true });


userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
