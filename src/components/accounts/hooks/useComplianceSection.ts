import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { ComplianceSectionData, SectionMode } from '@/lib/accounts/types'
import { DEFAULT_COMPLIANCE_DATA } from '@/lib/accounts/types'

interface UseComplianceSectionOptions {
  accountId: string
  initialData?: Partial<ComplianceSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseComplianceSectionReturn {
  data: ComplianceSectionData
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
 * useComplianceSection - Hook for managing Compliance section state and operations
 *
 * Handles:
 * - Local state management for form data
 * - Syncing from initial/server data
 * - Save operations via tRPC
 * - Edit mode toggling
 */
export function useComplianceSection({
  accountId,
  initialData,
  mode,
  onSaveComplete,
}: UseComplianceSectionOptions): UseComplianceSectionReturn {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<ComplianceSectionData>(() => ({
    ...DEFAULT_COMPLIANCE_DATA,
    ...initialData,
    compliance: {
      ...DEFAULT_COMPLIANCE_DATA.compliance,
      ...initialData?.compliance,
      insurance: {
        ...DEFAULT_COMPLIANCE_DATA.compliance.insurance,
        ...initialData?.compliance?.insurance,
      },
      backgroundCheck: {
        ...DEFAULT_COMPLIANCE_DATA.compliance.backgroundCheck,
        ...initialData?.compliance?.backgroundCheck,
      },
      drugTest: {
        ...DEFAULT_COMPLIANCE_DATA.compliance.drugTest,
        ...initialData?.compliance?.drugTest,
      },
    },
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<ComplianceSectionData | null>(null)

  // Save mutation
  const saveMutation = trpc.accounts.saveCompliance.useMutation()

  // Sync from initial data when it changes
  useEffect(() => {
    if (initialData) {
      const merged: ComplianceSectionData = {
        ...DEFAULT_COMPLIANCE_DATA,
        ...initialData,
        compliance: {
          ...DEFAULT_COMPLIANCE_DATA.compliance,
          ...initialData.compliance,
          insurance: {
            ...DEFAULT_COMPLIANCE_DATA.compliance.insurance,
            ...initialData.compliance?.insurance,
          },
          backgroundCheck: {
            ...DEFAULT_COMPLIANCE_DATA.compliance.backgroundCheck,
            ...initialData.compliance?.backgroundCheck,
          },
          drugTest: {
            ...DEFAULT_COMPLIANCE_DATA.compliance.drugTest,
            ...initialData.compliance?.drugTest,
          },
        },
      }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  // Handle single field change
  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      await saveMutation.mutateAsync({
        accountId,
        data: localData,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save compliance:', error)
      throw error
    }
  }, [accountId, localData, saveMutation, onSaveComplete])

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
  const errors = saveMutation.error?.data?.zodError?.fieldErrors as Record<string, string> | undefined

  return {
    data: localData,
    isLoading: false,
    isSaving: saveMutation.isPending,
    isEditing,
    errors,
    handleChange,
    handleSave,
    handleCancel,
    handleEdit,
  }
}

export default useComplianceSection
