const express = require('express');
const router = express.Router();
const fs = require('fs');
const User = require('../models/User');
const bcrypt = require('bcrypt');



router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    return res.status(201).json({ success: true, message: "User Created Successfully" });
  } catch (error) {
    console.error("Internal Server Error", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
      const { email, password } = req.body;

      // Debugging log
      console.log("🟢 Login request received for:", email);

      if (!email || !password) {
          console.error("❌ Missing email or password");
          return res.status(400).json({ success: false, message: "Email and password are required" });
      }

      const user = await User.findOne({ email });

      if (!user) {
          console.warn("⚠️ User not found:", email);
          return res.status(404).json({ success: false, message: "User does not exist" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
          console.warn("⚠️ Incorrect password for:", email);
          return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      console.log("✅ User logged in successfully:", user.email);

      return res.status(200).json({
          success: true,
          message: "User Logged in Successfully",
          user: {
              id: user._id,
              email: user.email,
              name: user.name,
              memberSince: user.memberSince, // Ensure this field exists in the schema
          }
      });

  } catch (error) {
      console.error("❌ Internal Server Error:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.put('/user/:id', (req, res) => {
  const { userId } = req.params;
  const updates = req.body;
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

const updatedUser = {
  ...users[userIndex],
  ...updates,
  savedArticles: updates.savedArticles || users[userIndex].savedArticles,
  likedArticles: updates.likedArticles || users[userIndex].likedArticles
};

users[userIndex] = updatedUser;
fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
res.json({ success: true, users: updatedUser });
});

module.exports = router;