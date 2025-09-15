// App.jsx - Professional Cybersecurity Application Shell
import React, { useState, useEffect } from "react";
import { Shield, Cpu, Activity, Database, Terminal, Lock, AlertTriangle, BarChart3 } from "lucide-react";
import UploadPanel from "./components/UploadPanel";
import Dashboard from "./components/Dashboard";
import ThemeToggle from "./components/ThemeToggle";
import StatsPanel from "./components/StatsPanel";
import "./App.css";

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });
  
  const [stats, setStats] = useState({
    totalFiles: 0,
    analyzedFiles: 0,
    detectedThreats: 0,
    lastAnalysis: null
  });

  const [activeView, setActiveView] = useState("dashboard");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    
    // Apply theme class to body for better CSS targeting
    document.body.className = theme === "dark" ? "dark-theme" : "light-theme";
  }, [theme]);

  const handleFileUploaded = () => {
    // Trigger refresh of dashboard which will update stats
    window.location.reload();
  };

  const handleStatsUpdate = (newStats) => {
    setStats(newStats);
  };

  return (
    <div className="app-container" data-theme={theme}>
      {/* Professional Header */}
      <header className="app-header">
        <div className="header-container">
          {/* Logo and Branding */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="app-title">
                  MAL<span className="text-blue-400">VIZ</span>
                </h1>
                <p className="app-subtitle">Advanced Malware Analysis Platform</p>
              </div>
            </div>
          </div>

          {/* Feature Tags and Controls */}
          <div className="flex items-center gap-6">
            {/* Theme Toggle */}
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Statistics Dashboard */}
        <StatsPanel stats={stats} theme={theme} />

        {/* File Upload Section */}
        <UploadPanel onUploaded={handleFileUploaded} theme={theme} />

        {/* File Management Dashboard */}
        <Dashboard onStatsUpdate={handleStatsUpdate} theme={theme} />
      </main>

      {/* Professional Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-secondary">
              <Lock className="w-4 h-4" />
              <span>MALVIZ - Professional Malware Analysis Platform</span>
            </div>
            <div className="flex items-center gap-6 mt-4 md:mt-0 text-sm text-secondary">
              <span>For Research and Educational Purposes Only</span>
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span>Secure Analysis Environment</span>
              </div>
            </div>
          </div>
          
          {/* Additional Footer Info */}
          <div className="footer-info">
            <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-secondary">
              <div>
                <span>Powered by VirusTotal API • YARA Rules • Static Analysis Engine</span>
              </div>
              <div className="mt-2 sm:mt-0">
                <span>© 2025 MALVIZ. Built for cybersecurity professionals.</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;