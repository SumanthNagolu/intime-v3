'use client'

import { User, Mail, Phone, Linkedin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateCandidateStore } from '@/stores/create-candidate-store'
import { Section, FieldGroup, ValidationBanner } from './shared'

export function CandidateIntakeStep2BasicInfo() {
  const { formData, setFormData } = useCreateCandidateStore()

  // Build validation items
  const validationItems: string[] = []
  if (!formData.firstName) validationItems.push('Enter first name')
  if (!formData.lastName) validationItems.push('Enter last name')
  if (!formData.email) validationItems.push('Enter email address')

  return (
    <div className="space-y-8">
      <Section
        icon={User}
        title="Basic Information"
        subtitle="Enter the candidate's contact details"
      >
        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-charcoal-700 font-medium">
              First Name <span className="text-gold-500">*</span>
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ firstName: e.target.value })}
              placeholder="John"
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-charcoal-700 font-medium">
              Last Name <span className="text-gold-500">*</span>
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ lastName: e.target.value })}
              placeholder="Smith"
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>
        </FieldGroup>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-charcoal-700 font-medium flex items-center gap-2">
            <Mail className="w-4 h-4 text-charcoal-400" />
            Email Address <span className="text-gold-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ email: e.target.value })}
            placeholder="john.smith@example.com"
            className="h-12 rounded-xl border-charcoal-200 bg-white"
          />
        </div>

        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-charcoal-700 font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-charcoal-400" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinProfile" className="text-charcoal-700 font-medium flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-charcoal-400" />
              LinkedIn URL
            </Label>
            <Input
              id="linkedinProfile"
              type="url"
              value={formData.linkedinProfile || ''}
              onChange={(e) => setFormData({ linkedinProfile: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>
        </FieldGroup>
      </Section>

      {/* Validation Summary */}
      <ValidationBanner items={validationItems} />
    </div>
  )
}
