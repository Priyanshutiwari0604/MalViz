// App.jsx (Fixed Theme Implementation)
import React, { useState, useEffect } from "react";
import { Shield, Cpu, Activity, Database, Terminal } from "lucide-react";
import UploadPanel from "./components/UploadPanel";
import Dashboard from "./components/Dashboard";
import ThemeToggle from "./components/ThemeToggle";
import StatsPanel from "./components/StatsPanel";
import "./App.css";

function App() {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'dark'
    return localStorage.getItem("theme") || "dark";
  });
  const [stats, setStats] = useState({
    totalFiles: 0,
    analyzedFiles: 0,
    detectedThreats: 0,
    lastAnalysis: null
  });

  useEffect(() => {
    // Apply theme class to document element
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleFileUploaded = () => {
    // Refresh the dashboard
    window.location.reload();
  };

  return (
    <div className="app-container" data-theme={theme}>
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="flex items-center gap-3">
            <div className="header-logo">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="app-title">
                MALVIZ
              </h1>
              <p className="app-subtitle">Dynamic Malware Analyzer</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 feature-tags">
              <div className="flex items-center gap-1">
                <Database className="w-4 h-4" />
                <span>Static Analysis</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                <span>Behavioral Engine</span>
              </div>
              <div className="flex items-center gap-1">
                <Cpu className="w-4 h-4" />
                <span>AI Detection</span>
              </div>
            </div>
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <StatsPanel stats={stats} theme={theme} />
        <UploadPanel onUploaded={handleFileUploaded} theme={theme} />
        <Dashboard onStatsUpdate={setStats} theme={theme} />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>MALVIZ - Dynamic Malware Analysis Platform | For Research and Educational Purposes Only</p>
        </div>
      </footer>
    </div>
  );
}

export default App;