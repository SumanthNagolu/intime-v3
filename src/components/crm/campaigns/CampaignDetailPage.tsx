'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  Play,
  Pause,
  Settings,
  MoreHorizontal,
  Mail,
  Linkedin,
  Phone,
  Users,
  Target,
  Calendar,
  DollarSign,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  Loader2,
  ExternalLink,
  UserPlus,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ConvertProspectDialog } from './ConvertProspectDialog'
import { EditCampaignDialog } from './EditCampaignDialog'

interface CampaignDetailPageProps {
  campaignId: string
}

interface ProspectData {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  company_name?: string
  title?: string
  status: string
  response_type?: string
  response_text?: string
  engagement_score?: number
  converted_lead_id?: string
  linkedin_url?: string
  responded_at?: string
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-purple-100 text-purple-700',
}

const prospectStatusColors: Record<string, string> = {
  enrolled: 'bg-gray-100 text-gray-700',
  contacted: 'bg-blue-100 text-blue-700',
  engaged: 'bg-cyan-100 text-cyan-700',
  responded: 'bg-green-100 text-green-700',
  converted: 'bg-purple-100 text-purple-700',
  unsubscribed: 'bg-red-100 text-red-700',
  bounced: 'bg-orange-100 text-orange-700',
}

const responseTypeColors: Record<string, string> = {
  positive: 'text-green-600 bg-green-50',
  neutral: 'text-gray-600 bg-gray-50',
  negative: 'text-red-600 bg-red-50',
}

const channelIcons: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
}

export function CampaignDetailPage({ campaignId }: CampaignDetailPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [prospectFilter, setProspectFilter] = useState<string>('all')
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedProspect, setSelectedProspect] = useState<ProspectData | null>(null)

  const utils = trpc.useUtils()

  const { data: campaign, isLoading } = trpc.crm.campaigns.getById.useQuery({ id: campaignId })
  const { data: metrics } = trpc.crm.campaigns.getMetrics.useQuery({ id: campaignId })
  const { data: prospects } = trpc.crm.campaigns.getProspects.useQuery({
    campaignId,
    status: prospectFilter as 'enrolled' | 'contacted' | 'engaged' | 'responded' | 'converted' | 'unsubscribed' | 'bounced' | 'all',
    limit: 50,
  })

  const updateStatus = trpc.crm.campaigns.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Campaign status updated')
      utils.crm.campaigns.getById.invalidate({ id: campaignId })
      utils.crm.campaigns.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-charcoal-500">Campaign not found</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const handleToggleStatus = () => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active'
    updateStatus.mutate({ id: campaignId, status: newStatus })
  }

  const handleConvert = (prospect: ProspectData) => {
    setSelectedProspect(prospect)
    setConvertDialogOpen(true)
  }

  const funnel = metrics?.funnel ?? {
    total_prospects: 0,
    contacted: 0,
    opened: 0,
    clicked: 0,
    responded: 0,
    leads: 0,
    meetings: 0,
    open_rate: 0,
    response_rate: 0,
    conversion_rate: 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
                {campaign.name}
              </h1>
              <Badge className={statusColors[campaign.status]}>{campaign.status}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {campaign.start_date && format(new Date(campaign.start_date), 'MMM d, yyyy')}
                {' - '}
                {campaign.end_date && format(new Date(campaign.end_date), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {campaign.audience_size?.toLocaleString() || 0} prospects
              </span>
              <div className="flex gap-1.5">
                {campaign.channels?.map((channel: string) => (
                  <span key={channel} className="p-1 bg-charcoal-100 rounded">
                    {channelIcons[channel]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status !== 'completed' && (
            <Button
              variant="outline"
              onClick={handleToggleStatus}
              disabled={updateStatus.isPending}
            >
              {campaign.status === 'active' ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => setEditDialogOpen(true)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Prospects</p>
                <p className="text-2xl font-semibold">{funnel.total_prospects}</p>
                <p className="text-xs text-charcoal-400">{funnel.contacted} contacted</p>
              </div>
              <Users className="w-8 h-8 text-charcoal-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Open Rate</p>
                <p className="text-2xl font-semibold">{funnel.open_rate}%</p>
                <p className="text-xs text-charcoal-400">{funnel.opened} opened</p>
              </div>
              <Mail className="w-8 h-8 text-charcoal-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Response Rate</p>
                <p className="text-2xl font-semibold">{funnel.response_rate}%</p>
                <p className="text-xs text-charcoal-400">{funnel.responded} replied</p>
              </div>
              <MessageSquare className="w-8 h-8 text-charcoal-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Leads Generated</p>
                <p className="text-2xl font-semibold text-green-600">{funnel.leads}</p>
                <p className="text-xs text-charcoal-400">{funnel.conversion_rate}% conversion</p>
              </div>
              <Target className="w-8 h-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Funnel</CardTitle>
          <CardDescription>Prospect journey through the campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-40">
            {[
              { label: 'Enrolled', value: funnel.total_prospects, color: 'bg-charcoal-200' },
              { label: 'Contacted', value: funnel.contacted, color: 'bg-blue-200' },
              { label: 'Opened', value: funnel.opened, color: 'bg-cyan-200' },
              { label: 'Clicked', value: funnel.clicked, color: 'bg-teal-200' },
              { label: 'Responded', value: funnel.responded, color: 'bg-green-200' },
              { label: 'Leads', value: funnel.leads, color: 'bg-green-400' },
              { label: 'Meetings', value: funnel.meetings, color: 'bg-gold-400' },
            ].map((stage, idx) => {
              const maxValue = Math.max(funnel.total_prospects || 1, 1)
              const height = (stage.value / maxValue) * 100
              return (
                <div key={stage.label} className="flex-1 flex flex-col items-center">
                  <div className="text-sm font-medium mb-1">{stage.value}</div>
                  <div
                    className={cn('w-full rounded-t transition-all', stage.color)}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <div className="text-xs text-charcoal-500 mt-2 text-center">{stage.label}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="prospects">Prospects ({prospects?.total || 0})</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Target Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Target Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Leads</span>
                    <span>{metrics?.targets.leads.actual} / {metrics?.targets.leads.target}</span>
                  </div>
                  <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${Math.min((metrics?.targets.leads.actual || 0) / (metrics?.targets.leads.target || 1) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Meetings</span>
                    <span>{metrics?.targets.meetings.actual} / {metrics?.targets.meetings.target}</span>
                  </div>
                  <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${Math.min((metrics?.targets.meetings.actual || 0) / (metrics?.targets.meetings.target || 1) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Budget & Costs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-charcoal-500">Budget</span>
                  <span className="font-medium">${metrics?.budget.total?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-charcoal-500">Spent</span>
                  <span className="font-medium">${metrics?.budget.spent?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-charcoal-500">Cost per Lead</span>
                  <span className="font-medium text-green-600">${metrics?.costs.perLead?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-charcoal-500">Cost per Meeting</span>
                  <span className="font-medium">${metrics?.costs.perMeeting?.toFixed(2) || '0.00'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Channel Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                    <TableHead className="text-right">Open Rate</TableHead>
                    <TableHead className="text-right">Click Rate</TableHead>
                    <TableHead className="text-right">Response Rate</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics?.channelPerformance?.map((ch: { channel: string; sent: number; open_rate: number; click_rate: number; response_rate: number; leads: number }) => (
                    <TableRow key={ch.channel}>
                      <TableCell className="flex items-center gap-2">
                        {channelIcons[ch.channel]}
                        <span className="capitalize">{ch.channel}</span>
                      </TableCell>
                      <TableCell className="text-right">{ch.sent}</TableCell>
                      <TableCell className="text-right">{ch.open_rate}%</TableCell>
                      <TableCell className="text-right">{ch.click_rate}%</TableCell>
                      <TableCell className="text-right">{ch.response_rate}%</TableCell>
                      <TableCell className="text-right font-medium text-green-600">{ch.leads}</TableCell>
                    </TableRow>
                  ))}
                  {(!metrics?.channelPerformance || metrics.channelPerformance.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-charcoal-500 py-8">
                        No channel data yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prospects" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Prospects</CardTitle>
                <Select value={prospectFilter} onValueChange={setProspectFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="enrolled">Enrolled</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="engaged">Engaged</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prospect</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prospects?.items?.map((prospect: ProspectData) => (
                    <TableRow key={prospect.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {prospect.first_name} {prospect.last_name}
                          </div>
                          <div className="text-sm text-charcoal-500">{prospect.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{prospect.company_name || '-'}</div>
                          <div className="text-sm text-charcoal-500">{prospect.title || '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={prospectStatusColors[prospect.status]}>
                          {prospect.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {prospect.response_type ? (
                          <div>
                            <Badge className={responseTypeColors[prospect.response_type]}>
                              {prospect.response_type}
                            </Badge>
                            {prospect.response_text && (
                              <p className="text-xs text-charcoal-500 mt-1 max-w-[200px] truncate">
                                {prospect.response_text}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-charcoal-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${prospect.engagement_score || 0}%` }}
                            />
                          </div>
                          <span className="text-sm">{prospect.engagement_score || 0}</span>
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
                            {prospect.linkedin_url && (
                              <DropdownMenuItem asChild>
                                <a href={prospect.linkedin_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View LinkedIn
                                </a>
                              </DropdownMenuItem>
                            )}
                            {!prospect.converted_lead_id && prospect.status === 'responded' && (
                              <DropdownMenuItem onClick={() => handleConvert(prospect)}>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Convert to Lead
                              </DropdownMenuItem>
                            )}
                            {prospect.converted_lead_id && (
                              <DropdownMenuItem asChild>
                                <Link href={`/employee/crm/leads/${prospect.converted_lead_id}`}>
                                  <ArrowRight className="w-4 h-4 mr-2" />
                                  View Lead
                                </Link>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!prospects?.items || prospects.items.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-charcoal-500 py-8">
                        No prospects found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Responses</CardTitle>
              <CardDescription>Positive responses ready for conversion</CardDescription>
            </CardHeader>
            <CardContent>
              {campaign.recentResponses && campaign.recentResponses.length > 0 ? (
                <div className="space-y-4">
                  {campaign.recentResponses.map((response: ProspectData) => (
                    <div key={response.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {response.first_name} {response.last_name}
                          </span>
                          <span className="text-charcoal-500">at {response.company_name}</span>
                          {response.response_type && (
                            <Badge className={responseTypeColors[response.response_type]}>
                              {response.response_type}
                            </Badge>
                          )}
                        </div>
                        {response.response_text && (
                          <p className="text-sm text-charcoal-600 mt-2">{response.response_text}</p>
                        )}
                        <p className="text-xs text-charcoal-400 mt-2">
                          {response.responded_at && format(new Date(response.responded_at), 'PPpp')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConvert(response)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Convert
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-charcoal-500">
                  No responses yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Analytics</CardTitle>
              <CardDescription>Detailed campaign performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-charcoal-500">
                Performance charts coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Convert Dialog */}
      {selectedProspect && (
        <ConvertProspectDialog
          open={convertDialogOpen}
          onOpenChange={setConvertDialogOpen}
          prospect={selectedProspect}
          onSuccess={() => {
            utils.crm.campaigns.getProspects.invalidate({ campaignId })
            utils.crm.campaigns.getById.invalidate({ id: campaignId })
            utils.crm.campaigns.getMetrics.invalidate({ id: campaignId })
            setSelectedProspect(null)
          }}
        />
      )}

      {/* Edit Campaign Dialog */}
      <EditCampaignDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        campaignId={campaignId}
        onSuccess={() => {
          utils.crm.campaigns.getById.invalidate({ id: campaignId })
          utils.crm.campaigns.getMetrics.invalidate({ id: campaignId })
        }}
      />
    </div>
  )
}
