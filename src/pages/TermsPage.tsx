import React from 'react';
import { Shield } from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';

export function TermsPage() {
  useScrollToTop();

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 mb-8">
          <Shield className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
        </div>
        
        <div className="prose prose-invert prose-purple">
          <div className="space-y-6 text-gray-300">
            <p>
              Welcome to Bolt Showcase! These terms of service outline the rules and regulations for using our platform.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">1. Platform Usage</h2>
            <p>
              Bolt Showcase is a platform for discovering and sharing projects built with Bolt.new. By using our platform, you agree to showcase only projects that you have the right to share.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">2. User Content</h2>
            <p>
              When submitting projects, ensure all content is appropriate and doesn't violate any intellectual property rights. SQYER reserves the right to remove any content that violates these terms.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">3. Account Responsibility</h2>
            <p>
              You're responsible for maintaining the security of your account and any activities that occur under it. Don't share your login credentials with others.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">4. Modifications</h2>
            <p>
              SQYER may revise these terms at any time. By continuing to use Bolt Showcase, you agree to be bound by the updated terms.
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