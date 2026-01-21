import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { SectionMode, CampaignSetupSectionData } from '@/lib/campaigns/types'
import { DEFAULT_SETUP_DATA } from '@/lib/campaigns/types'
import { setupDataToApi } from '@/lib/campaigns/mappers'

interface UseCampaignSetupSectionOptions {
  campaignId: string
  initialData?: Partial<CampaignSetupSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseCampaignSetupSectionReturn {
  data: CampaignSetupSectionData
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
 * useCampaignSetupSection - Hook for managing Campaign Setup section state
 *
 * Handles:
 * - Local state management for form data
 * - Syncing from initial/server data
 * - Save operations via tRPC
 * - Edit mode toggling
 */
export function useCampaignSetupSection({
  campaignId,
  initialData,
  mode,
  onSaveComplete,
}: UseCampaignSetupSectionOptions): UseCampaignSetupSectionReturn {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<CampaignSetupSectionData>(() => ({
    ...DEFAULT_SETUP_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<CampaignSetupSectionData | null>(null)

  // Save mutation - uses the generic update endpoint
  const saveMutation = trpc.crm.campaigns.update.useMutation()

  // Sync from initial data when it changes
  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_SETUP_DATA, ...initialData }
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
      const apiData = setupDataToApi(localData)
      await saveMutation.mutateAsync({
        id: campaignId,
        ...apiData,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save campaign setup:', error)
      throw error
    }
  }, [campaignId, localData, saveMutation, onSaveComplete])

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

export default useCampaignSetupSection
