import React from 'react';
import { Lock } from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';

export function PrivacyPage() {
  useScrollToTop();

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 mb-8">
          <Lock className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-invert prose-purple">
          <div className="space-y-6 text-gray-300">
            <p>
              At Bolt Showcase, we take your privacy seriously. Here's how we handle your information.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">Information Collection</h2>
            <p>
              We only collect information necessary for your Bolt Showcase account and project submissions. This includes your username and the project details you choose to share.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">Data Protection</h2>
            <p>
              Your privacy matters to us. We don't share your personal information with anyone, and we'll never send you unsolicited emails or spam messages. Your data is used solely for operating Bolt Showcase.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">Project Information</h2>
            <p>
              When you submit a project, it becomes publicly visible on Bolt Showcase. Only share project information that you're comfortable making public.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">Cookies</h2>
            <p>
              We use essential cookies to keep you logged in and remember your preferences. No tracking or advertising cookies are used.
            </p>

            <p className="text-sm text-gray-400 mt-8">
              Last updated: November 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}