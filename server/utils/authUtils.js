const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const generateRandomPassword = async () => {
  const randomString = Math.random().toString(36).slice(-8);
  return await bcrypt.hash(randomString, 10);
};


const generateJwtToken = (user) => {
  return jwt.sign({ ...user.toObject()});
};



const findOrCreateUser = async (profile) => {
  let user = await User.findOne({ email: profile.email.toLowerCase() });

  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",") : [];

  if (!user) {
    const hashedPassword = await generateRandomPassword();
    
    user = new User({
      email: profile.email,
      username: profile.name,
      googleId: profile.sub,
      password: hashedPassword,
      imageUrl: profile.picture,
      isAdmin: adminEmails.includes(profile.email),
      lastLoggedIn: new Date(),
      verified: true,
    });
    await user.save();
  } else {
    user.lastLoggedIn = new Date();
    
    if (!user.verified) {
      user.verified = true;
    }

    if (adminEmails.includes(profile.email) && !user.isAdmin) {
      user.isAdmin = true;
    }

    await user.save();
  }
  return user;
};

module.exports = {
  generateJwtToken,
  findOrCreateUser,
};
