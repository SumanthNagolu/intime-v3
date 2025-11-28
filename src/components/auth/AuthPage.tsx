'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { signIn, signUp, signInWithGoogle, type PortalType } from '@/lib/auth/client';

const PORTAL_CONFIG: Record<PortalType, {
  name: string;
  tagline: string;
  redirectPath: string;
  accentHover: string;
}> = {
  academy: {
    name: 'Training Academy',
    tagline: 'Courses, certifications & career growth',
    redirectPath: '/academy/portal',
    accentHover: 'hover:bg-forest-50',
  },
  client: {
    name: 'Client Portal',
    tagline: 'Hire talent & track submissions',
    redirectPath: '/client/portal',
    accentHover: 'hover:bg-gold-50',
  },
  talent: {
    name: 'Talent Portal',
    tagline: 'Jobs, applications & your profile',
    redirectPath: '/talent/portal',
    accentHover: 'hover:bg-forest-50',
  },
  employee: {
    name: 'InTime OS',
    tagline: 'Operations, recruiting & bench sales',
    redirectPath: '/employee/portal',
    accentHover: 'hover:bg-charcoal-50',
  },
};

interface AuthPageProps {
  portal: PortalType;
  mode?: 'signin' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ portal, mode: initialMode = 'signin' }) => {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const config = PORTAL_CONFIG[portal];

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error } = await signInWithGoogle(portal);
      if (error) {
        setError(error.message);
        setIsGoogleLoading(false);
      }
    } catch {
      setError('An unexpected error occurred');
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, { full_name: fullName });
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Account created! Please check your email to verify your account.');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          router.push(config.redirectPath);
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col lg:flex-row">

      {/* Left side - Branding */}
      <div className="lg:w-[40%] px-8 md:px-12 lg:px-16 py-12 lg:py-16 flex flex-col">
        <Link href="/login" className="text-charcoal-400 text-sm hover:text-charcoal-900 transition-colors mb-auto">
          ← Back to Portals
        </Link>

        <div className="my-auto">
          <div className="font-heading text-6xl md:text-7xl lg:text-8xl text-forest-900 tracking-tight leading-none">
            In<span className="text-gold-600">Time</span>
          </div>
          <p className="text-charcoal-400 text-lg mt-4 max-w-sm">
            Enterprise staffing platform
          </p>
        </div>

        <div className="mt-auto pt-8 text-xs text-charcoal-400 font-mono tracking-wider">
          SOC 2 · GDPR · CCPA
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="lg:w-[60%] bg-white lg:rounded-tl-[4rem] flex flex-col min-h-screen lg:min-h-0">

        {/* Header section */}
        <div className="px-8 md:px-12 py-10 lg:py-14 border-b border-charcoal-100">
          <p className="text-gold-700 font-mono text-sm font-semibold tracking-widest uppercase mb-4">
            {config.name}
          </p>

          <h1 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-900 leading-[1] mb-5">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}<span className="text-gold-600">.</span>
          </h1>

          <p className="text-charcoal-500 text-lg font-medium max-w-lg">
            {config.tagline}
          </p>
        </div>

        {/* Form section */}
        <div className="flex-1 px-8 md:px-12 py-10 lg:py-12 flex flex-col">
          <div className="max-w-md">

            {/* Google Sign-In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-charcoal-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-charcoal-400 text-sm">
                  or use email
                </span>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-4 mb-6 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                <CheckCircle2 size={16} />
                <span>{success}</span>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-charcoal-700 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-charcoal-50 border border-charcoal-200 rounded-xl text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-charcoal-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-charcoal-50 border border-charcoal-200 rounded-xl text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-charcoal-700 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={mode === 'signup' ? 8 : 1}
                    className="w-full pl-12 pr-12 py-3.5 bg-charcoal-50 border border-charcoal-200 rounded-xl text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="mt-2 text-charcoal-500 text-xs">
                    Min 8 characters
                  </p>
                )}
              </div>

              {mode === 'signin' && (
                <div className="flex justify-end">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-forest-600 hover:text-forest-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full px-6 py-4 bg-forest-600 hover:bg-forest-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  mode === 'signin' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <p className="mt-8 text-center text-charcoal-500">
              {mode === 'signin' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
                    className="text-forest-600 hover:text-forest-700 font-semibold transition-colors"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
                    className="text-forest-600 hover:text-forest-700 font-semibold transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Push footer down */}
          <div className="mt-auto" />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
