// // controllers/threatIntelController.js
// import File from "../models/filemodel.model.js";
// import { fetchIntel } from "../analysis/threatIntelService.js";

// /**
//  * Update threat intel for a given file
//  */
// export const updateThreatIntel = async (req, res) => {
//   try {
//     const { fileId } = req.params;
//     const file = await File.findById(fileId);
//     if (!file) return res.status(404).json({ error: "File not found" });

//     const intel = await fetchIntel(file);

//     file.threatIntel = intel;
//     await file.save();

//     res.json({
//       message: "Threat intel updated",
//       threatIntel: file.threatIntel,
//     });
//   } catch (err) {
//     console.error("Threat intel update error:", err);
//     res.status(500).json({ error: "Threat intel update failed" });
//   }
// };

// /**
//  * Get existing threat intel for a file
//  */
// export const getThreatIntel = async (req, res) => {
//   try {
//     const { fileId } = req.params;
//     const file = await File.findById(fileId).select("threatIntel");
//     if (!file) return res.status(404).json({ error: "File not found" });

//     res.json(file.threatIntel);
//   } catch (err) {
//     console.error("Threat intel fetch error:", err);
//     res.status(500).json({ error: "Failed to fetch threat intel" });
//   }
// };

// controllers/threatIntelController.js
import File from "../models/filemodel.model.js";
import { fetchIntel } from "../analysis/threatIntelService.js";
import fs from 'fs';
import path from 'path';

/**
 * Update threat intel for a given file
 */
export const updateThreatIntel = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ error: "File not found" });

    const intel = await fetchIntel(file);

    file.threatIntel = intel;
    await file.save();

    res.json({
      message: "Threat intel updated",
      threatIntel: file.threatIntel,
    });
  } catch (err) {
    console.error("Threat intel update error:", err);
    res.status(500).json({ error: "Threat intel update failed" });
  }
};

/**
 * Get existing threat intel for a file
 */
export const getThreatIntel = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId).select("threatIntel");
    if (!file) return res.status(404).json({ error: "File not found" });

    res.json(file.threatIntel);
  } catch (err) {
    console.error("Threat intel fetch error:", err);
    res.status(500).json({ error: "Failed to fetch threat intel" });
  }
};

/**
 * Poll for VirusTotal results
 */
export const pollVirusTotalResults = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ error: "File not found" });

    // If we have an analysis ID, poll for results
    if (file.threatIntel?.vtReport?.analysisId) {
      const analysisResult = await getAnalysisResults(file.threatIntel.vtReport.analysisId);
      
      if (analysisResult.status === 'completed') {
        // Update the file with completed analysis
        file.threatIntel.vtReport = {
          ...file.threatIntel.vtReport,
          ...analysisResult,
          status: 'completed'
        };
        await file.save();
      }
      
      return res.json({
        status: analysisResult.status,
        vtReport: file.threatIntel.vtReport
      });
    }

    res.status(400).json({ error: "No analysis ID found for polling" });
  } catch (err) {
    console.error("Polling error:", err);
    res.status(500).json({ error: "Polling failed" });
  }
};