import mongoose from "mongoose";
import serverConfig from "./serverConfig.js";

const connectDB = async () => {
  try {
    await mongoose.connect(serverConfig.DB_URL);
    console.log("✅ Successfully connected to MongoDB Server!");
  } catch (error) {
    console.log("❌ Couldn't Connect to MongoDB Server!");
    console.error(error);
  }
};

export default connectDB;
