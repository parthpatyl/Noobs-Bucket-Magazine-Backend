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
              _id: user._id,
              email: user.email,
              name: user.name,
              memberSince: user.memberSince,
              savedArticles: user.savedArticles,
              likedArticles: user.likedArticles
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
      .populate("savedArticles")
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

// Update user profile including profile image
router.put("/user/:id", async (req, res) => {
  try {
    console.log("📝 Updating user profile:", req.params.id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const { name, email, bio, profileImage } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (bio) updateData.bio = bio;
    
    // Handle profile image - allow data URLs (base64) for frontend uploads
    if (profileImage) {
      // Validate that it's a reasonable size for a profile image
      if (typeof profileImage === 'string') {
        // If it's a data URL, check the size
        if (profileImage.startsWith('data:image')) {
          // Extract the base64 part and calculate size
          const base64Data = profileImage.split(',')[1];
          if (base64Data) {
            const imageSize = Buffer.byteLength(base64Data, 'base64');
            const maxSize = 5 * 1024 * 1024; // 5MB limit
            
            if (imageSize > maxSize) {
              return res.status(400).json({
                success: false,
                message: `Profile image is too large. Maximum size is 5MB, received ${Math.round(imageSize / 1024 / 1024)}MB`
              });
            }
          }
        }
        updateData.profileImage = profileImage;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ User profile updated successfully");
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Change user password
router.post("/change-password/:id", async (req, res) => {
  try {
    console.log("🔒 Changing password for user:", req.params.id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters with at least one letter and one number"
      });
    }

    // Find the user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    console.log("✅ Password changed successfully for user:", user.email);
    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("❌ Error changing password:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
