/**
 * Bench Sales Dashboard Screen
 * 
 * Main entry point for Bench Sales Recruiters showing:
 * - Today's Priorities (urgent, high, normal)
 * - Bench Health Overview (consultants, avg days, sprint progress)
 * - Performance Metrics vs Goals
 * - My Bench Consultants
 * - Submission Pipeline
 * - Active Placements
 * - Immigration Alerts
 * - Marketing Activity
 * - Revenue & Commission
 * 
 * @see docs/specs/20-USER-ROLES/02-bench-sales/20-bench-dashboard.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const benchDashboardScreen: ScreenDefinition = {
  id: 'bench-dashboard',
  type: 'dashboard',
  title: 'Bench Sales Dashboard',
  subtitle: { type: 'context', path: 'user.fullName' },
  icon: 'Users',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'priorities', procedure: 'bench.getTodaysPriorities' },
      { key: 'benchHealth', procedure: 'bench.getBenchHealth' },
      { key: 'metrics', procedure: 'bench.getPerformanceMetrics' },
      { key: 'consultants', procedure: 'bench.getMyConsultants' },
      { key: 'pipeline', procedure: 'bench.getSubmissionPipeline' },
      { key: 'placements', procedure: 'bench.getActivePlacements' },
      { key: 'immigration', procedure: 'bench.getImmigrationAlerts' },
      { key: 'marketing', procedure: 'bench.getMarketingActivity' },
      { key: 'revenue', procedure: 'bench.getRevenueCommission' },
    ],
  },

  layout: {
    type: 'single-column',
    sections: [
      // ===========================================
      // TODAY'S PRIORITIES
      // ===========================================
      {
        id: 'todays-priorities',
        type: 'custom',
        title: "Today's Priorities",
        component: 'PrioritizedTaskList',
        componentProps: {
          groups: [
            { 
              id: 'urgent', 
              label: '🔴 URGENT', 
              filter: { priority: 'urgent' },
              collapsible: false,
            },
            { 
              id: 'high', 
              label: '🟡 HIGH PRIORITY', 
              filter: { priority: 'high' },
              collapsible: true,
              maxItems: 5,
            },
            { 
              id: 'normal', 
              label: '🟢 NORMAL', 
              filter: { priority: 'normal' },
              collapsible: true,
              collapsed: true,
            },
          ],
          showActions: true,
          onTaskClick: 'openTaskDetail',
        },
        actions: [
          {
            id: 'view-all-tasks',
            label: 'Show All Tasks',
            type: 'navigate',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/workspace/bench/tasks' },
          },
        ],
      },

      // ===========================================
      // BENCH HEALTH OVERVIEW
      // ===========================================
      {
        id: 'bench-health-overview',
        type: 'metrics-grid',
        title: 'Bench Health Overview',
        columns: 4,
        fields: [
          {
            id: 'my-bench',
            label: 'My Bench',
            type: 'number',
            path: 'benchHealth.totalConsultants',
            config: {
              subtitle: 'consultants',
              warning: { type: 'field', path: 'benchHealth.orangeCount' },
              warningLabel: 'orange (31+ days)',
              icon: 'Users',
              bgColor: 'bg-blue-50',
            },
          },
          {
            id: 'avg-days',
            label: 'Avg Days on Bench',
            type: 'number',
            path: 'benchHealth.avgDaysOnBench',
            config: {
              target: 30,
              trend: { type: 'field', path: 'benchHealth.daysOnBenchTrend' },
              trendLabel: { type: 'field', path: 'benchHealth.daysOnBenchTrendLabel' },
              icon: 'Calendar',
              bgColor: 'bg-amber-50',
            },
          },
          {
            id: 'this-week',
            label: 'This Week',
            type: 'custom',
            path: 'benchHealth.weeklyStats',
            widget: 'WeeklyStatsSummary',
            config: {
              metrics: [
                { label: 'Placed', path: 'placed', icon: 'CheckCircle', variant: 'success' },
                { label: 'Subs', path: 'submissions', icon: 'Send' },
                { label: 'Interviews', path: 'interviews', icon: 'Calendar' },
              ],
            },
          },
          {
            id: 'sprint-progress',
            label: 'Sprint Progress',
            type: 'custom',
            path: 'benchHealth.sprint',
            widget: 'SprintProgress',
            config: {
              showDaysRemaining: true,
              showRiskIndicator: true,
            },
          },
        ],
      },

      // Second row of health metrics
      {
        id: 'bench-health-row2',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          {
            id: 'placements',
            label: 'Active Placements',
            type: 'number',
            path: 'benchHealth.activePlacements',
            config: {
              subtitle: { type: 'field', path: 'benchHealth.placementsNote' },
              icon: 'Briefcase',
              bgColor: 'bg-green-50',
            },
          },
          {
            id: 'pipeline',
            label: 'Pipeline',
            type: 'custom',
            path: 'benchHealth.pipeline',
            widget: 'PipelineMiniBadges',
            config: {
              badges: [
                { label: 'subs', path: 'activeSubmissions' },
                { label: 'interviews', path: 'interviews' },
                { label: 'offers', path: 'offers' },
              ],
            },
          },
          {
            id: 'marketing',
            label: 'Marketing',
            type: 'custom',
            path: 'benchHealth.marketing',
            widget: 'MarketingMiniStats',
            config: {
              metrics: [
                { label: 'hotlists', path: 'hotlistsThisWeek' },
                { label: 'vendors reached', path: 'vendorsReached' },
              ],
            },
          },
          {
            id: 'revenue',
            label: 'Monthly Revenue',
            type: 'currency',
            path: 'benchHealth.monthlyRevenue',
            config: {
              trend: { type: 'field', path: 'benchHealth.revenueTrend' },
              trendLabel: 'growth',
              icon: 'DollarSign',
              bgColor: 'bg-emerald-50',
            },
          },
        ],
      },

      // ===========================================
      // PERFORMANCE METRICS
      // ===========================================
      {
        id: 'performance-metrics',
        type: 'table',
        title: 'Performance Metrics (vs Goals)',
        dataSource: { type: 'field', path: 'metrics' },
        columns_config: [
          { id: 'metric', header: 'Metric', path: 'name' },
          { id: 'this-week', header: 'This Week', path: 'thisWeek', type: 'number' },
          { id: 'this-month', header: 'This Month', path: 'thisMonth', type: 'number' },
          { id: 'goal', header: 'Goal', path: 'goal' },
          { 
            id: 'progress', 
            header: '%', 
            path: 'percentOfGoal',
            type: 'progress-badge',
            config: { greenThreshold: 100, yellowThreshold: 80 },
          },
        ],
        config: {
          compact: true,
          striped: true,
        },
        actions: [
          {
            id: 'view-report',
            label: 'View Detailed Report',
            type: 'navigate',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/workspace/bench/reports' },
          },
          {
            id: 'export',
            label: 'Export',
            type: 'function',
            icon: 'Download',
            variant: 'ghost',
            config: { type: 'function', handler: 'exportMetrics' },
          },
          {
            id: 'set-goals',
            label: 'Set Goals',
            type: 'modal',
            icon: 'Target',
            variant: 'ghost',
            config: { type: 'modal', modal: 'set-goals' },
          },
        ],
      },

      // ===========================================
      // MY BENCH CONSULTANTS
      // ===========================================
      {
        id: 'my-consultants',
        type: 'custom',
        title: 'My Bench Consultants',
        component: 'ConsultantCardGrid',
        componentProps: {
          dataPath: 'consultants',
          cardTemplate: {
            header: {
              avatar: { type: 'field', path: 'avatarUrl' },
              name: { type: 'field', path: 'fullName' },
              title: { type: 'field', path: 'title' },
              matchScore: { type: 'field', path: 'matchScore' },
              statusIndicator: { type: 'field', path: 'benchStatus' },
            },
            body: [
              { icon: 'Calendar', label: 'Days on bench', value: { type: 'field', path: 'daysOnBench' } },
              { icon: 'Briefcase', label: 'Last', value: { type: 'field', path: 'lastEmployer' } },
              { icon: 'MapPin', label: 'Location', value: { type: 'field', path: 'location' } },
              { icon: 'CreditCard', label: 'Visa', value: { type: 'field', path: 'visaStatus' } },
              { icon: 'DollarSign', label: 'Rate', value: { type: 'field', path: 'rateFormatted' } },
            ],
            skills: { type: 'field', path: 'skills' },
            stats: [
              { label: 'Active Subs', value: { type: 'field', path: 'activeSubmissions' } },
              { label: 'Last Contact', value: { type: 'field', path: 'lastContactDays' } },
            ],
          },
          quickActions: [
            { id: 'view', label: 'View', icon: 'Eye' },
            { id: 'marketing', label: 'Marketing', icon: 'Megaphone' },
            { id: 'submit', label: 'Submit', icon: 'Send' },
            { id: 'log', label: 'Log Activity', icon: 'Plus' },
            { id: 'contact', label: 'Contact', icon: 'Phone' },
          ],
          filters: [
            { id: 'all', label: 'All' },
            { id: 'orange', label: '🟠 Orange' },
            { id: 'green', label: '🟢 Green' },
            { id: 'new', label: 'New' },
          ],
        },
        actions: [
          {
            id: 'view-all',
            label: 'View All Consultants',
            type: 'navigate',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/workspace/bench/consultants' },
          },
        ],
      },

      // ===========================================
      // SUBMISSION PIPELINE
      // ===========================================
      {
        id: 'submission-pipeline',
        type: 'custom',
        title: 'Submission Pipeline',
        component: 'MiniKanbanBoard',
        componentProps: {
          dataPath: 'pipeline',
          columns: [
            { id: 'submitted', title: 'Submitted', color: 'blue' },
            { id: 'vendor_review', title: 'Vendor Review', color: 'purple' },
            { id: 'client_review', title: 'Client Review', color: 'indigo' },
            { id: 'interview', title: 'Interview', color: 'cyan' },
            { id: 'offer', title: 'Offer', color: 'amber' },
          ],
          cardFields: ['consultant.name', 'vendor.name', 'daysInStage'],
          maxCardsPerColumn: 3,
          showConversionMetrics: true,
        },
        actions: [
          {
            id: 'view-all-submissions',
            label: 'View All Submissions',
            type: 'navigate',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/workspace/bench/submissions' },
          },
          {
            id: 'add-submission',
            label: 'Add Submission',
            type: 'modal',
            icon: 'Plus',
            variant: 'default',
            config: { type: 'modal', modal: 'bench-submission-create' },
          },
        ],
      },

      // ===========================================
      // ACTIVE PLACEMENTS
      // ===========================================
      {
        id: 'active-placements',
        type: 'custom',
        title: 'Active Placements',
        component: 'PlacementCardList',
        componentProps: {
          dataPath: 'placements',
          cardTemplate: {
            title: { type: 'template', template: '{{consultant.name}} @ {{client.name}}' },
            subtitle: { type: 'field', path: 'role' },
            healthIndicator: { type: 'field', path: 'healthScore' },
            metrics: [
              { label: 'Started', value: { type: 'field', path: 'startedFormatted' } },
              { label: 'Rate', value: { type: 'field', path: 'rateFormatted' } },
              { label: 'Value', value: { type: 'field', path: 'monthlyValueFormatted' } },
              { label: 'Next Check-in', value: { type: 'field', path: 'nextCheckinFormatted' } },
            ],
            status: { type: 'field', path: 'statusNote' },
          },
          quickActions: ['view', 'log-checkin', 'update'],
        },
        footer: {
          type: 'summary-row',
          items: [
            { label: 'Total Monthly Value', value: { type: 'field', path: 'placements.totalMonthlyValue' }, format: 'currency' },
            { label: 'Avg Health', value: { type: 'field', path: 'placements.avgHealth' }, suffix: '%' },
          ],
        },
      },

      // ===========================================
      // IMMIGRATION ALERTS
      // ===========================================
      {
        id: 'immigration-alerts',
        type: 'custom',
        title: 'Immigration Status Dashboard',
        component: 'ImmigrationAlertsDashboard',
        componentProps: {
          dataPath: 'immigration',
          summaryBadges: [
            { level: 'red', label: 'RED', description: 'Action required <30 days' },
            { level: 'orange', label: 'ORANGE', description: 'Renewal needed 30-90 days' },
            { level: 'yellow', label: 'YELLOW', description: 'Monitor 90-180 days' },
            { level: 'green', label: 'GREEN', description: 'Good standing >180 days' },
            { level: 'black', label: 'BLACK', description: 'Expired - NO WORK' },
          ],
          showCriticalFirst: true,
          maxAlerts: 5,
          quickActions: ['contact-hr', 'view-case', 'flag-unavailable'],
        },
        actions: [
          {
            id: 'view-all-immigration',
            label: 'View All Immigration Cases',
            type: 'navigate',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/workspace/bench/immigration' },
          },
          {
            id: 'download-report',
            label: 'Download Report',
            type: 'function',
            icon: 'Download',
            variant: 'ghost',
            config: { type: 'function', handler: 'downloadImmigrationReport' },
          },
          {
            id: 'contact-attorney',
            label: 'Contact Attorney',
            type: 'modal',
            icon: 'Mail',
            variant: 'ghost',
            config: { type: 'modal', modal: 'contact-attorney' },
          },
        ],
      },

      // ===========================================
      // MARKETING ACTIVITY
      // ===========================================
      {
        id: 'marketing-activity',
        type: 'custom',
        title: 'Marketing Activity',
        component: 'MarketingActivityWidget',
        componentProps: {
          dataPath: 'marketing',
          showWeeklyStats: true,
          showRecentHotlists: true,
          maxHotlists: 3,
          metrics: [
            { key: 'hotlistsSent', label: 'Hotlists Sent' },
            { key: 'totalRecipients', label: 'Total Recipients' },
            { key: 'openRate', label: 'Email Open Rate', format: 'percentage', benchmark: 35 },
            { key: 'clickRate', label: 'Click Rate', format: 'percentage', benchmark: 12 },
            { key: 'responseRate', label: 'Response Rate', format: 'percentage', benchmark: 15 },
            { key: 'vendorCalls', label: 'Vendor Calls Made' },
            { key: 'linkedInMessages', label: 'LinkedIn Messages' },
            { key: 'vendorMeetings', label: 'Vendor Meetings' },
          ],
          hotlistCardTemplate: {
            title: { type: 'field', path: 'name' },
            subtitle: { type: 'field', path: 'sentDateFormatted' },
            stats: [
              { label: 'Recipients', path: 'recipientCount' },
              { label: 'Consultants', path: 'consultantCount' },
              { label: 'Opened', path: 'openedPercent', format: 'percentage' },
              { label: 'Clicked', path: 'clickedPercent', format: 'percentage' },
              { label: 'Responded', path: 'respondedPercent', format: 'percentage' },
              { label: 'Submissions', path: 'submissionsGenerated' },
            ],
          },
        },
        actions: [
          {
            id: 'create-hotlist',
            label: 'Create New Hotlist',
            type: 'navigate',
            icon: 'Plus',
            variant: 'primary',
            config: { type: 'navigate', route: '/employee/workspace/bench/hotlists/new' },
          },
          {
            id: 'view-all-campaigns',
            label: 'View All Campaigns',
            type: 'navigate',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/workspace/bench/marketing' },
          },
          {
            id: 'marketing-report',
            label: 'Marketing Report',
            type: 'navigate',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/workspace/bench/reports/marketing' },
          },
        ],
      },

      // ===========================================
      // REVENUE & COMMISSION
      // ===========================================
      {
        id: 'revenue-commission',
        type: 'custom',
        title: 'Revenue & Commission Dashboard',
        component: 'RevenueCommissionWidget',
        componentProps: {
          dataPath: 'revenue',
          financialSummary: {
            totalRevenue: { type: 'field', path: 'totalPlacementRevenue' },
            activePlacements: { type: 'field', path: 'activePlacementCount' },
            avgBillRate: { type: 'field', path: 'avgBillRate' },
            totalHours: { type: 'field', path: 'totalHoursBilled' },
            grossMargin: { type: 'field', path: 'grossMargin' },
            vendorCommission: { type: 'field', path: 'vendorCommission' },
            netMargin: { type: 'field', path: 'netMargin' },
          },
          ytdSummary: {
            totalRevenue: { type: 'field', path: 'ytd.totalRevenue' },
            totalPlacements: { type: 'field', path: 'ytd.totalPlacements' },
            avgDuration: { type: 'field', path: 'ytd.avgPlacementDuration' },
            retentionRate: { type: 'field', path: 'ytd.retentionRate' },
          },
          personalCommission: {
            baseSalary: { type: 'field', path: 'commission.baseSalary' },
            placementBonus: { type: 'field', path: 'commission.placementBonus' },
            marginShare: { type: 'field', path: 'commission.marginShare' },
            sprintBonus: { type: 'field', path: 'commission.sprintBonus' },
            totalCompensation: { type: 'field', path: 'commission.totalCompensation' },
            ytdTotal: { type: 'field', path: 'commission.ytdTotal' },
            projectedAnnual: { type: 'field', path: 'commission.projectedAnnual' },
          },
        },
        visible: {
          type: 'permission',
          permission: 'bench.commission.view',
        },
        actions: [
          {
            id: 'detailed-breakdown',
            label: 'View Detailed Breakdown',
            type: 'navigate',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/workspace/bench/commission' },
          },
          {
            id: 'export-report',
            label: 'Export Report',
            type: 'function',
            icon: 'Download',
            variant: 'ghost',
            config: { type: 'function', handler: 'exportRevenueReport' },
          },
          {
            id: 'contact-finance',
            label: 'Contact Finance',
            type: 'modal',
            icon: 'Mail',
            variant: 'ghost',
            config: { type: 'modal', modal: 'contact-finance' },
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
      id: 'add-consultant',
      label: 'Add Consultant',
      type: 'modal',
      icon: 'UserPlus',
      variant: 'default',
      config: { type: 'modal', modal: 'consultant-create' },
    },
    {
      id: 'create-submission',
      label: 'New Submission',
      type: 'modal',
      icon: 'Send',
      variant: 'default',
      config: { type: 'modal', modal: 'bench-submission-create' },
    },
    {
      id: 'create-hotlist',
      label: 'Create Hotlist',
      type: 'navigate',
      icon: 'FileText',
      variant: 'primary',
      config: { type: 'navigate', route: '/employee/workspace/bench/hotlists/new' },
    },
    {
      id: 'settings',
      label: 'Settings',
      type: 'modal',
      icon: 'Settings',
      variant: 'ghost',
      config: { type: 'modal', modal: 'dashboard-settings' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Bench Sales', active: true },
    ],
  },

  keyboard_shortcuts: [
    { key: 'g d', action: 'navigate', route: '/employee/workspace/bench', description: 'Go to dashboard' },
    { key: 'r', action: 'refresh', description: 'Refresh dashboard' },
    { key: '1-9', action: 'jumpToWidget', description: 'Jump to widget by number' },
    { key: 't', action: 'viewTasks', description: 'View tasks' },
    { key: 'c', action: 'viewConsultants', description: 'View consultants' },
    { key: 's', action: 'viewSubmissions', description: 'View submissions' },
    { key: 'p', action: 'viewPlacements', description: 'View placements' },
    { key: 'i', action: 'viewImmigration', description: 'View immigration' },
    { key: 'm', action: 'viewMarketing', description: 'View marketing' },
  ],
};

export default benchDashboardScreen;

