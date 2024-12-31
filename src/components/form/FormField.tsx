import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  children: React.ReactNode;
  description?: string;
}

export function FormField({ 
  label, 
  error, 
  touched, 
  required, 
  children,
  description 
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </span>
        {description && (
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        )}
        <div className="mt-1">
          {children}
        </div>
      </label>
      
      {touched && error && (
        <p className="text-red-400 text-sm flex items-center mt-1">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}