'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  useCreateAccountStore,
  CONTACT_METHODS,
  MEETING_CADENCES,
} from '@/stores/create-account-store'
import { cn } from '@/lib/utils'
import {
  User,
  Mail,
  Briefcase,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Info,
  Phone,
  MessageCircle,
  Video,
} from 'lucide-react'

// Section wrapper component
function Section({
  icon: Icon,
  title,
  subtitle,
  children,
  className,
}: {
  icon?: React.ElementType
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-100 to-amber-100 flex items-center justify-center shadow-sm">
            <Icon className="w-5 h-5 text-gold-600" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-charcoal-800 uppercase tracking-wider">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-charcoal-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

// Field group for better organization
function FieldGroup({
  children,
  cols = 2,
}: {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  }
  return <div className={cn('grid gap-5', gridCols[cols])}>{children}</div>
}

// Info notice component
function InfoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-xl">
      <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
      <p className="text-sm text-blue-700">{children}</p>
    </div>
  )
}

// Contact method selector
function ContactMethodSelector({
  selected,
  onChange,
}: {
  selected: string
  onChange: (value: string) => void
}) {
  const methodIcons = {
    email: Mail,
    phone: Phone,
    slack: MessageCircle,
    teams: Video,
  }

  const methodColors = {
    email: {
      selected: 'border-blue-400 bg-gradient-to-br from-blue-50 to-sky-50',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-700',
    },
    phone: {
      selected: 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50',
      icon: 'bg-green-100 text-green-600',
      text: 'text-green-700',
    },
    slack: {
      selected: 'border-purple-400 bg-gradient-to-br from-purple-50 to-violet-50',
      icon: 'bg-purple-100 text-purple-600',
      text: 'text-purple-700',
    },
    teams: {
      selected: 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-blue-50',
      icon: 'bg-indigo-100 text-indigo-600',
      text: 'text-indigo-700',
    },
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {CONTACT_METHODS.map((method) => {
        const isSelected = selected === method.value
        const Icon = methodIcons[method.value as keyof typeof methodIcons]
        const colors = methodColors[method.value as keyof typeof methodColors]

        return (
          <button
            key={method.value}
            type="button"
            onClick={() => onChange(method.value)}
            className={cn(
              'relative p-4 rounded-xl border-2 text-center transition-all duration-300 overflow-hidden group',
              isSelected
                ? colors.selected + ' shadow-lg'
                : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50/50'
            )}
          >
            {isSelected && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className={cn('w-4 h-4', colors.text)} />
              </div>
            )}
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 transition-all',
                isSelected ? colors.icon : 'bg-charcoal-100 text-charcoal-400'
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span
              className={cn(
                'text-sm font-semibold',
                isSelected ? colors.text : 'text-charcoal-700'
              )}
            >
              {method.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// Meeting cadence selector
function MeetingCadenceSelector({
  selected,
  onChange,
}: {
  selected: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {MEETING_CADENCES.map((cadence) => {
        const isSelected = selected === cadence.value
        return (
          <button
            key={cadence.value}
            type="button"
            onClick={() => onChange(cadence.value)}
            className={cn(
              'relative p-3 rounded-xl border-2 text-center transition-all duration-300',
              isSelected
                ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50 shadow-gold-glow'
                : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50/50'
            )}
          >
            {isSelected && (
              <div className="absolute -top-1 -right-1">
                <CheckCircle2 className="w-4 h-4 text-gold-500 bg-white rounded-full" />
              </div>
            )}
            <span
              className={cn(
                'text-xs font-semibold',
                isSelected ? 'text-gold-700' : 'text-charcoal-700'
              )}
            >
              {cadence.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function AccountIntakeStep3Contact() {
  const { formData, setFormData } = useCreateAccountStore()

  return (
    <div className="space-y-10">
      {/* Info Notice */}
      <InfoNotice>
        Adding a primary contact is optional. You can add additional contacts
        later from the account detail page.
      </InfoNotice>

      {/* Primary Contact Section */}
      <Section
        icon={User}
        title="Primary Contact"
        subtitle="Main point of contact for this account"
      >
        <div className="p-6 bg-gradient-to-br from-charcoal-50/50 to-white border border-charcoal-100 rounded-2xl space-y-5">
          <FieldGroup cols={2}>
            <div className="space-y-2">
              <Label
                htmlFor="primaryContactName"
                className="text-charcoal-700 font-medium"
              >
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  id="primaryContactName"
                  value={formData.primaryContactName}
                  onChange={(e) =>
                    setFormData({ primaryContactName: e.target.value })
                  }
                  placeholder="John Smith"
                  className="pl-11 h-12 rounded-xl border-charcoal-200 bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="primaryContactTitle"
                className="text-charcoal-700 font-medium"
              >
                Title / Role
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  id="primaryContactTitle"
                  value={formData.primaryContactTitle}
                  onChange={(e) =>
                    setFormData({ primaryContactTitle: e.target.value })
                  }
                  placeholder="VP of Engineering, Hiring Manager"
                  className="pl-11 h-12 rounded-xl border-charcoal-200 bg-white"
                />
              </div>
            </div>
          </FieldGroup>

          <FieldGroup cols={2}>
            <div className="space-y-2">
              <Label
                htmlFor="primaryContactEmail"
                className="text-charcoal-700 font-medium"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  id="primaryContactEmail"
                  type="email"
                  value={formData.primaryContactEmail}
                  onChange={(e) =>
                    setFormData({ primaryContactEmail: e.target.value })
                  }
                  placeholder="john.smith@company.com"
                  className="pl-11 h-12 rounded-xl border-charcoal-200 bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <PhoneInput
                label="Phone Number"
                value={formData.primaryContactPhone}
                onChange={(primaryContactPhone) =>
                  setFormData({ primaryContactPhone })
                }
              />
            </div>
          </FieldGroup>
        </div>
      </Section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs text-charcoal-400 uppercase tracking-wider">
            Communication Preferences
          </span>
        </div>
      </div>

      {/* Communication Preferences Section */}
      <Section
        icon={MessageSquare}
        title="Preferred Contact Method"
        subtitle="How does this contact prefer to be reached?"
      >
        <ContactMethodSelector
          selected={formData.preferredContactMethod}
          onChange={(value) =>
            setFormData({
              preferredContactMethod:
                value as typeof formData.preferredContactMethod,
            })
          }
        />
      </Section>

      {/* Meeting Cadence Section */}
      <Section
        icon={Calendar}
        title="Meeting Cadence"
        subtitle="How often should you meet with this client?"
      >
        <MeetingCadenceSelector
          selected={formData.meetingCadence}
          onChange={(value) =>
            setFormData({
              meetingCadence: value as typeof formData.meetingCadence,
            })
          }
        />

        {/* Cadence description */}
        <div
          className={cn(
            'p-4 rounded-xl transition-all duration-300',
            formData.meetingCadence === 'daily'
              ? 'bg-red-50 border border-red-200'
              : formData.meetingCadence === 'weekly'
                ? 'bg-amber-50 border border-amber-200'
                : formData.meetingCadence === 'biweekly'
                  ? 'bg-blue-50 border border-blue-200'
                  : formData.meetingCadence === 'monthly'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-charcoal-50 border border-charcoal-200'
          )}
        >
          <div className="flex items-center gap-3">
            <Calendar
              className={cn(
                'w-5 h-5',
                formData.meetingCadence === 'daily'
                  ? 'text-red-500'
                  : formData.meetingCadence === 'weekly'
                    ? 'text-amber-500'
                    : formData.meetingCadence === 'biweekly'
                      ? 'text-blue-500'
                      : formData.meetingCadence === 'monthly'
                        ? 'text-green-500'
                        : 'text-charcoal-500'
              )}
            />
            <div>
              <span
                className={cn(
                  'text-sm font-semibold',
                  formData.meetingCadence === 'daily'
                    ? 'text-red-700'
                    : formData.meetingCadence === 'weekly'
                      ? 'text-amber-700'
                      : formData.meetingCadence === 'biweekly'
                        ? 'text-blue-700'
                        : formData.meetingCadence === 'monthly'
                          ? 'text-green-700'
                          : 'text-charcoal-700'
                )}
              >
                {formData.meetingCadence === 'daily' && 'High-touch engagement'}
                {formData.meetingCadence === 'weekly' && 'Standard engagement'}
                {formData.meetingCadence === 'biweekly' &&
                  'Regular check-ins'}
                {formData.meetingCadence === 'monthly' &&
                  'Monthly reviews'}
                {formData.meetingCadence === 'quarterly' &&
                  'Quarterly business reviews'}
              </span>
              <p
                className={cn(
                  'text-xs mt-0.5',
                  formData.meetingCadence === 'daily'
                    ? 'text-red-600'
                    : formData.meetingCadence === 'weekly'
                      ? 'text-amber-600'
                      : formData.meetingCadence === 'biweekly'
                        ? 'text-blue-600'
                        : formData.meetingCadence === 'monthly'
                          ? 'text-green-600'
                          : 'text-charcoal-600'
                )}
              >
                {formData.meetingCadence === 'daily' &&
                  'Best for urgent hiring needs or critical projects'}
                {formData.meetingCadence === 'weekly' &&
                  'Recommended for active accounts with ongoing needs'}
                {formData.meetingCadence === 'biweekly' &&
                  'Good balance for established relationships'}
                {formData.meetingCadence === 'monthly' &&
                  'Suitable for steady-state accounts'}
                {formData.meetingCadence === 'quarterly' &&
                  'Strategic reviews for long-term partnerships'}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Summary Preview */}
      {(formData.primaryContactName || formData.primaryContactEmail) && (
        <div className="p-6 bg-gradient-to-br from-forest-50 to-emerald-50 border border-forest-200 rounded-2xl animate-fade-in">
          <h4 className="text-sm font-semibold text-forest-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-forest-500" />
            Contact Preview
          </h4>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-forest-400 to-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {formData.primaryContactName
                ? formData.primaryContactName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : '?'}
            </div>
            <div>
              <p className="font-semibold text-forest-900">
                {formData.primaryContactName || 'No name entered'}
              </p>
              {formData.primaryContactTitle && (
                <p className="text-sm text-forest-700">
                  {formData.primaryContactTitle}
                </p>
              )}
              {formData.primaryContactEmail && (
                <p className="text-sm text-forest-600 flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {formData.primaryContactEmail}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


