import React from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  onBack: () => void;
}

export function AuthLayout({ children, title, onBack }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button 
          onClick={onBack}
          className="mb-8 flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to home
        </button>
        <div className="bg-white dark:bg-neutral-700 rounded-xl shadow-xl p-8">
          <div className="flex items-center space-x-2 mb-8">
            <MessageSquare className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">CollabSpace</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
}