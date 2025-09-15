// api.js - Enhanced with proper VirusTotal integration
import axios from "axios";

// Create an axios instance pointing to your backend
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 30000, // Increase timeout for VirusTotal checks
});

// Request interceptor to add auth token if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ---------------------
// API Helpers (Updated with better error handling)
// ---------------------

// Fetch all uploaded files
export async function fetchFiles() {
  const res = await api.get("/files");
  return res.data;
}

// Upload a file
export async function uploadFile(formData, onProgress) {
  const res = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onProgress,
    timeout: 300000, // 5 minutes for large files
  });
  return res.data;
}

// Trigger static analysis for a file by ID
export async function analyzeFile(fileId) {
  const res = await api.post(`/files/${fileId}/analyze`, {}, {
    timeout: 120000, // 2 minutes for analysis
  });
  return res.data;
}

// Download file by ID (returns blob)
export async function downloadFile(fileId) {
  const res = await api.get(`/files/${fileId}/download`, {
    responseType: "blob",
  });
  return res.data;
}

// Delete a file by ID
export async function deleteFile(fileId) {
  const res = await api.delete(`/files/${fileId}`);
  return res.data;
}

// Get threat intelligence for a file
export async function getThreatIntel(fileId) {
  const res = await api.get(`/intel/files/${fileId}/threat-intel`, {
    timeout: 45000, // 45 seconds for VT check
  });
  return res.data;
}

// Update threat intelligence for a file (poll until complete)
// In api.js, ensure updateThreatIntel returns the complete response
export async function updateThreatIntel(fileId) {
  try {
    const res = await api.post(`/intel/files/${fileId}/threat-intel`, {}, {
      timeout: 60000,
    });
    
    // Return the complete response data, not just vtReport
    return res.data;
  } catch (err) {
    console.error("VT update error:", err);
    throw err;
  }
}

// Poll for VirusTotal results
async function pollForVirusTotalResults(fileId, analysisId, maxAttempts = 12, interval = 5000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await new Promise(resolve => setTimeout(resolve, interval));
      
      const res = await api.get(`/intel/files/${fileId}/threat-intel/${analysisId}`, {
        timeout: 10000,
      });
      
      if (res.data.status === "completed") {
        return res.data;
      }
      
      if (res.data.status === "failed") {
        throw new Error(res.data.error || "VirusTotal analysis failed");
      }
      
      // Continue polling if still in progress
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw new Error(`VirusTotal analysis timeout: ${error.message}`);
      }
    }
  }
  
  throw new Error("VirusTotal analysis did not complete in time");
}

// Get health status
export async function getHealth() {
  const res = await api.get("/health");
  return res.data;
}

// Get file by ID
export async function getFileById(fileId) {
  const res = await api.get(`/files/${fileId}`);
  return res.data;
}

export default api;