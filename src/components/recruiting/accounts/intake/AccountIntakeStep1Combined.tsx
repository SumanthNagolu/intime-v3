'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useCreateAccountStore,
  INDUSTRIES,
  COMPANY_TYPES,
  PARTNERSHIP_TIERS,
  COMPANY_SEGMENTS,
} from '@/stores/create-account-store'
import { Section, FieldGroup } from './shared'
import { cn } from '@/lib/utils'
import {
  Building2,
  Globe,
  Linkedin,
  FileText,
  User,
  Hash,
  Mail,
  AlertCircle,
  CheckCircle2,
  Layers,
  Crown,
  Star,
  Briefcase,
} from 'lucide-react'

export function AccountIntakeStep1Combined() {
  const { formData, setFormData, toggleIndustry } = useCreateAccountStore()
  const isPerson = formData.accountType === 'person'

  const handleTypeSelect = (type: 'company' | 'person') => {
    setFormData({ accountType: type })
  }

  return (
    <div className="space-y-10">
      {/* Account Type Selection */}
      <Section
        icon={Building2}
        title="Account Type"
        subtitle="Select the entity type for this account"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Card */}
          <button
            type="button"
            onClick={() => handleTypeSelect('company')}
            className={cn(
              'relative p-6 rounded-xl border-2 text-left transition-all duration-300 group hover:shadow-elevation-sm',
              formData.accountType === 'company'
                ? 'border-gold-400 bg-gradient-to-br from-gold-50/50 to-white shadow-gold-glow'
                : 'border-charcoal-100 bg-white hover:border-gold-200'
            )}
          >
            {formData.accountType === 'company' && (
              <div className="absolute top-3 right-3">
                <CheckCircle2 className="w-5 h-5 text-gold-500" />
              </div>
            )}
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors',
                formData.accountType === 'company'
                  ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-gold-glow'
                  : 'bg-charcoal-50 text-charcoal-400 group-hover:bg-gold-50 group-hover:text-gold-500'
              )}
            >
              <Building2 className="w-6 h-6" />
            </div>
            <h3
              className={cn(
                'text-lg font-bold mb-1',
                formData.accountType === 'company'
                  ? 'text-charcoal-900'
                  : 'text-charcoal-700'
              )}
            >
              Company Account
            </h3>
            <p className="text-sm text-charcoal-500">
              Business entities with multiple contacts and billing
            </p>
          </button>

          {/* Person Card */}
          <button
            type="button"
            onClick={() => handleTypeSelect('person')}
            className={cn(
              'relative p-6 rounded-xl border-2 text-left transition-all duration-300 group hover:shadow-elevation-sm',
              formData.accountType === 'person'
                ? 'border-gold-400 bg-gradient-to-br from-gold-50/50 to-white shadow-gold-glow'
                : 'border-charcoal-100 bg-white hover:border-gold-200'
            )}
          >
            {formData.accountType === 'person' && (
              <div className="absolute top-3 right-3">
                <CheckCircle2 className="w-5 h-5 text-gold-500" />
              </div>
            )}
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors',
                formData.accountType === 'person'
                  ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-gold-glow'
                  : 'bg-charcoal-50 text-charcoal-400 group-hover:bg-gold-50 group-hover:text-gold-500'
              )}
            >
              <User className="w-6 h-6" />
            </div>
            <h3
              className={cn(
                'text-lg font-bold mb-1',
                formData.accountType === 'person'
                  ? 'text-charcoal-900'
                  : 'text-charcoal-700'
              )}
            >
              Person Account
            </h3>
            <p className="text-sm text-charcoal-500">
              Individual consultant or sole proprietor
            </p>
          </button>
        </div>
      </Section>

      {/* Core Identity */}
      <Section
        icon={isPerson ? User : Building2}
        title={isPerson ? 'Personal Identity' : 'Company Identity'}
        subtitle={isPerson ? 'Basic personal information' : 'Legal entity details'}
      >
        <div className="space-y-2">
          <Label htmlFor="name" className="text-charcoal-700 font-medium">
            {isPerson ? 'Full Name' : 'Company Name'}{' '}
            <span className="text-gold-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            placeholder={isPerson ? 'e.g., Jane Doe' : 'e.g., Acme Corporation'}
            className="h-14 text-lg rounded-xl border-charcoal-200 bg-white placeholder:text-charcoal-300 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400"
          />
          {formData.name && formData.name.length < 2 && (
            <p className="text-xs text-amber-600 flex items-center gap-1.5 mt-2">
              <AlertCircle className="w-3.5 h-3.5" />
              Name should be at least 2 characters
            </p>
          )}
        </div>

        {!isPerson && (
          <FieldGroup cols={2}>
            <div className="space-y-2">
              <Label htmlFor="legalName" className="text-charcoal-700 font-medium">
                Legal Name
              </Label>
              <Input
                id="legalName"
                value={formData.legalName}
                onChange={(e) => setFormData({ legalName: e.target.value })}
                placeholder="e.g., Acme International, LLC"
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dba" className="text-charcoal-700 font-medium">
                DBA (Doing Business As)
              </Label>
              <Input
                id="dba"
                value={formData.dba}
                onChange={(e) => setFormData({ dba: e.target.value })}
                placeholder="e.g., Acme Tech"
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
          </FieldGroup>
        )}
      </Section>

      {/* Classification Section - Dropdowns */}
      <Section
        icon={Layers}
        title="Classification"
        subtitle="Business categorization and tier"
      >
        {/* Industries - Multi-select chips */}
        <div className="space-y-2">
          <Label className="text-charcoal-700 font-medium">
            Industries <span className="text-gold-500">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((ind) => {
              const isSelected = formData.industries.includes(ind.value)
              return (
                <button
                  key={ind.value}
                  type="button"
                  onClick={() => toggleIndustry(ind.value)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                    isSelected
                      ? 'bg-gradient-to-r from-hublot-800 to-hublot-900 text-white shadow-sm'
                      : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
                  )}
                >
                  <span>{ind.icon}</span>
                  {ind.label}
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
                </button>
              )
            })}
          </div>
        </div>

        <FieldGroup cols={3}>
          <div className="space-y-2">
            <Label htmlFor="companyType" className="text-charcoal-700 font-medium">
              <Briefcase className="w-4 h-4 inline-block mr-1.5 text-charcoal-400" />
              Company Type
            </Label>
            <Select
              value={formData.companyType}
              onValueChange={(v) =>
                setFormData({ companyType: v as typeof formData.companyType })
              }
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier" className="text-charcoal-700 font-medium">
              <Crown className="w-4 h-4 inline-block mr-1.5 text-charcoal-400" />
              Partnership Tier
            </Label>
            <Select
              value={formData.tier || 'none'}
              onValueChange={(v) =>
                setFormData({ tier: v === 'none' ? '' : (v as typeof formData.tier) })
              }
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No tier assigned</SelectItem>
                {PARTNERSHIP_TIERS.map((tier) => (
                  <SelectItem key={tier.value} value={tier.value}>
                    <div className="flex items-center gap-2">
                      <Star
                        className={cn(
                          'w-4 h-4',
                          tier.value === 'preferred'
                            ? 'text-blue-500'
                            : tier.value === 'strategic'
                              ? 'text-gold-500'
                              : 'text-purple-500'
                        )}
                      />
                      {tier.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="segment" className="text-charcoal-700 font-medium">
              <Layers className="w-4 h-4 inline-block mr-1.5 text-charcoal-400" />
              Market Segment
            </Label>
            <Select
              value={formData.segment || 'none'}
              onValueChange={(v) =>
                setFormData({
                  segment: v === 'none' ? '' : (v as typeof formData.segment),
                })
              }
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No segment assigned</SelectItem>
                {COMPANY_SEGMENTS.map((seg) => (
                  <SelectItem key={seg.value} value={seg.value}>
                    <div className="flex items-center gap-2">
                      <span>{seg.icon}</span>
                      {seg.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FieldGroup>
      </Section>

      {/* Tax & Contact */}
      <Section icon={Hash} title="Registration & Contact">
        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="taxId" className="text-charcoal-700 font-medium">
              {isPerson ? 'SSN / Tax ID (Optional)' : 'Tax ID (EIN)'}
            </Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => setFormData({ taxId: e.target.value })}
              placeholder={isPerson ? 'XXX-XX-XXXX' : 'XX-XXXXXXX'}
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-charcoal-700 font-medium">
              Primary Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ email: e.target.value })}
                placeholder="contact@example.com"
                className="pl-11 h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
          </div>
        </FieldGroup>
        <div className="space-y-2">
          <PhoneInput
            label="Primary Phone"
            value={formData.phone}
            onChange={(phone) => setFormData({ phone })}
          />
        </div>
      </Section>

      {/* Digital Presence */}
      <Section icon={Globe} title="Digital Presence">
        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="website" className="text-charcoal-700 font-medium">
              {isPerson ? 'Personal Website / Portfolio' : 'Company Website'}
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
            <Label htmlFor="linkedinUrl" className="text-charcoal-700 font-medium">
              LinkedIn URL
            </Label>
            <div className="relative">
              <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <Input
                id="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ linkedinUrl: e.target.value })}
                placeholder={
                  isPerson
                    ? 'https://linkedin.com/in/...'
                    : 'https://linkedin.com/company/...'
                }
                className="pl-11 h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
          </div>
        </FieldGroup>
      </Section>

      {/* Description */}
      <Section
        icon={FileText}
        title={isPerson ? 'Bio / Summary' : 'Company Description'}
      >
        <div className="space-y-2">
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ description: e.target.value })}
            placeholder={
              isPerson
                ? 'Brief professional summary...'
                : 'Brief description of the company, what they do, and their key business areas...'
            }
            className="min-h-[120px] rounded-xl border-charcoal-200 bg-white resize-none"
          />
          <p className="text-xs text-charcoal-400">
            {formData.description.length}/500 characters
          </p>
        </div>
      </Section>
    </div>
  )
}

