'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  useCreateAccountStore,
  INDUSTRIES,
  COMPANY_TYPES,
  PARTNERSHIP_TIERS,
  COMPANY_SEGMENTS,
} from '@/stores/create-account-store'
import { OPERATING_COUNTRIES, getStatesByCountry } from '@/components/addresses'
import { cn } from '@/lib/utils'
import {
  Building2,
  Globe,
  MapPin,
  Linkedin,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Crown,
  Star,
  Briefcase,
  Users,
  Building,
  Layers,
} from 'lucide-react'

// Section wrapper component for consistent styling
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

// Premium industry selector with pills
function IndustrySelector({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (industry: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {INDUSTRIES.map((ind) => {
        const isSelected = selected.includes(ind.value)
        return (
          <button
            key={ind.value}
            type="button"
            onClick={() => onToggle(ind.value)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
              isSelected
                ? 'bg-gradient-to-r from-hublot-800 to-hublot-900 text-white shadow-lg shadow-hublot-900/20 scale-105'
                : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200 hover:scale-102'
            )}
          >
            <span className="text-base">{ind.icon}</span>
            {ind.label}
            {isSelected && <CheckCircle2 className="w-4 h-4 ml-1" />}
          </button>
        )
      })}
    </div>
  )
}

// Company type selector cards
function CompanyTypeSelector({
  selected,
  onChange,
}: {
  selected: string
  onChange: (value: string) => void
}) {
  const icons = {
    direct_client: Building2,
    implementation_partner: Users,
    staffing_vendor: Building,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COMPANY_TYPES.map((type) => {
        const isSelected = selected === type.value
        const Icon = icons[type.value as keyof typeof icons]

        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={cn(
              'relative p-5 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden group',
              isSelected
                ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50 shadow-gold-glow'
                : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50/50 hover:shadow-elevation-xs'
            )}
          >
            {isSelected && (
              <div className="absolute top-3 right-3">
                <CheckCircle2 className="w-5 h-5 text-gold-500" />
              </div>
            )}
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all',
                isSelected
                  ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-gold-glow'
                  : 'bg-charcoal-100 text-charcoal-500 group-hover:bg-charcoal-200'
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
            <span
              className={cn(
                'text-sm font-semibold block',
                isSelected ? 'text-gold-700' : 'text-charcoal-800'
              )}
            >
              {type.label}
            </span>
            <span className="text-xs text-charcoal-500 block mt-1">
              {type.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// Partnership tier selector
function TierSelector({
  selected,
  onChange,
}: {
  selected: string
  onChange: (value: string) => void
}) {
  const tierIcons = {
    preferred: Star,
    strategic: Sparkles,
    exclusive: Crown,
  }

  const tierColors = {
    preferred: {
      selected: 'border-blue-400 bg-gradient-to-br from-blue-50 to-sky-50',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-700',
    },
    strategic: {
      selected: 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50',
      icon: 'bg-gold-100 text-gold-600',
      text: 'text-gold-700',
    },
    exclusive: {
      selected: 'border-purple-400 bg-gradient-to-br from-purple-50 to-violet-50',
      icon: 'bg-purple-100 text-purple-600',
      text: 'text-purple-700',
    },
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {PARTNERSHIP_TIERS.map((tier) => {
        const isSelected = selected === tier.value
        const Icon = tierIcons[tier.value as keyof typeof tierIcons]
        const colors = tierColors[tier.value as keyof typeof tierColors]

        return (
          <button
            key={tier.value}
            type="button"
            onClick={() => onChange(isSelected ? '' : tier.value)}
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
              {tier.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// Company segment selector
function SegmentSelector({
  selected,
  onChange,
}: {
  selected: string
  onChange: (value: string) => void
}) {
  const segmentColors = {
    enterprise: {
      selected: 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-violet-50',
      icon: 'bg-indigo-100 text-indigo-600',
      text: 'text-indigo-700',
    },
    mid_market: {
      selected: 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50',
      icon: 'bg-emerald-100 text-emerald-600',
      text: 'text-emerald-700',
    },
    smb: {
      selected: 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50',
      icon: 'bg-amber-100 text-amber-600',
      text: 'text-amber-700',
    },
    startup: {
      selected: 'border-rose-400 bg-gradient-to-br from-rose-50 to-pink-50',
      icon: 'bg-rose-100 text-rose-600',
      text: 'text-rose-700',
    },
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {COMPANY_SEGMENTS.map((segment) => {
        const isSelected = selected === segment.value
        const colors = segmentColors[segment.value as keyof typeof segmentColors]

        return (
          <button
            key={segment.value}
            type="button"
            onClick={() => onChange(isSelected ? '' : segment.value)}
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
            <div className="text-2xl mb-2">{segment.icon}</div>
            <span
              className={cn(
                'text-sm font-semibold block',
                isSelected ? colors.text : 'text-charcoal-700'
              )}
            >
              {segment.label}
            </span>
            <span className="text-xs text-charcoal-500 block mt-1">
              {segment.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function AccountIntakeStep1Basics() {
  const { formData, setFormData, toggleIndustry } = useCreateAccountStore()

  const isValid = formData.name.length >= 2 && formData.industries.length > 0

  return (
    <div className="space-y-10">
      {/* Company Identity Section */}
      <Section
        icon={Building2}
        title="Company Identity"
        subtitle="Basic company information"
      >
        <div className="space-y-2">
          <Label htmlFor="name" className="text-charcoal-700 font-medium">
            Company Name <span className="text-gold-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            placeholder="e.g., Acme Corporation, TechVentures Inc."
            className="h-14 text-lg rounded-xl border-charcoal-200 bg-white placeholder:text-charcoal-300 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400"
          />
          {formData.name && formData.name.length < 2 && (
            <p className="text-xs text-amber-600 flex items-center gap-1.5 mt-2">
              <AlertCircle className="w-3.5 h-3.5" />
              Company name should be at least 2 characters
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-charcoal-700 font-medium">
            Industries <span className="text-gold-500">*</span>
          </Label>
          <p className="text-xs text-charcoal-500">
            Select all industries this company operates in
          </p>
          <IndustrySelector
            selected={formData.industries}
            onToggle={toggleIndustry}
          />
        </div>
      </Section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs text-charcoal-400 uppercase tracking-wider">
            Relationship Type
          </span>
        </div>
      </div>

      {/* Company Type Section */}
      <Section
        icon={Briefcase}
        title="Company Type"
        subtitle="How will you engage with this company?"
      >
        <CompanyTypeSelector
          selected={formData.companyType}
          onChange={(value) =>
            setFormData({
              companyType: value as typeof formData.companyType,
            })
          }
        />
      </Section>

      {/* Partnership Tier */}
      <Section
        icon={Crown}
        title="Partnership Tier"
        subtitle="Optional - Set the partnership level"
      >
        <TierSelector
          selected={formData.tier}
          onChange={(value) =>
            setFormData({ tier: value as typeof formData.tier })
          }
        />
      </Section>

      {/* Company Segment */}
      <Section
        icon={Layers}
        title="Company Segment"
        subtitle="Optional - Categorize by company size"
      >
        <SegmentSelector
          selected={formData.segment}
          onChange={(value) =>
            setFormData({ segment: value as typeof formData.segment })
          }
        />
      </Section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs text-charcoal-400 uppercase tracking-wider">
            Contact Information
          </span>
        </div>
      </div>

      {/* Contact Details Section */}
      <Section icon={Globe} title="Digital Presence">
        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="website" className="text-charcoal-700 font-medium">
              Website
            </Label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ website: e.target.value })}
                placeholder="https://example.com"
                className="pl-11 h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="linkedinUrl"
              className="text-charcoal-700 font-medium"
            >
              LinkedIn URL
            </Label>
            <div className="relative">
              <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <Input
                id="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/company/..."
                className="pl-11 h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
          </div>
        </FieldGroup>

        <div className="space-y-2">
          <PhoneInput
            label="Company Phone"
            value={formData.phone}
            onChange={(phone) => setFormData({ phone })}
          />
        </div>
      </Section>

      {/* Headquarters Location Section */}
      <Section
        icon={MapPin}
        title="Headquarters Location"
        subtitle="Primary office address"
      >
        <div className="p-6 bg-gradient-to-br from-charcoal-50/50 to-white border border-charcoal-100 rounded-2xl space-y-5">
          {/* Street Address */}
          <div className="space-y-2">
            <Label
              htmlFor="hqStreetAddress"
              className="text-charcoal-700 font-medium"
            >
              Street Address
            </Label>
            <Input
              id="hqStreetAddress"
              value={formData.hqStreetAddress}
              onChange={(e) => setFormData({ hqStreetAddress: e.target.value })}
              placeholder="123 Main Street, Suite 400"
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>

          <FieldGroup cols={3}>
            <div className="space-y-2">
              <Label htmlFor="hqCity" className="text-charcoal-700 font-medium">
                City
              </Label>
              <Input
                id="hqCity"
                value={formData.hqCity}
                onChange={(e) => setFormData({ hqCity: e.target.value })}
                placeholder="San Francisco"
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hqState" className="text-charcoal-700 font-medium">
                State/Province
              </Label>
              <Select
                value={formData.hqState}
                onValueChange={(v) => setFormData({ hqState: v })}
              >
                <SelectTrigger
                  id="hqState"
                  className="h-12 rounded-xl border-charcoal-200 bg-white"
                >
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {getStatesByCountry(formData.hqCountry).map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="hqCountry"
                className="text-charcoal-700 font-medium"
              >
                Country
              </Label>
              <Select
                value={formData.hqCountry}
                onValueChange={(v) =>
                  setFormData({ hqCountry: v, hqState: '' })
                }
              >
                <SelectTrigger
                  id="hqCountry"
                  className="h-12 rounded-xl border-charcoal-200 bg-white"
                >
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {OPERATING_COUNTRIES.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldGroup>
        </div>
      </Section>

      {/* Company Description */}
      <Section icon={FileText} title="Company Description">
        <div className="space-y-2">
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ description: e.target.value })}
            placeholder="Brief description of the company, what they do, and their key business areas..."
            className="min-h-[120px] rounded-xl border-charcoal-200 bg-white resize-none"
          />
          <p className="text-xs text-charcoal-400">
            {formData.description.length}/500 characters
          </p>
        </div>
      </Section>

      {/* Validation Summary */}
      {!isValid && (
        <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl animate-fade-in">
          <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Complete these to continue
          </h4>
          <ul className="space-y-2">
            {formData.name.length < 2 && (
              <li className="flex items-center gap-3 text-sm text-amber-700">
                <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-xs font-semibold">
                  1
                </span>
                Enter a company name (at least 2 characters)
              </li>
            )}
            {formData.industries.length === 0 && (
              <li className="flex items-center gap-3 text-sm text-amber-700">
                <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-xs font-semibold">
                  2
                </span>
                Select at least one industry
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}


