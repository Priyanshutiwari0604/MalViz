import express from "express";
import { uploadFile, getFiles,downloadFile,deleteFile } from "../controllers/filecontroller.controllers.js";
import { upload } from "../middleware/fileupload.middleware.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadFile);
router.get("/files", getFiles);
router.get("/download/:id", downloadFile);
router.delete("/files/:id", deleteFile);
export default router;
