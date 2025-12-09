import { FieldDefinition } from '@/configs/entities/types'
import { format } from 'date-fns'

/**
 * Format a field value for display (used in review steps, read-only views)
 */
export function formatDisplayValue(
  value: unknown,
  field: FieldDefinition
): string {
  if (value === null || value === undefined) {
    return '—'
  }

  // Use custom formatter if provided
  if (field.formatValue) {
    return field.formatValue(value)
  }

  switch (field.type) {
    case 'select':
    case 'radio':
      const option = field.options?.find((o) => o.value === value)
      return option?.label || String(value)

    case 'multi-select':
      if (Array.isArray(value)) {
        return value
          .map((v) => field.options?.find((o) => o.value === v)?.label || v)
          .join(', ')
      }
      return String(value)

    case 'checkbox':
    case 'switch':
      return value ? 'Yes' : 'No'

    case 'date':
      try {
        return format(new Date(value as string | number), 'MMM d, yyyy')
      } catch {
        return String(value)
      }

    case 'datetime':
      try {
        return format(new Date(value as string | number), 'MMM d, yyyy h:mm a')
      } catch {
        return String(value)
      }

    case 'currency':
      const numValue = typeof value === 'number' ? value : parseFloat(String(value))
      if (isNaN(numValue)) return String(value)
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: field.currency || 'USD',
      }).format(numValue)

    case 'number':
      const num = typeof value === 'number' ? value : parseFloat(String(value))
      if (isNaN(num)) return String(value)
      return num.toLocaleString()

    case 'phone':
      // Basic US phone formatting
      const phone = String(value).replace(/\D/g, '')
      if (phone.length === 10) {
        return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
      }
      return String(value)

    case 'url':
      return String(value)

    case 'email':
      return String(value)

    case 'textarea':
    case 'rich-text':
      // Truncate long text
      const text = String(value)
      return text.length > 100 ? `${text.slice(0, 100)}...` : text

    case 'skills':
      if (Array.isArray(value)) {
        return value.map((s) => (typeof s === 'string' ? s : (s as { name: string }).name)).join(', ')
      }
      return String(value)

    case 'text':
    default:
      return String(value)
  }
}

/**
 * Validate fields based on field definitions
 */
export function validateFields(
  fields: FieldDefinition[],
  data: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const field of fields) {
    const value = data[field.key]

    // Required validation
    if (field.required) {
      if (value === null || value === undefined || value === '') {
        errors[field.key] = `${field.label} is required`
        continue
      }
      if (Array.isArray(value) && value.length === 0) {
        errors[field.key] = `${field.label} is required`
        continue
      }
    }

    // Skip further validation if empty and not required
    if (value === null || value === undefined || value === '') {
      continue
    }

    // Type-specific validation
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(String(value))) {
          errors[field.key] = 'Please enter a valid email address'
        }
        break

      case 'url':
        try {
          new URL(String(value))
        } catch {
          errors[field.key] = 'Please enter a valid URL'
        }
        break

      case 'phone':
        const phoneDigits = String(value).replace(/\D/g, '')
        if (phoneDigits.length < 10) {
          errors[field.key] = 'Please enter a valid phone number'
        }
        break

      case 'number':
      case 'currency':
        const numVal = typeof value === 'number' ? value : parseFloat(String(value))
        if (isNaN(numVal)) {
          errors[field.key] = 'Please enter a valid number'
        } else {
          if (field.min !== undefined && numVal < field.min) {
            errors[field.key] = `Minimum value is ${field.min}`
          }
          if (field.max !== undefined && numVal > field.max) {
            errors[field.key] = `Maximum value is ${field.max}`
          }
        }
        break
    }
  }

  return errors
}

/**
 * Check if a field should be visible based on conditional visibility
 */
export function isFieldVisible<T>(
  field: FieldDefinition,
  formData: T
): boolean {
  if (field.visibleWhen) {
    return field.visibleWhen(formData)
  }

  if (!field.dependsOn) return true

  const { field: dependentField, value: expectedValue, operator = 'eq' } = field.dependsOn
  const actualValue = (formData as Record<string, unknown>)[dependentField]

  switch (operator) {
    case 'eq':
      return actualValue === expectedValue
    case 'neq':
      return actualValue !== expectedValue
    case 'in':
      return Array.isArray(expectedValue) && expectedValue.includes(actualValue)
    default:
      return true
  }
}
