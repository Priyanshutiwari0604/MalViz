// db/database.js
import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.warn("⚠️ No MONGODB_URI provided. Running in sample data mode.");
    return null;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);

    // Attempt to list collections (optional check)
    try {
      const collections = await conn.connection.db.listCollections().toArray();
      if (collections.length > 0) {
        console.log(`📊 Available collections: ${collections.map(c => c.name).join(", ")}`);
      } else {
        console.log("ℹ️ No collections found yet (new database).");
      }
    } catch (dbError) {
      console.log("ℹ️ Could not list collections (normal for fresh DB).");
    }

    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("💡 Running in sample data mode - no database connection.");
    return null;
  }
}
