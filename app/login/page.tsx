'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  
  // Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Validation for Sign Up
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    
    try {
      if (isSignUp) {
        // TODO: Add your Supabase/Auth SIGN UP logic here
        console.log('Signing up with:', email);
      } else {
        // TODO: Add your Supabase/Auth LOGIN logic here
        console.log('Logging in with:', email);
      }
      
      // Simulate auth delay then redirect
      setTimeout(() => {
        setLoading(false);
        router.push('/');
      }, 1000);
      
    } catch (err) {
      setError('An error occurred during authentication.');
      setLoading(false);
    }
  };

  // Toggle between Login and Sign Up mode
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent">
      <div className="relative group w-full max-w-md mx-4">
        {/* Ambient background glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative w-full bg-white/70 dark:bg-[#0f172a]/80 backdrop-blur-2xl p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Globe size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              {isSignUp ? 'Enter your details to get started' : 'Enter your credentials to access the hub'}
            </p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Email Address
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com" 
                className="w-full bg-slate-100/50 dark:bg-stone-50 border border-slate-200 dark:border-stone-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm text-slate-900 dark:text-stone-900 placeholder:text-slate-400 dark:placeholder:text-stone-400 shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Password
              </label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-100/50 dark:bg-stone-50 border border-slate-200 dark:border-stone-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm text-slate-900 dark:text-stone-900 placeholder:text-slate-400 dark:placeholder:text-stone-400 shadow-inner"
              />
            </div>

            {/* Conditionally render Confirm Password field */}
            {isSignUp && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-slate-100/50 dark:bg-stone-50 border border-slate-200 dark:border-stone-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm text-slate-900 dark:text-stone-900 placeholder:text-slate-400 dark:placeholder:text-stone-400 shadow-inner"
                />
              </div>
            )}
            
            {/* Hide "Remember me" and "Forgot password" during Sign Up */}
            {!isSignUp && (
              <div className="flex items-center justify-between py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800" 
                  />
                  <span className="text-sm text-slate-500">Remember me</span>
                </label>
                <button type="button" className="text-sm text-amber-500 font-medium hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>
          
          <p className="mt-8 text-center text-xs text-slate-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              type="button"
              onClick={toggleMode}
              className="text-amber-500 font-bold hover:underline"
            >
              {isSignUp ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}