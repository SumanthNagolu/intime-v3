/**
 * Error Classes Tests
 *
 * Tests for custom error classes.
 */

import { describe, it, expect } from 'vitest';
import {
  ApplicationError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  DatabaseError,
  EventBusError,
  isApplicationError,
  normalizeError,
  formatErrorResponse,
} from '../index';

describe('Error Classes', () => {
  describe('ApplicationError', () => {
    it('should create error with message and code', () => {
      const error = new ApplicationError('Test error', 'TEST_ERROR', 500);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('ApplicationError');
    });

    it('should include details', () => {
      const details = { userId: '123', action: 'test' };
      const error = new ApplicationError('Test error', 'TEST_ERROR', 500, details);

      expect(error.details).toEqual(details);
    });

    it('should serialize to JSON', () => {
      const error = new ApplicationError('Test error', 'TEST_ERROR', 500, { foo: 'bar' });
      const json = error.toJSON();

      expect(json).toEqual({
        name: 'ApplicationError',
        message: 'Test error',
        code: 'TEST_ERROR',
        statusCode: 500,
        details: { foo: 'bar' },
      });
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error with 401 status', () => {
      const error = new AuthenticationError();

      expect(error.message).toBe('Authentication required');
      expect(error.code).toBe('AUTHENTICATION_REQUIRED');
      expect(error.statusCode).toBe(401);
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid token');

      expect(error.message).toBe('Invalid token');
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error with 403 status', () => {
      const error = new AuthorizationError();

      expect(error.message).toBe('Permission denied');
      expect(error.code).toBe('PERMISSION_DENIED');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with 400 status', () => {
      const error = new ValidationError();

      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
    });

    it('should include validation details', () => {
      const details = { email: ['Invalid email'], password: ['Too short'] };
      const error = new ValidationError('Validation failed', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with 404 status', () => {
      const error = new NotFoundError('User');

      expect(error.message).toContain('User');
      expect(error.message).toContain('not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
    });

    it('should include identifier in message', () => {
      const error = new NotFoundError('User', '123');

      expect(error.message).toBe("User with identifier '123' not found");
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error with 409 status', () => {
      const error = new ConflictError();

      expect(error.message).toBe('Resource already exists');
      expect(error.code).toBe('CONFLICT');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with 429 status', () => {
      const error = new RateLimitError();

      expect(error.message).toBe('Rate limit exceeded');
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.statusCode).toBe(429);
    });
  });

  describe('ExternalServiceError', () => {
    it('should create external service error with service name', () => {
      const error = new ExternalServiceError('OpenAI', 'API request failed');

      expect(error.message).toBe('OpenAI: API request failed');
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
      expect(error.statusCode).toBe(502);
      expect(error.details?.service).toBe('OpenAI');
    });
  });

  describe('DatabaseError', () => {
    it('should create database error with 500 status', () => {
      const error = new DatabaseError();

      expect(error.message).toBe('Database operation failed');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('EventBusError', () => {
    it('should create event bus error with 500 status', () => {
      const error = new EventBusError();

      expect(error.message).toBe('Event bus operation failed');
      expect(error.code).toBe('EVENT_BUS_ERROR');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('isApplicationError', () => {
    it('should return true for ApplicationError instances', () => {
      const error = new ApplicationError('Test', 'TEST', 500);

      expect(isApplicationError(error)).toBe(true);
    });

    it('should return true for ApplicationError subclasses', () => {
      expect(isApplicationError(new AuthenticationError())).toBe(true);
      expect(isApplicationError(new ValidationError())).toBe(true);
      expect(isApplicationError(new NotFoundError('User'))).toBe(true);
    });

    it('should return false for regular errors', () => {
      const error = new Error('Regular error');

      expect(isApplicationError(error)).toBe(false);
    });

    it('should return false for non-errors', () => {
      expect(isApplicationError('string')).toBe(false);
      expect(isApplicationError(null)).toBe(false);
      expect(isApplicationError(undefined)).toBe(false);
    });
  });

  describe('normalizeError', () => {
    it('should return ApplicationError as-is', () => {
      const error = new ApplicationError('Test', 'TEST', 500);
      const normalized = normalizeError(error);

      expect(normalized).toBe(error);
    });

    it('should convert Error to ApplicationError', () => {
      const error = new Error('Regular error');
      const normalized = normalizeError(error);

      expect(normalized).toBeInstanceOf(ApplicationError);
      expect(normalized.message).toBe('Regular error');
      expect(normalized.code).toBe('INTERNAL_ERROR');
    });

    it('should convert unknown errors to ApplicationError', () => {
      const normalized = normalizeError('string error');

      expect(normalized).toBeInstanceOf(ApplicationError);
      expect(normalized.message).toBe('An unknown error occurred');
      expect(normalized.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('formatErrorResponse', () => {
    it('should format ApplicationError for API response', () => {
      const error = new ApplicationError('Test error', 'TEST_ERROR', 500);
      const response = formatErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.error.message).toBe('Test error');
      expect(response.error.code).toBe('TEST_ERROR');
    });

    it('should format regular Error for API response', () => {
      const error = new Error('Regular error');
      const response = formatErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.error.message).toBe('Regular error');
      expect(response.error.code).toBe('INTERNAL_ERROR');
    });

    it('should format unknown errors for API response', () => {
      const response = formatErrorResponse('string error');

      expect(response.success).toBe(false);
      expect(response.error.message).toBe('An unknown error occurred');
      expect(response.error.code).toBe('UNKNOWN_ERROR');
    });
  });
});
