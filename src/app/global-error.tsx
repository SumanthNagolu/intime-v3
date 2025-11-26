'use client';

/**
 * Global Error Boundary - Root Layout Errors
 *
 * This handles errors that occur in the root layout itself.
 * Must include <html> and <body> tags since it replaces the root layout.
 * Cannot use external components as the layout may not be available.
 */

import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    reset();
  };

  return (
    <html lang="en">
      <head>
        <title>Error | InTime</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          :root {
            --forest-500: #0D4C3B;
            --forest-600: #0B3F31;
            --forest-700: #093228;
            --gold-300: #EBD9B3;
            --gold-500: #C9A961;
            --gold-600: #D4AF37;
            --gold-700: #B8964E;
            --charcoal-100: #E9ECEF;
            --charcoal-200: #DEE2E6;
            --charcoal-400: #ADB5BD;
            --charcoal-500: #6C757D;
            --charcoal-600: #495057;
            --charcoal-700: #343A40;
            --charcoal-900: #1A1A1A;
            --error-500: #DC2626;
            --error-600: #B91C1C;
            --ivory: #FFFCF5;
          }

          body {
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            background: var(--ivory);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            color: var(--charcoal-900);
          }

          .heading {
            font-family: 'Cormorant Garamond', Georgia, serif;
          }

          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0; }
            50% { opacity: 0.3; }
            100% { transform: scale(1.2); opacity: 0; }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }

          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .pulse-ring {
            animation: pulse-ring 2s ease-out infinite;
          }

          .float {
            animation: float 3s ease-in-out infinite;
          }

          .spin-slow {
            animation: spin-slow 20s linear infinite;
          }
        `}</style>
      </head>
      <body>
        {/* Background gradient overlay */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'radial-gradient(at 0% 0%, rgba(13, 76, 59, 0.08) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(201, 169, 97, 0.08) 0px, transparent 50%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '36rem', width: '100%', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          {/* Logo */}
          <div style={{ marginBottom: '2rem' }}>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, var(--forest-500), var(--forest-700))',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(10, 58, 42, 0.15)',
                }}
              >
                <span
                  className="heading"
                  style={{
                    fontWeight: 700,
                    fontStyle: 'italic',
                    fontSize: '1.25rem',
                    color: 'var(--gold-500)',
                  }}
                >
                  I
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span
                  className="heading"
                  style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--forest-500)' }}
                >
                  InTime
                </span>
                <span
                  className="heading"
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 500,
                    color: 'var(--gold-600)',
                    marginLeft: '0.25rem',
                  }}
                >
                  Solutions
                </span>
              </div>
            </a>
          </div>

          {/* Animated Error Icon */}
          <div style={{ position: 'relative', width: '8rem', height: '8rem', margin: '0 auto 2rem' }}>
            {/* Pulsing outer ring */}
            <div
              className="pulse-ring"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'rgba(220, 38, 38, 0.15)',
              }}
            />

            {/* Rotating dashed ring */}
            <div
              className="spin-slow"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '3px dashed rgba(220, 38, 38, 0.25)',
              }}
            />

            {/* Main icon circle */}
            <div
              className="float"
              style={{
                position: 'absolute',
                inset: '0.5rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--error-500), var(--error-600))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)',
              }}
            >
              {/* Alert Triangle SVG */}
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <h1
            className="heading"
            style={{
              fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
              fontWeight: 700,
              color: 'var(--charcoal-900)',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            Something Went{' '}
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ position: 'relative', zIndex: 1 }}>Wrong</span>
              <span
                style={{
                  position: 'absolute',
                  bottom: '0.15rem',
                  left: 0,
                  right: 0,
                  height: '0.6rem',
                  background: 'rgba(201, 169, 97, 0.4)',
                  zIndex: 0,
                  transform: 'rotate(-1deg)',
                }}
              />
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--charcoal-500)',
              marginBottom: '0.75rem',
              lineHeight: 1.6,
            }}
          >
            A critical error occurred. Our team has been notified and is working on it.
          </p>

          {error.digest && (
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--charcoal-400)',
                fontFamily: 'monospace',
                marginBottom: '2rem',
              }}
            >
              Reference ID: <span style={{ color: 'var(--forest-500)' }}>{error.digest}</span>
            </p>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center',
              marginBottom: '2rem',
            }}
          >
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, var(--forest-600), var(--forest-700))',
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: isRetrying ? 'not-allowed' : 'pointer',
                opacity: isRetrying ? 0.7 : 1,
                boxShadow: '0 4px 16px rgba(10, 58, 42, 0.2)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Refresh Icon */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: isRetrying ? 'spin-slow 1s linear infinite' : 'none' }}
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>

            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                background: 'white',
                color: 'var(--charcoal-700)',
                border: '1px solid var(--charcoal-200)',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Home Icon */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Go to Homepage
            </a>
          </div>

          {/* Developer Details (dev only) */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--charcoal-500)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                {/* Chevron Icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                {showDetails ? 'Hide' : 'Show'} Error Details
              </button>

              {showDetails && (
                <div
                  style={{
                    marginTop: '1rem',
                    textAlign: 'left',
                    background: 'var(--charcoal-900)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  {/* Terminal dots */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div
                      style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: 'var(--error-500)' }}
                    />
                    <div
                      style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: 'var(--gold-500)' }}
                    />
                    <div
                      style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: 'var(--forest-500)' }}
                    />
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--charcoal-400)', fontFamily: 'monospace' }}>
                      error-details
                    </span>
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--gold-500)',
                        fontFamily: 'monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Error Name
                    </span>
                    <p style={{ color: '#f87171', fontFamily: 'monospace', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {error.name}
                    </p>
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--gold-500)',
                        fontFamily: 'monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Message
                    </span>
                    <p
                      style={{
                        color: 'white',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        marginTop: '0.25rem',
                        wordBreak: 'break-word',
                      }}
                    >
                      {error.message}
                    </p>
                  </div>

                  {error.stack && (
                    <div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--gold-500)',
                          fontFamily: 'monospace',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Stack Trace
                      </span>
                      <pre
                        style={{
                          color: 'var(--charcoal-400)',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          marginTop: '0.25rem',
                          overflowX: 'auto',
                          maxHeight: '12rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Help Link */}
          <div
            style={{
              marginTop: '2rem',
              padding: '1.25rem',
              background: 'white',
              borderRadius: '1rem',
              border: '1px solid var(--charcoal-100)',
            }}
          >
            <p style={{ fontSize: '0.9rem', color: 'var(--charcoal-600)' }}>
              Need help?{' '}
              <a
                href="mailto:support@intimeesolutions.com"
                style={{ color: 'var(--forest-500)', fontWeight: 600, textDecoration: 'none' }}
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
