'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  GraduationCap,
  Building2,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { signIn, signUp, signInWithGoogle, type PortalType } from '@/lib/auth/client';
import { cn } from '@/lib/utils';

// Portal configurations
const PORTAL_CONFIG: Record<PortalType, {
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tagline: string;
  features: string[];
  accentColor: string;
  iconBg: string;
  iconColor: string;
  redirectPath: string;
}> = {
  academy: {
    name: 'Training Academy',
    icon: GraduationCap,
    tagline: 'Transform Your Career',
    features: ['50+ Professional Courses', 'Industry Certifications', 'Career Coaching'],
    accentColor: 'gold',
    iconBg: 'bg-gold-500/20',
    iconColor: 'text-gold-400',
    redirectPath: '/academy/portal',
  },
  client: {
    name: 'Client Portal',
    icon: Building2,
    tagline: 'Hire Pre-Vetted Talent',
    features: ['Access Talent Pipeline', 'Direct Hiring', 'Submission Tracking'],
    accentColor: 'amber',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    redirectPath: '/client/portal',
  },
  talent: {
    name: 'Talent Portal',
    icon: Briefcase,
    tagline: 'Consultant Workspace',
    features: ['Job Opportunities', 'Profile Management', 'Application Status'],
    accentColor: 'slate',
    iconBg: 'bg-slate-400/20',
    iconColor: 'text-slate-300',
    redirectPath: '/talent/portal',
  },
  employee: {
    name: 'InTime OS',
    icon: ShieldCheck,
    tagline: 'Internal Operations Hub',
    features: ['Bench Sales Management', 'Recruiting Dashboard', 'Cross-Border Operations'],
    accentColor: 'gold',
    iconBg: 'bg-gold-500/20',
    iconColor: 'text-gold-400',
    redirectPath: '/employee/portal',
  },
};

interface AuthPageProps {
  portal: PortalType;
  mode?: 'signin' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ portal, mode: initialMode = 'signin' }) => {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const config = PORTAL_CONFIG[portal];
  const Icon = config.icon;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error } = await signInWithGoogle(portal);
      if (error) {
        setError(error.message);
        setIsGoogleLoading(false);
      }
      // If successful, Supabase will redirect automatically
    } catch (err) {
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
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0F] via-[#141418] to-[#0D0D0F]" />
        <div 
          className="absolute top-0 right-0 w-[70%] h-[60%] rounded-bl-[60%]"
          style={{
            background: 'radial-gradient(ellipse at 85% 15%, rgba(201, 169, 97, 0.12) 0%, transparent 50%)',
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[60%] h-[50%] rounded-tr-[70%]"
          style={{
            background: 'radial-gradient(ellipse at 10% 90%, rgba(212, 175, 55, 0.08) 0%, transparent 45%)',
          }}
        />
        <div 
          className="absolute top-[6%] right-[5%] w-[300px] h-[300px] border border-gold-500/8 rounded-full"
        />
        <div 
          className="absolute bottom-[12%] left-[3%] w-[200px] h-[200px] border border-gold-500/6 rounded-full"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex-1 flex flex-col lg:flex-row items-center justify-center px-6 lg:px-12 py-12 gap-12 lg:gap-20">
        
        {/* Left Panel - Portal Info */}
        <div className={`w-full lg:w-1/2 max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Back link */}
          <Link 
            href="/login" 
            className="group inline-flex items-center gap-2 text-charcoal-500 hover:text-gold-400 font-bold uppercase tracking-[0.15em] text-[11px] transition-all duration-300 mb-12"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Portals
          </Link>

          {/* Portal branding */}
          <div className={`w-20 h-20 ${config.iconBg} rounded-2xl flex items-center justify-center ${config.iconColor} mb-8`}>
            <Icon size={40} />
          </div>

          <h1 className="mb-4">
            <span className="block text-3xl md:text-4xl font-heading font-black text-white leading-[1.1] tracking-tight">
              {config.name}
            </span>
            <span className="block text-lg md:text-xl text-charcoal-400 font-light mt-2">
              {config.tagline}
            </span>
          </h1>

          {/* Features */}
          <div className="mt-8 space-y-3">
            {config.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-charcoal-400 text-sm">
                <CheckCircle2 size={16} className={config.iconColor} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div 
          className={`w-full lg:w-1/2 max-w-md transition-all duration-700 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-8 md:p-10">
            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-heading font-bold text-white mb-2">
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-charcoal-400 text-sm">
                {mode === 'signin' 
                  ? 'Sign in to access your dashboard' 
                  : 'Get started with your new account'
                }
              </p>
            </div>

            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-charcoal-900 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {isGoogleLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#141418] px-4 text-charcoal-500 font-medium tracking-wider">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                <CheckCircle2 size={16} />
                <span>{success}</span>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-charcoal-400 text-xs font-bold uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-charcoal-600 focus:outline-none focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-charcoal-400 text-xs font-bold uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-charcoal-600 focus:outline-none focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-charcoal-400 text-xs font-bold uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={mode === 'signup' ? 8 : 1}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-charcoal-600 focus:outline-none focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-charcoal-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="mt-1.5 text-charcoal-600 text-xs">
                    Min 8 characters with uppercase, lowercase, and number
                  </p>
                )}
              </div>

              {mode === 'signin' && (
                <div className="flex justify-end">
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-gold-500 hover:text-gold-400 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-charcoal-900 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  mode === 'signin' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <p className="mt-6 text-center text-charcoal-400 text-sm">
              {mode === 'signin' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
                    className="text-gold-500 hover:text-gold-400 font-semibold transition-colors"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
                    className="text-gold-500 hover:text-gold-400 font-semibold transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Security footer */}
          <div className="mt-6 flex items-center justify-center gap-2 text-charcoal-600">
            <Lock size={12} />
            <span className="text-[10px] font-medium tracking-widest uppercase">
              Secured with 256-bit encryption
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

