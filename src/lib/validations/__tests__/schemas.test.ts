/**
 * Validation Schemas Tests
 *
 * Tests for Zod validation schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  email,
  password,
  uuid,
  phone,
  loginSchema,
  signupSchema,
  eventFiltersSchema,
  replayEventsSchema,
  handlerActionSchema,
} from '../schemas';

describe('Core Validation Patterns', () => {
  describe('email', () => {
    it('should accept valid emails', () => {
      expect(email.parse('test@example.com')).toBe('test@example.com');
      expect(email.parse('USER@EXAMPLE.COM')).toBe('user@example.com'); // Lowercase
    });

    it('should reject invalid emails', () => {
      expect(() => email.parse('invalid')).toThrow();
      expect(() => email.parse('test@')).toThrow();
      expect(() => email.parse('@example.com')).toThrow();
    });

    it('should trim whitespace', () => {
      expect(email.parse('  test@example.com  ')).toBe('test@example.com');
    });
  });

  describe('password', () => {
    it('should accept valid passwords', () => {
      expect(password.parse('ValidPass123')).toBe('ValidPass123');
      expect(password.parse('Complex!Pass1')).toBe('Complex!Pass1');
    });

    it('should reject passwords that are too short', () => {
      expect(() => password.parse('Short1')).toThrow('at least 8 characters');
    });

    it('should reject passwords without lowercase', () => {
      expect(() => password.parse('PASSWORD123')).toThrow('lowercase letter');
    });

    it('should reject passwords without uppercase', () => {
      expect(() => password.parse('password123')).toThrow('uppercase letter');
    });

    it('should reject passwords without numbers', () => {
      expect(() => password.parse('PasswordOnly')).toThrow('number');
    });
  });

  describe('uuid', () => {
    it('should accept valid UUIDs', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(uuid.parse(validUuid)).toBe(validUuid);
    });

    it('should reject invalid UUIDs', () => {
      expect(() => uuid.parse('not-a-uuid')).toThrow('Invalid UUID');
      expect(() => uuid.parse('12345')).toThrow();
    });
  });

  describe('phone', () => {
    it('should accept valid phone numbers', () => {
      expect(phone.parse('+14155552671')).toBe('+14155552671');
      expect(phone.parse('14155552671')).toBe('14155552671');
    });

    it('should reject invalid phone numbers', () => {
      expect(() => phone.parse('0123456789')).toThrow(); // Cannot start with 0
      expect(() => phone.parse('abc')).toThrow(); // Not a number
      expect(() => phone.parse('+0123456789')).toThrow(); // Cannot start with 0
    });

    it('should accept undefined (optional)', () => {
      expect(phone.parse(undefined)).toBeUndefined();
    });
  });
});

describe('Auth Schemas', () => {
  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
      };
      expect(loginSchema.parse(data)).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123',
      };
      expect(() => loginSchema.parse(data)).toThrow();
    });

    it('should reject empty password', () => {
      const data = {
        email: 'test@example.com',
        password: '',
      };
      expect(() => loginSchema.parse(data)).toThrow('Password is required');
    });
  });

  describe('signupSchema', () => {
    it('should accept valid signup data', () => {
      const data = {
        email: 'test@example.com',
        password: 'ValidPass123',
        full_name: 'Test User',
      };
      const result = signupSchema.parse(data);
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBe('ValidPass123');
      expect(result.full_name).toBe('Test User');
    });

    it('should accept optional phone', () => {
      const data = {
        email: 'test@example.com',
        password: 'ValidPass123',
        full_name: 'Test User',
        phone: '+14155552671',
      };
      const result = signupSchema.parse(data);
      expect(result.phone).toBe('+14155552671');
    });

    it('should reject weak password', () => {
      const data = {
        email: 'test@example.com',
        password: 'weak',
        full_name: 'Test User',
      };
      expect(() => signupSchema.parse(data)).toThrow();
    });
  });
});

describe('Event Schemas', () => {
  describe('eventFiltersSchema', () => {
    it('should accept valid filters', () => {
      const filters = {
        eventType: 'user.created',
        status: 'pending' as const,
        limit: 50,
        offset: 0,
      };
      const result = eventFiltersSchema.parse(filters);
      expect(result.eventType).toBe('user.created');
      expect(result.status).toBe('pending');
      expect(result.limit).toBe(50);
    });

    it('should apply default values', () => {
      const result = eventFiltersSchema.parse({});
      expect(result.limit).toBe(100);
      expect(result.offset).toBe(0);
    });

    it('should reject invalid status', () => {
      const filters = {
        status: 'invalid-status',
      };
      expect(() => eventFiltersSchema.parse(filters)).toThrow();
    });

    it('should reject limit > 200', () => {
      const filters = {
        limit: 300,
      };
      expect(() => eventFiltersSchema.parse(filters)).toThrow();
    });
  });

  describe('replayEventsSchema', () => {
    it('should accept valid event IDs', () => {
      const data = {
        eventIds: [
          '123e4567-e89b-12d3-a456-426614174000',
          '223e4567-e89b-12d3-a456-426614174001',
        ],
      };
      const result = replayEventsSchema.parse(data);
      expect(result.eventIds).toHaveLength(2);
    });

    it('should reject empty array', () => {
      const data = {
        eventIds: [],
      };
      expect(() => replayEventsSchema.parse(data)).toThrow('at least one event ID');
    });

    it('should reject more than 100 events', () => {
      const data = {
        eventIds: Array(101).fill('123e4567-e89b-12d3-a456-426614174000'),
      };
      expect(() => replayEventsSchema.parse(data)).toThrow('Maximum 100 events');
    });

    it('should reject invalid UUIDs', () => {
      const data = {
        eventIds: ['not-a-uuid'],
      };
      expect(() => replayEventsSchema.parse(data)).toThrow();
    });
  });

  describe('handlerActionSchema', () => {
    it('should accept valid handler action', () => {
      const data = {
        handlerId: '123e4567-e89b-12d3-a456-426614174000',
        reason: 'Disabling handler due to repeated failures',
      };
      const result = handlerActionSchema.parse(data);
      expect(result.handlerId).toBe(data.handlerId);
      expect(result.reason).toBe(data.reason);
    });

    it('should accept handler action without reason', () => {
      const data = {
        handlerId: '123e4567-e89b-12d3-a456-426614174000',
      };
      const result = handlerActionSchema.parse(data);
      expect(result.handlerId).toBe(data.handlerId);
      expect(result.reason).toBeUndefined();
    });

    it('should reject reason shorter than 10 characters', () => {
      const data = {
        handlerId: '123e4567-e89b-12d3-a456-426614174000',
        reason: 'Too short',
      };
      expect(() => handlerActionSchema.parse(data)).toThrow('at least 10 characters');
    });
  });
});
