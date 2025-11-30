/**
 * CFOConsole
 *
 * Role-specific console for Chief Financial Officer
 * Shows financial metrics, revenue, margins, AR aging, and cash flow
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  DollarSign,
  Percent,
  Clock,
  Building2,
  PieChart,
  BarChart3,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  Wallet,
  Target,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';

// =====================================================
// MAIN COMPONENT
// =====================================================

export function CFOConsole() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch real data from tRPC
  const { data: revenueMTD, isLoading: revenueMTDLoading } = trpc.financeMetrics.getRevenueMTD.useQuery();
  const { data: grossMargin, isLoading: marginLoading } = trpc.financeMetrics.getGrossMargin.useQuery();
  const { data: dso } = trpc.financeMetrics.getDSO.useQuery();
  const { data: revenueTrend } = trpc.financeMetrics.getRevenueTrend.useQuery();
  const { data: revenueByClient } = trpc.financeMetrics.getRevenueByClient.useQuery();
  const { data: outstandingInvoices } = trpc.financeMetrics.getOutstandingInvoices.useQuery();
  const { data: profitability } = trpc.financeMetrics.getProfitabilityByAccount.useQuery();
  const { data: cashFlow } = trpc.financeMetrics.getCashFlowProjection.useQuery();

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
              {revenueMTD?.trend === 'up' ? (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  +{revenueMTD?.change}%
                </div>
              ) : revenueMTD?.trend === 'down' ? (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <TrendingDown className="w-4 h-4" />
                  -{revenueMTD?.change}%
                </div>
              ) : null}
            </div>
            <p className="text-3xl font-bold text-green-700">
              {revenueMTDLoading ? '...' : `$${((revenueMTD?.value || 0) / 1000).toFixed(0)}K`}
            </p>
            <p className="text-sm text-green-600/80">Revenue MTD</p>
          </CardContent>
        </Card>
        <Card className={cn(
          (grossMargin?.value || 0) >= 25
            ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
            : (grossMargin?.value || 0) >= 20
            ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50'
            : 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50'
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Percent className="w-5 h-5 text-green-600" />
            </div>
            <p className={cn(
              'text-3xl font-bold',
              (grossMargin?.value || 0) >= 25 ? 'text-green-700' :
              (grossMargin?.value || 0) >= 20 ? 'text-amber-700' : 'text-red-700'
            )}>
              {marginLoading ? '...' : `${grossMargin?.value || 0}%`}
            </p>
            <p className="text-sm text-muted-foreground">Gross Margin</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              {dso?.target && (
                <Badge variant="outline" className={cn(
                  'text-xs',
                  (dso?.value || 0) <= (dso?.target || 45)
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                )}>
                  Target: {dso.target}
                </Badge>
              )}
            </div>
            <p className="text-3xl font-bold">{dso?.value || 0}</p>
            <p className="text-sm text-muted-foreground">DSO (Days)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Receipt className="w-5 h-5 text-amber-600" />
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">
                {outstandingInvoices?.filter(i => i.statusColor === 'error').length || 0} overdue
              </Badge>
            </div>
            <p className="text-3xl font-bold">{outstandingInvoices?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Outstanding Invoices</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueTrend?.map((month, index) => {
                const maxValue = Math.max(...(revenueTrend?.map(m => m.value) || [1]));
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{month.label}</span>
                      <span>${(month.value / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(month.value / maxValue) * 100}%`,
                          backgroundColor: month.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Client */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Revenue by Client
              </CardTitle>
              <Link href="/employee/workspace/accounts">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueByClient?.slice(0, 5).map((client, index) => {
                const maxValue = Math.max(...(revenueByClient?.map(c => c.value) || [1]));
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium truncate flex-1">{client.label}</span>
                      <span className="font-bold">${(client.value / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(client.value / maxValue) * 100}%`,
                          backgroundColor: client.color,
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

      {/* Outstanding Invoices */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Accounts Receivable
            </CardTitle>
            <Button variant="ghost" size="sm">
              View AR Aging <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {outstandingInvoices?.map((invoice) => (
              <div
                key={invoice.id}
                className={cn(
                  'p-3 rounded-lg flex items-start gap-3',
                  invoice.statusColor === 'error' && 'bg-red-50 border border-red-200',
                  invoice.statusColor === 'warning' && 'bg-amber-50 border border-amber-200',
                  invoice.statusColor === 'success' && 'bg-green-50 border border-green-200',
                )}
              >
                {invoice.statusColor === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                ) : invoice.statusColor === 'warning' ? (
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                ) : (
                  <Receipt className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{invoice.title}</p>
                  <p className="text-sm text-muted-foreground">{invoice.subtitle}</p>
                </div>
                <div className="text-right">
                  <Badge className={cn(
                    'text-xs',
                    invoice.statusColor === 'error' && 'bg-red-100 text-red-700',
                    invoice.statusColor === 'warning' && 'bg-amber-100 text-amber-700',
                    invoice.statusColor === 'success' && 'bg-green-100 text-green-700',
                  )}>
                    {invoice.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{invoice.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profitability by Account */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Account Profitability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {profitability?.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{account.title}</p>
                      <p className="text-sm text-muted-foreground">{account.subtitle}</p>
                    </div>
                    <Badge className={cn(
                      'text-xs',
                      account.statusColor === 'success' && 'bg-green-100 text-green-700',
                      account.statusColor === 'warning' && 'bg-amber-100 text-amber-700',
                      account.statusColor === 'error' && 'bg-red-100 text-red-700',
                    )}>
                      {account.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Cash Flow Projection */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Cash Flow Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cashFlow?.map((week, index) => {
                const maxValue = Math.max(...(cashFlow?.map(w => w.value) || [1]));
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{week.label}</span>
                      <span>${(week.value / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(week.value / maxValue) * 100}%`,
                          backgroundColor: week.color,
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
              <h1 className="text-xl font-semibold">CFO Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Financial metrics, revenue analysis, and cash flow
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Generate P&L
              </Button>
              <Button size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Revenue Forecast
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
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
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
          <TabsContent value="costs">
            <Card>
              <CardContent className="py-12 text-center">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Cost analysis and expense tracking</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="forecasting">
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Revenue and cash flow forecasting</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Access */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Generate P&L', icon: FileSpreadsheet, color: 'text-blue-600 bg-blue-100' },
              { name: 'Revenue Forecast', icon: TrendingUp, color: 'text-green-600 bg-green-100' },
              { name: 'Margin Analysis', icon: PieChart, color: 'text-purple-600 bg-purple-100' },
              { name: 'AR Aging', icon: Clock, color: 'text-amber-600 bg-amber-100' },
              { name: 'Budget vs Actual', icon: Target, color: 'text-red-600 bg-red-100' },
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
