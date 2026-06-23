import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark"); // Locked to dark mode

  useEffect(() => {
    const root = document.documentElement;
    // Always remove data-theme to ensure dark mode fallback styles apply
    root.removeAttribute("data-theme");
    localStorage.setItem("pv_theme", "dark");
  }, [theme]);

  // Make toggleTheme a no-op since we are dark-only
  const toggleTheme = () => {
    console.log("Light theme has been disabled by user request. Staying dark.");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
