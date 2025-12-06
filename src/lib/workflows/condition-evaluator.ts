/**
 * Condition Evaluator
 *
 * Evaluates workflow trigger conditions against record data.
 * Supports various operators for different field types.
 */

import {
  type Condition,
  type TriggerConditions,
  type ConditionOperator,
} from './types'

export interface EvaluationContext {
  record: Record<string, unknown>
  previousRecord?: Record<string, unknown>
  user?: {
    id: string
    email: string
    role: string
  }
  org?: {
    id: string
    name: string
  }
}

export interface ConditionResult {
  passed: boolean
  field: string
  operator: ConditionOperator
  expected: unknown
  actual: unknown
  error?: string
}

export interface EvaluationResult {
  triggered: boolean
  logic: 'and' | 'or'
  results: ConditionResult[]
  errors: string[]
}

/**
 * Main function to evaluate trigger conditions
 */
export function evaluateConditions(
  conditions: TriggerConditions,
  context: EvaluationContext
): EvaluationResult {
  const results: ConditionResult[] = []
  const errors: string[] = []

  if (!conditions.conditions || conditions.conditions.length === 0) {
    // No conditions = always trigger
    return {
      triggered: true,
      logic: conditions.logic || 'and',
      results: [],
      errors: [],
    }
  }

  for (const condition of conditions.conditions) {
    try {
      const result = evaluateCondition(condition, context)
      results.push(result)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`Error evaluating condition for field "${condition.field}": ${errorMsg}`)
      results.push({
        passed: false,
        field: condition.field,
        operator: condition.operator,
        expected: condition.value,
        actual: undefined,
        error: errorMsg,
      })
    }
  }

  const logic = conditions.logic || 'and'
  let triggered: boolean

  if (logic === 'and') {
    triggered = results.every(r => r.passed)
  } else {
    triggered = results.some(r => r.passed)
  }

  return {
    triggered,
    logic,
    results,
    errors,
  }
}

/**
 * Evaluate a single condition
 */
export function evaluateCondition(
  condition: Condition,
  context: EvaluationContext
): ConditionResult {
  const { field, operator, value, valueEnd } = condition
  const actual = getFieldValue(field, context)

  let passed = false

  switch (operator) {
    case 'eq':
      passed = isEqual(actual, value)
      break

    case 'neq':
      passed = !isEqual(actual, value)
      break

    case 'contains':
      passed = stringContains(actual, value)
      break

    case 'starts_with':
      passed = stringStartsWith(actual, value)
      break

    case 'ends_with':
      passed = stringEndsWith(actual, value)
      break

    case 'gt':
      passed = compare(actual, value) > 0
      break

    case 'lt':
      passed = compare(actual, value) < 0
      break

    case 'gte':
      passed = compare(actual, value) >= 0
      break

    case 'lte':
      passed = compare(actual, value) <= 0
      break

    case 'between':
      passed = isBetween(actual, value, valueEnd)
      break

    case 'is_empty':
      passed = isEmpty(actual)
      break

    case 'is_not_empty':
      passed = !isEmpty(actual)
      break

    case 'in':
      passed = isInList(actual, value)
      break

    case 'not_in':
      passed = !isInList(actual, value)
      break

    case 'changed':
      passed = hasChanged(field, context)
      break

    case 'changed_to':
      passed = hasChangedTo(field, value, context)
      break

    case 'changed_from':
      passed = hasChangedFrom(field, value, context)
      break

    case 'has_rel':
      passed = hasRelationship(actual)
      break

    case 'no_rel':
      passed = !hasRelationship(actual)
      break

    default:
      throw new Error(`Unknown operator: ${operator}`)
  }

  return {
    passed,
    field,
    operator,
    expected: value,
    actual,
  }
}

/**
 * Get field value from context, supporting dot notation for nested fields
 */
function getFieldValue(field: string, context: EvaluationContext): unknown {
  const parts = field.split('.')
  let value: unknown = context.record

  for (const part of parts) {
    if (value === null || value === undefined) {
      return undefined
    }
    if (typeof value === 'object') {
      value = (value as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }

  return value
}

/**
 * Get previous field value from context
 */
function getPreviousFieldValue(field: string, context: EvaluationContext): unknown {
  if (!context.previousRecord) return undefined

  const parts = field.split('.')
  let value: unknown = context.previousRecord

  for (const part of parts) {
    if (value === null || value === undefined) {
      return undefined
    }
    if (typeof value === 'object') {
      value = (value as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }

  return value
}

/**
 * Check equality with type coercion
 */
function isEqual(actual: unknown, expected: unknown): boolean {
  if (actual === expected) return true
  if (actual === null || actual === undefined) return expected === null || expected === undefined

  // Handle number comparison
  if (typeof actual === 'number' || typeof expected === 'number') {
    return Number(actual) === Number(expected)
  }

  // Handle boolean comparison
  if (typeof expected === 'boolean') {
    if (typeof actual === 'boolean') return actual === expected
    if (typeof actual === 'string') {
      return (actual.toLowerCase() === 'true') === expected
    }
    return Boolean(actual) === expected
  }

  // Handle date comparison
  if (actual instanceof Date || expected instanceof Date) {
    const actualDate = actual instanceof Date ? actual : new Date(String(actual))
    const expectedDate = expected instanceof Date ? expected : new Date(String(expected))
    return actualDate.getTime() === expectedDate.getTime()
  }

  // String comparison
  return String(actual).toLowerCase() === String(expected).toLowerCase()
}

/**
 * String contains check
 */
function stringContains(actual: unknown, value: unknown): boolean {
  if (actual === null || actual === undefined) return false
  return String(actual).toLowerCase().includes(String(value).toLowerCase())
}

/**
 * String starts with check
 */
function stringStartsWith(actual: unknown, value: unknown): boolean {
  if (actual === null || actual === undefined) return false
  return String(actual).toLowerCase().startsWith(String(value).toLowerCase())
}

/**
 * String ends with check
 */
function stringEndsWith(actual: unknown, value: unknown): boolean {
  if (actual === null || actual === undefined) return false
  return String(actual).toLowerCase().endsWith(String(value).toLowerCase())
}

/**
 * Compare values (for gt, lt, gte, lte)
 */
function compare(actual: unknown, value: unknown): number {
  if (actual === null || actual === undefined) return -1
  if (value === null || value === undefined) return 1

  // Handle dates
  if (actual instanceof Date || isDateString(actual)) {
    const actualDate = actual instanceof Date ? actual : new Date(String(actual))
    const valueDate = value instanceof Date ? value : new Date(String(value))
    return actualDate.getTime() - valueDate.getTime()
  }

  // Handle numbers
  const numActual = Number(actual)
  const numValue = Number(value)

  if (!isNaN(numActual) && !isNaN(numValue)) {
    return numActual - numValue
  }

  // String comparison
  return String(actual).localeCompare(String(value))
}

/**
 * Check if value is a date string
 */
function isDateString(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const date = new Date(value)
  return !isNaN(date.getTime())
}

/**
 * Check if value is between two values
 */
function isBetween(actual: unknown, start: unknown, end: unknown): boolean {
  return compare(actual, start) >= 0 && compare(actual, end) <= 0
}

/**
 * Check if value is empty
 */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Check if value is in a list
 */
function isInList(actual: unknown, list: unknown): boolean {
  let listArray: unknown[]

  if (Array.isArray(list)) {
    listArray = list
  } else if (typeof list === 'string') {
    // Handle comma-separated string
    listArray = list.split(',').map(s => s.trim())
  } else {
    return false
  }

  return listArray.some(item => isEqual(actual, item))
}

/**
 * Check if field has changed
 */
function hasChanged(field: string, context: EvaluationContext): boolean {
  if (!context.previousRecord) return false

  const current = getFieldValue(field, context)
  const previous = getPreviousFieldValue(field, context)

  return !isEqual(current, previous)
}

/**
 * Check if field changed to a specific value
 */
function hasChangedTo(field: string, value: unknown, context: EvaluationContext): boolean {
  if (!context.previousRecord) return false

  const current = getFieldValue(field, context)
  const previous = getPreviousFieldValue(field, context)

  return !isEqual(previous, value) && isEqual(current, value)
}

/**
 * Check if field changed from a specific value
 */
function hasChangedFrom(field: string, value: unknown, context: EvaluationContext): boolean {
  if (!context.previousRecord) return false

  const current = getFieldValue(field, context)
  const previous = getPreviousFieldValue(field, context)

  return isEqual(previous, value) && !isEqual(current, value)
}

/**
 * Check if relationship exists
 */
function hasRelationship(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim() !== ''
  return true
}

/**
 * Validate a condition configuration
 */
export function validateCondition(condition: Condition): string[] {
  const errors: string[] = []

  if (!condition.field) {
    errors.push('Field is required')
  }

  if (!condition.operator) {
    errors.push('Operator is required')
  }

  const operatorsRequiringValue: ConditionOperator[] = [
    'eq', 'neq', 'contains', 'starts_with', 'ends_with',
    'gt', 'lt', 'gte', 'lte', 'in', 'not_in',
    'changed_to', 'changed_from', 'between',
  ]

  if (operatorsRequiringValue.includes(condition.operator) && condition.value === undefined) {
    errors.push(`Value is required for operator "${condition.operator}"`)
  }

  if (condition.operator === 'between' && condition.valueEnd === undefined) {
    errors.push('End value is required for "between" operator')
  }

  return errors
}

/**
 * Validate all conditions
 */
export function validateConditions(conditions: TriggerConditions): string[] {
  const errors: string[] = []

  if (!conditions.conditions || !Array.isArray(conditions.conditions)) {
    return errors // Empty conditions are valid
  }

  conditions.conditions.forEach((condition, index) => {
    const conditionErrors = validateCondition(condition)
    conditionErrors.forEach(error => {
      errors.push(`Condition ${index + 1}: ${error}`)
    })
  })

  return errors
}
