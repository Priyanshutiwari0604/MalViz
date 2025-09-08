// import express from "express";
// import dotenv from "dotenv";
// import { connectDB } from "./db/database.js";
// import fileRoutes from "./routes/fileRoutes.js";
// import analyzeRoutes from "./routes/analyzeRoutes.js";
// import { calculateEntropy } from "./analysis/static/entropy.js";
// import { parsePE } from "./analysis/static/peParser.js";
// import { extractStrings } from "./analysis/static/strings.js";
// import { runYara } from "./analysis/static/yaraScan.js";
// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 5000;

// // ✅ Database connection
// (async () => {
//   try {
//     await connectDB();
//     console.log("✅ Database connected successfully");
//   } catch (err) {
//     console.error("❌ Database connection failed:", err.message);
//     process.exit(1);
//   }
// })();

// // ✅ Middleware
// app.use(express.json());

// // ✅ Routes
// app.use("/api", fileRoutes);     // clearer endpoint grouping
// app.use("/api", analyzeRoutes);

// // ✅ Root health check
// app.get("/", (req, res) => {
//   res.send("🚀 File Analyzer API is running...");
// });

// // ✅ Error handling middleware
// app.use((error, req, res, next) => {
//   console.error("Unhandled error:", error.stack || error.message);
//   res.status(error.status || 500).json({ error: error.message || "Internal server error" });
// });

// // ✅ Start server
// app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// import express from "express";
// import dotenv from "dotenv";
// import { connectDB } from "./db/database.js";
// import fileRoutes from "./routes/fileRoutes.js";
// import analyzeRoutes from "./routes/analyzeRoutes.js";

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 5000;

// // ✅ Database connection
// (async () => {
//   try {
//     await connectDB();
//     console.log("✅ Database connected successfully");
//   } catch (err) {
//     console.error("❌ Database connection failed:", err.message);
//     process.exit(1);
//   }
// })();

// // ✅ Middleware
// app.use(express.json());

// // ✅ Routes
// app.use("/api", fileRoutes);
// app.use("/api", analyzeRoutes);

// // ✅ Root health check
// app.get("/", (req, res) => {
//   res.send("🚀 File Analyzer API is running...");
// });

// // ✅ Error handling middleware
// app.use((error, req, res, next) => {
//   console.error("Unhandled error:", error.stack || error.message);
//   res.status(error.status || 500).json({ error: error.message || "Internal server error" });
// });

// // ✅ Start server
// app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
// Fixed script.js - Removed duplicate imports and added fsSync
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/database.js";
import fileRoutes from "./routes/fileRoutes.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs"; // Added for static file serving
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Track DB state
let dbConnected = false;

// ✅ Database connection
(async () => {
  try {
    await connectDB();
    dbConnected = true;
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    if (process.env.NODE_ENV === "production") process.exit(1);
  }
})();

// ✅ Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// ✅ CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    dbConnected,
    message: "🚀 File Analyzer API is running...",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ✅ API Routes
app.use("/api", fileRoutes);
app.use("/api", analyzeRoutes);

// ✅ Static serving
const clientBuildPath = path.join(__dirname, "../client/dist");
const hasClientBuild = fs.existsSync(clientBuildPath);

if (hasClientBuild) {
  console.log("✅ Serving React build from:", clientBuildPath);
  app.use(express.static(clientBuildPath));
} else {
  console.log("⚠️  Client build directory not found. Running in API-only mode.");
}

// ✅ Root
app.get("/", (req, res) => {
  if (hasClientBuild) {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  } else {
    res.json({
      message: "🚀 File Analyzer API is running in development mode",
      endpoints: { health: "/api/health", files: "/api/files", analyze: "/api/analyze" },
    });
  }
});

// ✅ Error handling
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error.stack || error.message);

  const isDev = process.env.NODE_ENV !== "production";
  res.status(error.status || 500).json({
    error: isDev ? error.message : "Internal server error",
    ...(isDev && { stack: error.stack }),
  });
});

// ✅ 404 handler
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({
      error: "API endpoint not found",
      path: req.originalUrl,
      availableEndpoints: ["/api/health", "/api/files", "/api/analyze"],
    });
  } else if (hasClientBuild) {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  } else {
    res.status(404).json({ error: "Page not found", message: "This server is running in API-only mode" });
  }
});

// ✅ Graceful shutdown
const shutdown = async () => {
  console.log("\n🔄 Gracefully shutting down...");
  try {
    if (dbConnected) await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Error closing DB connection:", err);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// ✅ Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Please use a different port.`);
    process.exit(1);
  } else {
    console.error("❌ Server error:", err);
  }
});

export default app;