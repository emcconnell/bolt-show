import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { useAuth } from '../contexts/AuthContext';
import { TestAccountsTable } from '../components/TestAccountsTable';
import { useDevMode } from '../contexts/DevModeContext';

export function LoginPage() {
  useScrollToTop();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { devMode } = useDevMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      const redirectPath = sessionStorage.getItem('redirect_after_login');
      if (redirectPath) {
        sessionStorage.removeItem('redirect_after_login');
        navigate(redirectPath);
      } else if (email === 'admin@admin.com') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 pb-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <LogIn className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          </div>
          <p className="text-center text-gray-300 mb-6 bg-gray-900/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">Login to submit a Bolt.new project.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500 bg-white/5"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm" dangerouslySetInnerHTML={{ __html: error }}>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl shadow-lg ring-2 ring-purple-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
              Create an account
            </Link>
          </div>
          {devMode && !error && <TestAccountsTable />}
        </div>
      </div>
    </div>
  );
}