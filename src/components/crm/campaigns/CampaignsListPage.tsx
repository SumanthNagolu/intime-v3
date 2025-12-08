'use client'

import { useState, useMemo } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Plus,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  Trash2,
  BarChart3,
  Users,
  Target,
  Calendar,
  Mail,
  Linkedin,
  Phone,
  TrendingUp,
  TrendingDown,
  Megaphone,
  Loader2,
  RefreshCw,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Filter,
  X,
  Zap,
  Clock,
  Save,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { CreateCampaignDialog } from './CreateCampaignDialog'
import { DuplicateCampaignDialog } from './DuplicateCampaignDialog'
import { cn } from '@/lib/utils'

// Types
interface Campaign {
  id: string
  name: string
  status: string
  campaignType: string
  channels?: string[]
  startDate?: string
  endDate?: string
  audienceSize?: number
  prospectsContacted?: number
  prospectsResponded?: number
  leadsGenerated?: number
  meetingsBooked?: number
  targetLeads?: number
}

type SortField = 'name' | 'status' | 'audienceSize' | 'leadsGenerated' | 'startDate' | 'progress'
type SortDirection = 'asc' | 'desc'

// Quick filter presets
const QUICK_FILTERS = [
  { id: 'all', label: 'All Campaigns', status: 'all', type: 'all' },
  { id: 'active', label: 'Active', status: 'active', type: 'all' },
  { id: 'draft', label: 'Drafts', status: 'draft', type: 'all' },
  { id: 'lead_gen', label: 'Lead Gen', status: 'all', type: 'lead_generation' },
  { id: 'sourcing', label: 'Sourcing', status: 'all', type: 'candidate_sourcing' },
]

const statusColors: Record<string, string> = {
  draft: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-violet-50 text-violet-700 border-violet-200',
}

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Clock className="w-3 h-3" />,
  scheduled: <Calendar className="w-3 h-3" />,
  active: <Zap className="w-3 h-3" />,
  paused: <Pause className="w-3 h-3" />,
  completed: <CheckCircle className="w-3 h-3" />,
}

const typeLabels: Record<string, string> = {
  lead_generation: 'Lead Gen',
  re_engagement: 'Re-Engagement',
  event_promotion: 'Event',
  brand_awareness: 'Brand',
  candidate_sourcing: 'Sourcing',
}

const channelIcons: Record<string, React.ReactNode> = {
  email: <Mail className="w-3.5 h-3.5" />,
  linkedin: <Linkedin className="w-3.5 h-3.5" />,
  phone: <Phone className="w-3.5 h-3.5" />,
}

export function CampaignsListPage() {
  // State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [activeQuickFilter, setActiveQuickFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<{ id: string; name: string } | null>(null)
  
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false)
  const [bulkAction, setBulkAction] = useState<'pause' | 'resume' | 'delete' | null>(null)
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('startDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const utils = trpc.useUtils()

  const { data, isLoading, refetch } = trpc.crm.campaigns.list.useQuery({
    search: search || undefined,
    status: statusFilter as 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'all',
    type: typeFilter as 'lead_generation' | 're_engagement' | 'event_promotion' | 'brand_awareness' | 'candidate_sourcing' | 'all',
    limit: 100,
  })

  const updateStatus = trpc.crm.campaigns.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Campaign status updated')
      utils.crm.campaigns.list.invalidate()
      setSelectedIds(new Set())
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status')
    },
  })

  const deleteCampaign = trpc.crm.campaigns.delete.useMutation({
    onSuccess: () => {
      toast.success('Campaign deleted')
      utils.crm.campaigns.list.invalidate()
      setSelectedIds(new Set())
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete campaign')
    },
  })

  const campaigns = data?.items ?? []
  const total = data?.total ?? 0

  // Sort campaigns
  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'audienceSize':
          comparison = (a.audienceSize || 0) - (b.audienceSize || 0)
          break
        case 'leadsGenerated':
          comparison = (a.leadsGenerated || 0) - (b.leadsGenerated || 0)
          break
        case 'startDate':
          comparison = new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime()
          break
        case 'progress':
          const progressA = a.targetLeads ? (a.leadsGenerated || 0) / a.targetLeads : 0
          const progressB = b.targetLeads ? (b.leadsGenerated || 0) / b.targetLeads : 0
          comparison = progressA - progressB
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [campaigns, sortField, sortDirection])

  // Calculate summary stats with trends
  const stats = useMemo(() => {
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length
    const totalLeads = campaigns.reduce((sum, c) => sum + (c.leadsGenerated || 0), 0)
    const totalMeetings = campaigns.reduce((sum, c) => sum + (c.meetingsBooked || 0), 0)
    const avgConversion = campaigns.length > 0
      ? campaigns.reduce((sum, c) => {
          const contacted = c.prospectsContacted || 0
          const leads = c.leadsGenerated || 0
          return sum + (contacted > 0 ? (leads / contacted) * 100 : 0)
        }, 0) / campaigns.length
      : 0
    
    return { activeCampaigns, totalLeads, totalMeetings, avgConversion }
  }, [campaigns])

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleQuickFilter = (filter: typeof QUICK_FILTERS[0]) => {
    setActiveQuickFilter(filter.id)
    setStatusFilter(filter.status)
    setTypeFilter(filter.type)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedCampaigns.map(c => c.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) {
      newSet.add(id)
    } else {
      newSet.delete(id)
    }
    setSelectedIds(newSet)
  }

  const handleBulkAction = (action: 'pause' | 'resume' | 'delete') => {
    setBulkAction(action)
    setBulkActionDialogOpen(true)
  }

  const executeBulkAction = async () => {
    const ids = Array.from(selectedIds)
    
    if (bulkAction === 'delete') {
      // Delete one by one
      for (const id of ids) {
        await deleteCampaign.mutateAsync({ id })
      }
      toast.success(`${ids.length} campaigns deleted`)
    } else if (bulkAction === 'pause' || bulkAction === 'resume') {
      const newStatus = bulkAction === 'pause' ? 'paused' : 'active'
      for (const id of ids) {
        await updateStatus.mutateAsync({ id, status: newStatus })
      }
      toast.success(`${ids.length} campaigns ${bulkAction === 'pause' ? 'paused' : 'resumed'}`)
    }
    
    setBulkActionDialogOpen(false)
    setBulkAction(null)
    setSelectedIds(new Set())
  }

  const handleExport = () => {
    const exportData = sortedCampaigns.map(c => ({
      Name: c.name,
      Status: c.status,
      Type: typeLabels[c.campaignType] || c.campaignType,
      Channels: c.channels?.join(', ') || '',
      'Start Date': c.startDate ? format(new Date(c.startDate), 'yyyy-MM-dd') : '',
      'Audience Size': c.audienceSize || 0,
      Contacted: c.prospectsContacted || 0,
      Responded: c.prospectsResponded || 0,
      Leads: c.leadsGenerated || 0,
      Meetings: c.meetingsBooked || 0,
    }))
    
    const csv = [
      Object.keys(exportData[0] || {}).join(','),
      ...exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `campaigns-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Campaigns exported successfully')
  }

  const handleToggleStatus = (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active'
    updateStatus.mutate({ id: campaign.id, status: newStatus })
  }

  const handleDuplicate = (campaign: Campaign) => {
    setSelectedCampaign({ id: campaign.id, name: campaign.name })
    setDuplicateOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteCampaign.mutate({ id })
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-charcoal-50 select-none transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5 text-hublot-600" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-hublot-600" />
          )
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-300" />
        )}
      </div>
    </TableHead>
  )

  const isAllSelected = sortedCampaigns.length > 0 && selectedIds.size === sortedCampaigns.length
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < sortedCampaigns.length

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-heading font-semibold text-charcoal-900 tracking-tight">
              Campaigns
            </h1>
            <p className="text-sm text-charcoal-500 mt-1">
              Manage outreach campaigns and track lead generation performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export to CSV</TooltipContent>
            </Tooltip>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-hublot-500 hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">
                    Total Campaigns
                  </p>
                  <p className="text-3xl font-bold text-charcoal-900 mt-1">{total}</p>
                </div>
                <div className="p-3 bg-hublot-50 rounded-xl">
                  <Megaphone className="w-6 h-6 text-hublot-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">
                    Active Campaigns
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-3xl font-bold text-charcoal-900">{stats.activeCampaigns}</p>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Running
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <Play className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">
                    Total Leads
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-3xl font-bold text-charcoal-900">{stats.totalLeads}</p>
                    {stats.avgConversion > 0 && (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stats.avgConversion.toFixed(1)}% CVR
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">
                    Meetings Booked
                  </p>
                  <p className="text-3xl font-bold text-charcoal-900 mt-1">{stats.totalMeetings}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {QUICK_FILTERS.map((filter) => (
            <Button
              key={filter.id}
              variant={activeQuickFilter === filter.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter(filter)}
              className={cn(
                'transition-all',
                activeQuickFilter === filter.id && 'shadow-sm'
              )}
            >
              {filter.label}
            </Button>
          ))}
          
          {(statusFilter !== 'all' || typeFilter !== 'all' || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter('all')
                setTypeFilter('all')
                setSearch('')
                setActiveQuickFilter('all')
              }}
              className="text-charcoal-500 hover:text-charcoal-700"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Filters & Search Bar */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  placeholder="Search campaigns by name, description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setActiveQuickFilter('custom') }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setActiveQuickFilter('custom') }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="lead_generation">Lead Generation</SelectItem>
                  <SelectItem value="re_engagement">Re-Engagement</SelectItem>
                  <SelectItem value="event_promotion">Event Promotion</SelectItem>
                  <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                  <SelectItem value="candidate_sourcing">Candidate Sourcing</SelectItem>
                </SelectContent>
              </Select>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => refetch()}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <Card className="bg-hublot-50 border-hublot-200">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-hublot-100 text-hublot-800">
                    {selectedIds.size} selected
                  </Badge>
                  <span className="text-sm text-charcoal-600">
                    Select campaigns to perform bulk actions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('pause')}
                    className="gap-1.5"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('resume')}
                    className="gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Resume
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds(new Set())}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaigns Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-hublot-500" />
                  <p className="text-sm text-charcoal-500">Loading campaigns...</p>
                </div>
              </div>
            ) : sortedCampaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="p-4 bg-charcoal-50 rounded-full mb-4">
                  <Megaphone className="w-10 h-10 text-charcoal-300" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal-900">No campaigns found</h3>
                <p className="text-sm text-charcoal-500 mt-1 mb-6 text-center max-w-sm">
                  {search || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters or search terms'
                    : 'Create your first campaign to start generating leads'}
                </p>
                <Button onClick={() => setCreateOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Campaign
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-charcoal-50/50 hover:bg-charcoal-50/50">
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) (el as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = isSomeSelected
                        }}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <SortableHeader field="name">Campaign</SortableHeader>
                    <SortableHeader field="status">Status</SortableHeader>
                    <TableHead>Channels</TableHead>
                    <SortableHeader field="audienceSize">
                      <span className="text-right">Audience</span>
                    </SortableHeader>
                    <TableHead className="text-right">Responses</TableHead>
                    <SortableHeader field="leadsGenerated">
                      <span className="text-right">Leads</span>
                    </SortableHeader>
                    <SortableHeader field="progress">
                      <span className="text-right">Progress</span>
                    </SortableHeader>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCampaigns.map((campaign) => {
                    const progress = campaign.targetLeads && campaign.targetLeads > 0
                      ? Math.round(((campaign.leadsGenerated || 0) / campaign.targetLeads) * 100)
                      : 0
                    const isSelected = selectedIds.has(campaign.id)

                    return (
                      <TableRow 
                        key={campaign.id}
                        className={cn(
                          'group transition-colors',
                          isSelected && 'bg-hublot-50/50'
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectOne(campaign.id, !!checked)}
                            aria-label={`Select ${campaign.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/employee/crm/campaigns/${campaign.id}`}
                            className="block group/link"
                          >
                            <div className="font-medium text-charcoal-900 group-hover/link:text-hublot-600 transition-colors">
                              {campaign.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs font-normal">
                                {typeLabels[campaign.campaignType] || campaign.campaignType}
                              </Badge>
                              {campaign.startDate && (
                                <span className="text-xs text-charcoal-400">
                                  {format(new Date(campaign.startDate), 'MMM d, yyyy')}
                                </span>
                              )}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={cn(
                              'gap-1 font-medium border',
                              statusColors[campaign.status]
                            )}
                          >
                            {statusIcons[campaign.status]}
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {campaign.channels?.map((channel: string) => (
                              <Tooltip key={channel}>
                                <TooltipTrigger asChild>
                                  <div className="p-1.5 bg-charcoal-100 rounded-md text-charcoal-600 hover:bg-charcoal-200 transition-colors">
                                    {channelIcons[channel] || channel[0].toUpperCase()}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="capitalize">{channel}</TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold tabular-nums">
                            {(campaign.audienceSize || 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-charcoal-500">
                            {campaign.prospectsContacted || 0} contacted
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold tabular-nums">
                            {campaign.prospectsResponded || 0}
                          </div>
                          <div className="text-xs text-charcoal-500">
                            {(campaign.prospectsContacted || 0) > 0
                              ? Math.round(((campaign.prospectsResponded || 0) / (campaign.prospectsContacted || 1)) * 100)
                              : 0}% rate
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold text-emerald-600 tabular-nums">
                            {campaign.leadsGenerated || 0}
                          </div>
                          <div className="text-xs text-charcoal-500">
                            {campaign.meetingsBooked || 0} meetings
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 h-2 bg-charcoal-100 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full transition-all duration-500',
                                  progress >= 100 ? 'bg-emerald-500' : 
                                  progress >= 75 ? 'bg-blue-500' : 
                                  progress >= 50 ? 'bg-amber-500' : 'bg-charcoal-300'
                                )}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            <span className={cn(
                              'text-sm font-semibold tabular-nums w-12 text-right',
                              progress >= 100 ? 'text-emerald-600' : 'text-charcoal-600'
                            )}>
                              {progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link href={`/employee/crm/campaigns/${campaign.id}`}>
                                  <BarChart3 className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/employee/crm/campaigns/${campaign.id}?section=analytics`}>
                                  <TrendingUp className="w-4 h-4 mr-2" />
                                  View Analytics
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {campaign.status !== 'completed' && (
                                <DropdownMenuItem onClick={() => handleToggleStatus(campaign)}>
                                  {campaign.status === 'active' ? (
                                    <>
                                      <Pause className="w-4 h-4 mr-2" />
                                      Pause Campaign
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4 mr-2" />
                                      {campaign.status === 'draft' ? 'Start' : 'Resume'} Campaign
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDuplicate(campaign)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(campaign.id)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Footer Stats */}
        {sortedCampaigns.length > 0 && (
          <div className="flex items-center justify-between text-sm text-charcoal-500">
            <span>
              Showing {sortedCampaigns.length} of {total} campaigns
            </span>
            <span>
              Last updated: {format(new Date(), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
        )}

        {/* Dialogs */}
        <CreateCampaignDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={() => {
            utils.crm.campaigns.list.invalidate()
          }}
        />

        {selectedCampaign && (
          <DuplicateCampaignDialog
            open={duplicateOpen}
            onOpenChange={setDuplicateOpen}
            campaignId={selectedCampaign.id}
            originalName={selectedCampaign.name}
            onSuccess={() => {
              utils.crm.campaigns.list.invalidate()
              setSelectedCampaign(null)
            }}
          />
        )}

        {/* Bulk Action Confirmation Dialog */}
        <AlertDialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {bulkAction === 'delete' ? 'Delete Campaigns' : 
                 bulkAction === 'pause' ? 'Pause Campaigns' : 'Resume Campaigns'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {bulkAction === 'delete' 
                  ? `Are you sure you want to delete ${selectedIds.size} campaigns? This action cannot be undone.`
                  : `Are you sure you want to ${bulkAction} ${selectedIds.size} campaigns?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={executeBulkAction}
                className={cn(
                  bulkAction === 'delete' && 'bg-red-600 hover:bg-red-700'
                )}
              >
                {bulkAction === 'delete' ? 'Delete' : 
                 bulkAction === 'pause' ? 'Pause' : 'Resume'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
