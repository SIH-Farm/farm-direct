import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { i18n } from '../data/mockData';

const THEME_STORAGE_KEY = 'farmdirect-theme';
const LANGUAGE_STORAGE_KEY = 'farmdirect-language';
const ROLE_STORAGE_KEY = 'farmdirect-role';
const VALID_ROLES = ['farmer', 'consumer', 'bulk_buyer', 'admin'];

/** Remembered theme, else whatever the operating system prefers. */
function readInitialTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function readInitialLanguage() {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'hi') return stored;
  } catch {
    // Storage unavailable (private mode) — fall through to the default.
  }
  return 'en';
}

/**
 * Remembered role, so a refresh or a direct link to an admin route still lands on
 * that route instead of silently falling back to a consumer session. Without this,
 * /analytics and /logistics always bounce to "Access Restricted" on a hard load.
 */
function readInitialRole() {
  try {
    const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
    if (VALID_ROLES.includes(stored)) return stored;
  } catch {
    // Storage unavailable (private mode) — fall through to the default.
  }
  return 'consumer';
}

const AppContext = createContext();

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme);
  const [language, setLanguage] = useState(readInitialLanguage);
  const [currentRole, setCurrentRole] = useState(readInitialRole);
  const [currentFarmerId, setCurrentFarmerId] = useState('F001');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Apply + persist the theme, so a refresh never drops the judge back to light mode.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage unavailable — theme still applies for this session.
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Storage unavailable — language still applies for this session.
    }
  }, [language]);

  // Persist the active role so admin deep links survive a refresh mid-demo.
  useEffect(() => {
    try {
      window.localStorage.setItem(ROLE_STORAGE_KEY, currentRole);
    } catch {
      // Storage unavailable — role still applies for this session.
    }
  }, [currentRole]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  }, []);

  const t = useCallback((path) => {
    const keys = path.split('.');
    let value = i18n[language];
    for (const key of keys) {
      value = value?.[key];
    }
    if (value === undefined) {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing "${path}" for language "${language}"`);
      }
      return path;
    }
    return value;
  }, [language]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <AppContext.Provider
      value={{
        theme,
        language,
        currentRole,
        currentFarmerId,
        sidebarOpen,
        toggleTheme,
        toggleLanguage,
        setLanguage,
        setCurrentRole,
        setCurrentFarmerId,
        toggleSidebar,
        setSidebarOpen,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
