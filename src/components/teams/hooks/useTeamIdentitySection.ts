'use client'

import { useState, useCallback, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { SectionMode, TeamIdentitySectionData } from '@/lib/teams/types'
import { DEFAULT_IDENTITY_DATA } from '@/lib/teams/types'
import { mapIdentityToApi } from '@/lib/teams/mappers'

interface UseTeamIdentitySectionOptions {
  /** Team ID (for edit/view modes) */
  teamId?: string
  /** Initial data (optional, will use defaults if not provided) */
  initialData?: Partial<TeamIdentitySectionData>
  /** Current mode */
  mode: SectionMode
  /** Callback when save completes successfully */
  onSaveComplete?: () => void
}

interface UseTeamIdentitySectionReturn {
  /** Current section data */
  data: TeamIdentitySectionData
  /** Loading state */
  isLoading: boolean
  /** Saving state */
  isSaving: boolean
  /** Whether currently in edit mode */
  isEditing: boolean
  /** Validation errors by field name */
  errors: Record<string, string> | undefined
  /** Handler for individual field changes */
  handleChange: (field: string, value: unknown) => void
  /** Handler to save section data */
  handleSave: () => Promise<void>
  /** Handler to cancel editing */
  handleCancel: () => void
  /** Handler to enter edit mode */
  handleEdit: () => void
}

/**
 * useTeamIdentitySection - Hook for managing Team Identity section state
 *
 * Handles:
 * - Local state management
 * - Save mutation with per-section API call
 * - Edit/cancel/save workflow
 * - Error extraction from mutations
 */
export function useTeamIdentitySection({
  teamId,
  initialData,
  mode,
  onSaveComplete,
}: UseTeamIdentitySectionOptions): UseTeamIdentitySectionReturn {
  // Local state
  const [localData, setLocalData] = useState<TeamIdentitySectionData>(() => ({
    ...DEFAULT_IDENTITY_DATA,
    ...initialData,
  }))
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<TeamIdentitySectionData | null>(null)

  // Save mutation - uses groups.update or groups.create based on context
  const saveMutation = trpc.groups.update.useMutation()
  const createMutation = trpc.groups.create.useMutation()

  // Update local data when initial data changes (e.g., after refetch)
  useEffect(() => {
    if (initialData) {
      setLocalData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  // Handle field changes
  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Handle entering edit mode
  const handleEdit = useCallback(() => {
    setOriginalData(localData) // Store current data for cancel
    setIsEditing(true)
  }, [localData])

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      const apiData = mapIdentityToApi(localData)

      if (mode === 'create' || !teamId) {
        // Create new team
        await createMutation.mutateAsync(apiData as Parameters<typeof createMutation.mutateAsync>[0])
      } else {
        // Update existing team
        await saveMutation.mutateAsync({
          id: teamId,
          ...apiData,
        } as Parameters<typeof saveMutation.mutateAsync>[0])
      }

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save team identity:', error)
      throw error
    }
  }, [teamId, localData, mode, saveMutation, createMutation, onSaveComplete])

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (originalData) {
      setLocalData(originalData) // Revert to last saved state
    }
    setIsEditing(false)
  }, [originalData])

  // Extract validation errors from mutation
  const errors = (saveMutation.error?.data as { zodError?: { fieldErrors?: Record<string, string[]> } })?.zodError?.fieldErrors
    ? Object.fromEntries(
        Object.entries((saveMutation.error?.data as { zodError?: { fieldErrors?: Record<string, string[]> } })?.zodError?.fieldErrors || {})
          .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
      )
    : undefined

  return {
    data: localData,
    isLoading: false,
    isSaving: saveMutation.isPending || createMutation.isPending,
    isEditing,
    errors,
    handleChange,
    handleSave,
    handleCancel,
    handleEdit,
  }
}

export default useTeamIdentitySection
