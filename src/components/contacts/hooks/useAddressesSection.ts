import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { SectionMode, AddressesSectionData, ContactAddress } from '@/lib/contacts/types'
import { DEFAULT_ADDRESSES_DATA } from '@/lib/contacts/types'

interface UseAddressesSectionOptions {
  contactId: string
  initialData?: Partial<AddressesSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseAddressesSectionReturn {
  data: AddressesSectionData
  isLoading: boolean
  isSaving: boolean
  isEditing: boolean
  errors: Record<string, string> | undefined
  handleChange: (field: string, value: unknown) => void
  handleAddAddress: () => void
  handleRemoveAddress: (id: string) => void
  handleSetPrimary: (id: string) => void
  handleSave: () => Promise<void>
  handleCancel: () => void
  handleEdit: () => void
}

/**
 * useAddressesSection - Hook for managing Addresses section state
 */
export function useAddressesSection({
  contactId,
  initialData,
  mode,
  onSaveComplete,
}: UseAddressesSectionOptions): UseAddressesSectionReturn {
  const [localData, setLocalData] = useState<AddressesSectionData>(() => ({
    ...DEFAULT_ADDRESSES_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<AddressesSectionData | null>(null)

  const saveMutation = trpc.contacts.saveAddresses.useMutation()

  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_ADDRESSES_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleAddAddress = useCallback(() => {
    const newAddress: ContactAddress = {
      id: crypto.randomUUID(),
      type: 'home',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      isPrimary: localData.addresses.length === 0,
    }
    setLocalData(prev => ({
      ...prev,
      addresses: [...prev.addresses, newAddress],
    }))
  }, [localData.addresses.length])

  const handleRemoveAddress = useCallback((id: string) => {
    setLocalData(prev => ({
      ...prev,
      addresses: prev.addresses.filter(a => a.id !== id),
    }))
  }, [])

  const handleSetPrimary = useCallback((id: string) => {
    setLocalData(prev => ({
      ...prev,
      addresses: prev.addresses.map(a => ({
        ...a,
        isPrimary: a.id === id,
      })),
    }))
  }, [])

  const handleSave = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await saveMutation.mutateAsync({
        contactId,
        data: localData as any,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save addresses:', error)
      throw error
    }
  }, [contactId, localData, saveMutation, onSaveComplete])

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
    handleAddAddress,
    handleRemoveAddress,
    handleSetPrimary,
    handleSave,
    handleCancel,
    handleEdit,
  }
}

export default useAddressesSection
