import React from 'react';
import { useDevMode } from '../contexts/DevModeContext';
import { HelpCircle } from 'lucide-react';

export function DevModeToggle() {
  const { devMode, toggleDevMode } = useDevMode();

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center space-x-2">
        <span className="text-white font-medium">Development Mode</span>
        <div className="group relative">
          <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-xs text-gray-300 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            Enables development features and test account credentials. For development purposes only.
          </div>
        </div>
      </div>
      <button
        onClick={toggleDevMode}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
          devMode ? 'bg-purple-500' : 'bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            devMode ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}