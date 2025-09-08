// import express from "express";
// import { analyzeFile } from "../controllers/analyzeController.js";

// const router = express.Router();

// // ✅ Analyze a file by ID
// // POST /api/analyze/:id
// router.post("/:id", analyzeFile);

// export default router;

// import express from "express";
// import multer from "multer";
// import fs from "fs";
// import { extractStrings } from "../analysis/static/strings.js";
// import { runYara } from "../analysis/static/yaraScan.js";
// import { calculateEntropy } from "../analysis/static/entropy.js";
// import { parsePE } from "../analysis/static/peParser.js";

// const router = express.Router();
// const upload = multer({ dest: "uploads/" });

// router.post("/analyze", upload.single("file"), (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//   const filePath = req.file.path;
//   const buffer = fs.readFileSync(filePath);

//   // ✅ Extract strings and IOCs
//   const { strings, iocs } = extractStrings(filePath);

//   // ✅ Run YARA scan
//   const yaraMatches = runYara(filePath);

//   // ✅ Calculate entropy
//   const entropy = calculateEntropy(buffer);

//   // ✅ Parse PE metadata (optional)
//   let peMetadata = {};
//   try {
//     peMetadata = parsePE(filePath);
//   } catch (err) {
//     console.warn("PE parsing failed:", err.message);
//   }

//   // ✅ Build structured response
//   const staticAnalysis = {
//     entropy: Number(entropy.toFixed(2)),
//     strings,
//     iocs,
//     yaraMatches,
//     peMetadata,
//   };

//   res.json({
//     file: req.file.originalname,
//     staticAnalysis,
//   });

//   // ✅ Clean up uploaded file
//   fs.unlinkSync(filePath);
// });

// export default router;

// routes/analyzeRoutes.js (Updated)
import express from "express";
import { analyzeFile } from "../controllers/analyzeController.js";

const router = express.Router();

// ✅ Analyze a file by ID
router.post("/:id", analyzeFile);

export default router;