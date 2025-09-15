// analysis/threatIntelService.js
import { lookupHash } from './threatIntels/VirusTotal.threat.js';
import OTXAnalyzer from './threatIntels/Otx.threat.js';

const otxAnalyzer = new OTXAnalyzer();

export async function fetchIntel(file) {
  try {
    const results = {
      vtReport: null,
      vtScore: null,
      vtDetections: [],
      otxMatches: [],
      analysisDate: new Date(),
      errors: []
    };

    // VirusTotal lookup
    try {
      const vtResult = await lookupHash(file.hash);
      if (vtResult.found) {
        results.vtReport = vtResult;
        results.vtScore = vtResult.malicious || 0;
        results.vtDetections = Object.keys(vtResult.maliciousEngines || {});
      }
    } catch (vtError) {
      results.errors.push(`VirusTotal: ${vtError.message}`);
    }

    // OTX lookup
    try {
      const otxResult = await otxAnalyzer.analyzeHash(file.hash);
      if (otxResult.found) {
        results.otxMatches = otxResult.matches;
      }
    } catch (otxError) {
      results.errors.push(`OTX: ${otxError.message}`);
    }

    return results;
  } catch (error) {
    console.error('Threat intelligence fetch error:', error);
    return {
      errors: [`Failed to fetch threat intelligence: ${error.message}`],
      analysisDate: new Date()
    };
  }
}