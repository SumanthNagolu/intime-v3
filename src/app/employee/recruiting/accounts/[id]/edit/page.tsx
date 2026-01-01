'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { EntityWizard } from '@/components/pcf/wizard/EntityWizard'
import { accountCreateWizardConfig } from '@/configs/entities/wizards/account-create.config'
import { useCreateAccountStore, CreateAccountFormData } from '@/stores/create-account-store'
import { Skeleton } from '@/components/ui/skeleton'
import { parsePhoneValue } from '@/components/ui/phone-input'

export default function EditAccountPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const accountId = params.id as string
  const utils = trpc.useUtils()

  // Use the existing store
  const store = useCreateAccountStore()

  // Fetch existing account data
  const accountQuery = trpc.crm.accounts.getById.useQuery({ id: accountId })

  // Populate form when data loads
  useEffect(() => {
    if (accountQuery.data) {
      const a = accountQuery.data
      
      // Helper to parse phone values - use the properly typed utility
      const parsePhone = (phone: string | null | undefined) => parsePhoneValue(phone, 'US')

      // Load industries - prioritize the industries array, then fall back to single industry field
      let industriesArray: string[] = []
      if (a.industries && Array.isArray(a.industries) && a.industries.length > 0) {
        industriesArray = a.industries
      } else if (a.industry) {
        industriesArray = [a.industry]
      }

      store.setFormData({
        // Step 1: Company Basics
        name: a.name || '',
        industries: industriesArray,
        companyType: (a.company_type || 'direct_client') as CreateAccountFormData['companyType'],
        tier: (a.tier || '') as CreateAccountFormData['tier'],
        website: a.website || '',
        phone: parsePhone(a.phone),
        hqStreetAddress: a.headquarters_location || '',
        hqCity: a.headquarters_city || '',
        hqState: a.headquarters_state || '',
        hqCountry: a.headquarters_country || 'US',
        linkedinUrl: a.linkedin_url || '',
        description: a.description || '',
        
        // Step 2: Billing & Terms
        billingEntityName: a.billing_entity_name || '',
        billingEmail: a.billing_email || '',
        billingPhone: parsePhone(a.billing_phone),
        billingAddress: a.billing_address || '',
        billingCity: a.billing_city || '',
        billingState: a.billing_state || '',
        billingPostalCode: a.billing_postal_code || '',
        billingCountry: a.billing_country || 'US',
        billingFrequency: (a.billing_frequency || 'monthly') as CreateAccountFormData['billingFrequency'],
        paymentTermsDays: String(a.payment_terms_days || 30),
        poRequired: a.po_required || false,
        
        // Step 3: Primary Contact
        preferredContactMethod: (a.preferred_contact_method || 'email') as CreateAccountFormData['preferredContactMethod'],
        meetingCadence: (a.meeting_cadence || 'weekly') as CreateAccountFormData['meetingCadence'],
        primaryContactName: a.primary_contact_name || '',
        primaryContactEmail: a.primary_contact_email || '',
        primaryContactTitle: a.primary_contact_title || '',
        primaryContactPhone: parsePhone(a.primary_contact_phone),
      })
    }
  }, [accountQuery.data])

  // Update mutation
  const updateMutation = trpc.crm.accounts.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Account updated!',
        description: `${store.formData.name} has been successfully updated.`,
      })
      utils.crm.accounts.getById.invalidate({ id: accountId })
      utils.crm.accounts.list.invalidate()
      store.resetForm()
      router.push(`/employee/recruiting/accounts/${accountId}`)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update account.',
        variant: 'error',
      })
    },
  })

  // Create config with submit handler for update
  const config = {
    ...accountCreateWizardConfig,
    title: 'Edit Account',
    description: 'Update account information',
    submitLabel: 'Save Changes',
    onSubmit: async (formData: CreateAccountFormData) => {
      // Helper to format phone for storage
      const formatPhone = (phone: CreateAccountFormData['phone']) => {
        if (!phone.number) return undefined
        return phone.number
      }

      return updateMutation.mutateAsync({
        id: accountId,
        name: formData.name.trim(),
        industries: formData.industries.length > 0 ? formData.industries : undefined,
        companyType: formData.companyType,
        tier: formData.tier || null,
        website: formData.website || undefined,
        phone: formatPhone(formData.phone),
        headquartersLocation: formData.hqStreetAddress || undefined,
        headquartersCity: formData.hqCity || undefined,
        headquartersState: formData.hqState || undefined,
        headquartersCountry: formData.hqCountry || undefined,
        description: formData.description || undefined,
        linkedinUrl: formData.linkedinUrl || undefined,
        // Billing
        billingEntityName: formData.billingEntityName || undefined,
        billingEmail: formData.billingEmail || undefined,
        billingPhone: formatPhone(formData.billingPhone),
        billingAddress: formData.billingAddress || undefined,
        billingCity: formData.billingCity || undefined,
        billingState: formData.billingState || undefined,
        billingPostalCode: formData.billingPostalCode || undefined,
        billingCountry: formData.billingCountry || undefined,
        billingFrequency: formData.billingFrequency,
        paymentTermsDays: parseInt(formData.paymentTermsDays) || 30,
        poRequired: formData.poRequired,
        // Communication
        preferredContactMethod: formData.preferredContactMethod,
        meetingCadence: formData.meetingCadence,
        // Primary Contact
        primaryContactName: formData.primaryContactName || undefined,
        primaryContactEmail: formData.primaryContactEmail || undefined,
        primaryContactTitle: formData.primaryContactTitle || undefined,
        primaryContactPhone: formatPhone(formData.primaryContactPhone),
      })
    },
    onSuccess: () => {
      // Already handled in mutation onSuccess
    },
  }

  if (accountQuery.isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Skeleton className="h-8 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!accountQuery.data) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-charcoal-900 mb-2">Account not found</h2>
          <p className="text-charcoal-500 mb-4">The account you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <EntityWizard<CreateAccountFormData>
      config={config}
      store={{
        formData: store.formData,
        setFormData: store.setFormData,
        resetForm: store.resetForm,
        isDirty: store.isDirty,
        lastSaved: store.lastSaved,
      }}
      onCancel={() => {
        store.resetForm()
        router.push(`/employee/recruiting/accounts/${accountId}`)
      }}
    />
  )
}
