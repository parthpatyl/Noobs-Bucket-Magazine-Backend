require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("✅ MongoDB Connected Successfully",  mongoose.connection.name);

    const db = mongoose.connection.db;
    const Post = db.collection("post"); // Ensure it targets 'articles' DB
    const posts = await Post.find().toArray();
    console.log("📝 Posts Collection Data:", posts);

    mongoose.connection.close();
  })
  .catch(err => console.error("❌ MongoDB Query Failed:", err));
