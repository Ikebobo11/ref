/**
 * LETCON - Theme Context
 * Manages dark/light mode with localStorage persistence and system preference detection.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = 'letcon-theme';

/**
 * Gets the initial theme from localStorage or system preference.
 * @returns {string} 'dark' or 'light'.
 */
function getInitialTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

/**
 * Theme Provider component.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  /**
   * Applies the theme class to the document root.
   */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  /**
   * Toggles between dark and light mode.
   */
  const toggleTheme = useCallback(() => {
