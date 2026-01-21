'use client'

import { useState, useCallback } from 'react'
import type { SectionMode } from '@/lib/deals/types'

interface UseDealSectionOptions<T> {
  initialData: T
  defaultData: T
  mode: SectionMode
  onSave?: (data: T) => Promise<void>
  validate?: (data: T) => Record<string, string>
  onSaveComplete?: () => void
}

/**
 * Generic hook for managing deal section state
 *
 * Provides:
 * - Local state management
 * - Edit mode toggling
 * - Validation
 * - Save/cancel handlers
 */
export function useDealSection<T extends Record<string, unknown>>({
  initialData,
  defaultData,
  mode,
  onSave,
  validate,
  onSaveComplete,
}: UseDealSectionOptions<T>) {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<T>(() => ({
    ...defaultData,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<T | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Handle field change
  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error for this field
    setErrors((prev) => {
      const updated = { ...prev }
      delete updated[field]
      return updated
    })
  }, [])

  // Handle batch change
  const handleBatchChange = useCallback((changes: Partial<T>) => {
    setLocalData((prev) => ({
      ...prev,
      ...changes,
    }))
    // Clear errors for changed fields
    setErrors((prev) => {
      const updated = { ...prev }
      for (const key of Object.keys(changes)) {
        delete updated[key]
      }
      return updated
    })
  }, [])

  // Validation
  const runValidation = useCallback(() => {
    if (validate) {
      const newErrors = validate(localData)
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }
    return true
  }, [localData, validate])

  // Handle save
  const handleSave = useCallback(async () => {
    if (!runValidation()) {
      throw new Error('Validation failed')
    }

    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave(localData)
      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save section:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [localData, onSave, runValidation, onSaveComplete])

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (originalData) {
      setLocalData(originalData)
    }
    setIsEditing(false)
    setErrors({})
  }, [originalData])

  // Handle edit
  const handleEdit = useCallback(() => {
    setOriginalData(localData)
    setIsEditing(true)
  }, [localData])

  // Reset to initial data
  const reset = useCallback(() => {
    setLocalData({ ...defaultData, ...initialData })
    setErrors({})
    setIsEditing(mode === 'edit' || mode === 'create')
  }, [defaultData, initialData, mode])

  return {
    data: localData,
    setData: setLocalData,
    isEditing,
    isSaving,
    errors,
    handleChange,
    handleBatchChange,
    handleSave,
    handleCancel,
    handleEdit,
    validate: runValidation,
    reset,
  }
}

export default useDealSection
