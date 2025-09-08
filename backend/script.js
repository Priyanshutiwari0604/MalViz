import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/database.js";
import fileRoutes from "./routes/fileRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB().catch(err => {
  console.error("❌ Database connection failed:", err);
  process.exit(1);
});

app.use(express.json());
app.use("/api", fileRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));