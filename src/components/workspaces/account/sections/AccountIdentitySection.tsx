'use client'

import * as React from 'react'
import { Building2, Globe, Linkedin, Landmark, Tag, Loader2 } from 'lucide-react'
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PhoneInput, type PhoneInputValue, parsePhoneValue } from '@/components/ui/phone-input'
import { TagsInput } from '@/components/ui/tags-display'
import {
  UnifiedSection,
  InfoCard,
  InfoRow,
  CardsGrid,
  EditPanel,
  EditPanelSection,
} from '@/components/pcf/sections/UnifiedSection'
import { ValueDisplay, TagsDisplay } from '@/components/ui/value-display'
import type { AccountData } from '@/types/workspace'
import { useAccountWorkspace } from '../AccountWorkspaceProvider'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import {
  INDUSTRIES,
  COMPANY_TYPES,
  PARTNERSHIP_TIERS,
  COMPANY_SEGMENTS,
  ACCOUNT_STATUSES,
  EMPLOYEE_RANGES,
  REVENUE_RANGES,
  OWNERSHIP_TYPES,
} from '@/lib/accounts/constants'

// ============================================
// SECTION PROPS
// ============================================

interface AccountIdentitySectionProps {
  account: AccountData
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * AccountIdentitySection - Identity & Classification
 *
 * Displays company identity, registration, and classification information.
 * Matches wizard Step 1: Identity & Classification.
 *
 * Hublot-inspired: Clean cards, subtle shadows, elegant typography.
 */
export function AccountIdentitySection({ account }: AccountIdentitySectionProps) {
  const { refreshData } = useAccountWorkspace()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = React.useState(false)

  // ============================================
  // FORM STATE
  // ============================================

  const [formData, setFormData] = React.useState({
    name: account.name || '',
    legalName: account.legal_name || '',
    dbaName: account.dba_name || '',
    industry: account.industry || '',
    industries: account.industries || [],
    companyType: account.relationship_type || '',
    status: account.status || 'prospect',
    tier: account.tier || '',
    segment: account.segment || '',
    ownershipType: account.ownership_type || '',
    employeeRange: account.employee_range || '',
    revenueRange: account.revenue_range || '',
    foundedYear: account.founded_year?.toString() || '',
    website: account.website || '',
    phone: parsePhoneValue(account.phone),
    linkedinUrl: account.linkedin_url || '',
    fax: account.fax || '',
    description: account.description || '',
    tags: account.tags || [],
  })

  // Reset form when account changes or panel opens
  React.useEffect(() => {
    if (isEditing) {
      setFormData({
        name: account.name || '',
        legalName: account.legal_name || '',
        dbaName: account.dba_name || '',
        industry: account.industry || '',
        industries: account.industries || [],
        companyType: account.relationship_type || '',
        status: account.status || 'prospect',
        tier: account.tier || '',
        segment: account.segment || '',
        ownershipType: account.ownership_type || '',
        employeeRange: account.employee_range || '',
        revenueRange: account.revenue_range || '',
        foundedYear: account.founded_year?.toString() || '',
        website: account.website || '',
        phone: parsePhoneValue(account.phone),
        linkedinUrl: account.linkedin_url || '',
        fax: account.fax || '',
        description: account.description || '',
        tags: account.tags || [],
      })
    }
  }, [account, isEditing])

  // ============================================
  // UPDATE MUTATION
  // ============================================

  const updateMutation = trpc.crm.accounts.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Identity updated successfully' })
      refreshData()
      setIsEditing(false)
    },
    onError: (error) => {
      toast({
        title: 'Error updating identity',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      id: account.id,
      name: formData.name || undefined,
      legalName: formData.legalName || undefined,
      dbaName: formData.dbaName || undefined,
      industry: formData.industry || undefined,
      industries: formData.industries.length > 0 ? formData.industries : undefined,
      companyType:
        (formData.companyType as
          | 'direct_client'
          | 'implementation_partner'
          | 'staffing_vendor') || undefined,
      status:
        (formData.status as 'prospect' | 'active' | 'inactive') || undefined,
      tier:
        (formData.tier as 'preferred' | 'strategic' | 'exclusive') || undefined,
      segment:
        (formData.segment as 'enterprise' | 'mid_market' | 'smb' | 'startup') ||
        undefined,
      ownershipType: formData.ownershipType || undefined,
      employeeRange: formData.employeeRange || undefined,
      revenueRange: formData.revenueRange || undefined,
      foundedYear: formData.foundedYear
        ? parseInt(formData.foundedYear)
        : undefined,
      website: formData.website || undefined,
      phone: formData.phone.number
        ? `${formData.phone.countryCode}${formData.phone.number}`
        : undefined,
      linkedinUrl: formData.linkedinUrl || undefined,
      fax: formData.fax || undefined,
      description: formData.description || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    })
  }

  // ============================================
  // DERIVED DATA
  // ============================================

  const industries =
    account.industries || (account.industry ? [account.industry] : [])

  // ============================================
  // RENDER
  // ============================================

  return (
    <UnifiedSection
      title="Identity & Classification"
      description="Company details, registration, and industry classification"
      icon={Building2}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      editContent={
        <EditForm
          formData={formData}
          setFormData={setFormData}
        />
      }
      editPanel={{
        title: 'Edit Identity',
        description: 'Update company identity and classification',
        onSave: handleSave,
        isSaving: updateMutation.isPending,
      }}
    >
      <CardsGrid columns={2}>
        {/* Company Identity Card */}
        <InfoCard
          title="Company Identity"
          icon={Building2}
          iconBg="bg-gold-50"
          iconColor="text-gold-600"
        >
          <InfoRow label="Company Name" value={account.name} />
          <InfoRow label="Legal Name" value={account.legal_name} />
          <InfoRow label="DBA / Trade Name" value={account.dba_name} />
          <InfoRow
            label="Relationship Type"
            value={account.relationship_type}
            badge
          />
        </InfoCard>

        {/* Classification Card */}
        <InfoCard
          title="Classification"
          icon={Tag}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        >
          <div>
            <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider mb-2">
              Industries
            </p>
            <TagsDisplay
              value={industries}
              maxItems={4}
              emptyText="Not specified"
            />
          </div>
          <InfoRow label="Segment" value={account.segment} badge />
          <InfoRow label="Tier" value={account.tier} badge />
          <InfoRow
            label="Status"
            value={account.status}
            badge
          />
        </InfoCard>

        {/* Corporate Profile Card */}
        <InfoCard
          title="Corporate Profile"
          icon={Landmark}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        >
          <InfoRow label="Ownership Type" value={account.ownership_type} />
          <InfoRow
            label="Founded Year"
            value={account.founded_year}
            type="number"
          />
          <InfoRow label="Employee Range" value={account.employee_range} />
          <InfoRow label="Revenue Range" value={account.revenue_range} />
        </InfoCard>

        {/* Digital Presence Card */}
        <InfoCard
          title="Digital Presence"
          icon={Globe}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        >
          <InfoRow
            label="Website"
            value={account.website}
            type="url"
            displayProps={{ clickable: true, showIcon: true }}
          />
          <InfoRow
            label="LinkedIn"
            value={account.linkedin_url}
            type="linkedin"
            displayProps={{ clickable: true, showIcon: true }}
          />
          <InfoRow
            label="Phone"
            value={account.phone}
            type="phone"
            displayProps={{ clickable: true, copyable: true }}
          />
          <InfoRow label="Fax" value={account.fax} type="phone" />
        </InfoCard>
      </CardsGrid>

      {/* Description Card */}
      {account.description && (
        <Card className="shadow-elevation-sm mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-charcoal-600 whitespace-pre-wrap leading-relaxed">
              {account.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tags Card */}
      {account.tags && account.tags.length > 0 && (
        <Card className="shadow-elevation-sm mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <TagsDisplay value={account.tags} maxItems={10} />
          </CardContent>
        </Card>
      )}
    </UnifiedSection>
  )
}

// ============================================
// EDIT FORM COMPONENT
// ============================================

interface EditFormProps {
  formData: {
    name: string
    legalName: string
    dbaName: string
    industry: string
    industries: string[]
    companyType: string
    status: string
    tier: string
    segment: string
    ownershipType: string
    employeeRange: string
    revenueRange: string
    foundedYear: string
    website: string
    phone: PhoneInputValue
    linkedinUrl: string
    fax: string
    description: string
    tags: string[]
  }
  setFormData: React.Dispatch<React.SetStateAction<EditFormProps['formData']>>
}

function EditForm({ formData, setFormData }: EditFormProps) {
  const updateField = <K extends keyof EditFormProps['formData']>(
    field: K,
    value: EditFormProps['formData'][K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Company Identity */}
      <EditPanelSection title="Company Identity">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Enter company name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="legalName">Legal Name</Label>
              <Input
                id="legalName"
                value={formData.legalName}
                onChange={(e) => updateField('legalName', e.target.value)}
                placeholder="Legal entity name"
              />
            </div>
            <div>
              <Label htmlFor="dbaName">DBA / Trade Name</Label>
              <Input
                id="dbaName"
                value={formData.dbaName}
                onChange={(e) => updateField('dbaName', e.target.value)}
                placeholder="Doing business as"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="companyType">Relationship Type</Label>
            <Select
              value={formData.companyType}
              onValueChange={(v) => updateField('companyType', v)}
            >
              <SelectTrigger id="companyType">
                <SelectValue placeholder="Select relationship type" />
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
        </div>
      </EditPanelSection>

      {/* Classification */}
      <EditPanelSection title="Classification">
        <div className="space-y-4">
          <div>
            <Label htmlFor="industry">Primary Industry</Label>
            <Select
              value={formData.industry}
              onValueChange={(v) => updateField('industry', v)}
            >
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind.value} value={ind.value}>
                    {ind.icon} {ind.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="segment">Segment</Label>
              <Select
                value={formData.segment}
                onValueChange={(v) => updateField('segment', v)}
              >
                <SelectTrigger id="segment">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SEGMENTS.map((seg) => (
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
                onValueChange={(v) => updateField('tier', v)}
              >
                <SelectTrigger id="tier">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {PARTNERSHIP_TIERS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => updateField('status', v)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </EditPanelSection>

      {/* Corporate Profile */}
      <EditPanelSection title="Corporate Profile">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ownershipType">Ownership Type</Label>
              <Select
                value={formData.ownershipType}
                onValueChange={(v) => updateField('ownershipType', v)}
              >
                <SelectTrigger id="ownershipType">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {OWNERSHIP_TYPES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="foundedYear">Founded Year</Label>
              <Input
                id="foundedYear"
                type="number"
                value={formData.foundedYear}
                onChange={(e) => updateField('foundedYear', e.target.value)}
                placeholder="2020"
                min={1800}
                max={new Date().getFullYear()}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeRange">Employee Range</Label>
              <Select
                value={formData.employeeRange}
                onValueChange={(v) => updateField('employeeRange', v)}
              >
                <SelectTrigger id="employeeRange">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_RANGES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="revenueRange">Revenue Range</Label>
              <Select
                value={formData.revenueRange}
                onValueChange={(v) => updateField('revenueRange', v)}
              >
                <SelectTrigger id="revenueRange">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {REVENUE_RANGES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </EditPanelSection>

      {/* Digital Presence */}
      <EditPanelSection title="Digital Presence">
        <div className="space-y-4">
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => updateField('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/company/..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <PhoneInput
              label="Phone"
              value={formData.phone}
              onChange={(v) => updateField('phone', v)}
            />
            <div>
              <Label htmlFor="fax">Fax</Label>
              <Input
                id="fax"
                value={formData.fax}
                onChange={(e) => updateField('fax', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>
      </EditPanelSection>

      {/* Description */}
      <EditPanelSection title="Description">
        <Textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Enter company description..."
          rows={4}
          className="resize-y"
        />
      </EditPanelSection>

      {/* Tags */}
      <EditPanelSection title="Tags">
        <TagsInput
          value={formData.tags}
          onChange={(v) => updateField('tags', v)}
          placeholder="Add tags..."
          allowCustom={true}
        />
      </EditPanelSection>
    </div>
  )
}

export default AccountIdentitySection
