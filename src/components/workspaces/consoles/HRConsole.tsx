/**
 * HRConsole
 *
 * Role-specific console for HR personnel
 * Shows people operations, onboarding, compliance, and retention metrics
 */

'use client';

import { useState } from 'react';
import {
  TrendingDown,
  ArrowRight,
  Users,
  UserPlus,
  UserCheck,
  Clock,
  Shield,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  Building2,
  DollarSign,
  Award,
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

export function HRConsole() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch real data from tRPC
  const { data: headcount, isLoading: headcountLoading } = trpc.hrMetrics.getHeadcount.useQuery();
  const { data: onboardingCount, isLoading: onboardingLoading } = trpc.hrMetrics.getOnboardingCount.useQuery();
  const { data: attritionRate, isLoading: attritionLoading } = trpc.hrMetrics.getAttritionRate.useQuery();
  const { data: onboardingList } = trpc.hrMetrics.getOnboardingList.useQuery();
  const { data: pendingApprovals } = trpc.hrMetrics.getPendingApprovals.useQuery();
  const { data: complianceAlerts } = trpc.hrMetrics.getComplianceAlerts.useQuery();
  const { data: departmentData } = trpc.hrMetrics.getHeadcountByDepartment.useQuery();

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
              {headcountLoading ? '...' : headcount?.value || 0}
            </p>
            <p className="text-sm text-blue-600/80">Total Headcount</p>
            {headcount?.label && (
              <p className="text-xs text-muted-foreground mt-1">{headcount.label}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <UserPlus className="w-5 h-5 text-green-600" />
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                Active
              </Badge>
            </div>
            <p className="text-3xl font-bold">
              {onboardingLoading ? '...' : onboardingCount?.value || 0}
            </p>
            <p className="text-sm text-muted-foreground">Onboarding</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">
                {pendingApprovals?.length || 0}
              </Badge>
            </div>
            <p className="text-3xl font-bold">{pendingApprovals?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Pending Approvals</p>
          </CardContent>
        </Card>
        <Card className={cn(
          (attritionRate?.value || 0) > 15 && 'border-red-200 bg-gradient-to-br from-red-50 to-orange-50'
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <p className={cn(
              'text-3xl font-bold',
              (attritionRate?.value || 0) > 15 ? 'text-red-700' : 'text-charcoal'
            )}>
              {attritionLoading ? '...' : `${attritionRate?.value || 0}%`}
            </p>
            <p className="text-sm text-muted-foreground">Attrition Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboarding Progress */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Onboarding Progress
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {onboardingList?.length || 0} active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[240px]">
              <div className="space-y-3">
                {onboardingList?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No employees currently onboarding
                  </p>
                )}
                {onboardingList?.map((emp) => (
                  <div key={emp.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{emp.title}</p>
                        <p className="text-sm text-muted-foreground">{emp.subtitle}</p>
                      </div>
                      <Badge className={cn(
                        'text-xs',
                        emp.statusColor === 'success' && 'bg-green-100 text-green-700',
                        emp.statusColor === 'warning' && 'bg-amber-100 text-amber-700',
                      )}>
                        {emp.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{emp.timestamp}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending Approvals
              </CardTitle>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[240px]">
              <div className="space-y-3">
                {pendingApprovals?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No pending approvals
                  </p>
                )}
                {pendingApprovals?.map((item) => (
                  <div key={item.id} className="p-3 bg-muted/30 rounded-lg flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
                    </div>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alerts */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Compliance Alerts
            </CardTitle>
            <Badge variant="destructive" className="text-xs">
              {complianceAlerts?.length || 0} alerts
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complianceAlerts?.length === 0 && (
              <div className="text-center py-8 text-green-600">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">All compliance requirements met</p>
              </div>
            )}
            {complianceAlerts?.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-3 rounded-lg flex items-start gap-3',
                  alert.statusColor === 'error' && 'bg-red-50 border border-red-200',
                  alert.statusColor === 'warning' && 'bg-amber-50 border border-amber-200',
                )}
              >
                <AlertCircle className={cn(
                  'w-5 h-5 flex-shrink-0',
                  alert.statusColor === 'error' && 'text-red-600',
                  alert.statusColor === 'warning' && 'text-amber-600',
                )} />
                <div className="flex-1">
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">{alert.subtitle}</p>
                </div>
                <Badge className={cn(
                  'text-xs',
                  alert.statusColor === 'error' && 'bg-red-100 text-red-700',
                  alert.statusColor === 'warning' && 'bg-amber-100 text-amber-700',
                )}>
                  {alert.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Headcount by Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {departmentData?.map((dept, index) => {
              const maxValue = Math.max(...(departmentData?.map(d => d.value) || [1]));
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{dept.label}</span>
                    <span>{dept.value}</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(dept.value / maxValue) * 100}%`,
                        backgroundColor: dept.color,
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
              <h1 className="text-xl font-semibold">HR Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                People operations, compliance, and workforce analytics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Export Census
              </Button>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
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
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="people">
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">People directory and org chart</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="performance">
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Performance reviews and goals</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="compliance">
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Compliance tracking and documents</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Access */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Add Employee', icon: UserPlus, color: 'text-green-600 bg-green-100' },
              { name: 'Run Payroll', icon: DollarSign, color: 'text-blue-600 bg-blue-100' },
              { name: 'View Org Chart', icon: Building2, color: 'text-purple-600 bg-purple-100' },
              { name: 'Approve PTO', icon: Calendar, color: 'text-amber-600 bg-amber-100' },
              { name: 'Compliance', icon: Shield, color: 'text-red-600 bg-red-100' },
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
