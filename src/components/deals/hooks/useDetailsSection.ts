'use client'

import { useState, useCallback, useMemo } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { SectionMode, DetailsSectionData } from '@/lib/deals/types'
import { DEFAULT_DETAILS_DATA } from '@/lib/deals/types'
import { mapDetailsToApi } from '@/lib/deals/mappers'

interface UseDetailsSectionOptions {
  dealId: string
  initialData?: Partial<DetailsSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

export function useDetailsSection({
  dealId,
  initialData,
  mode,
  onSaveComplete,
}: UseDetailsSectionOptions) {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<DetailsSectionData>(() => ({
    ...DEFAULT_DETAILS_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<DetailsSectionData | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Save mutation
  const saveMutation = trpc.crm.deals.updateDetails.useMutation()

  // Validation
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!localData.title.trim()) {
      newErrors.title = 'Deal title is required'
    }

    if (localData.value <= 0) {
      newErrors.value = 'Deal value must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [localData])

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

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validate()) {
      throw new Error('Validation failed')
    }

    try {
      const apiData = mapDetailsToApi(localData)
      await saveMutation.mutateAsync({
        id: dealId,
        data: apiData,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save details:', error)
      throw error
    }
  }, [dealId, localData, saveMutation, validate, onSaveComplete])

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

  // Computed values
  const weightedValue = useMemo(() => {
    return Math.round(localData.value * (localData.probability / 100))
  }, [localData.value, localData.probability])

  return {
    data: localData,
    weightedValue,
    isLoading: false,
    isSaving: saveMutation.isPending,
    isEditing,
    errors,
    handleChange,
    handleSave,
    handleCancel,
    handleEdit,
    validate,
  }
}

export default useDetailsSection
