
// ThreatIntelTab.jsx - Fixed visibility issues
// ThreatIntelTab.jsx - Enhanced UI with improved styling
// ThreatIntelTab.jsx - Enhanced UI with blur functionality removed
import React, { useState, useEffect } from "react";
import { 
  Shield, 
  RefreshCw, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Clock,
  FileText,
  Activity,
  Hash,
  BarChart3
} from "lucide-react";
import { updateThreatIntel } from "../api";

export default function ThreatIntelTab({ threatIntel, fileId, fileHash, onIntelUpdated }) {
  const [vtData, setVtData] = useState(threatIntel?.vtReport || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setVtData(threatIntel?.vtReport || null);
  }, [threatIntel]);

  const refresh = async (e) => {
    if (e) e.stopPropagation();
    setLoading(true);

    try {
      const res = await updateThreatIntel(fileId);
      const newVtData = res?.threatIntel?.vtReport;
      if (!newVtData) {
        throw new Error("No vtReport found in response");
      }
      
      setVtData(newVtData);
      
      if (onIntelUpdated) {
        onIntelUpdated({
          ...res.threatIntel,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Failed to refresh VT:", err);
      alert("Failed to refresh VirusTotal data: " + (err?.response?.data?.error || err?.message));
    } finally {
      setLoading(false);
    }
  };

  if (!threatIntel || (!threatIntel.vtReport && !vtData)) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700/50 shadow-2xl">
        <div className="p-12 text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
              <Shield className="w-10 h-10 text-blue-400" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-30"></div>
          </div>
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            No Threat Intelligence
          </h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Analyze this file with VirusTotal to get comprehensive threat intelligence data
          </p>
          <button 
            onClick={refresh} 
            disabled={loading} 
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing with VirusTotal...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Analyze with VirusTotal
              </>
            )}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/0 via-white/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>
        </div>
      </div>
    );
  }

  const displayData = threatIntel?.vtReport || vtData;
  const detectionPercent = displayData.totalEngines ? Math.round((displayData.malicious / displayData.totalEngines) * 100) : 0;
  const isMalicious = displayData.malicious > 0;
  const detectionRatio = `${displayData.malicious || 0}/${displayData.totalEngines || 0}`;

  const getPrimaryThreatType = () => {
    if (!displayData.maliciousEngines || Object.keys(displayData.maliciousEngines).length === 0) {
      return null;
    }
    
    const detections = Object.values(displayData.maliciousEngines);
    const threatTypes = detections.map(d => d.result?.toLowerCase()).filter(Boolean);
    
    if (threatTypes.some(t => t.includes('trojan'))) return { type: 'Trojan', color: 'danger' };
    if (threatTypes.some(t => t.includes('malware'))) return { type: 'Malware', color: 'danger' };
    if (threatTypes.some(t => t.includes('virus'))) return { type: 'Virus', color: 'danger' };
    if (threatTypes.some(t => t.includes('adware'))) return { type: 'Adware', color: 'warning' };
    if (threatTypes.some(t => t.includes('suspicious'))) return { type: 'Suspicious', color: 'warning' };
    if (threatTypes.some(t => t.includes('pup') || t.includes('potentially unwanted'))) return { type: 'PUP', color: 'warning' };
    
    const mostCommon = threatTypes[0];
    return mostCommon ? { type: mostCommon.charAt(0).toUpperCase() + mostCommon.slice(1), color: 'danger' } : null;
  };

  const primaryThreat = getPrimaryThreatType();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900/20 to-slate-900 rounded-xl border border-slate-700/50 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                VirusTotal Analysis
              </h2>
              <p className="text-slate-400 mt-1">
                Last updated: {displayData.lastAnalysisDate ? 
                  new Date(displayData.lastAnalysisDate * 1000).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={refresh} 
              disabled={loading} 
              className="group relative p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-all duration-200 disabled:opacity-50"
              title="Refresh VirusTotal data"
            >
              <RefreshCw className={`w-5 h-5 text-slate-300 group-hover:text-white transition-transform duration-200 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <a 
              href={displayData.permalink || `https://www.virustotal.com/gui/file/${fileHash}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative p-3 bg-blue-600 hover:bg-blue-500 border border-blue-500 rounded-lg transition-all duration-200"
              title="View full report on VirusTotal"
            >
              <ExternalLink className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Detection Summary */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-8 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Detection Circle */}
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div 
                  className="w-32 h-32 rounded-full border-4 flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: `conic-gradient(${
                      isMalicious ? '#ef4444' : '#22c55e'
                    } 0% ${detectionPercent}%, #1e293b ${detectionPercent}% 100%)`,
                    borderColor: '#334155'
                  }}
                >
                  <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center border-2 border-slate-700">
                    <span 
                      className="text-3xl font-bold"
                      style={{ color: isMalicious ? '#ef4444' : '#22c55e' }}
                    >
                      {displayData.malicious || 0}
                    </span>
                  </div>
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-sm opacity-50"></div>
              </div>
              <div className="space-y-2">
                <div 
                  className="text-lg font-semibold"
                  style={{ color: isMalicious ? '#ef4444' : '#22c55e' }}
                >
                  {isMalicious ? 'MALICIOUS' : 'CLEAN'}
                </div>
                <div className="text-sm text-slate-400">Detection Status</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="text-2xl font-bold text-white">{detectionRatio}</div>
                <div className="text-sm text-slate-400 mt-1">Security Vendors</div>
              </div>
              <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="text-2xl font-bold text-red-400">{displayData.malicious || 0}</div>
                <div className="text-sm text-slate-400 mt-1">Malicious</div>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-400">{displayData.suspicious || 0}</div>
                <div className="text-sm text-slate-400 mt-1">Suspicious</div>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="text-2xl font-bold text-slate-400">{displayData.undetected || 0}</div>
                <div className="text-sm text-slate-400 mt-1">Undetected</div>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="text-2xl font-bold text-green-400">{displayData.harmless || 0}</div>
                <div className="text-sm text-slate-400 mt-1">Harmless</div>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="text-2xl font-bold text-blue-400">
                  {displayData.size ? `${(displayData.size / 1024).toFixed(1)}KB` : 'N/A'}
                </div>
                <div className="text-sm text-slate-400 mt-1">File Size</div>
              </div>
            </div>
          </div>

          {/* Threat Classification */}
          <div className="mt-8 text-center">
            {primaryThreat ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="font-semibold text-red-400">{primaryThreat.type} Detected</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-semibold text-green-400">No Threats Detected</span>
              </div>
            )}
          </div>
        </div>

        {/* File Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700/50 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <h3 className="flex items-center gap-3 text-lg font-semibold text-white">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                File Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                <span className="text-slate-400 font-medium">File Type</span>
                <span className="text-white font-mono text-sm bg-slate-800 px-2 py-1 rounded">
                  {displayData.typeDescription || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                <span className="text-slate-400 font-medium">Size</span>
                <span className="text-white font-mono text-sm">
                  {displayData.size ? `${displayData.size.toLocaleString()} bytes` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-start py-2">
                <span className="text-slate-400 font-medium">Name</span>
                <span className="text-white text-sm text-right max-w-xs break-all">
                  {displayData.meaningfulName || displayData.names?.[0] || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700/50 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-green-500/10 to-blue-500/10">
              <h3 className="flex items-center gap-3 text-lg font-semibold text-white">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Hash className="w-5 h-5 text-green-400" />
                </div>
                File Hashes
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {displayData.md5 && (
                <div>
                  <div className="text-slate-400 text-sm mb-1">MD5</div>
                  <div className="font-mono text-xs bg-slate-800 p-2 rounded border border-slate-700 text-green-400 break-all">
                    {displayData.md5}
                  </div>
                </div>
              )}
              {displayData.sha1 && (
                <div>
                  <div className="text-slate-400 text-sm mb-1">SHA1</div>
                  <div className="font-mono text-xs bg-slate-800 p-2 rounded border border-slate-700 text-blue-400 break-all">
                    {displayData.sha1}
                  </div>
                </div>
              )}
              {displayData.sha256 && (
                <div>
                  <div className="text-slate-400 text-sm mb-1">SHA256</div>
                  <div className="font-mono text-xs bg-slate-800 p-2 rounded border border-slate-700 text-purple-400 break-all">
                    {displayData.sha256}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Timeline */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700/50 shadow-xl">
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
            <h3 className="flex items-center gap-3 text-lg font-semibold text-white">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              Analysis Timeline
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-sm text-slate-400 mb-1">First Submitted</div>
                <div className="text-sm font-semibold text-white">
                  {displayData.firstSubmissionDate ? 
                    new Date(displayData.firstSubmissionDate * 1000).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                <RefreshCw className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-sm text-slate-400 mb-1">Last Analysis</div>
                <div className="text-sm font-semibold text-white">
                  {displayData.lastAnalysisDate ? 
                    new Date(displayData.lastAnalysisDate * 1000).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                <Info className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-sm text-slate-400 mb-1">Times Submitted</div>
                <div className="text-sm font-semibold text-white">
                  {displayData.timesSubmitted || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Threat Detections */}
        {displayData.maliciousEngines && Object.keys(displayData.maliciousEngines).length > 0 && (
          <div className="bg-gradient-to-br from-red-900/20 via-slate-900 to-slate-900 rounded-xl border border-red-500/30 shadow-xl">
            <div className="p-6 border-b border-red-500/30 bg-gradient-to-r from-red-500/10 to-orange-500/10">
              <h3 className="flex items-center gap-3 text-lg font-semibold text-red-400">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                Threat Detections ({Object.keys(displayData.maliciousEngines).length})
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {Object.entries(displayData.maliciousEngines).map(([engine, detection]) => (
                  <div key={engine} className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/15 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-500/20 rounded-full">
                        <XCircle className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{engine}</div>
                        <div className="text-sm text-red-300">{detection.result}</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                      {detection.category || 'malicious'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}