const express = require('express');
const router = express.Router();
const fs = require('fs');
const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');


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
              memberSince: user.memberSince,
              savedArticles: user.savedArticles, // Include saved articles
              likedArticles: user.likedArticles  // Include liked articles
          }
      });

  } catch (error) {
      console.error("❌ Internal Server Error:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


router.get("/user/:id", async (req, res) => {
  try {
    console.log("🔍 Fetching user with populated articles...");

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(req.params.id)
      .populate("savedArticles")  // ✅ Automatically fetches full article data
      .populate("likedArticles");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;