const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    image: [
        {
            type: String,
            required: true,
        }],
    excerpt: {
        type: String,
        required: true,
    },
    readtime: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    tags:
    {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("Article", ArticleSchema);