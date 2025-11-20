/**
 * Global Error Page
 *
 * Displayed when an unhandled error occurs.
 * Works with Next.js error boundaries.
 */

'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h1>

        <p className="text-gray-600 mb-6">
          An unexpected error occurred. We've been notified and are working on a fix.
        </p>

        {error.digest && (
          <p className="text-sm text-gray-500 mb-6 font-mono">Error ID: {error.digest}</p>
        )}

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 text-left">
            <details className="text-sm text-gray-600">
              <summary className="cursor-pointer font-medium mb-2">
                Error Details (dev only)
              </summary>
              <div className="mt-2 p-3 bg-red-50 rounded text-xs overflow-auto">
                <p className="font-semibold text-red-800 mb-1">{error.name}</p>
                <p className="text-red-700 mb-2">{error.message}</p>
                {error.stack && (
                  <pre className="text-red-600 whitespace-pre-wrap">{error.stack}</pre>
                )}
              </div>
            </details>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
