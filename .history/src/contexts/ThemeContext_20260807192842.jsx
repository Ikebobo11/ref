/**
 * LETCON - Theme Context
 * Manages dark/light mode with localStorage persistence and system preference detection.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);


