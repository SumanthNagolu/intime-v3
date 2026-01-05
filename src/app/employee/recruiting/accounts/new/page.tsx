'use client'

import { Suspense, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useCreateAccountStore, CreateAccountFormData } from '@/stores/create-account-store'
import { WizardWithSidebar } from '@/components/pcf/wizard/WizardWithSidebar'
import { createAccountCreateConfig } from '@/configs/entities/wizards/account-create.config'
import { useEntityDraft, WizardStore } from '@/hooks/use-entity-draft'
import { formatPhoneValue } from '@/components/ui/phone-input'

// Normalize URL helper
function normalizeUrl(url: string | undefined): string | undefined {
  if (!url || url.trim() === '') return undefined
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function NewAccountPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const utils = trpc.useUtils()

  // Get store
  const store = useCreateAccountStore()
  
  // Get resume ID from URL
  const resumeId = searchParams.get('resume')

  // Mutations and Queries
  const createMutation = trpc.crm.accounts.createEnhanced.useMutation()
  const updateMutation = trpc.crm.accounts.updateEnhanced.useMutation()
  
  // Fetch draft if resuming
  const getDraftQuery = trpc.crm.accounts.getById.useQuery(
    { id: resumeId! },
    { enabled: !!resumeId, retry: false }
  )

  // Draft integration
  const draftState = useEntityDraft({
    entityType: 'Account',
    wizardRoute: '/employee/recruiting/accounts/new',
    totalSteps: 9, // Based on config
    store: () => store as unknown as WizardStore<CreateAccountFormData>, // Cast to satisfy interface
    resumeId,
    createMutation,
    updateMutation,
    getDraftQuery,
    searchParamsString: searchParams.toString(),
    
    // Transform Form -> Entity (for saving)
    formToEntity: (formData) => {
      // We store the FULL form data in wizard_state for perfect resume fidelity
      // The individual fields are also mapped for the DB columns (searchable draft)
      const entity = {
        accountType: formData.accountType,
        name: formData.name,
        legalName: formData.legalName,
        dba: formData.dba,
        taxId: formData.taxId,
        website: normalizeUrl(formData.website),
        phone: formData.phone, // formatPhoneValue logic handled in mutation or backend? mutation schema expects any
        email: formData.email,
        industries: formData.industries,
        companyType: formData.companyType,
        tier: formData.tier || undefined,
        segment: formData.segment || undefined,
        description: formData.description,
        linkedinUrl: normalizeUrl(formData.linkedinUrl),
        
        // Locations
        addresses: formData.addresses,
        
        // Billing
        billingEntityName: formData.billingEntityName,
        billingEmail: formData.billingEmail,
        billingPhone: formData.billingPhone,
        billingAddress: formData.billingAddress,
        billingFrequency: formData.billingFrequency,
        paymentTermsDays: formData.paymentTermsDays,
        poRequired: formData.poRequired,
        currency: formData.currency,
        invoiceFormat: formData.invoiceFormat,
        
        // Arrays
        contacts: formData.contacts,
        contracts: formData.contracts,
        compliance: formData.compliance,
        team: formData.team,
        
        // Store full state for resume
        wizard_state: {
          formData,
          currentStep: store.currentStep
        }
      }
      return entity
    },
    
    // Transform Entity -> Form (for loading)
    entityToForm: (entity: any) => {
      // Prefer wizard_state data if available
      if (entity.custom_fields?.wizard_state?.formData) {
        return entity.custom_fields.wizard_state.formData
      }
      
      // Fallback mapping if no wizard state (e.g. editing active record)
      return {
        name: entity.name,
        // ... map other fields if needed, but for drafts wizard_state should exist
        // This fallback is minimal
      }
    },
    
    getDisplayName: (data) => data.name,
    onInvalidate: () => utils.crm.accounts.list.invalidate()
  })

  // Handle final submission (Activate)
  const handleSubmit = useCallback(async (data: CreateAccountFormData) => {
    try {
      // Save/Finalize draft
      const account = await draftState.finalizeDraft('active')

      // Redirect to the created account page
      if (account?.id) {
        router.push(`/employee/recruiting/accounts/${account.id}`)
      } else {
        router.push('/employee/recruiting/accounts')
      }
    } catch (error) {
      console.error('Failed to create account:', error)
      // Error handling is done by the mutation's onError callback
      throw error
    }
  }, [draftState, router])

  // Create wizard config - must include handleSubmit in deps to get latest draftState
  const wizardConfig = useMemo(() => createAccountCreateConfig(handleSubmit, {
    cancelRoute: '/employee/recruiting/accounts',
  }), [handleSubmit])

  // Adapt store for WizardWithSidebar
  const wizardStoreAdapter = {
    formData: store.formData,
    setFormData: store.setFormData,
    resetForm: store.resetForm,
    isDirty: store.isDirty,
    lastSaved: store.lastSaved,
    currentStep: store.currentStep,
    setCurrentStep: store.setCurrentStep,
  }

  return (
    <WizardWithSidebar
      config={wizardConfig}
      store={wizardStoreAdapter}
      draftState={draftState}
    />
  )
}

export default function NewAccountPage() {
  return (
    <Suspense fallback={<div>Loading wizard...</div>}>
      <NewAccountPageContent />
    </Suspense>
  )
}
