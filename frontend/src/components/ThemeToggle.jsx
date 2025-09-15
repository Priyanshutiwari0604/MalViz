// ThemeToggle.jsx - Enhanced UI with modern styling
import React from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ theme, setTheme }) {
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <div className="relative">
      <button 
        onClick={toggle} 
        aria-label="Toggle theme" 
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className="group relative p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-300 hover:scale-105 hover:shadow-lg dark:hover:shadow-slate-900/50 active:scale-95"
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 dark:from-blue-400/20 dark:to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
        
        {/* Icon container with rotation animation */}
        <div className="relative z-10 w-6 h-6 flex items-center justify-center">
          <div className={`absolute inset-0 transition-all duration-500 ${theme === "dark" ? "rotate-0 opacity-100 scale-100" : "rotate-180 opacity-0 scale-75"}`}>
            <Sun className="w-6 h-6 text-yellow-500 drop-shadow-sm" />
          </div>
          <div className={`absolute inset-0 transition-all duration-500 ${theme === "dark" ? "rotate-180 opacity-0 scale-75" : "rotate-0 opacity-100 scale-100"}`}>
            <Moon className="w-6 h-6 text-slate-600 dark:text-slate-400 drop-shadow-sm" />
          </div>
        </div>

        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-active:opacity-100 transition-opacity duration-150"></div>
      </button>
      
      {/* Optional floating indicator */}
      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-blue-400 dark:to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
    </div>
  );
}