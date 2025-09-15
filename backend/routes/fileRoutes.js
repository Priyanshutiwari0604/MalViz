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

router.post("/upload", upload.single("file"), uploadFile);
router.get("/files", getFiles);
router.get("/files/:id/download", downloadFile);
router.delete("/files/:id", deleteFile);
router.post("/files/:id/analyze", analyzeFile);

export default router;