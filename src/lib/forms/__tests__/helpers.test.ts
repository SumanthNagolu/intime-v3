/**
 * Form Helpers Tests
 *
 * Tests for form utility functions.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  validateData,
  getValidationErrors,
  formatValidationError,
  formDataToObject,
} from '../helpers';

describe('Form Helpers', () => {
  describe('validateData', () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    });

    it('should return success for valid data', () => {
      const data = { email: 'test@example.com', age: 25 };
      const result = validateData(schema, data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should return error for invalid data', () => {
      const data = { email: 'invalid-email', age: 15 };
      const result = validateData(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getValidationErrors', () => {
    it('should extract errors by field', () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });

      const result = schema.safeParse({
        email: 'invalid',
        password: 'short',
      });

      if (!result.success) {
        const errors = getValidationErrors(result.error);
        expect(errors.email).toBeDefined();
        expect(errors.password).toBeDefined();
        expect(errors.email[0]).toContain('email');
        expect(errors.password[0]).toContain('8');
      }
    });

    it('should handle nested fields', () => {
      const schema = z.object({
        user: z.object({
          email: z.string().email(),
        }),
      });

      const result = schema.safeParse({
        user: { email: 'invalid' },
      });

      if (!result.success) {
        const errors = getValidationErrors(result.error);
        expect(errors['user.email']).toBeDefined();
      }
    });
  });

  describe('formatValidationError', () => {
    it('should format errors as a single string', () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });

      const result = schema.safeParse({
        email: 'invalid',
        password: 'short',
      });

      if (!result.success) {
        const formatted = formatValidationError(result.error);
        expect(formatted).toContain('email');
        expect(formatted).toContain('8');
        expect(formatted).toContain('.');
      }
    });
  });

  describe('formDataToObject', () => {
    it('should convert simple FormData to object', () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('name', 'Test User');

      const result = formDataToObject(formData);

      expect(result).toEqual({
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should handle array fields', () => {
      const formData = new FormData();
      formData.append('tags[]', 'tag1');
      formData.append('tags[]', 'tag2');
      formData.append('tags[]', 'tag3');

      const result = formDataToObject(formData);

      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should handle nested fields', () => {
      const formData = new FormData();
      formData.append('user.email', 'test@example.com');
      formData.append('user.name', 'Test User');
      formData.append('user.address.street', '123 Main St');

      const result = formDataToObject(formData);

      expect(result.user).toEqual({
        email: 'test@example.com',
        name: 'Test User',
        address: {
          street: '123 Main St',
        },
      });
    });

    it('should handle mixed fields', () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('tags[]', 'tag1');
      formData.append('tags[]', 'tag2');
      formData.append('profile.bio', 'Test bio');

      const result = formDataToObject(formData);

      expect(result).toEqual({
        email: 'test@example.com',
        tags: ['tag1', 'tag2'],
        profile: {
          bio: 'Test bio',
        },
      });
    });
  });
});
