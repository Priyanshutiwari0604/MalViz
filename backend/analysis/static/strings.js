// import fs from "fs";

// export function extractStrings(filePath) {
//   const data = fs.readFileSync(filePath, "utf8"); // may need buffer handling
//   const strings = data.match(/[\x20-\x7E]{4,}/g) || []; // ASCII ≥4 chars

//   // IOC regex
//   const iocs = [];
//   const regexes = {
//     ip: /\b\d{1,3}(\.\d{1,3}){3}\b/g,
//     domain: /\b([a-zA-Z0-9-]+\.[a-zA-Z]{2,})\b/g,
//     url: /(https?:\/\/[^\s]+)/g,
//     email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
//   };

//   for (let type in regexes) {
//     const found = strings.join(" ").match(regexes[type]);
//     if (found) iocs.push(...found);
//   }

//   return { strings, iocs };
// }
// import fs from "fs";

// export function extractStrings(filePath) {
//   const data = fs.readFileSync(filePath);
//   const strings = data.toString('ascii').match(/[\x20-\x7E]{4,}/g) || [];

//   const iocs = [];
//   const regexes = {
//     ip: /\b(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(?:\.|$)){4}\b/g,
//     domain: /\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/g,
//     url: /\bhttps?:\/\/[^\s/$.?#].[^\s]*\b/g,
//     email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
//   };

//   for (let type in regexes) {
//     for (const str of strings) {
//       const found = str.match(regexes[type]);
//       if (found) iocs.push(...found);
//     }
//   }

//   return { strings, iocs };
// }

// import fs from "fs";

// export function extractStrings(filePath, minLength = 4) {
//   const data = fs.readFileSync(filePath);
//   const strings = [];
//   let current = "";

//   for (const byte of data) {
//     if (byte >= 32 && byte <= 126) {
//       current += String.fromCharCode(byte);
//     } else {
//       if (current.length >= minLength) strings.push(current);
//       current = "";
//     }
//   }
//   if (current.length >= minLength) strings.push(current);

//   // IOC regexes
//   const iocs = [];
//   const regexes = {
//     ip: /\b(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(?:\.|$)){4}\b/g,
//     domain: /\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/g,
//     url: /\bhttps?:\/\/[^\s/$.?#].[^\s]*\b/g,
//     email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
//   };

//   for (const type in regexes) {
//     for (const str of strings) {
//       const found = str.match(regexes[type]);
//       if (found) iocs.push(...found);
//     }
//   }

//   return { strings, iocs };
// }

// analysis/static/strings.js - DEBUG VERSION
// import fs from "fs";

// export function extractStrings(filePath, minLength = 4) {
//   console.log(`\n🔤 === STRING EXTRACTION DEBUG ===`);
//   console.log(`📁 File path: ${filePath}`);
//   console.log(`📏 Min length: ${minLength}`);
  
//   if (!fs.existsSync(filePath)) {
//     console.error(`❌ File does not exist: ${filePath}`);
//     return { strings: [], iocs: [] };
//   }

//   try {
//     // Read file as buffer
//     const data = fs.readFileSync(filePath);
//     console.log(`📄 File size: ${data.length} bytes`);
    
//     if (data.length === 0) {
//       console.warn(`⚠️ File is empty`);
//       return { strings: [], iocs: [] };
//     }

//     // Show first 50 bytes for debugging
//     const preview = Array.from(data.slice(0, 50))
//       .map(b => b >= 32 && b <= 126 ? String.fromCharCode(b) : `\\x${b.toString(16).padStart(2, '0')}`)
//       .join('');
//     console.log(`🔍 First 50 bytes: ${preview}`);

//     const strings = [];
//     let current = "";
//     let printableCount = 0;

//     // Extract printable ASCII strings
//     for (let i = 0; i < data.length; i++) {
//       const byte = data[i];
      
//       if (byte >= 32 && byte <= 126) { // Printable ASCII range
//         current += String.fromCharCode(byte);
//         printableCount++;
//       } else {
//         if (current.length >= minLength) {
//           strings.push(current);
//         }
//         current = "";
//       }
//     }
    
//     // Don't forget the last string if file doesn't end with non-printable
//     if (current.length >= minLength) {
//       strings.push(current);
//     }

//     console.log(`📊 Statistics:`);
//     console.log(`   - Total printable chars: ${printableCount}`);
//     console.log(`   - Extracted strings: ${strings.length}`);
//     console.log(`   - Longest string: ${strings.length > 0 ? Math.max(...strings.map(s => s.length)) : 0} chars`);

//     // Show first few strings for debugging
//     if (strings.length > 0) {
//       console.log(`📝 First 3 strings:`);
//       strings.slice(0, 3).forEach((str, idx) => {
//         console.log(`   ${idx + 1}: "${str}" (${str.length} chars)`);
//       });
//     } else {
//       console.log(`⚠️ No strings found! This might be:`);
//       console.log(`   - Pure binary data`);
//       console.log(`   - Encrypted/compressed file`);
//       console.log(`   - File with different encoding`);
//     }

//     // Extract IOCs from strings
//     const iocs = [];
//     if (strings.length > 0) {
//       console.log(`🔍 Searching for IOCs...`);
      
//       const regexes = {
//         ip: /\b(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\b/g,
//         domain: /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/g,
//         url: /\bhttps?:\/\/[^\s/$.?#].[^\s]*\b/gi,
//         email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
//       };

//       for (const [type, regex] of Object.entries(regexes)) {
//         for (const str of strings) {
//           const matches = str.match(regex);
//           if (matches) {
//             console.log(`   Found ${type}: ${matches.join(', ')}`);
//             iocs.push(...matches);
//           }
//         }
//       }

//       // Remove duplicates
//       const uniqueIOCs = [...new Set(iocs)];
//       console.log(`🎯 Total unique IOCs: ${uniqueIOCs.length}`);
      
//       return { 
//         strings: strings.slice(0, 500), // Limit to prevent huge payloads
//         iocs: uniqueIOCs 
//       };
//     }

//     return { strings: [], iocs: [] };

//   } catch (error) {
//     console.error(`❌ String extraction error:`, error.message);
//     console.error(`   Stack:`, error.stack);
//     return { strings: [], iocs: [] };
//   }
// }

// analysis/static/strings.js - COMPLETELY FIXED VERSION
// analysis/static/strings.js - FIXED VERSION
// Fixed strings.js - Removed async from extractStrings
import fs from "fs";

export function extractStrings(filePath, minLength = 4) {
  console.log(`\n🔤 === STRING EXTRACTION STARTED ===`);
  console.log(`📁 Target file: ${filePath}`);
  console.log(`📏 Minimum length: ${minLength}`);
  
  // Validate inputs
  if (!filePath) {
    console.error(`❌ No file path provided`);
    return { strings: [], iocs: [] };
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File does not exist: ${filePath}`);
    return { strings: [], iocs: [] };
  }

  try {
    console.log(`📖 Reading file...`);
    const data = fs.readFileSync(filePath);
    console.log(`✅ File read successfully: ${data.length} bytes`);
    
    if (data.length === 0) {
      console.warn(`⚠️  File is empty`);
      return { strings: [], iocs: [] };
    }

    console.log(`🔍 Extracting strings...`);
    const strings = [];
    let current = "";
    let totalPrintable = 0;

    for (let i = 0; i < data.length; i++) {
      const byte = data[i];
      
      // Check if byte is printable ASCII (32-126)
      if (byte >= 32 && byte <= 126) {
        current += String.fromCharCode(byte);
        totalPrintable++;
      } else {
        // Non-printable character, save current string if long enough
        if (current.length >= minLength) {
          strings.push(current);
        }
        current = "";
      }
    }
    
    // Don't forget the last string
    if (current.length >= minLength) {
      strings.push(current);
    }

    console.log(`📊 Extraction complete:`);
    console.log(`   - Total bytes processed: ${data.length}`);
    console.log(`   - Printable characters: ${totalPrintable}`);
    console.log(`   - Strings found: ${strings.length}`);

    // Remove duplicates from strings array
    const uniqueStrings = [...new Set(strings)];
    console.log(`🔍 Unique strings: ${uniqueStrings.length}`);

    // Extract IOCs
    console.log(`🕵️  Searching for IOCs...`);
    const iocs = [];
    
    if (uniqueStrings.length > 0) {
      const regexPatterns = {
        ip: /\b(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\b/g,
        domain: /\b[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}\b/g,
        url: /\bhttps?:\/\/[^\s<>"]+/gi,
        email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
      };

      for (const [type, regex] of Object.entries(regexPatterns)) {
        for (const str of uniqueStrings) {
          const matches = [...str.matchAll(regex)];
          if (matches.length > 0) {
            const foundItems = matches.map(m => m[0]);
            console.log(`   Found ${type}: ${foundItems.join(', ')}`);
            iocs.push(...foundItems);
          }
        }
      }
    }

    const uniqueIOCs = [...new Set(iocs)];
    console.log(`🎯 Total unique IOCs found: ${uniqueIOCs.length}`);

    const result = {
      strings: uniqueStrings.slice(0, 1000), // Limit to first 1000 strings
      iocs: uniqueIOCs
    };

    console.log(`✅ === STRING EXTRACTION COMPLETE ===`);
    console.log(`   Final result: ${result.strings.length} strings, ${result.iocs.length} IOCs`);

    return result;

  } catch (error) {
    console.error(`❌ === STRING EXTRACTION FAILED ===`);
    console.error(`Error message: ${error.message}`);
    
    return { strings: [], iocs: [] };
  }
}