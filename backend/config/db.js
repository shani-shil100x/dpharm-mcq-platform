const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  if (!process.env.MONGO_URI) {
    console.error('CRITICAL ERROR: MONGO_URI environment variable is not defined.');
    return; // Don't crash, let the API routes return errors gracefully
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${db.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // DO NOT process.exit(1) in a serverless environment as it crashes the invocation
  }
};

module.exports = connectDB;
