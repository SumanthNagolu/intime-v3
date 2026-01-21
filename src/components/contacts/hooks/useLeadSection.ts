import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { SectionMode, LeadSectionData } from '@/lib/contacts/types'
import { DEFAULT_LEAD_DATA } from '@/lib/contacts/types'

interface UseLeadSectionOptions {
  contactId: string
  initialData?: Partial<LeadSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseLeadSectionReturn {
  data: LeadSectionData
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
 * useLeadSection - Hook for managing Lead section state
 */
export function useLeadSection({
  contactId,
  initialData,
  mode,
  onSaveComplete,
}: UseLeadSectionOptions): UseLeadSectionReturn {
  const [localData, setLocalData] = useState<LeadSectionData>(() => ({
    ...DEFAULT_LEAD_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<LeadSectionData | null>(null)

  const saveMutation = trpc.contacts.saveLead.useMutation()

  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_LEAD_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await saveMutation.mutateAsync({
        contactId,
        data: localData as any,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save lead info:', error)
      throw error
    }
  }, [contactId, localData, saveMutation, onSaveComplete])

  const handleCancel = useCallback(() => {
    if (originalData) {
      setLocalData(originalData)
    }
    setIsEditing(false)
  }, [originalData])

  const handleEdit = useCallback(() => {
    setOriginalData(localData)
    setIsEditing(true)
  }, [localData])

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

export default useLeadSection
