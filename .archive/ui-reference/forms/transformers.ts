/**
 * Form Data Transformers
 * Utilities for transforming data between form values and API payloads
 */

// ============================================
// Type Definitions
// ============================================

export interface TransformOptions {
  stripEmpty?: boolean;
  trimStrings?: boolean;
  convertNullToUndefined?: boolean;
  dateFormat?: 'iso' | 'date' | 'timestamp';
}

// ============================================
// String Transformers
// ============================================

/**
 * Trim whitespace from all string values in an object
 */
export function trimStrings<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };

  for (const key in result) {
    const value = result[key];
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = value.trim();
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = trimStrings(value as Record<string, unknown>);
    }
  }

  return result;
}

/**
 * Convert empty strings to undefined
 */
export function stripEmptyStrings<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };

  for (const key in result) {
    const value = result[key];
    if (value === '') {
      (result as Record<string, unknown>)[key] = undefined;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = stripEmptyStrings(value as Record<string, unknown>);
    }
  }

  return result;
}

/**
 * Convert null values to undefined
 */
export function nullToUndefined<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };

  for (const key in result) {
    const value = result[key];
    if (value === null) {
      (result as Record<string, unknown>)[key] = undefined;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = nullToUndefined(value as Record<string, unknown>);
    }
  }

  return result;
}

// ============================================
// Phone Number Transformers
// ============================================

/**
 * Parse formatted phone to digits only
 * (555) 555-5555 -> 5555555555
 */
export function parsePhone(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, '');
  return digits.length > 0 ? digits : undefined;
}

/**
 * Format phone number for display
 * 5555555555 -> (555) 555-5555
 */
export function formatPhone(phone: string | undefined | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return digits;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

// ============================================
// Currency Transformers
// ============================================

/**
 * Parse currency string to number
 * "$1,234.56" -> 1234.56
 */
export function parseCurrency(value: string | undefined | null): number | undefined {
  if (!value) return undefined;
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? undefined : num;
}

/**
 * Format number to currency string
 * 1234.56 -> "1234.56"
 */
export function formatCurrencyValue(
  value: number | string | undefined | null,
  decimals = 2
): string {
  if (value === undefined || value === null || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return num.toFixed(decimals);
}

/**
 * Format number to display currency
 * 1234.56 -> "$1,234.56"
 */
export function formatCurrencyDisplay(
  value: number | string | undefined | null,
  currency = 'USD'
): string {
  if (value === undefined || value === null || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num);
}

// ============================================
// Date Transformers
// ============================================

/**
 * Parse date to ISO string (YYYY-MM-DD)
 */
export function toISODateString(date: Date | string | undefined | null): string | undefined {
  if (!date) return undefined;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString().split('T')[0];
}

/**
 * Parse date to full ISO timestamp
 */
export function toISOTimestamp(date: Date | string | undefined | null): string | undefined {
  if (!date) return undefined;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/**
 * Parse ISO string to Date object
 */
export function parseDate(dateStr: string | undefined | null): Date | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? undefined : d;
}

/**
 * Format date for display
 */
export function formatDateDisplay(
  date: Date | string | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', options || {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ============================================
// SSN/EIN Transformers
// ============================================

/**
 * Parse SSN to digits only
 * XXX-XX-XXXX -> XXXXXXXXX
 */
export function parseSSN(ssn: string | undefined | null): string | undefined {
  if (!ssn) return undefined;
  const digits = ssn.replace(/\D/g, '');
  return digits.length === 9 ? digits : undefined;
}

/**
 * Format SSN for display (masked)
 * XXXXXXXXX -> ***-**-XXXX
 */
export function formatSSNMasked(ssn: string | undefined | null): string {
  if (!ssn) return '';
  const digits = ssn.replace(/\D/g, '');
  if (digits.length !== 9) return '';
  return `***-**-${digits.slice(5)}`;
}

/**
 * Parse EIN to digits only
 * XX-XXXXXXX -> XXXXXXXXX
 */
export function parseEIN(ein: string | undefined | null): string | undefined {
  if (!ein) return undefined;
  const digits = ein.replace(/\D/g, '');
  return digits.length === 9 ? digits : undefined;
}

/**
 * Format EIN for display
 * XXXXXXXXX -> XX-XXXXXXX
 */
export function formatEIN(ein: string | undefined | null): string {
  if (!ein) return '';
  const digits = ein.replace(/\D/g, '');
  if (digits.length !== 9) return '';
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

// ============================================
// Array Transformers
// ============================================

/**
 * Filter empty strings from array
 */
export function filterEmptyStrings(arr: string[] | undefined | null): string[] {
  if (!arr) return [];
  return arr.filter((item) => item.trim() !== '');
}

/**
 * Convert comma-separated string to array
 */
export function stringToArray(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Convert array to comma-separated string
 */
export function arrayToString(arr: string[] | undefined | null): string {
  if (!arr || arr.length === 0) return '';
  return arr.join(', ');
}

// ============================================
// Object Transformers
// ============================================

/**
 * Remove undefined/null values from object
 */
export function removeEmptyValues<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};

  for (const key in obj) {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        const nested = removeEmptyValues(value as Record<string, unknown>);
        if (Object.keys(nested).length > 0) {
          (result as Record<string, unknown>)[key] = nested;
        }
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          result[key] = value as T[Extract<keyof T, string>];
        }
      } else {
        result[key] = value as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * Flatten nested object for form state
 */
export function flattenObject(
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = value;
    }
  }

  return result;
}

/**
 * Unflatten dot-notation keys to nested object
 */
export function unflattenObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key in obj) {
    const keys = key.split('.');
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = obj[key];
  }

  return result;
}

// ============================================
// Generic Form Transformer
// ============================================

/**
 * Transform form values for API submission
 */
export function transformFormToPayload<T extends Record<string, unknown>>(
  values: T,
  options: TransformOptions = {}
): T {
  const {
    stripEmpty = true,
    trimStrings: shouldTrim = true,
    convertNullToUndefined = true,
  } = options;

  let result = { ...values };

  if (shouldTrim) {
    result = trimStrings(result);
  }

  if (stripEmpty) {
    result = stripEmptyStrings(result);
  }

  if (convertNullToUndefined) {
    result = nullToUndefined(result);
  }

  return result;
}

/**
 * Transform API response for form values
 */
export function transformPayloadToForm<T extends Record<string, unknown>>(
  payload: T,
  defaults: Partial<T> = {}
): T {
  const result = { ...defaults, ...payload };

  // Convert null to undefined for form compatibility
  return nullToUndefined(result) as T;
}

// ============================================
// Domain-specific Transformers
// ============================================

/**
 * Transform job form values for API
 */
export function transformJobFormToPayload(values: Record<string, unknown>): Record<string, unknown> {
  return transformFormToPayload({
    ...values,
    rateMin: parseCurrency(values.rateMin as string),
    rateMax: parseCurrency(values.rateMax as string),
    requiredSkills: filterEmptyStrings(values.requiredSkills as string[]),
    preferredSkills: filterEmptyStrings(values.preferredSkills as string[]),
  });
}

/**
 * Transform candidate form values for API
 */
export function transformCandidateFormToPayload(values: Record<string, unknown>): Record<string, unknown> {
  return transformFormToPayload({
    ...values,
    phone: parsePhone(values.phone as string),
    mobile: parsePhone(values.mobile as string),
    currentSalary: parseCurrency(values.currentSalary as string),
    expectedSalary: parseCurrency(values.expectedSalary as string),
    skills: filterEmptyStrings(values.skills as string[]),
    certifications: filterEmptyStrings(values.certifications as string[]),
  });
}

/**
 * Transform vendor form values for API
 */
export function transformVendorFormToPayload(values: Record<string, unknown>): Record<string, unknown> {
  return transformFormToPayload({
    ...values,
    phone: parsePhone(values.phone as string),
    industryFocus: filterEmptyStrings(values.industryFocus as string[]),
    geographicFocus: filterEmptyStrings(values.geographicFocus as string[]),
  });
}

/**
 * Transform lead form values for API
 */
export function transformLeadFormToPayload(values: Record<string, unknown>): Record<string, unknown> {
  return transformFormToPayload({
    ...values,
    phone: parsePhone(values.phone as string),
    estimatedValue: parseCurrency(values.estimatedValue as string),
  });
}

/**
 * Transform deal form values for API
 */
export function transformDealFormToPayload(values: Record<string, unknown>): Record<string, unknown> {
  return transformFormToPayload({
    ...values,
    value: parseCurrency(values.value as string),
  });
}

/**
 * Transform employee onboarding values for API
 */
export function transformEmployeeOnboardingToPayload(values: Record<string, unknown>): Record<string, unknown> {
  const basicInfo = values.basicInfo as Record<string, unknown> | undefined;
  const payroll = values.payroll as Record<string, unknown> | undefined;

  return transformFormToPayload({
    ...values,
    basicInfo: basicInfo ? {
      ...basicInfo,
      phone: parsePhone(basicInfo.phone as string),
      ssnEncrypted: parseSSN(basicInfo.ssnEncrypted as string),
      emergencyContact: {
        ...(basicInfo.emergencyContact as Record<string, unknown>),
        phone: parsePhone((basicInfo.emergencyContact as Record<string, unknown>)?.phone as string),
      },
    } : undefined,
    payroll: payroll ? {
      ...payroll,
      salaryAmount: parseCurrency(payroll.salaryAmount as string),
    } : undefined,
  });
}
