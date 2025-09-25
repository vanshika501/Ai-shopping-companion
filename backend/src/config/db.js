import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set");
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
};

export default connectDB;
