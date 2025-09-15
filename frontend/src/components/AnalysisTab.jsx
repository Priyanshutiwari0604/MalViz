// //----------------------------------------------------------------------------
// // AnalysisTab.jsx - Enhanced UI with improved styling
// //----------------------------------------------------------------------------
// // AnalysisTab.jsx - Enhanced UI with improved styling and fixed file size
// // AnalysisTab.jsx - Enhanced UI with hash values removed from overview
// // AnalysisTab.jsx - Fixed file type and architecture detection
// // AnalysisTab.jsx - Fixed file type and architecture detection
// import React, { useState } from "react";
// import {
//   Cpu,
//   ChevronUp,
//   ChevronDown,
//   AlertTriangle,
//   FileText,
//   Terminal,
//   Search,
//   BarChart3,
//   Shield,
//   Activity,
//   Copy,
//   Info,
//   CheckCircle,
//   XCircle,
// } from "lucide-react";
// import ThreatIntelTab from "./ThreatIntelTab";

// export default function AnalysisTab({
//   analysis,
//   threatIntel,
//   fileId,
//   fileHash,
//   fileName, // Add fileName prop to help detect file type
//   fileSize,
//   onIntelUpdated,
// }) {
//   const [open, setOpen] = useState(true);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [copiedHash, setCopiedHash] = useState("");

//   // Helper function to detect file type from filename if analysis doesn't provide it
//   const detectFileType = () => {
//     if (analysis?.fileType && analysis.fileType !== 'Unknown') {
//       return analysis.fileType;
//     }

//     if (fileName) {
//       const extension = fileName.split('.').pop()?.toLowerCase();
//       const typeMap = {
//         'exe': 'Executable (PE)',
//         'dll': 'Dynamic Link Library',
//         'pdf': 'Portable Document Format',
//         'doc': 'Microsoft Word Document',
//         'docx': 'Microsoft Word Document',
//         'xls': 'Microsoft Excel',
//         'xlsx': 'Microsoft Excel',
//         'zip': 'ZIP Archive',
//         'rar': 'RAR Archive',
//         'txt': 'Text File',
//         'js': 'JavaScript',
//         'html': 'HTML Document',
//         'htm': 'HTML Document',
//         'php': 'PHP Script',
//         'py': 'Python Script',
//         'jar': 'Java Archive',
//         'apk': 'Android Package',
//         'msi': 'Windows Installer',
//         'bat': 'Batch File',
//         'cmd': 'Command File',
//         'ps1': 'PowerShell Script',
//         'sh': 'Shell Script',
//         'iso': 'ISO Image',
//         'img': 'Disk Image'
//       };

//       return typeMap[extension] || `${extension?.toUpperCase()} File`;
//     }

//     return 'Unknown';
//   };

//   // Helper function to detect architecture
//   const detectArchitecture = () => {
//     if (analysis?.architecture && analysis.architecture !== 'Unknown' && analysis.architecture !== 'N/A') {
//       return analysis.architecture;
//     }

//     // Try to infer from file type or other analysis data
//     const fileType = detectFileType();

//     if (fileType.includes('PE') || fileType.includes('Executable')) {
//       // For PE files, you might have magic bytes or other indicators
//       // This is a fallback - ideally your static analysis should detect this
//       return analysis?.is64bit ? 'x64' : analysis?.is32bit ? 'x86' : 'Unknown';
//     }

//     if (fileType.includes('Android')) {
//       return 'ARM/ARM64';
//     }

//     return 'N/A';
//   };

//   if (!analysis) {
//     return (
//       <div className="card">
//         <div className="card-content text-center py-12">
//           <div className="mb-6">
//             <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Terminal className="w-8 h-8 text-blue-400" />
//             </div>
//           </div>
//           <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
//             No Static Analysis Available
//           </h3>
//           <p className="text-secondary mb-8 max-w-md mx-auto leading-relaxed">
//             Run static analysis to generate detailed results and identify potential security threats
//           </p>
//           <button className="btn btn-primary px-8 py-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
//             <Cpu className="w-4 h-4 mr-2" />
//             Run Analysis
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Process IOCs
//   const detectIocType = (value) => {
//     if (!value) return "Unknown";
//     const patterns = {
//       ip: /^(?:\d{1,3}\.){3}\d{1,3}$/,
//       url: /^(https?:\/\/)/i,
//       domain: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
//       email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//       file: /\.(exe|dll|bat|ps1|sh|scr|com|pif|jar)$/i,
//       registry: /^HKEY_/i,
//       crypto: /^[a-fA-F0-9]{32,}$/,
//     };

//     for (const [type, pattern] of Object.entries(patterns)) {
//       if (pattern.test(value)) return type.toUpperCase();
//     }

//     return "String";
//   };

//   const processedIocs = (analysis.iocs || []).map((ioc) => {
//     if (typeof ioc === "string") {
//       return {
//         value: ioc,
//         type: detectIocType(ioc),
//         context: "Extracted from file",
//       };
//     }
//     return {
//       value: ioc.value || String(ioc),
//       type: ioc.type || detectIocType(ioc.value),
//       context: ioc.context || "Static analysis",
//     };
//   });

//   const yaraMatches = analysis.yaraMatches || [];
//   const entropy = analysis.entropy || 0;

//   const getRiskLevel = (entropy) => {
//     if (entropy > 7.0)
//       return {
//         level: "HIGH",
//         color: "danger",
//         description: "Highly packed or encrypted",
//       };
//     if (entropy > 6.0)
//       return {
//         level: "MEDIUM",
//         color: "warning",
//         description: "Moderately packed",
//       };
//     return { level: "LOW", color: "safe", description: "Normal entropy" };
//   };

//   const risk = getRiskLevel(entropy);

//   // Calculate threat score
//   const calculateThreatScore = () => {
//     let score = 0;
//     if (yaraMatches.length > 0) score += 40;
//     if (processedIocs.length > 10) score += 30;
//     else if (processedIocs.length > 0)
//       score += Math.min(processedIocs.length * 3, 25);
//     if (entropy > 7.0) score += 25;
//     else if (entropy > 6.0) score += 15;

//     // Add VirusTotal score
//     if (threatIntel?.vtReport) {
//       const vtScore =
//         (threatIntel.vtReport.malicious || 0) /
//         (threatIntel.vtReport.totalEngines || 1);
//       score += Math.min(vtScore * 40, 40);
//     }

//     return Math.min(score, 100);
//   };

//   const threatScore = calculateThreatScore();

//   // Copy hash to clipboard
//   const copyHash = (hashType, hashValue) => {
//     navigator.clipboard.writeText(hashValue);
//     setCopiedHash(hashType);
//     setTimeout(() => setCopiedHash(""), 2000);
//   };

//   // Format file size helper
//   const formatSize = (bytes) => {
//     if (!bytes || bytes === 0) return "0 B";
//     const sizes = ["B", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(1024));
//     return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
//   };

//   // Get the detected file type and architecture
//   const detectedFileType = detectFileType();
//   const detectedArchitecture = detectArchitecture();

//   return (
//     <div className="card overflow-hidden shadow-xl border border-gray-700/50">
//       {/* Enhanced Header */}
//       <div
//         className="card-header cursor-pointer bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-300"
//         onClick={() => setOpen(!open)}
//       >
//         <div className="flex items-center justify-between w-full">
//           <div className="flex items-center gap-4">
//             <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
//               <Cpu className="w-5 h-5 text-blue-400" />
//             </div>
//             <div>
//               <h3 className="text-lg font-bold text-white mb-1">
//                 Static Analysis Results
//               </h3>
//               <p className="text-xs text-gray-400">
//                 Comprehensive file analysis and threat assessment
//               </p>
//             </div>
//             {yaraMatches.length > 0 && (
//               <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 px-3 py-1.5 rounded-full">
//                 <AlertTriangle className="w-3 h-3 text-red-400" />
//                 <span className="text-red-400 text-sm font-semibold">
//                   {yaraMatches.length} YARA{" "}
//                   {yaraMatches.length === 1 ? "match" : "matches"}
//                 </span>
//               </div>
//             )}
//           </div>
//           <div className="p-2 rounded-lg bg-gray-700/30 hover:bg-gray-600/30 transition-colors">
//             {open ? (
//               <ChevronUp className="w-5 h-5 text-gray-400" />
//             ) : (
//               <ChevronDown className="w-5 h-5 text-gray-400" />
//             )}
//           </div>
//         </div>
//       </div>

//       {open && (
//         <div className="card-content">
//           {/* Enhanced Summary Section */}
//           <div className="mb-8 p-6 bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl border border-gray-700/50 shadow-inner">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {/* Enhanced Threat Score */}
//               <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-800/30 rounded-xl border border-gray-700/30">
//                 <div className="relative w-20 h-20 mb-4">
//                   <div
//                     className="w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-lg"
//                     style={{
//                       background: `conic-gradient(${
//                         threatScore > 70
//                           ? "#ef4444"
//                           : threatScore > 40
//                           ? "#f59e0b"
//                           : "#10b981"
//                       } 0% ${threatScore}%, #1f2937 ${threatScore}% 100%)`,
//                       borderColor: "#1f2937",
//                     }}
//                   >
//                     <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center">
//                       <span
//                         className={`text-lg font-bold ${
//                           threatScore > 70
//                             ? "text-red-400"
//                             : threatScore > 40
//                             ? "text-yellow-400"
//                             : "text-green-400"
//                         }`}
//                       >
//                         {threatScore}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <div
//                   className={`text-sm font-bold mb-1 ${
//                     threatScore > 70
//                       ? "text-red-400"
//                       : threatScore > 40
//                       ? "text-yellow-400"
//                       : "text-green-400"
//                   }`}
//                 >
//                   {threatScore > 70
//                     ? "High Risk"
//                     : threatScore > 40
//                     ? "Medium Risk"
//                     : "Low Risk"}
//                 </div>
//                 <div className="text-xs text-gray-400">Threat Score</div>
//               </div>

//               {/* Enhanced File Info */}
//               <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/30">
//                 <h4 className="text-sm font-bold mb-4 flex items-center text-blue-400">
//                   <FileText className="w-4 h-4 mr-2" />
//                   File Information
//                 </h4>
//                 <div className="space-y-3 text-sm">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-400">Size:</span>
//                     <span className="font-mono bg-gray-700/50 px-2 py-1 rounded text-white">
//                       {formatSize(fileSize)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-400">Type:</span>
//                     <span className="font-mono bg-gray-700/50 px-2 py-1 rounded text-white">
//                       {detectedFileType}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-400">Arch:</span>
//                     <span className="font-mono bg-gray-700/50 px-2 py-1 rounded text-white">
//                       {detectedArchitecture}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-400">Entropy:</span>
//                     <span
//                       className={`font-mono px-2 py-1 rounded ${
//                         risk.color === "danger"
//                           ? "bg-red-500/20 text-red-400"
//                           : risk.color === "warning"
//                           ? "bg-yellow-500/20 text-yellow-400"
//                           : "bg-green-500/20 text-green-400"
//                       }`}
//                     >
//                       {entropy.toFixed(2)} ({risk.level})
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Enhanced Detection Summary */}
//               <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/30">
//                 <h4 className="text-sm font-bold mb-4 flex items-center text-green-400">
//                   <Shield className="w-4 h-4 mr-2" />
//                   Detection Summary
//                 </h4>
//                 <div className="space-y-3 text-sm">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-400">YARA Rules:</span>
//                     <div className="flex items-center gap-2">
//                       {yaraMatches.length > 0 ? (
//                         <XCircle className="w-4 h-4 text-red-400" />
//                       ) : (
//                         <CheckCircle className="w-4 h-4 text-green-400" />
//                       )}
//                       <span
//                         className={`font-mono ${
//                           yaraMatches.length > 0
//                             ? "text-red-400"
//                             : "text-green-400"
//                         }`}
//                       >
//                         {yaraMatches.length} detected
//                       </span>
//                     </div>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-400">Indicators:</span>
//                     <div className="flex items-center gap-2">
//                       {processedIocs.length > 5 ? (
//                         <XCircle className="w-4 h-4 text-red-400" />
//                       ) : processedIocs.length > 0 ? (
//                         <AlertTriangle className="w-4 h-4 text-yellow-400" />
//                       ) : (
//                         <CheckCircle className="w-4 h-4 text-green-400" />
//                       )}
//                       <span
//                         className={`font-mono ${
//                           processedIocs.length > 5
//                             ? "text-red-400"
//                             : processedIocs.length > 0
//                             ? "text-yellow-400"
//                             : "text-green-400"
//                         }`}
//                       >
//                         {processedIocs.length} found
//                       </span>
//                     </div>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-400">Strings:</span>
//                     <span className="font-mono text-gray-300">
//                       {analysis.strings?.length || 0} extracted
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Enhanced Tab Navigation */}
//           <div className="flex flex-wrap gap-3 mb-8">
//             {[
//               { id: "overview", icon: FileText, label: "Overview" },
//               {
//                 id: "strings",
//                 icon: Terminal,
//                 label: "Strings",
//                 count: analysis.strings?.length || 0,
//               },
//               {
//                 id: "iocs",
//                 icon: Search,
//                 label: "Indicators",
//                 count: processedIocs.length,
//               },
//               {
//                 id: "yara",
//                 icon: AlertTriangle,
//                 label: "YARA",
//                 count: yaraMatches.length,
//               },
//               { id: "threatintel", icon: Shield, label: "Threat Intel" },
//             ].map((tab) => (
//               <button
//                 key={tab.id}
//                 className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border ${
//                   activeTab === tab.id
//                     ? "bg-blue-500/20 border-blue-400/50 text-blue-400 shadow-lg"
//                     : "bg-gray-800/40 border-gray-700/50 text-gray-400 hover:bg-gray-700/40 hover:text-gray-300"
//                 }`}
//                 onClick={() => setActiveTab(tab.id)}
//               >
//                 <tab.icon className="w-4 h-4" />
//                 {tab.label}
//                 {tab.count !== undefined && (
//                   <span
//                     className={`px-2 py-0.5 text-xs font-bold rounded-full ${
//                       activeTab === tab.id
//                         ? "bg-blue-400/30 text-blue-300"
//                         : "bg-gray-700/50 text-gray-400"
//                     }`}
//                   >
//                     {tab.count}
//                   </span>
//                 )}
//               </button>
//             ))}
//           </div>

//           {/* Tab Content */}
//           <div className="tab-content">
//             {activeTab === "overview" && (
//               <div className="grid grid-cols-1 gap-8">
//                 {/* Enhanced File Properties - Now taking full width */}
//                 <div className="card bg-gradient-to-br from-gray-800/30 to-gray-900/50 border-gray-700/30">
//                   <div className="card-header bg-gray-800/40 border-b border-gray-700/50">
//                     <h4 className="card-title text-blue-400">
//                       <FileText className="w-4 h-4" />
//                       File Properties
//                     </h4>
//                   </div>
//                   <div className="card-content">
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                       {[
//                         {
//                           label: "File Size",
//                           value: formatSize(fileSize),
//                           icon: BarChart3,
//                         },
//                         {
//                           label: "File Type",
//                           value: detectedFileType,
//                           icon: FileText,
//                         },
//                         {
//                           label: "Architecture",
//                           value: detectedArchitecture,
//                           icon: Cpu,
//                         },
//                         {
//                           label: "Entropy",
//                           value: `${entropy.toFixed(4)} (${risk.level})`,
//                           color:
//                             risk.color === "danger"
//                               ? "text-red-400"
//                               : risk.color === "warning"
//                               ? "text-yellow-400"
//                               : "text-green-400",
//                           icon: Activity,
//                         },
//                       ].map((prop, index) => (
//                         <div
//                           key={index}
//                           className="p-4 bg-gray-800/20 rounded-xl border border-gray-700/30 text-center"
//                         >
//                           <div className="flex items-center justify-center mb-3">
//                             <div className="p-2 bg-blue-500/20 rounded-lg">
//                               <prop.icon className="w-5 h-5 text-blue-400" />
//                             </div>
//                           </div>
//                           <div className="text-gray-400 text-sm mb-2">
//                             {prop.label}
//                           </div>
//                           <div
//                             className={`font-mono text-sm font-semibold ${
//                               prop.color || "text-white"
//                             }`}
//                           >
//                             {prop.value}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Rest of the overview content */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* Analysis Summary */}
//                   <div className="card bg-gradient-to-br from-gray-800/30 to-gray-900/50 border-gray-700/30">
//                     <div className="card-header bg-gray-800/40 border-b border-gray-700/50">
//                       <h4 className="card-title text-green-400">
//                         <Activity className="w-4 h-4" />
//                         Analysis Summary
//                       </h4>
//                     </div>
//                     <div className="card-content">
//                       <div className="space-y-4">
//                         <div className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg">
//                           <span className="text-gray-400">Analysis Type:</span>
//                           <span className="text-white font-mono bg-blue-500/20 px-2 py-1 rounded">
//                             Static Analysis
//                           </span>
//                         </div>
//                         <div className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg">
//                           <span className="text-gray-400">Risk Level:</span>
//                           <span
//                             className={`font-mono px-2 py-1 rounded ${
//                               risk.color === "danger"
//                                 ? "bg-red-500/20 text-red-400"
//                                 : risk.color === "warning"
//                                 ? "bg-yellow-500/20 text-yellow-400"
//                                 : "bg-green-500/20 text-green-400"
//                             }`}
//                           >
//                             {risk.level}
//                           </span>
//                         </div>
//                         <div className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg">
//                           <span className="text-gray-400">Packed/Encrypted:</span>
//                           <span className="text-white font-mono">
//                             {risk.description}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Detection Overview */}
//                   <div className="card bg-gradient-to-br from-gray-800/30 to-gray-900/50 border-gray-700/30">
//                     <div className="card-header bg-gray-800/40 border-b border-gray-700/50">
//                       <h4 className="card-title text-purple-400">
//                         <Shield className="w-4 h-4" />
//                         Detection Overview
//                       </h4>
//                     </div>
//                     <div className="card-content">
//                       <div className="space-y-4">
//                         <div className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg">
//                           <span className="text-gray-400">Malware Rules:</span>
//                           <span
//                             className={`font-mono ${
//                               yaraMatches.length > 0 ? "text-red-400" : "text-green-400"
//                             }`}
//                           >
//                             {yaraMatches.length > 0 ? `${yaraMatches.length} detected` : "Clean"}
//                           </span>
//                         </div>
//                         <div className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg">
//                           <span className="text-gray-400">IOC Count:</span>
//                           <span
//                             className={`font-mono ${
//                               processedIocs.length > 5
//                                 ? "text-red-400"
//                                 : processedIocs.length > 0
//                                 ? "text-yellow-400"
//                                 : "text-green-400"
//                             }`}
//                           >
//                             {processedIocs.length} found
//                           </span>
//                         </div>
//                         <div className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg">
//                           <span className="text-gray-400">String Analysis:</span>
//                           <span className="text-white font-mono">
//                             {analysis.strings?.length || 0} extracted
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === "strings" && (
//               <div className="card bg-gradient-to-br from-gray-800/30 to-gray-900/50 border-gray-700/30">
//                 <div className="card-header bg-gray-800/40 border-b border-gray-700/50">
//                   <h4 className="card-title text-purple-400">
//                     <Terminal className="w-4 h-4" />
//                     Extracted Strings ({analysis.strings?.length || 0})
//                   </h4>
//                 </div>
//                 <div className="card-content">
//                   <div className="max-h-96 overflow-y-auto">
//                     <div className="grid grid-cols-1 gap-3">
//                       {analysis.strings?.slice(0, 100).map((str, index) => (
//                         <div
//                           key={index}
//                           className="bg-gray-900/50 border border-gray-700/50 p-4 rounded-lg text-sm font-mono break-all hover:bg-gray-800/50 transition-colors"
//                         >
//                           <span className="text-gray-400 text-xs mr-3">
//                             [{index + 1}]
//                           </span>
//                           <span className="text-gray-200">{str}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                   {analysis.strings && analysis.strings.length > 100 && (
//                     <div className="mt-6 text-center p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
//                       <p className="text-sm text-gray-400">
//                         Showing first 100 of{" "}
//                         <span className="font-bold text-white">
//                           {analysis.strings.length}
//                         </span>{" "}
//                         strings
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {activeTab === "iocs" && (
//               <div className="card bg-gradient-to-br from-gray-800/30 to-gray-900/50 border-gray-700/30">
//                 <div className="card-header bg-gray-800/40 border-b border-gray-700/50">
//                   <h4 className="card-title text-yellow-400">
//                     <Search className="w-4 h-4" />
//                     Indicators of Compromise ({processedIocs.length})
//                   </h4>
//                 </div>
//                 <div className="card-content">
//                   {processedIocs.length > 0 ? (
//                     <div className="overflow-x-auto">
//                       <div className="space-y-3">
//                         {processedIocs.map((ioc, index) => (
//                           <div
//                             key={index}
//                             className="flex items-center justify-between p-4 bg-gray-900/40 border border-gray-700/50 rounded-lg hover:bg-gray-800/40 transition-colors"
//                           >
//                             <div className="flex items-center gap-4 flex-1">
//                               <span
//                                 className={`px-3 py-1 rounded-full text-xs font-bold ${
//                                   ioc.type === 'IP'
//                                     ? 'bg-red-500/20 text-red-400 border border-red-400/30'
//                                     : ioc.type === 'URL'
//                                     ? 'bg-orange-500/20 text-orange-400 border border-orange-400/30'
//                                     : ioc.type === 'DOMAIN'
//                                     ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
//                                     : ioc.type === 'EMAIL'
//                                     ? 'bg-purple-500/20 text-purple-400 border border-purple-400/30'
//                                     : ioc.type === 'FILE'
//                                     ? 'bg-green-500/20 text-green-400 border border-green-400/30'
//                                     : 'bg-gray-500/20 text-gray-400 border border-gray-400/30'
//                                 }`}
//                               >
//                                 {ioc.type}
//                               </span>
//                               <div className="flex-1">
//                                 <div className="font-mono text-sm text-white break-all mb-1">
//                                   {ioc.value}
//                                 </div>
//                                 <div className="text-xs text-gray-400">
//                                   {ioc.context}
//                                 </div>
//                               </div>
//                             </div>
//                             <button
//                               className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
//                               onClick={() => navigator.clipboard.writeText(ioc.value)}
//                               title="Copy to clipboard"
//                             >
//                               <Copy className="w-4 h-4 text-gray-400" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="text-center py-12 text-gray-400">
//                       <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
//                       <h3 className="text-lg font-semibold mb-2">No Indicators Found</h3>
//                       <p className="text-sm">
//                         No indicators of compromise were detected in this file
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {activeTab === "yara" && (
//               <div className="card bg-gradient-to-br from-gray-800/30 to-gray-900/50 border-gray-700/30">
//                 <div className="card-header bg-gray-800/40 border-b border-gray-700/50">
//                   <h4 className="card-title text-red-400">
//                     <AlertTriangle className="w-4 h-4" />
//                     YARA Rule Matches ({yaraMatches.length})
//                   </h4>
//                 </div>
//                 <div className="card-content">
//                   {yaraMatches.length > 0 ? (
//                     <div className="space-y-6">
//                       {yaraMatches.map((match, index) => {
//                         // Extract rule information
//                         const ruleName = match.rule || "Unnamed Rule";
//                         const ruleDescription =
//                           match.meta?.description ||
//                           match.meta?.rule_description ||
//                           "No description available";
//                         const ruleAuthor = match.meta?.author || match.meta?.rule_author;
//                         const ruleSeverity = match.meta?.severity || match.meta?.threat_level;

//                         // Determine threat level based on metadata
//                         const isMalicious =
//                           match.tags?.includes("malicious") ||
//                           ruleSeverity === "high" ||
//                           ruleName.toLowerCase().includes("malicious") ||
//                           ruleName.toLowerCase().includes("trojan") ||
//                           ruleName.toLowerCase().includes("virus");

//                         const isSuspicious =
//                           match.tags?.includes("suspicious") ||
//                           ruleSeverity === "medium" ||
//                           ruleName.toLowerCase().includes("suspicious") ||
//                           ruleName.toLowerCase().includes("pup");

//                         return (
//                           <div
//                             key={index}
//                             className="p-6 bg-gray-900/50 rounded-xl border border-gray-700/50 shadow-lg"
//                           >
//                             <div className="flex items-start justify-between mb-4">
//                               <div className="flex-1">
//                                 <h5
//                                   className={`text-lg font-bold mb-2 ${
//                                     isMalicious
//                                       ? "text-red-400"
//                                       : isSuspicious
//                                       ? "text-yellow-400"
//                                       : "text-green-400"
//                                   }`}
//                                 >
//                                   {ruleName}
//                                 </h5>
//                                 {ruleDescription && (
//                                   <p className="text-sm text-gray-300 mb-2 leading-relaxed">
//                                     {ruleDescription}
//                                   </p>
//                                 )}
//                                 {ruleAuthor && (
//                                   <p className="text-xs text-gray-400">
//                                     <strong>Author:</strong> {ruleAuthor}
//                                   </p>
//                                 )}
//                               </div>
//                               <span
//                                 className={`px-4 py-2 rounded-full text-sm font-bold border ${
//                                   isMalicious
//                                     ? "bg-red-500/20 text-red-400 border-red-400/30"
//                                     : isSuspicious
//                                     ? "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
//                                     : "bg-green-500/20 text-green-400 border-green-400/30"
//                                 } ml-4`}
//                               >
//                                 {isMalicious
//                                   ? "MALICIOUS"
//                                   : isSuspicious
//                                   ? "SUSPICIOUS"
//                                   : "DETECTED"}
//                               </span>
//                             </div>

//                             {/* Tags */}
//                             {match.tags && match.tags.length > 0 && (
//                               <div className="flex flex-wrap gap-2 mb-4">
//                                 {match.tags.map((tag, i) => (
//                                   <span
//                                     key={i}
//                                     className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 text-xs font-medium rounded-full text-gray-300"
//                                   >
//                                     #{tag}
//                                   </span>
//                                 ))}
//                               </div>
//                             )}

//                             {/* Severity and metadata */}
//                             {(ruleSeverity || match.meta) && (
//                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                                 {ruleSeverity && (
//                                   <div className="flex items-center gap-2">
//                                     <span className="text-gray-400 text-sm">Severity:</span>
//                                     <span
//                                       className={`px-2 py-1 rounded text-xs font-bold ${
//                                         ruleSeverity === "high"
//                                           ? "bg-red-500/20 text-red-400"
//                                           : ruleSeverity === "medium"
//                                           ? "bg-yellow-500/20 text-yellow-400"
//                                           : "bg-green-500/20 text-green-400"
//                                       }`}
//                                     >
//                                       {ruleSeverity.toUpperCase()}
//                                     </span>
//                                   </div>
//                                 )}
//                                 {match.meta?.date && (
//                                   <div className="flex items-center gap-2">
//                                     <span className="text-gray-400 text-sm">Date:</span>
//                                     <span className="text-gray-300 text-sm font-mono">
//                                       {match.meta.date}
//                                     </span>
//                                   </div>
//                                 )}
//                                 {match.meta?.version && (
//                                   <div className="flex items-center gap-2">
//                                     <span className="text-gray-400 text-sm">Version:</span>
//                                     <span className="text-gray-300 text-sm font-mono">
//                                       {match.meta.version}
//                                     </span>
//                                   </div>
//                                 )}
//                               </div>
//                             )}

//                             {/* Matched strings */}
//                             {match.strings && Object.keys(match.strings).length > 0 && (
//                               <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-lg">
//                                 <div className="flex items-center gap-2 mb-3">
//                                   <Terminal className="w-4 h-4 text-blue-400" />
//                                   <span className="font-semibold text-blue-400">Matched Strings</span>
//                                 </div>
//                                 <div className="space-y-3">
//                                   {Object.entries(match.strings).map(([stringId, instances], i) => (
//                                     <div key={i} className="border-l-2 border-blue-400/30 pl-4">
//                                       <div className="text-blue-400 font-mono text-sm mb-2">
//                                         {stringId}:
//                                       </div>
//                                       <div className="space-y-1">
//                                         {instances.map((instance, j) => (
//                                           <div
//                                             key={j}
//                                             className="text-green-400 font-mono text-sm bg-gray-900/50 p-2 rounded border border-gray-700/30 break-all"
//                                           >
//                                             {typeof instance === "string"
//                                               ? instance
//                                               : JSON.stringify(instance)}
//                                           </div>
//                                         ))}
//                                       </div>
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}

//                             {/* Additional metadata */}
//                             {match.meta && Object.keys(match.meta).length > 0 && (
//                               <div className="mt-4 bg-gray-800/30 border border-gray-700/50 p-4 rounded-lg">
//                                 <div className="flex items-center gap-2 mb-3">
//                                   <Info className="w-4 h-4 text-purple-400" />
//                                   <span className="font-semibold text-purple-400">Rule Metadata</span>
//                                 </div>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                                   {Object.entries(match.meta).map(([key, value], i) => (
//                                     <div key={i} className="flex items-start gap-3">
//                                       <span className="text-gray-400 text-sm font-medium min-w-0 flex-shrink-0 w-24">
//                                         {key}:
//                                       </span>
//                                       <span className="text-gray-200 text-sm font-mono break-all flex-1">
//                                         {String(value)}
//                                       </span>
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   ) : (
//                     <div className="text-center py-12 text-gray-400">
//                       <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
//                         <AlertTriangle className="w-8 h-8 text-green-400" />
//                       </div>
//                       <h3 className="text-lg font-semibold mb-2 text-green-400">No YARA Matches</h3>
//                       <p className="text-sm">
//                         This file did not match any known malicious patterns
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {activeTab === "threatintel" && (
//               <ThreatIntelTab
//                 threatIntel={threatIntel}
//                 fileId={fileId}
//                 fileHash={fileHash}
//                 onIntelUpdated={onIntelUpdated}
//               />
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// AnalysisTab.jsx - Enhanced version with proper YARA, file type, and architecture detection
import React, { useState } from "react";
import {
  Cpu,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  FileText,
  Terminal,
  Search,
  BarChart3,
  Shield,
  Activity,
  Copy,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import ThreatIntelTab from "./ThreatIntelTab";

export default function AnalysisTab({
  analysis,
  threatIntel,
  fileId,
  fileHash,
  fileName,
  fileSize,
  onIntelUpdated,
}) {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedHash, setCopiedHash] = useState("");

  // Enhanced file type detection with more comprehensive mapping
  const detectFileType = () => {
    // First check if we have PE metadata with file type info
    if (analysis?.peMetadata?.machine) {
      const machineType = analysis.peMetadata.machine;
      if (machineType.includes("x64") || machineType.includes("AMD64")) {
        return "Windows Executable (64-bit)";
      } else if (machineType.includes("i386") || machineType.includes("x86")) {
        return "Windows Executable (32-bit)";
      } else if (machineType.includes("ARM")) {
        return "Windows Executable (ARM)";
      }
    }

    // Fall back to file extension detection
    if (fileName) {
      const extension = fileName.split(".").pop()?.toLowerCase();
      const typeMap = {
        exe: "Windows Executable",
        dll: "Dynamic Link Library",
        sys: "Windows System File",
        pdf: "Portable Document Format",
        doc: "Microsoft Word Document",
        docx: "Microsoft Word Document",
        xls: "Microsoft Excel",
        xlsx: "Microsoft Excel",
        zip: "ZIP Archive",
        rar: "RAR Archive",
        "7z": "7-Zip Archive",
        txt: "Text File",
        js: "JavaScript",
        html: "HTML Document",
        htm: "HTML Document",
        php: "PHP Script",
        py: "Python Script",
        jar: "Java Archive",
        apk: "Android Package",
        msi: "Windows Installer",
        bat: "Batch File",
        cmd: "Command File",
        ps1: "PowerShell Script",
        sh: "Shell Script",
        iso: "ISO Image",
        img: "Disk Image",
        bin: "Binary File",
        dat: "Data File",
        csv: "Comma Separated Values",
        xml: "XML Document",
        json: "JSON File",
      };

      return typeMap[extension] || `${extension?.toUpperCase()} File`;
    }

    return "Unknown";
  };

  // Enhanced architecture detection
  const detectArchitecture = () => {
    // First check PE metadata for architecture info
    if (analysis?.peMetadata?.machine) {
      const machineType = analysis.peMetadata.machine;
      if (machineType.includes("x64") || machineType.includes("AMD64")) {
        return "x64";
      } else if (machineType.includes("i386") || machineType.includes("x86")) {
        return "x86";
      } else if (machineType.includes("ARM64")) {
        return "ARM64";
      } else if (machineType.includes("ARM")) {
        return "ARM";
      }
      return machineType; // Return the raw machine type if not matched above
    }

    // Try to infer from file type
    const fileType = detectFileType();
    if (fileType.includes("64-bit")) return "x64";
    if (fileType.includes("32-bit")) return "x86";
    if (fileType.includes("Android")) return "ARM/ARM64";

    return "N/A";
  };

  // Enhanced YARA match processing
  // const processYaraMatches = () => {
  //   if (!analysis.yaraMatches || analysis.yaraMatches.length === 0) return [];

  //   return analysis.yaraMatches.map(match => {
  //     // Handle different YARA result formats
  //     if (typeof match === 'string') {
  //       // Simple string format - just the rule name
  //       return {
  //         rule: match,
  //         meta: { description: "No description available" },
  //         tags: [],
  //         strings: {}
  //       };
  //     } else if (match.rule) {
  //       // Proper YARA match object
  //       return match;
  //     } else {
  //       // Fallback for unknown format
  //       return {
  //         rule: "Unnamed Rule",
  //         meta: { description: "No description available" },
  //         tags: [],
  //         strings: {}
  //       };
  //     }
  //   });
  // };

  // Enhanced YARA match processing with descriptions
  const processYaraMatches = () => {
    if (!analysis.yaraMatches || analysis.yaraMatches.length === 0) return [];

    return analysis.yaraMatches.map((match) => {
      // Handle different YARA result formats
      let ruleName, meta, tags, strings;

      if (typeof match === "string") {
        // Simple string format - just the rule name
        ruleName = match;
        tags = [];
        strings = {};
      } else if (match.rule) {
        // Proper YARA match object
        ruleName = match.rule;
        meta = match.meta || {};
        tags = match.tags || [];
        strings = match.strings || {};
      } else {
        // Fallback for unknown format
        ruleName = "Unnamed Rule";
        tags = [];
        strings = {};
      }

      // If no description exists, generate one based on rule name and tags
      if (!meta || !meta.description) {
        const generatedDescription = generateYaraDescription(ruleName, tags);
        meta = {
          ...meta,
          description: generatedDescription,
        };
      }

      return {
        rule: ruleName,
        meta,
        tags,
        strings,
      };
    });
  };

  // Generate meaningful descriptions for YARA rules based on name and tags
  const generateYaraDescription = (ruleName, tags) => {
    const lowerRuleName = ruleName.toLowerCase();

    // Common malware families
    if (lowerRuleName.includes("trojan")) {
      return "Detects characteristics of a Trojan horse malware, which disguises itself as legitimate software but performs malicious actions.";
    }
    if (lowerRuleName.includes("ransomware")) {
      return "Identifies patterns associated with ransomware, which encrypts files and demands payment for decryption.";
    }
    if (lowerRuleName.includes("worm")) {
      return "Detects worm-like behavior, indicating self-replicating malware that spreads across networks.";
    }
    if (lowerRuleName.includes("backdoor")) {
      return "Identifies backdoor capabilities that allow unauthorized remote access to a compromised system.";
    }
    if (lowerRuleName.includes("spyware")) {
      return "Detects spyware characteristics, indicating software that secretly monitors user activities.";
    }
    if (lowerRuleName.includes("keylogger")) {
      return "Identifies keylogging functionality that captures keystrokes to steal sensitive information.";
    }
    if (lowerRuleName.includes("botnet")) {
      return "Detects patterns associated with botnet malware that allows remote control of infected systems.";
    }
    if (lowerRuleName.includes("rootkit")) {
      return "Identifies rootkit techniques used to hide malware presence and maintain persistent access.";
    }

    // Common techniques
    if (lowerRuleName.includes("packed") || lowerRuleName.includes("packer")) {
      return "Detects code packing or obfuscation techniques commonly used to evade detection.";
    }
    if (lowerRuleName.includes("obfuscated")) {
      return "Identifies code obfuscation methods used to make analysis more difficult.";
    }
    if (lowerRuleName.includes("injection")) {
      return "Detects code injection techniques used to execute malicious code within legitimate processes.";
    }
    if (lowerRuleName.includes("shellcode")) {
      return "Identifies shellcode patterns often used in exploitation and post-exploitation activities.";
    }
    if (lowerRuleName.includes("exploit")) {
      return "Detects exploit code patterns that target software vulnerabilities.";
    }
    if (lowerRuleName.includes("persistence")) {
      return "Identifies techniques used by malware to maintain persistence on infected systems.";
    }

    // File types
    if (lowerRuleName.includes("pe") || lowerRuleName.includes("executable")) {
      return "Detects characteristics of Portable Executable (PE) files, the standard Windows executable format.";
    }
    if (lowerRuleName.includes("elf")) {
      return "Identifies ELF (Executable and Linkable Format) files used in Unix-like operating systems.";
    }
    if (lowerRuleName.includes("document")) {
      return "Detects patterns in document files that may contain malicious macros or exploits.";
    }
    if (lowerRuleName.includes("script")) {
      return "Identifies scripting languages often used in malicious scripts and fileless attacks.";
    }

    // Check tags for additional context
    if (tags.includes("malicious")) {
      return "This rule identifies known malicious patterns and behaviors associated with cyber threats.";
    }
    if (tags.includes("suspicious")) {
      return "This rule detects suspicious activities that may indicate potential malicious behavior.";
    }
    if (tags.includes("tool")) {
      return "Identifies tools that could be used for both legitimate purposes and malicious activities.";
    }

    // Generic description based on rule name
    if (lowerRuleName.includes("gen") || lowerRuleName.includes("generic")) {
      return "Generic detection rule that identifies common malicious patterns across multiple threat families.";
    }

    // Default description
    return "This YARA rule detects patterns associated with potentially malicious software or behaviors.";
  };

  if (!analysis) {
    return (
      <div className="card">
        <div className="card-content text-center py-12">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Terminal className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            No Static Analysis Available
          </h3>
          <p className="text-secondary mb-8 max-w-md mx-auto leading-relaxed">
            Run static analysis to generate detailed results and identify
            potential security threats
          </p>
          <button className="btn btn-primary px-8 py-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
            <Cpu className="w-4 h-4 mr-2" />
            Run Analysis
          </button>
        </div>
      </div>
    );
  }

  // Process IOCs
  const detectIocType = (value) => {
    if (!value) return "Unknown";
    const patterns = {
      ip: /^(?:\d{1,3}\.){3}\d{1,3}$/,
      url: /^(https?:\/\/)/i,
      domain: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      file: /\.(exe|dll|bat|ps1|sh|scr|com|pif|jar)$/i,
      registry: /^HKEY_/i,
      crypto: /^[a-fA-F0-9]{32,}$/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(value)) return type.toUpperCase();
    }

    return "String";
  };

  const processedIocs = (analysis.iocs || []).map((ioc) => {
    if (typeof ioc === "string") {
      return {
        value: ioc,
        type: detectIocType(ioc),
        context: "Extracted from file",
      };
    }
    return {
      value: ioc.value || String(ioc),
      type: ioc.type || detectIocType(ioc.value),
      context: ioc.context || "Static analysis",
    };
  });

  // Use enhanced YARA processing
  const yaraMatches = processYaraMatches();
  const entropy = analysis.entropy || 0;

  const getRiskLevel = (entropy) => {
    if (entropy > 7.0)
      return {
        level: "HIGH",
        color: "danger",
        description: "Highly packed or encrypted",
      };
    if (entropy > 6.0)
      return {
        level: "MEDIUM",
        color: "warning",
        description: "Moderately packed",
      };
    return { level: "LOW", color: "safe", description: "Normal entropy" };
  };

  const risk = getRiskLevel(entropy);

  // Calculate threat score
  const calculateThreatScore = () => {
    let score = 0;
    if (yaraMatches.length > 0) score += 40;
    if (processedIocs.length > 10) score += 30;
    else if (processedIocs.length > 0)
      score += Math.min(processedIocs.length * 3, 25);
    if (entropy > 7.0) score += 25;
    else if (entropy > 6.0) score += 15;

    // Add VirusTotal score
    if (threatIntel?.vtReport) {
      const vtScore =
        (threatIntel.vtReport.malicious || 0) /
        (threatIntel.vtReport.totalEngines || 1);
      score += Math.min(vtScore * 40, 40);
    }

    return Math.min(score, 100);
  };

  const threatScore = calculateThreatScore();

  // Copy hash to clipboard
  const copyHash = (hashType, hashValue) => {
    navigator.clipboard.writeText(hashValue);
    setCopiedHash(hashType);
    setTimeout(() => setCopiedHash(""), 2000);
  };

  // Format file size helper
  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Get the detected file type and architecture
  const detectedFileType = detectFileType();
  const detectedArchitecture = detectArchitecture();

  return (
    <div className="card overflow-hidden shadow-xl border border-gray-700/50">
      {/* Enhanced Header */}
      <div
        className="card-header cursor-pointer bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-300"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
              <Cpu className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Static Analysis Results
              </h3>
              <p className="text-xs text-gray-400">
                Comprehensive file analysis and threat assessment
              </p>
            </div>
            {yaraMatches.length > 0 && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 px-3 py-1.5 rounded-full">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span className="text-red-400 text-sm font-semibold">
                  {yaraMatches.length} YARA{" "}
                  {yaraMatches.length === 1 ? "match" : "matches"}
                </span>
              </div>
            )}
          </div>
          <div className="p-2 rounded-lg bg-gray-700/30 hover:bg-gray-600/30 transition-colors">
            {open ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="card-content">
          {/* Enhanced Summary Section */}
          <div className="mb-8 p-6 bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl border border-gray-700/50 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Enhanced Threat Score */}
              <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-800/30 rounded-xl border border-gray-700/30">
                <div className="relative w-20 h-20 mb-4">
                  <div
                    className="w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-lg"
                    style={{
                      background: `conic-gradient(${
                        threatScore > 70
                          ? "#ef4444"
                          : threatScore > 40
                          ? "#f59e0b"
                          : "#10b981"
                      } 0% ${threatScore}%, #1f2937 ${threatScore}% 100%)`,
                      borderColor: "#1f2937",
                    }}
                  >
                    <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center">
                      <span
                        className={`text-lg font-bold ${
                          threatScore > 70
                            ? "text-red-400"
                            : threatScore > 40
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}
                      >
                        {threatScore}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`text-sm font-bold mb-1 ${
                    threatScore > 70
                      ? "text-red-400"
                      : threatScore > 40
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {threatScore > 70
                    ? "High Risk"
                    : threatScore > 40
                    ? "Medium Risk"
                    : "Low Risk"}
                </div>
                <div className="text-xs text-gray-400">Threat Score</div>
              </div>

              {/* Enhanced File Info */}
              <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/30">
                <h4 className="text-sm font-bold mb-4 flex items-center text-blue-400">
                  <FileText className="w-4 h-4 mr-2" />
                  File Information
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Size:</span>
                    <span className="font-mono bg-gray-700/50 px-2 py-1 rounded text-white">
                      {formatSize(fileSize)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Type:</span>
                    <span className="font-mono bg-gray-700/50 px-2 py-1 rounded text-white">
                      {detectedFileType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Arch:</span>
                    <span className="font-mono bg-gray-700/50 px-2 py-1 rounded text-white">
                      {detectedArchitecture}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Entropy:</span>
                    <span
                      className={`font-mono px-2 py-1 rounded ${
                        risk.color === "danger"
                          ? "bg-red-500/20 text-red-400"
                          : risk.color === "warning"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {entropy.toFixed(2)} ({risk.level})
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Detection Summary */}
              <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/30">
                <h4 className="text-sm font-bold mb-4 flex items-center text-green-400">
                  <Shield className="w-4 h-4 mr-2" />
                  Detection Summary
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">YARA Rules:</span>
                    <div className="flex items-center gap-2">
                      {yaraMatches.length > 0 ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      <span
                        className={`font-mono ${
                          yaraMatches.length > 0
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {yaraMatches.length} detected
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Indicators:</span>
                    <div className="flex items-center gap-2">
                      {processedIocs.length > 5 ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : processedIocs.length > 0 ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      <span
                        className={`font-mono ${
                          processedIocs.length > 5
                            ? "text-red-400"
                            : processedIocs.length > 0
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}
                      >
                        {processedIocs.length} found
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Packing:</span>
                    <div className="flex items-center gap-2">
                      {risk.level === "HIGH" ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : risk.level === "MEDIUM" ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      <span
                        className={`font-mono ${
                          risk.level === "HIGH"
                            ? "text-red-400"
                            : risk.level === "MEDIUM"
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}
                      >
                        {risk.description}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700/50 pb-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "overview"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/30"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <Activity className="w-4 h-4 mr-2 inline" />
              Overview
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "yara"
                  ? "bg-red-500/20 text-red-400 border border-red-400/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/30"
              }`}
              onClick={() => setActiveTab("yara")}
            >
              <Search className="w-4 h-4 mr-2 inline" />
              YARA Rules ({yaraMatches.length})
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "iocs"
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/30"
              }`}
              onClick={() => setActiveTab("iocs")}
            >
              <AlertTriangle className="w-4 h-4 mr-2 inline" />
              IOCs ({processedIocs.length})
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "metadata"
                  ? "bg-purple-500/20 text-purple-400 border border-purple-400/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/30"
              }`}
              onClick={() => setActiveTab("metadata")}
            >
              <BarChart3 className="w-4 h-4 mr-2 inline" />
              Metadata
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "threatIntel"
                  ? "bg-green-500/20 text-green-400 border border-green-400/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/30"
              }`}
              onClick={() => setActiveTab("threatIntel")}
            >
              <Shield className="w-4 h-4 mr-2 inline" />
              Threat Intelligence
            </button>
          </div>

          {/* Enhanced Tab Content */}
          <div className="tab-content">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Enhanced YARA Matches Summary */}
                  <div className="card bg-gray-800/30 border border-gray-700/30">
                    <div className="card-header bg-gradient-to-r from-red-500/10 to-red-600/10 border-b border-red-400/20">
                      <h4 className="text-sm font-bold flex items-center text-red-400">
                        <Search className="w-4 h-4 mr-2" />
                        YARA Rule Matches
                      </h4>
                    </div>
                    <div className="card-content p-4">
                      {yaraMatches.length > 0 ? (
                        <div className="space-y-3">
                          {yaraMatches.slice(0, 3).map((match, index) => (
                            <div
                              key={index}
                              className="p-3 bg-red-500/10 rounded-lg border border-red-400/20"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-red-400 text-sm">
                                  {match.rule}
                                </span>
                                <div className="flex items-center gap-2">
                                  {match.tags && match.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {match.tags.map((tag, i) => (
                                        <span
                                          key={i}
                                          className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-400/30"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-gray-400">
                                {match.meta?.description ||
                                  "No description available"}
                              </p>
                            </div>
                          ))}
                          {yaraMatches.length > 3 && (
                            <div className="text-center pt-2">
                              <span className="text-xs text-gray-400">
                                +{yaraMatches.length - 3} more matches
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">
                            No YARA rule matches detected
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced IOC Summary */}
                  <div className="card bg-gray-800/30 border border-gray-700/30">
                    <div className="card-header bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-b border-yellow-400/20">
                      <h4 className="text-sm font-bold flex items-center text-yellow-400">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Indicators of Compromise
                      </h4>
                    </div>
                    <div className="card-content p-4">
                      {processedIocs.length > 0 ? (
                        <div className="space-y-3">
                          {processedIocs.slice(0, 5).map((ioc, index) => (
                            <div
                              key={index}
                              className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-400/20"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-xs text-yellow-400 truncate max-w-[70%]">
                                  {ioc.value}
                                </span>
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full ${
                                    ioc.type === "IP"
                                      ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                                      : ioc.type === "URL"
                                      ? "bg-purple-500/20 text-purple-400 border border-purple-400/30"
                                      : ioc.type === "DOMAIN"
                                      ? "bg-green-500/20 text-green-400 border border-green-400/30"
                                      : "bg-gray-500/20 text-gray-400 border border-gray-400/30"
                                  }`}
                                >
                                  {ioc.type}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 truncate">
                                {ioc.context}
                              </p>
                            </div>
                          ))}
                          {processedIocs.length > 5 && (
                            <div className="text-center pt-2">
                              <span className="text-xs text-gray-400">
                                +{processedIocs.length - 5} more IOCs
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">
                            No IOCs detected
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Hash Information */}
                <div className="card bg-gray-800/30 border border-gray-700/30">
                  <div className="card-header bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-b border-blue-400/20">
                    <h4 className="text-sm font-bold flex items-center text-blue-400">
                      <FileText className="w-4 h-4 mr-2" />
                      Hash Information
                    </h4>
                  </div>
                  <div className="card-content p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: "MD5", value: fileHash?.md5 },
                        { label: "SHA1", value: fileHash?.sha1 },
                        { label: "SHA256", value: fileHash?.sha256 },
                        { label: "SHA512", value: fileHash?.sha512 },
                      ].map((hash, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-400">
                              {hash.label}
                            </span>
                            <button
                              onClick={() => copyHash(hash.label, hash.value)}
                              className="p-1.5 bg-gray-600/30 rounded-lg hover:bg-gray-500/30 transition-colors"
                              title="Copy hash"
                            >
                              <Copy
                                className={`w-3 h-3 ${
                                  copiedHash === hash.label
                                    ? "text-green-400"
                                    : "text-gray-400"
                                }`}
                              />
                            </button>
                          </div>
                          <p className="font-mono text-xs text-white break-all">
                            {hash.value || "N/A"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "yara" && (
              <div className="card bg-gray-800/30 border border-gray-700/30">
                <div className="card-header bg-gradient-to-r from-red-500/10 to-red-600/10 border-b border-red-400/20">
                  <h4 className="text-sm font-bold flex items-center text-red-400">
                    <Search className="w-4 h-4 mr-2" />
                    YARA Rule Matches
                  </h4>
                </div>
                <div className="card-content p-4">
                  {yaraMatches.length > 0 ? (
                    <div className="space-y-4">
                      {yaraMatches.map((match, index) => (
                        <div
                          key={index}
                          className="p-4 bg-red-500/10 rounded-xl border border-red-400/20"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-bold text-red-400">
                              {match.rule}
                            </h5>
                            <div className="flex items-center gap-2">
                              {match.tags && match.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {match.tags.map((tag, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-400/30"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          {match.meta && Object.keys(match.meta).length > 0 && (
                            <div className="mb-3">
                              <h6 className="text-xs font-bold text-gray-400 mb-2">
                                Metadata:
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {Object.entries(match.meta).map(
                                  ([key, value], i) => (
                                    <div
                                      key={i}
                                      className="flex items-center text-xs"
                                    >
                                      <span className="text-gray-400 font-medium">
                                        {key}:
                                      </span>
                                      <span className="ml-2 text-gray-300">
                                        {String(value)}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                          {match.strings &&
                            Object.keys(match.strings).length > 0 && (
                              <div>
                                <h6 className="text-xs font-bold text-gray-400 mb-2">
                                  Matched Strings:
                                </h6>
                                <div className="space-y-2">
                                  {Object.entries(match.strings).map(
                                    ([stringId, matches], i) => (
                                      <div
                                        key={i}
                                        className="p-2 bg-red-500/5 rounded border border-red-400/10"
                                      >
                                        <div className="font-mono text-xs text-red-300 break-all">
                                          {stringId}: {matches.join(", ")}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                      <h5 className="text-sm font-bold text-gray-300 mb-1">
                        No YARA Rule Matches
                      </h5>
                      <p className="text-xs text-gray-400">
                        The file did not match any YARA rules in the database
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "iocs" && (
              <div className="card bg-gray-800/30 border border-gray-700/30">
                <div className="card-header bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-b border-yellow-400/20">
                  <h4 className="text-sm font-bold flex items-center text-yellow-400">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Indicators of Compromise
                  </h4>
                </div>
                <div className="card-content p-0">
                  {processedIocs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700/50">
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400">
                              Value
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400">
                              Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400">
                              Context
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/30">
                          {processedIocs.map((ioc, index) => (
                            <tr key={index} className="hover:bg-gray-700/20">
                              <td className="px-4 py-3">
                                <div className="font-mono text-xs text-white break-all max-w-xs">
                                  {ioc.value}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    ioc.type === "IP"
                                      ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                                      : ioc.type === "URL"
                                      ? "bg-purple-500/20 text-purple-400 border border-purple-400/30"
                                      : ioc.type === "DOMAIN"
                                      ? "bg-green-500/20 text-green-400 border border-green-400/30"
                                      : ioc.type === "EMAIL"
                                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30"
                                      : ioc.type === "FILE"
                                      ? "bg-red-500/20 text-red-400 border border-red-400/30"
                                      : "bg-gray-500/20 text-gray-400 border border-gray-400/30"
                                  }`}
                                >
                                  {ioc.type}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs text-gray-400">
                                  {ioc.context}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => copyHash("IOC", ioc.value)}
                                    className="p-1.5 bg-gray-600/30 rounded-lg hover:bg-gray-500/30 transition-colors"
                                    title="Copy IOC"
                                  >
                                    <Copy
                                      className={`w-3 h-3 ${
                                        copiedHash === "IOC"
                                          ? "text-green-400"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  </button>
                                  <button
                                    className="p-1.5 bg-gray-600/30 rounded-lg hover:bg-gray-500/30 transition-colors"
                                    title="Search IOC"
                                  >
                                    <Search className="w-3 h-3 text-gray-400" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                      <h5 className="text-sm font-bold text-gray-300 mb-1">
                        No IOCs Detected
                      </h5>
                      <p className="text-xs text-gray-400">
                        No indicators of compromise were found in this file
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "metadata" && (
              <div className="space-y-6">
                {/* Enhanced PE Metadata */}
                {analysis.peMetadata && (
                  <div className="card bg-gray-800/30 border border-gray-700/30">
                    <div className="card-header bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-b border-purple-400/20">
                      <h4 className="text-sm font-bold flex items-center text-purple-400">
                        <Info className="w-4 h-4 mr-2" />
                        PE Metadata
                      </h4>
                    </div>
                    <div className="card-content p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(analysis.peMetadata).map(
                          ([key, value], index) => (
                            <div
                              key={index}
                              className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
                            >
                              <div className="text-xs font-bold text-gray-400 mb-1">
                                {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                              </div>
                              <div className="font-mono text-xs text-white break-all">
                                {String(value)}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced General Metadata */}
                <div className="card bg-gray-800/30 border border-gray-700/30">
                  <div className="card-header bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-b border-blue-400/20">
                    <h4 className="text-sm font-bold flex items-center text-blue-400">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      General Metadata
                    </h4>
                  </div>
                  <div className="card-content p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(analysis)
                        .filter(
                          ([key]) =>
                            ![
                              "yaraMatches",
                              "iocs",
                              "peMetadata",
                              "entropy",
                            ].includes(key)
                        )
                        .map(([key, value], index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
                          >
                            <div className="text-xs font-bold text-gray-400 mb-1">
                              {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                            </div>
                            <div className="font-mono text-xs text-white break-all">
                              {String(value)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "threatIntel" && (
              <ThreatIntelTab
                threatIntel={threatIntel}
                fileId={fileId}
                fileHash={fileHash}
                onIntelUpdated={onIntelUpdated}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
