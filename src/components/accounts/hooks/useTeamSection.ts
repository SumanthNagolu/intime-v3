import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { TeamSectionData, SectionMode } from '@/lib/accounts/types'
import { DEFAULT_TEAM_DATA } from '@/lib/accounts/types'

interface UseTeamSectionOptions {
  accountId: string
  initialData?: Partial<TeamSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseTeamSectionReturn {
  data: TeamSectionData
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
 * useTeamSection - Hook for managing Team section state and operations
 *
 * Handles:
 * - Local state management for form data
 * - Syncing from initial/server data
 * - Save operations via tRPC
 * - Edit mode toggling
 */
export function useTeamSection({
  accountId,
  initialData,
  mode,
  onSaveComplete,
}: UseTeamSectionOptions): UseTeamSectionReturn {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<TeamSectionData>(() => ({
    ...DEFAULT_TEAM_DATA,
    ...initialData,
    team: {
      ...DEFAULT_TEAM_DATA.team,
      ...initialData?.team,
    },
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<TeamSectionData | null>(null)

  // Save mutation
  const saveMutation = trpc.accounts.saveTeam.useMutation()

  // Sync from initial data when it changes
  useEffect(() => {
    if (initialData) {
      const merged: TeamSectionData = {
        ...DEFAULT_TEAM_DATA,
        ...initialData,
        team: {
          ...DEFAULT_TEAM_DATA.team,
          ...initialData.team,
        },
      }
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
      // Cast to the expected schema type - Zod will validate at runtime
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await saveMutation.mutateAsync({
        accountId,
        data: localData as any,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save team:', error)
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
    handleSave,
    handleCancel,
    handleEdit,
  }
}

export default useTeamSection
