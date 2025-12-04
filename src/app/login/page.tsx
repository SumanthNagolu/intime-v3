'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { signIn, signInWithGoogle, type PortalType } from '@/lib/auth/client';

const PORTALS: Array<{
  id: PortalType;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  redirectPath: string;
}> = [
  {
    id: 'employee',
    name: 'Employee',
    description: 'Internal operations & workspace',
    icon: Users,
    color: 'text-forest-600',
    bgColor: 'bg-forest-50 hover:bg-forest-100 border-forest-200',
    redirectPath: '/employee/admin/dashboard',
  },
  {
    id: 'client',
    name: 'Client',
    description: 'Track candidates & submissions',
    icon: Building2,
    color: 'text-gold-600',
    bgColor: 'bg-gold-50 hover:bg-gold-100 border-gold-200',
    redirectPath: '/client/portal',
  },
  {
    id: 'talent',
    name: 'Talent',
    description: 'Jobs & applications',
    icon: Briefcase,
    color: 'text-rust-600',
    bgColor: 'bg-rust-50 hover:bg-rust-100 border-rust-200',
    redirectPath: '/talent/portal',
  },
  {
    id: 'academy',
    name: 'Academy',
    description: 'Courses & certifications',
    icon: GraduationCap,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50 hover:bg-sky-100 border-sky-200',
    redirectPath: '/academy/portal',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedPortal, setSelectedPortal] = useState<PortalType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const portal = PORTALS.find((p) => p.id === selectedPortal);

  const handleGoogleSignIn = async () => {
    if (!selectedPortal) return;
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error } = await signInWithGoogle(selectedPortal);
      if (error) {
        setError(error.message);
        setIsGoogleLoading(false);
      }
    } catch {
      setError('An unexpected error occurred');
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortal || !portal) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        router.push(portal.redirectPath);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-charcoal-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="font-heading text-5xl sm:text-6xl text-forest-900 tracking-tight">
              In<span className="text-gold-600">Time</span>
            </h1>
          </Link>
          <p className="text-charcoal-500 mt-2 text-sm">
            Enterprise Staffing Platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-charcoal-100 overflow-hidden">
          {!selectedPortal ? (
            /* Portal Selection */
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-charcoal-900 mb-1">
                Welcome back
              </h2>
              <p className="text-charcoal-500 text-sm mb-6">
                Select your portal to continue
              </p>

              <div className="space-y-3">
                {PORTALS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPortal(p.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group ${p.bgColor}`}
                    >
                      <div className={`p-2.5 rounded-lg bg-white shadow-sm ${p.color}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-charcoal-900">
                          {p.name}
                        </div>
                        <div className="text-xs text-charcoal-500">
                          {p.description}
                        </div>
                      </div>
                      <ArrowRight
                        size={18}
                        className="text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-0.5 transition-all"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Login Form */
            <div>
              {/* Header */}
              <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-charcoal-100">
                <button
                  onClick={() => {
                    setSelectedPortal(null);
                    setError(null);
                    setEmail('');
                    setPassword('');
                  }}
                  className="flex items-center gap-1 text-sm text-charcoal-500 hover:text-charcoal-900 transition-colors mb-4"
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>

                <div className="flex items-center gap-3">
                  {portal && (
                    <div className={`p-2 rounded-lg ${portal.bgColor.split(' ')[0]} ${portal.color}`}>
                      <portal.icon size={20} />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-charcoal-900">
                      {portal?.name} Portal
                    </h2>
                    <p className="text-charcoal-500 text-sm">
                      Sign in to continue
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 sm:p-8">
                {/* Google Sign-In */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-charcoal-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-charcoal-400 text-xs uppercase tracking-wide">
                      or
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-2 p-3 mb-5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Email Form */}
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div>
                    <label className="block text-charcoal-700 text-sm font-medium mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-charcoal-50 border border-charcoal-200 rounded-xl text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-charcoal-700 text-sm font-medium mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400"
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-charcoal-50 border border-charcoal-200 rounded-xl text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-forest-600 hover:text-forest-700 font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full px-4 py-3 bg-forest-600 hover:bg-forest-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                {/* Sign Up Link */}
                <p className="mt-6 text-center text-charcoal-500 text-sm">
                  Don&apos;t have an account?{' '}
                  <Link
                    href={`/auth/${selectedPortal}`}
                    className="text-forest-600 hover:text-forest-700 font-semibold transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-charcoal-400">
            By continuing, you agree to our{' '}
            <Link href="/legal/terms" className="underline hover:text-charcoal-600">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/legal/privacy" className="underline hover:text-charcoal-600">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
