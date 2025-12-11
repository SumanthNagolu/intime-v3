'use client'

/**
 * PCF-Compatible Section Adapters for Companies (Unified Accounts + Vendors)
 *
 * These section components work with the unified companies table and display
 * content based on the company's category (client, vendor, partner, prospect).
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import {
  Building2,
  MapPin,
  Phone,
  Globe,
  FileText,
  Activity,
  Users,
  DollarSign,
  Clock,
  Mail,
  Star,
  Shield,
  MessageSquare,
  CheckCircle,
  Briefcase,
  Target,
  TrendingUp,
} from 'lucide-react'

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Company {
  id: string
  org_id: string
  category: 'client' | 'vendor' | 'partner' | 'prospect'
  name: string
  legal_name?: string | null
  industry?: string | null
  sub_industry?: string | null
  status: string
  tier?: string | null
  segment?: string | null
  relationship_type?: string | null
  website?: string | null
  phone?: string | null
  linkedin_url?: string | null
  headquarters_city?: string | null
  headquarters_state?: string | null
  headquarters_country?: string | null
  timezone?: string | null
  employee_count?: number | null
  annual_revenue?: number | null
  founded_year?: number | null
  // Health & Scoring
  health_score?: number | null
  health_status?: string | null
  nps_score?: number | null
  // Activity tracking
  last_contacted_date?: string | null
  next_scheduled_contact?: string | null
  // Revenue
  lifetime_revenue?: number | null
  revenue_ytd?: number | null
  lifetime_placements?: number | null
  // MSP/VMS
  is_msp_program?: boolean
  vms_platform?: string | null
  our_msp_tier?: number | null
  // Financial
  default_payment_terms?: string | null
  default_markup_percentage?: number | null
  credit_limit?: number | null
  // Flags
  requires_po?: boolean
  allows_remote_work?: boolean
  // Owner
  owner?: { id: string; full_name: string; avatar_url?: string | null } | null
  account_manager?: { id: string; full_name: string; avatar_url?: string | null } | null
  // Extension data
  client_details?: {
    billing_email?: string | null
    billing_entity_name?: string | null
    po_required?: boolean
    qbr_frequency?: string | null
    wallet_share_percentage?: number | null
  } | null
  vendor_details?: {
    vendor_type?: string | null
    industry_focus?: string[] | null
    geographic_focus?: string[] | null
    payment_terms_to_us?: string | null
    typical_markup_to_client?: number | null
    is_blacklisted?: boolean
    blacklist_reason?: string | null
    supplies_talent?: boolean
  } | null
  tags?: string[] | null
  created_at: string
  updated_at?: string | null
}

interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US').format(value)
}

// ============================================
// OVERVIEW SECTION
// ============================================

export function CompanyOverviewSectionPCF({ entityId, entity }: PCFSectionProps) {
  const company = entity as Company | undefined

  if (!company) return null

  const isClient = company.category === 'client' || company.category === 'prospect'
  const isVendor = company.category === 'vendor'

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left - Main info */}
      <div className="col-span-2 space-y-6">
        {/* Company Details Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-charcoal-500">Company Name</span>
                <p className="font-medium text-lg">{company.name}</p>
              </div>
              {company.legal_name && company.legal_name !== company.name && (
                <div>
                  <span className="text-sm text-charcoal-500">Legal Name</span>
                  <p className="font-medium">{company.legal_name}</p>
                </div>
              )}
              {company.industry && (
                <div>
                  <span className="text-sm text-charcoal-500">Industry</span>
                  <p className="font-medium capitalize">{company.industry}</p>
                </div>
              )}
              {company.segment && (
                <div>
                  <span className="text-sm text-charcoal-500">Segment</span>
                  <p>
                    <Badge variant="outline" className="capitalize">{company.segment.replace('_', ' ')}</Badge>
                  </p>
                </div>
              )}
              {company.tier && (
                <div>
                  <span className="text-sm text-charcoal-500">Tier</span>
                  <p>
                    <Badge variant="outline" className="capitalize">{company.tier}</Badge>
                  </p>
                </div>
              )}
              {company.website && (
                <div>
                  <span className="text-sm text-charcoal-500">Website</span>
                  <p>
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-4 h-4" />
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </p>
                </div>
              )}
              {(company.headquarters_city || company.headquarters_state) && (
                <div>
                  <span className="text-sm text-charcoal-500">Location</span>
                  <p className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-charcoal-400" />
                    {[company.headquarters_city, company.headquarters_state, company.headquarters_country]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}
              {company.phone && (
                <div>
                  <span className="text-sm text-charcoal-500">Phone</span>
                  <p className="flex items-center gap-1">
                    <Phone className="w-4 h-4 text-charcoal-400" />
                    {company.phone}
                  </p>
                </div>
              )}
              {company.employee_count && (
                <div>
                  <span className="text-sm text-charcoal-500">Employees</span>
                  <p className="font-medium">{formatNumber(company.employee_count)}</p>
                </div>
              )}
              {company.founded_year && (
                <div>
                  <span className="text-sm text-charcoal-500">Founded</span>
                  <p className="font-medium">{company.founded_year}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Client-Specific Details */}
        {isClient && company.client_details && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Billing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {company.client_details.billing_entity_name && (
                  <div>
                    <span className="text-sm text-charcoal-500">Billing Entity</span>
                    <p className="font-medium">{company.client_details.billing_entity_name}</p>
                  </div>
                )}
                {company.client_details.billing_email && (
                  <div>
                    <span className="text-sm text-charcoal-500">Billing Email</span>
                    <p className="flex items-center gap-1">
                      <Mail className="w-4 h-4 text-charcoal-400" />
                      <a href={`mailto:${company.client_details.billing_email}`} className="text-blue-600 hover:underline">
                        {company.client_details.billing_email}
                      </a>
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-charcoal-500">PO Required</span>
                  <p className="font-medium">{company.client_details.po_required ? 'Yes' : 'No'}</p>
                </div>
                {company.client_details.qbr_frequency && (
                  <div>
                    <span className="text-sm text-charcoal-500">QBR Frequency</span>
                    <p className="font-medium capitalize">{company.client_details.qbr_frequency}</p>
                  </div>
                )}
                {company.client_details.wallet_share_percentage !== undefined && company.client_details.wallet_share_percentage !== null && (
                  <div>
                    <span className="text-sm text-charcoal-500">Wallet Share</span>
                    <p className="font-medium">{company.client_details.wallet_share_percentage}%</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vendor-Specific Details */}
        {isVendor && company.vendor_details && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Vendor Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {company.vendor_details.vendor_type && (
                  <div>
                    <span className="text-sm text-charcoal-500">Vendor Type</span>
                    <p>
                      <Badge variant="outline" className="capitalize">
                        {company.vendor_details.vendor_type.replace(/_/g, ' ')}
                      </Badge>
                    </p>
                  </div>
                )}
                {company.vendor_details.industry_focus && company.vendor_details.industry_focus.length > 0 && (
                  <div>
                    <span className="text-sm text-charcoal-500">Industry Focus</span>
                    <p className="flex flex-wrap gap-1 mt-1">
                      {company.vendor_details.industry_focus.map((industry) => (
                        <Badge key={industry} variant="secondary" className="capitalize text-xs">
                          {industry}
                        </Badge>
                      ))}
                    </p>
                  </div>
                )}
                {company.vendor_details.geographic_focus && company.vendor_details.geographic_focus.length > 0 && (
                  <div>
                    <span className="text-sm text-charcoal-500">Geographic Focus</span>
                    <p className="flex flex-wrap gap-1 mt-1">
                      {company.vendor_details.geographic_focus.map((region) => (
                        <Badge key={region} variant="secondary" className="text-xs">
                          {region}
                        </Badge>
                      ))}
                    </p>
                  </div>
                )}
                {company.vendor_details.payment_terms_to_us && (
                  <div>
                    <span className="text-sm text-charcoal-500">Payment Terms</span>
                    <p className="font-medium">{company.vendor_details.payment_terms_to_us}</p>
                  </div>
                )}
                {company.vendor_details.typical_markup_to_client !== undefined && company.vendor_details.typical_markup_to_client !== null && (
                  <div>
                    <span className="text-sm text-charcoal-500">Typical Markup</span>
                    <p className="font-medium">{company.vendor_details.typical_markup_to_client}%</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-charcoal-500">Supplies Talent</span>
                  <p className="font-medium">{company.vendor_details.supplies_talent ? 'Yes' : 'No'}</p>
                </div>
              </div>
              {company.vendor_details.is_blacklisted && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Blacklisted
                  </p>
                  {company.vendor_details.blacklist_reason && (
                    <p className="text-sm text-red-700 mt-1">{company.vendor_details.blacklist_reason}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {company.tags && company.tags.length > 0 && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {company.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Health Score */}
        {company.health_score !== null && company.health_score !== undefined && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-4xl font-bold ${
                  company.health_score >= 70 ? 'text-green-600' :
                  company.health_score >= 40 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {company.health_score}
                </div>
                <p className="text-sm text-charcoal-500 mt-1 capitalize">
                  {company.health_status?.replace('_', ' ') || 'Unknown'}
                </p>
              </div>
              {company.nps_score !== null && company.nps_score !== undefined && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-500">NPS Score</span>
                    <span className="font-medium">{company.nps_score}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Financial Summary */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {company.annual_revenue !== null && company.annual_revenue !== undefined && (
              <div className="flex justify-between">
                <span className="text-charcoal-500">Annual Revenue</span>
                <span className="font-medium">{formatCurrency(company.annual_revenue)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-charcoal-500">Payment Terms</span>
              <span className="font-medium">{company.default_payment_terms || 'Net 30'}</span>
            </div>
            {company.default_markup_percentage !== null && company.default_markup_percentage !== undefined && (
              <div className="flex justify-between">
                <span className="text-charcoal-500">Default Markup</span>
                <span className="font-medium">{company.default_markup_percentage}%</span>
              </div>
            )}
            {company.credit_limit !== null && company.credit_limit !== undefined && (
              <div className="flex justify-between">
                <span className="text-charcoal-500">Credit Limit</span>
                <span className="font-medium">{formatCurrency(company.credit_limit)}</span>
              </div>
            )}
            {company.lifetime_revenue !== null && company.lifetime_revenue !== undefined && (
              <div className="flex justify-between pt-3 border-t">
                <span className="text-charcoal-500">Lifetime Revenue</span>
                <span className="font-medium">{formatCurrency(company.lifetime_revenue)}</span>
              </div>
            )}
            {company.revenue_ytd !== null && company.revenue_ytd !== undefined && (
              <div className="flex justify-between">
                <span className="text-charcoal-500">Revenue YTD</span>
                <span className="font-medium">{formatCurrency(company.revenue_ytd)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* MSP/VMS Info */}
        {company.is_msp_program && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                MSP Program
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {company.vms_platform && (
                <div className="flex justify-between">
                  <span className="text-charcoal-500">VMS Platform</span>
                  <span className="font-medium capitalize">{company.vms_platform}</span>
                </div>
              )}
              {company.our_msp_tier !== null && company.our_msp_tier !== undefined && (
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Our MSP Tier</span>
                  <span className="font-medium">Tier {company.our_msp_tier}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Assignment */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-charcoal-500">Owner</span>
              <p className="font-medium">{company.owner?.full_name || 'Unassigned'}</p>
            </div>
            {company.account_manager && (
              <div>
                <span className="text-sm text-charcoal-500">Account Manager</span>
                <p className="font-medium">{company.account_manager.full_name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Created</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(company.created_at), { addSuffix: true })}
              </span>
            </div>
            {company.updated_at && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Last Updated</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(company.updated_at), { addSuffix: true })}
                </span>
              </div>
            )}
            {company.last_contacted_date && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Last Contact</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(company.last_contacted_date), { addSuffix: true })}
                </span>
              </div>
            )}
            {company.next_scheduled_contact && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Next Contact</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(company.next_scheduled_contact), { addSuffix: true })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// CONTACTS SECTION
// ============================================

export function CompanyContactsSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Contacts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <Users className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No contacts linked to this company yet</p>
          <p className="text-sm mt-2">Add contacts to track your relationships</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// JOBS SECTION
// ============================================

export function CompanyJobsSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Jobs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <Briefcase className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No active jobs for this company</p>
          <p className="text-sm mt-2">Create a job to start recruiting</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// PLACEMENTS SECTION
// ============================================

export function CompanyPlacementsSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Placements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <CheckCircle className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No placements for this company yet</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// TEAM SECTION
// ============================================

export function CompanyTeamSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Team
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <Users className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No team members assigned yet</p>
          <p className="text-sm mt-2">Add team members to collaborate on this account</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// ACTIVITIES SECTION
// ============================================

export function CompanyActivitiesSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <Activity className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No activities recorded yet</p>
          <p className="text-sm mt-2">Log your first activity to track engagement</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// NOTES SECTION
// ============================================

export function CompanyNotesSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <MessageSquare className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No notes yet</p>
          <p className="text-sm mt-2">Add notes to capture important information</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// COMPLIANCE SECTION
// ============================================

export function CompanyComplianceSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Compliance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <Shield className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No compliance requirements set</p>
          <p className="text-sm mt-2">Configure compliance requirements for this company</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// DOCUMENTS SECTION
// ============================================

export function CompanyDocumentsSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <FileText className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No documents uploaded yet</p>
          <p className="text-sm mt-2">Upload contracts, agreements, and other files</p>
        </div>
      </CardContent>
    </Card>
  )
}
