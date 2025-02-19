const express = require("express");
const Article = require("../models/Article");
const User = require("../models/User");
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const upload = require("../config/multer.config");

router.get("/", async (req, res) => {
    try {
        const articles = await Article.find();
        if (articles.length > 0) {
            return res.status(200).json(articles);
        } else {
            return res.status(200).json({ message: "No articles found" });
        }
    } catch (err) {
        console.error("Interval error: " + err);
        res.status(500).json({ error: err.message });
    }
});

router.post("/add", upload.array('image', 10), async (req, res) => {
    const { title, category, excerpt, readtime, date, author, tags, content } = req.body;
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        const folder = `articles/${Date.now()}`;
        const uploadedFiles = await Promise.all(req.files.map(async (file) => {
            const cloudinaryResponse = await cloudinary.uploader.upload(file.path, {
                folder: folder,
                resource_type: 'auto',
            });
            return cloudinaryResponse.secure_url; 
        }));

        const newArticle = new Article({
            title,
            category,
            image: uploadedFiles, 
            excerpt,
            readtime,
            date,
            author,
            tags,
            content
        });

        const result = await newArticle.save();
        res.status(201).json({ message: "Article saved successfully", result });

    } catch (error) {
        console.error("Internal error: ", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});

router.get("/get/:id", async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        res.status(200).json({ message: "Article found successfully", article: article });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post("/save-article", async (req, res) => {
    try {
        const { id, articleId } = req.body;

        if (!id || !articleId) {
            return res.status(400).json({ success: false, message: "id and Article ID are required" });
        }

        const user = await User.findOne({ _id:id });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ success: false, message: "Article not found" });
        }

        if (user.saveArticles.includes(articleId)) {
            return res.status(400).json({ success: false, message: "Article already saved" });
        }

        user.saveArticles.push(articleId);
        await user.save();

        res.status(200).json({ success: true, message: "Article saved successfully" });
    } catch (error) {
        console.error("Error saving article:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.post("/remove-saved-article", async (req, res) => {
    try {
        const { id, articleId } = req.body;
        if (!id || !articleId) {
            return res.status(400).json({ success: false, message: "Email and articleId are required" });
        }
        const user = await User.findOne({ _id:id });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.saveArticles = user.saveArticles.filter(id => id.toString() !== articleId);
        await user.save();

        res.status(200).json({ success: true, message: "Article removed from saved articles" });
    } catch (error) {
        console.error("Error removing saved article:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.post("/list-save-article", async (req, res) => {
    try {
        const { id } = req.body;

        if(!id) {
            return res.status(400).json({ success: false, message: "id is required" });
        }
        
        const user = await User.findOne({ _id: id }).populate("saveArticles");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.status(200).json({ success: true, message: "User found successfully", data :user.saveArticles });

        
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        
    }
});

router.post("/like-article", async (req, res) => {
    try {
        const { id, articleId } = req.body;

        if (!id || !articleId) {
            return res.status(400).json({ success: false, message: "id and Article ID are required" });
        }

        const user = await User.findOne({ _id:id });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ success: false, message: "Article not found" });
        }

        if (user.likedArticles.includes(articleId)) {
            return res.status(400).json({ success: false, message: "Article already saved" });
        }

        user.likedArticles.push(articleId);
        await user.save();

        res.status(200).json({ success: true, message: "Article saved successfully" });
    } catch (error) {
        console.error("Error saving article:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.post("/remove-liked-article", async (req, res) => {
    try {
        const { id, articleId } = req.body;

        if (!id || !articleId) {
            return res.status(400).json({ success: false, message: "Email and articleId are required" });
        }
        const user = await User.findOne({ _id:id });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.likedArticles = user.likedArticles.filter(id => id.toString() !== articleId);
        await user.save();

        res.status(200).json({ success: true, message: "Article removed from liked articles" });
    } catch (error) {
        console.error("Error removing liked article:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.post("/list-save-article", async (req, res) => {
    try {
        const { id } = req.body;

        if(!id) {
            return res.status(400).json({ success: false, message: "id is required" });
        }
        
        const user = await User.findOne({ _id: id }).populate("likedArticles");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.status(200).json({ success: true, message: "User found successfully", data :user.likedArticles });

        
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        
    }
});

module.exports = router;    