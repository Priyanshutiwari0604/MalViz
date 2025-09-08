// UploadPanel.jsx (Redesigned)
import React, { useState } from "react";
import { Upload, Shield, RefreshCw, AlertTriangle, Terminal } from "lucide-react";
import api from "../api";

export default function UploadPanel({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (selectedFile) => {
    setError(null);
    // Basic file type validation
    if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit
      setError("File size exceeds 100MB limit");
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const upload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError(null);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) =>
          setProgress(Math.round((e.loaded * 100) / e.total))
      });

      setFile(null);
      setProgress(0);
      onUploaded(res.data.file);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-kali-gray-800 rounded-xl border border-kali-purple shadow-lg p-6 mb-8 relative overflow-hidden">
      <div className="matrix-bg"></div>
      <h2 className="text-xl font-semibold text-kali-neonblue mb-4 flex items-center gap-2 relative z-10 font-mono">
        <Terminal className="w-5 h-5 text-kali-neonblue" />
        Upload File for Analysis
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-kali-gray-700 border border-kali-neonred rounded-lg flex items-center gap-2 text-kali-neonred relative z-10 font-mono pulse-alert">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 relative z-10 ${
          dragOver 
            ? "border-kali-neonblue bg-kali-gray-700 glow-blue" 
            : "border-kali-purple hover:border-kali-neonblue"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-kali-gray-700 rounded-full border border-kali-purple">
            <Upload className="w-8 h-8 text-kali-neonblue" />
          </div>
          
          {file ? (
            <div className="text-center">
              <p className="font-medium text-kali-neonblue font-mono">{file.name}</p>
              <p className="text-sm text-kali-gray-400 font-mono">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-white mb-2 font-mono">
                Drop your file here or click to browse
              </p>
              <p className="text-sm text-kali-gray-400 font-mono">
                Supports executables, documents, scripts, and other suspicious files (Max 100MB)
              </p>
            </div>
          )}
          
          <input
            type="file"
            onChange={(e) => handleFile(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="px-6 py-2 bg-kali-purple hover:bg-kali-neonblue text-white rounded-lg cursor-pointer transition-colors duration-200 font-mono"
          >
            Choose File
          </label>
        </div>
      </div>

      {file && (
        <div className="mt-6 flex items-center gap-4 relative z-10">
          <button
            onClick={upload}
            disabled={loading}
            className="px-6 py-2 bg-kali-neonred hover:bg-red-700 disabled:bg-kali-gray-600 text-white rounded-lg 
                     transition-colors duration-200 flex items-center gap-2 font-mono glow-red"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing... {progress}%
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Start Analysis
              </>
            )}
          </button>
          
          {loading && (
            <div className="flex-1 bg-kali-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-kali-neonred h-2 rounded-full transition-all duration-200 glow-red"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}