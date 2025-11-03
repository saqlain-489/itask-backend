const express = require('express');
const app = express();
const port = 3000;
const routes = require('./routes'); 
const mongoose = require('mongoose');
const cors = require('cors')

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGO_URI = 'mongodb+srv://itask:itask@cluster0.iy2fjk8.mongodb.net/?appName=Cluster0';

// Add MongoDB connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

// Improved connection handling
mongoose.connect(MONGO_URI, mongooseOptions)
  .then(() => {
    console.log('MongoDB connected successfully');
    // Only start server after DB connection is established
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit with failure
  });

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

app.use(routes);
