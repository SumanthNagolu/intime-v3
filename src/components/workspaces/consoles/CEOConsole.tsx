/**
 * CEOConsole
 *
 * Role-specific console for Chief Executive Officer
 * Shows strategic overview, revenue, division performance, and AI insights
 * Includes COO metrics for CEOs who also handle operations
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  DollarSign,
  Award,
  Building2,
  Users,
  Target,
  PieChart,
  BarChart3,
  Zap,
  Lightbulb,
  Calendar,
  FileSpreadsheet,
  Megaphone,
  Activity,
  Briefcase,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';

// =====================================================
// MOCK DATA
// =====================================================

const mockCompanyStats = {
  revenueYTD: 2450000,
  revenueTarget: 3000000,
  revenuePrevYear: 1980000,
  grossMargin: 32.5,
  placements: 48,
  placementsTarget: 75,
  activeClients: 32,
  totalEmployees: 45,
};

const mockDivisionPerformance = [
  { name: 'Recruiting', revenue: 1250000, target: 1500000, placements: 28, color: '#D87254' },
  { name: 'Bench Sales', revenue: 780000, target: 900000, placements: 15, color: '#10B981' },
  { name: 'TA/BD', revenue: 420000, target: 600000, deals: 12, color: '#3B82F6' },
];

const mockPodScoreboard = [
  { name: 'Pod Alpha', lead: 'Sarah Johnson', placements: 12, revenue: 485000, rank: 1 },
  { name: 'Pod Beta', lead: 'Mike Chen', placements: 10, revenue: 342000, rank: 2 },
  { name: 'Pod Gamma', lead: 'Lisa Park', placements: 8, revenue: 278000, rank: 3 },
  { name: 'Pod Delta', lead: 'Tom Wilson', placements: 6, revenue: 215000, rank: 4 },
];

const mockTopAccounts = [
  { name: 'TechFlow Inc', revenue: 485000, placements: 12, growth: 23 },
  { name: 'CloudScale Systems', revenue: 342000, placements: 8, growth: 15 },
  { name: 'DataForge', revenue: 278000, placements: 6, growth: -5 },
  { name: 'InnovateTech', revenue: 215000, placements: 5, growth: 42 },
];

const mockAIInsights = [
  {
    id: '1',
    title: 'Revenue Acceleration Opportunity',
    description: 'TechFlow Inc shows 23% YoY growth. Consider expanding dedicated pod.',
    type: 'opportunity',
    impact: 'High',
  },
  {
    id: '2',
    title: 'Interview Bottleneck Detected',
    description: 'Interview stage conversion dropped to 45%. May need process review.',
    type: 'warning',
    impact: 'Medium',
  },
  {
    id: '3',
    title: 'Bench Utilization Improving',
    description: 'Average days on bench decreased by 15% this quarter.',
    type: 'success',
    impact: 'Medium',
  },
];

const mockDealPipeline = [
  { stage: 'Discovery', count: 8, value: 450000, color: '#6366F1' },
  { stage: 'Qualification', count: 5, value: 320000, color: '#8B5CF6' },
  { stage: 'Proposal', count: 4, value: 280000, color: '#D87254' },
  { stage: 'Negotiation', count: 2, value: 180000, color: '#F59E0B' },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

export function CEOConsole() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch real data from tRPC
  const { data: revenueYTD } = trpc.financeMetrics.getRevenueYTD.useQuery();
  const { data: grossMargin } = trpc.financeMetrics.getGrossMargin.useQuery();
  const { data: revenueDivision } = trpc.financeMetrics.getRevenueByDivision.useQuery();
  const { data: recruiterMetrics } = trpc.dashboard.recruiterMetrics.useQuery();

  const revenueGrowth = ((mockCompanyStats.revenueYTD - mockCompanyStats.revenuePrevYear) / mockCompanyStats.revenuePrevYear * 100).toFixed(1);

  // =====================================================
  // OVERVIEW TAB
  // =====================================================

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                +{revenueGrowth}%
              </div>
            </div>
            <p className="text-3xl font-bold text-green-700">
              ${revenueYTD?.value ? (revenueYTD.value / 1000000).toFixed(2) : (mockCompanyStats.revenueYTD / 1000000).toFixed(2)}M
            </p>
            <p className="text-sm text-green-600/80">Revenue YTD</p>
          </CardContent>
        </Card>
        <Card className={cn(
          (grossMargin?.value || mockCompanyStats.grossMargin) >= 30
            ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
            : ''
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold">
              {grossMargin?.value || mockCompanyStats.grossMargin}%
            </p>
            <p className="text-sm text-muted-foreground">Gross Margin</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-blue-600" />
              <Badge variant="outline" className="text-xs">
                {((mockCompanyStats.placements / mockCompanyStats.placementsTarget) * 100).toFixed(0)}%
              </Badge>
            </div>
            <p className="text-3xl font-bold">{recruiterMetrics?.placementsThisQuarter || mockCompanyStats.placements}</p>
            <p className="text-sm text-muted-foreground">Placements YTD</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold">{mockCompanyStats.activeClients}</p>
            <p className="text-sm text-muted-foreground">Active Clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Goal */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Annual Revenue Goal
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              ${(mockCompanyStats.revenueTarget / 1000000).toFixed(1)}M target
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-4xl font-bold text-green-600">
              ${(mockCompanyStats.revenueYTD / 1000000).toFixed(2)}M
            </span>
            <span className="text-muted-foreground">
              ({((mockCompanyStats.revenueYTD / mockCompanyStats.revenueTarget) * 100).toFixed(0)}% of goal)
            </span>
          </div>
          <Progress value={(mockCompanyStats.revenueYTD / mockCompanyStats.revenueTarget) * 100} className="h-4" />
          <p className="text-sm text-muted-foreground mt-2">
            ${((mockCompanyStats.revenueTarget - mockCompanyStats.revenueYTD) / 1000000).toFixed(2)}M remaining
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Division Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Division Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(revenueDivision || mockDivisionPerformance).map((div: any) => (
              <div key={div.name || div.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: div.color }}
                    />
                    <span className="font-medium">{div.name || div.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">${((div.revenue || div.value) / 1000).toFixed(0)}k</span>
                    {div.target && (
                      <span className="text-muted-foreground text-sm ml-2">
                        / ${(div.target / 1000).toFixed(0)}k
                      </span>
                    )}
                  </div>
                </div>
                {div.target && (
                  <Progress value={((div.revenue || div.value) / div.target) * 100} className="h-2" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Deal Pipeline */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Deal Pipeline
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                ${(mockDealPipeline.reduce((sum, s) => sum + s.value, 0) / 1000).toFixed(0)}K total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Pipeline bar */}
            <div className="h-3 flex rounded-full overflow-hidden mb-4">
              {mockDealPipeline.map((stage) => {
                const total = mockDealPipeline.reduce((sum, s) => sum + s.value, 0);
                const width = (stage.value / total) * 100;
                return (
                  <div
                    key={stage.stage}
                    className="transition-all duration-500"
                    style={{
                      width: `${width}%`,
                      backgroundColor: stage.color,
                    }}
                    title={`${stage.stage}: $${(stage.value / 1000).toFixed(0)}K`}
                  />
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {mockDealPipeline.map((stage) => (
                <div key={stage.stage} className="p-2 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-xs text-muted-foreground">{stage.stage}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">{stage.count}</span>
                    <span className="text-xs text-muted-foreground">
                      ${(stage.value / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pod Scoreboard */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Pod Scoreboard
            </CardTitle>
            <Button variant="ghost" size="sm">
              View Details <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockPodScoreboard.map((pod) => (
              <div
                key={pod.name}
                className={cn(
                  'p-4 rounded-lg border',
                  pod.rank === 1 && 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={cn(
                    'text-xs',
                    pod.rank === 1 && 'bg-amber-100 text-amber-700',
                    pod.rank === 2 && 'bg-stone-100 text-stone-700',
                    pod.rank === 3 && 'bg-orange-100 text-orange-700',
                    pod.rank > 3 && 'bg-stone-100 text-stone-600',
                  )}>
                    #{pod.rank}
                  </Badge>
                  {pod.rank === 1 && <Award className="w-4 h-4 text-amber-500" />}
                </div>
                <p className="font-medium">{pod.name}</p>
                <p className="text-sm text-muted-foreground mb-2">{pod.lead}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    ${(pod.revenue / 1000).toFixed(0)}k
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {pod.placements} placements
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              AI Strategic Insights
            </CardTitle>
            <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700">
              Powered by AI
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAIInsights.map((insight) => (
              <div
                key={insight.id}
                className={cn(
                  'p-4 rounded-lg border flex items-start gap-3',
                  insight.type === 'opportunity' && 'border-green-200 bg-green-50',
                  insight.type === 'warning' && 'border-amber-200 bg-amber-50',
                  insight.type === 'success' && 'border-blue-200 bg-blue-50',
                )}
              >
                <Zap className={cn(
                  'w-5 h-5 flex-shrink-0',
                  insight.type === 'opportunity' && 'text-green-600',
                  insight.type === 'warning' && 'text-amber-600',
                  insight.type === 'success' && 'text-blue-600',
                )} />
                <div className="flex-1">
                  <p className="font-medium">{insight.title}</p>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
                <Badge className={cn(
                  'text-xs',
                  insight.impact === 'High' && 'bg-red-100 text-red-700',
                  insight.impact === 'Medium' && 'bg-amber-100 text-amber-700',
                  insight.impact === 'Low' && 'bg-stone-100 text-stone-700',
                )}>
                  {insight.impact} Impact
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Accounts */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Top Accounts by Revenue
            </CardTitle>
            <Link href="/employee/workspace/accounts">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockTopAccounts.map((account) => (
              <div key={account.name} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${(account.revenue / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      'text-xs',
                      account.growth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}
                  >
                    {account.growth > 0 ? '+' : ''}{account.growth}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {account.placements} placements this year
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">CEO Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Strategic overview and company-wide performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Board Report
              </Button>
              <Button size="sm">
                <Megaphone className="w-4 h-4 mr-2" />
                Announcement
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="strategic">Strategic</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="revenue">
            <Card>
              <CardContent className="py-12 text-center">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Detailed revenue analytics</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="operations">
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Operational metrics (COO view)</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="strategic">
            <Card>
              <CardContent className="py-12 text-center">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Strategic initiatives and OKRs</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Access */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Accounts', icon: Building2, href: '/employee/workspace/accounts', color: 'text-blue-600 bg-blue-100' },
              { name: 'Deals', icon: TrendingUp, href: '/employee/workspace/deals', color: 'text-green-600 bg-green-100' },
              { name: 'Jobs', icon: Briefcase, href: '/employee/workspace/jobs', color: 'text-amber-600 bg-amber-100' },
              { name: 'Talent', icon: Users, href: '/employee/workspace/talent', color: 'text-purple-600 bg-purple-100' },
            ].map((item) => (
              <Link key={item.name} href={item.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6 flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', item.color)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{item.name}</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
