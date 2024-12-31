import React from 'react';
import { Users, Settings, BarChart3, Terminal } from 'lucide-react';
import { DevModeToggle } from '../components/DevModeToggle';

export function AdminDashboard() {
  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Total Users</h3>
            </div>
            <p className="text-3xl font-bold text-white">1,234</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Projects</h3>
            </div>
            <p className="text-3xl font-bold text-white">567</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">System Status</h3>
            </div>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
              All Systems Operational
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <Terminal className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Development Settings</h2>
            </div>
            <DevModeToggle />
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <p className="text-gray-300">No recent activity to display.</p>
          </div>
        </div>
      </div>
    </div>
  );
}