import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/carpooling";
    const conn = await mongoose.connect(mongoUri, {
      family: 4, // Force IPv4
      serverSelectionTimeoutMS: 5000
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`⚠️ MongoDB Connection Error: ${err.message}`);
    console.error(`Please verify that MongoDB is running and MONGO_URI in backend/.env is reachable.`);
  }
};

export default connectDB;
