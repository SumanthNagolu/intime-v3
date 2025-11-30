/**
 * AdminConsole
 *
 * Role-specific console for System Administrators
 * Shows user management, system health, audit logs, and integrations
 */

'use client';

import { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Settings,
  Activity,
  Server,
  Link2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Key,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';

// =====================================================
// MAIN COMPONENT
// =====================================================

export function AdminConsole() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch real data from tRPC
  const { data: totalUsers, isLoading: usersLoading } = trpc.adminMetrics.getTotalUsers.useQuery();
  const { data: activeSessions } = trpc.adminMetrics.getActiveSessions.useQuery();
  const { data: systemHealth } = trpc.adminMetrics.getSystemHealth.useQuery();
  const { data: pendingRequests = [] } = trpc.adminMetrics.getPendingUserRequests.useQuery();
  const { data: recentLogins = [] } = trpc.adminMetrics.getRecentLogins.useQuery();
  const { data: auditActivity = [] } = trpc.adminMetrics.getAuditActivity.useQuery();
  const { data: integrationStatus = [] } = trpc.adminMetrics.getIntegrationStatus.useQuery();
  const { data: roleDistribution = [] } = trpc.adminMetrics.getRoleDistribution.useQuery();

  // =====================================================
  // OVERVIEW TAB
  // =====================================================

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-700">
              {usersLoading ? '...' : totalUsers?.value || 0}
            </p>
            <p className="text-sm text-blue-600/80">Total Users</p>
            {totalUsers?.label && (
              <p className="text-xs text-muted-foreground mt-1">{totalUsers.label}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-green-600" />
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                Live
              </Badge>
            </div>
            <p className="text-3xl font-bold">{activeSessions?.value || 0}</p>
            <p className="text-sm text-muted-foreground">Active Sessions</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Server className="w-5 h-5 text-green-600" />
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-700">{systemHealth?.value || 99.9}%</p>
            <p className="text-sm text-green-600/80">System Uptime</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">
                {pendingRequests.length}
              </Badge>
            </div>
            <p className="text-3xl font-bold">{pendingRequests.length}</p>
            <p className="text-sm text-muted-foreground">Pending Requests</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending User Requests */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Pending User Requests
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {pendingRequests.length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[240px]">
              <div className="space-y-3">
                {pendingRequests.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No pending requests
                  </p>
                )}
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-3 bg-muted/30 rounded-lg flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{req.title}</p>
                      <p className="text-sm text-muted-foreground">{req.subtitle}</p>
                      <p className="text-xs text-muted-foreground mt-1">{req.timestamp}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Deny</Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Logins */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="w-4 h-4" />
                Recent Logins
              </CardTitle>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[240px]">
              <div className="space-y-3">
                {recentLogins.map((login) => (
                  <div key={login.id} className="p-3 bg-muted/30 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{login.title}</p>
                      <p className="text-sm text-muted-foreground">{login.subtitle}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{login.timestamp}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Integration Status
            </CardTitle>
            <Button variant="ghost" size="sm">
              Manage Integrations <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrationStatus.map((integration) => (
              <div
                key={integration.id}
                className={cn(
                  'p-4 rounded-lg border',
                  integration.statusColor === 'success' && 'border-green-200 bg-green-50',
                  integration.statusColor === 'warning' && 'border-amber-200 bg-amber-50',
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <Globe className={cn(
                    'w-5 h-5',
                    integration.statusColor === 'success' && 'text-green-600',
                    integration.statusColor === 'warning' && 'text-amber-600',
                  )} />
                  <Badge className={cn(
                    'text-xs',
                    integration.statusColor === 'success' && 'bg-green-100 text-green-700',
                    integration.statusColor === 'warning' && 'bg-amber-100 text-amber-700',
                  )}>
                    {integration.status}
                  </Badge>
                </div>
                <p className="font-medium">{integration.title}</p>
                <p className="text-sm text-muted-foreground">{integration.subtitle}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Activity */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Recent System Activity
            </CardTitle>
            <Button variant="ghost" size="sm">
              View Audit Logs <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditActivity.map((activity) => (
              <div
                key={activity.id}
                className={cn(
                  'p-3 rounded-lg flex items-start gap-3',
                  activity.statusColor === 'warning' && 'bg-amber-50 border border-amber-200',
                  activity.statusColor === 'default' && 'bg-muted/30',
                )}
              >
                {activity.statusColor === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                ) : (
                  <Activity className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.subtitle}</p>
                </div>
                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roleDistribution.map((role, index) => {
              const maxValue = Math.max(...(roleDistribution.map(r => r.value)), 1);
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium capitalize">{role.label}</span>
                    <span>{role.value}</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(role.value / maxValue) * 100}%`,
                        backgroundColor: role.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
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
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                System administration, user management, and security
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                View Audit Logs
              </Button>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Create User
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
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="users">
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">User management and permissions</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="audit">
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Full audit log and security events</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="system">
            <Card>
              <CardContent className="py-12 text-center">
                <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">System configuration and settings</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Access */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Create User', icon: UserPlus, color: 'text-green-600 bg-green-100' },
              { name: 'Manage Roles', icon: Shield, color: 'text-purple-600 bg-purple-100' },
              { name: 'Audit Logs', icon: FileText, color: 'text-blue-600 bg-blue-100' },
              { name: 'Integrations', icon: Link2, color: 'text-amber-600 bg-amber-100' },
              { name: 'Settings', icon: Settings, color: 'text-stone-600 bg-stone-100' },
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
