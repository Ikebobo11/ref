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
