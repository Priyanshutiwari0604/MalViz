// import path from "path";
// import FileModel from "../models/filemodel.model.js";
// import { calculateEntropy } from "../analysis/static/entropy.js";
// import { parsePE } from "../analysis/static/peParser.js";
// import { extractStrings } from "../analysis/static/strings.js";
// import { runYara } from "../analysis/static/yaraScan.js";

// export const analyzeFile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const fileDoc = await FileModel.findById(id);

//     if (!fileDoc) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     const filePath = path.join(process.cwd(), "storage", fileDoc.safeName);

//     // Run analyzers
//     const entropy = await calculateEntropy(filePath);
//     const { strings, iocs } = await extractStrings(filePath);
//     const yaraMatches = await runYara(filePath, "./rules/");

//     // ✅ Parse PE only if executable
//     let peMetadata = null;
//     const ext = path.extname(fileDoc.originalName).toLowerCase();
//     if (ext === ".exe" || ext === ".dll") {
//       try {
//         peMetadata = await parsePE(filePath);
//       } catch (err) {
//         console.warn(`PE parsing failed for ${fileDoc.originalName}:`, err.message);
//       }
//     }

//     // Save results
//     fileDoc.staticAnalysis = {
//       entropy,
//       strings,
//       iocs,
//       yaraMatches,
//       peMetadata,
//     };
//     await fileDoc.save();

//     res.json({
//       message: "✅ Analysis complete",
//       staticAnalysis: fileDoc.staticAnalysis,
//     });
//   } catch (err) {
//     console.error("Analysis failed:", err);
//     res.status(500).json({
//       error: "Analysis failed",
//       details: err.message,
//     });
//   }
// };

// controllers/analyzeController.js (Updated)
// Fixed analyzeController.js - Added missing import
import path from "path";
import fs from "fs"; // Changed to regular fs for sync operations
import FileModel from "../models/filemodel.model.js";
import { calculateEntropy } from "../analysis/static/entropy.js";
import { parsePE } from "../analysis/static/peParser.js";
import { extractStrings } from "../analysis/static/strings.js";
import { runYara } from "../analysis/static/yaraScan.js";

export const analyzeFile = async (req, res) => {
  try {
    const { id } = req.params;
    const fileDoc = await FileModel.findById(id);

    if (!fileDoc) {
      return res.status(404).json({ error: "File not found in DB" });
    }

    const filePath = path.join(process.cwd(), "storage", fileDoc.safeName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    // Read file buffer once for entropy
    const buffer = fs.readFileSync(filePath);

    // Run analyzers
    const entropy = calculateEntropy(buffer);
    const { strings, iocs } = extractStrings(filePath); // Removed await
    const yaraMatches = runYara(filePath, "./rules/");

    // Parse PE only if executable
    let peMetadata = null;
    const ext = path.extname(fileDoc.originalName).toLowerCase();
    if ([".exe", ".dll", ".sys"].includes(ext)) {
      try {
        peMetadata = parsePE(filePath); // Removed await
      } catch (err) {
        console.warn(`PE parsing failed for ${fileDoc.originalName}:`, err.message);
        peMetadata = { error: err.message };
      }
    }

    // Save results
    fileDoc.staticAnalysis = {
      entropy,
      strings: strings.slice(0, 500),
      stringsFound: strings.length,
      iocs,
      iocsFound: iocs.length,
      yaraMatches,
      yaraMatchesFound: yaraMatches.length,
      peMetadata,
      analysisDate: new Date()
    };

    await fileDoc.save();

    res.json({
      message: "✅ Analysis complete",
      staticAnalysis: fileDoc.staticAnalysis,
    });
  } catch (err) {
    console.error("❌ Analysis failed:", err);
    res.status(500).json({
      error: "Analysis failed",
      details: err.message,
    });
  }
};