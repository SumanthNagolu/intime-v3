'use client'

import { useState, useTransition, lazy, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

// Dynamic imports for heavy dialogs - only loaded when needed
const CreateLeadDialog = lazy(() => import('./CreateLeadDialog').then(m => ({ default: m.CreateLeadDialog })))
const QualifyLeadDialog = lazy(() => import('./QualifyLeadDialog').then(m => ({ default: m.QualifyLeadDialog })))
const ConvertLeadDialog = lazy(() => import('./ConvertLeadDialog').then(m => ({ default: m.ConvertLeadDialog })))
import {
  Plus,
  Search,
  Target,
  Building2,
  User,
  Clock,
  ChevronRight,
  MoreVertical,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

type LeadStatus = 'all' | 'new' | 'contacted' | 'qualified' | 'unqualified' | 'nurture' | 'converted'
type LeadSource = 'all' | 'linkedin' | 'referral' | 'cold_outreach' | 'inbound' | 'event' | 'website' | 'other'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: 'New', color: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200', icon: <UserPlus className="w-3 h-3" /> },
  contacted: { label: 'Contacted', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Phone className="w-3 h-3" /> },
  qualified: { label: 'Qualified', color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle2 className="w-3 h-3" /> },
  unqualified: { label: 'Unqualified', color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle className="w-3 h-3" /> },
  nurture: { label: 'Nurture', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Clock className="w-3 h-3" /> },
  converted: { label: 'Converted', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <ArrowRight className="w-3 h-3" /> },
}

const SOURCE_CONFIG: Record<string, { label: string; color: string }> = {
  linkedin: { label: 'LinkedIn', color: 'bg-blue-600 text-white' },
  referral: { label: 'Referral', color: 'bg-green-600 text-white' },
  cold_outreach: { label: 'Cold Outreach', color: 'bg-charcoal-600 text-white' },
  inbound: { label: 'Inbound', color: 'bg-amber-600 text-white' },
  event: { label: 'Event', color: 'bg-purple-600 text-white' },
  website: { label: 'Website', color: 'bg-cyan-600 text-white' },
  other: { label: 'Other', color: 'bg-charcoal-400 text-white' },
}

interface Lead {
  id: string
  company_name?: string | null
  first_name?: string | null
  last_name?: string | null
  title?: string | null
  email?: string | null
  phone?: string | null
  industry?: string | null
  lead_type: string
  status: string
  source: string
  bant_total_score?: number | null
  estimated_value?: number | null
  skills_needed?: string[] | null
  created_at?: string | null
}

interface LeadStats {
  total: number
  byStatus?: Record<string, number>
  conversionRate?: number
}

interface LeadsListClientProps {
  initialLeads: Lead[]
  initialTotal: number
  initialStats: LeadStats | null
  initialSearch: string
  initialStatus: string
  initialSource: string
}

export function LeadsListClient({
  initialLeads,
  initialTotal,
  initialStats,
  initialSearch,
  initialStatus,
  initialSource,
}: LeadsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<LeadStatus>((initialStatus as LeadStatus) || 'all')
  const [sourceFilter, setSourceFilter] = useState<LeadSource>((initialSource as LeadSource) || 'all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [qualifyLead, setQualifyLead] = useState<Lead | null>(null)
  const [convertLead, setConvertLead] = useState<Lead | null>(null)

  // Use server data as initial, allow client refetch for mutations
  const leadsQuery = trpc.crm.leads.list.useQuery(
    {
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter : 'all',
      source: sourceFilter !== 'all' ? sourceFilter : undefined,
      limit: 50,
      offset: 0,
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    {
      initialData: { items: initialLeads, total: initialTotal },
      enabled: search !== initialSearch || statusFilter !== (initialStatus || 'all') || sourceFilter !== (initialSource || 'all'),
    }
  )

  const statsQuery = trpc.crm.leads.getStats.useQuery({ period: 'month' }, {
    initialData: initialStats,
    staleTime: 60 * 1000,
  })

  const leads = leadsQuery.data?.items || initialLeads
  const total = leadsQuery.data?.total || initialTotal
  const stats = statsQuery.data || initialStats

  const handleLeadClick = (leadId: string) => {
    router.push(`/employee/crm/leads/${leadId}`)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
      router.replace(`?${params.toString()}`)
    })
  }

  const handleStatusChange = (value: LeadStatus) => {
    setStatusFilter(value)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value !== 'all') {
        params.set('status', value)
      } else {
        params.delete('status')
      }
      router.replace(`?${params.toString()}`)
    })
  }

  const handleSourceChange = (value: LeadSource) => {
    setSourceFilter(value)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value !== 'all') {
        params.set('source', value)
      } else {
        params.delete('source')
      }
      router.replace(`?${params.toString()}`)
    })
  }

  return (
    <div className="min-h-screen bg-cream" data-testid="page-content">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-charcoal-900">Leads</h1>
            <p className="text-charcoal-500 mt-1">
              Prospect and qualify potential clients
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-5 h-5 text-charcoal-400" />
                <span className="text-sm text-charcoal-500">Total</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900">
                {stats?.total ?? '-'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-charcoal-500">New</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900">
                {stats?.byStatus?.new ?? '-'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-charcoal-500">Qualified</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900">
                {stats?.byStatus?.qualified ?? '-'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <ArrowRight className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-charcoal-500">Converted</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900">
                {stats?.byStatus?.converted ?? '-'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-gold-500" />
                <span className="text-sm text-charcoal-500">Conv. Rate</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900">
                {stats?.conversionRate ?? 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search by company, name, or email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="unqualified">Unqualified</SelectItem>
              <SelectItem value="nurture">Nurture</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={handleSourceChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
              <SelectItem value="inbound">Inbound</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-charcoal-500">
            {`${total} leads found`}
          </p>
        </div>

        {/* Leads List */}
        {leads.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="py-12 text-center">
              <Target className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 mb-2">No leads found</h3>
              <p className="text-charcoal-500 mb-4">
                {search || statusFilter !== 'all' || sourceFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first lead to get started'}
              </p>
              {!search && statusFilter === 'all' && sourceFilter === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lead
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => {
              const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new
              const sourceConfig = SOURCE_CONFIG[lead.source] || SOURCE_CONFIG.other
              const displayName = lead.company_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown'
              const bantScore = lead.bant_total_score || 0

              return (
                <Card
                  key={lead.id}
                  className="bg-white cursor-pointer hover:shadow-elevation-sm transition-all duration-300"
                  onClick={() => handleLeadClick(lead.id)}
                  onMouseEnter={() => router.prefetch(`/employee/crm/leads/${lead.id}`)}
                  data-testid="lead-card"
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-full bg-hublot-100 flex items-center justify-center flex-shrink-0">
                        {lead.lead_type === 'company' ? (
                          <Building2 className="w-6 h-6 text-hublot-900" />
                        ) : (
                          <User className="w-6 h-6 text-hublot-900" />
                        )}
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-charcoal-900 truncate">
                            {displayName}
                          </h3>
                          <Badge className={cn('text-xs', statusConfig.color)}>
                            {statusConfig.label}
                          </Badge>
                          <Badge className={cn('text-xs', sourceConfig.color)}>
                            {sourceConfig.label}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-500 mb-2">
                          {lead.title && <span>{lead.title}</span>}
                          {lead.industry && <span>{lead.industry}</span>}
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </span>
                          )}
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </span>
                          )}
                          {lead.created_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>

                        {/* BANT Score */}
                        {bantScore > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-charcoal-500">BANT:</span>
                            <Progress value={bantScore} className="w-24 h-2" />
                            <span className={cn(
                              'text-xs font-medium',
                              bantScore >= 75 ? 'text-green-600' :
                              bantScore >= 50 ? 'text-blue-600' :
                              bantScore >= 25 ? 'text-amber-600' : 'text-charcoal-500'
                            )}>
                              {bantScore}/100
                            </span>
                          </div>
                        )}

                        {/* Skills */}
                        {lead.skills_needed && lead.skills_needed.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {lead.skills_needed.slice(0, 4).map((skill: string) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 bg-charcoal-50 text-charcoal-600 text-xs rounded"
                              >
                                {skill}
                              </span>
                            ))}
                            {lead.skills_needed.length > 4 && (
                              <span className="text-xs text-charcoal-400">
                                +{lead.skills_needed.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Estimated Value */}
                      {lead.estimated_value && (
                        <div className="text-right mr-4">
                          <div className="text-sm font-semibold text-charcoal-900">
                            ${lead.estimated_value.toLocaleString()}
                          </div>
                          <div className="text-xs text-charcoal-500">Est. Value</div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              handleLeadClick(lead.id)
                            }}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              setQualifyLead(lead)
                            }}>
                              Qualify Lead
                            </DropdownMenuItem>
                            {lead.status === 'qualified' && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                setConvertLead(lead)
                              }}>
                                Convert to Deal
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Delete Lead
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <ChevronRight className="w-5 h-5 text-charcoal-400 flex-shrink-0" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Results count */}
        {leads.length > 0 && (
          <p className="text-sm text-charcoal-500 mt-4">
            Showing {leads.length} of {total} leads
          </p>
        )}
      </div>

      {/* Create Lead Dialog - lazy loaded */}
      {showCreateDialog && (
        <Suspense fallback={null}>
          <CreateLeadDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
          />
        </Suspense>
      )}

      {/* Qualify Lead Dialog - lazy loaded */}
      {qualifyLead && (
        <Suspense fallback={null}>
          <QualifyLeadDialog
            lead={qualifyLead}
            open={!!qualifyLead}
            onOpenChange={(open) => !open && setQualifyLead(null)}
            onSuccess={() => {
              setQualifyLead(null)
              leadsQuery.refetch()
            }}
          />
        </Suspense>
      )}

      {/* Convert Lead Dialog - lazy loaded */}
      {convertLead && (
        <Suspense fallback={null}>
          <ConvertLeadDialog
            lead={convertLead}
            open={!!convertLead}
            onOpenChange={(open) => !open && setConvertLead(null)}
          />
        </Suspense>
      )}
    </div>
  )
}
