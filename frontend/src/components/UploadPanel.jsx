// UploadPanel.jsx
import React, { useState, useRef } from "react";
import { Upload, Terminal, AlertTriangle, File, X } from "lucide-react";
import api from "../api";

export default function UploadPanel({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInput = useRef();

  const pickFile = (f) => {
    setError(null);
    if (!f) return;
    if (f.size > 200 * 1024 * 1024) {
      setError("File too large (200MB max)");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (!e.total) return;
          setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      setFile(null);
      setProgress(0);
      if (onUploaded) onUploaded(res.data);
      // refresh list might be handled by parent (App reload or Dashboard)
    } catch (err) {
      console.error("Upload error", err);
      setError(err?.response?.data?.error || err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl p-8 mb-8 overflow-hidden backdrop-blur-sm">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      
      {/* Header */}
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3 font-mono">
          <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
            <Terminal className="w-6 h-6 text-blue-400" />
          </div>
          File Analysis Upload
        </h2>
        <p className="text-slate-400 mb-6 font-mono text-sm">
          Upload files for comprehensive security analysis and threat detection
        </p>

        {/* Error display with enhanced styling */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-300 font-mono backdrop-blur-sm">
            <div className="p-1 bg-red-500/20 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="font-medium text-red-200">Upload Error</div>
              <div className="text-sm text-red-300">{error}</div>
            </div>
          </div>
        )}

        {/* Upload area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
            dragOver 
              ? "border-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/20 scale-[1.02]" 
              : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/30"
          }`}
        >
          <div className="flex flex-col items-center gap-6">
            {file ? (
              // File selected state
              <div className="w-full max-w-md">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-400/30 flex-shrink-0">
                      <File className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white font-mono text-lg mb-1 truncate">
                        {file.name}
                      </div>
                      <div className="text-slate-400 font-mono text-sm mb-3">
                        {(file.size/1024/1024).toFixed(2)} MB
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setFile(null)} 
                          disabled={loading}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-lg text-slate-300 font-mono text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </button>
                        <button 
                          onClick={upload} 
                          disabled={loading}
                          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-mono font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
                        >
                          <Upload className="w-4 h-4" />
                          {loading ? "Uploading..." : "Upload & Analyze"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Empty state
              <>
                <div className="relative">
                  <div className="p-6 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl border border-slate-600/50 backdrop-blur-sm">
                    <Upload className="w-12 h-12 text-blue-400 mx-auto" />
                  </div>
                  {dragOver && (
                    <div className="absolute inset-0 bg-blue-500/20 rounded-2xl border-2 border-blue-400 animate-pulse" />
                  )}
                </div>

                <div className="space-y-3">
                  <div className="text-xl font-semibold text-white font-mono">
                    {dragOver ? "Drop your file here" : "Upload File for Analysis"}
                  </div>
                  <div className="text-slate-400 font-mono text-sm max-w-md">
                    Drag and drop your file here, or click below to browse
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Supports executables, scripts, documents • Max 200MB
                  </div>
                </div>

                <input 
                  ref={fileInput} 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => pickFile(e.target.files[0])} 
                />
                
                <button 
                  onClick={() => fileInput.current?.click()} 
                  className="px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border border-slate-500 text-white font-mono font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-slate-500/25 hover:scale-105"
                >
                  Browse Files
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {progress > 0 && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between items-center text-sm font-mono">
              <span className="text-slate-400">Upload Progress</span>
              <span className="text-blue-400 font-medium">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-full transition-all duration-300 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}