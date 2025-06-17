"use client";
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Eye, EyeOff, Mail, Lock, Chrome, Loader2, AlertTriangle } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await authClient.signIn.email({
    
              email,
              password,
              callbackURL: "/dashboard",
              /**
               * remember the user session after the browser is closed. 
               * @default true
               */
              rememberMe: true
      }, {
          //callbacks
      })
      console.log(data, error)
    } catch (err) {
      console.log(err)
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    } catch (err) {
      console.log(err)
      setError('Google login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full border border-gray-100">
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">H</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome to Hospiwise</h1>
          <p className="text-gray-600 mt-1">
            Sign in to access the Decision Support System
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="...@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Chrome className="w-4 h-4" />
            Sign in with Google
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <a href="/auth/signup" className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}