import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { SectionMode, CampaignTeamSectionData } from '@/lib/campaigns/types'
import { DEFAULT_TEAM_DATA } from '@/lib/campaigns/types'
import { teamDataToApi } from '@/lib/campaigns/mappers'

interface UseCampaignTeamSectionOptions {
  campaignId: string
  initialData?: Partial<CampaignTeamSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseCampaignTeamSectionReturn {
  data: CampaignTeamSectionData
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
 * useCampaignTeamSection - Hook for managing Campaign Team section state
 */
export function useCampaignTeamSection({
  campaignId,
  initialData,
  mode,
  onSaveComplete,
}: UseCampaignTeamSectionOptions): UseCampaignTeamSectionReturn {
  const [localData, setLocalData] = useState<CampaignTeamSectionData>(() => ({
    ...DEFAULT_TEAM_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<CampaignTeamSectionData | null>(null)

  const saveMutation = trpc.crm.campaigns.update.useMutation()

  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_TEAM_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    try {
      const apiData = teamDataToApi(localData)
      await saveMutation.mutateAsync({
        id: campaignId,
        ...apiData,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save campaign team:', error)
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

export default useCampaignTeamSection
