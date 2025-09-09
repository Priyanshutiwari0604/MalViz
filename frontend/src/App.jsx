// App.jsx (Redesigned with Professional Cybersecurity Theme)
import React, { useState, useEffect } from "react";
import { Shield, Cpu, Activity, Database, Terminal, Lock, Eye, Bug } from "lucide-react";
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

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleFileUploaded = () => {
    window.location.reload();
  };

  return (
    <div className="app-container" data-theme={theme}>
      {/* Matrix background effect for dark theme */}
      {theme === "dark" && (
        <div className="matrix-background">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="matrix-digit" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}>
              {Math.round(Math.random())}
            </div>
          ))}
        </div>
      )}
      
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="flex items-center gap-3">
            <div className="header-logo pulse-glow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="app-title tracking-tight">
                MAL<span className="text-security-blue">VIZ</span>
              </h1>
              <p className="app-subtitle">Advanced Malware Analysis Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 feature-tags">
              <div className="flex items-center gap-1 px-2 py-1 bg-security-tag rounded">
                <Database className="w-3 h-3" />
                <span className="text-xs">Static Analysis</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-security-tag rounded">
                <Activity className="w-3 h-3" />
                <span className="text-xs">Behavioral Engine</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-security-tag rounded">
                <Cpu className="w-3 h-3" />
                <span className="text-xs">AI Detection</span>
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
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="flex items-center gap-1 text-xs">
              <Lock className="w-3 h-3" />
              MALVIZ - Secure Malware Analysis Platform
            </p>
            <p className="text-xs opacity-70">For Research and Educational Purposes Only</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;