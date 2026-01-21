import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { SectionMode, CommunicationSectionData } from '@/lib/contacts/types'
import { DEFAULT_COMMUNICATION_DATA } from '@/lib/contacts/types'

interface UseCommunicationSectionOptions {
  contactId: string
  initialData?: Partial<CommunicationSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseCommunicationSectionReturn {
  data: CommunicationSectionData
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
 * useCommunicationSection - Hook for managing Communication section state
 */
export function useCommunicationSection({
  contactId,
  initialData,
  mode,
  onSaveComplete,
}: UseCommunicationSectionOptions): UseCommunicationSectionReturn {
  const [localData, setLocalData] = useState<CommunicationSectionData>(() => ({
    ...DEFAULT_COMMUNICATION_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<CommunicationSectionData | null>(null)

  const saveMutation = trpc.contacts.saveCommunication.useMutation()

  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_COMMUNICATION_DATA, ...initialData }
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
      console.error('Failed to save communication preferences:', error)
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

export default useCommunicationSection
