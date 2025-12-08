'use client'

import { trpc } from '@/lib/trpc/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useJobIntakeStore,
  INTAKE_METHODS,
  JOB_TYPES,
  PRIORITY_LEVELS,
} from '@/stores/job-intake-store'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export function IntakeStep1BasicInfo() {
  const { formData, setFormData } = useJobIntakeStore()

  // Queries
  const accountsQuery = trpc.crm.accounts.list.useQuery(
    { limit: 100, status: 'active' },
    { enabled: !formData.accountId }
  )

  const contactsQuery = trpc.crm.contacts.listByAccount.useQuery(
    { accountId: formData.accountId || '' },
    { enabled: !!formData.accountId }
  )

  const accounts = accountsQuery.data?.items || []
  const contacts = contactsQuery.data || []

  const handleAccountChange = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    setFormData({
      accountId,
      accountName: account?.name || '',
      hiringManagerId: '', // Reset hiring manager when account changes
    })
  }

  return (
    <div className="space-y-6">
      {/* Account & Contact Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Account & Contact
        </h3>

        <div className="space-y-2">
          <Label htmlFor="account">Account *</Label>
          {formData.accountName && formData.accountId ? (
            <div className="flex items-center gap-2">
              <Input value={formData.accountName} disabled className="flex-1" />
              <button
                type="button"
                onClick={() => setFormData({ accountId: '', accountName: '' })}
                className="text-sm text-hublot-700 hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <Select value={formData.accountId} onValueChange={handleAccountChange}>
              <SelectTrigger id="account">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {formData.accountId && contacts.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="hiringManager">Hiring Manager</Label>
            <Select
              value={formData.hiringManagerId}
              onValueChange={(value) => setFormData({ hiringManagerId: value })}
            >
              <SelectTrigger id="hiringManager">
                <SelectValue placeholder="Select hiring manager" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map(
                  (contact: { id: string; first_name: string; last_name?: string; title?: string }) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name}{' '}
                      {contact.title && `- ${contact.title}`}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="intakeMethod">Intake Method *</Label>
          <Select
            value={formData.intakeMethod}
            onValueChange={(value) => setFormData({ intakeMethod: value })}
          >
            <SelectTrigger id="intakeMethod">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTAKE_METHODS.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Job Basics Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Job Basics
        </h3>

        <div className="space-y-2">
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ title: e.target.value })}
            placeholder="e.g., Senior Backend Engineer"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="positions">Number of Positions *</Label>
            <Input
              id="positions"
              type="number"
              min={1}
              value={formData.positionsCount}
              onChange={(e) => setFormData({ positionsCount: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetStartDate">Target Start Date</Label>
            <Input
              id="targetStartDate"
              type="date"
              value={formData.targetStartDate}
              onChange={(e) => setFormData({ targetStartDate: e.target.value })}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Job Type *</Label>
          <div className="grid grid-cols-2 gap-2">
            {JOB_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ jobType: type.value })}
                className={cn(
                  'p-3 rounded-lg border-2 text-left transition-colors text-sm',
                  formData.jobType === type.value
                    ? 'border-hublot-700 bg-hublot-50 text-hublot-900'
                    : 'border-charcoal-200 hover:border-charcoal-300'
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Priority Level *</Label>
          <div className="grid grid-cols-2 gap-2">
            {PRIORITY_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setFormData({ priority: level.value })}
                className={cn(
                  'p-3 rounded-lg border-2 text-left transition-colors text-sm',
                  formData.priority === level.value
                    ? 'border-hublot-700 bg-hublot-50'
                    : 'border-charcoal-200 hover:border-charcoal-300'
                )}
              >
                <span className={level.color}>{level.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
