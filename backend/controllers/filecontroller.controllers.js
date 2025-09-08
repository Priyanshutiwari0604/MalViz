import File from "../models/filemodel.model.js";
import { generateSHA256 } from "../utils/hash.js";
import * as fsPromises from "fs/promises"; // async file ops
import fs from "fs"; // streaming
import path from "path";

// Upload a file
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const hash = await generateSHA256(req.file.path);

    // TODO: replace with real user ID from auth middleware
    const userId = req.user?.id || "64f8a9c1234567890abcdef0"; 

    // Check if file with same hash already exists
    let existingFile = await File.findOne({ hash });

    if (existingFile) {
      // Add this user if not already linked
      if (!existingFile.uploadedBy.includes(userId)) {
        existingFile.uploadedBy.push(userId);
        await existingFile.save();
      }

      // Delete duplicate from disk since we already have it
      await fsPromises.unlink(req.file.path);

      return res.status(200).json({
        message: "ℹ️ File already exists, linked to user",
        file: existingFile
      });
    }

    // Otherwise create new file entry
    const newFile = new File({
      originalName: req.file.originalname,
      safeName: req.file.filename,
      size: req.file.size,
      hash,
      mimetype: req.file.mimetype,
      uploadedBy: [userId]
    });

    await newFile.save();

    res.status(201).json({
      message: "✅ File uploaded successfully",
      file: newFile
    });

  } catch (error) {
    if (req.file) {
      try {
        await fsPromises.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Failed to clean up file:", unlinkError);
      }
    }
    console.error("Upload failed:", error);
    res.status(500).json({ error: error.message });
  }
};


// Get all files
export const getFiles = async (req, res) => {
  try {
    const userId = req.user?.id ; // replace with real user ID from Clerk later
    const files = await File.find({ uploadedBy: userId }).sort({ uploadedAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Download a file
export const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the file in the database
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const filePath = path.join(process.cwd(), "storage", file.safeName);

    try {
      await fsPromises.access(filePath); // check if file exists
    } catch (error) {
      return res.status(404).json({ error: "File not found on server" });
    }

    // Set appropriate headers for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.originalName}"`
    );
    res.setHeader("Content-Type", file.mimetype);
    res.setHeader("Content-Length", file.size);

    // Stream the file to the client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Download failed:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a file
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || "64f8a9c1234567890abcdef0";

    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // If multiple users are linked
    if (file.uploadedBy.length > 1) {
      file.uploadedBy = file.uploadedBy.filter(uid => uid.toString() !== userId);
      await file.save();
      return res.json({ message: "✅ File unlinked for this user", file });
    }

    // If only this user owns it → delete from disk + DB
    const filePath = path.join(process.cwd(), "storage", file.safeName);
    try {
      await fsPromises.unlink(filePath);
    } catch (error) {
      console.warn("File missing on disk, proceeding with DB deletion:", error);
    }

    await File.findByIdAndDelete(id);

    res.json({ message: "✅ File deleted successfully", deletedFile: file });

  } catch (error) {
    console.error("Delete failed:", error);
    res.status(500).json({ error: error.message });
  }
};
