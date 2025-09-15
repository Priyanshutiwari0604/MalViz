
// Dashboard.jsx - Enhanced UI with improved styling and animations
// Dashboard.jsx - Enhanced UI with improved spacing and better layout
import React, { useEffect, useState } from "react";
import {
  FileText,
  RefreshCw,
  Shield,
  Download,
  Trash2,
  Search,
  Terminal,
  AlertTriangle,
  Clock,
  Hash,
  Activity,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  TrendingUp,
  FileCheck,
} from "lucide-react";
import api from "../api";
import AnalysisTab from "./AnalysisTab";
import ThreatIntelTab from "./ThreatIntelTab";

export default function Dashboard({ onStatsUpdate, theme }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [vtStatus, setVtStatus] = useState({});
  const [vtBlurredData, setVtBlurredData] = useState({});

  const loadFiles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/files");
      const data = res.data;
      setFiles(data);

      // Update stats for parent component
      const analyzedFiles = data.filter((f) => f.staticAnalysis).length;
      const threats = data.reduce(
        (acc, f) => acc + (f.staticAnalysis?.yaraMatches?.length || 0),
        0
      );

      onStatsUpdate({
        totalFiles: data.length,
        analyzedFiles,
        detectedThreats: threats,
        lastAnalysis:
          data.length > 0
            ? new Date(
                Math.max(
                  ...data.map(
                    (f) => new Date(f.uploadedAt || f.createdAt || Date.now())
                  )
                )
              )
            : null,
      });
    } catch (err) {
      console.error("Failed to fetch files:", err);
      alert(
        "Failed to fetch files: " + (err?.response?.data?.error || err?.message)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleAnalyze = async (fileId) => {
    setAnalyzingId(fileId);
    try {
      const res = await api.post(`/files/${fileId}/analyze`);
      if (res.data.staticAnalysis) {
        setFiles((prev) =>
          prev.map((f) =>
            f._id === fileId
              ? { ...f, staticAnalysis: res.data.staticAnalysis }
              : f
          )
        );
        await loadFiles();
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      alert("Analysis failed: " + (err?.response?.data?.error || err?.message));
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm("Delete this file and all associated analysis data?")) return;
    setDeletingId(fileId);
    try {
      await api.delete(`/files/${fileId}`);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      await loadFiles();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed: " + (err?.response?.data?.error || err?.message));
    } finally {
      setDeletingId(null);
    }
  };

  const toggleRow = (id) => {
    const copy = new Set(expandedRows);
    if (copy.has(id)) copy.delete(id);
    else copy.add(id);
    setExpandedRows(copy);
  };

  const filteredFiles = files.filter(
    (f) =>
      (f.originalName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.hash || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSize = (bytes = 0) => {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = (file) => {
    if (file.staticAnalysis?.yaraMatches?.length > 0) {
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    }
    if (file.staticAnalysis) {
      return <Shield className="w-5 h-5 text-green-400" />;
    }
    return <FileText className="w-5 h-5 text-blue-400" />;
  };

  const getThreatLevel = (file) => {
    const yara = file.staticAnalysis?.yaraMatches?.length || 0;
    const vtMalicious = file.threatIntel?.vtReport?.malicious || 0;

    if (yara > 0 || vtMalicious > 0) {
      return { level: "High", color: "danger", icon: XCircle };
    }
    if (file.staticAnalysis) {
      return { level: "Low", color: "safe", icon: CheckCircle };
    }
    return { level: "Unknown", color: "warning", icon: AlertCircle };
  };

  const getVtStatus = (fileId) => {
    return vtStatus[fileId] || "idle";
  };

  return (
    <div className="card shadow-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/50 to-gray-800/30">
      {/* Enhanced Header */}
      <div className="card-header bg-gradient-to-r from-gray-800/60 to-gray-900/60 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
              <Terminal className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                File Analysis Dashboard
              </h2>
              <p className="text-sm text-gray-400">
                Manage and analyze uploaded files for security threats
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Enhanced Search */}
            <div className="relative group">
              <input
                type="text"
                placeholder="Search files or hashes..."
                className="form-input pl-12 pr-4 py-3 w-80 bg-gray-800/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 group-hover:border-gray-500/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-hover:text-gray-300 transition-colors" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Enhanced Refresh Button */}
            <button
              onClick={loadFiles}
              disabled={loading}
              className="btn btn-secondary px-6 py-3 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200 shadow-lg hover:shadow-xl"
              title="Refresh file list"
            >
              <RefreshCw
                className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="card-content p-0">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                {searchTerm ? (
                  <Search className="w-12 h-12 text-blue-400" />
                ) : (
                  <FileText className="w-12 h-12 text-blue-400" />
                )}
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {searchTerm ? "No matching files found" : "No files uploaded"}
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
              {searchTerm
                ? "Try adjusting your search terms or clear the filter to see all files"
                : "Upload files using the upload panel to start security analysis and threat detection"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="btn btn-secondary px-6 py-3 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-gray-800/40 border-b border-gray-700/50">
                  <tr>
                    <th className="text-left py-6 px-8 text-gray-300 font-semibold text-sm min-w-[280px]">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4" />
                        File
                      </div>
                    </th>
                    <th className="text-left py-6 px-6 text-gray-300 font-semibold text-sm min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Size
                      </div>
                    </th>
                    <th className="text-left py-6 px-6 text-gray-300 font-semibold text-sm min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Threat Level
                      </div>
                    </th>
                    <th className="text-left py-6 px-6 text-gray-300 font-semibold text-sm min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        VirusTotal
                      </div>
                    </th>
                    <th className="text-left py-6 px-6 text-gray-300 font-semibold text-sm min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Hash
                      </div>
                    </th>
                    <th className="text-left py-6 px-6 text-gray-300 font-semibold text-sm min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Uploaded
                      </div>
                    </th>
                    <th className="text-left py-6 px-8 text-gray-300 font-semibold text-sm min-w-[200px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file, index) => {
                    const isExpanded = expandedRows.has(file._id);
                    const threatLevel = getThreatLevel(file);
                    const vtReport = file.threatIntel?.vtReport;
                    const vtBlurredReport = vtBlurredData[file._id];
                    const vtStatusValue = getVtStatus(file._id);
                    const vtDetectionRatio = vtReport
                      ? `${vtReport.malicious || 0}/${vtReport.totalEngines || 0}`
                      : "N/A";

                    return (
                      <React.Fragment key={file._id}>
                        <tr
                          className={`border-b border-gray-700/30 hover:bg-gray-800/40 transition-all duration-200 cursor-pointer ${
                            isExpanded ? "bg-gray-800/20" : ""
                          }`}
                          onClick={() => toggleRow(file._id)}
                        >
                          {/* Enhanced File Info with more space */}
                          <td className="py-6 px-8">
                            <div className="flex items-center gap-4">
                              <div className="relative flex-shrink-0">
                                <div className={`p-3 rounded-xl border shadow-lg transition-all duration-200 ${
                                  file.staticAnalysis?.yaraMatches?.length > 0
                                    ? "bg-red-500/20 border-red-400/50"
                                    : file.staticAnalysis
                                    ? "bg-green-500/20 border-green-400/50"
                                    : "bg-blue-500/20 border-blue-400/50"
                                }`}>
                                  {getFileIcon(file)}
                                </div>
                                {file.staticAnalysis?.yaraMatches?.length > 0 && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900"></div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-white mb-1 truncate" title={file.originalName}>
                                  {file.originalName}
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
                                  <span className="truncate">{file.mimetype || "Unknown type"}</span>
                                  {file.staticAnalysis && (
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs flex-shrink-0">
                                      Analyzed
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Enhanced Size with better spacing */}
                          <td className="py-6 px-6">
                            <span className="font-mono text-sm bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700/50 inline-block">
                              {formatSize(file.size)}
                            </span>
                          </td>

                          {/* Enhanced Threat Level with proper width */}
                          <td className="py-6 px-6">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm whitespace-nowrap ${
                              threatLevel.color === "danger"
                                ? "bg-red-500/20 border-red-400/50 text-red-400"
                                : threatLevel.color === "safe"
                                ? "bg-green-500/20 border-green-400/50 text-green-400"
                                : "bg-yellow-500/20 border-yellow-400/50 text-yellow-400"
                            }`}>
                              <threatLevel.icon className="w-4 h-4 flex-shrink-0" />
                              <span className="font-semibold text-sm">
                                {threatLevel.level}
                              </span>
                            </div>
                          </td>

                          {/* Enhanced VirusTotal Status with better layout */}
                          <td className="py-6 px-6">
                            <div className="font-mono text-sm">
                              {vtStatusValue === "loading" ? (
                                <div className="flex items-center gap-2 text-blue-400">
                                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                                  <span className="whitespace-nowrap">Checking...</span>
                                </div>
                              ) : vtStatusValue === "processing" ? (
                                <div className="flex items-center gap-2 text-yellow-400">
                                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                                  <span className="whitespace-nowrap">Processing...</span>
                                </div>
                              ) : vtStatusValue === "error" ? (
                                <div className="flex items-center gap-2 text-red-400">
                                  <XCircle className="w-4 h-4 flex-shrink-0" />
                                  <span className="whitespace-nowrap">Error</span>
                                </div>
                              ) : vtStatusValue === "completed" ? (
                                <div className="flex items-center gap-2 text-green-400">
                                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                  <span className="whitespace-nowrap">Completed</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-gray-400">
                                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                  <span className="whitespace-nowrap">Not scanned</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Enhanced Hash with proper width */}
                          <td className="py-6 px-6">
                            {file.hash ? (
                              <div className="font-mono text-xs bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700/50 max-w-[140px]">
                                <span title={file.hash} className="text-gray-300 block truncate">
                                  {file.hash.substring(0, 16)}...
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">N/A</span>
                            )}
                          </td>

                          {/* Enhanced Upload Time */}
                          <td className="py-6 px-6">
                            <div className="flex items-center gap-2 text-sm text-gray-300 whitespace-nowrap">
                              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span>
                                {new Date(
                                  file.uploadedAt || file.createdAt || Date.now()
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </td>

                          {/* Enhanced Actions with proper spacing */}
                          <td className="py-6 px-8">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnalyze(file._id);
                                }}
                                disabled={analyzingId === file._id}
                                className="btn btn-primary text-xs px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
                                title="Run static and dynamic analysis"
                              >
                                {analyzingId === file._id ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Analyzing
                                  </>
                                ) : (
                                  <>
                                    <Activity className="w-3 h-3 mr-2" />
                                    Analyze
                                  </>
                                )}
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(file._id);
                                }}
                                disabled={deletingId === file._id}
                                className="btn btn-danger text-xs px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                title="Delete file"
                              >
                                {deletingId === file._id ? (
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRow(file._id);
                                }}
                                className={`p-2 rounded-lg border transition-all duration-200 shadow-md hover:shadow-lg ${
                                  isExpanded
                                    ? "bg-blue-500/20 border-blue-400/50 text-blue-400"
                                    : "bg-gray-800/50 border-gray-600/50 text-gray-400 hover:border-gray-500/50"
                                }`}
                                title={
                                  isExpanded
                                    ? "Collapse details"
                                    : "Expand details"
                                }
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Enhanced Expanded Row Content */}
                        {isExpanded && (
                          <tr>
                            <td
                              colSpan={7}
                              className="bg-gradient-to-r from-gray-800/20 to-gray-900/40 border-b border-gray-700/30"
                            >
                              <div className="p-8 animate-in slide-in-from-top-4 duration-300">
                                <AnalysisTab
                                  analysis={file.staticAnalysis}
                                  threatIntel={file.threatIntel}
                                  fileId={file._id}
                                  fileHash={file.hash}
                                  fileSize={file.size}
                                  onIntelUpdated={(newIntel) => {
                                    setFiles((prev) =>
                                      prev.map((f) =>
                                        f._id === file._id
                                          ? {
                                              ...f,
                                              threatIntel: {
                                                ...newIntel,
                                              },
                                            }
                                          : f
                                      )
                                    );
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}