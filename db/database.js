import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"; // Add .js extension

// Async function to connect to MongoDB
export const connectDB = async () => {
  try {
    // Attempt to connect to the database using Mongoose
    const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);

    // Log success and connection details
    console.log(`\nMongoDB is connected! Host: ${connectionInstance.connection.host}`);

  } catch (error) {
    // Catch and log errors
    console.log("MongoDB Error:", error);
    
    // Exit the process if the connection fails
    process.exit(1);
  }
};

