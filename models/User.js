const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  // Store references as ObjectId so that population works correctly.
  savedArticles: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Post" 
  }],
  likedArticles: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post" 
  }],
  memberSince: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("User", userSchema, "users");
