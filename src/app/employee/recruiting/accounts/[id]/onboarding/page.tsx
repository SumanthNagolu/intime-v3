'use client'

import { useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { EntityWizard } from '@/components/pcf/wizard/EntityWizard'
import { accountOnboardingWizardConfig } from '@/configs/entities/wizards/account-onboarding.config'
import { useAccountOnboardingStore, AccountOnboardingFormData, AdditionalContact } from '@/stores/account-onboarding-store'
import { formatPhoneValue, parsePhoneValue } from '@/components/ui/phone-input'
import { Loader2 } from 'lucide-react'

export default function AccountOnboardingPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const accountId = params.id as string
  
  // Track if we've already initialized the form to avoid overwriting user changes
  const initializedRef = useRef<string | null>(null)

  // Use the existing store
  const store = useAccountOnboardingStore()

  // Fetch account data
  const accountQuery = trpc.crm.accounts.getById.useQuery({ id: accountId })
  
  // Fetch existing contacts for this account
  const contactsQuery = trpc.crm.contacts.listByAccount.useQuery({ accountId })

  // Initialize from account - only once per account to avoid overwriting user changes
  useEffect(() => {
    // Skip if we've already initialized for this account
    if (initializedRef.current === accountId) {
      return
    }
    
    if (accountQuery.data && contactsQuery.data !== undefined) {
      // Mark as initialized for this account
      initializedRef.current = accountId
      
      store.initializeFromAccount(accountId, accountQuery.data.name)
      
      // Type the account data properly
      const accountData = accountQuery.data as {
        name?: string | null
        industry?: string | null
        industries?: string[] | null
        website?: string | null
        linkedin_url?: string | null
        headquarters_location?: string | null
        headquarters_city?: string | null
        headquarters_state?: string | null
        headquarters_postal_code?: string | null
        headquarters_country?: string | null
        billing_address?: string | null
        billing_city?: string | null
        billing_state?: string | null
        billing_postal_code?: string | null
        billing_country?: string | null
        // Communication preferences
        preferred_contact_method?: string | null
        meeting_cadence?: string | null
        onboarding_data?: Record<string, unknown> | null
        client_details?: {
          billing_entity_name?: string | null
          billing_email?: string | null
          billing_phone?: string | null
          billing_frequency?: string | null
          payment_terms_days?: number | null
          po_required?: boolean | null
          billing_address_line_1?: string | null
          billing_city?: string | null
          billing_state?: string | null
          billing_postal_code?: string | null
          billing_country?: string | null
        }[] | null
      }
      
      // Load industries - prioritize the industries array column, then onboarding_data, then single industry
      let industriesArray: string[] = []
      if (accountData.industries && accountData.industries.length > 0) {
        industriesArray = accountData.industries
      } else if (accountData.onboarding_data?.industries) {
        industriesArray = accountData.onboarding_data.industries as string[]
      } else if (accountData.industry) {
        industriesArray = [accountData.industry]
      }
      
      // Load headquarters address
      // The headquarters_location contains the street address
      // City, state, country are in separate fields
      const hqAddress: Partial<AccountOnboardingFormData> = {
        streetAddress: accountData.headquarters_location || '',
        city: accountData.headquarters_city || '',
        state: accountData.headquarters_state || '',
        postalCode: accountData.headquarters_postal_code || '',
      }
      
      // Set country with proper conversion (USA -> US for select component)
      const country = accountData.headquarters_country
      if (country === 'USA' || country === 'United States') {
        hqAddress.country = 'US'
      } else if (country === 'Canada') {
        hqAddress.country = 'CA'
      } else if (country && country.length === 2) {
        hqAddress.country = country
      } else {
        hqAddress.country = country || 'US'
      }
      
      // Load billing data from client_details
      // client_details can be an array or single object depending on query
      const clientDetailsRaw = accountData.client_details
      const clientDetails = Array.isArray(clientDetailsRaw) ? clientDetailsRaw[0] : clientDetailsRaw
      const billingData: Partial<AccountOnboardingFormData> = {}
      
      if (clientDetails) {
        // Billing entity name
        if (clientDetails.billing_entity_name) {
          billingData.billingEntityName = clientDetails.billing_entity_name
        }
        
        // Billing contact email
        if (clientDetails.billing_email) {
          billingData.billingContactEmail = clientDetails.billing_email
        }
        
        // Billing contact phone
        if (clientDetails.billing_phone) {
          billingData.billingContactPhone = parsePhoneValue(clientDetails.billing_phone)
        }
        
        // Billing frequency (map database values to form values)
        if (clientDetails.billing_frequency) {
          billingData.billingFrequency = clientDetails.billing_frequency
        }
        
        // Payment terms (convert days to term string)
        if (clientDetails.payment_terms_days) {
          const days = clientDetails.payment_terms_days
          if (days === 15) billingData.paymentTerms = 'net_15'
          else if (days === 30) billingData.paymentTerms = 'net_30'
          else if (days === 45) billingData.paymentTerms = 'net_45'
          else if (days === 60) billingData.paymentTerms = 'net_60'
        }
        
        // PO Required
        if (clientDetails.po_required !== null && clientDetails.po_required !== undefined) {
          billingData.poRequired = clientDetails.po_required
        }
        
        // Billing address - check if different from HQ
        const hasBillingAddress = clientDetails.billing_address_line_1 || 
          clientDetails.billing_city || 
          clientDetails.billing_state
        
        if (hasBillingAddress) {
          // Check if billing address is same as HQ
          const sameAsHQ = 
            clientDetails.billing_city === accountData.headquarters_city &&
            clientDetails.billing_state === accountData.headquarters_state
          
          billingData.useSameAddress = sameAsHQ
          
          if (!sameAsHQ) {
            // Build billing address string
            const addressParts = [
              clientDetails.billing_address_line_1,
              clientDetails.billing_city,
              clientDetails.billing_state,
              clientDetails.billing_postal_code,
            ].filter(Boolean)
            billingData.billingAddress = addressParts.join(', ')
          }
        }
      }
      
      // Also check addresses table for billing address (via getById response)
      if (accountData.billing_address || accountData.billing_city) {
        const hasBillingAddr = accountData.billing_address || accountData.billing_city || accountData.billing_state
        if (hasBillingAddr) {
          const sameAsHQ = 
            accountData.billing_city === accountData.headquarters_city &&
            accountData.billing_state === accountData.headquarters_state
          
          billingData.useSameAddress = sameAsHQ
          
          if (!sameAsHQ) {
            const addressParts = [
              accountData.billing_address,
              accountData.billing_city,
              accountData.billing_state,
              accountData.billing_postal_code,
            ].filter(Boolean)
            billingData.billingAddress = addressParts.join(', ')
          }
        }
      }
      
      // Load communication preferences (Step 4: Key Contacts)
      const communicationData: Partial<AccountOnboardingFormData> = {}
      if (accountData.preferred_contact_method) {
        communicationData.preferredChannel = accountData.preferred_contact_method
      }
      if (accountData.meeting_cadence) {
        communicationData.meetingCadence = accountData.meeting_cadence
      }
      
      // Load existing contacts (Step 4: Key Contacts)
      const existingContacts: AdditionalContact[] = []
      if (contactsQuery.data && contactsQuery.data.length > 0) {
        contactsQuery.data.forEach((contact: {
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          title?: string | null
          subtype?: string | null
          is_primary?: boolean
        }) => {
          existingContacts.push({
            firstName: contact.first_name || '',
            lastName: contact.last_name || '',
            email: contact.email || '',
            phone: contact.phone ? parsePhoneValue(contact.phone) : { countryCode: 'US', number: '' },
            title: contact.title || '',
            roles: contact.is_primary ? ['primary'] : [],
          })
        })
      }
      
      store.setFormData({
        legalName: accountData.name || '',
        industries: industriesArray,
        website: accountData.website || '',
        linkedinUrl: accountData.linkedin_url || '',
        ...hqAddress,
        ...billingData,
        ...communicationData,
        ...(existingContacts.length > 0 ? { additionalContacts: existingContacts } : {}),
      })
    }
  }, [accountQuery.data, contactsQuery.data, accountId])

  // Complete onboarding mutation
  const completeOnboardingMutation = trpc.crm.accounts.completeOnboarding.useMutation({
    onSuccess: () => {
      toast({
        title: 'Onboarding Complete!',
        description: `${store.accountName || 'Account'} is now active and ready for job requisitions.`,
      })
      utils.crm.accounts.getById.invalidate({ id: accountId })
      utils.crm.accounts.list.invalidate()
      store.resetForm()
      router.push(`/employee/recruiting/accounts/${accountId}`)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete onboarding.',
        variant: 'error',
      })
    },
  })

  // Create config with submit handler
  const config = {
    ...accountOnboardingWizardConfig,
    title: `Onboarding: ${store.accountName || accountQuery.data?.name || 'Account'}`,
    cancelRoute: `/employee/recruiting/accounts/${accountId}`,
    onSubmit: async (formData: AccountOnboardingFormData) => {
      return completeOnboardingMutation.mutateAsync({
        accountId,
        // Step 1: Company Profile
        legalName: formData.legalName || undefined,
        dba: formData.dbaName || undefined,
        industry: formData.industries.length > 0 ? formData.industries[0] : undefined,
        industries: formData.industries.length > 0 ? formData.industries : undefined,
        linkedinUrl: formData.linkedinUrl || undefined,
        companySize: (formData.companySize || undefined) as '1-50' | '51-200' | '201-500' | '501-1000' | '1000+' | undefined,
        streetAddress: formData.streetAddress || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.postalCode || undefined,
        country: formData.country || undefined,
        taxId: formData.taxId || undefined,
        fundingStage: formData.fundingStage || undefined,
        // Step 2: Contract Setup
        contractType: (formData.contractType || undefined) as 'msa' | 'sow' | 'staffing_agreement' | 'vendor_agreement' | undefined,
        contractStartDate: formData.contractStartDate || undefined,
        contractEndDate: formData.contractEndDate || undefined,
        isEvergreen: formData.isEvergreen,
        specialTerms: formData.contractNotes || undefined,
        // Step 3: Billing Setup
        paymentTerms: (formData.paymentTerms || undefined) as 'net_15' | 'net_30' | 'net_45' | 'net_60' | undefined,
        billingFrequency: (formData.billingFrequency || undefined) as 'weekly' | 'biweekly' | 'monthly' | undefined,
        billingContactName: formData.billingContactName || undefined,
        billingContactEmail: formData.billingContactEmail || undefined,
        billingContactPhone: formatPhoneValue(formData.billingContactPhone) || undefined,
        poRequired: formData.poRequired,
        poFormat: formData.poNumber || undefined,
        // Step 4: Communication Preferences
        preferredContactMethod: (formData.preferredChannel || undefined) as 'email' | 'phone' | 'slack' | 'teams' | undefined,
        meetingCadence: (formData.meetingCadence || undefined) as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | undefined,
        // Step 5: Job Categories
        jobCategories: formData.selectedJobCategories,
        techStack: formData.techStack ? formData.techStack.split(',').map(s => s.trim()) : undefined,
        workAuthRequirements: formData.workAuthorizations,
        experienceLevels: formData.experienceLevels,
        // Step 6: Kickoff
        kickoffScheduled: formData.scheduleKickoff,
        kickoffDate: formData.kickoffDate || undefined,
        sendWelcomePackage: formData.sendWelcomeEmail,
        // Additional contacts added during onboarding
        additionalContacts: formData.additionalContacts?.length > 0 
          ? formData.additionalContacts.map(contact => ({
              firstName: contact.firstName,
              lastName: contact.lastName || undefined,
              email: contact.email,
              phone: typeof contact.phone === 'object' && contact.phone 
                ? formatPhoneValue(contact.phone) || undefined 
                : (contact.phone as string) || undefined,
              title: contact.title || undefined,
              roles: contact.roles || undefined,
            }))
          : undefined,
      })
    },
    onSuccess: () => {
      // Already handled in mutation onSuccess
    },
  }

  if (accountQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  return (
    <EntityWizard<AccountOnboardingFormData>
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
