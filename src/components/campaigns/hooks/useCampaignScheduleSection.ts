import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { SectionMode, CampaignScheduleSectionData } from '@/lib/campaigns/types'
import { DEFAULT_SCHEDULE_DATA } from '@/lib/campaigns/types'
import { scheduleDataToApi } from '@/lib/campaigns/mappers'

interface UseCampaignScheduleSectionOptions {
  campaignId: string
  initialData?: Partial<CampaignScheduleSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseCampaignScheduleSectionReturn {
  data: CampaignScheduleSectionData
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
 * useCampaignScheduleSection - Hook for managing Campaign Schedule section state
 */
export function useCampaignScheduleSection({
  campaignId,
  initialData,
  mode,
  onSaveComplete,
}: UseCampaignScheduleSectionOptions): UseCampaignScheduleSectionReturn {
  const [localData, setLocalData] = useState<CampaignScheduleSectionData>(() => ({
    ...DEFAULT_SCHEDULE_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<CampaignScheduleSectionData | null>(null)

  const saveMutation = trpc.crm.campaigns.update.useMutation()

  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_SCHEDULE_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    try {
      const apiData = scheduleDataToApi(localData)
      await saveMutation.mutateAsync({
        id: campaignId,
        ...apiData,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save campaign schedule:', error)
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
    handleSave,
    handleCancel,
    handleEdit,
  }
}

export default useCampaignScheduleSection
