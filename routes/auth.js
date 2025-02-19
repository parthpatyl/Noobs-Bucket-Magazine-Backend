const express = require('express');
const router = express.Router();
const fs = require('fs'); 
const User = require('../models/User');
const bcrypt = require('bcrypt');



router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name, email, password);

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

router.post('/login', async(req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ success: false, message: "User Does not Exists" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }else{
      return res.status(201).json({ success: true, message: "User Logged in Successfully", data:user });
    }
    
  } catch (error) {
    console.error("Internal Server Error", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }

});

router.put('/user/:userId', (req, res) => {
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
  res.json({ success: true, user: updatedUser });
});

module.exports = router;