// peParser.js - corrected version using proper pe-library API
import fs from "fs";
import * as PE from "pe-library";

export function parsePE(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    
    // Create PE executable instance using the correct API
    const exe = PE.NtExecutable.from(buffer);

    // Get basic information from headers
    const ntHeaders = exe.newHeader;
    const fileHeader = ntHeaders.fileHeader;
    const optionalHeader = ntHeaders.optionalHeader;

    // Get sections using the correct API
    const sections = [];
    try {
      // The exe object should have section headers accessible
      if (exe.sectionTable) {
        for (let i = 0; i < exe.sectionTable.length; i++) {
          const section = exe.sectionTable[i];
          sections.push({
            name: section.name ? section.name.replace(/\0/g, '') : `Section_${i}`,
            size: section.sizeOfRawData || 0,
            virtualSize: section.virtualSize || 0,
            virtualAddress: section.virtualAddress || 0,
            characteristics: section.characteristics || 0,
            entropy: 0 // Will calculate if section data is accessible
          });
        }
      }
    } catch (err) {
      console.warn("Could not parse sections:", err.message);
    }

    // Try to get imports
    let imports = [];
    try {
      const importSection = exe.getSectionByEntry(PE.Format.ImageDirectoryEntry.Import);
      if (importSection) {
        // Basic import detection - full parsing would require more work
        imports.push("Imports detected (detailed parsing not implemented)");
      }
    } catch (err) {
      // Import section might not exist
    }

    // Get exports if available
    let exports = [];
    try {
      const exportSection = exe.getSectionByEntry(PE.Format.ImageDirectoryEntry.Export);
      if (exportSection) {
        exports.push("Exports detected");
      }
    } catch (err) {
      // Export section might not exist
    }

    return {
      machine: getMachineTypeName(fileHeader.machine),
      entryPoint: optionalHeader.addressOfEntryPoint || null,
      sections: sections,
      imports: imports,
      exports: exports,
      timestamp: fileHeader.timeDateStamp || null,
      imageBase: optionalHeader.imageBase || null,
      sizeOfImage: optionalHeader.sizeOfImage || null,
      subsystem: getSubsystemName(optionalHeader.subsystem),
      characteristics: fileHeader.characteristics || 0,
      numberOfSections: fileHeader.numberOfSections || 0,
      sizeOfOptionalHeader: fileHeader.sizeOfOptionalHeader || 0
    };
  } catch (err) {
    console.error(`PE parsing failed for ${filePath}:`, err.message);
    return { error: err.message, filePath: filePath };
  }
}

// Alternative simpler function if the main one fails
export function parseBasicPE(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const exe = PE.NtExecutable.from(buffer);
    
    return {
      machine: exe.newHeader?.fileHeader?.machine || "Unknown",
      entryPoint: exe.newHeader?.optionalHeader?.addressOfEntryPoint || null,
      timestamp: exe.newHeader?.fileHeader?.timeDateStamp || null,
      numberOfSections: exe.newHeader?.fileHeader?.numberOfSections || 0,
      imageBase: exe.newHeader?.optionalHeader?.imageBase || null,
      subsystem: exe.newHeader?.optionalHeader?.subsystem || null,
      parsed: true
    };
  } catch (err) {
    return { error: err.message, parsed: false };
  }
}

// Helper function to get machine type name
function getMachineTypeName(machine) {
  const machineTypes = {
    0x014c: "i386",
    0x0200: "IA64", 
    0x8664: "x64",
    0x01c0: "ARM",
    0xaa64: "ARM64",
    0x01c2: "ARM Thumb-2",
    0x0162: "MIPS R3000",
    0x0166: "MIPS R4000",
    0x0169: "MIPS R10000"
  };
  return machineTypes[machine] || `Unknown (0x${machine?.toString(16) || '0'})`;
}

// Helper function to get subsystem name  
function getSubsystemName(subsystem) {
  const subsystems = {
    0: "Unknown",
    1: "Native",
    2: "Windows GUI",
    3: "Windows Console", 
    5: "OS/2 Console",
    7: "POSIX Console",
    8: "Native Win9x Driver",
    9: "Windows CE",
    10: "EFI Application",
    11: "EFI Boot Service Driver",
    12: "EFI Runtime Driver", 
    13: "EFI ROM",
    14: "XBOX",
    16: "Windows Boot Application"
  };
  return subsystems[subsystem] || `Unknown (${subsystem})`;
}