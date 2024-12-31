import React from 'react';
import { Shield } from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { TagManagement } from '../components/admin/TagManagement';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export function AdminSettings() {
  useScrollToTop();
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-8">
            <Shield className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Tag Management</h2>
              <TagManagement />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}