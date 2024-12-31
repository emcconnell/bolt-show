import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';

export function ForgotPasswordPage() {
  useScrollToTop();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Mock success response
    setSuccess(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen pt-16 pb-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl">
          {!success ? (
            <>
              <div className="flex items-center justify-center space-x-2 mb-8">
                <KeyRound className="w-8 h-8 text-purple-400" />
                <h1 className="text-2xl font-bold text-white">Reset Password</h1>
              </div>

              <p className="text-gray-300 text-center mb-6">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email Address
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

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl shadow-lg ring-2 ring-purple-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending Instructions...' : 'Send Reset Instructions'}
                </button>

                <div className="mt-6 text-center">
                  <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                    Return to Login
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Check Your Email</h2>
              <p className="text-gray-300">
                If an account exists for {email}, you will receive password reset instructions. If you don't receive an email within 30 minutes, please contact <a href="https://sqyer.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">SQYER</a>.
              </p>
              <Link
                to="/login"
                className="inline-block mt-4 text-purple-400 hover:text-purple-300 font-medium"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}