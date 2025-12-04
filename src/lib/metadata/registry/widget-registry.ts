/**
 * Widget Registry
 *
 * Maps field types and widget types to their React component implementations.
 * This is the core of the metadata-driven rendering system.
 */

import React from 'react';
import type { FieldType, WidgetType, FieldDefinition, WidgetDefinition, FormatDefinition } from '../types';

// ==========================================
// WIDGET COMPONENT INTERFACE
// ==========================================

export interface WidgetRenderProps<T = unknown> {
  /** Widget/field definition */
  definition: WidgetDefinition | FieldDefinition;

  /** Current value */
  value: T;

  /** Change handler (for input widgets) */
  onChange?: (value: T) => void;

  /** Blur handler */
  onBlur?: () => void;

  /** Is in editing mode */
  isEditing: boolean;

  /** Is disabled */
  disabled?: boolean;

  /** Error message */
  error?: string | null;

  /** Entity data context */
  entity?: Record<string, unknown>;

  /** Additional className */
  className?: string;
}

export interface WidgetComponent<T = unknown> {
  /** Display component (read-only) */
  Display: React.ComponentType<WidgetRenderProps<T>>;

  /** Input component (editable) */
  Input?: React.ComponentType<WidgetRenderProps<T>>;

  /** Default props */
  defaultProps?: Partial<WidgetRenderProps<T>>;

  /** Format value for display */
  format?: (value: T, formatDef?: FormatDefinition) => string;

  /** Parse display value back to data value */
  parse?: (displayValue: string) => T;
}

// ==========================================
// WIDGET REGISTRY
// ==========================================

const widgetRegistry = new Map<string, WidgetComponent>();

/**
 * Register a widget component
 */
export function registerWidget<T = unknown>(
  type: WidgetType | FieldType | string,
  component: WidgetComponent<T>
): void {
  widgetRegistry.set(type, component as WidgetComponent);
}

/**
 * Get a widget component by type
 */
export function getWidget(type: string): WidgetComponent | undefined {
  return widgetRegistry.get(type);
}

/**
 * Check if a widget type is registered
 */
export function hasWidget(type: string): boolean {
  return widgetRegistry.has(type);
}

/**
 * Get all registered widget types
 */
export function getRegisteredWidgetTypes(): string[] {
  return Array.from(widgetRegistry.keys());
}

// ==========================================
// FIELD TYPE TO WIDGET TYPE MAPPING
// ==========================================

const fieldTypeToWidgetMap: Partial<Record<FieldType, { display: WidgetType; input: WidgetType }>> = {
  // Text types
  text: { display: 'text-display', input: 'text-input' },
  textarea: { display: 'text-display', input: 'textarea-input' },
  richtext: { display: 'text-display', input: 'richtext-input' },

  // Numeric types
  number: { display: 'text-display', input: 'number-input' },
  currency: { display: 'currency-display', input: 'currency-input' },
  percentage: { display: 'percentage-display', input: 'percentage-input' },

  // Date/Time types
  date: { display: 'date-display', input: 'date-input' },
  datetime: { display: 'datetime-display', input: 'datetime-input' },
  time: { display: 'text-display', input: 'time-input' },
  duration: { display: 'text-display', input: 'text-input' },

  // Boolean/Choice types
  boolean: { display: 'boolean-display', input: 'boolean-input' },
  enum: { display: 'badge-display', input: 'select-input' },
  select: { display: 'entity-link', input: 'entity-select' },
  multiselect: { display: 'entity-list-display', input: 'entity-multiselect' },
  radio: { display: 'text-display', input: 'radio-input' },
  'checkbox-group': { display: 'tags-display', input: 'checkbox-group-input' },

  // Special types
  tags: { display: 'tags-display', input: 'tags-input' },
  email: { display: 'email-display', input: 'email-input' },
  phone: { display: 'phone-display', input: 'phone-input' },
  url: { display: 'link-display', input: 'url-input' },
  uuid: { display: 'text-display', input: 'text-input' },

  // File types
  file: { display: 'text-display', input: 'file-input' },
  files: { display: 'text-display', input: 'files-input' },
  image: { display: 'image-display', input: 'image-input' },

  // Composite types
  address: { display: 'address-display', input: 'text-input' },
  json: { display: 'json-display', input: 'json-input' },
  computed: { display: 'text-display', input: 'text-input' },

  // Date range types
  'date-range': { display: 'text-display', input: 'date-range-picker' },
};

/**
 * Get the widget type for a field type
 */
export function getWidgetTypeForField(
  fieldType: FieldType,
  isEditing: boolean
): WidgetType {
  const mapping = fieldTypeToWidgetMap[fieldType];
  if (!mapping) {
    return isEditing ? 'text-input' : 'text-display';
  }
  return isEditing ? mapping.input : mapping.display;
}

/**
 * Get the widget component for a field type
 */
export function getWidgetForField(
  fieldType: FieldType,
  isEditing: boolean
): WidgetComponent | undefined {
  const widgetType = getWidgetTypeForField(fieldType, isEditing);
  return getWidget(widgetType);
}

// ==========================================
// DEFAULT WIDGET IMPLEMENTATIONS
// ==========================================

// These are placeholder implementations - actual components are registered elsewhere

/**
 * Create a simple display widget
 */
export function createDisplayWidget<T = unknown>(
  formatFn?: (value: T) => string
): WidgetComponent<T> {
  return {
    Display: ({ value, className }) => {
      const displayValue = formatFn ? formatFn(value) : String(value ?? '-');
      return React.createElement('span', { className }, displayValue);
    },
  };
}

/**
 * Create a simple input widget
 */
export function createInputWidget<T = string>(
  inputType: 'text' | 'number' | 'email' | 'tel' | 'url' = 'text',
  parseFn?: (value: string) => T
): WidgetComponent<T> {
  return {
    Display: ({ value }) => React.createElement('span', null, String(value ?? '-')),
    Input: ({ value, onChange, onBlur, disabled, error, className, definition }) => {
      const fieldDef = definition as FieldDefinition;
      return React.createElement('input', {
        type: inputType,
        value: value ?? '',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          const newValue = parseFn ? parseFn(e.target.value) : (e.target.value as unknown as T);
          onChange?.(newValue);
        },
        onBlur,
        disabled,
        placeholder: fieldDef.placeholder,
        className: `${className} ${error ? 'border-red-500' : ''}`,
      });
    },
    parse: parseFn,
  };
}

// ==========================================
// FORMAT UTILITIES
// ==========================================

/**
 * Format a currency value
 */
export function formatCurrency(
  value: number | null | undefined,
  currency = 'USD',
  locale = 'en-US'
): string {
  if (value == null) return '-';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format a date value
 */
export function formatDate(
  value: Date | string | null | undefined,
  format = 'short',
  locale = 'en-US'
): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '-';

  if (format === 'short') {
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  } else if (format === 'long') {
    return date.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
  } else if (format === 'relative') {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString(locale);
}

/**
 * Format a datetime value
 */
export function formatDateTime(
  value: Date | string | null | undefined,
  locale = 'en-US'
): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '-';

  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format a percentage value
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals = 0
): string {
  if (value == null) return '-';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a phone number
 */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return '-';
  // Simple US phone formatting
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return value;
}

/**
 * Format a number with thousands separator
 */
export function formatNumber(
  value: number | null | undefined,
  decimals = 0,
  locale = 'en-US'
): string {
  if (value == null) return '-';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ==========================================
// EXPORT ALL
// ==========================================

export {
  widgetRegistry,
  fieldTypeToWidgetMap,
};
