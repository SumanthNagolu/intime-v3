import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { IdentitySectionData, SectionMode } from '@/lib/accounts/types'
import { DEFAULT_IDENTITY_DATA } from '@/lib/accounts/types'

interface UseIdentitySectionOptions {
  accountId: string
  initialData?: Partial<IdentitySectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseIdentitySectionReturn {
  data: IdentitySectionData
  isLoading: boolean
  isSaving: boolean
  isEditing: boolean
  errors: Record<string, string> | undefined
  handleChange: (field: string, value: unknown) => void
  handleToggleIndustry: (industry: string) => void
  handleSave: () => Promise<void>
  handleCancel: () => void
  handleEdit: () => void
}

/**
 * useIdentitySection - Hook for managing Identity section state and operations
 *
 * Handles:
 * - Local state management for form data
 * - Syncing from initial/server data
 * - Save operations via tRPC
 * - Edit mode toggling
 */
export function useIdentitySection({
  accountId,
  initialData,
  mode,
  onSaveComplete,
}: UseIdentitySectionOptions): UseIdentitySectionReturn {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<IdentitySectionData>(() => ({
    ...DEFAULT_IDENTITY_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<IdentitySectionData | null>(null)

  // Save mutation
  const saveMutation = trpc.accounts.saveIdentity.useMutation()

  // Sync from initial data when it changes
  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_IDENTITY_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  // Handle single field change
  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Handle industry toggle (for multi-select)
  const handleToggleIndustry = useCallback((industry: string) => {
    setLocalData(prev => {
      const isSelected = prev.industries.includes(industry)
      return {
        ...prev,
        industries: isSelected
          ? prev.industries.filter(i => i !== industry)
          : [...prev.industries, industry],
      }
    })
  }, [])

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      // Cast to the expected schema type - Zod will validate at runtime
      // The type cast is needed because our internal types are more specific than the schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await saveMutation.mutateAsync({
        accountId,
        data: localData as any,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save identity:', error)
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
    handleToggleIndustry,
    handleSave,
    handleCancel,
    handleEdit,
  }
}

export default useIdentitySection
