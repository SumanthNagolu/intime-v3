/**
 * ManagerConsole
 *
 * Adaptive role-specific console for team managers
 * Supports three manager types: Recruiting, Bench Sales, and TA
 * Shows team performance, pipeline health, and type-specific metrics
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  TrendingUp,
  ArrowRight,
  BarChart3,
  Calendar,
  DollarSign,
  Award,
  Briefcase,
  Target,
  Clock,
  AlertTriangle,
  Activity,
  UserCheck,
  PieChart,
  Building2,
  Send,
  Megaphone,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export type ManagerType = 'recruiting' | 'bench' | 'ta';

export interface ManagerConsoleProps {
  /** The type of manager (determines which metrics/sections to show) */
  managerType?: ManagerType;
  /** Whether the user also has IC responsibilities (combined role) */
  hasICRole?: boolean;
}

// =====================================================
// MANAGER TYPE CONFIGURATIONS
// =====================================================

const managerTypeConfig = {
  recruiting: {
    title: 'Recruiting Manager',
    description: 'Team performance and hiring pipeline',
    primaryMetric: 'Placements',
    secondaryMetric: 'Submissions',
    pipelineLabel: 'Hiring Pipeline',
    teamMemberRole: 'Recruiter',
    goalLabel: 'Placement Goal',
    quickLinks: [
      { name: 'Jobs', icon: Briefcase, href: '/employee/workspace/jobs', color: 'text-blue-600 bg-blue-100' },
      { name: 'Submissions', icon: Send, href: '/employee/workspace/submissions', color: 'text-amber-600 bg-amber-100' },
      { name: 'Accounts', icon: Building2, href: '/employee/workspace/accounts', color: 'text-purple-600 bg-purple-100' },
      { name: 'Deals', icon: TrendingUp, href: '/employee/workspace/deals', color: 'text-green-600 bg-green-100' },
    ],
  },
  bench: {
    title: 'Bench Sales Manager',
    description: 'Consultant marketing and placement pipeline',
    primaryMetric: 'Placements',
    secondaryMetric: 'Marketing',
    pipelineLabel: 'Marketing Pipeline',
    teamMemberRole: 'Bench Sales Rep',
    goalLabel: 'Placement Goal',
    quickLinks: [
      { name: 'Hotlist', icon: Users, href: '/employee/workspace/talent', color: 'text-blue-600 bg-blue-100' },
      { name: 'Job Orders', icon: Briefcase, href: '/employee/workspace/jobs', color: 'text-amber-600 bg-amber-100' },
      { name: 'Vendors', icon: Building2, href: '/employee/workspace/accounts', color: 'text-purple-600 bg-purple-100' },
      { name: 'Placements', icon: Award, href: '/employee/workspace/deals', color: 'text-green-600 bg-green-100' },
    ],
  },
  ta: {
    title: 'Talent Acquisition Manager',
    description: 'Sourcing campaigns and talent pipeline',
    primaryMetric: 'Hires',
    secondaryMetric: 'Campaigns',
    pipelineLabel: 'Sourcing Pipeline',
    teamMemberRole: 'TA Specialist',
    goalLabel: 'Hiring Goal',
    quickLinks: [
      { name: 'Campaigns', icon: Megaphone, href: '/employee/workspace/campaigns', color: 'text-blue-600 bg-blue-100' },
      { name: 'Leads', icon: Target, href: '/employee/workspace/leads', color: 'text-amber-600 bg-amber-100' },
      { name: 'Talent Pool', icon: Users, href: '/employee/workspace/talent', color: 'text-purple-600 bg-purple-100' },
      { name: 'Reports', icon: BarChart3, href: '/employee/workspace/reports', color: 'text-green-600 bg-green-100' },
    ],
  },
};

// =====================================================
// MOCK DATA BY MANAGER TYPE
// =====================================================

const mockTeamStatsByType = {
  recruiting: {
    teamSize: 8,
    activeJobs: 24,
    totalSubmissions: 87,
    placements: 12,
    placementsTarget: 20,
    revenue: 485000,
    revenueTarget: 750000,
    avgTimeToFill: 21,
    pipelineHealth: 78,
  },
  bench: {
    teamSize: 5,
    activeJobs: 42,
    totalSubmissions: 156,
    placements: 8,
    placementsTarget: 15,
    revenue: 320000,
    revenueTarget: 500000,
    avgTimeToFill: 14,
    pipelineHealth: 82,
  },
  ta: {
    teamSize: 6,
    activeJobs: 18,
    totalSubmissions: 234,
    placements: 15,
    placementsTarget: 25,
    revenue: 0,
    revenueTarget: 0,
    avgTimeToFill: 28,
    pipelineHealth: 71,
  },
};

const mockTeamMembersByType = {
  recruiting: [
    { id: '1', name: 'Sarah Chen', role: 'Senior Recruiter', placements: 4, target: 5, submissions: 18, interviews: 6, status: 'on_track' as const },
    { id: '2', name: 'Michael Johnson', role: 'Recruiter', placements: 3, target: 4, submissions: 15, interviews: 4, status: 'on_track' as const },
    { id: '3', name: 'Emily Williams', role: 'Recruiter', placements: 2, target: 4, submissions: 12, interviews: 3, status: 'at_risk' as const },
    { id: '4', name: 'David Brown', role: 'Jr. Recruiter', placements: 1, target: 3, submissions: 8, interviews: 2, status: 'behind' as const },
  ],
  bench: [
    { id: '1', name: 'Alex Kumar', role: 'Sr. Bench Sales', placements: 3, target: 4, submissions: 45, interviews: 8, status: 'on_track' as const },
    { id: '2', name: 'Lisa Park', role: 'Bench Sales Rep', placements: 2, target: 3, submissions: 38, interviews: 5, status: 'on_track' as const },
    { id: '3', name: 'Tom Wilson', role: 'Bench Sales Rep', placements: 2, target: 4, submissions: 42, interviews: 6, status: 'at_risk' as const },
    { id: '4', name: 'Nina Patel', role: 'Jr. Bench Sales', placements: 1, target: 2, submissions: 31, interviews: 3, status: 'on_track' as const },
  ],
  ta: [
    { id: '1', name: 'Jordan Lee', role: 'Sr. TA Specialist', placements: 5, target: 6, submissions: 62, interviews: 18, status: 'on_track' as const },
    { id: '2', name: 'Casey Morgan', role: 'TA Specialist', placements: 4, target: 5, submissions: 48, interviews: 12, status: 'on_track' as const },
    { id: '3', name: 'Riley Adams', role: 'TA Specialist', placements: 3, target: 5, submissions: 55, interviews: 14, status: 'at_risk' as const },
    { id: '4', name: 'Sam Taylor', role: 'Jr. TA Specialist', placements: 3, target: 4, submissions: 69, interviews: 10, status: 'on_track' as const },
  ],
};

const mockPipelineByType = {
  recruiting: [
    { stage: 'Sourcing', count: 45, color: 'bg-stone-500' },
    { stage: 'Screening', count: 28, color: 'bg-blue-500' },
    { stage: 'Submitted', count: 18, color: 'bg-amber-500' },
    { stage: 'Interview', count: 12, color: 'bg-purple-500' },
    { stage: 'Offer', count: 6, color: 'bg-cyan-500' },
  ],
  bench: [
    { stage: 'On Bench', count: 42, color: 'bg-stone-500' },
    { stage: 'Marketing', count: 156, color: 'bg-blue-500' },
    { stage: 'Submitted', count: 28, color: 'bg-amber-500' },
    { stage: 'Interview', count: 15, color: 'bg-purple-500' },
    { stage: 'Placed', count: 8, color: 'bg-cyan-500' },
  ],
  ta: [
    { stage: 'Sourced', count: 234, color: 'bg-stone-500' },
    { stage: 'Contacted', count: 89, color: 'bg-blue-500' },
    { stage: 'Screening', count: 45, color: 'bg-amber-500' },
    { stage: 'Interview', count: 28, color: 'bg-purple-500' },
    { stage: 'Hired', count: 15, color: 'bg-cyan-500' },
  ],
};

const mockAlertsByType = {
  recruiting: [
    { type: 'warning' as const, message: '3 jobs with no submissions in 7+ days', count: 3 },
    { type: 'info' as const, message: 'Team meeting scheduled for Friday 2pm', count: null },
    { type: 'success' as const, message: '2 offers accepted this week', count: 2 },
  ],
  bench: [
    { type: 'warning' as const, message: '5 consultants on bench > 30 days', count: 5 },
    { type: 'info' as const, message: 'New vendor requirements from TechCorp', count: null },
    { type: 'success' as const, message: '3 placements confirmed this week', count: 3 },
  ],
  ta: [
    { type: 'warning' as const, message: '2 campaigns below target response rate', count: 2 },
    { type: 'info' as const, message: 'Campus recruiting event next Tuesday', count: null },
    { type: 'success' as const, message: '5 offers extended this week', count: 5 },
  ],
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export function ManagerConsole({ managerType = 'recruiting', hasICRole = false }: ManagerConsoleProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Get type-specific configuration and data
  const config = managerTypeConfig[managerType];
  const teamStats = mockTeamStatsByType[managerType];
  const teamMembers = mockTeamMembersByType[managerType];
  const pipelineStages = mockPipelineByType[managerType];
  const alerts = mockAlertsByType[managerType];

  // Determine which metrics labels to use based on manager type
  const metricsLabels = useMemo(() => {
    switch (managerType) {
      case 'bench':
        return {
          jobs: 'Job Orders',
          pipeline: 'On Marketing',
          primary: 'Placements',
        };
      case 'ta':
        return {
          jobs: 'Open Reqs',
          pipeline: 'In Pipeline',
          primary: 'Hires',
        };
      default:
        return {
          jobs: 'Active Jobs',
          pipeline: 'In Pipeline',
          primary: 'Placements',
        };
    }
  }, [managerType]);

  // =====================================================
  // OVERVIEW TAB
  // =====================================================

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{teamStats.teamSize}</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{teamStats.activeJobs}</p>
                <p className="text-sm text-muted-foreground">{metricsLabels.jobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{teamStats.totalSubmissions}</p>
                <p className="text-sm text-muted-foreground">{metricsLabels.pipeline}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{teamStats.placements}</p>
                <p className="text-sm text-muted-foreground">{metricsLabels.primary} MTD</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              {config.goalLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl font-bold">{teamStats.placements}</span>
              <span className="text-muted-foreground">of {teamStats.placementsTarget}</span>
            </div>
            <Progress value={(teamStats.placements / teamStats.placementsTarget) * 100} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {teamStats.placementsTarget - teamStats.placements} more to hit team target
            </p>
          </CardContent>
        </Card>
        {/* Revenue Goal - only show for revenue-generating roles */}
        {teamStats.revenueTarget > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Revenue Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl font-bold text-green-600">
                  ${(teamStats.revenue / 1000).toFixed(0)}k
                </span>
                <span className="text-muted-foreground">of ${(teamStats.revenueTarget / 1000).toFixed(0)}k</span>
              </div>
              <Progress value={(teamStats.revenue / teamStats.revenueTarget) * 100} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                ${((teamStats.revenueTarget - teamStats.revenue) / 1000).toFixed(0)}k remaining
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time to Fill
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl font-bold">{teamStats.avgTimeToFill}</span>
                <span className="text-muted-foreground">days avg</span>
              </div>
              <Progress value={Math.min(100, (30 / teamStats.avgTimeToFill) * 100)} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                Target: 30 days or less
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Performance */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team Performance
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  This Month
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4 pr-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            'text-xs',
                            member.status === 'on_track' && 'bg-green-100 text-green-700',
                            member.status === 'at_risk' && 'bg-amber-100 text-amber-700',
                            member.status === 'behind' && 'bg-red-100 text-red-700'
                          )}
                        >
                          {member.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-bold">{member.placements}/{member.target}</p>
                          <p className="text-xs text-muted-foreground">{config.primaryMetric}</p>
                        </div>
                        <div>
                          <p className="font-bold">{member.submissions}</p>
                          <p className="text-xs text-muted-foreground">{config.secondaryMetric}</p>
                        </div>
                        <div>
                          <p className="font-bold">{member.interviews}</p>
                          <p className="text-xs text-muted-foreground">Interviews</p>
                        </div>
                        <div>
                          <Progress
                            value={(member.placements / member.target) * 100}
                            className="h-2 mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Pipeline */}
        <div className="space-y-6">
          {/* Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className={cn(
                    'p-3 rounded-lg text-sm',
                    alert.type === 'warning' && 'bg-amber-50 border border-amber-200',
                    alert.type === 'info' && 'bg-blue-50 border border-blue-200',
                    alert.type === 'success' && 'bg-green-50 border border-green-200'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <p>{alert.message}</p>
                    {alert.count && (
                      <Badge variant="secondary" className="text-xs">
                        {alert.count}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pipeline by Stage */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                {config.pipelineLabel}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pipelineStages.map((stage) => (
                <div key={stage.stage} className="flex items-center gap-3">
                  <div className={cn('w-3 h-3 rounded-full', stage.color)} />
                  <span className="flex-1 text-sm">{stage.stage}</span>
                  <span className="font-bold">{stage.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* My Work Section - shown when manager also has IC role */}
      {hasICRole && (
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                My Work
              </CardTitle>
              <Badge variant="outline" className="text-xs bg-indigo-100 text-indigo-700">
                Individual Contributor
              </Badge>
            </div>
            <CardDescription>
              Your personal pipeline and tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">My {metricsLabels.jobs}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">My Submissions</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">My Interviews</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">My {metricsLabels.primary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
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
              <h1 className="text-xl font-semibold">{config.title}</h1>
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </Button>
              <Button size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule 1:1
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
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            {hasICRole && <TabsTrigger value="my-work">My Work</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="team">
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Detailed team management</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pipeline">
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Pipeline analytics and health</p>
              </CardContent>
            </Card>
          </TabsContent>
          {hasICRole && (
            <TabsContent value="my-work">
              <Card>
                <CardContent className="py-12 text-center">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Your personal work queue and pipeline</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Quick Access */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {config.quickLinks.map((item) => (
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
