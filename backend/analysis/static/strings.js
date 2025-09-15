import fs from "fs";

export function extractStrings(filePath, minLength = 4) {
  if (!filePath) {
    console.error("No file path provided");
    return { strings: [], iocs: [] };
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    return { strings: [], iocs: [] };
  }

  try {
    const data = fs.readFileSync(filePath);
    
    if (data.length === 0) {
      console.warn("File is empty");
      return { strings: [], iocs: [] };
    }

    const strings = [];
    let current = "";
    let totalPrintable = 0;

    for (let i = 0; i < data.length; i++) {
      const byte = data[i];
      
      if (byte >= 32 && byte <= 126) {
        current += String.fromCharCode(byte);
        totalPrintable++;
      } else {
        if (current.length >= minLength) {
          strings.push(current);
        }
        current = "";
      }
    }
    
    if (current.length >= minLength) {
      strings.push(current);
    }

    const uniqueStrings = [...new Set(strings)];
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
            iocs.push(...foundItems);
          }
        }
      }
    }

    const uniqueIOCs = [...new Set(iocs)];

    return {
      strings: uniqueStrings.slice(0, 1000),
      iocs: uniqueIOCs
    };

  } catch (error) {
    console.error("String extraction error:", error.message);
    return { strings: [], iocs: [] };
  }
}