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
import { Building2, Users, Briefcase, Calendar, AlertCircle, CheckCircle2, Zap, Clock, TrendingUp } from 'lucide-react'

// Section wrapper component for consistent styling
function Section({ 
  icon: Icon, 
  title, 
  children,
  className 
}: { 
  icon?: React.ElementType
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-100 to-gold-50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-gold-600" />
          </div>
        )}
        <h3 className="text-sm font-semibold text-charcoal-800 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

// Field group for better organization
function FieldGroup({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 | 4 }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  }
  return <div className={cn('grid gap-5', gridCols[cols])}>{children}</div>
}

// Premium select card button
function SelectCard({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative p-4 rounded-xl border-2 text-left transition-all duration-300 overflow-hidden group',
        selected
          ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50 shadow-gold-glow'
          : 'border-charcoal-200 bg-white hover:border-charcoal-300 hover:bg-charcoal-50/50 hover:shadow-elevation-xs',
        className
      )}
    >
      {selected && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="w-5 h-5 text-gold-500" />
        </div>
      )}
      {children}
    </button>
  )
}

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
      hiringManagerId: '',
    })
  }

  return (
    <div className="space-y-10">
      {/* Account & Contact Section */}
      <Section icon={Building2} title="Client Account">
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
                  onClick={() => setFormData({ accountId: '', accountName: '' })}
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
              value={formData.hiringManagerId}
              onValueChange={(value) => setFormData({ hiringManagerId: value })}
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

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs text-charcoal-400 uppercase tracking-wider">Job Details</span>
        </div>
      </div>

      {/* Job Basics Section */}
      <Section icon={Briefcase} title="Position Information">
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
          {formData.title && formData.title.length < 3 && (
            <p className="text-xs text-amber-600 flex items-center gap-1.5 mt-2">
              <AlertCircle className="w-3.5 h-3.5" />
              Title should be at least 3 characters
            </p>
          )}
        </div>

        <FieldGroup cols={3}>
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
      </Section>

      {/* Employment Type */}
      <Section icon={Briefcase} title="Employment Type" className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {JOB_TYPES.map((type) => (
            <SelectCard
              key={type.value}
              selected={formData.jobType === type.value}
              onClick={() => setFormData({ jobType: type.value })}
            >
              <span className="text-sm font-semibold text-charcoal-800">{type.label}</span>
            </SelectCard>
          ))}
        </div>
      </Section>

      {/* Priority Level */}
      <Section icon={Zap} title="Priority Level">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRIORITY_LEVELS.map((level) => {
            const isSelected = formData.priority === level.value
            const priorityStyles = {
              urgent: {
                selected: 'border-red-400 bg-gradient-to-br from-red-50 to-rose-50',
                icon: <Clock className="w-4 h-4 text-red-500" />,
                text: 'text-red-600',
              },
              high: {
                selected: 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50',
                icon: <TrendingUp className="w-4 h-4 text-amber-500" />,
                text: 'text-amber-600',
              },
              normal: {
                selected: 'border-blue-400 bg-gradient-to-br from-blue-50 to-sky-50',
                icon: <Briefcase className="w-4 h-4 text-blue-500" />,
                text: 'text-blue-600',
              },
              low: {
                selected: 'border-charcoal-300 bg-gradient-to-br from-charcoal-50 to-slate-50',
                icon: <Calendar className="w-4 h-4 text-charcoal-400" />,
                text: 'text-charcoal-600',
              },
            }
            const styles = priorityStyles[level.value as keyof typeof priorityStyles]

            return (
              <button
                key={level.value}
                type="button"
                onClick={() => setFormData({ priority: level.value })}
                className={cn(
                  'relative p-4 rounded-xl border-2 text-left transition-all duration-300 overflow-hidden',
                  isSelected
                    ? styles.selected
                    : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50/50'
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className={cn('w-5 h-5', styles.text)} />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-1">
                  {styles.icon}
                  <span className={cn('text-sm font-semibold capitalize', isSelected ? styles.text : 'text-charcoal-800')}>
                    {level.value}
                  </span>
                </div>
                <span className="text-xs text-charcoal-500 block">
                  {level.value === 'urgent' && 'ASAP, <2 weeks'}
                  {level.value === 'high' && 'Within 30 days'}
                  {level.value === 'normal' && '30-60 days'}
                  {level.value === 'low' && '60+ days'}
                </span>
              </button>
            )
          })}
        </div>
      </Section>

      {/* Validation Summary */}
      {(!formData.accountId || !formData.title || formData.title.length < 3) && (
        <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl animate-fade-in">
          <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Complete these to continue
          </h4>
          <ul className="space-y-2">
            {!formData.accountId && (
              <li className="flex items-center gap-3 text-sm text-amber-700">
                <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-xs font-semibold">1</span>
                Select a client account
              </li>
            )}
            {(!formData.title || formData.title.length < 3) && (
              <li className="flex items-center gap-3 text-sm text-amber-700">
                <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-xs font-semibold">2</span>
                Enter a job title (at least 3 characters)
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
