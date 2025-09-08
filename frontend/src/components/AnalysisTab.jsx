// AnalysisTab.jsx (Fixed for different IOC data formats)
import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, FileText, Cpu, Hash, Terminal } from "lucide-react";

export default function AnalysisTab({ analysis }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (!analysis) return (
    <div className="text-center py-6 text-kali-gray-400 font-mono">
      <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50 text-kali-neonblue" />
      <p>No analysis data available. Click "Analyze" to start.</p>
    </div>
  );

  const getRiskLevel = (entropy) => {
    if (entropy > 7.0) return { level: "HIGH", color: "text-kali-neonred" };
    if (entropy > 6.0) return { level: "MEDIUM", color: "text-yellow-400" };
    return { level: "LOW", color: "text-kali-neongreen" };
  };

  // Function to detect IOC type based on value
  const detectIocType = (value) => {
    if (!value) return "Unknown";
    
    // IP address detection
    const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(value)) return "IP Address";
    
    // Domain detection
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (domainRegex.test(value)) return "Domain";
    
    // URL detection
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    if (urlRegex.test(value)) return "URL";
    
    // Executable detection
    const exeRegex = /\.(exe|dll|bat|cmd|ps1|sh)$/i;
    if (exeRegex.test(value)) return "Executable";
    
    // SQL injection pattern
    const sqlRegex = /(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER)/i;
    if (sqlRegex.test(value)) return "SQL Command";
    
    // PowerShell detection
    if (value.toLowerCase().includes("powershell")) return "PowerShell";
    
    // Default type
    return "Suspicious String";
  };

  // Process IOCs based on their format
  const processedIocs = analysis.iocs ? analysis.iocs.map(ioc => {
    // If it's already an object with type and value, use it as is
    if (typeof ioc === 'object' && ioc !== null) {
      return {
        type: ioc.type || detectIocType(ioc.value),
        value: ioc.value || String(ioc),
        context: ioc.context
      };
    }
    
    // If it's a string, detect its type
    return {
      type: detectIocType(ioc),
      value: ioc,
      context: "Extracted from file strings"
    };
  }) : [];

  const risk = getRiskLevel(analysis.entropy);

  return (
    <div className="border border-kali-purple rounded-xl p-4 bg-kali-gray-700 mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="font-semibold text-lg w-full text-left flex items-center justify-between text-white font-mono"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-kali-neonblue" />
          <span>Static Analysis</span>
          {analysis.yaraMatches?.length > 0 && (
            <span className="text-xs px-2 py-1 bg-kali-gray-800 text-kali-neonred rounded-full flex items-center gap-1 border border-kali-neonred pulse-alert">
              <AlertTriangle className="w-3 h-3" />
              {analysis.yaraMatches.length} threat{analysis.yaraMatches.length !== 1 ? 's' : ''} detected
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-kali-neonblue" /> : <ChevronDown className="w-5 h-5 text-kali-neonblue" />}
      </button>

      {open && (
        <div className="mt-4">
          {/* Tab Navigation */}
          <div className="flex border-b border-kali-purple mb-4">
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === "overview" ? "text-kali-neonblue border-b-2 border-kali-neonblue" : "text-kali-gray-400 hover:text-kali-gray-300"} font-mono`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === "strings" ? "text-kali-neonblue border-b-2 border-kali-neonblue" : "text-kali-gray-400 hover:text-kali-gray-300"} font-mono`}
              onClick={() => setActiveTab("strings")}
            >
              Strings ({analysis.strings?.length || 0})
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === "iocs" ? "text-kali-neonblue border-b-2 border-kali-neonblue" : "text-kali-gray-400 hover:text-kali-gray-300"} font-mono`}
              onClick={() => setActiveTab("iocs")}
            >
              IOCs ({processedIocs.length || 0})
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === "yara" ? "text-kali-neonblue border-b-2 border-kali-neonblue" : "text-kali-gray-400 hover:text-kali-gray-300"} font-mono`}
              onClick={() => setActiveTab("yara")}
            >
              YARA Rules ({analysis.yaraMatches?.length || 0})
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-kali-gray-800 rounded-lg p-4 border border-kali-purple">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-semibold text-kali-neonblue mb-3 flex items-center gap-2 font-mono">
                    <FileText className="w-4 h-4" />
                    File Properties
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-kali-gray-400 font-mono">File Size:</span>
                      <span className="text-white font-mono">{(analysis.fileSize / 1024).toFixed(2)} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-kali-gray-400 font-mono">Entropy:</span>
                      <span className={`font-mono ${risk.color}`}>
                        {analysis.entropy.toFixed(4)} ({risk.level})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-kali-gray-400 font-mono">Architecture:</span>
                      <span className="text-white font-mono">{analysis.architecture || "Unknown"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold text-kali-neonblue mb-3 flex items-center gap-2 font-mono">
                    <Hash className="w-4 h-4" />
                    Hashes
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-kali-gray-400 font-mono">MD5:</span>
                      <span className="text-kali-neongreen font-mono text-xs">{analysis.md5}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-kali-gray-400 font-mono">SHA-1:</span>
                      <span className="text-kali-neongreen font-mono text-xs">{analysis.sha1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-kali-gray-400 font-mono">SHA-256:</span>
                      <span className="text-kali-neongreen font-mono text-xs">{analysis.sha256}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "strings" && (
              <div>
                <h3 className="text-md font-semibold text-kali-neonblue mb-3 font-mono">Extracted Strings</h3>
                <div className="bg-kali-black p-4 rounded-lg border border-kali-purple overflow-auto max-h-64">
                  <pre className="text-kali-neongreen font-mono text-sm">
                    {analysis.strings?.slice(0, 200).join("\n") || "No strings extracted"}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === "iocs" && (
              <div>
                <h3 className="text-md font-semibold text-kali-neonblue mb-3 font-mono">Indicators of Compromise</h3>
                {processedIocs.length > 0 ? (
                  <div className="space-y-3">
                    {processedIocs.map((ioc, index) => (
                      <div key={index} className="p-3 bg-kali-gray-700 rounded-lg border border-kali-purple">
                        <div className="font-mono text-sm text-kali-neonblue">{ioc.type}</div>
                        <div className="font-mono text-kali-neongreen text-xs break-all">{ioc.value}</div>
                        {ioc.context && (
                          <div className="font-mono text-kali-gray-400 text-xs mt-1">{ioc.context}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50 text-kali-neonblue" />
                    <p className="text-kali-gray-400 font-mono">No IOCs detected</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "yara" && (
              <div>
                <h3 className="text-md font-semibold text-kali-neonblue mb-3 font-mono">YARA Rule Matches</h3>
                {analysis.yaraMatches?.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.yaraMatches.map((match, index) => (
                      <div key={index} className="p-4 bg-kali-gray-700 rounded-lg border border-kali-neonred">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-kali-neonred" />
                          <span className="font-semibold text-kali-neonred font-mono">{match.rule}</span>
                        </div>
                        <div className="text-sm text-kali-neongreen font-mono mb-2">{match.description}</div>
                        {match.tags && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {match.tags.map((tag, i) => (
                              <span key={i} className="px-2 py-1 bg-kali-gray-800 text-kali-neongreen rounded text-xs font-mono">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {match.strings && (
                          <div>
                            <div className="text-xs text-kali-gray-400 mb-1 font-mono">Matched strings:</div>
                            <div className="space-y-1">
                              {match.strings.slice(0, 5).map((str, i) => (
                                <div key={i} className="p-2 bg-kali-black rounded text-xs font-mono text-kali-neongreen">
                                  {str}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50 text-kali-neonblue" />
                    <p className="text-kali-gray-400 font-mono">No YARA rule matches</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

