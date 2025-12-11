'use client'

import { formatDistanceToNow } from 'date-fns'
import {
  Building2,
  Globe,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  Linkedin,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EditableInfoCard, type FieldDefinition } from '@/components/ui/editable-info-card'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'

interface Contact {
  id: string
  company_name?: string | null
  company_name_legal?: string | null
  company_dba_name?: string | null
  company_type?: string | null
  company_structure?: string | null
  company_industry?: string | null
  company_size?: string | null
  company_revenue?: string | null
  company_employee_count?: number | null
  company_founded_year?: number | null
  company_description?: string | null
  company_ticker?: string | null
  website_url?: string | null
  linkedin_url?: string | null
  status?: string | null
  created_at?: string | null
  updated_at?: string | null
  // Stats
  contacts_count?: number
  jobs_count?: number
  placements_count?: number
}

interface CompanyOverviewSectionProps {
  contact: Contact
  onUpdate?: () => void
}

const companyFields: FieldDefinition[] = [
  { key: 'company_name', label: 'Company Name', type: 'text', required: true },
  { key: 'company_name_legal', label: 'Legal Name', type: 'text' },
  { key: 'company_dba_name', label: 'DBA Name', type: 'text' },
  { key: 'company_ticker', label: 'Stock Ticker', type: 'text' },
]

const businessFields: FieldDefinition[] = [
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
  { key: 'company_industry', label: 'Industry', type: 'text' },
  {
    key: 'company_size',
    label: 'Company Size',
    type: 'select',
    options: [
      { value: '1-10', label: '1-10 employees' },
      { value: '11-50', label: '11-50 employees' },
      { value: '51-200', label: '51-200 employees' },
      { value: '201-500', label: '201-500 employees' },
      { value: '501-1000', label: '501-1000 employees' },
      { value: '1001-5000', label: '1001-5000 employees' },
      { value: '5001-10000', label: '5001-10000 employees' },
      { value: '10001+', label: '10001+ employees' },
    ],
  },
  { key: 'company_employee_count', label: 'Employee Count', type: 'number' },
  { key: 'company_founded_year', label: 'Founded Year', type: 'number' },
  { key: 'company_revenue', label: 'Annual Revenue', type: 'text' },
]

const webFields: FieldDefinition[] = [
  { key: 'website_url', label: 'Website', type: 'url' },
  { key: 'linkedin_url', label: 'LinkedIn', type: 'url' },
]

const descriptionFields: FieldDefinition[] = [
  { key: 'company_description', label: 'Description', type: 'textarea' },
]

export function CompanyOverviewSection({ contact, onUpdate }: CompanyOverviewSectionProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Update mutation
  const updateMutation = trpc.unifiedContacts.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Company updated successfully' })
      utils.unifiedContacts.getById.invalidate({ id: contact.id })
      onUpdate?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to update company',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const handleSaveCompanyInfo = async (data: Record<string, unknown>) => {
    // Only companyName is available in the current update schema
    await updateMutation.mutateAsync({
      id: contact.id,
      companyName: data.company_name as string,
    })
    toast({ title: 'Note: Only company name saved. Other fields require schema updates.' })
  }

  const handleSaveBusinessInfo = async () => {
    // These fields are not yet in the update schema
    toast({ title: 'Business details update requires schema updates', variant: 'error' })
  }

  const handleSaveWebInfo = async (data: Record<string, unknown>) => {
    await updateMutation.mutateAsync({
      id: contact.id,
      linkedinUrl: data.linkedin_url as string,
    })
  }

  const handleSaveDescription = async () => {
    // Description field is not yet in the update schema
    toast({ title: 'Description update requires schema updates', variant: 'error' })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-charcoal-900">
                  {contact.contacts_count || 0}
                </div>
                <div className="text-sm text-charcoal-500">Contacts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-charcoal-900">
                  {contact.jobs_count || 0}
                </div>
                <div className="text-sm text-charcoal-500">Jobs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-charcoal-900">
                  {contact.placements_count || 0}
                </div>
                <div className="text-sm text-charcoal-500">Placements</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-charcoal-900">
                  {contact.company_founded_year || '—'}
                </div>
                <div className="text-sm text-charcoal-500">Founded</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Information */}
      <EditableInfoCard
        title="Company Information"
        fields={companyFields}
        data={contact as unknown as Record<string, unknown>}
        onSave={handleSaveCompanyInfo}
        columns={2}
      />

      {/* Business Details */}
      <EditableInfoCard
        title="Business Details"
        fields={businessFields}
        data={contact as unknown as Record<string, unknown>}
        onSave={handleSaveBusinessInfo}
        columns={2}
      />

      {/* Web Presence */}
      <EditableInfoCard
        title="Web Presence"
        fields={webFields}
        data={contact as unknown as Record<string, unknown>}
        onSave={handleSaveWebInfo}
        columns={2}
      />

      {/* Description */}
      <EditableInfoCard
        title="About"
        fields={descriptionFields}
        data={contact as unknown as Record<string, unknown>}
        onSave={handleSaveDescription}
        columns={1}
      />

      {/* Metadata */}
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
                <Badge variant="outline">{contact.status || 'Active'}</Badge>
              </div>
            </div>
            <div>
              <span className="text-charcoal-500">Industry</span>
              <p className="font-medium mt-1">{contact.company_industry || '—'}</p>
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
