'use client'

import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EditableInfoCard, type FieldDefinition } from '@/components/ui/editable-info-card'
import {
  Phone,
  Mail,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface AccountData {
  id: string
  name: string
  industry: string | null
  status: string
  website: string | null
  phone: string | null
  city: string | null
  state: string | null
  description: string | null
  headquarters_location: string | null
  linkedin_url: string | null
  relationship_health: string | null
  nps_score: number | null
  last_contact_date: string | null
  onboarding_status: string | null
  onboarding_completed_at: string | null
  billing_frequency: string | null
  payment_terms_days: number | null
  po_required: boolean | null
  preferred_contact_method: string | null
  meeting_cadence: string | null
}

interface AccountOverviewSectionProps {
  account: AccountData
  accountId: string
  onStartOnboarding: () => void
}

const healthColors: Record<string, string> = {
  healthy: 'text-green-600',
  attention: 'text-amber-600',
  at_risk: 'text-red-600',
}

const onboardingStatusColors: Record<string, string> = {
  pending: 'bg-charcoal-100 text-charcoal-600',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
}

// Field definitions for editable cards
const companyDetailsFields: FieldDefinition[] = [
  { key: 'name', label: 'Company Name', type: 'text', required: true },
  { key: 'industry', label: 'Industry', type: 'select', options: [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'energy', label: 'Energy' },
    { value: 'education', label: 'Education' },
    { value: 'government', label: 'Government' },
    { value: 'other', label: 'Other' },
  ]},
  { key: 'website', label: 'Website', type: 'url' },
  { key: 'phone', label: 'Phone', type: 'phone' },
  { key: 'headquarters_location', label: 'Location', type: 'text' },
  { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
  { key: 'description', label: 'Description', type: 'textarea' },
]

const billingFields: FieldDefinition[] = [
  { key: 'billing_frequency', label: 'Billing Frequency', type: 'select', options: [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
  ]},
  { key: 'payment_terms_days', label: 'Payment Terms (days)', type: 'number', min: 0, max: 120 },
  { key: 'po_required', label: 'PO Required', type: 'checkbox' },
]

const communicationFields: FieldDefinition[] = [
  { key: 'preferred_contact_method', label: 'Preferred Method', type: 'select', options: [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'slack', label: 'Slack' },
    { value: 'teams', label: 'Teams' },
  ]},
  { key: 'meeting_cadence', label: 'Meeting Cadence', type: 'select', options: [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
  ]},
]

export function AccountOverviewSection({
  account,
  accountId,
  onStartOnboarding
}: AccountOverviewSectionProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Overview-specific queries - only fires when this section is rendered
  const contactsQuery = trpc.crm.contacts.listByAccount.useQuery({ accountId })
  const jobsQuery = trpc.ats.jobs.list.useQuery({ accountId, limit: 5, status: 'active' })

  // Mutation for updating account
  const updateAccountMutation = trpc.crm.accounts.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Account updated successfully' })
      utils.crm.accounts.getById.invalidate({ id: accountId })
    },
    onError: (error) => {
      toast({ title: 'Failed to update account', description: error.message, variant: 'error' })
    },
  })

  // Handler for saving company details
  const handleSaveCompanyDetails = async (data: Record<string, unknown>) => {
    await updateAccountMutation.mutateAsync({
      id: accountId,
      name: data.name as string,
      industry: data.industry as string,
      website: data.website as string || '',
      phone: data.phone as string,
      headquartersLocation: data.headquarters_location as string,
      linkedinUrl: data.linkedin_url as string || '',
      description: data.description as string,
    })
  }

  // Handler for saving billing info
  const handleSaveBilling = async (data: Record<string, unknown>) => {
    await updateAccountMutation.mutateAsync({
      id: accountId,
      billingFrequency: data.billing_frequency as 'weekly' | 'biweekly' | 'monthly',
      paymentTermsDays: data.payment_terms_days as number,
      poRequired: data.po_required as boolean,
    })
  }

  // Handler for saving communication preferences
  const handleSaveCommunication = async (data: Record<string, unknown>) => {
    await updateAccountMutation.mutateAsync({
      id: accountId,
      preferredContactMethod: data.preferred_contact_method as 'email' | 'phone' | 'slack' | 'teams',
      meetingCadence: data.meeting_cadence as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly',
    })
  }

  const contacts = contactsQuery.data || []
  const jobs = jobsQuery.data?.items || []
  
  const primaryContact = contacts.find((c: any) => c.is_primary)
  const activeJobsCount = jobs.length

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <TrendingUp className="w-4 h-4" />
      case 'attention':
        return <Minus className="w-4 h-4" />
      case 'at_risk':
        return <TrendingDown className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column - Account Info */}
      <div className="col-span-2 space-y-6">
        {/* Company Details - Editable */}
        <EditableInfoCard
          title="Company Details"
          fields={companyDetailsFields}
          data={account as unknown as Record<string, unknown>}
          onSave={handleSaveCompanyDetails}
          columns={2}
        />

        {/* Primary Contact */}
        {contactsQuery.isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>Primary Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-charcoal-400" />
              </div>
            </CardContent>
          </Card>
        ) : primaryContact ? (
          <Card>
            <CardHeader>
              <CardTitle>Primary Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-hublot-100 flex items-center justify-center">
                  <span className="text-lg font-medium text-hublot-700">
                    {primaryContact.first_name?.[0]}{primaryContact.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-charcoal-900">
                    {primaryContact.first_name} {primaryContact.last_name}
                  </p>
                  <p className="text-sm text-charcoal-500">{primaryContact.title}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {primaryContact.email && (
                      <a href={`mailto:${primaryContact.email}`} className="flex items-center gap-1 text-hublot-600 hover:underline">
                        <Mail className="w-3 h-3" />
                        {primaryContact.email}
                      </a>
                    )}
                    {primaryContact.phone && (
                      <span className="flex items-center gap-1 text-charcoal-600">
                        <Phone className="w-3 h-3" />
                        {primaryContact.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Recent Jobs */}
        {jobsQuery.isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-charcoal-400" />
              </div>
            </CardContent>
          </Card>
        ) : jobs.length > 0 ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Jobs</CardTitle>
              <Link href={`/employee/recruiting/jobs?account=${accountId}`}>
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobs.map((job: any) => (
                  <Link
                    key={job.id}
                    href={`/employee/recruiting/jobs/${job.id}`}
                    className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-charcoal-400" />
                      <span className="font-medium">{job.title}</span>
                    </div>
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Right Column - Stats & Quick Info */}
      <div className="space-y-6">
        {/* Health Score */}
        <Card>
          <CardHeader>
            <CardTitle>Account Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn('flex items-center gap-2', healthColors[account.relationship_health || 'healthy'])}>
                {getHealthIcon(account.relationship_health || 'healthy')}
                <span className="text-2xl font-bold capitalize">{account.relationship_health || 'Healthy'}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">NPS Score</span>
                <span className="font-medium">{account.nps_score ?? 'Not set'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Last Contact</span>
                <span className="font-medium">
                  {account.last_contact_date
                    ? formatDistanceToNow(new Date(account.last_contact_date), { addSuffix: true })
                    : 'Never'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Active Jobs</span>
                <span className="font-medium">{activeJobsCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Status */}
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={cn(onboardingStatusColors[account.onboarding_status || 'pending'])}>
                {account.onboarding_status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                {(account.onboarding_status || 'pending').replace('_', ' ')}
              </Badge>
            </div>
            {account.onboarding_completed_at ? (
              <p className="text-sm text-charcoal-500">
                Completed {format(new Date(account.onboarding_completed_at), 'MMM d, yyyy')}
              </p>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                onClick={onStartOnboarding}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Start Onboarding
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Billing Info - Editable */}
        <EditableInfoCard
          title="Billing"
          fields={billingFields}
          data={account as unknown as Record<string, unknown>}
          onSave={handleSaveBilling}
          columns={1}
        />

        {/* Communication - Editable */}
        <EditableInfoCard
          title="Communication"
          fields={communicationFields}
          data={account as unknown as Record<string, unknown>}
          onSave={handleSaveCommunication}
          columns={1}
        />
      </div>
    </div>
  )
}

