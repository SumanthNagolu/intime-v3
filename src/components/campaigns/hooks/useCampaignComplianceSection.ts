import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { SectionMode, CampaignComplianceSectionData } from '@/lib/campaigns/types'
import { DEFAULT_COMPLIANCE_DATA } from '@/lib/campaigns/types'
import { complianceDataToApi } from '@/lib/campaigns/mappers'

interface UseCampaignComplianceSectionOptions {
  campaignId: string
  initialData?: Partial<CampaignComplianceSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseCampaignComplianceSectionReturn {
  data: CampaignComplianceSectionData
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
 * useCampaignComplianceSection - Hook for managing Campaign Compliance section state
 */
export function useCampaignComplianceSection({
  campaignId,
  initialData,
  mode,
  onSaveComplete,
}: UseCampaignComplianceSectionOptions): UseCampaignComplianceSectionReturn {
  const [localData, setLocalData] = useState<CampaignComplianceSectionData>(() => ({
    ...DEFAULT_COMPLIANCE_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<CampaignComplianceSectionData | null>(null)

  const saveMutation = trpc.crm.campaigns.update.useMutation()

  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_COMPLIANCE_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    try {
      const apiData = complianceDataToApi(localData)
      await saveMutation.mutateAsync({
        id: campaignId,
        ...apiData,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save campaign compliance:', error)
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

export default useCampaignComplianceSection
