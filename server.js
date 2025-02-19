const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const auth = require('./routes/auth');
const ArticleRoutes = require('./routes/articleRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));


app.use('/auth', auth);
app.use('/api/articles',ArticleRoutes );

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});