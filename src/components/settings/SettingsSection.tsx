import React from 'react';
import { HelpCircle } from 'lucide-react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  tooltip?: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, description, tooltip, children }: SettingsSectionProps) {
  return (
    <div className="pb-8 border-b border-white/10">
      <div className="flex items-center space-x-2 mb-2">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {tooltip && (
          <div className="group relative">
            <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-xs text-gray-300 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      {description && (
        <p className="text-sm text-gray-400 mb-4">{description}</p>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}