/**
 * Sentry Client Configuration
 *
 * Configures Sentry for client-side error tracking.
 * Includes PII scrubbing and sampling rate configuration.
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1, // 10% of transactions

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  replaysOnErrorSampleRate: 1.0, // 100% of errors are recorded

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1, // 10% of sessions are recorded

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // PII scrubbing - remove sensitive data before sending to Sentry
  beforeSend(event) {
    // Remove Authorization headers
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['authorization'];
      delete event.request.headers['Cookie'];
      delete event.request.headers['cookie'];
    }

    // Scrub email addresses (keep first 2 characters + domain)
    if (event.user?.email) {
      const email = event.user.email;
      const parts = email.split('@');
      if (parts.length === 2) {
        const prefix = parts[0].substring(0, 2);
        event.user.email = `${prefix}***@${parts[1]}`;
      }
    }

    // Remove phone numbers from payload
    if (event.extra) {
      const scrubPhone = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;
        const scrubbed: any = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
          if (key.toLowerCase().includes('phone')) {
            scrubbed[key] = '***-***-****';
          } else if (typeof obj[key] === 'object') {
            scrubbed[key] = scrubPhone(obj[key]);
          } else {
            scrubbed[key] = obj[key];
          }
        }
        return scrubbed;
      };
      event.extra = scrubPhone(event.extra);
    }

    return event;
  },

  environment: process.env.NODE_ENV,
});
