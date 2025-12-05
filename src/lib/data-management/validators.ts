import type { EntityConfig, FieldConfig } from './entities'

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  validRowCount: number
  errorRowCount: number
}

export interface ValidationError {
  row: number
  field: string
  value: unknown
  message: string
  code: string
}

export interface ValidationWarning {
  row: number
  field: string
  value: unknown
  message: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[\d\s\-\+\(\)\.]+$/
const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i

export const validateField = (
  value: unknown,
  field: FieldConfig,
  rowIndex: number
): { errors: ValidationError[]; warnings: ValidationWarning[] } => {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Check required
  if (field.required && (value === null || value === undefined || value === '')) {
    errors.push({
      row: rowIndex,
      field: field.name,
      value,
      message: `${field.displayName} is required`,
      code: 'REQUIRED',
    })
    return { errors, warnings }
  }

  // Skip further validation if empty and not required
  if (value === null || value === undefined || value === '') {
    return { errors, warnings }
  }

  const strValue = String(value).trim()

  // Type validation
  switch (field.type) {
    case 'email':
      if (!emailRegex.test(strValue)) {
        errors.push({
          row: rowIndex,
          field: field.name,
          value,
          message: `Invalid email format`,
          code: 'INVALID_EMAIL',
        })
      }
      break

    case 'phone':
      if (!phoneRegex.test(strValue)) {
        warnings.push({
          row: rowIndex,
          field: field.name,
          value,
          message: `Phone number may have invalid characters`,
        })
      }
      break

    case 'number':
      if (isNaN(Number(value))) {
        errors.push({
          row: rowIndex,
          field: field.name,
          value,
          message: `Must be a number`,
          code: 'INVALID_NUMBER',
        })
      }
      break

    case 'boolean':
      const boolValues = ['true', 'false', '1', '0', 'yes', 'no']
      if (!boolValues.includes(strValue.toLowerCase())) {
        errors.push({
          row: rowIndex,
          field: field.name,
          value,
          message: `Must be true/false, yes/no, or 1/0`,
          code: 'INVALID_BOOLEAN',
        })
      }
      break

    case 'date':
    case 'datetime': {
      const date = new Date(strValue)
      if (isNaN(date.getTime())) {
        errors.push({
          row: rowIndex,
          field: field.name,
          value,
          message: `Invalid date format`,
          code: 'INVALID_DATE',
        })
      }
      break
    }

    case 'uuid':
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(strValue)) {
        errors.push({
          row: rowIndex,
          field: field.name,
          value,
          message: `Invalid UUID format`,
          code: 'INVALID_UUID',
        })
      }
      break

    case 'string':
      // URL validation for common URL fields
      if (field.name.includes('url') || field.name.includes('website') || field.name.includes('linkedin')) {
        if (strValue && !urlRegex.test(strValue)) {
          warnings.push({
            row: rowIndex,
            field: field.name,
            value,
            message: `May not be a valid URL`,
          })
        }
      }
      break
  }

  // Enum validation
  if (field.enumValues && field.enumValues.length > 0) {
    if (!field.enumValues.includes(strValue) && !field.enumValues.includes(strValue.toLowerCase())) {
      errors.push({
        row: rowIndex,
        field: field.name,
        value,
        message: `Must be one of: ${field.enumValues.join(', ')}`,
        code: 'INVALID_ENUM',
      })
    }
  }

  // Max length validation
  if (field.maxLength && strValue.length > field.maxLength) {
    errors.push({
      row: rowIndex,
      field: field.name,
      value,
      message: `Exceeds maximum length of ${field.maxLength}`,
      code: 'MAX_LENGTH',
    })
  }

  return { errors, warnings }
}

export const validateRows = (
  rows: Record<string, unknown>[],
  entityConfig: EntityConfig,
  fieldMapping: Record<string, string>
): ValidationResult => {
  const allErrors: ValidationError[] = []
  const allWarnings: ValidationWarning[] = []
  const errorRows = new Set<number>()

  rows.forEach((row, index) => {
    entityConfig.fields.forEach(field => {
      if (!field.importable) return

      // Find the source column that maps to this destination field
      const sourceColumn = Object.entries(fieldMapping).find(
        ([, destField]) => destField === field.name
      )?.[0]

      if (!sourceColumn) {
        // Field not mapped - check if required
        if (field.required) {
          allErrors.push({
            row: index + 1,
            field: field.name,
            value: undefined,
            message: `${field.displayName} is required but not mapped`,
            code: 'UNMAPPED_REQUIRED',
          })
          errorRows.add(index + 1)
        }
        return
      }

      const value = row[sourceColumn]
      const { errors, warnings } = validateField(value, field, index + 1)

      if (errors.length > 0) {
        errorRows.add(index + 1)
      }

      allErrors.push(...errors)
      allWarnings.push(...warnings)
    })
  })

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    validRowCount: rows.length - errorRows.size,
    errorRowCount: errorRows.size,
  }
}

export const transformValue = (
  value: unknown,
  field: FieldConfig
): unknown => {
  if (value === null || value === undefined || value === '') {
    return field.defaultValue ?? null
  }

  const strValue = String(value).trim()

  switch (field.type) {
    case 'boolean':
      const lowerValue = strValue.toLowerCase()
      return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes'

    case 'number':
      const num = Number(strValue)
      return isNaN(num) ? null : num

    case 'date':
    case 'datetime':
      const date = new Date(strValue)
      return isNaN(date.getTime()) ? null : date.toISOString()

    case 'email':
      return strValue.toLowerCase()

    case 'string':
    case 'phone':
    default:
      // Normalize enum values to lowercase if they have enumValues
      if (field.enumValues && field.enumValues.length > 0) {
        const matchedEnum = field.enumValues.find(
          e => e.toLowerCase() === strValue.toLowerCase()
        )
        return matchedEnum || strValue
      }
      return strValue
  }
}

export const transformRow = (
  row: Record<string, unknown>,
  entityConfig: EntityConfig,
  fieldMapping: Record<string, string>
): Record<string, unknown> => {
  const result: Record<string, unknown> = {}

  for (const [sourceColumn, destField] of Object.entries(fieldMapping)) {
    const field = entityConfig.fields.find(f => f.name === destField)
    if (!field || !field.importable) continue

    const value = row[sourceColumn]
    result[field.dbColumn] = transformValue(value, field)
  }

  return result
}
