'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { InlinePanel, InlinePanelContent, InlinePanelSection } from '@/components/ui/inline-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Loader2, 
  Trash2, 
  Mail, 
  Phone, 
  Linkedin, 
  Edit, 
  X, 
  Check,
  Building2,
  Globe,
  User,
  Briefcase,
  TrendingUp,
  DollarSign,
  ExternalLink
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface LeadInlinePanelProps {
  leadId: string | null
  campaignId?: string
  onClose: () => void
  onUpdate?: () => void
}

const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'qualified', label: 'Qualified', color: 'bg-green-100 text-green-700' },
  { value: 'unqualified', label: 'Unqualified', color: 'bg-red-100 text-red-700' },
  { value: 'nurture', label: 'Nurture', color: 'bg-purple-100 text-purple-700' },
  { value: 'converted', label: 'Converted', color: 'bg-gold-100 text-gold-700' },
]

const companySizeOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
]

export function LeadInlinePanel({
  leadId,
  campaignId,
  onClose,
  onUpdate,
}: LeadInlinePanelProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form state
  const [companyName, setCompanyName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [title, setTitle] = useState('')
  const [industry, setIndustry] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [website, setWebsite] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [status, setStatus] = useState('new')
  const [estimatedValue, setEstimatedValue] = useState('')
  const [hiringNeeds, setHiringNeeds] = useState('')
  const [positionsCount, setPositionsCount] = useState('')

  // Fetch lead data
  const leadQuery = trpc.unifiedContacts.leads.getById.useQuery(
    { id: leadId! },
    { enabled: !!leadId }
  )

  // Update mutation
  const updateMutation = trpc.unifiedContacts.leads.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Lead updated successfully' })
      if (campaignId) {
        utils.unifiedContacts.leads.listByCampaign.invalidate({ campaignId })
      }
      utils.unifiedContacts.leads.getById.invalidate({ id: leadId! })
      setIsEditing(false)
      onUpdate?.()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Populate form when lead data loads
  useEffect(() => {
    if (leadQuery.data) {
      const l = leadQuery.data
      setCompanyName(l.company_name || '')
      setFirstName(l.first_name || '')
      setLastName(l.last_name || '')
      setEmail(l.email || '')
      setPhone(l.phone || '')
      setTitle(l.title || '')
      setIndustry(l.industry || '')
      setCompanySize(l.company_size || '')
      setWebsite(l.website || '')
      setLinkedinUrl(l.linkedin_url || '')
      setStatus(l.status || 'new')
      setEstimatedValue(l.estimated_value?.toString() || '')
      setHiringNeeds(l.business_need || '')
      setPositionsCount(l.positions_count?.toString() || '')
    }
  }, [leadQuery.data])

  // Reset edit mode when lead changes
  useEffect(() => {
    setIsEditing(false)
  }, [leadId])

  const handleSave = () => {
    if (!leadId) return
    updateMutation.mutate({
      id: leadId,
      companyName: companyName.trim() || undefined,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      title: title.trim() || undefined,
      industry: industry.trim() || undefined,
      // Note: companySize is stored on the contact record but not updatable via leads.update
      website: website.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      status: status as 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted',
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
      hiringNeeds: hiringNeeds.trim() || undefined,
    })
  }

  const lead = leadQuery.data
  const statusConfig = statusOptions.find(s => s.value === lead?.status) || statusOptions[0]

  const headerActions = !isEditing && lead && (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/employee/crm/leads/${lead.id}`}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Full Page
        </Link>
      </Button>
      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </Button>
    </div>
  )

  const footerActions = isEditing ? (
    <>
      <Button variant="outline" onClick={() => setIsEditing(false)}>
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
      <Button onClick={handleSave} disabled={updateMutation.isPending}>
        {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        <Check className="w-4 h-4 mr-2" />
        Save Changes
      </Button>
    </>
  ) : undefined

  return (
    <InlinePanel
      isOpen={!!leadId}
      onClose={onClose}
      title={isEditing ? 'Edit Lead' : 'Lead Details'}
      description={isEditing ? 'Update lead information' : undefined}
      headerActions={headerActions}
      actions={footerActions}
      width="lg"
    >
      {leadQuery.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : lead ? (
        isEditing ? (
          // Edit Mode
          <InlinePanelContent>
            <InlinePanelSection title="Company Information">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g., Technology"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select value={companySize} onValueChange={setCompanySize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </InlinePanelSection>

            <InlinePanelSection title="Contact Information">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., VP of Engineering"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>
            </InlinePanelSection>

            <InlinePanelSection title="Lead Status & Value">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
                    <Input
                      id="estimatedValue"
                      type="number"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="positionsCount">Positions Count</Label>
                    <Input
                      id="positionsCount"
                      type="number"
                      value={positionsCount}
                      onChange={(e) => setPositionsCount(e.target.value)}
                      placeholder="1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hiringNeeds">Hiring Needs / Business Need</Label>
                  <Textarea
                    id="hiringNeeds"
                    value={hiringNeeds}
                    onChange={(e) => setHiringNeeds(e.target.value)}
                    rows={3}
                    placeholder="Describe the hiring needs or business requirements..."
                  />
                </div>
              </div>
            </InlinePanelSection>
          </InlinePanelContent>
        ) : (
          // View Mode
          <InlinePanelContent>
            {/* Header with status and score */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-lg bg-hublot-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-7 h-7 text-hublot-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-charcoal-900">
                    {lead.company_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unnamed Lead'}
                  </h3>
                  <Badge className={statusConfig.color}>
                    {statusConfig.label}
                  </Badge>
                </div>
                {lead.first_name && lead.company_name && (
                  <p className="text-charcoal-600">
                    {lead.first_name} {lead.last_name}
                    {lead.title && <span className="text-charcoal-400"> • {lead.title}</span>}
                  </p>
                )}
                {lead.industry && (
                  <p className="text-sm text-charcoal-500">{lead.industry}</p>
                )}
              </div>
            </div>

            {/* Lead Score */}
            {(lead.lead_score !== null && lead.lead_score !== undefined) && (
              <div className="bg-charcoal-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-charcoal-500" />
                    <span className="text-sm font-medium text-charcoal-700">Lead Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-charcoal-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold-500 rounded-full transition-all"
                        style={{ width: `${lead.lead_score}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-charcoal-900">{lead.lead_score}/100</span>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <InlinePanelSection title="Contact Information">
              <div className="space-y-3">
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-3 text-charcoal-600 hover:text-hublot-600 transition-colors"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </a>
                )}
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-3 text-charcoal-600 hover:text-hublot-600 transition-colors"
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    {lead.phone}
                  </a>
                )}
                {lead.linkedin_url && (
                  <a
                    href={lead.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-charcoal-600 hover:text-hublot-600 transition-colors"
                  >
                    <Linkedin className="w-4 h-4 flex-shrink-0" />
                    LinkedIn Profile
                  </a>
                )}
                {lead.website && (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-charcoal-600 hover:text-hublot-600 transition-colors"
                  >
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    {lead.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {!lead.email && !lead.phone && !lead.linkedin_url && !lead.website && (
                  <p className="text-sm text-charcoal-400 italic">No contact information</p>
                )}
              </div>
            </InlinePanelSection>

            {/* Company Details */}
            {(lead.company_size || lead.industry) && (
              <InlinePanelSection title="Company Details">
                <div className="grid grid-cols-2 gap-4">
                  {lead.industry && (
                    <div>
                      <p className="text-xs text-charcoal-500 uppercase tracking-wider">Industry</p>
                      <p className="text-sm text-charcoal-700 mt-0.5">{lead.industry}</p>
                    </div>
                  )}
                  {lead.company_size && (
                    <div>
                      <p className="text-xs text-charcoal-500 uppercase tracking-wider">Company Size</p>
                      <p className="text-sm text-charcoal-700 mt-0.5">{lead.company_size} employees</p>
                    </div>
                  )}
                </div>
              </InlinePanelSection>
            )}

            {/* Business Value */}
            {(lead.estimated_value || lead.positions_count || lead.business_need) && (
              <InlinePanelSection title="Business Value">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    {lead.estimated_value && (
                      <div>
                        <p className="text-xs text-charcoal-500 uppercase tracking-wider">Estimated Value</p>
                        <p className="text-sm text-charcoal-700 mt-0.5 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {lead.estimated_value.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {lead.positions_count && (
                      <div>
                        <p className="text-xs text-charcoal-500 uppercase tracking-wider">Positions</p>
                        <p className="text-sm text-charcoal-700 mt-0.5 flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {lead.positions_count} positions
                        </p>
                      </div>
                    )}
                  </div>
                  {lead.business_need && (
                    <div>
                      <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Hiring Needs</p>
                      <div className="bg-charcoal-50 rounded-lg p-3">
                        <p className="text-sm text-charcoal-600 whitespace-pre-wrap">
                          {lead.business_need}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </InlinePanelSection>
            )}

            {/* Source & Campaign */}
            <InlinePanelSection title="Source">
              <div className="grid grid-cols-2 gap-4">
                {lead.source && (
                  <div>
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Lead Source</p>
                    <p className="text-sm text-charcoal-700 mt-0.5 capitalize">
                      {lead.source.replace('_', ' ')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-charcoal-500 uppercase tracking-wider">Created</p>
                  <p className="text-sm text-charcoal-700 mt-0.5">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </InlinePanelSection>

            {/* Owner */}
            {lead.owner && (
              <InlinePanelSection title="Owner">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-hublot-100 flex items-center justify-center">
                    {lead.owner.avatar_url ? (
                      <img
                        src={lead.owner.avatar_url}
                        alt={lead.owner.full_name || ''}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-hublot-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal-700">{lead.owner.full_name}</p>
                    {lead.owner.email && (
                      <p className="text-xs text-charcoal-500">{lead.owner.email}</p>
                    )}
                  </div>
                </div>
              </InlinePanelSection>
            )}
          </InlinePanelContent>
        )
      ) : (
        <div className="text-center py-8 text-charcoal-500">
          Lead not found
        </div>
      )}
    </InlinePanel>
  )
}




