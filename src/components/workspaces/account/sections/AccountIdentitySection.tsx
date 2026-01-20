'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { InlinePanel, InlinePanelSection } from '@/components/ui/inline-panel'
import {
  Building2, Globe, Linkedin, Landmark, Tag, Pencil, ExternalLink, Loader2
} from 'lucide-react'
import type { AccountData } from '@/types/workspace'
import { useAccountWorkspace } from '../AccountWorkspaceProvider'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

// Constants
const INDUSTRIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'education', label: 'Education' },
  { value: 'government', label: 'Government' },
  { value: 'energy', label: 'Energy' },
  { value: 'media', label: 'Media' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' },
]

const RELATIONSHIP_TYPES = [
  { value: 'direct_client', label: 'Direct Client' },
  { value: 'implementation_partner', label: 'Implementation Partner' },
  { value: 'staffing_vendor', label: 'Staffing Vendor' },
]

const SEGMENTS = [
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'mid_market', label: 'Mid-Market' },
  { value: 'smb', label: 'SMB' },
  { value: 'startup', label: 'Startup' },
]

const TIERS = [
  { value: 'standard', label: 'Standard' },
  { value: 'preferred', label: 'Preferred' },
  { value: 'strategic', label: 'Strategic' },
]

const STATUSES = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

interface AccountIdentitySectionProps {
  account: AccountData
}

/**
 * AccountIdentitySection - Identity & Classification
 * Displays company identity, registration, and classification information
 * Matches wizard Step 1: Identity & Classification
 */
export function AccountIdentitySection({ account }: AccountIdentitySectionProps) {
  const { refreshData } = useAccountWorkspace()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = React.useState(false)

  // Form state
  const [formData, setFormData] = React.useState({
    name: account.name || '',
    legalName: account.legal_name || '',
    industry: account.industry || '',
    industries: account.industries || [],
    companyType: account.relationship_type || '',
    status: account.status || 'prospect',
    tier: account.tier || '',
    segment: account.segment || '',
    website: account.website || '',
    phone: account.phone || '',
    linkedinUrl: account.linkedin_url || '',
    foundedYear: account.founded_year?.toString() || '',
    description: account.description || '',
  })

  // Reset form when account changes or panel opens
  React.useEffect(() => {
    if (isEditing) {
      setFormData({
        name: account.name || '',
        legalName: account.legal_name || '',
        industry: account.industry || '',
        industries: account.industries || [],
        companyType: account.relationship_type || '',
        status: account.status || 'prospect',
        tier: account.tier || '',
        segment: account.segment || '',
        website: account.website || '',
        phone: account.phone || '',
        linkedinUrl: account.linkedin_url || '',
        foundedYear: account.founded_year?.toString() || '',
        description: account.description || '',
      })
    }
  }, [account, isEditing])

  // Update mutation
  const updateMutation = trpc.crm.accounts.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Identity updated successfully' })
      refreshData()
      setIsEditing(false)
    },
    onError: (error) => {
      toast({ title: 'Error updating identity', description: error.message, variant: 'error' })
    },
  })

  // Handle form submission
  const handleSave = async () => {
    await updateMutation.mutateAsync({
      id: account.id,
      name: formData.name || undefined,
      legalName: formData.legalName || undefined,
      industry: formData.industry || undefined,
      industries: formData.industries.length > 0 ? formData.industries : undefined,
      companyType: (formData.companyType as 'direct_client' | 'implementation_partner' | 'staffing_vendor') || undefined,
      status: (formData.status as 'prospect' | 'active' | 'inactive') || undefined,
      tier: (formData.tier as 'preferred' | 'strategic' | 'exclusive') || undefined,
      segment: (formData.segment as 'enterprise' | 'mid_market' | 'smb' | 'startup') || undefined,
      website: formData.website || undefined,
      phone: formData.phone || undefined,
      linkedinUrl: formData.linkedinUrl || undefined,
      foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
      description: formData.description || undefined,
    })
  }

  // Industry badges
  const industries = account.industries || (account.industry ? [account.industry] : [])

  return (
    <div className="flex gap-0">
      {/* Main Content */}
      <div className={cn("space-y-6 animate-fade-in flex-1 transition-all", isEditing && "pr-0")}>
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-semibold text-charcoal-900">Identity & Classification</h2>
            <p className="text-sm text-charcoal-500 mt-1">Company details, registration, and industry classification</p>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Identity Card */}
          <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gold-50 rounded-lg">
                  <Building2 className="w-4 h-4 text-gold-600" />
                </div>
                <CardTitle className="text-base font-heading">Company Identity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Company Name" value={account.name} />
              <InfoRow label="Legal Name" value={account.legal_name} />
              <InfoRow label="DBA / Trade Name" value={account.dba_name} />
              <InfoRow label="Relationship Type" value={formatRelationshipType(account.relationship_type)} />
            </CardContent>
          </Card>

          {/* Classification Card */}
          <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Tag className="w-4 h-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-heading">Classification</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">Industries</p>
                {industries.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {industries.map((industry, idx) => (
                      <Badge key={idx} variant="secondary" className="capitalize">
                        {industry.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-charcoal-400 text-sm">Not specified</span>
                )}
              </div>
              <InfoRow label="Segment" value={account.segment} />
              <InfoRow label="Tier" value={account.tier} badge />
              <InfoRow
                label="Status"
                value={account.status}
                badge
                badgeVariant={account.status === 'active' ? 'success' : 'secondary'}
              />
            </CardContent>
          </Card>

          {/* Corporate Profile Card */}
          <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Landmark className="w-4 h-4 text-purple-600" />
                </div>
                <CardTitle className="text-base font-heading">Corporate Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Ownership Type" value={formatOwnershipType(account.ownership_type)} />
              <InfoRow label="Founded Year" value={account.founded_year?.toString()} />
              <InfoRow label="Employee Range" value={account.employee_range} />
              <InfoRow label="Revenue Range" value={account.revenue_range} />
            </CardContent>
          </Card>

          {/* Digital Presence Card */}
          <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Globe className="w-4 h-4 text-green-600" />
                </div>
                <CardTitle className="text-base font-heading">Digital Presence</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {account.website ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Website</p>
                    <a
                      href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {account.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <InfoRow label="Website" value={null} />
              )}
              {account.linkedin_url ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">LinkedIn</p>
                    <a
                      href={account.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View Profile
                      <Linkedin className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <InfoRow label="LinkedIn" value={null} />
              )}
              <InfoRow label="Phone" value={account.phone} />
              <InfoRow label="Fax" value={account.fax} />
            </CardContent>
          </Card>
        </div>

        {/* Description Card */}
        {account.description && (
          <Card className="shadow-elevation-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-charcoal-600 whitespace-pre-wrap">{account.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {account.tags && account.tags.length > 0 && (
          <Card className="shadow-elevation-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {account.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="bg-charcoal-50">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Panel */}
      <InlinePanel
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Identity"
        description="Update company identity and classification"
        width="lg"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <InlinePanelSection title="Company Identity">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <Label htmlFor="legalName">Legal Name</Label>
                <Input
                  id="legalName"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  placeholder="Enter legal entity name"
                />
              </div>
              <div>
                <Label htmlFor="companyType">Relationship Type</Label>
                <Select
                  value={formData.companyType}
                  onValueChange={(v) => setFormData({ ...formData, companyType: v })}
                >
                  <SelectTrigger id="companyType">
                    <SelectValue placeholder="Select relationship type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </InlinePanelSection>

          <InlinePanelSection title="Classification">
            <div className="space-y-4">
              <div>
                <Label htmlFor="industry">Primary Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(v) => setFormData({ ...formData, industry: v })}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind.value} value={ind.value}>
                        {ind.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="segment">Segment</Label>
                  <Select
                    value={formData.segment}
                    onValueChange={(v) => setFormData({ ...formData, segment: v })}
                  >
                    <SelectTrigger id="segment">
                      <SelectValue placeholder="Select segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEGMENTS.map((seg) => (
                        <SelectItem key={seg.value} value={seg.value}>
                          {seg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tier">Tier</Label>
                  <Select
                    value={formData.tier}
                    onValueChange={(v) => setFormData({ ...formData, tier: v })}
                  >
                    <SelectTrigger id="tier">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIERS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </InlinePanelSection>

          <InlinePanelSection title="Digital Presence">
            <div className="space-y-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/company/..."
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={formData.foundedYear}
                  onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                  placeholder="2020"
                />
              </div>
            </div>
          </InlinePanelSection>

          <InlinePanelSection title="Description">
            <div>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter company description..."
                rows={4}
              />
            </div>
          </InlinePanelSection>
        </div>
      </InlinePanel>
    </div>
  )
}

// Helper Components
function InfoRow({
  label,
  value,
  badge = false,
  badgeVariant = 'secondary'
}: {
  label: string
  value: string | null | undefined
  badge?: boolean
  badgeVariant?: 'secondary' | 'success' | 'warning' | 'destructive'
}) {
  return (
    <div>
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">{label}</p>
      {badge && value ? (
        <Badge variant={badgeVariant} className="mt-1 capitalize">
          {value.replace(/_/g, ' ')}
        </Badge>
      ) : (
        <p className={cn("text-sm mt-0.5", value ? "text-charcoal-900" : "text-charcoal-400")}>
          {value || 'Not specified'}
        </p>
      )}
    </div>
  )
}

// Formatting helpers
function formatRelationshipType(type: string | null): string | null {
  if (!type) return null
  const map: Record<string, string> = {
    'direct_client': 'Direct Client',
    'implementation_partner': 'Implementation Partner',
    'staffing_vendor': 'Staffing Vendor',
  }
  return map[type] || type.replace(/_/g, ' ')
}

function formatOwnershipType(type: string | null): string | null {
  if (!type) return null
  const map: Record<string, string> = {
    'public': 'Public',
    'private': 'Private',
    'subsidiary': 'Subsidiary',
    'non_profit': 'Non-Profit',
    'government': 'Government',
  }
  return map[type] || type.replace(/_/g, ' ')
}

export default AccountIdentitySection
