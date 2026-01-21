import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { CompensationSectionData, SectionMode } from '@/lib/jobs/types'
import { DEFAULT_COMPENSATION_DATA } from '@/lib/jobs/types'

interface UseCompensationSectionOptions {
  jobId: string
  initialData?: Partial<CompensationSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseCompensationSectionReturn {
  data: CompensationSectionData
  isLoading: boolean
  isSaving: boolean
  isEditing: boolean
  errors: Record<string, string> | undefined
  handleChange: (field: string, value: unknown) => void
  handleSave: () => Promise<void>
  handleCancel: () => void
  handleEdit: () => void
}

/**
 * useCompensationSection - Hook for managing Compensation section state and operations
 */
export function useCompensationSection({
  jobId,
  initialData,
  mode,
  onSaveComplete,
}: UseCompensationSectionOptions): UseCompensationSectionReturn {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<CompensationSectionData>(() => ({
    ...DEFAULT_COMPENSATION_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<CompensationSectionData | null>(null)

  // Use the existing jobs.update mutation for partial updates
  const updateMutation = trpc.ats.jobs.update.useMutation()

  // Sync from initial data when it changes
  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_COMPENSATION_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  // Handle single field change
  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Handle save - use jobs.update
  const handleSave = useCallback(async () => {
    try {
      await updateMutation.mutateAsync({
        id: jobId,
        // DB columns
        rateType: localData.rateType,
        currency: localData.currency || undefined,
        rateMin: localData.billRateMin ? parseFloat(localData.billRateMin) : undefined,
        rateMax: localData.billRateMax ? parseFloat(localData.billRateMax) : undefined,
        feeType: localData.feeType,
        feePercentage: localData.feePercentage ? parseFloat(localData.feePercentage) : undefined,
        feeFlatAmount: localData.feeFlatAmount ? parseFloat(localData.feeFlatAmount) : undefined,
        // Store additional compensation details in intakeData
        intakeData: {
          payRateMin: localData.payRateMin,
          payRateMax: localData.payRateMax,
          conversionSalaryMin: localData.conversionSalaryMin,
          conversionSalaryMax: localData.conversionSalaryMax,
          conversionFee: localData.conversionFee,
          benefits: localData.benefits,
          weeklyHours: localData.weeklyHours,
          overtimeExpected: localData.overtimeExpected,
          onCallRequired: localData.onCallRequired,
          onCallSchedule: localData.onCallSchedule,
        },
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save compensation:', error)
      throw error
    }
  }, [jobId, localData, updateMutation, onSaveComplete])

  // Handle cancel - revert to original data
  const handleCancel = useCallback(() => {
    if (originalData) {
      setLocalData(originalData)
    }
    setIsEditing(false)
  }, [originalData])

  // Handle edit
  const handleEdit = useCallback(() => {
    setOriginalData(localData)
    setIsEditing(true)
  }, [localData])

  // Extract errors from mutation
  const errors = updateMutation.error?.data?.zodError?.fieldErrors as Record<string, string> | undefined

  return {
    data: localData,
    isLoading: false,
    isSaving: updateMutation.isPending,
    isEditing,
    errors,
    handleChange,
    handleSave,
    handleCancel,
    handleEdit,
  }
}

export default useCompensationSection
