'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateAccountStore, INDUSTRIES, COMPANY_TYPES, PARTNERSHIP_TIERS, COMPANY_SEGMENTS } from '@/stores/create-account-store'
import { Section, FieldGroup } from './shared'
import { cn } from '@/lib/utils'
import {
  Briefcase,
  Layers,
  Crown,
  Building,
  CheckCircle2,
  Users,
  Building2,
  Star,
  Sparkles,
  BarChart3,
  Calendar
} from 'lucide-react'

// Selector Components (Local)

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
          </button>
        )
      })}
    </div>
  )
}

export function AccountIntakeStep2Classification() {
  const { formData, setFormData, toggleIndustry } = useCreateAccountStore()
  const isPerson = formData.accountType === 'person'

  return (
    <div className="space-y-10">
      {/* Industries */}
      <Section
        icon={Layers}
        title="Industries"
        subtitle="Select all industries this entity operates in"
      >
        <IndustrySelector
          selected={formData.industries}
          onToggle={toggleIndustry}
        />
      </Section>

      {/* Classification Details */}
      <Section
        icon={Briefcase}
        title="Classification"
        subtitle="Business categorization"
      >
         <FieldGroup cols={2}>
            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Company Type</Label>
               <CompanyTypeSelector
                  selected={formData.companyType}
                  onChange={(value) =>
                    setFormData({
                      companyType: value as typeof formData.companyType,
                    })
                  }
                />
            </div>
             <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Partnership Tier</Label>
              <TierSelector
                  selected={formData.tier}
                  onChange={(value) =>
                    setFormData({ tier: value as typeof formData.tier })
                  }
                />
            </div>
         </FieldGroup>

         <div className="mt-6">
           <Label className="text-charcoal-700 font-medium mb-3 block">Market Segment</Label>
           <SegmentSelector
              selected={formData.segment}
              onChange={(value) =>
                setFormData({ segment: value as typeof formData.segment })
              }
            />
         </div>
      </Section>

      {!isPerson && (
        <Section icon={BarChart3} title="Company Metrics">
          <FieldGroup cols={3}>
            <div className="space-y-2">
              <Label htmlFor="employeeCount" className="text-charcoal-700 font-medium">Employee Count</Label>
              <Select
                value={formData.employeeCount}
                onValueChange={(v) => setFormData({ employeeCount: v })}
              >
                <SelectTrigger id="employeeCount" className="h-12 rounded-xl border-charcoal-200 bg-white">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10</SelectItem>
                  <SelectItem value="11-50">11-50</SelectItem>
                  <SelectItem value="51-200">51-200</SelectItem>
                  <SelectItem value="201-500">201-500</SelectItem>
                  <SelectItem value="501-1000">501-1000</SelectItem>
                  <SelectItem value="1000+">1000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="revenueRange" className="text-charcoal-700 font-medium">Annual Revenue</Label>
              <Select
                value={formData.revenueRange}
                onValueChange={(v) => setFormData({ revenueRange: v })}
              >
                <SelectTrigger id="revenueRange" className="h-12 rounded-xl border-charcoal-200 bg-white">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="<1M">&lt; $1M</SelectItem>
                  <SelectItem value="1M-10M">$1M - $10M</SelectItem>
                  <SelectItem value="10M-50M">$10M - $50M</SelectItem>
                  <SelectItem value="50M-100M">$50M - $100M</SelectItem>
                  <SelectItem value="100M+">$100M+</SelectItem>
                </SelectContent>
              </Select>
            </div>

             <div className="space-y-2">
              <Label htmlFor="foundedYear" className="text-charcoal-700 font-medium">Founded Year</Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  id="foundedYear"
                  type="number"
                  value={formData.foundedYear}
                  onChange={(e) => setFormData({ foundedYear: e.target.value })}
                  placeholder="YYYY"
                  className="pl-11 h-12 rounded-xl border-charcoal-200 bg-white"
                />
              </div>
            </div>
          </FieldGroup>

           <div className="mt-4 space-y-2">
              <Label htmlFor="ownershipType" className="text-charcoal-700 font-medium">Ownership Type</Label>
              <Select
                value={formData.ownershipType}
                onValueChange={(v) => setFormData({ ownershipType: v })}
              >
                <SelectTrigger id="ownershipType" className="h-12 rounded-xl border-charcoal-200 bg-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="non_profit">Non-Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </Section>
      )}
    </div>
  )
}

