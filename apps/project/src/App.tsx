import React, { useState, useEffect } from 'react';
import { MessageSquare, PenTool, Users, Zap, Share2, Lock, Moon, Sun } from 'lucide-react';
import { SignIn } from './components/auth/SignIn';
import { SignUp } from './components/auth/SignUp';

function FeatureCard({ icon: Icon, title, description }: { 
  icon: React.ElementType, 
  title: string, 
  description: string 
}) {
  return (
    <div className="bg-white dark:bg-neutral-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
      </div>
      <h3 className="text-xl font-semibold mb-2 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (showAuth) {
    return isSignUp ? (
      <SignUp 
        onToggleAuth={() => setIsSignUp(false)}
        onBack={() => setShowAuth(false)}
      />
    ) : (
      <SignIn 
        onToggleAuth={() => setIsSignUp(true)}
        onBack={() => setShowAuth(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-neutral-800 dark:to-neutral-900 transition-colors duration-200">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">CollabSpace</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Pricing</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Contact</a>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
            <button 
              onClick={() => {
                setIsSignUp(false);
                setShowAuth(true);
              }}
              className="px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Login
            </button>
            <button 
              onClick={() => {
                setIsSignUp(true);
                setShowAuth(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Collaborate in Real-time with Chat & Whiteboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Connect, communicate, and create together. Experience seamless collaboration with integrated chat and whiteboard features.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => {
                  setIsSignUp(true);
                  setShowAuth(true);
                }}
                className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Get Started Free
              </button>
              <button className="px-8 py-4 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-neutral-700 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80" 
              alt="Collaboration illustration" 
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16" id="features">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Everything you need for seamless collaboration</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={MessageSquare}
            title="Real-time Chat"
            description="Instant messaging with rich text formatting, file sharing, and thread support."
          />
          <FeatureCard 
            icon={PenTool}
            title="Interactive Whiteboard"
            description="Draw, sketch, and brainstorm together with our powerful whiteboard tools."
          />
          <FeatureCard 
            icon={Users}
            title="Team Collaboration"
            description="Work together seamlessly with unlimited team members and projects."
          />
          <FeatureCard 
            icon={Zap}
            title="Lightning Fast"
            description="Built for speed with instant updates and low-latency connections."
          />
          <FeatureCard 
            icon={Share2}
            title="Easy Sharing"
            description="Share your work with a single click and control access permissions."
          />
          <FeatureCard 
            icon={Lock}
            title="Enterprise Security"
            description="Bank-grade encryption and security features to protect your data."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 dark:bg-indigo-500 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your team's collaboration?
          </h2>
          <p className="text-indigo-100 mb-8">
            Join thousands of teams already using CollabSpace to work better together.
          </p>
          <button 
            onClick={() => {
              setIsSignUp(true);
              setShowAuth(true);
            }}
            className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors dark:hover:bg-gray-100"
          >
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-neutral-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xl font-bold text-gray-800 dark:text-white">CollabSpace</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 max-w-sm">
                Making team collaboration seamless and efficient with integrated chat and whiteboard solutions.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Features</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Pricing</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Security</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">About</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Blog</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Careers</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Support</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Help Center</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Contact</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Status</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-neutral-700 mt-12 pt-8">
            <p className="text-center text-gray-600 dark:text-gray-300">
              © 2025 CollabSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;