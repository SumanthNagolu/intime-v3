'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Mail,
  Linkedin,
  Phone,
  Users,
  Target,
  MessageSquare,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  DollarSign,
  Zap,
  Award,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface FunnelMetrics {
  total_prospects: number
  contacted: number
  opened: number
  clicked: number
  responded: number
  leads: number
  meetings: number
  open_rate: number
  response_rate: number
  conversion_rate: number
}

interface CampaignMetrics {
  funnel: FunnelMetrics
  targets: {
    leads: { target: number; actual: number }
    meetings: { target: number; actual: number }
  }
  budget: {
    total: number
    spent: number
  }
  costs: {
    perLead: number
    perMeeting: number
  }
  channelPerformance: Array<{
    channel: string
    sent: number
    open_rate: number
    click_rate: number
    response_rate: number
    leads: number
  }>
}

interface Campaign {
  id: string
  name: string
  status: string
  campaign_type: string
  start_date?: string
  end_date?: string
  audience_size?: number
  channels?: string[]
  budget_total?: number
  budget_spent?: number
  outcome?: string
  completion_notes?: string
}

interface CampaignOverviewSectionProps {
  campaignId: string
  campaign: Campaign
  metrics?: CampaignMetrics
}

const channelIcons: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
}

const channelColors: Record<string, string> = {
  email: 'bg-blue-500',
  linkedin: 'bg-sky-500',
  phone: 'bg-emerald-500',
}

// Funnel stage configuration
const funnelStages = [
  { key: 'total_prospects', label: 'Enrolled', color: 'from-charcoal-300 to-charcoal-400', icon: Users },
  { key: 'contacted', label: 'Contacted', color: 'from-blue-400 to-blue-500', icon: Mail },
  { key: 'opened', label: 'Opened', color: 'from-cyan-400 to-cyan-500', icon: MessageSquare },
  { key: 'clicked', label: 'Clicked', color: 'from-teal-400 to-teal-500', icon: ChevronRight },
  { key: 'responded', label: 'Responded', color: 'from-green-400 to-green-500', icon: MessageSquare },
  { key: 'leads', label: 'Leads', color: 'from-emerald-500 to-emerald-600', icon: Target },
  { key: 'meetings', label: 'Meetings', color: 'from-amber-400 to-amber-500', icon: Calendar },
] as const

export function CampaignOverviewSection({ campaignId, campaign, metrics }: CampaignOverviewSectionProps) {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null)

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

  // Calculate conversion rates between stages
  const getConversionRate = (current: number, previous: number) => {
    if (previous === 0) return 0
    return Math.round((current / previous) * 100)
  }

  const maxValue = Math.max(funnel.total_prospects || 1, 1)

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        {/* Campaign Results Summary (for completed campaigns) */}
        {campaign.status === 'completed' && campaign.outcome && (
          <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-base">Campaign Results</CardTitle>
              </div>
              <CardDescription>Final outcome and performance summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-xs text-charcoal-500 uppercase tracking-wide">Outcome</p>
                  <p className="font-semibold text-lg capitalize mt-1">{campaign.outcome}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-xs text-charcoal-500 uppercase tracking-wide">Leads vs Target</p>
                  <p className="font-semibold text-lg mt-1">
                    <span className="text-emerald-600">{metrics?.targets.leads.actual}</span>
                    <span className="text-charcoal-400"> / {metrics?.targets.leads.target}</span>
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-xs text-charcoal-500 uppercase tracking-wide">Meetings vs Target</p>
                  <p className="font-semibold text-lg mt-1">
                    <span className="text-blue-600">{metrics?.targets.meetings.actual}</span>
                    <span className="text-charcoal-400"> / {metrics?.targets.meetings.target}</span>
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-xs text-charcoal-500 uppercase tracking-wide">Budget Used</p>
                  <p className="font-semibold text-lg mt-1">
                    ${metrics?.budget.spent?.toLocaleString() || 0}
                    <span className="text-charcoal-400"> / ${metrics?.budget.total?.toLocaleString()}</span>
                  </p>
                </div>
              </div>
              {campaign.completion_notes && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <p className="text-xs text-charcoal-500 uppercase tracking-wide mb-2">Notes</p>
                  <p className="text-sm text-charcoal-700">{campaign.completion_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Interactive Funnel Visualization */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-hublot-600" />
                  Campaign Funnel
                </CardTitle>
                <CardDescription>Prospect journey through the campaign stages</CardDescription>
              </div>
              <Badge variant="outline" className="font-normal">
                {funnel.conversion_rate}% overall conversion
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Funnel Bars */}
            <div className="relative">
              <div className="flex items-end justify-between gap-3 h-48 mb-4">
                {funnelStages.map((stage, index) => {
                  const value = funnel[stage.key as keyof FunnelMetrics] as number
                  const height = (value / maxValue) * 100
                  const prevValue = index > 0 
                    ? funnel[funnelStages[index - 1].key as keyof FunnelMetrics] as number 
                    : value
                  const conversionRate = getConversionRate(value, prevValue)
                  const isHovered = hoveredStage === stage.key
                  const Icon = stage.icon

                  return (
                    <Tooltip key={stage.key}>
                      <TooltipTrigger asChild>
                        <div 
                          className="flex-1 flex flex-col items-center cursor-pointer group"
                          onMouseEnter={() => setHoveredStage(stage.key)}
                          onMouseLeave={() => setHoveredStage(null)}
                        >
                          {/* Value */}
                          <div className={cn(
                            'text-base font-bold mb-2 transition-all duration-200',
                            isHovered ? 'scale-110' : ''
                          )}>
                            {value.toLocaleString()}
                          </div>
                          
                          {/* Bar */}
                          <div 
                            className={cn(
                              'w-full rounded-t-lg transition-all duration-300 relative overflow-hidden',
                              `bg-gradient-to-t ${stage.color}`,
                              isHovered ? 'shadow-lg scale-x-105' : ''
                            )}
                            style={{ height: `${Math.max(height, 8)}%` }}
                          >
                            {/* Shimmer effect on hover */}
                            {isHovered && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                            )}
                          </div>
                          
                          {/* Label */}
                          <div className="flex flex-col items-center mt-3">
                            <div className={cn(
                              'p-1.5 rounded-md transition-all duration-200 mb-1',
                              isHovered ? 'bg-charcoal-100' : 'bg-charcoal-50'
                            )}>
                              <Icon className={cn(
                                'w-4 h-4 transition-colors',
                                isHovered ? 'text-charcoal-700' : 'text-charcoal-400'
                              )} />
                            </div>
                            <span className={cn(
                              'text-xs transition-colors',
                              isHovered ? 'text-charcoal-900 font-medium' : 'text-charcoal-500'
                            )}>
                              {stage.label}
                            </span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="p-3">
                        <div className="text-center">
                          <p className="font-semibold">{value.toLocaleString()} {stage.label}</p>
                          {index > 0 && (
                            <p className="text-sm text-charcoal-500">
                              {conversionRate}% from {funnelStages[index - 1].label}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>

              {/* Conversion Arrows */}
              <div className="flex items-center justify-between px-6">
                {funnelStages.slice(0, -1).map((stage, index) => {
                  const currentValue = funnel[stage.key as keyof FunnelMetrics] as number
                  const nextValue = funnel[funnelStages[index + 1].key as keyof FunnelMetrics] as number
                  const conversionRate = getConversionRate(nextValue, currentValue)
                  
                  return (
                    <div key={`arrow-${stage.key}`} className="flex-1 flex items-center justify-center">
                      <div className={cn(
                        'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                        conversionRate >= 50 ? 'bg-emerald-50 text-emerald-700' :
                        conversionRate >= 25 ? 'bg-amber-50 text-amber-700' :
                        'bg-charcoal-50 text-charcoal-600'
                      )}>
                        <ArrowRight className="w-3 h-3" />
                        <span className="font-medium">{conversionRate}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">Prospects</p>
                  <p className="text-2xl font-bold text-charcoal-900 mt-1">{funnel.total_prospects.toLocaleString()}</p>
                  <p className="text-xs text-charcoal-400 mt-1">{funnel.contacted} contacted</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">Open Rate</p>
                  <p className="text-2xl font-bold text-charcoal-900 mt-1">{funnel.open_rate}%</p>
                  <p className="text-xs text-charcoal-400 mt-1">{funnel.opened} opened</p>
                </div>
                <div className="p-3 bg-cyan-50 rounded-xl">
                  <Mail className="w-6 h-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">Response Rate</p>
                  <p className="text-2xl font-bold text-charcoal-900 mt-1">{funnel.response_rate}%</p>
                  <p className="text-xs text-charcoal-400 mt-1">{funnel.responded} replied</p>
                </div>
                <div className="p-3 bg-teal-50 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">Leads Generated</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{funnel.leads}</p>
                  <p className="text-xs text-charcoal-400 mt-1">{funnel.conversion_rate}% conversion</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Target Progress & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-hublot-600" />
                Target Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Leads Target</span>
                  <span className={cn(
                    'text-sm font-semibold tabular-nums',
                    (metrics?.targets.leads.actual || 0) >= (metrics?.targets.leads.target || 1) 
                      ? 'text-emerald-600' 
                      : 'text-charcoal-600'
                  )}>
                    {metrics?.targets.leads.actual ?? 0} / {metrics?.targets.leads.target ?? 0}
                  </span>
                </div>
                <div className="h-3 bg-charcoal-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      (metrics?.targets.leads.actual || 0) >= (metrics?.targets.leads.target || 1) 
                        ? 'bg-emerald-500' 
                        : 'bg-blue-500'
                    )}
                    style={{
                      width: `${Math.min((metrics?.targets.leads.actual || 0) / (metrics?.targets.leads.target || 1) * 100, 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-charcoal-400 mt-1.5">
                  {Math.round((metrics?.targets.leads.actual || 0) / (metrics?.targets.leads.target || 1) * 100)}% of target
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Meetings Target</span>
                  <span className={cn(
                    'text-sm font-semibold tabular-nums',
                    (metrics?.targets.meetings.actual || 0) >= (metrics?.targets.meetings.target || 1) 
                      ? 'text-emerald-600' 
                      : 'text-charcoal-600'
                  )}>
                    {metrics?.targets.meetings.actual ?? 0} / {metrics?.targets.meetings.target ?? 0}
                  </span>
                </div>
                <div className="h-3 bg-charcoal-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      (metrics?.targets.meetings.actual || 0) >= (metrics?.targets.meetings.target || 1) 
                        ? 'bg-emerald-500' 
                        : 'bg-amber-500'
                    )}
                    style={{
                      width: `${Math.min((metrics?.targets.meetings.actual || 0) / (metrics?.targets.meetings.target || 1) * 100, 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-charcoal-400 mt-1.5">
                  {Math.round((metrics?.targets.meetings.actual || 0) / (metrics?.targets.meetings.target || 1) * 100)}% of target
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Budget & Costs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-hublot-600" />
                Budget & Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-charcoal-50 rounded-lg">
                  <p className="text-xs text-charcoal-500">Total Budget</p>
                  <p className="text-lg font-semibold mt-1">${metrics?.budget.total?.toLocaleString() || 0}</p>
                </div>
                <div className="p-3 bg-charcoal-50 rounded-lg">
                  <p className="text-xs text-charcoal-500">Spent</p>
                  <p className="text-lg font-semibold mt-1">${metrics?.budget.spent?.toLocaleString() || 0}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-emerald-700">Cost per Lead</p>
                  <p className="text-lg font-semibold text-emerald-700 mt-1">
                    ${metrics?.costs.perLead?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">Cost per Meeting</p>
                  <p className="text-lg font-semibold text-blue-700 mt-1">
                    ${metrics?.costs.perMeeting?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
              
              {/* Budget Progress */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-charcoal-500">Budget Used</span>
                  <span className="text-sm font-medium tabular-nums">
                    {Math.round((metrics?.budget.spent || 0) / (metrics?.budget.total || 1) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min((metrics?.budget.spent || 0) / (metrics?.budget.total || 1) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Channel Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-hublot-600" />
              Channel Performance
            </CardTitle>
            <CardDescription>Compare performance across outreach channels</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics?.channelPerformance && metrics.channelPerformance.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-charcoal-50/50">
                      <TableHead>Channel</TableHead>
                      <TableHead className="text-right">Sent</TableHead>
                      <TableHead className="text-right">Open Rate</TableHead>
                      <TableHead className="text-right">Click Rate</TableHead>
                      <TableHead className="text-right">Response Rate</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.channelPerformance.map((ch) => (
                      <TableRow key={ch.channel} className="hover:bg-charcoal-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'p-2 rounded-lg',
                              ch.channel === 'email' ? 'bg-blue-50' :
                              ch.channel === 'linkedin' ? 'bg-sky-50' :
                              'bg-emerald-50'
                            )}>
                              {channelIcons[ch.channel]}
                            </div>
                            <span className="font-medium capitalize">{ch.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {ch.sent.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className={cn(
                            'tabular-nums',
                            ch.open_rate >= 30 ? 'bg-emerald-50 text-emerald-700' :
                            ch.open_rate >= 20 ? 'bg-blue-50 text-blue-700' :
                            'bg-charcoal-50'
                          )}>
                            {ch.open_rate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className={cn(
                            'tabular-nums',
                            ch.click_rate >= 5 ? 'bg-emerald-50 text-emerald-700' :
                            ch.click_rate >= 2 ? 'bg-blue-50 text-blue-700' :
                            'bg-charcoal-50'
                          )}>
                            {ch.click_rate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className={cn(
                            'tabular-nums',
                            ch.response_rate >= 10 ? 'bg-emerald-50 text-emerald-700' :
                            ch.response_rate >= 5 ? 'bg-blue-50 text-blue-700' :
                            'bg-charcoal-50'
                          )}>
                            {ch.response_rate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-emerald-600 tabular-nums">{ch.leads}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-3 bg-charcoal-50 rounded-full mb-3">
                  <Mail className="w-6 h-6 text-charcoal-300" />
                </div>
                <p className="text-charcoal-500">No channel data yet</p>
                <p className="text-sm text-charcoal-400 mt-1">
                  Channel performance will appear once outreach begins
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaign Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-hublot-600" />
              Campaign Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-charcoal-50 rounded-lg">
                <p className="text-xs text-charcoal-500 uppercase tracking-wide">Type</p>
                <p className="font-medium capitalize mt-1">{campaign.campaign_type?.replace(/_/g, ' ')}</p>
              </div>
              <div className="p-3 bg-charcoal-50 rounded-lg">
                <p className="text-xs text-charcoal-500 uppercase tracking-wide">Start Date</p>
                <p className="font-medium mt-1">
                  {campaign.start_date ? format(new Date(campaign.start_date), 'MMM d, yyyy') : '-'}
                </p>
              </div>
              <div className="p-3 bg-charcoal-50 rounded-lg">
                <p className="text-xs text-charcoal-500 uppercase tracking-wide">End Date</p>
                <p className="font-medium mt-1">
                  {campaign.end_date ? format(new Date(campaign.end_date), 'MMM d, yyyy') : '-'}
                </p>
              </div>
              <div className="p-3 bg-charcoal-50 rounded-lg">
                <p className="text-xs text-charcoal-500 uppercase tracking-wide">Channels</p>
                <div className="flex gap-2 mt-2">
                  {campaign.channels?.map((channel) => (
                    <Tooltip key={channel}>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          'p-1.5 rounded-md',
                          channel === 'email' ? 'bg-blue-100 text-blue-700' :
                          channel === 'linkedin' ? 'bg-sky-100 text-sky-700' :
                          'bg-emerald-100 text-emerald-700'
                        )}>
                          {channelIcons[channel]}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="capitalize">{channel}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
