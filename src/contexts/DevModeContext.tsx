import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface DevModeContextType {
  devMode: boolean;
  toggleDevMode: () => void;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

const DEV_MODE_KEY = 'bolt_showcase_dev_mode';

export function DevModeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [devMode, setDevMode] = useState(() => {
    if (process.env.NODE_ENV === 'production') return false;
    return sessionStorage.getItem(DEV_MODE_KEY) === 'true';
  });

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      setDevMode(false);
      sessionStorage.removeItem(DEV_MODE_KEY);
      return;
    }
    sessionStorage.setItem(DEV_MODE_KEY, String(devMode));
  }, [devMode]);

  const toggleDevMode = () => {
    if (user?.role !== 'admin') return;
    setDevMode(prev => !prev);
    console.log(`Development mode ${!devMode ? 'enabled' : 'disabled'} by admin user ${user?.email}`);
  };

  return (
    <DevModeContext.Provider value={{ devMode, toggleDevMode }}>
      {children}
    </DevModeContext.Provider>
  );
}

export function useDevMode() {
  const context = useContext(DevModeContext);
  if (context === undefined) {
    throw new Error('useDevMode must be used within a DevModeProvider');
  }
  return context;
}