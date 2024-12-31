import React from 'react';
import { Building2, TrendingUp, Users } from 'lucide-react';

export function BusinessDashboard() {
  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Business Dashboard</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <Building2 className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Active Projects</h3>
            </div>
            <p className="text-3xl font-bold text-white">8</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Growth</h3>
            </div>
            <p className="text-3xl font-bold text-white">24%</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Team Members</h3>
            </div>
            <p className="text-3xl font-bold text-white">6</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Business Metrics</h2>
            <div className="space-y-4">
              <p className="text-gray-300">No metrics available yet.</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Team Activity</h2>
            <p className="text-gray-300">No recent team activity to display.</p>
          </div>
        </div>
      </div>
    </div>
  );
}