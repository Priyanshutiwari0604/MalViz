// import File from "../models/filemodel.model.js";
// import { generateSHA256 } from "../utils/hash.js";
// import * as fsPromises from "fs/promises"; // async file ops
// import fs from "fs"; // streaming
// import path from "path";
// import { calculateEntropy } from "../analysis/static/entropy.js";
// import { parsePE } from "../analysis/static/peParser.js";
// import { extractStrings } from "../analysis/static/strings.js";
// import { runYara } from "../analysis/static/yaraScan.js";
// // Upload a file
// export const uploadFile = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const hash = await generateSHA256(req.file.path);

//     // TODO: replace with real user ID from auth middleware
//     const userId = req.user?.id || "64f8a9c1234567890abcdef0"; 

//     // Check if file with same hash already exists
//     let existingFile = await File.findOne({ hash });

//     if (existingFile) {
//       // Add this user if not already linked
//       if (!existingFile.uploadedBy.includes(userId)) {
//         existingFile.uploadedBy.push(userId);
//         await existingFile.save();
//       }

//       // Delete duplicate from disk since we already have it
//       await fsPromises.unlink(req.file.path);

//       return res.status(200).json({
//         message: "ℹ️ File already exists, linked to user",
//         file: existingFile
//       });
//     }

//     // Otherwise create new file entry
//     const newFile = new File({
//       originalName: req.file.originalname,
//       safeName: req.file.filename,
//       size: req.file.size,
//       hash,
//       mimetype: req.file.mimetype,
//       uploadedBy: [userId]
//     });

//     await newFile.save();

//     res.status(201).json({
//       message: "✅ File uploaded successfully",
//       file: newFile
//     });

//   } catch (error) {
//     if (req.file) {
//       try {
//         await fsPromises.unlink(req.file.path);
//       } catch (unlinkError) {
//         console.error("Failed to clean up file:", unlinkError);
//       }
//     }
//     console.error("Upload failed:", error);
//     res.status(500).json({ error: error.message });
//   }
// };


// // Get all files
// export const getFiles = async (req, res) => {
//   try {
//     const userId = req.user?.id ; // replace with real user ID from Clerk later
//     const files = await File.find({ uploadedBy: userId }).sort({ uploadedAt: -1 });
//     res.json(files);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// // Download a file
// export const downloadFile = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find the file in the database
//     const file = await File.findById(id);
//     if (!file) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     const filePath = path.join(process.cwd(), "storage", file.safeName);

//     try {
//       await fsPromises.access(filePath); // check if file exists
//     } catch (error) {
//       return res.status(404).json({ error: "File not found on server" });
//     }

//     // Set appropriate headers for download
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${file.originalName}"`
//     );
//     res.setHeader("Content-Type", file.mimetype);
//     res.setHeader("Content-Length", file.size);

//     // Stream the file to the client
//     const fileStream = fs.createReadStream(filePath);
//     fileStream.pipe(res);
//   } catch (error) {
//     console.error("Download failed:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // Delete a file
// export const deleteFile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user?.id || "64f8a9c1234567890abcdef0";

//     const file = await File.findById(id);
//     if (!file) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     // If multiple users are linked
//     if (file.uploadedBy.length > 1) {
//       file.uploadedBy = file.uploadedBy.filter(uid => uid.toString() !== userId);
//       await file.save();
//       return res.json({ message: "✅ File unlinked for this user", file });
//     }

//     // If only this user owns it → delete from disk + DB
//     const filePath = path.join(process.cwd(), "storage", file.safeName);
//     try {
//       await fsPromises.unlink(filePath);
//     } catch (error) {
//       console.warn("File missing on disk, proceeding with DB deletion:", error);
//     }

//     await File.findByIdAndDelete(id);

//     res.json({ message: "✅ File deleted successfully", deletedFile: file });

//   } catch (error) {
//     console.error("Delete failed:", error);
//     res.status(500).json({ error: error.message });
//   }
// };
// controllers/filecontroller.controllers.js - FIXED VERSION
// import File from "../models/filemodel.model.js";
// import { generateSHA256 } from "../utils/hash.js";
// import * as fsPromises from "fs/promises";
// import fs from "fs";
// import path from "path";

// // Import your analysis modules
// import { calculateEntropy } from "../analysis/static/entropy.js";
// import { extractStrings } from "../analysis/static/strings.js";
// import { runYara } from "../analysis/static/yaraScan.js";
// // import { parsePE } from "../analysis/static/peParser.js"; // Uncomment if available

// // Helper function to perform static analysis
// async function performStaticAnalysis(filePath, originalName) {
//   console.log(`🔍 Starting analysis for: ${originalName}`);
//   console.log(`📁 File path: ${filePath}`);

//   const results = {
//     entropy: null,
//     peMetadata: null,
//     strings: [],
//     iocs: [],
//     yaraMatches: [],
//     analysisDate: new Date().toISOString(),
//     errors: []
//   };

//   try {
//     // Check if file exists
//     if (!fs.existsSync(filePath)) {
//       console.error(`❌ File not found: ${filePath}`);
//       results.errors.push("File not found");
//       return results;
//     }

//     const buffer = fs.readFileSync(filePath);
//     console.log(`📊 File size: ${buffer.length} bytes`);

//     // 1. Calculate Entropy
//     console.log(`🧮 Calculating entropy...`);
//     try {
//       results.entropy = calculateEntropy(buffer);
//       console.log(`✅ Entropy: ${results.entropy}`);
//     } catch (error) {
//       console.error(`❌ Entropy failed:`, error.message);
//       results.errors.push(`Entropy: ${error.message}`);
//     }

//     // 2. Extract Strings
//     console.log(`🔤 Extracting strings...`);
//     try {
//       const stringResults = extractStrings(filePath, 4);
//       results.strings = stringResults.strings || [];
//       results.iocs = stringResults.iocs || [];
//       console.log(`✅ Found ${results.strings.length} strings, ${results.iocs.length} IOCs`);
      
//       // Debug: show first few strings
//       if (results.strings.length > 0) {
//         console.log(`📝 Sample strings:`, results.strings.slice(0, 3));
//       } else {
//         console.log(`⚠️ No strings found - this might be binary data`);
//       }
//     } catch (error) {
//       console.error(`❌ String extraction failed:`, error.message);
//       results.errors.push(`Strings: ${error.message}`);
//     }

//     // 3. YARA Scan
//     console.log(`🛡️ Running YARA...`);
//     try {
//       results.yaraMatches = runYara(filePath, "./rules/");
//       console.log(`✅ YARA matches: ${results.yaraMatches.length}`);
//     } catch (error) {
//       console.error(`❌ YARA failed:`, error.message);
//       results.errors.push(`YARA: ${error.message}`);
//     }

//     // 4. PE Analysis (if applicable)
//     const ext = path.extname(originalName).toLowerCase();
//     if (['.exe', '.dll', '.sys'].includes(ext)) {
//       console.log(`🏗️ Analyzing PE structure...`);
//       try {
//         // Uncomment if you have parsePE working
//         // results.peMetadata = await parsePE(filePath);
//         console.log(`⚠️ PE parsing skipped (not implemented)`);
//       } catch (error) {
//         console.error(`❌ PE parsing failed:`, error.message);
//         results.errors.push(`PE: ${error.message}`);
//       }
//     }

//     console.log(`✅ Analysis complete!`);
//     return results;

//   } catch (error) {
//     console.error(`❌ Analysis failed:`, error.message);
//     results.errors.push(`General: ${error.message}`);
//     return results;
//   }
// }

// // Upload a file WITH ANALYSIS
// export const uploadFile = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     console.log(`\n📤 === FILE UPLOAD STARTED ===`);
//     console.log(`📄 Original: ${req.file.originalname}`);
//     console.log(`💾 Saved as: ${req.file.filename}`);
//     console.log(`📍 Path: ${req.file.path}`);
//     console.log(`📊 Size: ${req.file.size} bytes`);

//     const hash = await generateSHA256(req.file.path);
//     console.log(`🔐 Hash: ${hash}`);

//     const userId = req.user?.id || "64f8a9c1234567890abcdef0"; 

//     // Check for existing file
//     let existingFile = await File.findOne({ hash });
//     if (existingFile) {
//       console.log(`ℹ️ Duplicate file found, cleaning up...`);
//       if (!existingFile.uploadedBy.includes(userId)) {
//         existingFile.uploadedBy.push(userId);
//         await existingFile.save();
//       }
//       await fsPromises.unlink(req.file.path);
//       return res.status(200).json({
//         message: "ℹ️ File already exists, linked to user",
//         file: existingFile
//       });
//     }

//     // ⭐ PERFORM STATIC ANALYSIS ⭐
//     console.log(`\n🔬 === STATIC ANALYSIS STARTED ===`);
//     const analysisResults = await performStaticAnalysis(req.file.path, req.file.originalname);

//     // Create new file entry with analysis
//     const newFile = new File({
//       originalName: req.file.originalname,
//       safeName: req.file.filename,
//       size: req.file.size,
//       hash,
//       mimetype: req.file.mimetype,
//       uploadedBy: [userId],
      
//       // Analysis results
//       staticAnalysis: {
//         entropy: analysisResults.entropy,
//         peMetadata: analysisResults.peMetadata,
//         analysisDate: analysisResults.analysisDate,
//         errors: analysisResults.errors
//       },
//       strings: analysisResults.strings,
//       iocs: analysisResults.iocs,
//       yaraMatches: analysisResults.yaraMatches
//     });

//     await newFile.save();

//     console.log(`\n✅ === UPLOAD COMPLETE ===`);
//     console.log(`📋 Analysis Summary:`);
//     console.log(`   - Entropy: ${analysisResults.entropy}`);
//     console.log(`   - Strings: ${analysisResults.strings.length}`);
//     console.log(`   - IOCs: ${analysisResults.iocs.length}`);
//     console.log(`   - YARA: ${analysisResults.yaraMatches.length}`);
//     console.log(`   - Errors: ${analysisResults.errors.length}`);

//     res.status(201).json({
//       message: "✅ File uploaded and analyzed successfully",
//       file: newFile,
//       analysisPreview: {
//         entropy: analysisResults.entropy,
//         stringsCount: analysisResults.strings.length,
//         iocsCount: analysisResults.iocs.length,
//         yaraMatchesCount: analysisResults.yaraMatches.length,
//         errors: analysisResults.errors
//       }
//     });

//   } catch (error) {
//     console.error(`❌ Upload failed:`, error);
    
//     // Cleanup on failure
//     if (req.file && fs.existsSync(req.file.path)) {
//       try {
//         await fsPromises.unlink(req.file.path);
//         console.log(`🗑️ Cleaned up failed upload`);
//       } catch (unlinkError) {
//         console.error(`Failed to cleanup:`, unlinkError);
//       }
//     }
    
//     res.status(500).json({ 
//       error: "Upload failed", 
//       details: error.message 
//     });
//   }
// };

// // Keep your other functions unchanged
// export const getFiles = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const files = await File.find({ uploadedBy: userId }).sort({ uploadedAt: -1 });
//     res.json(files);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const downloadFile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const file = await File.findById(id);
//     if (!file) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     const filePath = path.join(process.cwd(), "storage", file.safeName);
//     try {
//       await fsPromises.access(filePath);
//     } catch (error) {
//       return res.status(404).json({ error: "File not found on server" });
//     }

//     res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
//     res.setHeader("Content-Type", file.mimetype);
//     res.setHeader("Content-Length", file.size);

//     const fileStream = fs.createReadStream(filePath);
//     fileStream.pipe(res);
//   } catch (error) {
//     console.error("Download failed:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// export const deleteFile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user?.id || "64f8a9c1234567890abcdef0";

//     const file = await File.findById(id);
//     if (!file) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     if (file.uploadedBy.length > 1) {
//       file.uploadedBy = file.uploadedBy.filter(uid => uid.toString() !== userId);
//       await file.save();
//       return res.json({ message: "✅ File unlinked for this user", file });
//     }

//     const filePath = path.join(process.cwd(), "storage", file.safeName);
//     try {
//       await fsPromises.unlink(filePath);
//     } catch (error) {
//       console.warn("File missing on disk, proceeding with DB deletion:", error);
//     }

//     await File.findByIdAndDelete(id);
//     res.json({ message: "✅ File deleted successfully", deletedFile: file });

//   } catch (error) {
//     console.error("Delete failed:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// controllers/filecontroller.controllers.js - FIXED VERSION
// import File from "../models/filemodel.model.js";
// import { generateSHA256 } from "../utils/hash.js";
// import * as fsPromises from "fs/promises";
// import fs from "fs";
// import path from "path";

// // Import your analysis modules
// import { calculateEntropy } from "../analysis/static/entropy.js";
// import { extractStrings } from "../analysis/static/strings.js";
// import { runYara } from "../analysis/static/yaraScan.js";
// // import { parsePE } from "../analysis/static/peParser.js"; // Uncomment if available

// // Helper function to perform static analysis
// async function performStaticAnalysis(filePath, originalName) {
//   console.log(`🔬 Starting analysis for: ${originalName}`);
//   console.log(`📁 File path: ${filePath}`);

//   const results = {
//     entropy: null,
//     peMetadata: null,
//     strings: [],
//     iocs: [],
//     yaraMatches: [],
//     analysisDate: new Date().toISOString(),
//     errors: []
//   };

//   try {
//     // Check if file exists
//     if (!fs.existsSync(filePath)) {
//       console.error(`❌ File not found: ${filePath}`);
//       results.errors.push("File not found");
//       return results;
//     }

//     const buffer = fs.readFileSync(filePath);
//     console.log(`📊 File size: ${buffer.length} bytes`);

//     // 1. Calculate Entropy
//     console.log(`🧮 Calculating entropy...`);
//     try {
//       results.entropy = calculateEntropy(buffer);
//       console.log(`✅ Entropy: ${results.entropy}`);
//     } catch (error) {
//       console.error(`❌ Entropy failed:`, error.message);
//       results.errors.push(`Entropy: ${error.message}`);
//     }

//     // 2. Extract Strings
//     console.log(`🔤 Extracting strings...`);
//     try {
//       const stringResults = extractStrings(filePath, 4);
//       results.strings = stringResults.strings || [];
//       results.iocs = stringResults.iocs || [];
//       console.log(`✅ Found ${results.strings.length} strings, ${results.iocs.length} IOCs`);
      
//       // Debug: show first few strings
//       if (results.strings.length > 0) {
//         console.log(`🔍 Sample strings:`, results.strings.slice(0, 3));
//       } else {
//         console.log(`⚠️ No strings found - this might be binary data`);
//       }
//     } catch (error) {
//       console.error(`❌ String extraction failed:`, error.message);
//       results.errors.push(`Strings: ${error.message}`);
//     }

//     // 3. YARA Scan
//     console.log(`🛡️ Running YARA...`);
//     try {
//       results.yaraMatches = runYara(filePath, "./rules/");
//       console.log(`✅ YARA matches: ${results.yaraMatches.length}`);
//     } catch (error) {
//       console.error(`❌ YARA failed:`, error.message);
//       results.errors.push(`YARA: ${error.message}`);
//     }

//     // 4. PE Analysis (if applicable)
//     const ext = path.extname(originalName).toLowerCase();
//     if (['.exe', '.dll', '.sys'].includes(ext)) {
//       console.log(`🗝️ Analyzing PE structure...`);
//       try {
//         // Uncomment if you have parsePE working
//         // results.peMetadata = await parsePE(filePath);
//         console.log(`⚠️ PE parsing skipped (not implemented)`);
//       } catch (error) {
//         console.error(`❌ PE parsing failed:`, error.message);
//         results.errors.push(`PE: ${error.message}`);
//       }
//     }

//     console.log(`✅ Analysis complete!`);
//     return results;

//   } catch (error) {
//     console.error(`❌ Analysis failed:`, error.message);
//     results.errors.push(`General: ${error.message}`);
//     return results;
//   }
// }

// // Upload a file WITH ANALYSIS
// export const uploadFile = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     console.log(`\n📤 === FILE UPLOAD STARTED ===`);
//     console.log(`📄 Original: ${req.file.originalname}`);
//     console.log(`💾 Saved as: ${req.file.filename}`);
//     console.log(`📍 Path: ${req.file.path}`);
//     console.log(`📊 Size: ${req.file.size} bytes`);

//     const hash = await generateSHA256(req.file.path);
//     console.log(`🔐 Hash: ${hash}`);

//     const userId = req.user?.id || "64f8a9c1234567890abcdef0"; 

//     // Check for existing file
//     let existingFile = await File.findOne({ hash });
//     if (existingFile) {
//       console.log(`ℹ️ Duplicate file found, cleaning up...`);
//       if (!existingFile.uploadedBy.includes(userId)) {
//         existingFile.uploadedBy.push(userId);
//         await existingFile.save();
//       }
//       await fsPromises.unlink(req.file.path);
//       return res.status(200).json({
//         message: "ℹ️ File already exists, linked to user",
//         file: existingFile
//       });
//     }

//     // ⭐ PERFORM STATIC ANALYSIS ⭐
//     console.log(`\n🔬 === STATIC ANALYSIS STARTED ===`);
//     const analysisResults = await performStaticAnalysis(req.file.path, req.file.originalname);

//     // 🔧 FIXED: Properly structure the MongoDB document
//     const newFile = new File({
//       originalName: req.file.originalname,
//       safeName: req.file.filename,
//       size: req.file.size,
//       hash,
//       mimetype: req.file.mimetype,
//       uploadedBy: [userId],
      
//       // ✅ FIXED: Put all analysis results in staticAnalysis object
//       staticAnalysis: {
//         entropy: analysisResults.entropy,
//         strings: analysisResults.strings,        // ✅ Now strings are included here
//         iocs: analysisResults.iocs,              // ✅ Now IOCs are included here
//         yaraMatches: analysisResults.yaraMatches, // ✅ Now YARA matches are included here
//         peMetadata: analysisResults.peMetadata,
//         analysisDate: analysisResults.analysisDate,
//         errors: analysisResults.errors
//       }
//     });

//     await newFile.save();

//     // 🔍 DEBUG: Log what we're actually saving to database
//     console.log(`\n🗄️ === MONGODB DOCUMENT STRUCTURE ===`);
//     console.log(`Document ID: ${newFile._id}`);
//     console.log(`staticAnalysis.strings count: ${newFile.staticAnalysis?.strings?.length || 0}`);
//     console.log(`staticAnalysis.iocs count: ${newFile.staticAnalysis?.iocs?.length || 0}`);
//     console.log(`staticAnalysis.yaraMatches count: ${newFile.staticAnalysis?.yaraMatches?.length || 0}`);
//     console.log(`staticAnalysis.entropy: ${newFile.staticAnalysis?.entropy}`);
    
//     if (newFile.staticAnalysis?.strings?.length > 0) {
//       console.log(`First 3 strings in DB:`, newFile.staticAnalysis.strings.slice(0, 3));
//     }

//     console.log(`\n✅ === UPLOAD COMPLETE ===`);
//     console.log(`📋 Analysis Summary:`);
//     console.log(`   - Entropy: ${analysisResults.entropy}`);
//     console.log(`   - Strings: ${analysisResults.strings.length}`);
//     console.log(`   - IOCs: ${analysisResults.iocs.length}`);
//     console.log(`   - YARA: ${analysisResults.yaraMatches.length}`);
//     console.log(`   - Errors: ${analysisResults.errors.length}`);

//     res.status(201).json({
//       message: "✅ File uploaded and analyzed successfully",
//       file: newFile,
//       analysisPreview: {
//         entropy: analysisResults.entropy,
//         stringsCount: analysisResults.strings.length,
//         iocsCount: analysisResults.iocs.length,
//         yaraMatchesCount: analysisResults.yaraMatches.length,
//         errors: analysisResults.errors
//       }
//     });

//   } catch (error) {
//     console.error(`❌ Upload failed:`, error);
    
//     // Cleanup on failure
//     if (req.file && fs.existsSync(req.file.path)) {
//       try {
//         await fsPromises.unlink(req.file.path);
//         console.log(`🗑️ Cleaned up failed upload`);
//       } catch (unlinkError) {
//         console.error(`Failed to cleanup:`, unlinkError);
//       }
//     }
    
//     res.status(500).json({ 
//       error: "Upload failed", 
//       details: error.message 
//     });
//   }
// };

// // Keep your other functions unchanged
// export const getFiles = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const files = await File.find({ uploadedBy: userId }).sort({ uploadedAt: -1 });
    
//     // 🔍 DEBUG: Log what we're fetching from database
//     console.log(`\n📖 === FETCHING FILES FROM DB ===`);
//     console.log(`Found ${files.length} files for user ${userId}`);
    
//     files.forEach((file, index) => {
//       console.log(`File ${index + 1}: ${file.originalName}`);
//       console.log(`  - Strings: ${file.staticAnalysis?.strings?.length || 0}`);
//       console.log(`  - IOCs: ${file.staticAnalysis?.iocs?.length || 0}`);
//       console.log(`  - YARA: ${file.staticAnalysis?.yaraMatches?.length || 0}`);
//     });
    
//     res.json(files);
//   } catch (error) {
//     console.error("Get files failed:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// export const downloadFile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const file = await File.findById(id);
//     if (!file) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     const filePath = path.join(process.cwd(), "storage", file.safeName);
//     try {
//       await fsPromises.access(filePath);
//     } catch (error) {
//       return res.status(404).json({ error: "File not found on server" });
//     }

//     res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
//     res.setHeader("Content-Type", file.mimetype);
//     res.setHeader("Content-Length", file.size);

//     const fileStream = fs.createReadStream(filePath);
//     fileStream.pipe(res);
//   } catch (error) {
//     console.error("Download failed:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// export const deleteFile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user?.id || "64f8a9c1234567890abcdef0";

//     const file = await File.findById(id);
//     if (!file) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     if (file.uploadedBy.length > 1) {
//       file.uploadedBy = file.uploadedBy.filter(uid => uid.toString() !== userId);
//       await file.save();
//       return res.json({ message: "✅ File unlinked for this user", file });
//     }

//     const filePath = path.join(process.cwd(), "storage", file.safeName);
//     try {
//       await fsPromises.unlink(filePath);
//     } catch (error) {
//       console.warn("File missing on disk, proceeding with DB deletion:", error);
//     }

//     await File.findByIdAndDelete(id);
//     res.json({ message: "✅ File deleted successfully", deletedFile: file });

//   } catch (error) {
//     console.error("Delete failed:", error);
//     res.status(500).json({ error: error.message });
//   }
// };


// Fixed filecontroller.controllers.js - Major cleanup needed
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import File from "../models/filemodel.model.js";
import { runYara } from "../analysis/static/yaraScan.js";
import { parsePE } from "../analysis/static/peParser.js";
import { calculateEntropy } from "../analysis/static/entropy.js";
import { extractStrings } from "../analysis/static/strings.js";

// ------------------------------------------------------
// 🔹 Static Analysis Helper
// ------------------------------------------------------
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

// ------------------------------------------------------
// 🔹 Upload File
// ------------------------------------------------------
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const fileBuffer = await fs.readFile(filePath);
    const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    // Temporary user until Clerk/Auth is added
    const userId = req.user?._id || "default-user-id";

    // Check if file already exists (same hash, same user)
    let existingFile = await File.findOne({ hash: fileHash, uploadedBy: userId });

    if (existingFile) {
      await fs.unlink(filePath); // delete duplicate
      return res.json({ message: "File already uploaded", file: existingFile });
    }

    // Perform static analysis
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

    console.log(`📂 File uploaded: ${req.file.originalname} by ${userId}`);
    console.log(`📊 Analysis summary: entropy=${staticAnalysis.entropy}, yara=${staticAnalysis.yaraMatches.length}`);

    res.status(201).json(newFile);
  } catch (error) {
    console.error("❌ Upload error:", error.message);

    // Cleanup failed upload
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: error.message });
  }
};

// ------------------------------------------------------
// 🔹 Get All Files
// ------------------------------------------------------
export const getFiles = async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------------------------------------------
// 🔹 Download File
// ------------------------------------------------------
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

// ------------------------------------------------------
// 🔹 Delete File
// ------------------------------------------------------
export const deleteFile = async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    const filePath = path.join(process.cwd(), "storage", file.safeName);
    await fs.unlink(filePath).catch(() => {}); // ignore if already deleted

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Removed duplicate analyzeFile function since it's already in analyzeController.js