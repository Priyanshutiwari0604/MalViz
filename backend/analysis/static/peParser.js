// import fs from "fs";
// import * as pelib from "pe-library";

// export function parsePE(filePath) {
//   const buffer = fs.readFileSync(filePath);
//   const reader = new pelib.PE.Reader(buffer);

//   return {
//     machine: reader.getMachineType(),
//     entryPoint: reader.getEntryPointAddress(),
//     sections: reader.getSections().map(s => ({
//       name: s.getName(),
//       size: s.getSizeOfRawData(),
//       entropy: s.getEntropy(),
//     })),
//     imports: reader.getImportDescriptors().map(i => i.getDllName()),
//     timestamp: reader.getTimeDateStamp(),
//   };
// }

import fs from "fs";
import * as pelib from "pe-library";

/**
 * Parse metadata from a Portable Executable (PE) file (.exe, .dll, .sys).
 * @param {string} filePath - Path to the PE file
 * @returns {Object} Parsed PE metadata
 */
export function parsePE(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const reader = new pelib.PE.Reader(buffer);

    return {
      machine: reader.getMachineType?.() || "Unknown",
      entryPoint: reader.getEntryPointAddress?.() || null,
      sections: reader.getSections?.().map((s) => ({
        name: s.getName?.() || "Unknown",
        size: s.getSizeOfRawData?.() || 0,
        entropy: s.getEntropy?.() || 0,
      })) || [],
      imports: reader.getImportDescriptors?.().map((i) => i.getDllName?.()) || [],
      timestamp: reader.getTimeDateStamp?.() || null,
    };
  } catch (err) {
    console.error(`❌ PE parsing failed for ${filePath}:`, err.message);
    return { error: err.message };
  }
}

