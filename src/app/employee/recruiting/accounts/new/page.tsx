'use client'

import { Suspense, useMemo, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useCreateAccountStore, CreateAccountFormData, AccountAddress, AccountContact } from '@/stores/create-account-store'
import { WizardWithSidebar } from '@/components/pcf/wizard/WizardWithSidebar'
import { createAccountCreateConfig } from '@/configs/entities/wizards/account-create.config'
import { useEntityDraft, WizardStore } from '@/hooks/use-entity-draft'
import { parsePhoneValue } from '@/components/ui/phone-input'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'

// Normalize URL helper
function normalizeUrl(url: string | undefined): string | undefined {
  if (!url || url.trim() === '') return undefined
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

// Transform entity data to form data for editing
// This function handles data from getByIdForEdit endpoint which includes:
// - addresses array (all addresses)
// - contacts array (all contacts)
// - contracts array (all contracts)
// - compliance object
// - team object
// - billing fields
function entityToFormData(entity: any): Partial<CreateAccountFormData> {
  const parsePhone = (phone: string | null | undefined) => parsePhoneValue(phone, 'US')

  // Load industries - prioritize the industries array, then fall back to single industry field
  let industriesArray: string[] = []
  if (entity.industries && Array.isArray(entity.industries) && entity.industries.length > 0) {
    industriesArray = entity.industries
  } else if (entity.industry) {
    industriesArray = [entity.industry]
  }

  // Map company_type/relationship_type back to companyType
  let companyType: CreateAccountFormData['companyType'] = 'direct_client'
  if (entity.company_type) {
    companyType = entity.company_type as CreateAccountFormData['companyType']
  } else if (entity.relationship_type) {
    switch (entity.relationship_type) {
      case 'implementation_partner':
        companyType = 'implementation_partner'
        break
      case 'prime_vendor':
        companyType = 'staffing_vendor'
        break
      default:
        companyType = 'direct_client'
    }
  }

  // Map addresses - use the addresses array from getByIdForEdit
  let addresses: AccountAddress[] = []
  if (entity.addresses && Array.isArray(entity.addresses) && entity.addresses.length > 0) {
    addresses = entity.addresses.map((a: any) => ({
      id: a.id || crypto.randomUUID(),
      type: a.type || 'office',
      addressLine1: a.addressLine1 || a.address_line_1 || '',
      addressLine2: a.addressLine2 || a.address_line_2 || '',
      city: a.city || '',
      state: a.state || a.state_province || '',
      postalCode: a.postalCode || a.postal_code || '',
      country: a.country || a.country_code || 'US',
      isPrimary: a.isPrimary ?? a.is_primary ?? false,
    }))
  } else {
    // Fallback: Build addresses from legacy fields if no addresses array
    if (entity.headquarters_city || entity.headquarters_location) {
      addresses.push({
        id: crypto.randomUUID(),
        type: 'headquarters',
        addressLine1: entity.headquarters_location || '',
        addressLine2: '',
        city: entity.headquarters_city || '',
        state: entity.headquarters_state || '',
        postalCode: entity.headquarters_postal_code || '',
        country: entity.headquarters_country || 'US',
        isPrimary: true,
      })
    }
    if (entity.billing_address || entity.billing_city) {
      addresses.push({
        id: crypto.randomUUID(),
        type: 'billing',
        addressLine1: entity.billing_address || '',
        addressLine2: '',
        city: entity.billing_city || '',
        state: entity.billing_state || '',
        postalCode: entity.billing_postal_code || '',
        country: entity.billing_country || 'US',
        isPrimary: false,
      })
    }
  }

  // Map contacts - use the contacts array from getByIdForEdit
  let contacts: AccountContact[] = []
  if (entity.contacts && Array.isArray(entity.contacts) && entity.contacts.length > 0) {
    contacts = entity.contacts.map((c: any) => ({
      id: c.id || crypto.randomUUID(),
      firstName: c.firstName || c.first_name || '',
      lastName: c.lastName || c.last_name || '',
      email: c.email || '',
      phone: parsePhone(c.phone),
      mobile: c.mobile ? parsePhone(c.mobile) : undefined,
      title: c.title || '',
      department: c.department || '',
      role: (c.role || 'primary') as AccountContact['role'],
      decisionAuthority: (c.decisionAuthority || c.decision_authority || 'influencer') as AccountContact['decisionAuthority'],
      isPrimary: c.isPrimary ?? c.is_primary ?? false,
      linkedInUrl: c.linkedInUrl || c.linkedin_url || '',
      notes: c.notes || '',
    }))
  } else if (entity.primary_contact_name || entity.primary_contact_email) {
    // Fallback: Build contacts from legacy primary contact fields
    const nameParts = (entity.primary_contact_name || '').split(' ')
    contacts.push({
      id: entity.primary_contact_id || crypto.randomUUID(),
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: entity.primary_contact_email || '',
      phone: parsePhone(entity.primary_contact_phone),
      title: entity.primary_contact_title || '',
      department: '',
      role: 'primary',
      decisionAuthority: 'decision_maker',
      isPrimary: true,
    })
  }

  // Map contracts - use the contracts array from getByIdForEdit
  let contracts: CreateAccountFormData['contracts'] = []
  if (entity.contracts && Array.isArray(entity.contracts) && entity.contracts.length > 0) {
    contracts = entity.contracts.map((c: any) => ({
      id: c.id || crypto.randomUUID(),
      type: (c.type || c.contract_type || 'msa') as 'msa' | 'nda' | 'sow' | 'rate_agreement' | 'subcontract',
      name: c.name || c.contract_name || '',
      number: c.number || c.contract_number || '',
      status: (c.status || 'draft') as 'draft' | 'active' | 'pending_signature',
      effectiveDate: c.effectiveDate || c.effective_date ? new Date(c.effectiveDate || c.effective_date) : null,
      expiryDate: c.expiryDate || c.expiry_date ? new Date(c.expiryDate || c.expiry_date) : null,
      autoRenew: c.autoRenew ?? c.auto_renew ?? false,
      contractValue: c.contractValue?.toString() || c.contract_value?.toString() || '',
      currency: c.currency || 'USD',
      fileUrl: c.fileUrl || c.document_url || '',
    }))
  }

  // Map compliance - use the compliance object from getByIdForEdit
  let compliance: CreateAccountFormData['compliance'] = {
    insurance: {
      generalLiability: false,
      professionalLiability: false,
      workersComp: false,
      cyberLiability: false,
    },
    backgroundCheck: {
      required: false,
      level: '',
    },
    drugTest: {
      required: false,
    },
    certifications: [],
  }
  if (entity.compliance) {
    compliance = {
      insurance: {
        generalLiability: entity.compliance.insurance?.generalLiability ?? false,
        professionalLiability: entity.compliance.insurance?.professionalLiability ?? false,
        workersComp: entity.compliance.insurance?.workersComp ?? false,
        cyberLiability: entity.compliance.insurance?.cyberLiability ?? false,
      },
      backgroundCheck: {
        required: entity.compliance.backgroundCheck?.required ?? false,
        level: entity.compliance.backgroundCheck?.level || '',
      },
      drugTest: {
        required: entity.compliance.drugTest?.required ?? false,
      },
      certifications: entity.compliance.certifications || [],
    }
  }

  // Map team - use the team object from getByIdForEdit or fallback to direct fields
  const team: CreateAccountFormData['team'] = entity.team ? {
    ownerId: entity.team.ownerId || entity.team.owner_id || '',
    accountManagerId: entity.team.accountManagerId || entity.team.account_manager_id || '',
    recruiterId: entity.team.recruiterId || entity.team.recruiter_id || '',
    salesLeadId: entity.team.salesLeadId || entity.team.sales_lead_id || '',
  } : {
    ownerId: entity.owner_id || '',
    accountManagerId: entity.account_manager_id || '',
    recruiterId: entity.primary_recruiter_id || '',
    salesLeadId: entity.sales_lead_id || '',
  }

  return {
    // Account type
    accountType: entity.account_type || 'company',

    // Step 1: Identity & Classification
    name: entity.name || '',
    legalName: entity.legal_name || '',
    dba: entity.dba_name || '',
    taxId: entity.tax_id || '',
    website: entity.website || '',
    linkedinUrl: entity.linkedin_url || '',
    description: entity.description || '',
    phone: parsePhone(entity.phone),
    email: entity.email || '',

    // Classification
    industries: industriesArray,
    companyType,
    tier: (entity.tier || '') as CreateAccountFormData['tier'],
    segment: (entity.segment || '') as CreateAccountFormData['segment'],
    employeeCount: entity.employee_range || '',
    revenueRange: entity.revenue_range || '',
    foundedYear: entity.founded_year?.toString() || '',
    ownershipType: entity.ownership_type || '',

    // Legacy fields (for components that still use them)
    hqStreetAddress: entity.headquarters_location || '',
    hqCity: entity.headquarters_city || '',
    hqState: entity.headquarters_state || '',
    hqCountry: entity.headquarters_country || 'US',

    // Locations (Step 2)
    addresses,

    // Billing (Step 3) - use fields from getByIdForEdit or fallback to entity fields
    billingEntityName: entity.billingEntityName || entity.billing_entity_name || '',
    billingEmail: entity.billingEmail || entity.billing_email || '',
    billingPhone: parsePhone(entity.billingPhone || entity.billing_phone),
    billingAddress: entity.billing_address || '',
    billingCity: entity.billing_city || '',
    billingState: entity.billing_state || '',
    billingPostalCode: entity.billing_postal_code || '',
    billingCountry: entity.billing_country || 'US',
    billingFrequency: (entity.billingFrequency || entity.billing_frequency || 'monthly') as CreateAccountFormData['billingFrequency'],
    paymentTermsDays: (entity.paymentTermsDays || entity.payment_terms_days)?.toString() || '30',
    poRequired: entity.poRequired ?? entity.po_required ?? false,
    currentPoNumber: entity.currentPoNumber || entity.current_po_number || '',
    poExpirationDate: entity.poExpirationDate || entity.po_expiration_date || '',
    currency: entity.defaultCurrency || entity.default_currency || 'USD',
    invoiceFormat: entity.invoiceFormat || entity.invoice_format || 'standard',

    // Contacts (Step 4)
    contacts,

    // Contracts (Step 5)
    contracts,

    // Compliance (Step 6)
    compliance,

    // Primary Contact (Legacy)
    primaryContactName: entity.primary_contact_name || '',
    primaryContactEmail: entity.primary_contact_email || '',
    primaryContactTitle: entity.primary_contact_title || '',
    primaryContactPhone: parsePhone(entity.primary_contact_phone),
    preferredContactMethod: (entity.preferred_contact_method || 'email') as CreateAccountFormData['preferredContactMethod'],
    meetingCadence: (entity.meeting_cadence || 'weekly') as CreateAccountFormData['meetingCadence'],

    // Team (Step 7)
    team,
  }
}

function NewAccountPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Get store
  const store = useCreateAccountStore()

  // Check for edit mode or resume mode
  const editId = searchParams.get('edit')
  const resumeId = searchParams.get('resume')
  const isEditMode = !!editId

  // Fetch existing account if in edit mode - use getByIdForEdit for complete data
  const editAccountQuery = trpc.crm.accounts.getByIdForEdit.useQuery(
    { id: editId! },
    { enabled: !!editId, retry: false }
  )

  // Fetch draft if resuming (only for non-edit mode)
  const getDraftQuery = trpc.crm.accounts.getById.useQuery(
    { id: resumeId! },
    { enabled: !!resumeId && !editId, retry: false }
  )

  // Mutations
  const createMutation = trpc.crm.accounts.createEnhanced.useMutation()
  const updateMutation = trpc.crm.accounts.updateEnhanced.useMutation()
  const uploadFileMutation = trpc.crm.contracts.uploadFile.useMutation()

  // Draft integration (only for create/resume mode, not edit mode)
  const draftState = useEntityDraft({
    entityType: 'Account',
    wizardRoute: '/employee/recruiting/accounts/new',
    totalSteps: 9, // Based on config
    store: () => store as unknown as WizardStore<CreateAccountFormData>,
    resumeId: isEditMode ? undefined : resumeId,
    createMutation,
    updateMutation,
    getDraftQuery,
    searchParamsString: searchParams.toString(),

    // Transform Form -> Entity (for saving)
    formToEntity: (formData) => {
      const wizardState = isEditMode ? undefined : {
        formData,
        currentStep: store.currentStep
      }

      const entity = {
        accountType: formData.accountType,
        name: formData.name,
        legalName: formData.legalName,
        dba: formData.dba,
        taxId: formData.taxId,
        website: normalizeUrl(formData.website),
        phone: formData.phone,
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

        // Store full state for resume (only for drafts, not edit mode)
        wizard_state: wizardState
      }
      return entity
    },

    // Transform Entity -> Form (for loading)
    entityToForm: (entity: any): CreateAccountFormData => {
      // Prefer wizard_state data if available (stored in custom_fields JSONB column)
      if (entity.custom_fields?.wizard_state?.formData) {
        return entity.custom_fields.wizard_state.formData as CreateAccountFormData
      }

      // Fallback mapping for drafts without wizard state
      return entityToFormData(entity) as CreateAccountFormData
    },

    getDisplayName: (data) => data.name,
    onInvalidate: () => utils.crm.accounts.list.invalidate(),

    // Upload contract files after each draft save
    onAfterSave: async (accountId: string, formData: CreateAccountFormData) => {
      const contractsWithFiles = formData.contracts.filter(
        (c) => c.fileData && c.fileName && c.fileMimeType
      )

      if (contractsWithFiles.length === 0) return

      // Upload files in parallel
      const uploadPromises = contractsWithFiles.map(async (contract) => {
        try {
          await uploadFileMutation.mutateAsync({
            accountId,
            contractId: contract.id,
            fileData: contract.fileData!,
            fileName: contract.fileName!,
            mimeType: contract.fileMimeType!,
          })

          // Clear fileData from store after successful upload
          // This prevents re-uploading on subsequent saves
          store.updateContract(contract.id, {
            fileData: undefined,
            fileName: undefined,
            fileMimeType: undefined,
          })
        } catch (error) {
          console.error(`Failed to upload file for contract ${contract.name}:`, error)
        }
      })

      await Promise.all(uploadPromises)
    },
  })

  // Populate form when editing an existing account
  // IMPORTANT: Wait for draftState.isReady to avoid race condition where
  // useEntityDraft's resetForm() wipes out data set by this useEffect
  useEffect(() => {
    if (isEditMode && editAccountQuery.data && draftState.isReady) {
      const formData = entityToFormData(editAccountQuery.data)
      store.setFormData(formData)
    }
  }, [isEditMode, editAccountQuery.data, draftState.isReady])

  // Helper to upload contract files (for final submission)
  const uploadContractFiles = useCallback(async (accountId: string, contracts: CreateAccountFormData['contracts']) => {
    const contractsWithFiles = contracts.filter(c => c.fileData && c.fileName && c.fileMimeType)

    if (contractsWithFiles.length === 0) return

    // Upload files in parallel
    const uploadPromises = contractsWithFiles.map(async (contract) => {
      try {
        await uploadFileMutation.mutateAsync({
          accountId,
          contractId: contract.id,
          fileData: contract.fileData!,
          fileName: contract.fileName!,
          mimeType: contract.fileMimeType!,
        })
      } catch (error) {
        console.error(`Failed to upload file for contract ${contract.name}:`, error)
        // Don't throw - continue with other uploads
      }
    })

    await Promise.all(uploadPromises)
  }, [uploadFileMutation])

  // Handle final submission
  const handleSubmit = useCallback(async (data: CreateAccountFormData) => {
    try {
      if (isEditMode && editId) {
        // Update existing account
        await updateMutation.mutateAsync({
          id: editId,
          accountType: data.accountType,
          name: data.name,
          legalName: data.legalName,
          dba: data.dba,
          website: normalizeUrl(data.website),
          phone: data.phone,
          email: data.email,
          industries: data.industries,
          companyType: data.companyType,
          tier: data.tier || undefined,
          segment: data.segment || undefined,
          description: data.description,
          linkedinUrl: normalizeUrl(data.linkedinUrl),
          addresses: data.addresses,
          billingEntityName: data.billingEntityName,
          billingEmail: data.billingEmail,
          billingPhone: data.billingPhone,
          billingAddress: data.billingAddress,
          billingFrequency: data.billingFrequency,
          paymentTermsDays: data.paymentTermsDays,
          poRequired: data.poRequired,
          currentPoNumber: data.currentPoNumber,
          poExpirationDate: data.poExpirationDate || undefined,
          currency: data.currency,
          invoiceFormat: data.invoiceFormat,
          contacts: data.contacts,
          contracts: data.contracts,
          compliance: data.compliance,
          team: data.team,
          wizard_state: null, // Clear wizard state on finalization
        })

        // Upload contract files if any
        await uploadContractFiles(editId, data.contracts)

        toast({
          title: 'Account updated!',
          description: `${data.name} has been successfully updated.`,
        })

        // Invalidate and redirect
        utils.crm.accounts.getById.invalidate({ id: editId })
        utils.crm.accounts.getByIdForEdit.invalidate({ id: editId })
        utils.crm.accounts.list.invalidate()
        store.resetForm()
        router.push(`/employee/recruiting/accounts/${editId}`)
      } else {
        // Create new account (via draft system)
        const account = await draftState.finalizeDraft('active')

        // Upload contract files if account was created
        if (account?.id && data.contracts.length > 0) {
          await uploadContractFiles(account.id, data.contracts)
        }

        // Redirect to the created account page
        if (account?.id) {
          router.push(`/employee/recruiting/accounts/${account.id}`)
        } else {
          router.push('/employee/recruiting/accounts')
        }
      }
    } catch (error) {
      console.error('Failed to save account:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save account.',
        variant: 'error',
      })
      throw error
    }
  }, [isEditMode, editId, draftState, router, updateMutation, utils, store, toast, uploadContractFiles])

  // Create wizard config with appropriate mode
  const wizardConfig = useMemo(() => {
    const config = createAccountCreateConfig(handleSubmit, {
      cancelRoute: isEditMode && editId
        ? `/employee/recruiting/accounts/${editId}`
        : '/employee/recruiting/accounts',
    })

    // Override title and labels for edit mode
    if (isEditMode) {
      return {
        ...config,
        title: 'Edit Account',
        description: 'Update account information',
        submitLabel: 'Save Changes',
      }
    }

    return config
  }, [handleSubmit, isEditMode, editId])

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

  // Loading state for edit mode
  if (isEditMode && editAccountQuery.isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Skeleton className="h-8 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  // Error state for edit mode
  if (isEditMode && !editAccountQuery.data && !editAccountQuery.isLoading) {
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
    <WizardWithSidebar
      config={wizardConfig}
      store={wizardStoreAdapter}
      draftState={isEditMode ? undefined : draftState}
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
