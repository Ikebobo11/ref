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
      console.error('[LETCON] Failed to load settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Updates settings in Firestore and refreshes local state.
   * @param {Object} data - The settings data to save.
   * @param {string} updatedBy - The user ID performing the update.
   */
  const updateSettings = useCallback(async (data, updatedBy) => {
    await saveSettings(data, updatedBy);
    clearSettingsCache();
    await loadSettings(true);
  }, [loadSettings]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const value = {
    settings,
    loading,
    error,
    refreshSettings: loadSettings,
    updateSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook to access settings context.
 * @returns {{ settings: Object, loading: boolean, error: string|null, refreshSettings: Function, updateSettings: Function }}
 */
export function useSettings() {
