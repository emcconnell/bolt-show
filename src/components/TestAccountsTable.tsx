import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { MOCK_USERS } from '../services/auth';
import { useDevMode } from '../contexts/DevModeContext';

const TEST_ACCOUNTS = [
  {
    email: 'admin@admin.com',
    password: 'demo123$',
    role: 'Admin',
    description: 'Full system access'
  },
  {
    email: 'business@user.com',
    password: 'demo123$',
    role: 'Business',
    description: 'Business dashboard access'
  },
  {
    email: 'user@user.com',
    password: 'demo123$',
    role: 'User',
    description: 'Standard user access'
  }
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function TestAccountsTable() {
  const { devMode } = useDevMode();
  
  if (!devMode || process.env.NODE_ENV === 'production') {
    return null;
  }

  const newUsers = MOCK_USERS
    .filter(user => !user.isTestAccount && user.createdAt)
    .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

  return (
    <div className="mt-8 rounded-lg overflow-hidden transition-all duration-300">
      <div className="bg-red-500 p-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-white" />
        <p className="text-white font-medium">WARNING: Test Accounts Only - Remove Before Production Deploy</p>
      </div>
      
      <div className="bg-gray-900/50 backdrop-blur-sm p-4">
        <h3 className="text-lg font-semibold text-white mb-4">TEST ACCOUNTS - Development Only</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-2 px-4 text-purple-300 font-medium">Role</th>
                <th className="py-2 px-4 text-purple-300 font-medium">Email</th>
                <th className="py-2 px-4 text-purple-300 font-medium">Password</th>
                <th className="py-2 px-4 text-purple-300 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {TEST_ACCOUNTS.map((account) => (
                <tr key={account.email} className="border-b border-white/10">
                  <td className="py-2 px-4 text-white">{account.role}</td>
                  <td className="py-2 px-4 text-white font-mono text-sm">{account.email}</td>
                  <td className="py-2 px-4 text-white font-mono text-sm">{account.password}</td>
                  <td className="py-2 px-4 text-gray-300">{account.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {newUsers.length > 0 && (
        <div className="mt-4 bg-gray-900/50 backdrop-blur-sm p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Recently Signed Up Users
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-2 px-4 text-purple-300 font-medium">Username</th>
                  <th className="py-2 px-4 text-purple-300 font-medium">Email</th>
                  <th className="py-2 px-4 text-purple-300 font-medium">Status</th>
                  <th className="py-2 px-4 text-purple-300 font-medium">Created At</th>
                </tr>
              </thead>
              <tbody>
                {newUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/10">
                    <td className="py-2 px-4 text-white">{user.name}</td>
                    <td className="py-2 px-4 text-white font-mono text-sm">{user.email}</td>
                    <td className="py-2 px-4"><span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">{user.status}</span></td>
                    <td className="py-2 px-4 text-gray-300">{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}