import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'bright' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('terrasentinel_theme') as ThemeMode;
    if (saved === 'bright' || saved === 'dark') return saved;
    // Default to bright mode as per reference image design
    return 'bright';
  });

  const applyTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('terrasentinel_theme', newTheme);
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      document.body.style.backgroundColor = '#090a0c';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'bright');
      document.body.style.backgroundColor = '#f4f5f8';
    }
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    applyTheme(theme === 'bright' ? 'dark' : 'bright');
  };

  const setTheme = (newTheme: ThemeMode) => {
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
