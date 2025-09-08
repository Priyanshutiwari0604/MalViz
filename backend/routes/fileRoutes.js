// import express from "express";
// import {
//   uploadFile,
//   getFiles,
//   downloadFile,
//   deleteFile,
// } from "../controllers/filecontroller.controllers.js";
// import { upload } from "../middleware/fileupload.middleware.js";


// const router = express.Router();

// // ✅ Upload a file
// router.post("/upload", upload.single("file"), uploadFile);

// // ✅ Get all uploaded files
// router.get("/files", getFiles);

// // ✅ Download a file by ID
// router.get("/download/:id", downloadFile);

// // ✅ Delete a file by ID
// router.delete("/files/:id", deleteFile);

// export default router;

// routes/fileRoutes.js (Updated)
import express from "express";
import {
  uploadFile,
  getFiles,
  downloadFile,
  deleteFile,
} from "../controllers/filecontroller.controllers.js";
import { upload } from "../middleware/fileupload.middleware.js";
import { analyzeFile } from "../controllers/analyzeController.js";
const router = express.Router();

// File upload endpoint
router.post("/upload", upload.single("file"), uploadFile);

// Get all files for current user
router.get("/files", getFiles);

// Download a specific file
router.get("/files/:id/download", downloadFile);

// Delete a specific file
router.delete("/files/:id", deleteFile);

// Re-analyze an existing file
router.post("/files/:id/analyze", analyzeFile);

export default router;