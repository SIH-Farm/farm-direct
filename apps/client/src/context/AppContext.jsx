import React, { createContext, useContext, useState, useCallback } from 'react';
import { i18n } from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [currentRole, setCurrentRole] = useState('consumer'); // 'farmer', 'consumer', 'bulk_buyer', 'admin'
  const [currentFarmerId, setCurrentFarmerId] = useState('F001');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
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
    return value || path;
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
