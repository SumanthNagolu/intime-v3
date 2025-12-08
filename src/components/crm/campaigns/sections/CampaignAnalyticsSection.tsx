'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { trpc } from '@/lib/trpc/client'
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  Calculator,
  Info,
  Download,
  BarChart3,
  Beaker,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { cn } from '@/lib/utils'
import { ABTestingSection } from './ABTestingSection'

interface CampaignAnalyticsSectionProps {
  campaignId: string
}

const COLORS = ['#171717', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

export function CampaignAnalyticsSection({ campaignId }: CampaignAnalyticsSectionProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [roiInputs, setRoiInputs] = useState({
    avgDealValue: 50000,
    closeRate: 25,
  })

  // Fetch detailed metrics
  const { data: metrics, isLoading } = trpc.crm.campaigns.getMetrics.useQuery({
    id: campaignId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-hublot-500" />
          <p className="text-sm text-charcoal-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  // Prepare funnel data for chart
  const funnelData = [
    { stage: 'Enrolled', count: metrics?.funnel?.total_prospects || 0, fill: '#94a3b8' },
    { stage: 'Contacted', count: metrics?.funnel?.contacted || 0, fill: '#3b82f6' },
    { stage: 'Opened', count: metrics?.funnel?.opened || 0, fill: '#06b6d4' },
    { stage: 'Clicked', count: metrics?.funnel?.clicked || 0, fill: '#14b8a6' },
    { stage: 'Responded', count: metrics?.funnel?.responded || 0, fill: '#22c55e' },
    { stage: 'Leads', count: metrics?.funnel?.leads || 0, fill: '#10b981' },
    { stage: 'Meetings', count: metrics?.funnel?.meetings || 0, fill: '#f59e0b' },
  ]

  // Prepare channel performance data
  const channelData = metrics?.channelPerformance?.map((ch: {
    channel: string
    sent: number
    open_rate: number
    click_rate: number
    response_rate: number
    leads: number
  }) => ({
    channel: ch.channel.charAt(0).toUpperCase() + ch.channel.slice(1),
    sent: ch.sent,
    openRate: ch.open_rate,
    responseRate: ch.response_rate,
    leads: ch.leads,
  })) || []

  // Daily trends data
  const dailyTrends = metrics?.dailyTrends || [
    { date: 'Day 1', opens: 12, clicks: 3, responses: 1 },
    { date: 'Day 2', opens: 18, clicks: 5, responses: 2 },
    { date: 'Day 3', opens: 15, clicks: 4, responses: 1 },
    { date: 'Day 4', opens: 22, clicks: 7, responses: 3 },
    { date: 'Day 5', opens: 19, clicks: 6, responses: 2 },
    { date: 'Day 6', opens: 25, clicks: 8, responses: 4 },
    { date: 'Day 7', opens: 20, clicks: 5, responses: 2 },
  ]

  // Calculate ROI projections
  const leads = metrics?.funnel?.leads || 0
  const meetings = metrics?.funnel?.meetings || 0
  const budgetSpent = metrics?.budget?.spent || 0
  const projectedDeals = Math.round(meetings * (roiInputs.closeRate / 100))
  const projectedRevenue = projectedDeals * roiInputs.avgDealValue
  const projectedROI = budgetSpent > 0 ? ((projectedRevenue - budgetSpent) / budgetSpent) * 100 : 0

  // Conversion rate between stages
  const getConversionRate = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current / previous) * 100).toFixed(1)
  }

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="ab-testing" className="gap-2">
                <Beaker className="w-4 h-4" />
                A/B Testing
              </TabsTrigger>
              <TabsTrigger value="roi" className="gap-2">
                <Calculator className="w-4 h-4" />
                ROI Calculator
              </TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Key Metrics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">
                        Cost per Lead
                      </p>
                      <p className="text-2xl font-bold text-charcoal-900 mt-1">
                        ${metrics?.costs?.perLead?.toFixed(2) || '0.00'}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {(metrics?.costs?.perLead || 0) < 10 ? (
                          <>
                            <TrendingDown className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs text-emerald-600">Below target</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-3 h-3 text-amber-500" />
                            <span className="text-xs text-amber-600">Target: &lt;$10</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl">
                      <DollarSign className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">
                        Cost per Meeting
                      </p>
                      <p className="text-2xl font-bold text-charcoal-900 mt-1">
                        ${metrics?.costs?.perMeeting?.toFixed(2) || '0.00'}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {(metrics?.costs?.perMeeting || 0) < 50 ? (
                          <>
                            <TrendingDown className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs text-emerald-600">Below target</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-3 h-3 text-amber-500" />
                            <span className="text-xs text-amber-600">Target: &lt;$50</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">
                        Response Rate
                      </p>
                      <p className="text-2xl font-bold text-charcoal-900 mt-1">
                        {metrics?.funnel?.response_rate?.toFixed(1) || '0.0'}%
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {(metrics?.funnel?.response_rate || 0) >= 6 ? (
                          <>
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs text-emerald-600">On target</span>
                          </>
                        ) : (
                          <span className="text-xs text-charcoal-400">Target: 6-10%</span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-cyan-50 rounded-xl">
                      <Target className="w-6 h-6 text-cyan-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">
                        Conversion Rate
                      </p>
                      <p className="text-2xl font-bold text-charcoal-900 mt-1">
                        {metrics?.funnel?.conversion_rate?.toFixed(1) || '0.0'}%
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {(metrics?.funnel?.conversion_rate || 0) >= 15 ? (
                          <>
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs text-emerald-600">On target</span>
                          </>
                        ) : (
                          <span className="text-xs text-charcoal-400">Target: 15-25%</span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-violet-50 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-violet-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Funnel Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversion Funnel</CardTitle>
                <CardDescription>Prospect journey through campaign stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                      <XAxis dataKey="stage" tick={{ fontSize: 12 }} axisLine={false} />
                      <YAxis tick={{ fontSize: 12 }} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e5e5',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(value: number) => [value.toLocaleString(), 'Count']}
                      />
                      <Bar 
                        dataKey="count" 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={60}
                      >
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Stage Conversion Rates */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-charcoal-100">
                  {funnelData.slice(1).map((stage, index) => {
                    const prevCount = funnelData[index].count
                    const rate = getConversionRate(stage.count, prevCount)
                    return (
                      <div key={stage.stage} className="text-center">
                        <p className="text-xs text-charcoal-500">{funnelData[index].stage} → {stage.stage}</p>
                        <p className={cn(
                          'text-sm font-semibold mt-0.5',
                          parseFloat(rate) >= 50 ? 'text-emerald-600' :
                          parseFloat(rate) >= 20 ? 'text-blue-600' :
                          'text-charcoal-600'
                        )}>
                          {rate}%
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Daily Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Activity Trends</CardTitle>
                <CardDescription>Engagement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrends}>
                      <defs>
                        <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} />
                      <YAxis tick={{ fontSize: 12 }} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e5e5',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="opens"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorOpens)"
                        name="Opens"
                      />
                      <Area
                        type="monotone"
                        dataKey="clicks"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorClicks)"
                        name="Clicks"
                      />
                      <Area
                        type="monotone"
                        dataKey="responses"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorResponses)"
                        name="Responses"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Channel Performance */}
            {channelData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Channel Performance</CardTitle>
                  <CardDescription>Comparison across outreach channels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={channelData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} />
                        <YAxis dataKey="channel" type="category" tick={{ fontSize: 12 }} axisLine={false} width={80} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e5e5',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="openRate" fill="#3b82f6" name="Open %" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="responseRate" fill="#10b981" name="Response %" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Budget Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Budget Analysis</CardTitle>
                <CardDescription>Spending breakdown and efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-charcoal-500">Budget Utilization</span>
                      <span className="font-medium tabular-nums">
                        ${(metrics?.budget?.spent || 0).toLocaleString()} / ${(metrics?.budget?.total || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-3 bg-charcoal-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-500 rounded-full',
                          (metrics?.budget?.spent || 0) / (metrics?.budget?.total || 1) > 0.9 
                            ? 'bg-amber-500' 
                            : 'bg-hublot-600'
                        )}
                        style={{
                          width: `${Math.min((metrics?.budget?.spent || 0) / (metrics?.budget?.total || 1) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-charcoal-400 mt-1">
                      {((metrics?.budget?.spent || 0) / (metrics?.budget?.total || 1) * 100).toFixed(1)}% of budget used
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-charcoal-100">
                    <div className="p-3 bg-charcoal-50 rounded-lg">
                      <p className="text-xs text-charcoal-500 uppercase tracking-wide">Remaining</p>
                      <p className="text-xl font-bold text-charcoal-900 mt-1 tabular-nums">
                        ${((metrics?.budget?.total || 0) - (metrics?.budget?.spent || 0)).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-emerald-700 uppercase tracking-wide">Est. ROI</p>
                      <p className="text-xl font-bold text-emerald-600 mt-1 tabular-nums">
                        {leads > 0 && budgetSpent > 0
                          ? `${((leads * 5000) / budgetSpent).toFixed(1)}x`
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* A/B Testing Tab */}
          <TabsContent value="ab-testing" className="mt-0">
            <ABTestingSection campaignId={campaignId} />
          </TabsContent>

          {/* ROI Calculator Tab */}
          <TabsContent value="roi" className="space-y-6 mt-0">
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-600" />
                  ROI Projection Calculator
                </CardTitle>
                <CardDescription>
                  Estimate your campaign's return on investment based on historical data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inputs */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-charcoal-900">Your Assumptions</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-charcoal-600 mb-1.5 block">
                          Average Deal Value ($)
                        </label>
                        <Input
                          type="number"
                          value={roiInputs.avgDealValue}
                          onChange={(e) => setRoiInputs(prev => ({ 
                            ...prev, 
                            avgDealValue: Number(e.target.value) 
                          }))}
                          className="tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-charcoal-600 mb-1.5 block">
                          Meeting-to-Close Rate (%)
                        </label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={roiInputs.closeRate}
                          onChange={(e) => setRoiInputs(prev => ({ 
                            ...prev, 
                            closeRate: Number(e.target.value) 
                          }))}
                          className="tabular-nums"
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 bg-charcoal-50 rounded-lg mt-4">
                      <h5 className="text-sm font-medium text-charcoal-700 mb-3">Campaign Data</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Leads Generated</span>
                          <span className="font-semibold tabular-nums">{leads}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Meetings Booked</span>
                          <span className="font-semibold tabular-nums">{meetings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Budget Spent</span>
                          <span className="font-semibold tabular-nums">${budgetSpent.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-charcoal-900">Projected Results</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700 uppercase tracking-wide">Projected Deals</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1 tabular-nums">
                          {projectedDeals}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Based on {roiInputs.closeRate}% close rate
                        </p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-lg">
                        <p className="text-xs text-emerald-700 uppercase tracking-wide">Projected Revenue</p>
                        <p className="text-2xl font-bold text-emerald-900 mt-1 tabular-nums">
                          ${projectedRevenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">
                          At ${roiInputs.avgDealValue.toLocaleString()}/deal
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-emerald-700 font-medium">Projected ROI</p>
                          <p className="text-4xl font-bold text-emerald-900 mt-1 tabular-nums">
                            {projectedROI > 0 ? `${projectedROI.toFixed(0)}%` : '-'}
                          </p>
                        </div>
                        <div className="p-4 bg-white rounded-xl shadow-sm">
                          <TrendingUp className="w-8 h-8 text-emerald-600" />
                        </div>
                      </div>
                      {projectedROI > 0 && (
                        <div className="mt-4 pt-4 border-t border-emerald-200">
                          <p className="text-sm text-emerald-700">
                            For every $1 spent, you're projected to earn ${((projectedRevenue / budgetSpent)).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <Info className="w-4 h-4 text-amber-600 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        These projections are estimates based on your inputs and current campaign performance. 
                        Actual results may vary.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Efficiency Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cost Efficiency Analysis</CardTitle>
                <CardDescription>Compare your costs against industry benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Cost per Lead */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Cost per Lead</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold tabular-nums">
                          ${metrics?.costs?.perLead?.toFixed(2) || '0.00'}
                        </span>
                        <Badge variant="secondary" className={cn(
                          (metrics?.costs?.perLead || 0) <= 10 ? 'bg-emerald-50 text-emerald-700' :
                          (metrics?.costs?.perLead || 0) <= 20 ? 'bg-amber-50 text-amber-700' :
                          'bg-red-50 text-red-700'
                        )}>
                          {(metrics?.costs?.perLead || 0) <= 10 ? 'Excellent' :
                           (metrics?.costs?.perLead || 0) <= 20 ? 'Good' : 'Above Target'}
                        </Badge>
                      </div>
                    </div>
                    <div className="relative h-3 bg-charcoal-100 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 w-1/3 bg-emerald-100" />
                      <div className="absolute inset-y-0 left-1/3 w-1/3 bg-amber-100" />
                      <div className="absolute inset-y-0 left-2/3 w-1/3 bg-red-100" />
                      <div 
                        className="absolute h-4 w-1 bg-charcoal-900 rounded-full -top-0.5"
                        style={{ left: `${Math.min((metrics?.costs?.perLead || 0) / 30 * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-charcoal-400 mt-1">
                      <span>$0</span>
                      <span>$10 (Target)</span>
                      <span>$20</span>
                      <span>$30+</span>
                    </div>
                  </div>

                  {/* Cost per Meeting */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Cost per Meeting</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold tabular-nums">
                          ${metrics?.costs?.perMeeting?.toFixed(2) || '0.00'}
                        </span>
                        <Badge variant="secondary" className={cn(
                          (metrics?.costs?.perMeeting || 0) <= 50 ? 'bg-emerald-50 text-emerald-700' :
                          (metrics?.costs?.perMeeting || 0) <= 100 ? 'bg-amber-50 text-amber-700' :
                          'bg-red-50 text-red-700'
                        )}>
                          {(metrics?.costs?.perMeeting || 0) <= 50 ? 'Excellent' :
                           (metrics?.costs?.perMeeting || 0) <= 100 ? 'Good' : 'Above Target'}
                        </Badge>
                      </div>
                    </div>
                    <div className="relative h-3 bg-charcoal-100 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 w-1/3 bg-emerald-100" />
                      <div className="absolute inset-y-0 left-1/3 w-1/3 bg-amber-100" />
                      <div className="absolute inset-y-0 left-2/3 w-1/3 bg-red-100" />
                      <div 
                        className="absolute h-4 w-1 bg-charcoal-900 rounded-full -top-0.5"
                        style={{ left: `${Math.min((metrics?.costs?.perMeeting || 0) / 150 * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-charcoal-400 mt-1">
                      <span>$0</span>
                      <span>$50 (Target)</span>
                      <span>$100</span>
                      <span>$150+</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
