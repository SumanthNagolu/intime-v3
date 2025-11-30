/**
 * Role-Based Dashboard Component
 *
 * Renders a customized dashboard based on the user's role.
 * Each role sees different widgets, metrics, and quick actions.
 */

'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, Target, Clock, DollarSign } from 'lucide-react';
import {
  MetricWidget,
  ListWidget,
  ChartWidget,
  PipelineWidget,
  ActivityWidget,
  QuickActionsWidget,
  type MetricData,
  type ListItem,
  type ChartDataPoint,
  type PipelineStage,
  type ActivityItem,
  type QuickActionItem,
} from './DashboardWidgets';
import {
  getRoleConfig,
  getDashboardWidgets,
  getQuickActions,
  type WorkspaceRole,
  type DashboardWidget,
} from '@/lib/workspace/role-config';
import { entityRegistry } from '@/lib/workspace';

// =====================================================
// TYPES
// =====================================================

export interface DashboardData {
  // Metrics
  metrics?: Record<string, MetricData>;

  // Lists
  lists?: Record<string, ListItem[]>;

  // Charts
  charts?: Record<string, ChartDataPoint[]>;

  // Pipelines
  pipelines?: Record<string, PipelineStage[]>;

  // Activity feed
  activities?: ActivityItem[];
}

export interface RoleDashboardProps {
  role: WorkspaceRole;
  data?: DashboardData;
  isLoading?: boolean;
  className?: string;
}

// =====================================================
// SAMPLE DATA (Replace with real data from tRPC)
// =====================================================

const SAMPLE_METRICS: Record<string, MetricData> = {
  'open-jobs': {
    value: 24,
    label: 'Active job openings',
    change: 12,
    trend: 'up',
    target: 30,
    icon: Briefcase,
  },
  'available-talent': {
    value: 156,
    label: 'On bench',
    change: -5,
    trend: 'down',
    icon: Users,
  },
  'new-leads': {
    value: 42,
    label: 'This month',
    change: 18,
    trend: 'up',
    icon: Target,
  },
  'active-jobs': {
    value: 18,
    label: 'Assigned to team',
    change: 8,
    trend: 'up',
    icon: Briefcase,
  },
  'pending-approvals': {
    value: 7,
    label: 'Awaiting review',
    icon: Clock,
  },
  'placements-mtd': {
    value: 12,
    label: 'Month to date',
    change: 25,
    trend: 'up',
    target: 15,
  },
  'revenue-mtd': {
    value: 485000,
    label: '$485K this month',
    change: 15,
    trend: 'up',
    target: 500000,
    icon: DollarSign,
  },
};

const SAMPLE_LISTS: Record<string, ListItem[]> = {
  'pending-submissions': [
    { id: '1', title: 'John Smith', subtitle: 'Senior Developer → TechCorp', status: 'Pending', statusColor: 'warning', timestamp: '2h ago', entityType: 'submission' },
    { id: '2', title: 'Sarah Johnson', subtitle: 'DevOps Engineer → CloudInc', status: 'Pending', statusColor: 'warning', timestamp: '3h ago', entityType: 'submission' },
    { id: '3', title: 'Mike Chen', subtitle: 'Full Stack → StartupXYZ', status: 'Pending', statusColor: 'warning', timestamp: '4h ago', entityType: 'submission' },
  ],
  'interviews-today': [
    { id: '1', title: 'Emily Davis', subtitle: '10:00 AM - Technical Round', status: 'In 2h', statusColor: 'success', entityType: 'submission' },
    { id: '2', title: 'Robert Wilson', subtitle: '2:00 PM - Final Round', status: 'In 6h', statusColor: 'default', entityType: 'submission' },
  ],
  'hotlist': [
    { id: '1', title: 'Alex Kumar', subtitle: 'Java/Spring Boot • 8 YOE', status: 'Available', statusColor: 'success', entityType: 'talent' },
    { id: '2', title: 'Lisa Park', subtitle: 'React/Node.js • 5 YOE', status: 'Available', statusColor: 'success', entityType: 'talent' },
    { id: '3', title: 'Tom Brown', subtitle: 'AWS/DevOps • 6 YOE', status: 'Available', statusColor: 'success', entityType: 'talent' },
  ],
  'active-job-orders': [
    { id: '1', title: 'Senior Java Developer', subtitle: 'TechCorp • Remote', status: 'Hot', statusColor: 'error', entityType: 'job_order' },
    { id: '2', title: 'Cloud Architect', subtitle: 'CloudInc • NYC', status: 'Active', statusColor: 'success', entityType: 'job_order' },
  ],
  'team-metrics': [
    { id: '1', title: 'John Recruiter', subtitle: '8 placements', status: 'Top Performer', statusColor: 'success' },
    { id: '2', title: 'Jane Smith', subtitle: '6 placements' },
    { id: '3', title: 'Bob Johnson', subtitle: '5 placements' },
  ],
  'top-accounts': [
    { id: '1', title: 'TechCorp Inc.', subtitle: '$1.2M revenue', status: 'Enterprise', statusColor: 'success', entityType: 'account' },
    { id: '2', title: 'CloudInc', subtitle: '$850K revenue', status: 'Enterprise', statusColor: 'success', entityType: 'account' },
    { id: '3', title: 'StartupXYZ', subtitle: '$320K revenue', status: 'Growth', statusColor: 'default', entityType: 'account' },
  ],
};

const SAMPLE_PIPELINES: Record<string, PipelineStage[]> = {
  'pipeline-summary': [
    { id: 'submitted', name: 'Submitted', count: 24, color: '#94a3b8' },
    { id: 'screening', name: 'Screening', count: 18, color: '#60a5fa' },
    { id: 'interview', name: 'Interview', count: 12, color: '#a78bfa' },
    { id: 'offer', name: 'Offer', count: 5, color: '#fbbf24' },
    { id: 'placed', name: 'Placed', count: 8, color: '#34d399' },
  ],
  'lead-pipeline': [
    { id: 'new', name: 'New', count: 42, color: '#94a3b8' },
    { id: 'contacted', name: 'Contacted', count: 28, color: '#60a5fa' },
    { id: 'qualified', name: 'Qualified', count: 15, color: '#a78bfa' },
    { id: 'proposal', name: 'Proposal', count: 8, color: '#fbbf24' },
    { id: 'won', name: 'Won', count: 5, color: '#34d399' },
  ],
  'deal-pipeline': [
    { id: 'discovery', name: 'Discovery', count: 12, value: 240000, color: '#94a3b8' },
    { id: 'proposal', name: 'Proposal', count: 8, value: 520000, color: '#60a5fa' },
    { id: 'negotiation', name: 'Negotiation', count: 5, value: 380000, color: '#fbbf24' },
    { id: 'closed', name: 'Closed Won', count: 3, value: 280000, color: '#34d399' },
  ],
};

const SAMPLE_CHARTS: Record<string, ChartDataPoint[]> = {
  'conversion-rate': [
    { label: 'Lead → Account', value: 32, color: '#60a5fa' },
    { label: 'Account → Deal', value: 45, color: '#a78bfa' },
    { label: 'Deal → Job', value: 68, color: '#fbbf24' },
    { label: 'Job → Placement', value: 24, color: '#34d399' },
  ],
  'team-metrics': [
    { label: 'Submissions', value: 156, color: '#60a5fa' },
    { label: 'Interviews', value: 89, color: '#a78bfa' },
    { label: 'Offers', value: 34, color: '#fbbf24' },
    { label: 'Placements', value: 28, color: '#34d399' },
  ],
  'placements-trend': [
    { label: 'Week 1', value: 5, color: '#D87254' },
    { label: 'Week 2', value: 8, color: '#D87254' },
    { label: 'Week 3', value: 6, color: '#D87254' },
    { label: 'Week 4', value: 12, color: '#D87254' },
  ],
};

const SAMPLE_ACTIVITIES: ActivityItem[] = [
  { id: '1', type: 'submission', title: 'Candidate submitted to TechCorp', description: 'John Smith for Senior Developer', timestamp: '30 min ago', user: 'Jane Recruiter', entityType: 'submission', entityId: '1', entityTitle: 'View Submission' },
  { id: '2', type: 'interview', title: 'Interview scheduled', description: 'Emily Davis - Technical Round', timestamp: '1 hour ago', user: 'Bob Manager', entityType: 'submission', entityId: '2', entityTitle: 'View Submission' },
  { id: '3', type: 'call', title: 'Client call completed', description: 'Discussed new requirements with TechCorp', timestamp: '2 hours ago', user: 'Jane Recruiter', entityType: 'account', entityId: '1', entityTitle: 'TechCorp' },
  { id: '4', type: 'email', title: 'Offer letter sent', description: 'Robert Wilson - Cloud Architect', timestamp: '3 hours ago', user: 'HR Team', entityType: 'submission', entityId: '3', entityTitle: 'View Submission' },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

export function RoleDashboard({
  role,
  data,
  isLoading = false,
  className,
}: RoleDashboardProps) {
  const router = useRouter();
  const roleConfig = getRoleConfig(role);
  const widgets = getDashboardWidgets(role);
  const quickActionConfigs = getQuickActions(role);

  // Convert quick action configs to widget format
  const quickActions: QuickActionItem[] = useMemo(() => {
    return quickActionConfigs.map((action) => ({
      id: action.id,
      label: action.label,
      icon: action.icon,
      shortcut: action.shortcut,
      onClick: () => {
        // Handle action - in real app, this would open modals or navigate
        console.log('Quick action:', action.action);
        // Example routing based on action
        switch (action.action) {
          case 'create-lead':
            router.push('/employee/workspace/leads?action=create');
            break;
          case 'post-job':
            router.push('/employee/workspace/jobs?action=create');
            break;
          case 'source-talent':
            router.push('/employee/workspace/talent?action=source');
            break;
          default:
            break;
        }
      },
    }));
  }, [quickActionConfigs, router]);

  // Merge provided data with sample data
  const metrics = data?.metrics || SAMPLE_METRICS;
  const lists = data?.lists || SAMPLE_LISTS;
  const charts = data?.charts || SAMPLE_CHARTS;
  const pipelines = data?.pipelines || SAMPLE_PIPELINES;
  const activities = data?.activities || SAMPLE_ACTIVITIES;

  // Render widget based on type
  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'metric':
        return (
          <MetricWidget
            key={widget.id}
            title={widget.title}
            data={metrics[widget.id]}
            isLoading={isLoading}
            onClick={() => {
              if (widget.entityType) {
                router.push(entityRegistry[widget.entityType].routes.list);
              }
            }}
          />
        );

      case 'list':
        return (
          <ListWidget
            key={widget.id}
            title={widget.title}
            items={lists[widget.id]}
            isLoading={isLoading}
            onViewAll={() => {
              if (widget.entityType) {
                router.push(entityRegistry[widget.entityType].routes.list);
              }
            }}
            className="col-span-1 md:col-span-2"
          />
        );

      case 'chart':
        return (
          <ChartWidget
            key={widget.id}
            title={widget.title}
            data={charts[widget.id]}
            type={widget.id.includes('trend') ? 'bar' : 'donut'}
            isLoading={isLoading}
            className="col-span-1 md:col-span-2"
          />
        );

      case 'pipeline':
        return (
          <PipelineWidget
            key={widget.id}
            title={widget.title}
            stages={pipelines[widget.id]}
            isLoading={isLoading}
            onStageClick={(stage) => {
              if (widget.entityType) {
                router.push(`${entityRegistry[widget.entityType].routes.list}?status=${stage.id}`);
              }
            }}
            className="col-span-1 md:col-span-2 lg:col-span-4"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">
            {roleConfig.label} Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {roleConfig.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <QuickActionsWidget
          title="Quick Actions"
          actions={quickActions}
          className="max-w-xl"
        />
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map(renderWidget)}
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ActivityWidget
          title="Recent Activity"
          activities={activities}
          isLoading={isLoading}
          onViewAll={() => router.push('/employee/workspace?tab=activity')}
          className="lg:col-span-2"
        />

        {/* Today's Schedule */}
        <div className="space-y-4">
          <ListWidget
            title="Today's Schedule"
            items={lists['interviews-today'] || []}
            isLoading={isLoading}
            emptyMessage="No interviews scheduled"
          />
        </div>
      </div>
    </div>
  );
}

export default RoleDashboard;
