// components/VirusTotalReport.jsx
import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, BarChart3, Clock, FileText, Activity, Hash, Calendar } from 'lucide-react';

const VirusTotalReport = ({ analysisData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-50" />
        
        <div className="relative z-10 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-mono">VirusTotal Analysis</h2>
              <p className="text-slate-400 font-mono text-sm">Scanning with multiple security engines...</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-cyan-500/50 rounded-full animate-spin animation-delay-150" />
            </div>
            <div className="text-center space-y-2">
              <div className="text-white font-mono font-medium">Analyzing file security...</div>
              <div className="text-slate-400 font-mono text-sm">This may take a few moments</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-pink-500/5 opacity-50" />
        
        <div className="relative z-10 p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-400/30">
              <Shield className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-mono">VirusTotal Analysis</h2>
              <p className="text-slate-400 font-mono text-sm">No analysis data available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { stats, results, file_info } = analysisData;
  const totalEngines = stats.malicious + stats.suspicious + stats.undetected + stats.clean;
  const detectionRate = ((stats.malicious + stats.suspicious) / totalEngines) * 100;

  const getThreatLevel = (rate) => {
    if (rate === 0) return { level: 'Clean', color: 'emerald', bg: 'emerald-500/10' };
    if (rate < 10) return { level: 'Low Risk', color: 'yellow', bg: 'yellow-500/10' };
    if (rate < 50) return { level: 'Medium Risk', color: 'orange', bg: 'orange-500/10' };
    return { level: 'High Risk', color: 'red', bg: 'red-500/10' };
  };

  const threat = getThreatLevel(detectionRate);

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden backdrop-blur-sm">
      <div className={`absolute inset-0 bg-gradient-to-r from-${threat.color}-500/5 via-${threat.color}-500/3 to-transparent opacity-50`} />
      
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-${threat.color}-500/20 rounded-xl border border-${threat.color}-400/30`}>
              <Shield className={`w-8 h-8 text-${threat.color}-400`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-mono">Security Analysis Report</h2>
              <p className="text-slate-400 font-mono text-sm">
                Comprehensive analysis from {totalEngines} security engines
              </p>
            </div>
          </div>
          
          <div className={`px-4 py-2 bg-${threat.bg} border border-${threat.color}-400/30 rounded-lg`}>
            <div className={`text-${threat.color}-400 font-mono font-medium text-sm`}>
              {threat.level}
            </div>
          </div>
        </div>

        {/* Detection Summary Card */}
        <div className="bg-slate-800/50 rounded-2xl p-8 mb-8 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white font-mono">Detection Summary</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Detection Rate Circle */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgb(51 65 85)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={detectionRate > 0 ? `rgb(239 68 68)` : `rgb(34 197 94)`}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - detectionRate / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-3xl font-bold font-mono ${detectionRate > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {detectionRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-400 font-mono">Detection</div>
                </div>
              </div>
            </div>

            {/* Detection Bars Visualization */}
            <div className="flex items-center justify-center">
              <div className="flex items-end gap-1 h-24">
                {[...Array(Math.min(totalEngines, 20))].map((_, i) => {
                  let barClass = 'w-3 rounded-t-sm transition-all duration-500 ease-out';
                  let barHeight = 'h-4';
                  
                  if (i < stats.malicious) {
                    barClass += ' bg-red-500 shadow-lg shadow-red-500/30';
                    barHeight = 'h-20';
                  } else if (i < stats.malicious + stats.suspicious) {
                    barClass += ' bg-yellow-500 shadow-lg shadow-yellow-500/30';
                    barHeight = 'h-12';
                  } else {
                    barClass += ' bg-emerald-500 shadow-lg shadow-emerald-500/30';
                    barHeight = 'h-6';
                  }

                  return (
                    <div
                      key={i}
                      className={`${barClass} ${barHeight}`}
                      style={{ animationDelay: `${i * 50}ms` }}
                    />
                  );
                })}
                {totalEngines > 20 && (
                  <div className="text-slate-400 font-mono text-xs ml-2">
                    +{totalEngines - 20} more
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-400/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300 font-mono">Malicious</span>
                </div>
                <span className="text-red-400 font-mono font-bold text-lg">{stats.malicious}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-400/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-300 font-mono">Suspicious</span>
                </div>
                <span className="text-yellow-400 font-mono font-bold text-lg">{stats.suspicious}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-400/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300 font-mono">Clean</span>
                </div>
                <span className="text-emerald-400 font-mono font-bold text-lg">{stats.clean + stats.undetected}</span>
              </div>
            </div>
          </div>
        </div>

        {/* File Information */}
        {file_info && (
          <div className="bg-slate-800/50 rounded-2xl p-8 mb-8 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold text-white font-mono">File Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <div className="text-sm text-slate-400 font-mono">File Type</div>
                </div>
                <div className="text-white font-mono font-medium">{file_info.file_type || 'Unknown'}</div>
              </div>
              
              <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <div className="text-sm text-slate-400 font-mono">File Size</div>
                </div>
                <div className="text-white font-mono font-medium">
                  {file_info.size ? `${(file_info.size / 1024).toFixed(2)} KB` : 'Unknown'}
                </div>
              </div>
              
              <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4 text-blue-400" />
                  <div className="text-sm text-slate-400 font-mono">MD5 Hash</div>
                </div>
                <div className="text-white font-mono text-xs break-all">{file_info.md5 || 'N/A'}</div>
              </div>
              
              <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4 text-blue-400" />
                  <div className="text-sm text-slate-400 font-mono">SHA-256</div>
                </div>
                <div className="text-white font-mono text-xs break-all">{file_info.sha256 || 'N/A'}</div>
              </div>
              
              <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <div className="text-sm text-slate-400 font-mono">First Seen</div>
                </div>
                <div className="text-white font-mono text-sm">{file_info.first_seen || 'Unknown'}</div>
              </div>
              
              <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <div className="text-sm text-slate-400 font-mono">Last Seen</div>
                </div>
                <div className="text-white font-mono text-sm">{file_info.last_seen || 'Unknown'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Engine Results */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white font-mono">Security Engine Results</h3>
            <div className="px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30">
              <span className="text-blue-400 font-mono text-sm">{totalEngines} engines</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results && Object.entries(results).map(([engine, result], index) => (
              <div 
                key={engine} 
                className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200 hover:bg-slate-700/50"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-mono font-medium text-sm truncate">{engine}</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-mono font-medium ${
                    result.category === 'malicious' 
                      ? 'bg-red-500/20 text-red-300 border border-red-400/30' 
                      : result.category === 'suspicious'
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  }`}>
                    {result.category === 'malicious' ? 'Threat' : 
                     result.category === 'suspicious' ? 'Suspicious' : 'Clean'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {result.category === 'malicious' && (
                    <div className="flex items-start gap-2 text-red-300">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="text-sm font-mono break-words">
                        {result.result || 'Threat detected'}
                      </div>
                    </div>
                  )}
                  {result.category === 'undetected' && (
                    <div className="flex items-center gap-2 text-emerald-300">
                      <CheckCircle className="w-4 h-4" />
                      <div className="text-sm font-mono">No threats detected</div>
                    </div>
                  )}
                  {result.category === 'type-unsupported' && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <XCircle className="w-4 h-4" />
                      <div className="text-sm font-mono">Unsupported file type</div>
                    </div>
                  )}
                  
                  <div className="text-xs text-slate-500 font-mono pt-2 border-t border-slate-600/30">
                    v{result.engine_version || 'Unknown'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirusTotalReport;