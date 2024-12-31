import React from 'react';
import { Code2, Send, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProtectedNavigation } from '../hooks/useProtectedNavigation';

export function Hero() {
  const navigate = useNavigate();
  const { navigateWithAuth } = useProtectedNavigation();

  const handleSubmitClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateWithAuth('/submit');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="flex items-center justify-center space-x-2 text-purple-300">
            <Code2 className="w-6 h-6" />
            <span className="text-lg font-medium">Bolt Showcase</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white">
            Showcase Your
            <span className="block text-purple-300">Bolt.new Projects</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-purple-100 opacity-90">
            Discover and explore amazing projects built with Bolt.new!
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <a
              href="#"
              onClick={handleSubmitClick}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-xl shadow-lg ring-2 ring-purple-400/20 flex items-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Submit Project</span>
            </a>
            <button 
              onClick={() => navigate('/explore')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-xl shadow-lg ring-2 ring-white/20 flex items-center space-x-2 backdrop-blur-sm"
            >
              <Zap className="w-5 h-5" />
              <span>Explore Projects</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}