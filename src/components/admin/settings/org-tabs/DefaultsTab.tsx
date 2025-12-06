'use client'

import * as React from 'react'
import { Settings, Briefcase, Users, FileText, MessageSquare } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { SettingsSection } from '../SettingsSection'

interface DefaultValues {
  job_status?: string
  job_type?: string
  work_location?: string
  candidate_source?: string
  candidate_availability?: string
  auto_parse_resume?: boolean
  submission_status?: string
  auto_send_client_email?: boolean
  follow_up_days?: number
  auto_create_followup?: boolean
  email_signature_location?: string
  include_company_disclaimer?: boolean
}

interface DefaultsTabProps {
  organization: {
    default_values?: DefaultValues | null
  } | null | undefined
  onSave: (data: Record<string, unknown>) => void
  isPending: boolean
}

const jobStatuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'on_hold', label: 'On Hold' },
]

const jobTypes = [
  { value: 'contract', label: 'Contract' },
  { value: 'contract_to_hire', label: 'Contract-to-Hire' },
  { value: 'direct_hire', label: 'Direct Hire' },
  { value: 'temp', label: 'Temporary' },
]

const workLocations = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'Onsite' },
  { value: 'hybrid', label: 'Hybrid' },
]

const candidateSources = [
  { value: 'direct_application', label: 'Direct Application' },
  { value: 'referral', label: 'Referral' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'dice', label: 'Dice' },
  { value: 'other', label: 'Other' },
]

const candidateAvailabilities = [
  { value: 'immediate', label: 'Immediate' },
  { value: '1_week', label: '1 Week' },
  { value: '2_weeks', label: '2 Weeks' },
  { value: '1_month', label: '1 Month' },
  { value: 'negotiable', label: 'Negotiable' },
]

const submissionStatuses = [
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'in_progress', label: 'In Progress' },
]

const signatureLocations = [
  { value: 'below', label: 'Below message' },
  { value: 'above', label: 'Above message' },
  { value: 'none', label: 'None' },
]

const defaultDefaultValues: DefaultValues = {
  job_status: 'draft',
  job_type: 'contract',
  work_location: 'hybrid',
  candidate_source: 'direct_application',
  candidate_availability: '2_weeks',
  auto_parse_resume: true,
  submission_status: 'pending_review',
  auto_send_client_email: false,
  follow_up_days: 3,
  auto_create_followup: true,
  email_signature_location: 'below',
  include_company_disclaimer: true,
}

export function DefaultsTab({ organization, onSave, isPending }: DefaultsTabProps) {
  const [values, setValues] = React.useState<DefaultValues>(
    organization?.default_values || defaultDefaultValues
  )

  React.useEffect(() => {
    if (organization?.default_values) {
      setValues({ ...defaultDefaultValues, ...organization.default_values })
    }
  }, [organization])

  const handleChange = (key: keyof DefaultValues, value: string | boolean | number) => {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      default_values: values,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <SettingsSection
          title="Job Defaults"
          description="Default values for new job requisitions"
          icon={Briefcase}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="jobStatus">Default Status</Label>
              <Select
                value={values.job_status || 'draft'}
                onValueChange={(value) => handleChange('job_status', value)}
              >
                <SelectTrigger id="jobStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {jobStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobType">Default Job Type</Label>
              <Select
                value={values.job_type || 'contract'}
                onValueChange={(value) => handleChange('job_type', value)}
              >
                <SelectTrigger id="jobType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workLocation">Default Work Location</Label>
              <Select
                value={values.work_location || 'hybrid'}
                onValueChange={(value) => handleChange('work_location', value)}
              >
                <SelectTrigger id="workLocation">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {workLocations.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Candidate Defaults"
          description="Default values for new candidates"
          icon={Users}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="candidateSource">Default Source</Label>
              <Select
                value={values.candidate_source || 'direct_application'}
                onValueChange={(value) => handleChange('candidate_source', value)}
              >
                <SelectTrigger id="candidateSource">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {candidateSources.map((source) => (
                    <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="candidateAvailability">Default Availability</Label>
              <Select
                value={values.candidate_availability || '2_weeks'}
                onValueChange={(value) => handleChange('candidate_availability', value)}
              >
                <SelectTrigger id="candidateAvailability">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  {candidateAvailabilities.map((avail) => (
                    <SelectItem key={avail.value} value={avail.value}>{avail.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
            <div>
              <p className="font-medium text-charcoal-900">Auto-Parse Resumes</p>
              <p className="text-sm text-charcoal-500 mt-1">
                Automatically extract information from uploaded resumes
              </p>
            </div>
            <Switch
              checked={values.auto_parse_resume ?? true}
              onCheckedChange={(checked) => handleChange('auto_parse_resume', checked)}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Submission Defaults"
          description="Default values for candidate submissions"
          icon={FileText}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="submissionStatus">Default Status</Label>
              <Select
                value={values.submission_status || 'pending_review'}
                onValueChange={(value) => handleChange('submission_status', value)}
              >
                <SelectTrigger id="submissionStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {submissionStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
              <div>
                <p className="font-medium text-charcoal-900">Auto-Send Client Email</p>
                <p className="text-sm text-charcoal-500 mt-1">
                  Automatically email client on submission
                </p>
              </div>
              <Switch
                checked={values.auto_send_client_email ?? false}
                onCheckedChange={(checked) => handleChange('auto_send_client_email', checked)}
              />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Activity Defaults"
          description="Default settings for activities and follow-ups"
          icon={Settings}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="followUpDays">Default Follow-Up Days</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="followUpDays"
                  type="number"
                  min={1}
                  max={30}
                  value={values.follow_up_days || 3}
                  onChange={(e) => handleChange('follow_up_days', parseInt(e.target.value) || 3)}
                  className="w-24"
                />
                <span className="text-charcoal-600">days</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
              <div>
                <p className="font-medium text-charcoal-900">Auto-Create Follow-Up Task</p>
                <p className="text-sm text-charcoal-500 mt-1">
                  Create follow-up tasks after activities
                </p>
              </div>
              <Switch
                checked={values.auto_create_followup ?? true}
                onCheckedChange={(checked) => handleChange('auto_create_followup', checked)}
              />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Communication Defaults"
          description="Default settings for emails and messages"
          icon={MessageSquare}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="signatureLocation">Email Signature Location</Label>
              <Select
                value={values.email_signature_location || 'below'}
                onValueChange={(value) => handleChange('email_signature_location', value)}
              >
                <SelectTrigger id="signatureLocation">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {signatureLocations.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
              <div>
                <p className="font-medium text-charcoal-900">Include Company Disclaimer</p>
                <p className="text-sm text-charcoal-500 mt-1">
                  Add legal disclaimer to outbound emails
                </p>
              </div>
              <Switch
                checked={values.include_company_disclaimer ?? true}
                onCheckedChange={(checked) => handleChange('include_company_disclaimer', checked)}
              />
            </div>
          </div>
        </SettingsSection>

        <div className="flex justify-end">
          <Button id="save-settings-btn" type="submit" loading={isPending} disabled={isPending}>
            Save Default Values
          </Button>
        </div>
      </div>
    </form>
  )
}
