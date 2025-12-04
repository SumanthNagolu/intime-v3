'use client';

/**
 * Global Error Page
 *
 * Premium error experience matching InTime brand.
 * Works with Next.js error boundaries.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, RefreshCw, AlertTriangle, ChevronDown, Mail, ArrowLeft } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';
import { MarketingNavbar, Footer } from '@/components/marketing/templates';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    // Small delay for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 500));
    reset();
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <MarketingNavbar />

      <main className="flex-1 flex items-center justify-center py-16 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-mesh-premium opacity-50" />
        
        {/* Animated floating shapes */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-error-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-gold-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-200" />
        <div className="absolute bottom-20 left-1/3 w-56 h-56 bg-forest-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-400" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            {/* Animated Error Icon */}
            <div className="relative mb-8 inline-block">
              {/* Pulsing ring */}
              <div className="absolute inset-0 animate-ping">
                <div className="w-32 h-32 mx-auto rounded-full bg-error-500/20" />
              </div>
              
              {/* Main icon container */}
              <div className="relative w-32 h-32 mx-auto">
                {/* Rotating outer ring */}
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-error-200 animate-[spin_20s_linear_infinite]" />
                
                {/* Inner circle with icon */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-error-500 to-error-600 flex items-center justify-center shadow-xl">
                  <AlertTriangle size={48} className="text-white animate-bounce-subtle" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-charcoal-900 mb-4">
              Something Went{' '}
              <span className="relative">
                <span className="relative z-10">Wrong</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-gold-300/50 -z-10 transform -rotate-1" />
              </span>
            </h1>
            
            <p className="text-lg text-charcoal-500 mb-3 max-w-md mx-auto">
              We encountered an unexpected error. Our team has been notified and is working on a fix.
            </p>

            {/* Error Digest (if available) */}
            {error.digest && (
              <p className="text-sm text-charcoal-400 font-mono mb-8">
                Reference ID: <span className="text-forest-600">{error.digest}</span>
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-forest-600 to-forest-700 text-white rounded-full font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl hover:from-forest-700 hover:to-forest-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <RefreshCw size={18} className={isRetrying ? 'animate-spin' : ''} />
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </button>

              <Link
                href="/"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-charcoal-700 border border-charcoal-200 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-charcoal-50 hover:border-charcoal-300 transition-all shadow-sm"
              >
                <Home size={18} />
                Go to Homepage
              </Link>
            </div>

            {/* Go Back Button */}
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-forest-600 transition-colors mb-10"
            >
              <ArrowLeft size={16} />
              Go back to previous page
            </button>

            {/* Developer Error Details */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors"
                >
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
                  />
                  {showDetails ? 'Hide' : 'Show'} Error Details (Dev Only)
                </button>

                {showDetails && (
                  <div className="mt-4 text-left max-w-xl mx-auto">
                    <div className="bg-charcoal-900 rounded-2xl p-6 shadow-xl overflow-hidden">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-error-500" />
                        <div className="w-3 h-3 rounded-full bg-gold-500" />
                        <div className="w-3 h-3 rounded-full bg-forest-500" />
                        <span className="ml-2 text-xs text-charcoal-400 font-mono">error-details</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-gold-500 font-mono uppercase tracking-wider">
                            Error Name
                          </span>
                          <p className="text-error-400 font-mono text-sm mt-1">{error.name}</p>
                        </div>
                        
                        <div>
                          <span className="text-xs text-gold-500 font-mono uppercase tracking-wider">
                            Message
                          </span>
                          <p className="text-white font-mono text-sm mt-1 break-words">
                            {error.message}
                          </p>
                        </div>
                        
                        {error.stack && (
                          <div>
                            <span className="text-xs text-gold-500 font-mono uppercase tracking-wider">
                              Stack Trace
                            </span>
                            <pre className="mt-1 text-charcoal-300 font-mono text-xs overflow-auto max-h-48 whitespace-pre-wrap scrollbar-premium">
                              {error.stack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Help Section */}
            <div className="mt-12 p-6 bg-white rounded-2xl border border-charcoal-100 shadow-sm">
              <div className="flex items-start gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center shrink-0">
                  <Mail size={22} className="text-gold-700" />
                </div>
                <div>
                  <h3 className="font-subheading font-bold text-charcoal-900 mb-1">
                    Still having issues?
                  </h3>
                  <p className="text-sm text-charcoal-600">
                    If this problem persists, please contact our support team at{' '}
                    <a
                      href="mailto:support@intimeesolutions.com"
                      className="text-forest-600 hover:text-forest-700 font-medium hover:underline"
                    >
                      support@intimeesolutions.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-10 pt-8 border-t border-charcoal-200">
              <p className="text-sm text-charcoal-400 mb-4">Maybe try one of these instead</p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { label: 'Academy', href: '/academy' },
                  { label: 'Solutions', href: '/solutions' },
                  { label: 'Industries', href: '/industries' },
                  { label: 'Careers', href: '/careers' },
                  { label: 'Contact', href: '/contact' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 bg-charcoal-100 text-charcoal-600 rounded-full text-sm font-medium hover:bg-forest-100 hover:text-forest-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
