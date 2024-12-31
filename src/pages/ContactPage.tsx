import React from 'react';
import { MessageSquare, Send, Heart } from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { useProtectedNavigation } from '../hooks/useProtectedNavigation';

export function ContactPage() {
  useScrollToTop();
  const { navigateWithAuth } = useProtectedNavigation();

  const handleSubmitClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateWithAuth('/submit');
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 mb-8">
          <MessageSquare className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Contact Us</h1>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl space-y-6">
          <p className="text-gray-300">
            Made with <Heart className="w-4 h-4 mx-2 text-purple-400 inline" fill="currentColor" /> by <a href="https://sqyer.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">SQYER</a> using <a href="https://bolt.new" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">Bolt.new</a>. SQYER maintains Bolt Showcase. If you have questions, issues, or suggestions, reach out to us at <a href="mailto:contact@sqyer.com" className="text-purple-400 hover:text-purple-300">contact@sqyer.com</a>.
          </p>

          <button
            onClick={handleSubmitClick}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl shadow-lg ring-2 ring-purple-400/20 flex items-center justify-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>Submit a Bolt.new Project</span>
          </button>
        </div>
      </div>
    </div>
  );
}