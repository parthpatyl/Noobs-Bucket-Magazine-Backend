// clean-mongodb.js
const mongoose = require("mongoose");
const User = require("./models/User"); // Adjust path as needed

// Replace with your MongoDB connection string and database name
const MONGO_URI = "mongodb+srv://prth:prthdbms@bucket.fruga.mongodb.net/";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => {
  console.error("Connection error:", err);
  process.exit(1);
});

// Helper function to check if a value is a valid ObjectId string
const isValidObjectId = (value) => {
  // Mongoose's isValid will return true only for valid 24-character hex strings or ObjectId instances
  return mongoose.Types.ObjectId.isValid(value);
};

async function cleanUserArticles() {
  try {
    const users = await User.find({});
    for (let user of users) {
      let updated = false;
      
      // Clean savedArticles array
      if (Array.isArray(user.savedArticles)) {
        const validSaved = user.savedArticles.filter(articleId => {
          // articleId might be an object or string. We try to cast it to string.
          const idStr = typeof articleId === "object" && articleId._id ? articleId._id.toString() : articleId.toString();
          return isValidObjectId(idStr);
        });
        if (validSaved.length !== user.savedArticles.length) {
          user.savedArticles = validSaved;
          updated = true;
          console.log(`Cleaned savedArticles for user ${user._id}`);
        }
      }
      
      // Clean likedArticles array
      if (Array.isArray(user.likedArticles)) {
        const validLiked = user.likedArticles.filter(articleId => {
          const idStr = typeof articleId === "object" && articleId._id ? articleId._id.toString() : articleId.toString();
          return isValidObjectId(idStr);
        });
        if (validLiked.length !== user.likedArticles.length) {
          user.likedArticles = validLiked;
          updated = true;
          console.log(`Cleaned likedArticles for user ${user._id}`);
        }
      }
      
      if (updated) {
        await user.save();
      }
    }
    console.log("Finished cleaning user documents.");
  } catch (err) {
    console.error("Error cleaning user documents:", err);
  } finally {
    mongoose.disconnect();
  }
}

cleanUserArticles();
