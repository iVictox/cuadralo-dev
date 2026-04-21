"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem("cuadralo-mode");
    const initialMode = savedMode || "dark";
    setMode(initialMode);
    applyMode(initialMode);
  }, []);

  const applyMode = (modeId) => {
    const html = document.documentElement;
    if (modeId === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  };

  const toggleMode = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    localStorage.setItem("cuadralo-mode", newMode);
    applyMode(newMode);
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ 
      mode, 
      isDark: mode === "dark",
      toggleMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}