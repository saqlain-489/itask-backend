const path = require('path');
const dotenv = require('dotenv');

// try several common .env locations: project root, src folder, current working dir
const tryPaths = [
  path.resolve(__dirname, '../.env'),     // Backend/express/.env
  path.resolve(__dirname, '.env'),        // Backend/express/src/.env
  path.resolve(process.cwd(), '.env')     // working directory .env
];

let loaded = false;
for (const p of tryPaths) {
  const res = dotenv.config({ path: p });
  if (!res.error) {
    console.log('.env loaded from', p);
    console.log('Parsed env keys:', Object.keys(res.parsed || {}));
    loaded = true;
    break;
  } else {
    console.warn(`.env not loaded from ${p}: ${res.error.message}`);
  }
}
if (!loaded) {
  // final fallback: let dotenv try default lookup (may pick up process.env already set)
  const res = dotenv.config();
  if (!res.error) {
    console.log('.env loaded by default');
    console.log('Parsed env keys:', Object.keys(res.parsed || {}));
    loaded = true;
  } else {
    console.warn('No .env file found in tried locations. Current working directory:', process.cwd());
  }
}

const express = require('express');
const app = express();
const port = 4000;
const routes = require('./routes');
const mongoose = require('mongoose');
const cors = require('cors')

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGO_URI = 'mongodb+srv://itask:itask@cluster0.iy2fjk8.mongodb.net/?appName=Cluster0';

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose.connect(MONGO_URI, mongooseOptions)
  .then(() => {
    console.log('MongoDB connected successfully');

    // improved SMTP_USER debug message
    if (process.env.SMTP_USER) {
      console.log("SMTP_USER:", process.env.SMTP_USER);
    } else {
      console.warn("SMTP_USER is undefined. Check your .env file or environment variables. Expected key: SMTP_USER");
    }

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

app.use(routes); 
