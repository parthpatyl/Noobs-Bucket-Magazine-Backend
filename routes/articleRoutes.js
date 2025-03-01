const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");

// Fetch all articles from the 'post' collection
router.get("/get", async (req, res) => {
    try {
        console.log("Fetching data from MongoDB...");
        
        const db = mongoose.connection.db;
        const Post = db.collection("post"); // Ensure it fetches from 'post' collection
        const articles = await Post.find().toArray();

        if (!articles.length) {
            return res.status(404).json({ message: "No articles found" });
        }

        res.json(articles);
    } catch (err) {
        console.error("❌ Error fetching articles:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/get/:id", async (req, res) => {
    try {
        console.log("🟢 Fetching article with ID:", req.params.id);

        const db = mongoose.connection.db;
        const Post = db.collection("post");

        // Convert ID to ObjectId (MongoDB stores _id as ObjectId, not string)
        const objectId = new mongoose.Types.ObjectId(req.params.id);


        const article = await Post.findOne({ _id: req.params.id });

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        res.status(200).json({ message: "Article found successfully", article: article });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/like/:articleId", async (req, res) => {
    try {
        const { userId } = req.body;
        const { articleId } = req.params;

        console.log("🟢 Backend received userId:", userId, "and articleId:", articleId); // Debug log

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(articleId)) {
            console.error("❌ Invalid userId or articleId:", userId, articleId);
            return res.status(400).json({ success: false, message: "Invalid user or article ID" });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.error("❌ User not found for ID:", userId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Toggle like
        if (user.likedArticles.includes(articleId)) {
            user.likedArticles = user.likedArticles.filter(id => id.toString() !== articleId);
        } else {
            user.likedArticles.push(articleId);
        }

        await user.save();

        console.log("✅ Updated liked articles for user:", user.likedArticles);
        res.json({ success: true, likedArticles: user.likedArticles });
    } catch (error) {
        console.error("❌ Error toggling like:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.post("/save/:articleId", async (req, res) => {
    try {
        const { userId } = req.body;
        const { articleId } = req.params;

        console.log("🟢 Received userId:", userId, "and articleId:", articleId);

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(articleId)) {
            console.error("❌ Invalid userId or articleId:", userId, articleId);
            return res.status(400).json({ success: false, message: "Invalid user or article ID" });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.error("❌ User not found for ID:", userId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Toggle save: if already saved, remove it; otherwise, add it
        if (user.savedArticles.includes(articleId)) {
            user.savedArticles = user.savedArticles.filter(id => id.toString() !== articleId);
        } else {
            user.savedArticles.push(articleId);
        }

        await user.save();

        console.log("✅ Updated saved articles for user:", user.savedArticles);
        res.json({ success: true, savedArticles: user.savedArticles });
    } catch (error) {
        console.error("❌ Error toggling saved article:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
