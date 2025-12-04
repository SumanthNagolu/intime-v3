'use client';

/**
 * HR Analytics Dashboard Widget
 *
 * Displays HR analytics with key metrics, charts, and department breakdowns.
 * Supports tabbed navigation between different analytics views.
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserMinus,
  DollarSign,
  Award,
  Clock,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: 'forest' | 'gold' | 'error' | 'info';
}

function MetricCard({ label, value, change, changeLabel, icon, color }: MetricCardProps) {
  const colorClasses = {
    forest: 'bg-forest-50 text-forest-600',
    gold: 'bg-gold-50 text-gold-600',
    error: 'bg-error-50 text-error-600',
    info: 'bg-info-50 text-info-600',
  };

  return (
    <div className="bg-white border border-charcoal-100 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colorClasses[color])}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            change >= 0 ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
          )}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-charcoal-900">{value}</p>
        <p className="text-sm text-charcoal-500 mt-1">{label}</p>
        {changeLabel && (
          <p className="text-xs text-charcoal-400 mt-1">{changeLabel}</p>
        )}
      </div>
    </div>
  );
}

interface DepartmentRowProps {
  name: string;
  headcount: number;
  change: number;
  utilization: number;
}

function DepartmentRow({ name, headcount, change, utilization }: DepartmentRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-charcoal-50 last:border-0">
      <div>
        <p className="font-medium text-charcoal-900">{name}</p>
        <p className="text-sm text-charcoal-500">{headcount} employees</p>
      </div>
      <div className="flex items-center gap-4">
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium',
          change >= 0 ? 'text-success-600' : 'text-error-600'
        )}>
          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change >= 0 ? '+' : ''}{change}%
        </div>
        <div className="w-24">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-charcoal-500">Utilization</span>
            <span className="font-medium">{utilization}%</span>
          </div>
          <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                utilization >= 80 ? 'bg-success-500' :
                utilization >= 60 ? 'bg-gold-500' : 'bg-error-500'
              )}
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const TABS = ['Headcount', 'Turnover', 'Compensation', 'Performance', 'Time'];

// Mock data for demonstration
const MOCK_METRICS = {
  headcount: { value: 247, change: 8, label: 'Total Headcount' },
  turnover: { value: '12.4%', change: -2.1, label: 'Annual Turnover' },
  avgTenure: { value: '2.8 yrs', change: 0.3, label: 'Avg. Tenure' },
  openPositions: { value: 18, change: 5, label: 'Open Positions' },
};

const MOCK_DEPARTMENTS = [
  { name: 'Engineering', headcount: 85, change: 12, utilization: 92 },
  { name: 'Sales', headcount: 45, change: 8, utilization: 88 },
  { name: 'Operations', headcount: 38, change: -3, utilization: 75 },
  { name: 'HR', headcount: 12, change: 0, utilization: 85 },
  { name: 'Finance', headcount: 15, change: 5, utilization: 78 },
];

export function HRAnalyticsDashboard({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;
  const props = definition.componentProps as {
    tabs?: string[];
    defaultTab?: string;
    enableExport?: boolean;
    enableDrilldown?: boolean;
  } | undefined;

  const tabs = props?.tabs || TABS;
  const [activeTab, setActiveTab] = useState(props?.defaultTab || tabs[0]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-forest-100 rounded-lg animate-pulse" />
            <div className="h-6 w-48 bg-stone-200 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-stone-100 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  // Use data from props or mock data
  const metrics = (data as { metrics?: typeof MOCK_METRICS })?.metrics || MOCK_METRICS;
  const departments = (data as { departments?: typeof MOCK_DEPARTMENTS })?.departments || MOCK_DEPARTMENTS;

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-forest rounded-lg flex items-center justify-center shadow-sm">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                HR Analytics
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                Workforce intelligence and insights
              </p>
            </div>
          </div>
          {props?.enableExport && (
            <Button variant="outline" size="sm">
              Export Report
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-4 border-b border-charcoal-100 -mb-4 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeTab === tab
                  ? 'text-forest-600 border-forest-500'
                  : 'text-charcoal-500 border-transparent hover:text-charcoal-700'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            label={metrics.headcount.label}
            value={metrics.headcount.value}
            change={metrics.headcount.change}
            icon={<Users className="w-5 h-5" />}
            color="forest"
          />
          <MetricCard
            label={metrics.turnover.label}
            value={metrics.turnover.value}
            change={metrics.turnover.change}
            changeLabel="vs last year"
            icon={<UserMinus className="w-5 h-5" />}
            color="error"
          />
          <MetricCard
            label={metrics.avgTenure.label}
            value={metrics.avgTenure.value}
            change={metrics.avgTenure.change}
            icon={<Clock className="w-5 h-5" />}
            color="info"
          />
          <MetricCard
            label={metrics.openPositions.label}
            value={metrics.openPositions.value}
            change={metrics.openPositions.change}
            icon={<Award className="w-5 h-5" />}
            color="gold"
          />
        </div>

        {/* Department Breakdown */}
        <div className="border border-charcoal-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-charcoal-900">Department Breakdown</h3>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded hover:bg-charcoal-50">
                <BarChart3 className="w-4 h-4 text-charcoal-500" />
              </button>
              <button className="p-1.5 rounded hover:bg-charcoal-50">
                <PieChart className="w-4 h-4 text-charcoal-500" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-charcoal-50">
            {departments.map((dept) => (
              <DepartmentRow key={dept.name} {...dept} />
            ))}
          </div>
        </div>

        {/* Trends placeholder */}
        <div className="mt-4 p-4 border border-dashed border-charcoal-200 rounded-lg bg-charcoal-25">
          <div className="flex items-center justify-center h-32 text-charcoal-400">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Trend charts for {activeTab} analytics</p>
              <p className="text-xs mt-1">Connect to data source to display</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default HRAnalyticsDashboard;
