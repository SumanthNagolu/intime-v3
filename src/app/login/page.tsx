'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ShieldCheck
} from 'lucide-react';
import { signIn, signInWithGoogle, getUserRole, getEmployeeRedirectPath, setOrgCookie, type PortalType } from '@/lib/auth/client';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const PORTALS: Array<{
  id: PortalType;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  redirectPath: string;
}> = [
  {
    id: 'employee',
    name: 'Employee',
    description: 'Internal operations & workspace',
    icon: Users,
    color: 'text-forest-600',
    bgColor: 'hover:bg-forest-50',
    borderColor: 'hover:border-forest-500',
    redirectPath: '/employee/workspace/dashboard',
  },
  {
    id: 'client',
    name: 'Client',
    description: 'Track candidates & submissions',
    icon: Building2,
    color: 'text-gold-600',
    bgColor: 'hover:bg-gold-50',
    borderColor: 'hover:border-gold-500',
    redirectPath: '/client/portal',
  },
  {
    id: 'talent',
    name: 'Talent',
    description: 'Jobs & applications',
    icon: Briefcase,
    color: 'text-charcoal-600',
    bgColor: 'hover:bg-charcoal-50',
    borderColor: 'hover:border-charcoal-500',
    redirectPath: '/employee/recruiting/talent',
  },
  {
    id: 'academy',
    name: 'Academy',
    description: 'Courses & certifications',
    icon: GraduationCap,
    color: 'text-sky-600',
    bgColor: 'hover:bg-sky-50',
    borderColor: 'hover:border-sky-500',
    redirectPath: '/academy/portal',
  },
];

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const [selectedPortal, setSelectedPortal] = useState<PortalType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const portal = PORTALS.find((p) => p.id === selectedPortal);

  // Check if user is already authenticated and redirect to portal
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // User is already authenticated, redirect to portal
          if (redirectTo) {
            // Use the redirect param if provided (e.g., from middleware)
            router.replace(redirectTo);
          } else {
            // Default to employee portal with role-based redirect
            const role = await getUserRole(user.id);
            const redirectPath = getEmployeeRedirectPath(role);
            router.replace(redirectPath);
          }
        } else {
          setIsCheckingAuth(false);
        }
      } catch {
        // Auth check failed, show login form
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

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
        // Set org cookie immediately after login (avoids DB lookup on every request)
        await setOrgCookie();

        // If there's a redirect URL from middleware, use it
        if (redirectTo) {
          router.push(redirectTo);
        } else if (selectedPortal === 'employee') {
          // For employee portal, get user role and redirect based on it
          const role = await getUserRole();
          const redirectPath = getEmployeeRedirectPath(role);
          router.push(redirectPath);
        } else {
          router.push(portal.redirectPath);
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px' 
        }} 
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex flex-col items-center group">
            <div className="flex items-center justify-center w-12 h-12 border border-gold-500 bg-charcoal-800 mb-4 group-hover:bg-gold-500 transition-colors duration-300">
              <span className="font-heading font-black italic text-2xl text-gold-500 group-hover:text-charcoal-900 transition-colors duration-300">I</span>
            </div>
            <h1 className="font-heading font-black text-2xl text-white tracking-[0.2em]">
              INTIME
            </h1>
            <div className="h-px w-full bg-gold-500/30 mt-2" />
            <p className="text-gold-500 mt-2 text-[10px] font-mono uppercase tracking-[0.3em]">
              Secure Access Terminal
            </p>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-sm border-2 border-charcoal-200 shadow-sharp overflow-hidden">
          {/* Technical Header */}
          <div className="bg-charcoal-50 border-b border-charcoal-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-charcoal-300 rounded-full" />
              <span className="text-[10px] font-mono uppercase text-charcoal-500 tracking-wider">
                {selectedPortal ? `AUTH_REQ // ${portal?.name.toUpperCase()}` : 'SELECT_PORTAL'}
              </span>
            </div>
            <ShieldCheck size={14} className="text-charcoal-400" />
          </div>

          {!selectedPortal ? (
            /* Portal Selection */
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-heading font-bold text-charcoal-900 mb-2">
                Identify Role
              </h2>
              <p className="text-charcoal-500 text-sm mb-8">
                Select your access level to proceed with authentication.
              </p>

              <div className="space-y-3">
                {PORTALS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPortal(p.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xs border border-charcoal-200 transition-all duration-200 group hover:border-l-4 ${p.borderColor} ${p.bgColor}`}
                    >
                      <div className={`p-2 bg-white border border-charcoal-100 ${p.color}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-charcoal-900 text-sm uppercase tracking-wide">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-charcoal-500 font-mono mt-0.5">
                          {p.description}
                        </div>
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-charcoal-300 group-hover:text-charcoal-900 group-hover:translate-x-1 transition-all"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Login Form */
            <div>
              {/* Back Button */}
              <div className="px-6 sm:px-8 pt-6">
                <button
                  onClick={() => {
                    setSelectedPortal(null);
                    setError(null);
                    setEmail('');
                    setPassword('');
                  }}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-400 hover:text-charcoal-900 transition-colors"
                >
                  <ChevronLeft size={12} />
                  Return to Selection
                </button>
              </div>

              {/* Form */}
              <div className="p-6 sm:p-8 pt-4">
                <div className="mb-8">
                  <h2 className="text-xl font-heading font-bold text-charcoal-900">
                    {portal?.name} Login
                  </h2>
                  <div className="h-1 w-12 bg-gold-500 mt-2" />
                </div>

                {/* Google Sign-In */}
                <Button
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full h-12 mb-6"
                >
                  {isGoogleLoading ? (
                    <Loader2 size={18} className="animate-spin mr-2" />
                  ) : (
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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
                  AUTHENTICATE WITH GOOGLE
                </Button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-charcoal-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-charcoal-400 text-[10px] uppercase tracking-widest">
                      Or access via credentials
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-3 p-3 mb-5 bg-error-50 border border-error-200 text-error-700 text-sm">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Email Form */}
                <form onSubmit={handleEmailSignIn} className="space-y-5">
                  <div>
                    <label className="block text-charcoal-600 text-xs font-bold uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@organization.com"
                      required
                      className="h-11"
                      leftIcon={<Mail size={16} />}
                    />
                  </div>

                  <div>
                    <label className="block text-charcoal-600 text-xs font-bold uppercase tracking-wider mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-11 pr-10"
                        leftIcon={<Lock size={16} />}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      href="/auth/forgot-password"
                      className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 hover:text-charcoal-900 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full h-12 bg-charcoal-900 text-white hover:bg-black"
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      'INITIATE SESSION'
                    )}
                  </Button>
                </form>

                {/* Sign Up Link */}
                <div className="mt-8 pt-6 border-t border-charcoal-100 text-center">
                  <p className="text-charcoal-500 text-xs mb-2">
                    New to the platform?
                  </p>
                  <Link
                    href={`/auth/${selectedPortal}`}
                    className="text-gold-600 hover:text-gold-700 text-xs font-bold uppercase tracking-widest transition-colors border-b border-gold-600/30 hover:border-gold-600"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[10px] text-charcoal-500 font-mono">
          <p>SECURE CONNECTION // ENCRYPTED</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/legal/terms" className="hover:text-gold-500 transition-colors">TERMS</Link>
            <span>|</span>
            <Link href="/legal/privacy" className="hover:text-gold-500 transition-colors">PRIVACY</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="min-h-screen bg-charcoal-900 flex items-center justify-center p-4">
      <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
