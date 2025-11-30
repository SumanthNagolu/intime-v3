/**
 * COOConsole
 *
 * Role-specific console for Chief Operating Officer
 * Shows operations efficiency, process metrics, capacity, and bottlenecks
 */

'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Activity,
  Clock,
  Users,
  Target,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Timer,
  Gauge,
  FileSpreadsheet,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';

// =====================================================
// MOCK DATA (until COO-specific procedures are added)
// =====================================================

const mockOpsMetrics = {
  timeToFill: { value: 19, target: 21, trend: 'up' as const },
  fillRate: { value: 72, target: 70, trend: 'up' as const },
  productivity: { value: 2.4, label: 'Placements/Recruiter/Month' },
  slaCompliance: { value: 94, target: 95 },
};

const mockProcessBottlenecks = [
  { stage: 'Sourcing', conversion: 85, color: '#10B981' },
  { stage: 'Screening', conversion: 62, color: '#F59E0B' },
  { stage: 'Submission', conversion: 78, color: '#10B981' },
  { stage: 'Interview', conversion: 45, color: '#EF4444' },
  { stage: 'Offer', conversion: 72, color: '#10B981' },
];

const mockCapacityUtilization = [
  { team: 'Recruiting Team A', utilization: 92, capacity: 100 },
  { team: 'Recruiting Team B', utilization: 78, capacity: 100 },
  { team: 'Bench Sales', utilization: 85, capacity: 100 },
  { team: 'TA/BD', utilization: 67, capacity: 100 },
];

const mockOperationalAlerts = [
  {
    id: '1',
    title: 'Interview Stage Bottleneck',
    subtitle: '45% conversion rate - below target of 60%',
    status: 'Warning',
    statusColor: 'warning' as const,
    timestamp: 'Detected 2 days ago',
  },
  {
    id: '2',
    title: 'TA/BD Capacity Low',
    subtitle: '67% utilization - team may need additional resources',
    status: 'Info',
    statusColor: 'default' as const,
    timestamp: 'This week',
  },
];

const mockPipelineHealth = [
  { stage: 'Sourced', count: 145, color: '#6366F1' },
  { stage: 'Screening', count: 89, color: '#8B5CF6' },
  { stage: 'Submitted', count: 67, color: '#D87254' },
  { stage: 'Interview', count: 34, color: '#F59E0B' },
  { stage: 'Offer', count: 12, color: '#10B981' },
  { stage: 'Placed', count: 8, color: '#059669' },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

export function COOConsole() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch some real data
  const { data: recruiterMetrics } = trpc.dashboard.recruiterMetrics.useQuery(undefined);

  // =====================================================
  // OVERVIEW TAB
  // =====================================================

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={cn(
          mockOpsMetrics.timeToFill.value <= mockOpsMetrics.timeToFill.target
            ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
            : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50'
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Timer className="w-5 h-5 text-green-600" />
              {mockOpsMetrics.timeToFill.trend === 'up' && (
                <TrendingUp className="w-4 h-4 text-green-600" />
              )}
            </div>
            <p className="text-3xl font-bold text-green-700">
              {mockOpsMetrics.timeToFill.value} days
            </p>
            <p className="text-sm text-green-600/80">Avg Time to Fill</p>
            <p className="text-xs text-muted-foreground mt-1">
              Target: {mockOpsMetrics.timeToFill.target} days
            </p>
          </CardContent>
        </Card>
        <Card className={cn(
          mockOpsMetrics.fillRate.value >= mockOpsMetrics.fillRate.target
            ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
            : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50'
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                On Target
              </Badge>
            </div>
            <p className="text-3xl font-bold text-green-700">
              {mockOpsMetrics.fillRate.value}%
            </p>
            <p className="text-sm text-green-600/80">Fill Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Gauge className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">{mockOpsMetrics.productivity.value}</p>
            <p className="text-sm text-muted-foreground">Productivity Index</p>
            <p className="text-xs text-muted-foreground mt-1">
              {mockOpsMetrics.productivity.label}
            </p>
          </CardContent>
        </Card>
        <Card className={cn(
          mockOpsMetrics.slaCompliance.value >= mockOpsMetrics.slaCompliance.target
            ? ''
            : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50'
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
              <Badge variant="outline" className={cn(
                'text-xs',
                mockOpsMetrics.slaCompliance.value >= mockOpsMetrics.slaCompliance.target
                  ? 'bg-green-50 text-green-700'
                  : 'bg-amber-50 text-amber-700'
              )}>
                Target: {mockOpsMetrics.slaCompliance.target}%
              </Badge>
            </div>
            <p className="text-3xl font-bold">{mockOpsMetrics.slaCompliance.value}%</p>
            <p className="text-sm text-muted-foreground">SLA Compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Company Pipeline */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Company Pipeline Health
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {recruiterMetrics?.totalSubmissions || mockPipelineHealth.reduce((sum, s) => sum + s.count, 0)} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Pipeline bar */}
          <div className="h-4 flex rounded-full overflow-hidden mb-4">
            {mockPipelineHealth.map((stage) => {
              const total = mockPipelineHealth.reduce((sum, s) => sum + s.count, 0);
              const width = (stage.count / total) * 100;
              return (
                <div
                  key={stage.stage}
                  className="transition-all duration-500"
                  style={{
                    width: `${width}%`,
                    backgroundColor: stage.color,
                    minWidth: stage.count > 0 ? '4px' : '0',
                  }}
                  title={`${stage.stage}: ${stage.count}`}
                />
              );
            })}
          </div>

          {/* Stage cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {mockPipelineHealth.map((stage) => (
              <div
                key={stage.stage}
                className="p-3 rounded-lg border border-border hover:border-rust/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-xs text-muted-foreground truncate">
                    {stage.stage}
                  </span>
                </div>
                <div className="text-xl font-bold text-charcoal">
                  {stage.count}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Process Bottlenecks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Process Conversion Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProcessBottlenecks.map((stage) => (
                <div key={stage.stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{stage.stage}</span>
                    <span className={cn(
                      'font-bold',
                      stage.conversion >= 70 ? 'text-green-600' :
                      stage.conversion >= 50 ? 'text-amber-600' : 'text-red-600'
                    )}>
                      {stage.conversion}%
                    </span>
                  </div>
                  <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stage.conversion}%`,
                        backgroundColor: stage.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Capacity Utilization */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Capacity Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCapacityUtilization.map((team) => (
                <div key={team.team}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{team.team}</span>
                    <span className={cn(
                      'font-bold',
                      team.utilization >= 85 ? 'text-green-600' :
                      team.utilization >= 70 ? 'text-amber-600' : 'text-red-600'
                    )}>
                      {team.utilization}%
                    </span>
                  </div>
                  <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${team.utilization}%`,
                        backgroundColor: team.utilization >= 85 ? '#10B981' :
                          team.utilization >= 70 ? '#F59E0B' : '#EF4444',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Alerts */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Operational Alerts
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {mockOperationalAlerts.length} alerts
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockOperationalAlerts.length === 0 && (
              <div className="text-center py-8 text-green-600">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">All operations running smoothly</p>
              </div>
            )}
            {mockOperationalAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-3 rounded-lg flex items-start gap-3',
                  alert.statusColor === 'warning' && 'bg-amber-50 border border-amber-200',
                  alert.statusColor === 'default' && 'bg-muted/30',
                )}
              >
                <AlertTriangle className={cn(
                  'w-5 h-5 flex-shrink-0',
                  alert.statusColor === 'warning' && 'text-amber-600',
                  alert.statusColor === 'default' && 'text-muted-foreground',
                )} />
                <div className="flex-1">
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">{alert.subtitle}</p>
                </div>
                <div className="text-right">
                  <Badge className={cn(
                    'text-xs',
                    alert.statusColor === 'warning' && 'bg-amber-100 text-amber-700',
                    alert.statusColor === 'default' && 'bg-stone-100 text-stone-700',
                  )}>
                    {alert.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                </div>
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
              <h1 className="text-xl font-semibold">COO Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Operations efficiency, process metrics, and capacity planning
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Ops Report
              </Button>
              <Button size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Process Review
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
            <TabsTrigger value="processes">Processes</TabsTrigger>
            <TabsTrigger value="capacity">Capacity</TabsTrigger>
            <TabsTrigger value="sla">SLA</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="processes">
            <Card>
              <CardContent className="py-12 text-center">
                <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Process optimization and workflow analysis</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="capacity">
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Team capacity planning and resource allocation</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sla">
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Service level agreement tracking</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Access */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Process Review', icon: Settings, color: 'text-purple-600 bg-purple-100' },
              { name: 'Capacity Plan', icon: Users, color: 'text-blue-600 bg-blue-100' },
              { name: 'SLA Dashboard', icon: Clock, color: 'text-amber-600 bg-amber-100' },
              { name: 'Team Sync', icon: Users, color: 'text-green-600 bg-green-100' },
              { name: 'Export Report', icon: FileSpreadsheet, color: 'text-red-600 bg-red-100' },
            ].map((item) => (
              <Card key={item.name} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6 flex flex-col items-center gap-2 text-center">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', item.color)}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{item.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
