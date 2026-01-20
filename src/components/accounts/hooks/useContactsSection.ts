import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { ContactsSectionData, SectionMode, AccountContact } from '@/lib/accounts/types'
import { v4 as uuidv4 } from 'uuid'

const DEFAULT_CONTACTS_DATA: ContactsSectionData = {
  contacts: [],
}

interface UseContactsSectionOptions {
  accountId: string
  initialData?: Partial<ContactsSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseContactsSectionReturn {
  data: ContactsSectionData
  isLoading: boolean
  isSaving: boolean
  isEditing: boolean
  errors: Record<string, string> | undefined
  handleAddContact: (contact: AccountContact) => void
  handleUpdateContact: (id: string, updates: Partial<AccountContact>) => void
  handleRemoveContact: (id: string) => void
  handleSave: () => Promise<void>
  handleCancel: () => void
  handleEdit: () => void
}

/**
 * useContactsSection - Hook for managing Contacts section state and operations
 *
 * Handles:
 * - Local state management for contacts array
 * - Syncing from initial/server data
 * - Save operations via tRPC
 * - Edit mode toggling
 * - Add/update/remove contact operations
 */
export function useContactsSection({
  accountId,
  initialData,
  mode,
  onSaveComplete,
}: UseContactsSectionOptions): UseContactsSectionReturn {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<ContactsSectionData>(() => ({
    ...DEFAULT_CONTACTS_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<ContactsSectionData | null>(null)

  // Save mutation
  const saveMutation = trpc.accounts.saveContacts.useMutation()

  // Sync from initial data when it changes
  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_CONTACTS_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  // Handle adding a contact
  const handleAddContact = useCallback((contact: AccountContact) => {
    setLocalData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { ...contact, id: contact.id || uuidv4() }],
    }))
  }, [])

  // Handle updating a contact
  const handleUpdateContact = useCallback((id: string, updates: Partial<AccountContact>) => {
    setLocalData(prev => ({
      ...prev,
      contacts: prev.contacts.map(c =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }))
  }, [])

  // Handle removing a contact
  const handleRemoveContact = useCallback((id: string) => {
    setLocalData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(c => c.id !== id),
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
      console.error('Failed to save contacts:', error)
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
    handleAddContact,
    handleUpdateContact,
    handleRemoveContact,
    handleSave,
    handleCancel,
    handleEdit,
  }
}

export default useContactsSection
