'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PhoneInput } from '@/components/ui/phone-input'
import { useCreateAccountStore } from '@/stores/create-account-store'
import { Section, FieldGroup } from './shared'
import {
  Building2,
  Globe,
  Linkedin,
  FileText,
  User,
  Hash,
  Mail,
  AlertCircle
} from 'lucide-react'

export function AccountIntakeStep1Identity() {
  const { formData, setFormData } = useCreateAccountStore()
  const isPerson = formData.accountType === 'person'

  return (
    <div className="space-y-10">
      {/* Core Identity */}
      <Section
        icon={isPerson ? User : Building2}
        title={isPerson ? "Personal Identity" : "Company Identity"}
        subtitle={isPerson ? "Basic personal information" : "Legal entity details"}
      >
        <div className="space-y-2">
          <Label htmlFor="name" className="text-charcoal-700 font-medium">
            {isPerson ? "Full Name" : "Company Name"} <span className="text-gold-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            placeholder={isPerson ? "e.g., Jane Doe" : "e.g., Acme Corporation"}
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

      {/* Tax & Contact */}
      <Section icon={Hash} title="Registration & Contact">
        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="taxId" className="text-charcoal-700 font-medium">
              {isPerson ? "SSN / Tax ID (Optional)" : "Tax ID (EIN)"}
            </Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => setFormData({ taxId: e.target.value })}
              placeholder={isPerson ? "XXX-XX-XXXX" : "XX-XXXXXXX"}
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
              {isPerson ? "Personal Website / Portfolio" : "Company Website"}
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
                placeholder={isPerson ? "https://linkedin.com/in/..." : "https://linkedin.com/company/..."}
                className="pl-11 h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
          </div>
        </FieldGroup>
      </Section>

      {/* Description */}
      <Section icon={FileText} title={isPerson ? "Bio / Summary" : "Company Description"}>
        <div className="space-y-2">
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ description: e.target.value })}
            placeholder={isPerson ? "Brief professional summary..." : "Brief description of the company, what they do, and their key business areas..."}
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

