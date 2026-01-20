import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { LocationsSectionData, SectionMode, AccountAddress } from '@/lib/accounts/types'
import { v4 as uuidv4 } from 'uuid'

const DEFAULT_LOCATIONS_DATA: LocationsSectionData = {
  addresses: [],
}

interface UseLocationsSectionOptions {
  accountId: string
  initialData?: Partial<LocationsSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseLocationsSectionReturn {
  data: LocationsSectionData
  isLoading: boolean
  isSaving: boolean
  isEditing: boolean
  errors: Record<string, string> | undefined
  handleAddAddress: (address: AccountAddress) => void
  handleUpdateAddress: (id: string, updates: Partial<AccountAddress>) => void
  handleRemoveAddress: (id: string) => void
  handleSave: () => Promise<void>
  handleCancel: () => void
  handleEdit: () => void
}

/**
 * useLocationsSection - Hook for managing Locations section state and operations
 *
 * Handles:
 * - Local state management for addresses array
 * - Syncing from initial/server data
 * - Save operations via tRPC
 * - Edit mode toggling
 * - Add/update/remove address operations
 */
export function useLocationsSection({
  accountId,
  initialData,
  mode,
  onSaveComplete,
}: UseLocationsSectionOptions): UseLocationsSectionReturn {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<LocationsSectionData>(() => ({
    ...DEFAULT_LOCATIONS_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<LocationsSectionData | null>(null)

  // Save mutation
  const saveMutation = trpc.accounts.saveLocations.useMutation()

  // Sync from initial data when it changes
  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_LOCATIONS_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  // Handle adding an address
  const handleAddAddress = useCallback((address: AccountAddress) => {
    setLocalData(prev => ({
      ...prev,
      addresses: [...prev.addresses, { ...address, id: address.id || uuidv4() }],
    }))
  }, [])

  // Handle updating an address
  const handleUpdateAddress = useCallback((id: string, updates: Partial<AccountAddress>) => {
    setLocalData(prev => ({
      ...prev,
      addresses: prev.addresses.map(addr =>
        addr.id === id ? { ...addr, ...updates } : addr
      ),
    }))
  }, [])

  // Handle removing an address
  const handleRemoveAddress = useCallback((id: string) => {
    setLocalData(prev => ({
      ...prev,
      addresses: prev.addresses.filter(addr => addr.id !== id),
    }))
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
      console.error('Failed to save locations:', error)
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
    handleAddAddress,
    handleUpdateAddress,
    handleRemoveAddress,
    handleSave,
    handleCancel,
    handleEdit,
  }
}

export default useLocationsSection
