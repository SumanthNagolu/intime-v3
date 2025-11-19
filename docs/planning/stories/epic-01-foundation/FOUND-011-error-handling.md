# FOUND-011: Create Unified Error Handling

**Story Points:** 3
**Sprint:** Sprint 2 (Week 3-4)
**Priority:** HIGH

---

## User Story

As a **Developer**,
I want **consistent error handling across the application**,
So that **errors are logged, tracked, and displayed uniformly**.

---

## Acceptance Criteria

- [ ] Custom error classes for different error types
- [ ] Global error boundary for React components
- [ ] Error logging to Sentry (with sensitive data scrubbing)
- [ ] User-friendly error messages (no stack traces in production)
- [ ] API error responses follow consistent format
- [ ] Toast notifications for user-facing errors
- [ ] 404 and 500 error pages styled
- [ ] Error recovery mechanisms (retry buttons, fallback UI)

---

## Technical Implementation

### Custom Error Classes

Create file: `src/lib/errors/custom-errors.ts`

```typescript
/**
 * Base application error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Authentication errors
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_REQUIRED', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization errors
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(message, 'PERMISSION_DENIED', 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, public errors: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400, { errors });
    this.name = 'ValidationError';
  }
}

/**
 * Not found errors
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404, { resource });
    this.name = 'NotFoundError';
  }
}

/**
 * Rate limit errors
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Database errors
 */
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'DATABASE_ERROR', 500, {
      originalError: originalError?.message
    });
    this.name = 'DatabaseError';
  }
}
```

### Error Logger (Sentry Integration)

Create file: `src/lib/errors/error-logger.ts`

```typescript
import * as Sentry from '@sentry/nextjs';
import { AppError } from './custom-errors';

/**
 * Initialize Sentry (call in app startup)
 */
export function initErrorLogging() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
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
  }
}

/**
 * Log error to Sentry and console
 */
export function logError(error: Error, context?: Record<string, any>) {
  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
    if (context) console.error('Context:', context);
  }

  // Send to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context,
      level: error instanceof AppError ? 'warning' : 'error'
    });
  }
}

/**
 * Log message to Sentry
 */
export function logMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level);
  }
}
```

### Global Error Boundary

Create file: `src/components/error-boundary.tsx`

```typescript
'use client';

import { Component, type ReactNode } from 'react';
import { logError } from '@/lib/errors/error-logger';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, {
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="max-w-md space-y-4 text-center">
            <h1 className="text-4xl font-bold text-red-600">Oops!</h1>
            <p className="text-gray-600">
              Something went wrong. We've been notified and will fix it soon.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-4 overflow-auto rounded bg-gray-100 p-4 text-left text-xs">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            )}
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Error Response Formatter

Create file: `src/lib/errors/format-error.ts`

```typescript
import { AppError } from './custom-errors';
import type { NextResponse } from 'next/server';

interface ErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    metadata?: Record<string, any>;
  };
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown): ErrorResponse {
  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        metadata: error.metadata
      }
    };
  }

  // Handle standard errors
  if (error instanceof Error) {
    return {
      error: {
        message:
          process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : error.message,
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    };
  }

  // Handle unknown errors
  return {
    error: {
      message: 'An unknown error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500
    }
  };
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Map common errors to friendly messages
    if (error.message.includes('unique constraint')) {
      return 'This record already exists';
    }

    if (error.message.includes('foreign key constraint')) {
      return 'Cannot delete: this record is referenced elsewhere';
    }

    if (error.message.includes('not found')) {
      return 'The requested resource was not found';
    }

    return process.env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again.'
      : error.message;
  }

  return 'An unexpected error occurred';
}
```

### Toast Notifications for Errors

Create file: `src/lib/errors/toast-error.ts`

```typescript
'use client';

import { toast } from 'sonner';
import { getUserFriendlyMessage } from './format-error';

/**
 * Show error toast
 */
export function showErrorToast(error: unknown) {
  const message = getUserFriendlyMessage(error);

  toast.error(message, {
    duration: 5000,
    action: {
      label: 'Dismiss',
      onClick: () => {}
    }
  });
}

/**
 * Show success toast
 */
export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 3000
  });
}
```

### Custom 404 Page

Create file: `src/app/not-found.tsx`

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-bold">Page not found</h2>
        <p className="text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-2 justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/support">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Custom 500 Page

Create file: `src/app/error.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { logError } from '@/lib/errors/error-logger';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-4xl font-bold text-red-600">Error</h1>
        <p className="text-gray-600">
          Something went wrong. We've been notified and will fix it soon.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-4 overflow-auto rounded bg-gray-100 p-4 text-left text-xs">
            {error.message}
          </pre>
        )}
        <div className="flex gap-2 justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Usage Example

```typescript
import { AuthenticationError, ValidationError } from '@/lib/errors/custom-errors';
import { logError } from '@/lib/errors/error-logger';
import { showErrorToast } from '@/lib/errors/toast-error';

// Throw custom error
throw new AuthenticationError('Invalid credentials');

// Catch and handle
try {
  await someOperation();
} catch (error) {
  logError(error as Error, { context: 'user-signup' });
  showErrorToast(error);
}
```

---

## Dependencies

- **Requires:** FOUND-010 (tRPC for API error handling)
- **Used by:** All feature development

---

## Testing Checklist

- [ ] Custom errors thrown correctly
- [ ] Error boundary catches React errors
- [ ] Errors logged to Sentry (production)
- [ ] Sensitive data scrubbed before logging
- [ ] 404 page displays correctly
- [ ] 500 page displays correctly
- [ ] Toast notifications show errors
- [ ] User-friendly messages displayed (no stack traces in production)

---

## Documentation Updates

- [ ] Document error handling patterns
- [ ] Add guide for creating custom errors
- [ ] Document Sentry configuration

---

## Related Stories

- **Depends on:** FOUND-010
- **Used by:** All features

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
