import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CreateAddressFormData {
  // Entity reference
  entityType: string
  entityId: string

  // Address type
  addressType: string

  // Address fields
  addressLine1: string
  addressLine2: string
  city: string
  stateProvince: string
  postalCode: string
  countryCode: string
  county: string

  // Options
  isPrimary: boolean
  notes: string
}

interface CreateAddressStore {
  formData: CreateAddressFormData
  isDirty: boolean
  lastSaved: Date | null

  setFormData: (data: Partial<CreateAddressFormData>) => void
  resetForm: () => void
  initializeForEntity: (entityType: string, entityId: string) => void
}

const defaultFormData: CreateAddressFormData = {
  entityType: '',
  entityId: '',
  addressType: 'work',
  addressLine1: '',
  addressLine2: '',
  city: '',
  stateProvince: '',
  postalCode: '',
  countryCode: 'US',
  county: '',
  isPrimary: false,
  notes: '',
}

export const useCreateAddressStore = create<CreateAddressStore>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      isDirty: false,
      lastSaved: null,

      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
          isDirty: true,
          lastSaved: new Date(),
        })),

      resetForm: () =>
        set({
          formData: defaultFormData,
          isDirty: false,
          lastSaved: null,
        }),

      initializeForEntity: (entityType, entityId) =>
        set(() => ({
          formData: {
            ...defaultFormData,
            entityType,
            entityId,
          },
          isDirty: false,
          lastSaved: null,
        })),
    }),
    {
      name: 'create-address-draft',
      partialize: (state) => ({
        formData: state.formData,
        lastSaved: state.lastSaved,
      }),
    }
  )
)
