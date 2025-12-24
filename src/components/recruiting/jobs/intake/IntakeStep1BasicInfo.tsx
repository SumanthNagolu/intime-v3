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
import { Building2, Users, Briefcase, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react'

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
    <div className="space-y-8">
      {/* Account & Contact Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gold-500" />
          <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
            Account & Contact
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="account">Client Account *</Label>
            {formData.accountName && formData.accountId ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="flex-1 font-medium text-green-900">{formData.accountName}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ accountId: '', accountName: '' })}
                  className="text-sm text-green-700 hover:text-green-900 hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <Select value={formData.accountId} onValueChange={handleAccountChange}>
                <SelectTrigger id="account">
                  <SelectValue placeholder="Select client account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-charcoal-400" />
                        {account.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hiringManager">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-charcoal-400" />
                Hiring Manager
              </div>
            </Label>
            <Select
              value={formData.hiringManagerId}
              onValueChange={(value) => setFormData({ hiringManagerId: value })}
              disabled={!formData.accountId || contacts.length === 0}
            >
              <SelectTrigger id="hiringManager">
                <SelectValue placeholder={formData.accountId ? 'Select hiring manager' : 'Select account first'} />
              </SelectTrigger>
              <SelectContent>
                {contacts.map(
                  (contact: { id: string; first_name: string; last_name?: string; title?: string }) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name}
                      {contact.title && (
                        <span className="text-charcoal-500 ml-1">• {contact.title}</span>
                      )}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="intakeMethod">How was this job received? *</Label>
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
      <div className="space-y-4 pt-6 border-t border-charcoal-100">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gold-500" />
          <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
            Job Details
          </h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ title: e.target.value })}
            placeholder="e.g., Senior Backend Engineer, Staff Product Designer"
            className="text-lg"
          />
          {formData.title && formData.title.length < 3 && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Title should be at least 3 characters
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="positions"># of Positions *</Label>
            <Select
              value={formData.positionsCount.toString()}
              onValueChange={(value) => setFormData({ positionsCount: parseInt(value) || 1 })}
            >
              <SelectTrigger id="positions">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 50].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'position' : 'positions'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="targetStartDate" className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
              Target Start Date
            </Label>
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
          <Label>Employment Type *</Label>
          <div className="grid grid-cols-4 gap-2">
            {JOB_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ jobType: type.value })}
                className={cn(
                  'p-3 rounded-lg border-2 text-center transition-all duration-200',
                  formData.jobType === type.value
                    ? 'border-gold-500 bg-gold-50 text-charcoal-900 shadow-sm'
                    : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50'
                )}
              >
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Priority Level *</Label>
          <div className="grid grid-cols-4 gap-2">
            {PRIORITY_LEVELS.map((level) => {
              const isSelected = formData.priority === level.value
              const colorClasses = {
                urgent: isSelected ? 'border-red-500 bg-red-50' : '',
                high: isSelected ? 'border-amber-500 bg-amber-50' : '',
                normal: isSelected ? 'border-blue-500 bg-blue-50' : '',
                low: isSelected ? 'border-charcoal-400 bg-charcoal-50' : '',
              }
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData({ priority: level.value })}
                  className={cn(
                    'p-3 rounded-lg border-2 text-left transition-all duration-200',
                    isSelected
                      ? colorClasses[level.value as keyof typeof colorClasses]
                      : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50'
                  )}
                >
                  <span className={cn('text-sm font-medium block', level.color)}>
                    {level.value.charAt(0).toUpperCase() + level.value.slice(1)}
                  </span>
                  <span className="text-xs text-charcoal-500 mt-0.5 block">
                    {level.value === 'urgent' && 'ASAP, <2 weeks'}
                    {level.value === 'high' && 'Within 30 days'}
                    {level.value === 'normal' && '30-60 days'}
                    {level.value === 'low' && '60+ days'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      {(!formData.accountId || !formData.title || formData.title.length < 3) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-medium text-amber-800 mb-2">Complete these to continue:</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            {!formData.accountId && (
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Select a client account
              </li>
            )}
            {(!formData.title || formData.title.length < 3) && (
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Enter a job title (at least 3 characters)
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
