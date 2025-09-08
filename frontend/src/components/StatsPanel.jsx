// StatsPanel.jsx (Fixed for theme compatibility)
import React from "react";
import { FileText, Shield, AlertTriangle, Clock } from "lucide-react";

export default function StatsPanel({ stats, theme }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="panel relative overflow-hidden">
        {theme === "dark" && <div className="matrix-bg" style={{left: '10%'}}></div>}
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-secondary text-sm">Total Files</p>
            <p className="text-2xl font-bold text-primary">{stats.totalFiles}</p>
          </div>
          <div className={`p-2 rounded ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>
      
      <div className="panel relative overflow-hidden">
        {theme === "dark" && <div className="matrix-bg" style={{left: '40%'}}></div>}
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-secondary text-sm">Analyzed</p>
            <p className="text-2xl font-bold text-primary">{stats.analyzedFiles}</p>
          </div>
          <div className={`p-2 rounded ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>
      
      <div className="panel relative overflow-hidden">
        {theme === "dark" && <div className="matrix-bg" style={{left: '70%'}}></div>}
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-secondary text-sm">Threats Detected</p>
            <p className="text-2xl font-bold text-primary">{stats.detectedThreats}</p>
          </div>
          <div className={`p-2 rounded ${theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>
      
      <div className="panel relative overflow-hidden">
        {theme === "dark" && <div className="matrix-bg" style={{left: '90%'}}></div>}
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-secondary text-sm">Last Analysis</p>
            <p className="text-lg font-bold text-primary">
              {stats.lastAnalysis ? new Date(stats.lastAnalysis).toLocaleTimeString() : 'Never'}
            </p>
          </div>
          <div className={`p-2 rounded ${theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}