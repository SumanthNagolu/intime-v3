'use client'

import * as React from 'react'
import { Briefcase, CheckCircle2, Hash, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { SettingsSection } from './SettingsSection'

export function BusinessRulesSettingsPage() {
  const utils = trpc.useUtils()

  // Fetch settings
  const { data: orgSettings, isLoading } = trpc.settings.getOrgSettings.useQuery({ category: 'business' })

  // Form state - Approval thresholds
  const [requireApprovalAmount, setRequireApprovalAmount] = React.useState('10000')
  const [requireSecondApproval, setRequireSecondApproval] = React.useState(true)
  const [secondApprovalThreshold, setSecondApprovalThreshold] = React.useState('50000')

  // Form state - Defaults
  const [defaultPlacementFee, setDefaultPlacementFee] = React.useState('20')
  const [defaultPaymentTerms, setDefaultPaymentTerms] = React.useState('30')
  const [defaultBillRate, setDefaultBillRate] = React.useState('75')

  // Form state - Naming conventions
  const [jobIdPrefix, setJobIdPrefix] = React.useState('JOB')
  const [candidateIdPrefix, setCandidateIdPrefix] = React.useState('CAN')
  const [requireJobApproval, setRequireJobApproval] = React.useState(true)

  // Update form when data loads
  React.useEffect(() => {
    if (orgSettings) {
      const settingsMap = Object.fromEntries(
        orgSettings.map(s => {
          try {
            return [s.key, JSON.parse(s.value as string)]
          } catch {
            return [s.key, s.value]
          }
        })
      )

      if (settingsMap.require_approval_amount) setRequireApprovalAmount(String(settingsMap.require_approval_amount))
      if (typeof settingsMap.require_second_approval === 'boolean') setRequireSecondApproval(settingsMap.require_second_approval)
      if (settingsMap.second_approval_threshold) setSecondApprovalThreshold(String(settingsMap.second_approval_threshold))
      if (settingsMap.default_placement_fee) setDefaultPlacementFee(String(settingsMap.default_placement_fee))
      if (settingsMap.default_payment_terms) setDefaultPaymentTerms(String(settingsMap.default_payment_terms))
      if (settingsMap.default_bill_rate) setDefaultBillRate(String(settingsMap.default_bill_rate))
      if (settingsMap.job_id_prefix) setJobIdPrefix(settingsMap.job_id_prefix)
      if (settingsMap.candidate_id_prefix) setCandidateIdPrefix(settingsMap.candidate_id_prefix)
      if (typeof settingsMap.require_job_approval === 'boolean') setRequireJobApproval(settingsMap.require_job_approval)
    }
  }, [orgSettings])

  // Mutation
  const updateSettings = trpc.settings.bulkUpdateOrgSettings.useMutation({
    onSuccess: () => {
      utils.settings.getOrgSettings.invalidate()
      toast.success('Business rules saved successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save settings')
    },
  })

  const handleSave = () => {
    updateSettings.mutate({
      settings: [
        { key: 'require_approval_amount', value: parseFloat(requireApprovalAmount) || 10000, category: 'business' },
        { key: 'require_second_approval', value: requireSecondApproval, category: 'business' },
        { key: 'second_approval_threshold', value: parseFloat(secondApprovalThreshold) || 50000, category: 'business' },
        { key: 'default_placement_fee', value: parseFloat(defaultPlacementFee) || 20, category: 'business' },
        { key: 'default_payment_terms', value: parseInt(defaultPaymentTerms) || 30, category: 'business' },
        { key: 'default_bill_rate', value: parseFloat(defaultBillRate) || 75, category: 'business' },
        { key: 'job_id_prefix', value: jobIdPrefix.toUpperCase(), category: 'business' },
        { key: 'candidate_id_prefix', value: candidateIdPrefix.toUpperCase(), category: 'business' },
        { key: 'require_job_approval', value: requireJobApproval, category: 'business' },
      ],
    })
  }

  if (isLoading) {
    return (
      <DashboardShell
        title="Business Rules"
        description="Configure business rules and default values"
      >
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-charcoal-100 rounded-lg" />
          <div className="h-48 bg-charcoal-100 rounded-lg" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      title="Business Rules"
      description="Configure business rules and default values"
      actions={
        <Button
          onClick={handleSave}
          loading={updateSettings.isPending}
          disabled={updateSettings.isPending}
        >
          Save Changes
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Approval Thresholds */}
        <SettingsSection
          title="Approval Thresholds"
          description="Configure when approvals are required"
          icon={CheckCircle2}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="approvalAmount">Require Approval Above ($)</Label>
                <Input
                  id="approvalAmount"
                  type="number"
                  value={requireApprovalAmount}
                  onChange={(e) => setRequireApprovalAmount(e.target.value)}
                  placeholder="10000"
                  leftIcon={<DollarSign className="h-4 w-4" />}
                />
                <p className="text-xs text-charcoal-500">
                  Deals above this amount require manager approval
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
              <div className="space-y-0.5">
                <Label>Require Second Approval</Label>
                <p className="text-sm text-charcoal-500">
                  Large deals require additional executive approval
                </p>
              </div>
              <Switch
                checked={requireSecondApproval}
                onCheckedChange={setRequireSecondApproval}
              />
            </div>

            {requireSecondApproval && (
              <div className="space-y-2">
                <Label htmlFor="secondApproval">Second Approval Threshold ($)</Label>
                <Input
                  id="secondApproval"
                  type="number"
                  value={secondApprovalThreshold}
                  onChange={(e) => setSecondApprovalThreshold(e.target.value)}
                  placeholder="50000"
                  leftIcon={<DollarSign className="h-4 w-4" />}
                />
              </div>
            )}
          </div>
        </SettingsSection>

        {/* Default Values */}
        <SettingsSection
          title="Default Values"
          description="Set default values for new records"
          icon={Briefcase}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="placementFee">Default Placement Fee (%)</Label>
              <Input
                id="placementFee"
                type="number"
                value={defaultPlacementFee}
                onChange={(e) => setDefaultPlacementFee(e.target.value)}
                placeholder="20"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Default Payment Terms (days)</Label>
              <Input
                id="paymentTerms"
                type="number"
                value={defaultPaymentTerms}
                onChange={(e) => setDefaultPaymentTerms(e.target.value)}
                placeholder="30"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billRate">Default Bill Rate ($/hr)</Label>
              <Input
                id="billRate"
                type="number"
                value={defaultBillRate}
                onChange={(e) => setDefaultBillRate(e.target.value)}
                placeholder="75"
                leftIcon={<DollarSign className="h-4 w-4" />}
              />
            </div>
          </div>
        </SettingsSection>

        {/* Naming Conventions */}
        <SettingsSection
          title="Naming Conventions"
          description="Configure ID prefixes and naming rules"
          icon={Hash}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="jobIdPrefix">Job ID Prefix</Label>
                <Input
                  id="jobIdPrefix"
                  value={jobIdPrefix}
                  onChange={(e) => setJobIdPrefix(e.target.value.toUpperCase())}
                  placeholder="JOB"
                  maxLength={5}
                />
                <p className="text-xs text-charcoal-500">
                  Example: {jobIdPrefix}-2024-001
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="candidateIdPrefix">Candidate ID Prefix</Label>
                <Input
                  id="candidateIdPrefix"
                  value={candidateIdPrefix}
                  onChange={(e) => setCandidateIdPrefix(e.target.value.toUpperCase())}
                  placeholder="CAN"
                  maxLength={5}
                />
                <p className="text-xs text-charcoal-500">
                  Example: {candidateIdPrefix}-2024-001
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
              <div className="space-y-0.5">
                <Label>Require Job Posting Approval</Label>
                <p className="text-sm text-charcoal-500">
                  New job postings require manager approval before publishing
                </p>
              </div>
              <Switch
                checked={requireJobApproval}
                onCheckedChange={setRequireJobApproval}
              />
            </div>
          </div>
        </SettingsSection>
      </div>
    </DashboardShell>
  )
}
