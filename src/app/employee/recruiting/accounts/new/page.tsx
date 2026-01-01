'use client'

import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useCreateAccountStore, CreateAccountFormData } from '@/stores/create-account-store'
import { EntityWizard } from '@/components/pcf/wizard/EntityWizard'
import { createAccountCreateConfig } from '@/configs/entities/wizards/account-create.config'
import { formatPhoneValue } from '@/components/ui/phone-input'

// Normalize URL - add https:// if missing protocol
function normalizeUrl(url: string | undefined): string | undefined {
  if (!url || url.trim() === '') return undefined
  const trimmed = url.trim()
  // If it already has a protocol, return as-is
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  // Add https:// prefix
  return `https://${trimmed}`
}

/**
 * Create Account Page
 * 
 * Premium SaaS-level account creation wizard using the EntityWizard pattern.
 * Features:
 * - Multi-step wizard with progress tracking
 * - Auto-save with Zustand persistence
 * - Beautiful premium UI with gradient backgrounds
 * - Street address support for headquarters location
 */
export default function NewAccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Get store
  const {
    formData,
    setFormData,
    resetForm,
    isDirty,
    lastSaved,
  } = useCreateAccountStore()

  // Create account mutation
  const createMutation = trpc.crm.accounts.create.useMutation({
    onSuccess: (data) => {
      utils.crm.accounts.list.invalidate()
      toast({
        title: 'Account created successfully',
        description: `${formData.name} has been added.`,
      })
      resetForm()
      router.push(`/employee/recruiting/accounts/${data.id}`)
    },
    onError: (error) => {
      toast({
        title: 'Error creating account',
        description: error.message,
        variant: 'error',
      })
    },
  })

  // Handle form submission
  const handleSubmit = async (data: CreateAccountFormData): Promise<unknown> => {
    // Prepare data for API - convert types and handle empty strings
    const apiData = {
      name: data.name,
      industry: data.industries[0] || undefined,
      industries: data.industries.length > 0 ? data.industries : undefined,
      companyType: data.companyType,
      tier: data.tier || undefined,
      website: normalizeUrl(data.website),
      phone: formatPhoneValue(data.phone) || undefined,
      // HQ Location with street address
      headquartersLocation: data.hqStreetAddress || undefined,
      headquartersCity: data.hqCity || undefined,
      headquartersState: data.hqState || undefined,
      headquartersCountry: data.hqCountry || 'US',
      description: data.description || undefined,
      linkedinUrl: normalizeUrl(data.linkedinUrl),
      // Billing
      billingEntityName: data.billingEntityName || undefined,
      billingEmail: data.billingEmail || undefined,
      billingPhone: formatPhoneValue(data.billingPhone) || undefined,
      billingAddress: data.billingAddress || undefined,
      billingCity: data.billingCity || undefined,
      billingState: data.billingState || undefined,
      billingPostalCode: data.billingPostalCode || undefined,
      billingCountry: data.billingCountry || undefined,
      billingFrequency: data.billingFrequency,
      paymentTermsDays: parseInt(data.paymentTermsDays) || 30,
      poRequired: data.poRequired,
      // Primary Contact
      primaryContactName: data.primaryContactName || undefined,
      primaryContactEmail: data.primaryContactEmail || undefined,
      primaryContactTitle: data.primaryContactTitle || undefined,
      primaryContactPhone: formatPhoneValue(data.primaryContactPhone) || undefined,
      preferredContactMethod: data.preferredContactMethod,
      meetingCadence: data.meetingCadence,
    }

    console.log('[Account Create Form] API Data:', apiData)
    return createMutation.mutateAsync(apiData)
  }

  // Create wizard config with submit handler
  const wizardConfig = createAccountCreateConfig(handleSubmit, {
    onSuccess: () => {}, // Already handled in mutation
    cancelRoute: '/employee/recruiting/accounts',
  })

  // Store adapter for EntityWizard
  const storeAdapter = {
    formData: formData as unknown as CreateAccountFormData,
    setFormData: setFormData as (data: Partial<CreateAccountFormData>) => void,
    resetForm,
    isDirty,
    lastSaved,
  }

  return (
    <EntityWizard
      config={wizardConfig}
      store={storeAdapter}
    />
  )
}
