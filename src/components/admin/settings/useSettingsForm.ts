'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'

// Type for setting value
type SettingValue = string | number | boolean | string[] | null

// Valid categories
type SettingCategory = 'general' | 'security' | 'email' | 'files' | 'api' | 'branding' | 'localization' | 'business' | 'compliance'

// Type for a setting key-value pair with category
interface SettingItem {
  key: string
  value?: SettingValue
  category: SettingCategory
}

// Type for field definitions
interface FieldDefinition<T> {
  key: string
  defaultValue: T
  parse?: (value: unknown) => T
}

/**
 * Parse settings array into a key-value map
 */
export function parseSettingsToMap(
  settings: Array<{ key: string; value: unknown }> | undefined
): Record<string, unknown> {
  if (!settings) return {}

  return Object.fromEntries(
    settings.map(s => {
      try {
        const parsed = typeof s.value === 'string' ? JSON.parse(s.value) : s.value
        return [s.key, parsed]
      } catch {
        return [s.key, s.value]
      }
    })
  )
}

/**
 * Hook for managing system settings form state
 */
export function useSystemSettingsForm<T extends Record<string, SettingValue>>(
  category: SettingCategory,
  fieldDefinitions: readonly FieldDefinition<SettingValue>[],
  options?: {
    successMessage?: string
  }
) {
  const utils = trpc.useUtils()

  // Fetch system settings - category types may differ between query and SettingCategory
  const { data: systemSettings, isLoading } = trpc.settings.getSystemSettings.useQuery({ category: category as 'general' | 'security' | 'email' | 'files' | 'api' })

  // Initialize state from field definitions
  const initialState = React.useMemo(() => {
    const state: Record<string, SettingValue> = {}
    fieldDefinitions.forEach(field => {
      state[field.key] = field.defaultValue
    })
    return state as T
  }, [fieldDefinitions])

  const [formState, setFormState] = React.useState<T>(initialState)
  const [isDirty, setIsDirty] = React.useState(false)

  // Update form when data loads
  React.useEffect(() => {
    if (systemSettings) {
      const settingsMap = parseSettingsToMap(systemSettings)

      setFormState(prev => {
        const newState = { ...prev }
        fieldDefinitions.forEach(field => {
          const value = settingsMap[field.key]
          if (value !== undefined) {
            newState[field.key as keyof T] = (field.parse ? field.parse(value) : value) as T[keyof T]
          }
        })
        return newState
      })
      setIsDirty(false)
    }
  }, [systemSettings, fieldDefinitions])

  // Mutation
  const updateSettings = trpc.settings.bulkUpdateSystemSettings.useMutation({
    onSuccess: () => {
      utils.settings.getSystemSettings.invalidate()
      toast.success(options?.successMessage || 'Settings saved successfully')
      setIsDirty(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save settings')
    },
  })

  // Update field
  const updateField = React.useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }, [])

  // Save handler
  const save = React.useCallback(() => {
    const settings = fieldDefinitions.map(field => ({
      key: field.key,
      value: formState[field.key as keyof T],
    }))
    updateSettings.mutate({ settings })
  }, [formState, fieldDefinitions, updateSettings])

  return {
    formState,
    updateField,
    save,
    isLoading,
    isSaving: updateSettings.isPending,
    isDirty,
  }
}

/**
 * Hook for managing organization settings form state
 */
export function useOrgSettingsForm<T extends Record<string, SettingValue>>(
  category: 'general' | 'branding' | 'localization' | 'business' | 'compliance',
  fieldDefinitions: FieldDefinition<SettingValue>[],
  options?: {
    successMessage?: string
  }
) {
  const utils = trpc.useUtils()

  // Fetch org settings
  const { data: orgSettings, isLoading } = trpc.settings.getOrgSettings.useQuery({ category })

  // Initialize state from field definitions
  const initialState = React.useMemo(() => {
    const state: Record<string, SettingValue> = {}
    fieldDefinitions.forEach(field => {
      state[field.key] = field.defaultValue
    })
    return state as T
  }, [fieldDefinitions])

  const [formState, setFormState] = React.useState<T>(initialState)
  const [isDirty, setIsDirty] = React.useState(false)

  // Update form when data loads
  React.useEffect(() => {
    if (orgSettings) {
      const settingsMap = parseSettingsToMap(orgSettings)

      setFormState(prev => {
        const newState = { ...prev }
        fieldDefinitions.forEach(field => {
          const value = settingsMap[field.key]
          if (value !== undefined) {
            newState[field.key as keyof T] = (field.parse ? field.parse(value) : value) as T[keyof T]
          }
        })
        return newState
      })
      setIsDirty(false)
    }
  }, [orgSettings, fieldDefinitions])

  // Mutation
  const updateSettings = trpc.settings.bulkUpdateOrgSettings.useMutation({
    onSuccess: () => {
      utils.settings.getOrgSettings.invalidate()
      toast.success(options?.successMessage || 'Settings saved successfully')
      setIsDirty(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save settings')
    },
  })

  // Update field
  const updateField = React.useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }, [])

  // Save handler
  const save = React.useCallback(() => {
    const settings = fieldDefinitions.map(field => ({
      key: field.key,
      value: formState[field.key as keyof T],
      category: category as 'general' | 'branding' | 'localization' | 'business' | 'compliance',
    }))
    updateSettings.mutate({ settings })
  }, [formState, fieldDefinitions, category, updateSettings])

  return {
    formState,
    updateField,
    save,
    isLoading,
    isSaving: updateSettings.isPending,
    isDirty,
  }
}

/**
 * Validation utilities
 */
export const validators = {
  email: (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },

  url: (value: string): boolean => {
    if (!value) return true // Empty is valid (optional)
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  hex: (value: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)
  },

  range: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max
  },

  required: (value: unknown): boolean => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    return true
  },
}

/**
 * Hook to warn user about unsaved changes
 */
export function useUnsavedChangesWarning(isDirty: boolean) {
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])
}
