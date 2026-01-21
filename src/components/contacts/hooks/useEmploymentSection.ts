import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { SectionMode, EmploymentSectionData } from '@/lib/contacts/types'
import { DEFAULT_EMPLOYMENT_DATA } from '@/lib/contacts/types'

interface UseEmploymentSectionOptions {
  contactId: string
  initialData?: Partial<EmploymentSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseEmploymentSectionReturn {
  data: EmploymentSectionData
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
 * useEmploymentSection - Hook for managing Employment section state
 */
export function useEmploymentSection({
  contactId,
  initialData,
  mode,
  onSaveComplete,
}: UseEmploymentSectionOptions): UseEmploymentSectionReturn {
  const [localData, setLocalData] = useState<EmploymentSectionData>(() => ({
    ...DEFAULT_EMPLOYMENT_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<EmploymentSectionData | null>(null)

  const saveMutation = trpc.contacts.saveEmployment.useMutation()

  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_EMPLOYMENT_DATA, ...initialData }
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
      console.error('Failed to save employment:', error)
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

export default useEmploymentSection
