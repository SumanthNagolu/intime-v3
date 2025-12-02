'use client';

/**
 * Form Hooks and Utilities
 * Custom hooks for form state management, drafts, and validation
 */

import * as React from 'react';
import { useForm, UseFormReturn, FieldValues, DefaultValues, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getFormDefaults, FormType, mergeWithDefaults } from './defaults';

// ============================================
// useFormWithDefaults Hook
// ============================================

interface UseFormWithDefaultsOptions<T extends FieldValues> extends Omit<UseFormProps<T>, 'defaultValues' | 'resolver'> {
  formType: FormType;
  initialValues?: Partial<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodSchema<any>;
}

/**
 * Enhanced useForm hook with built-in defaults and validation
 */
export function useFormWithDefaults<T extends FieldValues>({
  formType,
  initialValues,
  schema,
  ...options
}: UseFormWithDefaultsOptions<T>): UseFormReturn<T> {
  const defaults = getFormDefaults(formType);
  const mergedDefaults = mergeWithDefaults(defaults as Partial<T>, initialValues);

  return useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    defaultValues: mergedDefaults as DefaultValues<T>,
    mode: 'onBlur',
    ...options,
  });
}

// ============================================
// useFormDraft Hook
// ============================================

interface UseFormDraftOptions {
  key: string;
  debounceMs?: number;
  enabled?: boolean;
}

interface UseFormDraftReturn<T> {
  savedDraft: T | null;
  saveDraft: (values: T) => void;
  clearDraft: () => void;
  hasDraft: boolean;
  lastSavedAt: Date | null;
}

/**
 * Auto-save form values to localStorage
 */
export function useFormDraft<T extends FieldValues>({
  key,
  debounceMs = 2000,
  enabled = true,
}: UseFormDraftOptions): UseFormDraftReturn<T> {
  const storageKey = `form_draft_${key}`;
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Load saved draft
  const savedDraft = React.useMemo<T | null>(() => {
    if (typeof window === 'undefined' || !enabled) return null;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.values as T;
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  }, [storageKey, enabled]);

  // Save draft with debouncing
  const saveDraft = React.useCallback(
    (values: T) => {
      if (!enabled) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        try {
          const data = {
            values,
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem(storageKey, JSON.stringify(data));
          setLastSavedAt(new Date());
        } catch {
          // Ignore storage errors
        }
      }, debounceMs);
    },
    [storageKey, debounceMs, enabled]
  );

  // Clear draft
  const clearDraft = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    try {
      localStorage.removeItem(storageKey);
      setLastSavedAt(null);
    } catch {
      // Ignore storage errors
    }
  }, [storageKey]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    savedDraft,
    saveDraft,
    clearDraft,
    hasDraft: savedDraft !== null,
    lastSavedAt,
  };
}

// ============================================
// useFormDirtyState Hook
// ============================================

interface UseFormDirtyStateReturn {
  isDirty: boolean;
  confirmLeave: () => boolean;
}

/**
 * Track form dirty state and warn before leaving
 */
export function useFormDirtyState(isDirty: boolean): UseFormDirtyStateReturn {
  // Set up beforeunload listener
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const confirmLeave = React.useCallback(() => {
    if (isDirty) {
      return window.confirm('You have unsaved changes. Are you sure you want to leave?');
    }
    return true;
  }, [isDirty]);

  return { isDirty, confirmLeave };
}

// ============================================
// useFormAnalytics Hook
// ============================================

interface FormAnalytics {
  startTime: Date;
  fieldInteractions: Record<string, number>;
  fieldErrors: Record<string, number>;
  stepsCompleted: number[];
  submissionAttempts: number;
}

interface UseFormAnalyticsReturn {
  analytics: FormAnalytics;
  trackFieldInteraction: (fieldName: string) => void;
  trackFieldError: (fieldName: string) => void;
  trackStepComplete: (stepIndex: number) => void;
  trackSubmissionAttempt: () => void;
  getAnalyticsSummary: () => {
    totalTimeSeconds: number;
    mostInteractedFields: string[];
    errorProneFields: string[];
    completionRate: number;
  };
}

/**
 * Track form usage analytics
 */
export function useFormAnalytics(totalSteps = 1): UseFormAnalyticsReturn {
  const [analytics, setAnalytics] = React.useState<FormAnalytics>({
    startTime: new Date(),
    fieldInteractions: {},
    fieldErrors: {},
    stepsCompleted: [],
    submissionAttempts: 0,
  });

  const trackFieldInteraction = React.useCallback((fieldName: string) => {
    setAnalytics((prev) => ({
      ...prev,
      fieldInteractions: {
        ...prev.fieldInteractions,
        [fieldName]: (prev.fieldInteractions[fieldName] || 0) + 1,
      },
    }));
  }, []);

  const trackFieldError = React.useCallback((fieldName: string) => {
    setAnalytics((prev) => ({
      ...prev,
      fieldErrors: {
        ...prev.fieldErrors,
        [fieldName]: (prev.fieldErrors[fieldName] || 0) + 1,
      },
    }));
  }, []);

  const trackStepComplete = React.useCallback((stepIndex: number) => {
    setAnalytics((prev) => ({
      ...prev,
      stepsCompleted: prev.stepsCompleted.includes(stepIndex)
        ? prev.stepsCompleted
        : [...prev.stepsCompleted, stepIndex],
    }));
  }, []);

  const trackSubmissionAttempt = React.useCallback(() => {
    setAnalytics((prev) => ({
      ...prev,
      submissionAttempts: prev.submissionAttempts + 1,
    }));
  }, []);

  const getAnalyticsSummary = React.useCallback(() => {
    const totalTimeSeconds = Math.floor((Date.now() - analytics.startTime.getTime()) / 1000);

    const mostInteractedFields = Object.entries(analytics.fieldInteractions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([field]) => field);

    const errorProneFields = Object.entries(analytics.fieldErrors)
      .filter(([, count]) => count > 1)
      .sort(([, a], [, b]) => b - a)
      .map(([field]) => field);

    const completionRate = (analytics.stepsCompleted.length / totalSteps) * 100;

    return {
      totalTimeSeconds,
      mostInteractedFields,
      errorProneFields,
      completionRate,
    };
  }, [analytics, totalSteps]);

  return {
    analytics,
    trackFieldInteraction,
    trackFieldError,
    trackStepComplete,
    trackSubmissionAttempt,
    getAnalyticsSummary,
  };
}

// ============================================
// useFormValidation Hook
// ============================================

interface UseFormValidationOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  validateOnChange?: boolean;
  showErrorsOnBlur?: boolean;
}

interface UseFormValidationReturn {
  isValid: boolean;
  errorCount: number;
  getFieldError: (fieldName: string) => string | undefined;
  validateField: (fieldName: string) => Promise<boolean>;
  validateAll: () => Promise<boolean>;
  clearError: (fieldName: string) => void;
  clearAllErrors: () => void;
}

/**
 * Enhanced form validation utilities
 */
export function useFormValidation<T extends FieldValues>({
  form,
  validateOnChange = false,
  showErrorsOnBlur = true,
}: UseFormValidationOptions<T>): UseFormValidationReturn {
  const { formState, trigger, clearErrors, setFocus } = form;
  const { errors, isValid } = formState;

  const errorCount = Object.keys(errors).length;

  const getFieldError = React.useCallback(
    (fieldName: string): string | undefined => {
      const error = fieldName.split('.').reduce((obj: Record<string, unknown>, key) => obj?.[key] as Record<string, unknown>, errors as unknown as Record<string, unknown>);
      return (error as { message?: string } | undefined)?.message;
    },
    [errors]
  );

  const validateField = React.useCallback(
    async (fieldName: string): Promise<boolean> => {
      return trigger(fieldName as never);
    },
    [trigger]
  );

  const validateAll = React.useCallback(async (): Promise<boolean> => {
    const result = await trigger();
    if (!result) {
      // Focus first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        setFocus(firstErrorField as never);
      }
    }
    return result;
  }, [trigger, errors, setFocus]);

  const clearError = React.useCallback(
    (fieldName: string) => {
      clearErrors(fieldName as never);
    },
    [clearErrors]
  );

  const clearAllErrors = React.useCallback(() => {
    clearErrors();
  }, [clearErrors]);

  return {
    isValid,
    errorCount,
    getFieldError,
    validateField,
    validateAll,
    clearError,
    clearAllErrors,
  };
}

// ============================================
// useFormProgress Hook
// ============================================

interface UseFormProgressReturn {
  progress: number;
  filledFields: number;
  totalFields: number;
}

/**
 * Calculate form completion progress
 */
export function useFormProgress<T extends FieldValues>(
  form: UseFormReturn<T>,
  requiredFields: string[]
): UseFormProgressReturn {
  const values = form.watch();

  const { filledFields, progress } = React.useMemo(() => {
    let filled = 0;

    for (const fieldName of requiredFields) {
      const value = fieldName.split('.').reduce(
        (obj: Record<string, unknown>, key) => obj?.[key] as Record<string, unknown>,
        values as unknown as Record<string, unknown>
      );

      if (value !== undefined && value !== null &&
          (typeof value !== 'string' || value !== '') &&
          !(Array.isArray(value) && value.length === 0)) {
        filled++;
      }
    }

    return {
      filledFields: filled,
      progress: requiredFields.length > 0 ? (filled / requiredFields.length) * 100 : 0,
    };
  }, [values, requiredFields]);

  return {
    progress,
    filledFields,
    totalFields: requiredFields.length,
  };
}

// ============================================
// useFormReset Hook
// ============================================

interface UseFormResetReturn<T extends FieldValues> {
  resetToDefaults: () => void;
  resetToSaved: (values: T) => void;
  resetField: (fieldName: keyof T) => void;
}

/**
 * Enhanced form reset utilities
 */
export function useFormReset<T extends FieldValues>(
  form: UseFormReturn<T>,
  defaults: Partial<T>
): UseFormResetReturn<T> {
  const { reset, resetField } = form;

  const resetToDefaults = React.useCallback(() => {
    reset(defaults as T);
  }, [reset, defaults]);

  const resetToSaved = React.useCallback(
    (values: T) => {
      reset(values);
    },
    [reset]
  );

  const resetSingleField = React.useCallback(
    (fieldName: keyof T) => {
      resetField(fieldName as never);
    },
    [resetField]
  );

  return {
    resetToDefaults,
    resetToSaved,
    resetField: resetSingleField,
  };
}

// ============================================
// useConditionalFields Hook
// ============================================

interface ConditionalFieldConfig {
  field: string;
  condition: {
    dependsOn: string;
    value: unknown;
    operator?: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  };
}

/**
 * Manage conditional field visibility
 */
export function useConditionalFields<T extends FieldValues>(
  form: UseFormReturn<T>,
  configs: ConditionalFieldConfig[]
): Record<string, boolean> {
  const values = form.watch();

  return React.useMemo(() => {
    const visibility: Record<string, boolean> = {};

    for (const config of configs) {
      const dependentValue = config.condition.dependsOn.split('.').reduce(
        (obj: Record<string, unknown>, key) => obj?.[key] as Record<string, unknown>,
        values as unknown as Record<string, unknown>
      );

      const { value, operator = 'equals' } = config.condition;

      switch (operator) {
        case 'equals':
          visibility[config.field] = dependentValue === value;
          break;
        case 'notEquals':
          visibility[config.field] = dependentValue !== value;
          break;
        case 'contains':
          visibility[config.field] = Array.isArray(dependentValue) && dependentValue.includes(value);
          break;
        case 'greaterThan':
          visibility[config.field] = typeof dependentValue === 'number' && typeof value === 'number' && dependentValue > value;
          break;
        case 'lessThan':
          visibility[config.field] = typeof dependentValue === 'number' && typeof value === 'number' && dependentValue < value;
          break;
        default:
          visibility[config.field] = true;
      }
    }

    return visibility;
  }, [values, configs]);
}
