/**
 * TA Specialist Dashboard Screen
 * 
 * Main entry point for TA Specialists showing:
 * - Lead funnel metrics
 * - Deal pipeline progress
 * - Training enrollments
 * - Internal hiring pipeline
 * - Campaign performance
 * - Activity summary
 * 
 * @see docs/specs/20-USER-ROLES/03-ta/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const taDashboardScreen: ScreenDefinition = {
  id: 'ta-dashboard',
  type: 'dashboard',
  title: 'TA Dashboard',
  subtitle: { type: 'context', path: 'user.fullName' },
  icon: 'Target',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'metrics', procedure: 'ta.getDashboardMetrics' },
      { key: 'leads', procedure: 'ta.getLeadFunnel' },
      { key: 'deals', procedure: 'ta.getDealPipeline' },
      { key: 'training', procedure: 'ta.getTrainingEnrollments' },
      { key: 'internalHiring', procedure: 'ta.getInternalHiringPipeline' },
      { key: 'campaigns', procedure: 'ta.getCampaignPerformance' },
      { key: 'activities', procedure: 'ta.getActivitySummary' },
    ],
  },

  layout: {
    type: 'single-column',
    sections: [
      // ===========================================
      // PRIMARY METRICS
      // ===========================================
      {
        id: 'primary-metrics',
        type: 'metrics-grid',
        title: 'This Month',
        columns: 5,
        fields: [
          {
            id: 'leads-generated',
            label: 'Leads Generated',
            type: 'number',
            path: 'metrics.leadsGenerated',
            config: {
              target: { type: 'field', path: 'metrics.leadsTarget' },
              trend: { type: 'field', path: 'metrics.leadsTrend' },
              icon: 'UserPlus',
              bgColor: 'bg-blue-50',
            },
          },
          {
            id: 'qualified-leads',
            label: 'Qualified Leads',
            type: 'number',
            path: 'metrics.qualifiedLeads',
            config: {
              percentOfTotal: { type: 'field', path: 'metrics.qualificationRate' },
              icon: 'CheckCircle',
              bgColor: 'bg-green-50',
            },
          },
          {
            id: 'deals-in-pipeline',
            label: 'Deals in Pipeline',
            type: 'number',
            path: 'metrics.dealsInPipeline',
            config: {
              value: { type: 'field', path: 'metrics.pipelineValue' },
              format: 'currency',
              icon: 'Briefcase',
              bgColor: 'bg-purple-50',
            },
          },
          {
            id: 'training-enrollments',
            label: 'Training Enrollments',
            type: 'number',
            path: 'metrics.trainingEnrollments',
            config: {
              target: { type: 'field', path: 'metrics.trainingTarget' },
              icon: 'GraduationCap',
              bgColor: 'bg-amber-50',
            },
          },
          {
            id: 'internal-hires',
            label: 'Internal Hires',
            type: 'number',
            path: 'metrics.internalHires',
            config: {
              target: { type: 'field', path: 'metrics.internalHiresTarget' },
              icon: 'Users',
              bgColor: 'bg-emerald-50',
            },
          },
        ],
      },

      // ===========================================
      // TODAY'S PRIORITIES
      // ===========================================
      {
        id: 'todays-priorities',
        type: 'custom',
        title: "Today's Priorities",
        component: 'ActivityQueueWidget',
        componentProps: {
          groupBy: 'urgency',
          groups: [
            { id: 'overdue', label: '🔴 OVERDUE', filter: { overdue: true } },
            { id: 'due-today', label: '📅 DUE TODAY', filter: { dueToday: true } },
            { id: 'high-priority', label: '📌 HIGH PRIORITY', filter: { priority: 'high' } },
          ],
          maxItemsPerGroup: 5,
          entityTypes: ['lead', 'deal', 'training_enrollment', 'internal_job'],
        },
        actions: [
          {
            id: 'view-all-tasks',
            label: 'View All Tasks',
            type: 'navigate',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/workspace/tasks' },
          },
        ],
      },

      // ===========================================
      // LEAD FUNNEL
      // ===========================================
      {
        id: 'lead-funnel',
        type: 'custom',
        title: 'Lead Funnel',
        component: 'FunnelChart',
        componentProps: {
          dataPath: 'leads.funnel',
          stages: [
            { id: 'new', label: 'New', color: 'blue' },
            { id: 'contacted', label: 'Contacted', color: 'indigo' },
            { id: 'qualified', label: 'Qualified', color: 'green' },
            { id: 'converted', label: 'Converted', color: 'emerald' },
          ],
          showConversionRates: true,
          showCounts: true,
        },
        actions: [
          {
            id: 'view-leads',
            label: 'View All Leads',
            type: 'navigate',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/crm/leads' },
          },
          {
            id: 'create-lead',
            label: 'New Lead',
            type: 'modal',
            icon: 'Plus',
            variant: 'default',
            config: { type: 'modal', modal: 'lead-create' },
          },
        ],
      },

      // ===========================================
      // DEAL PIPELINE
      // ===========================================
      {
        id: 'deal-pipeline',
        type: 'custom',
        title: 'Deal Pipeline',
        component: 'DealPipelineWidget',
        componentProps: {
          dataPath: 'deals',
          showTrainingDeals: true,
          showStaffingDeals: true,
          showPartnershipDeals: true,
          columns: [
            { id: 'discovery', title: 'Discovery', color: 'blue' },
            { id: 'proposal', title: 'Proposal', color: 'purple' },
            { id: 'negotiation', title: 'Negotiation', color: 'amber' },
            { id: 'closed_won', title: 'Closed Won', color: 'green' },
          ],
          cardTemplate: {
            title: { type: 'field', path: 'name' },
            subtitle: { type: 'field', path: 'account.name' },
            value: { type: 'field', path: 'value', format: 'currency' },
            dealType: { type: 'field', path: 'dealType' },
            probability: { type: 'field', path: 'probability' },
            daysInStage: { type: 'field', path: 'daysInStage' },
          },
          showTotalValue: true,
          showWeightedValue: true,
        },
        actions: [
          {
            id: 'view-deals',
            label: 'View Pipeline',
            type: 'navigate',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/crm/deals/pipeline' },
          },
          {
            id: 'create-deal',
            label: 'New Deal',
            type: 'modal',
            icon: 'Plus',
            variant: 'default',
            config: { type: 'modal', modal: 'deal-create' },
          },
        ],
      },

      // ===========================================
      // TRAINING & INTERNAL HIRING
      // ===========================================
      {
        id: 'training-internal',
        type: 'custom',
        title: 'Training & Internal Hiring',
        component: 'TwoColumnWidget',
        componentProps: {
          leftColumn: {
            title: 'Training Pipeline',
            dataPath: 'training',
            widget: 'TrainingPipelineWidget',
            stages: [
              { id: 'applied', label: 'Applied' },
              { id: 'screened', label: 'Screened' },
              { id: 'enrolled', label: 'Enrolled' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'completed', label: 'Completed' },
            ],
            actions: [
              {
                id: 'view-training',
                label: 'View All',
                type: 'navigate',
                config: { route: '/employee/academy/enrollments' },
              },
            ],
          },
          rightColumn: {
            title: 'Internal Hiring',
            dataPath: 'internalHiring',
            widget: 'InternalHiringWidget',
            stages: [
              { id: 'sourcing', label: 'Sourcing' },
              { id: 'screening', label: 'Screening' },
              { id: 'interviewing', label: 'Interviewing' },
              { id: 'offer', label: 'Offer' },
              { id: 'hired', label: 'Hired' },
            ],
            actions: [
              {
                id: 'view-internal',
                label: 'View All',
                type: 'navigate',
                config: { route: '/employee/hr/internal-jobs' },
              },
            ],
          },
        },
      },

      // ===========================================
      // CAMPAIGN PERFORMANCE
      // ===========================================
      {
        id: 'campaign-performance',
        type: 'custom',
        title: 'Campaign Performance',
        component: 'CampaignPerformanceWidget',
        componentProps: {
          dataPath: 'campaigns',
          metrics: [
            { key: 'emailsSent', label: 'Emails Sent' },
            { key: 'openRate', label: 'Open Rate', format: 'percentage', benchmark: 25 },
            { key: 'clickRate', label: 'Click Rate', format: 'percentage', benchmark: 5 },
            { key: 'responseRate', label: 'Response Rate', format: 'percentage', benchmark: 15 },
            { key: 'leadsGenerated', label: 'Leads Generated' },
          ],
          showRecentCampaigns: true,
          maxCampaigns: 3,
          campaignCardTemplate: {
            title: { type: 'field', path: 'name' },
            type: { type: 'field', path: 'type' },
            sent: { type: 'field', path: 'sentCount' },
            opened: { type: 'field', path: 'openedPercent', format: 'percentage' },
            leads: { type: 'field', path: 'leadsGenerated' },
          },
        },
        actions: [
          {
            id: 'view-campaigns',
            label: 'View Campaigns',
            type: 'navigate',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/crm/campaigns' },
          },
          {
            id: 'create-campaign',
            label: 'New Campaign',
            type: 'navigate',
            icon: 'Plus',
            variant: 'default',
            config: { type: 'navigate', route: '/employee/crm/campaigns/new' },
          },
        ],
      },

      // ===========================================
      // ACTIVITY SUMMARY
      // ===========================================
      {
        id: 'activity-summary',
        type: 'metrics-grid',
        title: 'Activity Summary (Last 7 Days)',
        columns: 4,
        fields: [
          {
            id: 'discovery-calls',
            label: 'Discovery Calls',
            type: 'number',
            path: 'activities.discoveryCalls',
            config: {
              target: { type: 'field', path: 'activities.discoveryCallsTarget' },
              icon: 'Phone',
            },
          },
          {
            id: 'emails-sent',
            label: 'Emails Sent',
            type: 'number',
            path: 'activities.emailsSent',
            config: {
              target: { type: 'field', path: 'activities.emailsTarget' },
              icon: 'Mail',
            },
          },
          {
            id: 'linkedin-messages',
            label: 'LinkedIn Messages',
            type: 'number',
            path: 'activities.linkedInMessages',
            config: {
              target: { type: 'field', path: 'activities.linkedInTarget' },
              icon: 'Linkedin',
            },
          },
          {
            id: 'meetings',
            label: 'Meetings',
            type: 'number',
            path: 'activities.meetings',
            config: {
              target: { type: 'field', path: 'activities.meetingsTarget' },
              icon: 'Calendar',
            },
          },
        ],
        actions: [
          {
            id: 'view-activities',
            label: 'View All',
            type: 'navigate',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/workspace/activities' },
          },
        ],
      },

      // ===========================================
      // CONVERSION METRICS
      // ===========================================
      {
        id: 'conversion-metrics',
        type: 'metrics-grid',
        title: 'Conversion Metrics (This Quarter)',
        columns: 4,
        fields: [
          {
            id: 'lead-to-deal',
            label: 'Lead → Deal',
            type: 'percentage',
            path: 'metrics.leadToDealConversion',
            config: {
              target: 25,
              icon: 'TrendingUp',
              status: { type: 'field', path: 'metrics.leadToDealStatus' },
            },
          },
          {
            id: 'deal-win-rate',
            label: 'Deal Win Rate',
            type: 'percentage',
            path: 'metrics.dealWinRate',
            config: {
              target: 20,
              icon: 'Award',
              status: { type: 'field', path: 'metrics.dealWinRateStatus' },
            },
          },
          {
            id: 'avg-deal-size',
            label: 'Avg Deal Size',
            type: 'currency',
            path: 'metrics.avgDealSize',
            config: {
              target: 15000,
              icon: 'DollarSign',
            },
          },
          {
            id: 'sales-cycle',
            label: 'Sales Cycle',
            type: 'number',
            path: 'metrics.avgSalesCycle',
            config: {
              suffix: ' days',
              target: 60,
              icon: 'Clock',
              invertColor: true, // Lower is better
            },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'refresh',
      label: 'Refresh',
      type: 'function',
      icon: 'RefreshCw',
      variant: 'ghost',
      config: { type: 'function', handler: 'refreshDashboard' },
    },
    {
      id: 'create-lead',
      label: 'New Lead',
      type: 'modal',
      icon: 'UserPlus',
      variant: 'default',
      config: { type: 'modal', modal: 'lead-create' },
    },
    {
      id: 'create-deal',
      label: 'New Deal',
      type: 'modal',
      icon: 'Briefcase',
      variant: 'default',
      config: { type: 'modal', modal: 'deal-create' },
    },
    {
      id: 'run-campaign',
      label: 'Run Campaign',
      type: 'navigate',
      icon: 'Megaphone',
      variant: 'primary',
      config: { type: 'navigate', route: '/employee/crm/campaigns/new' },
    },
    {
      id: 'log-activity',
      label: 'Log Activity',
      type: 'modal',
      icon: 'Plus',
      variant: 'ghost',
      config: { type: 'modal', modal: 'log-activity' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'TA Dashboard', active: true },
    ],
  },

  keyboard_shortcuts: [
    { key: 'g d', action: 'navigate', route: '/employee/crm', description: 'Go to dashboard' },
    { key: 'g l', action: 'navigate', route: '/employee/crm/leads', description: 'Go to leads' },
    { key: 'g p', action: 'navigate', route: '/employee/crm/deals/pipeline', description: 'Go to pipeline' },
    { key: 'g c', action: 'navigate', route: '/employee/crm/campaigns', description: 'Go to campaigns' },
    { key: 'g t', action: 'navigate', route: '/employee/academy/enrollments', description: 'Go to training' },
    { key: 'g i', action: 'navigate', route: '/employee/hr/internal-jobs', description: 'Go to internal jobs' },
    { key: 'n', action: 'newEntity', description: 'New entity (context-aware)' },
    { key: 'l', action: 'logActivity', description: 'Log activity' },
  ],
};

export default taDashboardScreen;

