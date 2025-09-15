import axios from 'axios';
import dotenv from 'dotenv'
dotenv.config();

const API_KEY = process.env.VIRUSTOTAL_API_KEY;

/**
 * Look up a file hash in VirusTotal using the official API format
 * @param {string} hash - SHA256 hash of the file
 * @returns {Promise<Object>} VirusTotal analysis results
 */
export async function lookupHash(hash) {
  try {
    const options = {
      method: 'GET',
      url: `https://www.virustotal.com/api/v3/files/${hash}`,
      headers: {
        'accept': 'application/json',
        'x-apikey': API_KEY
      },
      timeout: 30000
    };

    console.log(`Looking up hash in VirusTotal: ${hash}`);
    
    const response = await axios.request(options);
    console.log('VirusTotal API response received');

    const data = response.data;
    if (!data.data) {
      return { 
        found: false, 
        message: 'No data returned from VirusTotal' 
      };
    }

    const attributes = data.data.attributes;
    const stats = attributes.last_analysis_stats || {};

    // Extract engine results
    const maliciousEngines = {};
    if (attributes.last_analysis_results) {
      Object.entries(attributes.last_analysis_results).forEach(([engine, result]) => {
        if (result.category === 'malicious' || result.category === 'suspicious') {
          maliciousEngines[engine] = {
            result: result.result,
            category: result.category
          };
        }
      });
    }

    const result = {
      found: true,
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      undetected: stats.undetected || 0,
      harmless: stats.harmless || 0,
      detectionRatio: `${stats.malicious || 0}/${Object.keys(attributes.last_analysis_results || {}).length}`,
      reputation: attributes.reputation || 0,
      lastAnalysisDate: attributes.last_analysis_date,
      lastModificationDate: attributes.last_modification_date,
      permalink: attributes.permalink || `https://www.virustotal.com/gui/file/${hash}`,
      meaningfulName: attributes.meaningful_name || attributes.names?.[0] || 'Unknown',
      typeDescription: attributes.type_description,
      size: attributes.size,
      firstSubmissionDate: attributes.first_submission_date,
      lastSubmissionDate: attributes.last_submission_date,
      maliciousEngines: maliciousEngines,
      totalEngines: Object.keys(attributes.last_analysis_results || {}).length,
      sha256: attributes.sha256,
      md5: attributes.md5,
      sha1: attributes.sha1
    };

    console.log(`VirusTotal lookup successful: ${result.detectionRatio} detection ratio`);
    return result;

  } catch (err) {
    console.error('VirusTotal API error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message
    });

    if (err.response?.status === 404) {
      return { 
        found: false, 
        message: 'Hash not found in VirusTotal database' 
      };
    }
    
    if (err.response?.status === 429) {
      return { 
        found: false, 
        error: 'VirusTotal API rate limit exceeded. Free tier: 4 requests/min, 500/day' 
      };
    }

    if (err.response?.status === 403) {
      return { 
        found: false, 
        error: 'API key invalid or insufficient permissions' 
      };
    }

    return { 
      found: false, 
      error: err.response?.data?.error?.message || err.message || 'Unknown VirusTotal API error' 
    };
  }
}

/**
 * Upload and analyze a file (if hash isn't found in VT)
 * @param {Buffer} fileBuffer - File content as buffer
 * @param {string} filename - Original filename
 */
export async function uploadAndAnalyzeFile(fileBuffer, filename) {
  try {
    const formData = new FormData();
    const blob = new Blob([fileBuffer]);
    formData.append('file', blob, filename);

    const options = {
      method: 'POST',
      url: 'https://www.virustotal.com/api/v3/files',
      headers: {
        'accept': 'application/json',
        'x-apikey': API_KEY,
        'content-type': 'multipart/form-data'
      },
      data: formData,
      timeout: 60000
    };

    console.log(`Uploading file to VirusTotal: ${filename}`);
    const response = await axios.request(options);
    
    // Return the analysis ID for polling
    return {
      success: true,
      analysisId: response.data.data.id,
      message: 'File uploaded successfully. Analysis in progress.'
    };

  } catch (err) {
    console.error('VirusTotal file upload error:', err.message);
    return {
      success: false,
      error: err.response?.data?.error?.message || err.message
    };
  }
}

/**
 * Get analysis results by analysis ID
 * @param {string} analysisId - Analysis ID from upload
 */
export async function getAnalysisResults(analysisId) {
  try {
    const options = {
      method: 'GET',
      url: `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      headers: {
        'accept': 'application/json',
        'x-apikey': API_KEY
      }
    };

    const response = await axios.request(options);
    return response.data;

  } catch (err) {
    console.error('VirusTotal analysis results error:', err.message);
    return { error: err.message };
  }
}