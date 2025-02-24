const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

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
            console.log("❌ Article not found in DB.");
            return res.status(404).json({ message: "Article not found" });
        }

        console.log("✅ Article found:", article);
        res.status(200).json({ message: "Article found successfully", article: article });

    } catch (err) {
        console.error("❌ Error fetching article:", err);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
