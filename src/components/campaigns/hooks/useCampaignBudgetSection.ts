import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { SectionMode, CampaignBudgetSectionData } from '@/lib/campaigns/types'
import { DEFAULT_BUDGET_DATA } from '@/lib/campaigns/types'
import { budgetDataToApi } from '@/lib/campaigns/mappers'

interface UseCampaignBudgetSectionOptions {
  campaignId: string
  initialData?: Partial<CampaignBudgetSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseCampaignBudgetSectionReturn {
  data: CampaignBudgetSectionData
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
 * useCampaignBudgetSection - Hook for managing Campaign Budget section state
 */
export function useCampaignBudgetSection({
  campaignId,
  initialData,
  mode,
  onSaveComplete,
}: UseCampaignBudgetSectionOptions): UseCampaignBudgetSectionReturn {
  const [localData, setLocalData] = useState<CampaignBudgetSectionData>(() => ({
    ...DEFAULT_BUDGET_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<CampaignBudgetSectionData | null>(null)

  const saveMutation = trpc.crm.campaigns.update.useMutation()

  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_BUDGET_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    try {
      const apiData = budgetDataToApi(localData)
      await saveMutation.mutateAsync({
        id: campaignId,
        ...apiData,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save campaign budget:', error)
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

export default useCampaignBudgetSection
