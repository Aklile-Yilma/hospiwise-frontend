'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Shield, Smartphone, Loader2, AlertTriangle } from 'lucide-react';

export default function TwoFactorForm() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    // if (session?.user && !session.user.twoFactorEnabled) {
    //   router.push('/dashboard');
    // }
  }, [session, router]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // try {
    //   const result = await authClient.twoFactor.verifyTotp({
    //     code,
    //     trustDevice: true, // Remember this device for 30 days
    //   });

    //   if (result.error) {
    //     setError(result.error.message || 'Invalid code');
    //   } else {
    //     router.push('/dashboard');
    //   }
    // } catch (err) {
    //   console.log(err)
    //   setError('Verification failed');
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full border border-gray-100">
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Two-Factor Authentication</h1>
          <p className="text-gray-600 mt-1">
            Enter the verification code from your authenticator app
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

          <form onSubmit={handleVerification} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="block text-sm font-semibold text-gray-700">
                Verification Code
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white text-center text-lg tracking-widest font-mono"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <div className="text-center text-sm text-gray-600">
            Can't access your authenticator app?{' '}
            <a href="/auth/backup-codes" className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors">
              Use backup code
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}