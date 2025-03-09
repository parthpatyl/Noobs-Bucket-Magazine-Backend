const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  savedArticles: [{ 
    type: mongoose.Schema.Types.String, 
    ref: "Post" }],  // ✅ Correct ref
  likedArticles: [{ 
    type: mongoose.Schema.Types.String,
    ref: "Post" }],  // ✅ Correct ref
  memberSince: { 
    type: Date, 
    default: Date.now }
});

module.exports = mongoose.model("User", userSchema, "users"); // ✅ Explicitly reference "users"
