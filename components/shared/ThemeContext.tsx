"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "professional" | "farmer" | "premium";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "farmer",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("farmer");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-farmer", "theme-premium");
    if (theme === "farmer") {
      root.classList.add("theme-farmer");
    } else if (theme === "premium") {
      root.classList.add("theme-premium");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeContext);
