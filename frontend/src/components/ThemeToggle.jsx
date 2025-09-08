import React from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 
                 transition-all duration-200 group"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-amber-500 group-hover:rotate-12 transition-transform duration-200" />
      ) : (
        <Moon className="w-5 h-5 text-blue-600 group-hover:-rotate-12 transition-transform duration-200" />
      )}
    </button>
  );
}