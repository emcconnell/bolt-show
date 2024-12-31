import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface LoadingStateProps {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
  loadingMessage?: string;
  fullScreen?: boolean;
}

export function LoadingState({ 
  loading, 
  error, 
  children, 
  loadingMessage = 'Loading...', 
  fullScreen = false 
}: LoadingStateProps) {
  const containerClasses = fullScreen 
    ? "fixed inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-50"
    : "min-h-[400px] flex items-center justify-center";

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className="space-y-4 text-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
          <p className="text-gray-400">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClasses}>
        <div className="text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}