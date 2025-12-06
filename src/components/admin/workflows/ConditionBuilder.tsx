'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X, GripVertical } from 'lucide-react'
import {
  type Condition,
  type TriggerConditions,
  type EntityType,
  type ConditionOperator,
  ENTITY_FIELDS,
  CONDITION_OPERATORS,
  getOperatorsForFieldType,
} from '@/lib/workflows/types'

interface ConditionBuilderProps {
  entityType: EntityType
  value: TriggerConditions
  onChange: (conditions: TriggerConditions) => void
  disabled?: boolean
}

export function ConditionBuilder({
  entityType,
  value,
  onChange,
  disabled = false,
}: ConditionBuilderProps) {
  const fields = ENTITY_FIELDS[entityType] || []

  const addCondition = useCallback(() => {
    const defaultField = fields[0]
    if (!defaultField) return

    const defaultOperators = getOperatorsForFieldType(defaultField.type)
    const defaultOperator = defaultOperators[0]?.value || 'eq'

    onChange({
      ...value,
      conditions: [
        ...value.conditions,
        {
          field: defaultField.name,
          operator: defaultOperator,
          value: '',
        },
      ],
    })
  }, [fields, onChange, value])

  const updateCondition = useCallback((index: number, updates: Partial<Condition>) => {
    const newConditions = [...value.conditions]
    newConditions[index] = { ...newConditions[index], ...updates }

    // If field changed, reset operator and value
    if (updates.field) {
      const field = fields.find(f => f.name === updates.field)
      if (field) {
        const validOperators = getOperatorsForFieldType(field.type)
        const currentOperator = newConditions[index].operator
        const isValidOperator = validOperators.some(op => op.value === currentOperator)
        if (!isValidOperator) {
          newConditions[index].operator = validOperators[0]?.value || 'eq'
        }
        newConditions[index].value = ''
        newConditions[index].valueEnd = undefined
      }
    }

    // If operator changed, maybe reset value end
    if (updates.operator) {
      const operatorConfig = CONDITION_OPERATORS[updates.operator as ConditionOperator]
      if (!operatorConfig?.requiresValueEnd) {
        newConditions[index].valueEnd = undefined
      }
    }

    onChange({ ...value, conditions: newConditions })
  }, [fields, onChange, value])

  const removeCondition = useCallback((index: number) => {
    const newConditions = value.conditions.filter((_, i) => i !== index)
    onChange({ ...value, conditions: newConditions })
  }, [onChange, value])

  const toggleLogic = useCallback(() => {
    onChange({
      ...value,
      logic: value.logic === 'and' ? 'or' : 'and',
    })
  }, [onChange, value])

  const getFieldByName = (fieldName: string) => {
    return fields.find(f => f.name === fieldName)
  }

  return (
    <div className="space-y-4">
      {/* Logic Toggle */}
      {value.conditions.length > 1 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-charcoal-500">Match</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleLogic}
            disabled={disabled}
            className="h-7 px-2"
          >
            {value.logic === 'and' ? 'ALL' : 'ANY'}
          </Button>
          <span className="text-charcoal-500">of the following conditions:</span>
        </div>
      )}

      {/* Conditions List */}
      <div className="space-y-3">
        {value.conditions.map((condition, index) => {
          const field = getFieldByName(condition.field)
          const operators = field ? getOperatorsForFieldType(field.type) : []
          const operatorConfig = CONDITION_OPERATORS[condition.operator as ConditionOperator]

          return (
            <div
              key={index}
              className="flex items-start gap-2 p-3 bg-charcoal-50 rounded-lg border border-charcoal-100"
            >
              {/* Drag Handle (future: implement drag-and-drop) */}
              <div className="p-1 text-charcoal-400 cursor-grab">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Field Selector */}
              <div className="flex-1 min-w-[150px]">
                <Select
                  value={condition.field}
                  onValueChange={(v) => updateCondition(index, { field: v })}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((f) => (
                      <SelectItem key={f.name} value={f.name}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Operator Selector */}
              <div className="w-[160px]">
                <Select
                  value={condition.operator}
                  onValueChange={(v) => updateCondition(index, { operator: v as ConditionOperator })}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Value Input */}
              {operatorConfig?.requiresValue && (
                <div className={operatorConfig.requiresValueEnd ? 'w-[120px]' : 'flex-1'}>
                  <ConditionValueInput
                    field={field}
                    value={condition.value}
                    onChange={(v) => updateCondition(index, { value: v })}
                    disabled={disabled}
                    placeholder="Value"
                  />
                </div>
              )}

              {/* Value End Input (for between) */}
              {operatorConfig?.requiresValueEnd && (
                <>
                  <span className="text-charcoal-400 self-center">and</span>
                  <div className="w-[120px]">
                    <ConditionValueInput
                      field={field}
                      value={condition.valueEnd}
                      onChange={(v) => updateCondition(index, { valueEnd: v })}
                      disabled={disabled}
                      placeholder="Value"
                    />
                  </div>
                </>
              )}

              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCondition(index)}
                disabled={disabled}
                className="h-9 w-9 text-charcoal-400 hover:text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )
        })}
      </div>

      {/* Add Condition Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addCondition}
        disabled={disabled || fields.length === 0}
        className="h-8"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Condition
      </Button>

      {/* Preview */}
      {value.conditions.length > 0 && (
        <ConditionPreview conditions={value} fields={fields} />
      )}
    </div>
  )
}

// Value Input Component (handles different field types)
interface ConditionValueInputProps {
  field: { name: string; label: string; type: string; options?: { value: string; label: string }[] } | undefined
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
  placeholder?: string
}

function ConditionValueInput({
  field,
  value,
  onChange,
  disabled,
  placeholder,
}: ConditionValueInputProps) {
  if (!field) {
    return (
      <Input
        type="text"
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="h-9 bg-white"
      />
    )
  }

  switch (field.type) {
    case 'select':
      return (
        <Select
          value={String(value ?? '')}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-9 bg-white">
            <SelectValue placeholder={placeholder || 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case 'number':
    case 'currency':
      return (
        <Input
          type="number"
          value={value !== undefined && value !== null ? String(value) : ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
          disabled={disabled}
          placeholder={placeholder}
          className="h-9 bg-white"
        />
      )

    case 'date':
      return (
        <Input
          type="date"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-9 bg-white"
        />
      )

    case 'datetime':
      return (
        <Input
          type="datetime-local"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-9 bg-white"
        />
      )

    case 'boolean':
      return (
        <Select
          value={String(value ?? '')}
          onValueChange={(v) => onChange(v === 'true')}
          disabled={disabled}
        >
          <SelectTrigger className="h-9 bg-white">
            <SelectValue placeholder={placeholder || 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      )

    default:
      return (
        <Input
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="h-9 bg-white"
        />
      )
  }
}

// Condition Preview Component
interface ConditionPreviewProps {
  conditions: TriggerConditions
  fields: { name: string; label: string; type: string; options?: { value: string; label: string }[] }[]
}

function ConditionPreview({ conditions, fields }: ConditionPreviewProps) {
  const getFieldLabel = (fieldName: string) => {
    return fields.find(f => f.name === fieldName)?.label || fieldName
  }

  const getOperatorLabel = (operator: string) => {
    return CONDITION_OPERATORS[operator as ConditionOperator]?.label || operator
  }

  const formatValue = (fieldName: string, value: unknown) => {
    const field = fields.find(f => f.name === fieldName)
    if (field?.type === 'select' && field.options) {
      const option = field.options.find(o => o.value === value)
      return option?.label || String(value)
    }
    if (value === true) return 'Yes'
    if (value === false) return 'No'
    return String(value ?? '')
  }

  if (conditions.conditions.length === 0) {
    return null
  }

  const parts = conditions.conditions.map((c, i) => {
    const operatorConfig = CONDITION_OPERATORS[c.operator as ConditionOperator]
    let text = `${getFieldLabel(c.field)} ${getOperatorLabel(c.operator).toLowerCase()}`

    if (operatorConfig?.requiresValue) {
      text += ` "${formatValue(c.field, c.value)}"`
    }

    if (operatorConfig?.requiresValueEnd && c.valueEnd !== undefined) {
      text += ` and "${formatValue(c.field, c.valueEnd)}"`
    }

    return text
  })

  const connector = conditions.logic === 'and' ? ' AND ' : ' OR '

  return (
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
      <p className="text-sm text-blue-800">
        <span className="font-medium">Preview: </span>
        {parts.join(connector)}
      </p>
    </div>
  )
}
