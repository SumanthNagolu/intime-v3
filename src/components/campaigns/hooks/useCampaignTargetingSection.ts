import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { SectionMode, CampaignTargetingSectionData } from '@/lib/campaigns/types'
import { DEFAULT_TARGETING_DATA } from '@/lib/campaigns/types'
import { targetingDataToApi } from '@/lib/campaigns/mappers'

interface UseCampaignTargetingSectionOptions {
  campaignId: string
  initialData?: Partial<CampaignTargetingSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseCampaignTargetingSectionReturn {
  data: CampaignTargetingSectionData
  isLoading: boolean
  isSaving: boolean
  isEditing: boolean
  errors: Record<string, string> | undefined
  handleChange: (field: string, value: unknown) => void
  handleToggle: (field: string, value: string) => void
  handleSave: () => Promise<void>
  handleCancel: () => void
  handleEdit: () => void
}

/**
 * useCampaignTargetingSection - Hook for managing Campaign Targeting section state
 */
export function useCampaignTargetingSection({
  campaignId,
  initialData,
  mode,
  onSaveComplete,
}: UseCampaignTargetingSectionOptions): UseCampaignTargetingSectionReturn {
  const [localData, setLocalData] = useState<CampaignTargetingSectionData>(() => ({
    ...DEFAULT_TARGETING_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<CampaignTargetingSectionData | null>(null)

  const saveMutation = trpc.crm.campaigns.update.useMutation()

  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_TARGETING_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Handle toggle for multi-select arrays (industries, companySizes, regions)
  const handleToggle = useCallback((field: string, value: string) => {
    setLocalData(prev => {
      const currentArray = prev[field as keyof CampaignTargetingSectionData] as string[]
      const isSelected = currentArray.includes(value)
      return {
        ...prev,
        [field]: isSelected
          ? currentArray.filter(v => v !== value)
          : [...currentArray, value],
      }
    })
  }, [])

  const handleSave = useCallback(async () => {
    try {
      const apiData = targetingDataToApi(localData)
      await saveMutation.mutateAsync({
        id: campaignId,
        ...apiData,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save campaign targeting:', error)
      throw error
    }
  }, [campaignId, localData, saveMutation, onSaveComplete])

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
    handleToggle,
    handleSave,
    handleCancel,
    handleEdit,
  }
}

export default useCampaignTargetingSection
