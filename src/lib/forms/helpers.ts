/**
 * Form Helper Functions
 *
 * Utilities for form handling with Zod validation and React Hook Form.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { UseFormProps, useForm as useHookForm } from 'react-hook-form';
import { z } from 'zod';

/**
 * Type-safe useForm hook with Zod validation
 *
 * @example
 * ```tsx
 * const form = useForm(schemas.login);
 * ```
 */
export function useForm<T extends z.ZodType<any, any, any>>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>>, 'resolver'>
) {
  return useHookForm<z.infer<T>>({
    resolver: zodResolver(schema) as any,
    ...options,
  });
}

/**
 * Validate data against a Zod schema
 *
 * @example
 * ```ts
 * const result = validateData(schemas.login, formData);
 * if (result.success) {
 *   // result.data is typed
 * } else {
 *   // result.error contains validation errors
 * }
 * ```
 */
export function validateData<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Extract validation errors for display
 *
 * @example
 * ```ts
 * const errors = getValidationErrors(zodError);
 * // { email: ['Invalid email'], password: ['Too short'] }
 * ```
 */
export function getValidationErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return errors;
}

/**
 * Format validation error for user display
 *
 * @example
 * ```ts
 * const message = formatValidationError(zodError);
 * // "Email is invalid. Password is too short."
 * ```
 */
export function formatValidationError(error: z.ZodError): string {
  return error.errors.map((err) => err.message).join('. ');
}

/**
 * Convert FormData to object with proper type coercion
 *
 * @example
 * ```ts
 * const data = formDataToObject(formData);
 * const validated = schemas.login.parse(data);
 * ```
 */
export function formDataToObject(formData: FormData): Record<string, any> {
  const object: Record<string, any> = {};

  formData.forEach((value, key) => {
    // Handle array fields (e.g., "tags[]")
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2);
      if (!object[arrayKey]) {
        object[arrayKey] = [];
      }
      object[arrayKey].push(value);
    } else {
      // Handle nested fields (e.g., "address.street")
      if (key.includes('.')) {
        const keys = key.split('.');
        let current = object;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      } else {
        object[key] = value;
      }
    }
  });

  return object;
}

/**
 * Create a type-safe form mutation handler
 *
 * @example
 * ```ts
 * const handleSubmit = createFormHandler(
 *   schemas.login,
 *   async (data) => {
 *     await login(data);
 *   }
 * );
 * ```
 */
export function createFormHandler<T extends z.ZodType>(
  schema: T,
  handler: (data: z.infer<T>) => Promise<void> | void
) {
  return async (formData: FormData | Record<string, any>) => {
    try {
      const data =
        formData instanceof FormData ? formDataToObject(formData) : formData;

      const validated = schema.parse(data);
      await handler(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(formatValidationError(error));
      }
      throw error;
    }
  };
}
