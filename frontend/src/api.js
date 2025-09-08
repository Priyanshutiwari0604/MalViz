// api.js (Updated)
import axios from "axios";

// Create an axios instance pointing to Vite proxy (/api → http://localhost:5000)
const api = axios.create({
  baseURL: "/api",
});

// Request interceptor to add auth token if needed
api.interceptors.request.use(
  (config) => {
    // You can add authentication tokens here if needed
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
// API Helpers
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
    onUploadProgress: onProgress
  });
  return res.data;
}

// Trigger static analysis for a file by ID
export async function analyzeFile(fileId) {
  const res = await api.post(`/analyze/${fileId}`);
  return res.data;
}

// Download file by ID (returns blob)
export async function downloadFile(fileId) {
  const res = await api.get(`/download/${fileId}`, {
    responseType: "blob",
  });
  return res.data;
}

// Delete a file by ID
export async function deleteFile(fileId) {
  const res = await api.delete(`/files/${fileId}`);
  return res.data;
}

export default api;