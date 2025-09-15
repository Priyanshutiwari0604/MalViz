import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { connectDB } from "./db/database.js";
import fileRoutes from "./routes/fileRoutes.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import mongoose from "mongoose";
import intelRoutes from "./routes/intelRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

let dbConnected = false;
(async () => {
  try {
    await connectDB();
    dbConnected = true;
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    if (process.env.NODE_ENV === "production") process.exit(1);
  }
})();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    dbConnected,
    message: "File Analyzer API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api", fileRoutes);
app.use("/api", analyzeRoutes);
app.use("/api/intel", intelRoutes);

const clientBuildPath = path.join(__dirname, "../client/dist");
const hasClientBuild = fs.existsSync(clientBuildPath);

if (hasClientBuild) {
  console.log("Serving React build from:", clientBuildPath);
  app.use(express.static(clientBuildPath));
} else {
  console.log("Client build directory not found. Running in API-only mode.");
}

function validateEnv() {
  const required = ['VIRUSTOTAL_API_KEY', 'OTX_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
    console.warn('Threat intelligence features will be limited');
  }
}

console.log('VIRUSTOTAL_API_KEY:', process.env.VIRUSTOTAL_API_KEY ? 'Found' : 'Missing');
console.log('OTX_API_KEY:', process.env.OTX_API_KEY ? 'Found' : 'Missing');
console.log('ABUSECH_KEY:', process.env.ABUSECH_KEY ? 'Found' : 'Missing');

app.get("/", (req, res) => {
  if (hasClientBuild) {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  } else {
    res.json({
      message: "File Analyzer API is running in development mode",
      endpoints: { 
        health: "/api/health", 
        files: "/api/files", 
        analyze: "/api/analyze",
        intel: "/api/intel"
      },
    });
  }
});

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error.stack || error.message);

  const isDev = process.env.NODE_ENV !== "production";
  res.status(error.status || 500).json({
    error: isDev ? error.message : "Internal server error",
    ...(isDev && { stack: error.stack }),
  });
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({
      error: "API endpoint not found",
      path: req.originalUrl,
      availableEndpoints: [
        "/api/health", 
        "/api/files", 
        "/api/analyze", 
        "/api/intel"
      ],
    });
  } else if (hasClientBuild) {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  } else {
    res.status(404).json({ 
      error: "Page not found", 
      message: "This server is running in API-only mode" 
    });
  }
});

const shutdown = async () => {
  console.log("Gracefully shutting down...");
  try {
    if (dbConnected) await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  validateEnv();
});