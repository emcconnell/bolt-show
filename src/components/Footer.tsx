import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900/20 backdrop-blur-lg text-gray-300 border-t border-white/10 relative mt-[80px]">
      <div className="absolute inset-x-0 -top-12 flex justify-center">
        <p className="text-sm flex items-center bg-gray-900/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
            Made with <Heart className="w-4 h-4 mx-2 text-purple-400" fill="currentColor" /> by <a href="https://sqyer.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 mx-2">SQYER</a> using <a href="https://bolt.new" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 mx-2">Bolt.new</a>
        </p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-4 flex-wrap justify-center">
            <p className="text-sm">© 2024 <a href="https://sqyer.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">SQYER</a> All Rights Reserved</p>
            <Link to="/terms" className="text-sm hover:text-purple-400 transition-colors">Terms</Link>
            <Link to="/privacy" className="text-sm hover:text-purple-400 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}