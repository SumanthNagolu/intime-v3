# FOUND-018: Set Up Sentry Error Tracking

**Story Points:** 2
**Sprint:** Sprint 3 (Week 5-6)
**Priority:** MEDIUM

---

## User Story

As a **DevOps Engineer**,
I want **real-time error tracking in production**,
So that **we know when things break before users report them**.

---

## Acceptance Criteria

- [ ] Sentry project created
- [ ] Sentry SDK configured for Next.js
- [ ] Source maps uploaded for error tracking
- [ ] Sensitive data scrubbed (passwords, tokens)
- [ ] Performance monitoring enabled
- [ ] Alert rules configured (Slack integration)

---

## Technical Implementation

Install Sentry:

```bash
pnpm add @sentry/nextjs
pnpm sentry-wizard
```

Create file: `sentry.client.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,

  beforeSend(event, hint) {
    // Scrub sensitive data
    if (event.request) {
      delete event.request.cookies;
    }

    if (event.extra) {
      delete event.extra.password;
      delete event.extra.token;
    }

    return event;
  }
});
```

Create file: `sentry.server.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});
```

---

## Dependencies

- **Requires:** FOUND-011 (error handling)

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
