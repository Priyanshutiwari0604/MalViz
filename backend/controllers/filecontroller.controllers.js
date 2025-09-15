import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import File from "../models/filemodel.model.js";
import { runYara } from "../analysis/static/yaraScan.js";
import { parsePE } from "../analysis/static/peParser.js";
import { calculateEntropy } from "../analysis/static/entropy.js";
import { extractStrings } from "../analysis/static/strings.js";

async function performStaticAnalysis(filePath, originalName) {
  try {
    const buffer = await fs.readFile(filePath);
    const entropy = calculateEntropy(buffer);

    const { strings, iocs } = extractStrings(filePath);
    const yaraMatches = runYara(filePath, "./rules/") || [];

    let peMetadata = null;
    const ext = path.extname(originalName).toLowerCase();
    if ([".exe", ".dll", ".sys"].includes(ext)) {
      try {
        peMetadata = parsePE(filePath);
      } catch (err) {
        peMetadata = { error: err.message };
      }
    }

    return {
      entropy: parseFloat(entropy.toFixed(2)),
      strings: strings.slice(0, 500),
      iocs,
      yaraMatches,
      peMetadata,
      analysisDate: new Date(),
      errors: []
    };
  } catch (error) {
    return {
      entropy: null,
      strings: [],
      iocs: [],
      yaraMatches: [],
      peMetadata: null,
      analysisDate: new Date(),
      errors: [error.message]
    };
  }
}

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const fileBuffer = await fs.readFile(filePath);
    const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    // In filecontroller.controllers.js, update the uploadFile function:
    const userId = req.user?._id || req.user?.id || "default-user-id";

    let existingFile = await File.findOne({ hash: fileHash, uploadedBy: userId });

    if (existingFile) {
      await fs.unlink(filePath);
      return res.json({ message: "File already uploaded", file: existingFile });
    }

    const staticAnalysis = await performStaticAnalysis(filePath, req.file.originalname);

    const newFile = new File({
      originalName: req.file.originalname,
      safeName: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      hash: fileHash,
      uploadedBy: userId,
      staticAnalysis
    });

    await newFile.save();

    console.log(`File uploaded: ${req.file.originalname} by ${userId}`);
    console.log(`Analysis summary: entropy=${staticAnalysis.entropy}, yara=${staticAnalysis.yaraMatches.length}`);

    res.status(201).json(newFile);
  } catch (error) {
    console.error("Upload error:", error.message);

    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: error.message });
  }
};

export const getFiles = async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    const filePath = path.join(process.cwd(), "storage", file.safeName);
    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    const filePath = path.join(process.cwd(), "storage", file.safeName);
    await fs.unlink(filePath).catch(() => {});

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};