'use client'

/**
 * Portal Error Page
 *
 * Displayed when an error occurs within the employee portal.
 * Uses portal navigation and styling (not marketing site).
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RefreshCw, AlertTriangle, ChevronDown, Mail, ArrowLeft, LayoutDashboard } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'
import { TopNavigation } from '@/components/navigation/TopNavigation'

export default function EmployeeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error)
  }, [error])

  const handleRetry = async () => {
    setIsRetrying(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    reset()
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <TopNavigation />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="max-w-lg mx-auto text-center px-6">
          {/* Error Icon */}
          <div className="relative mb-8 inline-block">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-error-500 to-error-600 flex items-center justify-center shadow-lg">
              <AlertTriangle size={40} className="text-white" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-charcoal-900 mb-3">
            Something Went Wrong
          </h1>
          <p className="text-charcoal-500 mb-3 max-w-sm mx-auto">
            We encountered an unexpected error. Our team has been notified.
          </p>

          {/* Error Digest (if available) */}
          {error.digest && (
            <p className="text-sm text-charcoal-400 font-mono mb-8">
              Reference: <span className="text-gold-600">{error.digest}</span>
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Button
              variant="default"
              size="lg"
              onClick={handleRetry}
              disabled={isRetrying}
              className="gap-2"
            >
              <RefreshCw size={18} className={isRetrying ? 'animate-spin' : ''} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </Button>

            <Link href="/employee/workspace/dashboard">
              <Button variant="outline" size="lg" className="gap-2">
                <LayoutDashboard size={18} />
                Dashboard
              </Button>
            </Link>
          </div>

          {/* Go Back Button */}
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-gold-600 transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Go back to previous page
          </button>

          {/* Developer Error Details */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors"
              >
                <ChevronDown
                  size={16}
                  className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
                />
                {showDetails ? 'Hide' : 'Show'} Error Details
              </button>

              {showDetails && (
                <div className="mt-4 text-left">
                  <div className="bg-charcoal-900 rounded-xl p-4 shadow-lg overflow-hidden">
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-gold-500 font-mono uppercase tracking-wider">
                          Error
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
                            Stack
                          </span>
                          <pre className="mt-1 text-charcoal-300 font-mono text-xs overflow-auto max-h-40 whitespace-pre-wrap">
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
          <div className="mt-10 p-5 bg-white rounded-xl border border-charcoal-100 shadow-sm">
            <div className="flex items-start gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center shrink-0">
                <Mail size={18} className="text-gold-700" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900 mb-1">Need help?</h3>
                <p className="text-sm text-charcoal-600">
                  Contact support at{' '}
                  <a
                    href="mailto:support@intimeesolutions.com"
                    className="text-gold-600 hover:text-gold-700 font-medium hover:underline"
                  >
                    support@intimeesolutions.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
