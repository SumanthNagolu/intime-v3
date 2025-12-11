'use client'

import { useMemo } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  User,
  Building2,
  Mail,
  Phone,
  Linkedin,
  Globe,
  Calendar,
  Clock,
  Briefcase,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EditableInfoCard, type FieldDefinition } from '@/components/ui/editable-info-card'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'

interface Contact {
  id: string
  category?: 'person' | 'company'
  subtype?: string
  // Person fields
  first_name?: string | null
  last_name?: string | null
  middle_name?: string | null
  preferred_name?: string | null
  pronouns?: string | null
  title?: string | null
  // Company fields
  company_name?: string | null
  company_name_legal?: string | null
  company_dba_name?: string | null
  company_type?: string | null
  company_structure?: string | null
  // Contact info
  email?: string | null
  secondary_email?: string | null
  work_email?: string | null
  phone?: string | null
  mobile?: string | null
  work_phone?: string | null
  home_phone?: string | null
  // Social
  linkedin_url?: string | null
  twitter_url?: string | null
  github_url?: string | null
  portfolio_url?: string | null
  website_url?: string | null
  // Current employment
  current_company_id?: string | null
  current_title?: string | null
  current_department?: string | null
  company_name_display?: string | null
  // Metadata
  status?: string | null
  contact_status?: string | null
  created_at?: string | null
  updated_at?: string | null
  owner?: { id: string; full_name: string; avatar_url?: string } | null
}

interface BasicDetailsSectionProps {
  contact: Contact
  onUpdate?: () => void
}

// Field definitions for person basic info
const personBasicFields: FieldDefinition[] = [
  { key: 'first_name', label: 'First Name', type: 'text', required: true },
  { key: 'middle_name', label: 'Middle Name', type: 'text' },
  { key: 'last_name', label: 'Last Name', type: 'text', required: true },
  { key: 'preferred_name', label: 'Preferred Name', type: 'text' },
  { key: 'pronouns', label: 'Pronouns', type: 'text', placeholder: 'e.g., they/them' },
  { key: 'title', label: 'Job Title', type: 'text' },
]

// Field definitions for company basic info
const companyBasicFields: FieldDefinition[] = [
  { key: 'company_name', label: 'Company Name', type: 'text', required: true },
  { key: 'company_name_legal', label: 'Legal Name', type: 'text' },
  { key: 'company_dba_name', label: 'DBA Name', type: 'text' },
  {
    key: 'company_type',
    label: 'Company Type',
    type: 'select',
    options: [
      { value: 'corporation', label: 'Corporation' },
      { value: 'llc', label: 'LLC' },
      { value: 'partnership', label: 'Partnership' },
      { value: 'sole_prop', label: 'Sole Proprietorship' },
      { value: 'nonprofit', label: 'Nonprofit' },
    ],
  },
  {
    key: 'company_structure',
    label: 'Structure',
    type: 'select',
    options: [
      { value: 'public', label: 'Public' },
      { value: 'private', label: 'Private' },
      { value: 'subsidiary', label: 'Subsidiary' },
      { value: 'franchise', label: 'Franchise' },
    ],
  },
]

// Contact information fields (shared)
const contactInfoFields: FieldDefinition[] = [
  { key: 'email', label: 'Primary Email', type: 'email' },
  { key: 'secondary_email', label: 'Secondary Email', type: 'email' },
  { key: 'work_email', label: 'Work Email', type: 'email' },
  { key: 'phone', label: 'Primary Phone', type: 'phone' },
  { key: 'mobile', label: 'Mobile', type: 'phone' },
  { key: 'work_phone', label: 'Work Phone', type: 'phone' },
]

// Social/web fields (shared)
const socialFields: FieldDefinition[] = [
  { key: 'linkedin_url', label: 'LinkedIn', type: 'url' },
  { key: 'twitter_url', label: 'Twitter/X', type: 'url' },
  { key: 'github_url', label: 'GitHub', type: 'url' },
  { key: 'portfolio_url', label: 'Portfolio', type: 'url' },
  { key: 'website_url', label: 'Website', type: 'url' },
]

// Employment fields (person only)
const employmentFields: FieldDefinition[] = [
  { key: 'current_title', label: 'Current Title', type: 'text' },
  { key: 'current_department', label: 'Department', type: 'text' },
  { key: 'company_name_display', label: 'Company', type: 'text', readOnly: true },
]

export function BasicDetailsSection({ contact, onUpdate }: BasicDetailsSectionProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const isPerson = contact.category !== 'company' // Default to person if not specified

  // Update mutation
  const updateMutation = trpc.unifiedContacts.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Contact updated successfully' })
      utils.unifiedContacts.getById.invalidate({ id: contact.id })
      onUpdate?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to update contact',
        description: error.message,
        variant: 'error',
      })
    },
  })

  // Transform contact data for editable card
  const contactData = useMemo(() => ({
    ...contact,
    company_name_display: contact.current_company_id
      ? contact.company_name_display || 'View company'
      : 'Not specified',
  }), [contact])

  // Handler for saving basic info
  const handleSaveBasicInfo = async (data: Record<string, unknown>) => {
    await updateMutation.mutateAsync({
      id: contact.id,
      ...(isPerson
        ? {
            firstName: data.first_name as string,
            lastName: data.last_name as string,
            middleName: data.middle_name as string,
            preferredName: data.preferred_name as string,
            pronouns: data.pronouns as string,
            title: data.title as string,
          }
        : {
            companyName: data.company_name as string,
            companyNameLegal: data.company_name_legal as string,
            companyDbaName: data.company_dba_name as string,
            companyType: data.company_type as string,
            companyStructure: data.company_structure as string,
          }),
    })
  }

  // Handler for saving contact info
  const handleSaveContactInfo = async (data: Record<string, unknown>) => {
    await updateMutation.mutateAsync({
      id: contact.id,
      email: data.email as string,
      phone: data.phone as string,
      mobile: data.mobile as string,
    })
  }

  // Handler for saving social info
  const handleSaveSocialInfo = async (data: Record<string, unknown>) => {
    await updateMutation.mutateAsync({
      id: contact.id,
      linkedinUrl: data.linkedin_url as string,
    })
  }

  // Handler for saving employment info (person only)
  const handleSaveEmployment = async (data: Record<string, unknown>) => {
    await updateMutation.mutateAsync({
      id: contact.id,
      title: data.current_title as string,
    })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Basic Information */}
      <EditableInfoCard
        title={isPerson ? 'Personal Information' : 'Company Information'}
        fields={isPerson ? personBasicFields : companyBasicFields}
        data={contactData as unknown as Record<string, unknown>}
        onSave={handleSaveBasicInfo}
        columns={2}
      />

      {/* Current Employment (person only) */}
      {isPerson && (
        <EditableInfoCard
          title="Current Employment"
          fields={employmentFields}
          data={contactData as unknown as Record<string, unknown>}
          onSave={handleSaveEmployment}
          columns={2}
        />
      )}

      {/* Contact Information */}
      <EditableInfoCard
        title="Contact Information"
        fields={contactInfoFields}
        data={contactData as unknown as Record<string, unknown>}
        onSave={handleSaveContactInfo}
        columns={2}
      />

      {/* Social & Web */}
      <EditableInfoCard
        title="Social & Web"
        fields={socialFields}
        data={contactData as unknown as Record<string, unknown>}
        onSave={handleSaveSocialInfo}
        columns={2}
      />

      {/* Metadata Card (read-only) */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Record Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-charcoal-500">Status</span>
              <div className="mt-1">
                <Badge variant="outline">
                  {contact.contact_status || contact.status || 'Active'}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-charcoal-500">Owner</span>
              <p className="font-medium mt-1">
                {contact.owner?.full_name || 'Unassigned'}
              </p>
            </div>
            <div>
              <span className="text-charcoal-500">Created</span>
              <p className="font-medium mt-1">
                {contact.created_at
                  ? formatDistanceToNow(new Date(contact.created_at), { addSuffix: true })
                  : '—'}
              </p>
            </div>
            <div>
              <span className="text-charcoal-500">Last Updated</span>
              <p className="font-medium mt-1">
                {contact.updated_at
                  ? formatDistanceToNow(new Date(contact.updated_at), { addSuffix: true })
                  : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
