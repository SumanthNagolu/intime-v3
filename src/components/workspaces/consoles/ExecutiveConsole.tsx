/**
 * ExecutiveConsole
 *
 * Role-specific console for executives (CEO, COO, etc.)
 * Shows company-wide metrics, revenue, and strategic KPIs
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart3,
  DollarSign,
  Award,
  Briefcase,
  Users,
  Target,
  Building2,
  PieChart,
  Activity,
  Calendar,
  Globe,
  Percent,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// =====================================================
// MOCK DATA
// =====================================================

const mockCompanyStats = {
  revenue: 2450000,
  revenueTarget: 3000000,
  revenuePrevYear: 1980000,
  placements: 48,
  placementsTarget: 75,
  activeClients: 32,
  totalEmployees: 45,
  grossMargin: 32.5,
  avgBillRate: 92.50,
  avgTimeToFill: 19,
  clientRetention: 94,
  nps: 72,
};

const mockRevenueByDivision = [
  { name: 'Recruiting', revenue: 1250000, target: 1500000, color: 'bg-blue-500' },
  { name: 'Bench Sales', revenue: 780000, target: 900000, color: 'bg-indigo-500' },
  { name: 'Talent Acquisition', revenue: 420000, target: 600000, color: 'bg-purple-500' },
];

const mockTopClients = [
  { name: 'TechFlow Inc', revenue: 485000, placements: 12, change: 23 },
  { name: 'CloudScale Systems', revenue: 342000, placements: 8, change: 15 },
  { name: 'DataForge', revenue: 278000, placements: 6, change: -5 },
  { name: 'InnovateTech', revenue: 215000, placements: 5, change: 42 },
];

const mockQuarterlyTrend = [
  { quarter: 'Q1', revenue: 580000, placements: 11 },
  { quarter: 'Q2', revenue: 620000, placements: 13 },
  { quarter: 'Q3', revenue: 710000, placements: 14 },
  { quarter: 'Q4 (proj)', revenue: 540000, placements: 10 },
];

const mockKPIs = [
  { label: 'Gross Margin', value: '32.5%', target: '30%', status: 'above' },
  { label: 'Client Retention', value: '94%', target: '90%', status: 'above' },
  { label: 'Time to Fill', value: '19 days', target: '21 days', status: 'above' },
  { label: 'Fill Rate', value: '68%', target: '70%', status: 'below' },
  { label: 'Submission/Placement', value: '8.2', target: '10', status: 'above' },
  { label: 'Client NPS', value: '72', target: '60', status: 'above' },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

export function ExecutiveConsole() {
  const [activeTab, setActiveTab] = useState('overview');

  const revenueGrowth = ((mockCompanyStats.revenue - mockCompanyStats.revenuePrevYear) / mockCompanyStats.revenuePrevYear * 100).toFixed(1);

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
              ${(mockCompanyStats.revenue / 1000000).toFixed(2)}M
            </p>
            <p className="text-sm text-green-600/80">Revenue YTD</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-purple-600" />
              <Badge variant="outline" className="text-xs">
                {((mockCompanyStats.placements / mockCompanyStats.placementsTarget) * 100).toFixed(0)}%
              </Badge>
            </div>
            <p className="text-3xl font-bold">{mockCompanyStats.placements}</p>
            <p className="text-sm text-muted-foreground">Placements YTD</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">{mockCompanyStats.activeClients}</p>
            <p className="text-sm text-muted-foreground">Active Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold">{mockCompanyStats.totalEmployees}</p>
            <p className="text-sm text-muted-foreground">Team Members</p>
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
              ${(mockCompanyStats.revenue / 1000000).toFixed(2)}M
            </span>
            <span className="text-muted-foreground">
              ({((mockCompanyStats.revenue / mockCompanyStats.revenueTarget) * 100).toFixed(0)}% of goal)
            </span>
          </div>
          <Progress value={(mockCompanyStats.revenue / mockCompanyStats.revenueTarget) * 100} className="h-4" />
          <p className="text-sm text-muted-foreground mt-2">
            ${((mockCompanyStats.revenueTarget - mockCompanyStats.revenue) / 1000000).toFixed(2)}M remaining to hit annual goal
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Division */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Revenue by Division
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRevenueByDivision.map((div) => (
                <div key={div.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', div.color)} />
                      <span className="font-medium">{div.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">${(div.revenue / 1000).toFixed(0)}k</span>
                      <span className="text-muted-foreground text-sm ml-2">
                        / ${(div.target / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                  <Progress value={(div.revenue / div.target) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* KPIs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Key Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockKPIs.map((kpi) => (
              <div key={kpi.label} className="flex items-center justify-between">
                <span className="text-sm">{kpi.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{kpi.value}</span>
                  {kpi.status === 'above' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Clients */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Top Clients by Revenue
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
            {mockTopClients.map((client) => (
              <div key={client.name} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${(client.revenue / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      'text-xs',
                      client.change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}
                  >
                    {client.change > 0 ? '+' : ''}{client.change}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {client.placements} placements this year
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
              <h1 className="text-xl font-semibold">Executive Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Company-wide performance and strategic metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Review
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
            <TabsTrigger value="clients">Clients</TabsTrigger>
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
                <p className="text-muted-foreground">Operational metrics and efficiency</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="clients">
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Client portfolio analysis</p>
                <Link href="/employee/workspace/accounts">
                  <Button className="mt-4">Go to Accounts Workspace</Button>
                </Link>
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
