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
  useCreateJobStore,
  INTAKE_METHODS,
  JOB_TYPES,
  PRIORITY_LEVELS,
} from '@/stores/create-job-store'
import { Section, FieldGroup, SelectCard, PriorityCard, SectionDivider, ValidationBanner } from './shared'
import { format } from 'date-fns'
import { Building2, Users, Briefcase, Calendar, Clock, TrendingUp, Zap } from 'lucide-react'

export function JobIntakeStep1BasicInfo() {
  const { formData, setFormData } = useCreateJobStore()

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
      hiringManagerContactId: null,
    })
  }

  // Build validation items
  const validationItems: string[] = []
  if (!formData.accountId) validationItems.push('Select a client account')
  if (!formData.title || formData.title.length < 3) validationItems.push('Enter a job title (at least 3 characters)')

  return (
    <div className="space-y-10">
      {/* Account & Contact Section */}
      <Section icon={Building2} title="Client Account" subtitle="Select the client and hiring manager for this role">
        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="account" className="text-charcoal-700 font-medium">
              Client Account <span className="text-gold-500">*</span>
            </Label>
            {formData.accountName && formData.accountId ? (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-forest-50 to-emerald-50 border border-forest-200 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-forest-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-forest-900">{formData.accountName}</p>
                  <p className="text-xs text-forest-600">Active Client</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ accountId: '', accountName: '', hiringManagerContactId: null })}
                  className="text-sm text-forest-600 hover:text-forest-800 hover:underline font-medium px-3 py-1 rounded-lg hover:bg-forest-100 transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <Select value={formData.accountId} onValueChange={handleAccountChange}>
                <SelectTrigger id="account" className="h-12 rounded-xl border-charcoal-200 bg-white">
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
            <Label htmlFor="hiringManager" className="text-charcoal-700 font-medium">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-charcoal-400" />
                Hiring Manager
              </div>
            </Label>
            <Select
              value={formData.hiringManagerContactId || ''}
              onValueChange={(value) => setFormData({ hiringManagerContactId: value || null })}
              disabled={!formData.accountId || contacts.length === 0}
            >
              <SelectTrigger id="hiringManager" className="h-12 rounded-xl border-charcoal-200 bg-white">
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
        </FieldGroup>

        <div className="space-y-2">
          <Label htmlFor="intakeMethod" className="text-charcoal-700 font-medium">
            How was this job received? <span className="text-gold-500">*</span>
          </Label>
          <Select
            value={formData.intakeMethod}
            onValueChange={(value) => setFormData({ intakeMethod: value })}
          >
            <SelectTrigger id="intakeMethod" className="h-12 rounded-xl border-charcoal-200 bg-white max-w-md">
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
      </Section>

      <SectionDivider label="Job Details" />

      {/* Job Basics Section */}
      <Section icon={Briefcase} title="Position Information" subtitle="Basic job details and timeline">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-charcoal-700 font-medium">
            Job Title <span className="text-gold-500">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ title: e.target.value })}
            placeholder="e.g., Senior Backend Engineer, Staff Product Designer"
            className="h-14 text-lg rounded-xl border-charcoal-200 bg-white placeholder:text-charcoal-300 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400"
          />
        </div>

        <FieldGroup cols={4}>
          <div className="space-y-2">
            <Label htmlFor="positions" className="text-charcoal-700 font-medium">
              # of Positions <span className="text-gold-500">*</span>
            </Label>
            <Select
              value={formData.positionsCount.toString()}
              onValueChange={(value) => setFormData({ positionsCount: parseInt(value) || 1 })}
            >
              <SelectTrigger id="positions" className="h-12 rounded-xl border-charcoal-200 bg-white">
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

          <div className="space-y-2">
            <Label htmlFor="targetFillDate" className="text-charcoal-700 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-charcoal-400" />
              Target Fill Date
            </Label>
            <Input
              id="targetFillDate"
              type="date"
              value={formData.targetFillDate}
              onChange={(e) => setFormData({ targetFillDate: e.target.value })}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetStartDate" className="text-charcoal-700 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-charcoal-400" />
              Target Start Date
            </Label>
            <Input
              id="targetStartDate"
              type="date"
              value={formData.targetStartDate}
              onChange={(e) => setFormData({ targetStartDate: e.target.value })}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetEndDate" className="text-charcoal-700 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-charcoal-400" />
              Target End Date
            </Label>
            <Input
              id="targetEndDate"
              type="date"
              value={formData.targetEndDate}
              onChange={(e) => setFormData({ targetEndDate: e.target.value })}
              min={formData.targetStartDate || format(new Date(), 'yyyy-MM-dd')}
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>
        </FieldGroup>

        <div className="space-y-2">
          <Label htmlFor="externalJobId" className="text-charcoal-700 font-medium">
            Client Job ID / Req Number
          </Label>
          <Input
            id="externalJobId"
            value={formData.externalJobId}
            onChange={(e) => setFormData({ externalJobId: e.target.value })}
            placeholder="e.g., REQ-12345, JOB-2024-001"
            className="h-12 rounded-xl border-charcoal-200 bg-white max-w-md"
          />
          <p className="text-xs text-charcoal-500">Optional: Client&apos;s internal reference number</p>
        </div>
      </Section>

      {/* Employment Type */}
      <Section icon={Briefcase} title="Employment Type" subtitle="Select the engagement model">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {JOB_TYPES.map((type) => (
            <SelectCard
              key={type.value}
              selected={formData.jobType === type.value}
              onClick={() => setFormData({ jobType: type.value })}
            >
              <div className="text-center">
                <span className="text-2xl mb-2 block">{type.icon}</span>
                <span className="text-sm font-semibold text-charcoal-800 block">{type.label}</span>
              </div>
            </SelectCard>
          ))}
        </div>
      </Section>

      {/* Priority Level */}
      <Section icon={Zap} title="Priority Level" subtitle="How urgent is this requisition?">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {PRIORITY_LEVELS.map((level) => {
            const colorScheme = {
              critical: 'red',
              urgent: 'orange',
              high: 'amber',
              normal: 'blue',
              low: 'charcoal',
            }[level.value] as 'red' | 'orange' | 'amber' | 'blue' | 'charcoal'

            const icons = {
              critical: <Clock className="w-4 h-4 text-red-500" />,
              urgent: <Clock className="w-4 h-4 text-orange-500" />,
              high: <TrendingUp className="w-4 h-4 text-amber-500" />,
              normal: <Briefcase className="w-4 h-4 text-blue-500" />,
              low: <Calendar className="w-4 h-4 text-charcoal-400" />,
            }

            return (
              <PriorityCard
                key={level.value}
                selected={formData.priority === level.value}
                onClick={() => setFormData({ priority: level.value })}
                icon={icons[level.value]}
                label={level.label}
                description={level.description}
                colorScheme={colorScheme}
              />
            )
          })}
        </div>
      </Section>

      {/* Validation Summary */}
      <ValidationBanner items={validationItems} />
    </div>
  )
}
