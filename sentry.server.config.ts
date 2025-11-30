/**
 * Sentry Server Configuration
 *
 * Configures Sentry for server-side error tracking.
 * Includes PII scrubbing and sampling rate configuration.
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1, // 10% of transactions

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // PII scrubbing - remove sensitive data before sending to Sentry
  beforeSend(event) {
    // Remove Authorization headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-supabase-auth'];
    }

    // Scrub database connection strings
    if (event.extra) {
      const scrubConnectionString = (obj: unknown): unknown => {
        if (typeof obj !== 'object' || obj === null) return obj;
        if (Array.isArray(obj)) {
          return obj.map(item => scrubConnectionString(item));
        }
        const scrubbed: Record<string, unknown> = {};
        for (const key in obj as Record<string, unknown>) {
          const typedObj = obj as Record<string, unknown>;
          if (
            typeof typedObj[key] === 'string' &&
            (key.toLowerCase().includes('database') ||
              key.toLowerCase().includes('connection') ||
              key.toLowerCase().includes('url'))
          ) {
            scrubbed[key] = '[REDACTED]';
          } else if (typeof typedObj[key] === 'object') {
            scrubbed[key] = scrubConnectionString(typedObj[key]);
          } else {
            scrubbed[key] = typedObj[key];
          }
        }
        return scrubbed;
      };
      event.extra = scrubConnectionString(event.extra) as Record<string, unknown>;
    }

    return event;
  },

  environment: process.env.NODE_ENV,
});
