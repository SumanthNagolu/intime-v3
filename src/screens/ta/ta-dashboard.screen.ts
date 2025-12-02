/**
 * TA Dashboard Screen Definition
 *
 * Main dashboard for Talent Acquisition Specialists showing:
 * - KPI metrics (leads generated, conversion rates, pipeline value)
 * - Today's priorities (follow-ups, qualifications, activities)
 * - Lead funnel visualization
 * - Deal pipeline summary
 * - Campaign performance
 * - Training coordination metrics
 *
 * Routes: /employee/workspace/ta/dashboard
 *
 * @see docs/specs/20-USER-ROLES/03-ta/00-OVERVIEW.md
 * @see docs/specs/20-USER-ROLES/03-ta/01-daily-workflow.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';

// ==========================================
// TA DASHBOARD SCREEN
// ==========================================

export const taDashboardScreen: ScreenDefinition = {
  id: 'ta-dashboard',
  type: 'dashboard',
  title: 'Talent Acquisition Dashboard',
  icon: 'LayoutDashboard',

  // Aggregate data from multiple sources
  dataSource: {
    type: 'aggregate',
    sources: [
      {
        id: 'metrics',
        type: 'query',
        query: {
          procedure: 'ta.dashboard.getMetrics',
          params: {},
        },
      },
      {
        id: 'leadFunnel',
        type: 'query',
        query: {
          procedure: 'ta.dashboard.getLeadFunnel',
          params: {},
        },
      },
      {
        id: 'dealPipeline',
        type: 'query',
        query: {
          procedure: 'ta.dashboard.getDealPipeline',
          params: {},
        },
      },
      {
        id: 'campaigns',
        type: 'query',
        query: {
          procedure: 'ta.dashboard.getCampaignPerformance',
          params: {},
        },
      },
      {
        id: 'training',
        type: 'query',
        query: {
          procedure: 'ta.dashboard.getTrainingMetrics',
          params: {},
        },
      },
      {
        id: 'activities',
        type: 'query',
        query: {
          procedure: 'ta.dashboard.getTodaysActivities',
          params: {},
        },
      },
    ],
  },

  layout: {
    type: 'single-column',
    sections: [
      // Primary KPI Metrics
      {
        id: 'primary-metrics',
        type: 'metrics-grid',
        columns: 4,
        widgets: [
          {
            id: 'leads-mtd',
            type: 'metric',
            label: 'Leads Generated (MTD)',
            path: 'metrics.leadsMTD',
            config: {
              icon: 'UserPlus',
              trend: { path: 'metrics.leadsTrend', format: 'percentage' },
              target: 20,
              format: 'number',
            },
          },
          {
            id: 'lead-conversion',
            type: 'metric',
            label: 'Lead → Deal Conversion',
            path: 'metrics.leadConversion',
            config: {
              icon: 'TrendingUp',
              trend: { path: 'metrics.conversionTrend', format: 'points' },
              target: 30,
              format: 'percentage',
              suffix: '%',
            },
          },
          {
            id: 'pipeline-value',
            type: 'metric',
            label: 'Pipeline Value (3mo)',
            path: 'metrics.pipelineValue',
            config: {
              icon: 'DollarSign',
              trend: { path: 'metrics.pipelineTrend', format: 'percentage' },
              format: 'currency',
              prefix: '$',
            },
          },
          {
            id: 'deal-closure',
            type: 'metric',
            label: 'Deal Closure Rate',
            path: 'metrics.dealClosureRate',
            config: {
              icon: 'CheckCircle',
              trend: { path: 'metrics.closureTrend', format: 'points' },
              target: 25,
              format: 'percentage',
              suffix: '%',
            },
          },
        ],
      },

      // Secondary Metrics Row
      {
        id: 'secondary-metrics',
        type: 'metrics-grid',
        columns: 4,
        widgets: [
          {
            id: 'training-enrollments',
            type: 'metric',
            label: 'Training Enrollments (QTD)',
            path: 'training.enrollmentsQTD',
            config: {
              icon: 'GraduationCap',
              trend: { path: 'training.enrollmentTrend', format: 'percentage' },
              target: 8,
              format: 'number',
            },
          },
          {
            id: 'internal-filled',
            type: 'metric',
            label: 'Internal Positions Filled (QTD)',
            path: 'metrics.internalFilledQTD',
            config: {
              icon: 'Building2',
              target: 2,
              format: 'number',
            },
          },
          {
            id: 'campaign-response',
            type: 'metric',
            label: 'Campaign Response Rate',
            path: 'campaigns.avgResponseRate',
            config: {
              icon: 'Mail',
              target: 20,
              format: 'percentage',
              suffix: '%',
            },
          },
          {
            id: 'time-to-qualify',
            type: 'metric',
            label: 'Avg Time to Qualify',
            path: 'metrics.avgTimeToQualify',
            config: {
              icon: 'Clock',
              target: 5,
              format: 'number',
              suffix: ' days',
              lowerIsBetter: true,
            },
          },
        ],
      },

      // Today's Priorities
      {
        id: 'todays-priorities',
        type: 'info-card',
        title: "Today's Priorities",
        icon: 'Target',
        columns: 3,
        widgets: [
          {
            id: 'follow-ups-due',
            type: 'stat-card',
            label: 'Follow-ups Due',
            path: 'activities.followUpsDue',
            config: {
              icon: 'Phone',
              variant: 'warning',
              action: {
                type: 'navigate',
                label: 'View All',
                config: { type: 'navigate', route: '/employee/workspace/ta/activities?filter=follow_up' },
              },
            },
          },
          {
            id: 'leads-to-qualify',
            type: 'stat-card',
            label: 'Leads to Qualify',
            path: 'activities.leadsToQualify',
            config: {
              icon: 'ClipboardCheck',
              variant: 'info',
              action: {
                type: 'navigate',
                label: 'Start',
                config: { type: 'navigate', route: '/employee/workspace/ta/leads?stage=qualifying' },
              },
            },
          },
          {
            id: 'overdue-activities',
            type: 'stat-card',
            label: 'Overdue Activities',
            path: 'activities.overdueCount',
            config: {
              icon: 'AlertTriangle',
              variant: 'destructive',
              action: {
                type: 'navigate',
                label: 'Handle',
                config: { type: 'navigate', route: '/employee/workspace/ta/activities?filter=overdue' },
              },
            },
          },
        ],
      },

      // Lead Funnel & Deal Pipeline (side by side)
      {
        id: 'funnels-row',
        type: 'info-card',
        columns: 2,
        sections: [
          {
            id: 'lead-funnel',
            type: 'custom',
            title: 'Lead Funnel',
            icon: 'Filter',
            component: 'LeadFunnel',
            componentProps: {
              dataPath: 'leadFunnel',
              stages: ['new', 'contacted', 'engaged', 'qualifying', 'qualified'],
            },
            actions: [
              {
                id: 'view-leads',
                type: 'navigate',
                label: 'View All Leads',
                icon: 'ArrowRight',
                variant: 'ghost',
                config: { type: 'navigate', route: '/employee/workspace/ta/leads' },
              },
            ],
          },
          {
            id: 'deal-pipeline',
            type: 'custom',
            title: 'Deal Pipeline',
            icon: 'TrendingUp',
            component: 'DealPipelineMini',
            componentProps: {
              dataPath: 'dealPipeline',
              stages: ['qualification', 'discovery', 'proposal', 'negotiation'],
            },
            actions: [
              {
                id: 'view-deals',
                type: 'navigate',
                label: 'View All Deals',
                icon: 'ArrowRight',
                variant: 'ghost',
                config: { type: 'navigate', route: '/employee/workspace/ta/deals' },
              },
            ],
          },
        ],
      },

      // Campaign Performance
      {
        id: 'campaign-performance',
        type: 'table',
        title: 'Active Campaigns',
        icon: 'Megaphone',
        dataSource: {
          type: 'query',
          query: {
            procedure: 'ta.campaigns.listActive',
            params: { limit: 5 },
          },
        },
        columns_config: [
          { id: 'name', header: 'Campaign', accessor: 'name', type: 'text' },
          { id: 'type', header: 'Type', accessor: 'campaignType', type: 'enum' },
          {
            id: 'responses',
            header: 'Responses',
            accessor: 'responseCount',
            type: 'number',
          },
          {
            id: 'responseRate',
            header: 'Response Rate',
            accessor: 'responseRate',
            type: 'number',
            config: { suffix: '%' },
          },
          {
            id: 'leadsGenerated',
            header: 'Leads',
            accessor: 'leadsGenerated',
            type: 'number',
          },
        ],
        rowClick: {
          type: 'navigate',
          route: { field: 'id', template: '/employee/workspace/ta/campaigns/{id}' },
        },
        emptyState: {
          title: 'No Active Campaigns',
          description: 'Create a campaign to start generating leads',
          icon: 'Megaphone',
          action: {
            id: 'create-campaign',
            type: 'navigate',
            label: 'Create Campaign',
            icon: 'Plus',
            config: { type: 'navigate', route: '/employee/workspace/ta/campaigns/new' },
          },
        },
        actions: [
          {
            id: 'view-all-campaigns',
            type: 'navigate',
            label: 'View All',
            icon: 'ArrowRight',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/workspace/ta/campaigns' },
          },
        ],
      },

      // Training & Internal Hiring Summary
      {
        id: 'training-internal-row',
        type: 'info-card',
        columns: 2,
        sections: [
          {
            id: 'training-summary',
            type: 'info-card',
            title: 'Training Pipeline',
            icon: 'GraduationCap',
            widgets: [
              {
                id: 'pending-applications',
                type: 'stat-row',
                label: 'Pending Applications',
                path: 'training.pendingApplications',
                config: { icon: 'FileText' },
              },
              {
                id: 'interviews-scheduled',
                type: 'stat-row',
                label: 'Interviews Scheduled',
                path: 'training.interviewsScheduled',
                config: { icon: 'Calendar' },
              },
              {
                id: 'active-enrollments',
                type: 'stat-row',
                label: 'Active Enrollments',
                path: 'training.activeEnrollments',
                config: { icon: 'Users' },
              },
            ],
            actions: [
              {
                id: 'view-training',
                type: 'navigate',
                label: 'Manage',
                icon: 'ArrowRight',
                variant: 'ghost',
                config: { type: 'navigate', route: '/employee/workspace/ta/training/applications' },
              },
            ],
          },
          {
            id: 'internal-hiring-summary',
            type: 'info-card',
            title: 'Internal Hiring',
            icon: 'Building2',
            widgets: [
              {
                id: 'open-positions',
                type: 'stat-row',
                label: 'Open Positions',
                path: 'metrics.openInternalPositions',
                config: { icon: 'Briefcase' },
              },
              {
                id: 'active-candidates',
                type: 'stat-row',
                label: 'Active Candidates',
                path: 'metrics.activeInternalCandidates',
                config: { icon: 'Users' },
              },
              {
                id: 'pending-offers',
                type: 'stat-row',
                label: 'Pending Offers',
                path: 'metrics.pendingInternalOffers',
                config: { icon: 'FileCheck' },
              },
            ],
            actions: [
              {
                id: 'view-internal',
                type: 'navigate',
                label: 'Manage',
                icon: 'ArrowRight',
                variant: 'ghost',
                config: { type: 'navigate', route: '/employee/workspace/ta/internal-jobs' },
              },
            ],
          },
        ],
      },

      // Recent Activity Timeline
      {
        id: 'recent-activities',
        type: 'timeline',
        title: 'Recent Activity',
        icon: 'Activity',
        dataSource: {
          type: 'query',
          query: {
            procedure: 'ta.activities.listRecent',
            params: { limit: 10 },
          },
        },
        config: {
          itemPath: 'activities',
          timestampPath: 'createdAt',
          titlePath: 'subject',
          descriptionPath: 'notes',
          iconPath: 'activityType',
          entityPath: 'relatedEntity',
        },
        actions: [
          {
            id: 'view-all-activities',
            type: 'navigate',
            label: 'View All',
            icon: 'ArrowRight',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/workspace/ta/activities' },
          },
          {
            id: 'log-activity',
            type: 'modal',
            label: 'Log Activity',
            icon: 'Plus',
            variant: 'outline',
            config: { type: 'modal', modal: 'quick-log-activity' },
          },
        ],
      },
    ],
  },

  // Quick Actions
  actions: [
    {
      id: 'new-lead',
      type: 'navigate',
      label: 'New Lead',
      icon: 'UserPlus',
      variant: 'primary',
      config: { type: 'navigate', route: '/employee/workspace/ta/leads/new' },
    },
    {
      id: 'new-deal',
      type: 'navigate',
      label: 'New Deal',
      icon: 'Handshake',
      variant: 'outline',
      config: { type: 'navigate', route: '/employee/workspace/ta/deals/new' },
    },
    {
      id: 'new-campaign',
      type: 'navigate',
      label: 'New Campaign',
      icon: 'Megaphone',
      variant: 'outline',
      config: { type: 'navigate', route: '/employee/workspace/ta/campaigns/new' },
    },
    {
      id: 'log-activity',
      type: 'modal',
      label: 'Log Activity',
      icon: 'Plus',
      variant: 'ghost',
      config: { type: 'modal', modal: 'quick-log-activity' },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition' },
    ],
  },

  // Keyboard Shortcuts
  keyboard_shortcuts: [
    { key: 'n', action: 'new-lead', description: 'Create new lead' },
    { key: 'd', action: 'new-deal', description: 'Create new deal' },
    { key: 'a', action: 'log-activity', description: 'Log activity' },
    { key: 'l', action: 'navigate-leads', description: 'Go to leads' },
  ],
};

export default taDashboardScreen;
