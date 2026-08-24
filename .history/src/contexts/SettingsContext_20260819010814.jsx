/**
 * LETCON - Settings Context
 * Provides app-wide platform settings loaded from Firestore with fallback to constants.
 * Wraps the app to make settings available to all components.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings, clearSettingsCache } from '../services/settingsService';

const SettingsContext = createContext(null);

/**
 * SettingsProvider component - loads settings on mount and provides them via context.
 */
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Loads settings from Firestore (or cache).
   */
  const loadSettings = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSettings(forceRefresh);
      setSettings(data);
    } catch (err) {
