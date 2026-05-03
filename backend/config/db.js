const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI); // ← yeh add karo
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message); // ← exact error
    process.exit(1);
  }
};

module.exports = connectDB;