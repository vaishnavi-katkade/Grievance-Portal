const mongoose = require('mongoose');

// Cache the database connection for serverless environments (Vercel)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If already connected, return existing connection
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI).then((mongoose) => {
      console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
      console.log(`📊 Database: ${mongoose.connection.name}`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
