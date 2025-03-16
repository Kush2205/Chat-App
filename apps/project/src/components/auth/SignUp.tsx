import React from 'react';
import { Mail, KeyRound, User } from 'lucide-react';
import { AuthLayout } from './AuthLayout';

interface SignUpProps {
  onToggleAuth: () => void;
  onBack: () => void;
}

export function SignUp({ onToggleAuth, onBack }: SignUpProps) {
  return (
    <AuthLayout title="Create your account" onBack={onBack}>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="name"
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent dark:bg-neutral-800 dark:text-white"
              placeholder="John Doe"
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              id="email"
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent dark:bg-neutral-800 dark:text-white"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              id="password"
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent dark:bg-neutral-800 dark:text-white"
              placeholder="••••••••"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
        >
          Create Account
        </button>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <button
              onClick={onToggleAuth}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}