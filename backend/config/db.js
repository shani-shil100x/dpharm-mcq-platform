const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI environment variable is not set. Please add it in your Vercel project settings under Settings > Environment Variables.'
    );
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${db.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Throw so the request handler returns a proper error response
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

module.exports = connectDB;
