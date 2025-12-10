const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const auth = require('./routes/auth');
const articleRoutes = require('./routes/articleRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log("✅ MongoDB Connected Successfully to DB:", mongoose.connection.name);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📁 Collections in DB:", collections.map(c => c.name));
    console.log(mongoose.modelNames()); // Should include 'Article'

}).catch(err => console.log("❌ MongoDB connection error:", err));

// Routes
app.use('/auth', auth);
app.use('/api/articles', articleRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
