import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { ContractsSectionData, SectionMode, AccountContract } from '@/lib/accounts/types'
import { v4 as uuidv4 } from 'uuid'

const DEFAULT_CONTRACTS_DATA: ContractsSectionData = {
  contracts: [],
}

interface UseContractsSectionOptions {
  accountId: string
  initialData?: Partial<ContractsSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseContractsSectionReturn {
  data: ContractsSectionData
  isLoading: boolean
  isSaving: boolean
  isEditing: boolean
  errors: Record<string, string> | undefined
  handleAddContract: (contract: AccountContract) => void
  handleUpdateContract: (id: string, updates: Partial<AccountContract>) => void
  handleRemoveContract: (id: string) => void
  handleSave: () => Promise<void>
  handleCancel: () => void
  handleEdit: () => void
}

/**
 * useContractsSection - Hook for managing Contracts section state and operations
 *
 * Handles:
 * - Local state management for contracts array
 * - Syncing from initial/server data
 * - Save operations via tRPC
 * - Edit mode toggling
 * - Add/update/remove contract operations
 */
export function useContractsSection({
  accountId,
  initialData,
  mode,
  onSaveComplete,
}: UseContractsSectionOptions): UseContractsSectionReturn {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<ContractsSectionData>(() => ({
    ...DEFAULT_CONTRACTS_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<ContractsSectionData | null>(null)

  // Save mutation
  const saveMutation = trpc.accounts.saveContracts.useMutation()

  // Sync from initial data when it changes
  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_CONTRACTS_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  // Handle adding a contract
  const handleAddContract = useCallback((contract: AccountContract) => {
    setLocalData(prev => ({
      ...prev,
      contracts: [...prev.contracts, { ...contract, id: contract.id || uuidv4() }],
    }))
  }, [])

  // Handle updating a contract
  const handleUpdateContract = useCallback((id: string, updates: Partial<AccountContract>) => {
    setLocalData(prev => ({
      ...prev,
      contracts: prev.contracts.map(c =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }))
  }, [])

  // Handle removing a contract
  const handleRemoveContract = useCallback((id: string) => {
    setLocalData(prev => ({
      ...prev,
      contracts: prev.contracts.filter(c => c.id !== id),
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
      console.error('Failed to save contracts:', error)
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
    handleAddContract,
    handleUpdateContract,
    handleRemoveContract,
    handleSave,
    handleCancel,
    handleEdit,
  }
}

export default useContractsSection
