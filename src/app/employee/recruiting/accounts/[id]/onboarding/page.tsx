'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { EntityWizard } from '@/components/pcf/wizard/EntityWizard'
import { accountOnboardingWizardConfig } from '@/configs/entities/wizards/account-onboarding.config'
import { useAccountOnboardingStore, AccountOnboardingFormData } from '@/stores/account-onboarding-store'
import { Loader2 } from 'lucide-react'

export default function AccountOnboardingPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const accountId = params.id as string

  // Use the existing store
  const store = useAccountOnboardingStore()

  // Fetch account data
  const accountQuery = trpc.crm.accounts.getById.useQuery({ id: accountId })

  // Initialize from account
  useEffect(() => {
    if (accountQuery.data) {
      store.initializeFromAccount(accountId, accountQuery.data.name)
      // Pre-populate fields from existing account data
      store.setFormData({
        legalName: accountQuery.data.name || '',
        industries: accountQuery.data.industry ? [accountQuery.data.industry] : [],
        website: accountQuery.data.website || '',
        city: accountQuery.data.city || '',
        state: accountQuery.data.state || '',
      })
    }
  }, [accountQuery.data, accountId])

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
        companySize: (formData.companySize || undefined) as '1-50' | '51-200' | '201-500' | '501-1000' | '1000+' | undefined,
        streetAddress: formData.streetAddress || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.postalCode || undefined,
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
