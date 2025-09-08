// Dashboard.jsx (Redesigned)
import React, { useEffect, useState } from "react";
import {
  FileText, RefreshCw, Shield, Download, Trash2,
  HardDrive, Hash, Calendar, Search, AlertTriangle, Code2, Terminal
} from "lucide-react";
import api from "../api";
import AnalysisTab from "./AnalysisTab";

export default function Dashboard({ onStatsUpdate }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/files");
      setFiles(res.data);
      
      // Update stats
      const analyzedFiles = res.data.filter(f => f.staticAnalysis).length;
      const threats = res.data.reduce((acc, file) => {
        return acc + (file.staticAnalysis?.yaraMatches?.length || 0);
      }, 0);
      
      onStatsUpdate({
        totalFiles: res.data.length,
        analyzedFiles,
        detectedThreats: threats,
        lastAnalysis: res.data.length > 0 ? 
          new Date(Math.max(...res.data.map(f => new Date(f.updatedAt || f.uploadedAt)))) : null
      });
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleAnalyze = async (fileId) => {
    setAnalyzingId(fileId);
    try {
      const res = await api.post(`/analyze/${fileId}`);
      if (res.data.staticAnalysis) {
        setFiles((prev) =>
          prev.map((f) =>
            f._id === fileId ? { ...f, staticAnalysis: res.data.staticAnalysis } : f
          )
        );
        fetchFiles(); // Refresh to update stats
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      alert("Analysis failed: " + (err.response?.data?.error || err.message));
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file and its analysis?")) return;
    
    setDeletingId(fileId);
    try {
      await api.delete(`/files/${fileId}`);
      setFiles(prev => prev.filter(f => f._id !== fileId));
      fetchFiles(); // Refresh to update stats
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed: " + (err.response?.data?.error || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatFileSize = (bytes) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (
      Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
    );
  };

  const truncateHash = (hash) =>
    hash ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}` : 'N/A';

  const getThreatLevel = (file) => {
    if (!file.staticAnalysis) return "unknown";
    const yaraCount = file.staticAnalysis.yaraMatches?.length || 0;
    const iocCount = file.staticAnalysis.iocs?.length || 0;
    
    if (yaraCount > 0 || iocCount > 5) return "high";
    if (iocCount > 0) return "medium";
    return "low";
  };

  const filteredFiles = files.filter(file => 
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.hash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-kali-gray-800 rounded-xl border border-kali-purple shadow-lg relative overflow-hidden">
      <div className="matrix-bg"></div>
      <div className="p-6 border-b border-kali-purple relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-kali-neonblue flex items-center gap-2 font-mono">
            <Terminal className="w-5 h-5 text-kali-neonblue" />
            Analysis History
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-kali-gray-700 border border-kali-purple rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-kali-neonblue"
              />
              <Search className="w-4 h-4 text-kali-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <button
              onClick={fetchFiles}
              disabled={loading}
              className="px-4 py-2 bg-kali-purple hover:bg-kali-neonblue rounded-lg transition-colors duration-200 flex items-center gap-2 text-white font-mono"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto relative z-10">
        {filteredFiles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="p-4 bg-kali-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-kali-purple">
              <FileText className="w-8 h-8 text-kali-gray-400" />
            </div>
            <p className="text-kali-gray-400 text-lg font-mono">
              {searchTerm ? "No matching files found" : "No files analyzed yet"}
            </p>
            <p className="text-kali-gray-500 text-sm mt-1 font-mono">
              {searchTerm ? "Try a different search term" : "Upload a file to start analyzing"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-kali-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-kali-gray-300 uppercase tracking-wider font-mono">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-kali-gray-300 uppercase tracking-wider font-mono">
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    Size
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-kali-gray-300 uppercase tracking-wider font-mono">
                  Threat Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-kali-gray-300 uppercase tracking-wider font-mono">
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    SHA-256
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-kali-gray-300 uppercase tracking-wider font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Uploaded
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-kali-gray-300 uppercase tracking-wider font-mono">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kali-gray-700">
              {filteredFiles.map((file) => {
                const threatLevel = getThreatLevel(file);
                const threatColor = {
                  high: "text-kali-neonred bg-kali-gray-700 border border-kali-neonred",
                  medium: "text-yellow-400 bg-kali-gray-700 border border-yellow-400",
                  low: "text-kali-neongreen bg-kali-gray-700 border border-kali-neongreen",
                  unknown: "text-kali-gray-400 bg-kali-gray-700 border border-kali-gray-400"
                }[threatLevel];
                
                return (
                  <React.Fragment key={file._id}>
                    <tr className="hover:bg-kali-gray-750 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${threatColor}`}>
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-white font-mono">
                              {file.originalName}
                            </p>
                            <p className="text-sm text-kali-gray-400 font-mono">
                              {file.mimetype}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-kali-gray-300 font-mono">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${threatColor} font-mono`}>
                          {threatLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-kali-gray-300 bg-kali-gray-700 px-2 py-1 rounded border border-kali-purple">
                          {truncateHash(file.hash)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-kali-gray-300 font-mono">
                        {formatDate(file.uploadedAt)}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <a
                          href={`/api/files/${file._id}/download`}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-kali-gray-700 
                                     text-kali-neongreen rounded-lg hover:bg-kali-gray-600 transition-colors duration-200 font-mono border border-kali-neongreen"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </a>
                        <button
                          onClick={() => handleAnalyze(file._id)}
                          disabled={analyzingId === file._id}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-kali-gray-700 
                                     text-kali-neonblue rounded-lg hover:bg-kali-gray-600 transition-colors duration-200 disabled:opacity-50 font-mono border border-kali-neonblue"
                        >
                          <Search className="w-3 h-3" />
                          {analyzingId === file._id ? "Analyzing..." : "Analyze"}
                        </button>
                        <button
                          onClick={() => handleDelete(file._id)}
                          disabled={deletingId === file._id}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-kali-gray-700 
                                     text-kali-neonred rounded-lg hover:bg-kali-gray-600 transition-colors duration-200 disabled:opacity-50 font-mono border border-kali-neonred"
                        >
                          <Trash2 className="w-3 h-3" />
                          {deletingId === file._id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Analysis Row */}
                    <tr>
                      <td colSpan="6" className="p-4 bg-kali-gray-750">
                        <AnalysisTab analysis={file.staticAnalysis} />
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}