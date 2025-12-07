'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Megaphone,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { toast } from 'sonner'
import { CreateCampaignDialog } from './CreateCampaignDialog'
import { DuplicateCampaignDialog } from './DuplicateCampaignDialog'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-purple-100 text-purple-700',
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
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<{ id: string; name: string } | null>(null)

  const utils = trpc.useUtils()

  const { data, isLoading, refetch } = trpc.crm.campaigns.list.useQuery({
    search: search || undefined,
    status: statusFilter as 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'all',
    type: typeFilter as 'lead_generation' | 're_engagement' | 'event_promotion' | 'brand_awareness' | 'candidate_sourcing' | 'all',
    limit: 50,
  })

  const updateStatus = trpc.crm.campaigns.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Campaign status updated')
      utils.crm.campaigns.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status')
    },
  })

  const deleteCampaign = trpc.crm.campaigns.delete.useMutation({
    onSuccess: () => {
      toast.success('Campaign deleted')
      utils.crm.campaigns.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete campaign')
    },
  })

  const campaigns = data?.items ?? []
  const total = data?.total ?? 0

  // Calculate summary stats
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalLeads = campaigns.reduce((sum, c) => sum + (c.leadsGenerated || 0), 0)
  const totalMeetings = campaigns.reduce((sum, c) => sum + (c.meetingsBooked || 0), 0)

  const handleToggleStatus = (campaign: { id: string; status: string }) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active'
    updateStatus.mutate({ id: campaign.id, status: newStatus })
  }

  const handleDuplicate = (campaign: { id: string; name: string }) => {
    setSelectedCampaign(campaign)
    setDuplicateOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      deleteCampaign.mutate({ id })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-charcoal-900">Campaigns</h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Manage outreach campaigns and track lead generation
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-hublot-100 rounded-lg">
                <Megaphone className="w-5 h-5 text-hublot-700" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Total Campaigns</p>
                <p className="text-2xl font-semibold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Active Campaigns</p>
                <p className="text-2xl font-semibold">{activeCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Total Leads</p>
                <p className="text-2xl font-semibold">{totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gold-100 rounded-lg">
                <Calendar className="w-5 h-5 text-gold-700" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Meetings Booked</p>
                <p className="text-2xl font-semibold">{totalMeetings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <Input
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
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
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Megaphone className="w-12 h-12 text-charcoal-300 mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900">No campaigns yet</h3>
              <p className="text-sm text-charcoal-500 mt-1 mb-4">
                Create your first campaign to start generating leads
              </p>
              <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Channels</TableHead>
                  <TableHead className="text-right">Audience</TableHead>
                  <TableHead className="text-right">Responses</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Progress</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const progress = campaign.targetLeads > 0
                    ? Math.round((campaign.leadsGenerated / campaign.targetLeads) * 100)
                    : 0

                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <Link
                          href={`/employee/crm/campaigns/${campaign.id}`}
                          className="block hover:underline"
                        >
                          <div className="font-medium text-charcoal-900">{campaign.name}</div>
                          <div className="flex items-center gap-2 text-sm text-charcoal-500">
                            <Badge variant="outline" className="text-xs">
                              {typeLabels[campaign.campaignType] || campaign.campaignType}
                            </Badge>
                            {campaign.startDate && (
                              <span>
                                {format(new Date(campaign.startDate), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[campaign.status]}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          {campaign.channels?.map((channel: string) => (
                            <div
                              key={channel}
                              className="p-1.5 bg-charcoal-100 rounded text-charcoal-600"
                              title={channel}
                            >
                              {channelIcons[channel] || channel[0].toUpperCase()}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">{campaign.audienceSize?.toLocaleString() || 0}</div>
                        <div className="text-xs text-charcoal-500">
                          {campaign.prospectsContacted || 0} contacted
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">{campaign.prospectsResponded || 0}</div>
                        <div className="text-xs text-charcoal-500">
                          {campaign.prospectsContacted > 0
                            ? Math.round((campaign.prospectsResponded / campaign.prospectsContacted) * 100)
                            : 0}% rate
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium text-green-600">{campaign.leadsGenerated || 0}</div>
                        <div className="text-xs text-charcoal-500">
                          {campaign.meetingsBooked || 0} meetings
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-charcoal-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-10 text-right">
                            {progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/employee/crm/campaigns/${campaign.id}`}>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
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
                                    Resume Campaign
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
                              className="text-red-600"
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
    </div>
  )
}
