import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // For admin users, show Admin Settings, Projects, and Logout
  const isAdmin = user?.role === 'admin';
  
  if (isAdmin) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 justify-center space-x-4">
            <Link 
              to="/explore" 
              className="px-4 py-2 transition-all duration-200 relative flex items-center space-x-2 text-purple-100 hover:text-white"
            >
              Explore Projects
            </Link>
            <Link 
              to="/admin" 
              className={`px-4 py-2 transition-all duration-200 relative flex items-center space-x-2 ${
                location.pathname === '/admin'
                  ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-400'
                  : 'text-purple-100 hover:text-white hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-purple-400/50'
              }`}
            >
              Admin Settings
            </Link>
            <Link 
              to="/admin/projects" 
              className={`px-4 py-2 transition-all duration-200 relative flex items-center space-x-2 ${
                location.pathname === '/admin/projects'
                  ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-400'
                  : 'text-purple-100 hover:text-white hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-purple-400/50'
              }`}
            >
              Projects
            </Link>
            <button
              onClick={() => logout()}
              className="px-4 py-2 transition-all duration-200 relative flex items-center space-x-2 text-purple-100 hover:text-white hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-purple-400/50"
            >
              <LogIn className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // Regular navigation for non-admin users
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/20 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-4">
            <Link 
              to="/" 
              className={`px-4 py-2 transition-all duration-200 relative flex items-center space-x-2 ${
                location.pathname === '/'
                  ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-400'
                  : 'text-purple-100 hover:text-white hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-purple-400/50'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/explore" 
              className={`px-4 py-2 transition-all duration-200 relative flex items-center space-x-2 ${
                location.pathname === '/explore'
                  ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-400'
                  : 'text-purple-100 hover:text-white hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-purple-400/50'
              }`}
            >
              Explore Projects
            </Link>
            {user && (
              <>
                <Link 
                  to="/profile"
                  className={`px-4 py-2 transition-all duration-200 relative flex items-center space-x-2 ${
                    location.pathname === '/profile'
                      ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-400'
                      : 'text-purple-100 hover:text-white hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-purple-400/50'
                  }`}
                >
                  Profile
                </Link>
                <Link 
                  to="/settings"
                  className={`px-4 py-2 transition-all duration-200 relative flex items-center space-x-2 ${
                    location.pathname === '/settings'
                      ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-400'
                      : 'text-purple-100 hover:text-white hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-purple-400/50'
                  }`}
                >
                  Settings
                </Link>
              </>
            )}
            <Link 
              to="/contact" 
              className={`px-4 py-2 transition-all duration-200 relative flex items-center space-x-2 ${
                location.pathname === '/contact'
                  ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-400'
                  : 'text-purple-100 hover:text-white hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-purple-400/50'
              }`}
            >
              Contact
            </Link>
            {user ? (
              <button
                onClick={() => logout()}
                className="px-4 py-2 transition-all duration-200 relative flex items-center space-x-2 text-purple-100 hover:text-white hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-purple-400/50"
              >
                <LogIn className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <Link 
                to="/login" 
                className={`px-4 py-2 transition-all duration-200 relative flex items-center space-x-2 ${
                  location.pathname === '/login'
                    ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-400'
                    : 'text-purple-100 hover:text-white hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-purple-400/50'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center justify-between w-full">
            <Link to="/" className="text-purple-300 hover:text-purple-200 transition-colors">
              Home
            </Link>
            <button 
              className="p-2 text-purple-100 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link
              to="/explore"
              className="flex items-center space-x-2 px-4 py-2 text-purple-100 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore Projects
            </Link>
            {user && (
              <>
                <Link 
                  to="/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-purple-100 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/settings"
                  className="flex items-center space-x-2 px-4 py-2 text-purple-100 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
              </>
            )}
            <Link 
              to="/contact"
              className="flex items-center space-x-2 px-4 py-2 text-purple-100 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full text-left px-4 py-2 text-purple-100 hover:text-white"
              >
                <LogIn className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center space-x-2 px-4 py-2 text-purple-100 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}