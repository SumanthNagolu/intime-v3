/**
 * Custom Error Classes
 *
 * Defines application-specific error types for better error handling.
 */

/**
 * Base Application Error
 */
export class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * Authentication Error
 * Thrown when user is not authenticated
 */
export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'Authentication required', details?: Record<string, unknown>) {
    super(message, 'AUTHENTICATION_REQUIRED', 401, details);
  }
}

/**
 * Authorization Error
 * Thrown when user lacks required permissions
 */
export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Permission denied', details?: Record<string, unknown>) {
    super(message, 'PERMISSION_DENIED', 403, details);
  }
}

/**
 * Validation Error
 * Thrown when input validation fails
 */
export class ValidationError extends ApplicationError {
  constructor(message: string = 'Validation failed', details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

/**
 * Not Found Error
 * Thrown when requested resource doesn't exist
 */
export class NotFoundError extends ApplicationError {
  constructor(
    resource: string = 'Resource',
    identifier?: string,
    details?: Record<string, unknown>
  ) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404, details);
  }
}

/**
 * Conflict Error
 * Thrown when operation conflicts with existing state
 */
export class ConflictError extends ApplicationError {
  constructor(message: string = 'Resource already exists', details?: Record<string, unknown>) {
    super(message, 'CONFLICT', 409, details);
  }
}

/**
 * Rate Limit Error
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends ApplicationError {
  constructor(message: string = 'Rate limit exceeded', details?: Record<string, unknown>) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, details);
  }
}

/**
 * External Service Error
 * Thrown when external service (Supabase, OpenAI, etc.) fails
 */
export class ExternalServiceError extends ApplicationError {
  constructor(
    service: string,
    message: string = 'External service error',
    details?: Record<string, unknown>
  ) {
    super(`${service}: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, {
      service,
      ...details,
    });
  }
}

/**
 * Database Error
 * Thrown when database operation fails
 */
export class DatabaseError extends ApplicationError {
  constructor(message: string = 'Database operation failed', details?: Record<string, unknown>) {
    super(message, 'DATABASE_ERROR', 500, details);
  }
}

/**
 * Event Bus Error
 * Thrown when event bus operation fails
 */
export class EventBusError extends ApplicationError {
  constructor(message: string = 'Event bus operation failed', details?: Record<string, unknown>) {
    super(message, 'EVENT_BUS_ERROR', 500, details);
  }
}

/**
 * Type guard to check if error is an ApplicationError
 */
export function isApplicationError(error: unknown): error is ApplicationError {
  return error instanceof ApplicationError;
}

/**
 * Convert any error to a standardized format
 */
export function normalizeError(error: unknown): ApplicationError {
  if (isApplicationError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new ApplicationError(error.message, 'INTERNAL_ERROR', 500, {
      originalName: error.name,
      stack: error.stack,
    });
  }

  return new ApplicationError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    500,
    { originalError: error }
  );
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown) {
  const normalizedError = normalizeError(error);

  return {
    success: false,
    error: {
      message: normalizedError.message,
      code: normalizedError.code,
      ...(process.env.NODE_ENV === 'development' && {
        details: normalizedError.details,
        stack: normalizedError.stack,
      }),
    },
  };
}
