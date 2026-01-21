import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { SectionMode, CampaignChannelsSectionData, CampaignChannel } from '@/lib/campaigns/types'
import { DEFAULT_CHANNELS_DATA } from '@/lib/campaigns/types'
import { channelsDataToApi } from '@/lib/campaigns/mappers'

interface UseCampaignChannelsSectionOptions {
  campaignId: string
  initialData?: Partial<CampaignChannelsSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseCampaignChannelsSectionReturn {
  data: CampaignChannelsSectionData
  isLoading: boolean
  isSaving: boolean
  isEditing: boolean
  errors: Record<string, string> | undefined
  handleChange: (field: string, value: unknown) => void
  handleToggleChannel: (channel: CampaignChannel) => void
  handleSave: () => Promise<void>
  handleCancel: () => void
  handleEdit: () => void
}

/**
 * useCampaignChannelsSection - Hook for managing Campaign Channels section state
 */
export function useCampaignChannelsSection({
  campaignId,
  initialData,
  mode,
  onSaveComplete,
}: UseCampaignChannelsSectionOptions): UseCampaignChannelsSectionReturn {
  const [localData, setLocalData] = useState<CampaignChannelsSectionData>(() => ({
    ...DEFAULT_CHANNELS_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<CampaignChannelsSectionData | null>(null)

  const saveMutation = trpc.crm.campaigns.update.useMutation()

  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_CHANNELS_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleToggleChannel = useCallback((channel: CampaignChannel) => {
    setLocalData(prev => {
      const isSelected = prev.channels.includes(channel)
      return {
        ...prev,
        channels: isSelected
          ? prev.channels.filter(c => c !== channel)
          : [...prev.channels, channel],
      }
    })
  }, [])

  const handleSave = useCallback(async () => {
    try {
      const apiData = channelsDataToApi(localData)
      await saveMutation.mutateAsync({
        id: campaignId,
        ...apiData,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save campaign channels:', error)
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
    handleToggleChannel,
    handleSave,
    handleCancel,
    handleEdit,
  }
}

export default useCampaignChannelsSection
