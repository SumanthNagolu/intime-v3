/**
 * Specific Role Configuration
 *
 * Defines 11 specific role configurations with role-specific widgets,
 * quick actions, and permissions. Extends the base WorkspaceRole system.
 */

import type { WorkspaceRole, QuickAction, DashboardWidget } from './role-config';
import {
  UserPlus,
  Send,
  Calendar,
  Briefcase,
  Target,
  Star,
  FileText,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Settings,
  Shield,
  Clock,
  CheckCircle2,
  BarChart3,
  PieChart,
  Megaphone,
  Mail,
  Phone,
  FileSpreadsheet,
  Activity,
} from 'lucide-react';

// =====================================================
// SPECIFIC ROLE TYPES
// =====================================================

export type SpecificRole =
  | 'technical_recruiter'
  | 'bench_sales_recruiter'
  | 'ta_specialist'
  | 'recruiting_manager'
  | 'bench_manager'
  | 'ta_manager'
  | 'hr'
  | 'admin'
  | 'coo'
  | 'cfo'
  | 'ceo';

export type HierarchyLevel = 'ic' | 'manager' | 'director' | 'c_suite';

export type DataScope = 'own' | 'team' | 'department' | 'org';

// =====================================================
// WIDGET SECTION TYPES
// =====================================================

export interface WidgetSection {
  id: string;
  title: string;
  widgets: DashboardWidgetExtended[];
  order: number;
  visible: boolean;
}

export interface DashboardWidgetExtended extends DashboardWidget {
  gridSpan?: 1 | 2 | 3 | 4;
  dataSource?: {
    router: string;
    procedure: string;
    params?: Record<string, unknown>;
  };
  refreshInterval?: number; // seconds
}

// =====================================================
// EXTENDED PERMISSIONS
// =====================================================

export interface ExtendedPermissions {
  // Base permissions
  canCreateLeads: boolean;
  canCreateAccounts: boolean;
  canCreateDeals: boolean;
  canCreateJobs: boolean;
  canCreateSubmissions: boolean;
  canApproveSubmissions: boolean;
  canViewAnalytics: boolean;
  canExport: boolean;

  // HR permissions
  canManageEmployees: boolean;
  canApproveTimeOff: boolean;
  canRunPayroll: boolean;
  canViewSalaries: boolean;
  canCreatePerformanceReviews: boolean;

  // Admin permissions
  canManageRoles: boolean;
  canViewAuditLogs: boolean;
  canManageOrganization: boolean;
  canManageIntegrations: boolean;

  // Finance permissions
  canViewFinancials: boolean;
  canApproveExpenses: boolean;
  canManageBudgets: boolean;
  canViewCosts: boolean;

  // Manager permissions
  canViewTeamData: boolean;
  canAssignWork: boolean;
  canApproveRates: boolean;
}

// =====================================================
// SPECIFIC ROLE CONFIG INTERFACE
// =====================================================

export interface SpecificRoleConfig {
  role: SpecificRole;
  workspaceCategory: WorkspaceRole;
  label: string;
  description: string;
  hierarchyLevel: HierarchyLevel;
  dataScope: DataScope;

  // For composite dashboards
  canViewSubordinates: boolean;
  subordinateRoles: SpecificRole[];

  // Dashboard configuration
  dashboardSections: WidgetSection[];
  quickActions: QuickAction[];

  // Extended permissions
  permissions: ExtendedPermissions;
}

// =====================================================
// DEFAULT PERMISSION SETS
// =====================================================

const IC_BASE_PERMISSIONS: ExtendedPermissions = {
  canCreateLeads: false,
  canCreateAccounts: false,
  canCreateDeals: false,
  canCreateJobs: false,
  canCreateSubmissions: true,
  canApproveSubmissions: false,
  canViewAnalytics: true,
  canExport: true,
  canManageEmployees: false,
  canApproveTimeOff: false,
  canRunPayroll: false,
  canViewSalaries: false,
  canCreatePerformanceReviews: false,
  canManageRoles: false,
  canViewAuditLogs: false,
  canManageOrganization: false,
  canManageIntegrations: false,
  canViewFinancials: false,
  canApproveExpenses: false,
  canManageBudgets: false,
  canViewCosts: false,
  canViewTeamData: false,
  canAssignWork: false,
  canApproveRates: false,
};

const MANAGER_BASE_PERMISSIONS: ExtendedPermissions = {
  ...IC_BASE_PERMISSIONS,
  canCreateLeads: true,
  canCreateAccounts: true,
  canCreateDeals: true,
  canCreateJobs: true,
  canApproveSubmissions: true,
  canViewTeamData: true,
  canAssignWork: true,
  canApproveRates: true,
};

const EXECUTIVE_BASE_PERMISSIONS: ExtendedPermissions = {
  ...MANAGER_BASE_PERMISSIONS,
  canViewFinancials: true,
  canViewCosts: true,
  canViewAuditLogs: true,
};

// =====================================================
// SPECIFIC ROLE CONFIGURATIONS
// =====================================================

export const specificRoleConfigs: Record<SpecificRole, SpecificRoleConfig> = {
  // ===== IC ROLES =====

  technical_recruiter: {
    role: 'technical_recruiter',
    workspaceCategory: 'recruiting',
    label: 'Technical Recruiter',
    description: 'Full-cycle recruiting with job and candidate management',
    hierarchyLevel: 'ic',
    dataScope: 'own',
    canViewSubordinates: false,
    subordinateRoles: [],

    dashboardSections: [
      {
        id: 'metrics',
        title: 'My Metrics',
        order: 0,
        visible: true,
        widgets: [
          {
            id: 'active-jobs',
            title: 'Active Jobs Assigned',
            type: 'metric',
            entityType: 'job',
            gridSpan: 1,
            dataSource: { router: 'dashboard', procedure: 'recruiterMetrics' },
          },
          {
            id: 'submissions-week',
            title: 'Submissions This Week',
            type: 'metric',
            entityType: 'submission',
            gridSpan: 1,
            dataSource: { router: 'dashboard', procedure: 'recruiterMetrics' },
          },
          {
            id: 'interviews-today',
            title: 'Interviews Today',
            type: 'metric',
            entityType: 'submission',
            gridSpan: 1,
            dataSource: { router: 'dashboard', procedure: 'recruiterMetrics' },
          },
        ],
      },
      {
        id: 'pipeline',
        title: 'My Pipeline',
        order: 1,
        visible: true,
        widgets: [
          {
            id: 'submission-pipeline',
            title: 'Submission Pipeline',
            type: 'pipeline',
            entityType: 'submission',
            gridSpan: 4,
            dataSource: { router: 'dashboard', procedure: 'submissionPipeline' },
          },
        ],
      },
      {
        id: 'priority',
        title: 'Priority Items',
        order: 2,
        visible: true,
        widgets: [
          {
            id: 'hot-jobs',
            title: 'Hot Jobs (Urgent)',
            type: 'list',
            entityType: 'job',
            gridSpan: 2,
            dataSource: { router: 'ats', procedure: 'getUrgentJobs' },
          },
          {
            id: 'interviews-schedule',
            title: "Today's Interviews",
            type: 'list',
            entityType: 'submission',
            gridSpan: 2,
            dataSource: { router: 'dashboard', procedure: 'todaysInterviews' },
          },
        ],
      },
      {
        id: 'activity',
        title: 'Recent Activity',
        order: 3,
        visible: true,
        widgets: [
          {
            id: 'recent-activity',
            title: 'Recent Activity',
            type: 'list',
            gridSpan: 4,
            dataSource: { router: 'activities', procedure: 'getRecent' },
          },
        ],
      },
    ],

    quickActions: [
      { id: 'source-talent', label: 'Source Candidates', icon: UserPlus, action: 'source-talent', entityTypes: ['job'] },
      { id: 'create-submission', label: 'Submit to Job', icon: Send, action: 'create-submission', entityTypes: ['job', 'talent'], shortcut: 'cmd+shift+s' },
      { id: 'schedule-interview', label: 'Schedule Interview', icon: Calendar, action: 'schedule-interview', entityTypes: ['submission'] },
      { id: 'log-call', label: 'Log Call', icon: Phone, action: 'log-call' },
      { id: 'post-job', label: 'Post Job', icon: Briefcase, action: 'post-job', shortcut: 'cmd+shift+j' },
    ],

    permissions: {
      ...IC_BASE_PERMISSIONS,
      canCreateJobs: true,
      canCreateLeads: true,
      canCreateAccounts: true,
    },
  },

  bench_sales_recruiter: {
    role: 'bench_sales_recruiter',
    workspaceCategory: 'bench',
    label: 'Bench Sales Recruiter',
    description: 'Consultant marketing and job order fulfillment',
    hierarchyLevel: 'ic',
    dataScope: 'own',
    canViewSubordinates: false,
    subordinateRoles: [],

    dashboardSections: [
      {
        id: 'metrics',
        title: 'My Metrics',
        order: 0,
        visible: true,
        widgets: [
          {
            id: 'bench-count',
            title: 'Consultants on Bench',
            type: 'metric',
            entityType: 'talent',
            gridSpan: 1,
            dataSource: { router: 'bench', procedure: 'getBenchMetrics' },
          },
          {
            id: 'submissions-week',
            title: 'Submissions This Week',
            type: 'metric',
            entityType: 'submission',
            gridSpan: 1,
            dataSource: { router: 'dashboard', procedure: 'benchSalesMetrics' },
          },
          {
            id: 'placements-mtd',
            title: 'Placements MTD',
            type: 'metric',
            entityType: 'submission',
            gridSpan: 1,
            dataSource: { router: 'dashboard', procedure: 'benchSalesMetrics' },
          },
        ],
      },
      {
        id: 'bench',
        title: 'Bench Status',
        order: 1,
        visible: true,
        widgets: [
          {
            id: 'bench-aging',
            title: 'Bench Aging Report',
            type: 'list',
            entityType: 'talent',
            gridSpan: 2,
            dataSource: { router: 'bench', procedure: 'getBenchAging' },
          },
          {
            id: 'active-job-orders',
            title: 'Active Job Orders',
            type: 'list',
            entityType: 'job_order',
            gridSpan: 2,
            dataSource: { router: 'bench', procedure: 'getActiveJobOrders' },
          },
        ],
      },
      {
        id: 'pipeline',
        title: 'My Pipeline',
        order: 2,
        visible: true,
        widgets: [
          {
            id: 'submission-pipeline',
            title: 'Submission Pipeline',
            type: 'pipeline',
            entityType: 'submission',
            gridSpan: 4,
            dataSource: { router: 'dashboard', procedure: 'benchSubmissionPipeline' },
          },
        ],
      },
      {
        id: 'marketing',
        title: 'Marketing Performance',
        order: 3,
        visible: true,
        widgets: [
          {
            id: 'marketing-channels',
            title: 'Channel Performance',
            type: 'chart',
            gridSpan: 2,
            dataSource: { router: 'bench', procedure: 'getMarketingMetrics' },
          },
          {
            id: 'hotlist',
            title: 'My Hotlist',
            type: 'list',
            entityType: 'talent',
            gridSpan: 2,
            dataSource: { router: 'bench', procedure: 'getHotlist' },
          },
        ],
      },
    ],

    quickActions: [
      { id: 'add-hotlist', label: 'Add to Hotlist', icon: Star, action: 'add-hotlist', entityTypes: ['talent'] },
      { id: 'submit-to-order', label: 'Submit to Job Order', icon: Send, action: 'submit-to-order', entityTypes: ['talent'] },
      { id: 'send-marketing', label: 'Send Marketing Email', icon: Mail, action: 'send-marketing', entityTypes: ['talent'] },
      { id: 'import-job-order', label: 'Import Job Order', icon: FileText, action: 'import-job-order' },
    ],

    permissions: {
      ...IC_BASE_PERMISSIONS,
    },
  },

  ta_specialist: {
    role: 'ta_specialist',
    workspaceCategory: 'ta',
    label: 'Talent Acquisition Specialist',
    description: 'Business development and lead generation',
    hierarchyLevel: 'ic',
    dataScope: 'own',
    canViewSubordinates: false,
    subordinateRoles: [],

    dashboardSections: [
      {
        id: 'metrics',
        title: 'My Metrics',
        order: 0,
        visible: true,
        widgets: [
          {
            id: 'new-leads',
            title: 'New Leads This Month',
            type: 'metric',
            entityType: 'lead',
            gridSpan: 1,
            dataSource: { router: 'crm', procedure: 'getLeadMetrics' },
          },
          {
            id: 'meetings-booked',
            title: 'Meetings Booked',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'crm', procedure: 'getMeetingMetrics' },
          },
          {
            id: 'conversion-rate',
            title: 'Conversion Rate',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'crm', procedure: 'getConversionMetrics' },
          },
        ],
      },
      {
        id: 'pipeline',
        title: 'Lead Pipeline',
        order: 1,
        visible: true,
        widgets: [
          {
            id: 'lead-pipeline',
            title: 'Lead Pipeline',
            type: 'pipeline',
            entityType: 'lead',
            gridSpan: 4,
            dataSource: { router: 'crm', procedure: 'getLeadPipeline' },
          },
        ],
      },
      {
        id: 'campaigns',
        title: 'Campaigns & Follow-ups',
        order: 2,
        visible: true,
        widgets: [
          {
            id: 'active-campaigns',
            title: 'Active Campaigns',
            type: 'list',
            gridSpan: 2,
            dataSource: { router: 'crm', procedure: 'getActiveCampaigns' },
          },
          {
            id: 'followups-due',
            title: 'Follow-ups Due Today',
            type: 'list',
            entityType: 'lead',
            gridSpan: 2,
            dataSource: { router: 'crm', procedure: 'getFollowupsDue' },
          },
        ],
      },
      {
        id: 'performance',
        title: 'Channel Performance',
        order: 3,
        visible: true,
        widgets: [
          {
            id: 'channel-performance',
            title: 'Channel Performance',
            type: 'chart',
            gridSpan: 4,
            dataSource: { router: 'crm', procedure: 'getChannelPerformance' },
          },
        ],
      },
    ],

    quickActions: [
      { id: 'create-lead', label: 'Create Lead', icon: Target, action: 'create-lead', shortcut: 'cmd+shift+l' },
      { id: 'launch-campaign', label: 'Launch Campaign', icon: Megaphone, action: 'launch-campaign' },
      { id: 'qualify-lead', label: 'Qualify Lead', icon: CheckCircle2, action: 'qualify-lead', entityTypes: ['lead'] },
      { id: 'schedule-meeting', label: 'Schedule Meeting', icon: Calendar, action: 'schedule-meeting' },
    ],

    permissions: {
      ...IC_BASE_PERMISSIONS,
      canCreateLeads: true,
      canCreateAccounts: true,
      canCreateDeals: true,
      canCreateSubmissions: false,
    },
  },

  // ===== MANAGER ROLES =====

  recruiting_manager: {
    role: 'recruiting_manager',
    workspaceCategory: 'manager',
    label: 'Recruiting Manager',
    description: 'Team oversight, account management, and delivery',
    hierarchyLevel: 'manager',
    dataScope: 'team',
    canViewSubordinates: true,
    subordinateRoles: ['technical_recruiter'],

    dashboardSections: [
      {
        id: 'team-metrics',
        title: 'Team Metrics',
        order: 0,
        visible: true,
        widgets: [
          {
            id: 'pending-approvals',
            title: 'Pending Approvals',
            type: 'metric',
            entityType: 'submission',
            gridSpan: 1,
            dataSource: { router: 'dashboard', procedure: 'getPendingApprovals' },
          },
          {
            id: 'team-placements',
            title: 'Team Placements MTD',
            type: 'metric',
            entityType: 'submission',
            gridSpan: 1,
            dataSource: { router: 'dashboard', procedure: 'getTeamPlacements' },
          },
          {
            id: 'active-jobs',
            title: 'Active Jobs',
            type: 'metric',
            entityType: 'job',
            gridSpan: 1,
            dataSource: { router: 'dashboard', procedure: 'getActiveJobs' },
          },
        ],
      },
      {
        id: 'approvals',
        title: 'Approvals & Team',
        order: 1,
        visible: true,
        widgets: [
          {
            id: 'approval-queue',
            title: 'Pending Approvals',
            type: 'list',
            entityType: 'submission',
            gridSpan: 2,
            dataSource: { router: 'dashboard', procedure: 'getApprovalQueue' },
          },
          {
            id: 'team-performance',
            title: 'Team Performance',
            type: 'chart',
            gridSpan: 2,
            dataSource: { router: 'dashboard', procedure: 'getTeamPerformance' },
          },
        ],
      },
      {
        id: 'pipeline',
        title: 'Team Pipeline',
        order: 2,
        visible: true,
        widgets: [
          {
            id: 'team-pipeline',
            title: 'Team Pipeline Health',
            type: 'pipeline',
            entityType: 'submission',
            gridSpan: 4,
            dataSource: { router: 'dashboard', procedure: 'getTeamPipeline' },
          },
        ],
      },
      {
        id: 'risks',
        title: 'Risks & Accounts',
        order: 3,
        visible: true,
        widgets: [
          {
            id: 'at-risk-jobs',
            title: 'At-Risk Jobs',
            type: 'list',
            entityType: 'job',
            gridSpan: 2,
            dataSource: { router: 'dashboard', procedure: 'getAtRiskJobs' },
          },
          {
            id: 'top-accounts',
            title: 'Top Accounts',
            type: 'list',
            entityType: 'account',
            gridSpan: 2,
            dataSource: { router: 'dashboard', procedure: 'getTopAccounts' },
          },
        ],
      },
    ],

    quickActions: [
      { id: 'approve-submission', label: 'Approve/Reject', icon: CheckCircle2, action: 'approve-submission', entityTypes: ['submission'] },
      { id: 'assign-job', label: 'Assign Job', icon: Users, action: 'assign-job', entityTypes: ['job'] },
      { id: 'view-reports', label: 'View Reports', icon: BarChart3, action: 'view-reports' },
      { id: 'account-checkin', label: 'Account Check-in', icon: Building2, action: 'account-checkin', entityTypes: ['account'] },
    ],

    permissions: {
      ...MANAGER_BASE_PERMISSIONS,
    },
  },

  bench_manager: {
    role: 'bench_manager',
    workspaceCategory: 'manager',
    label: 'Bench Sales Manager',
    description: 'Bench utilization, margins, and team performance',
    hierarchyLevel: 'manager',
    dataScope: 'team',
    canViewSubordinates: true,
    subordinateRoles: ['bench_sales_recruiter'],

    dashboardSections: [
      {
        id: 'team-metrics',
        title: 'Team Metrics',
        order: 0,
        visible: true,
        widgets: [
          {
            id: 'utilization-rate',
            title: 'Bench Utilization Rate',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'bench', procedure: 'getUtilizationRate' },
          },
          {
            id: 'bench-cost',
            title: 'Bench Cost Burn',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'bench', procedure: 'getBenchCostBurn' },
          },
          {
            id: 'avg-days-bench',
            title: 'Avg Days on Bench',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'bench', procedure: 'getAvgDaysOnBench' },
          },
        ],
      },
      {
        id: 'critical',
        title: 'Critical Cases',
        order: 1,
        visible: true,
        widgets: [
          {
            id: 'critical-bench',
            title: 'Critical Cases (45+ Days)',
            type: 'list',
            entityType: 'talent',
            gridSpan: 2,
            dataSource: { router: 'bench', procedure: 'getCriticalBenchCases' },
          },
          {
            id: 'team-metrics-chart',
            title: 'Team Submission Velocity',
            type: 'chart',
            gridSpan: 2,
            dataSource: { router: 'dashboard', procedure: 'getBenchTeamMetrics' },
          },
        ],
      },
      {
        id: 'placements',
        title: 'Placements & Margins',
        order: 2,
        visible: true,
        widgets: [
          {
            id: 'pending-placements',
            title: 'Pending Placements',
            type: 'list',
            entityType: 'submission',
            gridSpan: 2,
            dataSource: { router: 'bench', procedure: 'getPendingPlacements' },
          },
          {
            id: 'margin-analysis',
            title: 'Margin Analysis',
            type: 'chart',
            gridSpan: 2,
            dataSource: { router: 'bench', procedure: 'getMarginAnalysis' },
          },
        ],
      },
      {
        id: 'immigration',
        title: 'Immigration & Compliance',
        order: 3,
        visible: true,
        widgets: [
          {
            id: 'immigration-deadlines',
            title: 'Immigration Deadlines',
            type: 'list',
            gridSpan: 4,
            dataSource: { router: 'bench', procedure: 'getImmigrationDeadlines' },
          },
        ],
      },
    ],

    quickActions: [
      { id: 'escalate-consultant', label: 'Escalate Consultant', icon: AlertCircle, action: 'escalate-consultant', entityTypes: ['talent'] },
      { id: 'approve-rate', label: 'Approve Rate', icon: DollarSign, action: 'approve-rate', entityTypes: ['submission'] },
      { id: 'team-standup', label: 'Team Standup', icon: Users, action: 'team-standup' },
      { id: 'export-bench', label: 'Export Bench List', icon: FileSpreadsheet, action: 'export-bench' },
    ],

    permissions: {
      ...MANAGER_BASE_PERMISSIONS,
    },
  },

  ta_manager: {
    role: 'ta_manager',
    workspaceCategory: 'manager',
    label: 'Talent Acquisition Manager',
    description: 'Pipeline management, deal forecasting, and team performance',
    hierarchyLevel: 'manager',
    dataScope: 'team',
    canViewSubordinates: true,
    subordinateRoles: ['ta_specialist'],

    dashboardSections: [
      {
        id: 'team-metrics',
        title: 'Team Metrics',
        order: 0,
        visible: true,
        widgets: [
          {
            id: 'new-accounts',
            title: 'New Accounts Won',
            type: 'metric',
            entityType: 'account',
            gridSpan: 1,
            dataSource: { router: 'crm', procedure: 'getNewAccountsWon' },
          },
          {
            id: 'pipeline-value',
            title: 'Pipeline Value',
            type: 'metric',
            entityType: 'deal',
            gridSpan: 1,
            dataSource: { router: 'crm', procedure: 'getPipelineValue' },
          },
          {
            id: 'conversion-rate',
            title: 'Team Conversion Rate',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'crm', procedure: 'getTeamConversionRate' },
          },
        ],
      },
      {
        id: 'pipeline',
        title: 'Deal Pipeline',
        order: 1,
        visible: true,
        widgets: [
          {
            id: 'deal-pipeline',
            title: 'Deal Pipeline',
            type: 'pipeline',
            entityType: 'deal',
            gridSpan: 4,
            dataSource: { router: 'crm', procedure: 'getDealPipeline' },
          },
        ],
      },
      {
        id: 'team',
        title: 'Team Performance',
        order: 2,
        visible: true,
        widgets: [
          {
            id: 'team-conversion',
            title: 'Team Conversion Rates',
            type: 'chart',
            gridSpan: 2,
            dataSource: { router: 'crm', procedure: 'getTeamConversion' },
          },
          {
            id: 'deals-closing',
            title: 'Deals Closing This Month',
            type: 'list',
            entityType: 'deal',
            gridSpan: 2,
            dataSource: { router: 'crm', procedure: 'getDealsClosingThisMonth' },
          },
        ],
      },
      {
        id: 'campaigns',
        title: 'Campaign ROI',
        order: 3,
        visible: true,
        widgets: [
          {
            id: 'campaign-roi',
            title: 'Campaign ROI',
            type: 'chart',
            gridSpan: 4,
            dataSource: { router: 'crm', procedure: 'getCampaignROI' },
          },
        ],
      },
    ],

    quickActions: [
      { id: 'assign-lead', label: 'Assign Lead', icon: Users, action: 'assign-lead', entityTypes: ['lead'] },
      { id: 'review-proposals', label: 'Review Proposals', icon: FileText, action: 'review-proposals' },
      { id: 'pipeline-review', label: 'Pipeline Review', icon: PieChart, action: 'pipeline-review' },
      { id: 'win-loss', label: 'Win/Loss Analysis', icon: BarChart3, action: 'win-loss' },
    ],

    permissions: {
      ...MANAGER_BASE_PERMISSIONS,
    },
  },

  hr: {
    role: 'hr',
    workspaceCategory: 'manager',
    label: 'Human Resources',
    description: 'People operations, onboarding, and compliance',
    hierarchyLevel: 'manager',
    dataScope: 'org',
    canViewSubordinates: false,
    subordinateRoles: [],

    dashboardSections: [
      {
        id: 'metrics',
        title: 'People Metrics',
        order: 0,
        visible: true,
        widgets: [
          {
            id: 'headcount',
            title: 'Total Headcount',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'hrMetrics', procedure: 'getHeadcount' },
          },
          {
            id: 'onboarding',
            title: 'Onboarding in Progress',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'hrMetrics', procedure: 'getOnboardingCount' },
          },
          {
            id: 'attrition',
            title: 'Attrition Rate',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'hrMetrics', procedure: 'getAttritionRate' },
          },
        ],
      },
      {
        id: 'approvals',
        title: 'Pending Approvals',
        order: 1,
        visible: true,
        widgets: [
          {
            id: 'onboarding-list',
            title: 'Onboarding Progress',
            type: 'list',
            gridSpan: 2,
            dataSource: { router: 'hrMetrics', procedure: 'getOnboardingList' },
          },
          {
            id: 'pending-approvals',
            title: 'Pending Approvals',
            type: 'list',
            gridSpan: 2,
            dataSource: { router: 'hrMetrics', procedure: 'getPendingApprovals' },
          },
        ],
      },
      {
        id: 'compliance',
        title: 'Compliance & Alerts',
        order: 2,
        visible: true,
        widgets: [
          {
            id: 'compliance-alerts',
            title: 'Compliance Alerts',
            type: 'list',
            gridSpan: 2,
            dataSource: { router: 'hrMetrics', procedure: 'getComplianceAlerts' },
          },
          {
            id: 'retention-trend',
            title: 'Retention Trend',
            type: 'chart',
            gridSpan: 2,
            dataSource: { router: 'hrMetrics', procedure: 'getRetentionTrend' },
          },
        ],
      },
      {
        id: 'activity',
        title: 'Recent Activity',
        order: 3,
        visible: true,
        widgets: [
          {
            id: 'hr-activity',
            title: 'Recent HR Activity',
            type: 'list',
            gridSpan: 4,
            dataSource: { router: 'hrMetrics', procedure: 'getRecentActivity' },
          },
        ],
      },
    ],

    quickActions: [
      { id: 'add-employee', label: 'Add Employee', icon: UserPlus, action: 'add-employee' },
      { id: 'process-approval', label: 'Process Approval', icon: CheckCircle2, action: 'process-approval' },
      { id: 'run-payroll', label: 'Run Payroll', icon: DollarSign, action: 'run-payroll' },
      { id: 'export-census', label: 'Export Census', icon: FileSpreadsheet, action: 'export-census' },
      { id: 'org-chart', label: 'View Org Chart', icon: Users, action: 'org-chart' },
    ],

    permissions: {
      ...IC_BASE_PERMISSIONS,
      canManageEmployees: true,
      canApproveTimeOff: true,
      canRunPayroll: true,
      canViewSalaries: true,
      canCreatePerformanceReviews: true,
      canViewAnalytics: true,
    },
  },

  // ===== EXECUTIVE ROLES =====

  admin: {
    role: 'admin',
    workspaceCategory: 'executive',
    label: 'System Administrator',
    description: 'System configuration, user management, and security',
    hierarchyLevel: 'director',
    dataScope: 'org',
    canViewSubordinates: false,
    subordinateRoles: [],

    dashboardSections: [
      {
        id: 'metrics',
        title: 'System Metrics',
        order: 0,
        visible: true,
        widgets: [
          {
            id: 'total-users',
            title: 'Total Users',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'adminMetrics', procedure: 'getTotalUsers' },
          },
          {
            id: 'active-sessions',
            title: 'Active Sessions',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'adminMetrics', procedure: 'getActiveSessions' },
          },
          {
            id: 'system-health',
            title: 'System Health',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'adminMetrics', procedure: 'getSystemHealth' },
          },
        ],
      },
      {
        id: 'users',
        title: 'User Management',
        order: 1,
        visible: true,
        widgets: [
          {
            id: 'pending-requests',
            title: 'Pending User Requests',
            type: 'list',
            gridSpan: 2,
            dataSource: { router: 'adminMetrics', procedure: 'getPendingUserRequests' },
          },
          {
            id: 'recent-logins',
            title: 'Recent Logins',
            type: 'list',
            gridSpan: 2,
            dataSource: { router: 'adminMetrics', procedure: 'getRecentLogins' },
          },
        ],
      },
      {
        id: 'audit',
        title: 'Audit & Security',
        order: 2,
        visible: true,
        widgets: [
          {
            id: 'audit-activity',
            title: 'Recent System Activity',
            type: 'list',
            gridSpan: 2,
            dataSource: { router: 'adminMetrics', procedure: 'getAuditActivity' },
          },
          {
            id: 'integration-status',
            title: 'Integration Status',
            type: 'list',
            gridSpan: 2,
            dataSource: { router: 'adminMetrics', procedure: 'getIntegrationStatus' },
          },
        ],
      },
    ],

    quickActions: [
      { id: 'create-user', label: 'Create User', icon: UserPlus, action: 'create-user' },
      { id: 'manage-permissions', label: 'Manage Permissions', icon: Shield, action: 'manage-permissions' },
      { id: 'view-audit-logs', label: 'View Audit Logs', icon: FileText, action: 'view-audit-logs' },
      { id: 'system-settings', label: 'System Settings', icon: Settings, action: 'system-settings' },
    ],

    permissions: {
      ...EXECUTIVE_BASE_PERMISSIONS,
      canManageRoles: true,
      canViewAuditLogs: true,
      canManageOrganization: true,
      canManageIntegrations: true,
    },
  },

  coo: {
    role: 'coo',
    workspaceCategory: 'executive',
    label: 'Chief Operating Officer',
    description: 'Operations efficiency and process optimization',
    hierarchyLevel: 'c_suite',
    dataScope: 'org',
    canViewSubordinates: true,
    subordinateRoles: ['recruiting_manager', 'bench_manager', 'ta_manager', 'hr'],

    dashboardSections: [
      {
        id: 'metrics',
        title: 'Operations KPIs',
        order: 0,
        visible: true,
        widgets: [
          {
            id: 'time-to-fill',
            title: 'Avg Time to Fill',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'dashboard', procedure: 'getTimeToFill' },
          },
          {
            id: 'fill-rate',
            title: 'Fill Rate',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'dashboard', procedure: 'getFillRate' },
          },
          {
            id: 'productivity',
            title: 'Productivity Index',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'dashboard', procedure: 'getProductivityIndex' },
          },
        ],
      },
      {
        id: 'pipeline',
        title: 'Company Pipeline',
        order: 1,
        visible: true,
        widgets: [
          {
            id: 'company-pipeline',
            title: 'Company Pipeline Health',
            type: 'pipeline',
            entityType: 'submission',
            gridSpan: 4,
            dataSource: { router: 'dashboard', procedure: 'getCompanyPipeline' },
          },
        ],
      },
      {
        id: 'efficiency',
        title: 'Process Efficiency',
        order: 2,
        visible: true,
        widgets: [
          {
            id: 'bottlenecks',
            title: 'Process Bottlenecks',
            type: 'chart',
            gridSpan: 2,
            dataSource: { router: 'dashboard', procedure: 'getProcessBottlenecks' },
          },
          {
            id: 'capacity',
            title: 'Capacity Utilization',
            type: 'chart',
            gridSpan: 2,
            dataSource: { router: 'dashboard', procedure: 'getCapacityUtilization' },
          },
        ],
      },
      {
        id: 'alerts',
        title: 'Operational Alerts',
        order: 3,
        visible: true,
        widgets: [
          {
            id: 'operational-alerts',
            title: 'Operational Alerts',
            type: 'list',
            gridSpan: 4,
            dataSource: { router: 'dashboard', procedure: 'getOperationalAlerts' },
          },
        ],
      },
    ],

    quickActions: [
      { id: 'process-review', label: 'Process Review', icon: Activity, action: 'process-review' },
      { id: 'capacity-planning', label: 'Capacity Planning', icon: Users, action: 'capacity-planning' },
      { id: 'sla-dashboard', label: 'SLA Dashboard', icon: Clock, action: 'sla-dashboard' },
      { id: 'export-ops', label: 'Export Ops Report', icon: FileSpreadsheet, action: 'export-ops' },
    ],

    permissions: {
      ...EXECUTIVE_BASE_PERMISSIONS,
      canViewTeamData: true,
    },
  },

  cfo: {
    role: 'cfo',
    workspaceCategory: 'executive',
    label: 'Chief Financial Officer',
    description: 'Financial metrics, revenue, and margins',
    hierarchyLevel: 'c_suite',
    dataScope: 'org',
    canViewSubordinates: false,
    subordinateRoles: [],

    dashboardSections: [
      {
        id: 'metrics',
        title: 'Financial KPIs',
        order: 0,
        visible: true,
        widgets: [
          {
            id: 'revenue-mtd',
            title: 'Revenue MTD',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'financeMetrics', procedure: 'getRevenueMTD' },
          },
          {
            id: 'gross-margin',
            title: 'Gross Margin',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'financeMetrics', procedure: 'getGrossMargin' },
          },
          {
            id: 'dso',
            title: 'DSO (Days Sales Outstanding)',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'financeMetrics', procedure: 'getDSO' },
          },
        ],
      },
      {
        id: 'revenue',
        title: 'Revenue Analysis',
        order: 1,
        visible: true,
        widgets: [
          {
            id: 'revenue-trend',
            title: 'Revenue vs Expenses',
            type: 'chart',
            gridSpan: 2,
            dataSource: { router: 'financeMetrics', procedure: 'getRevenueTrend' },
          },
          {
            id: 'revenue-by-client',
            title: 'Revenue by Client',
            type: 'chart',
            gridSpan: 2,
            dataSource: { router: 'financeMetrics', procedure: 'getRevenueByClient' },
          },
        ],
      },
      {
        id: 'ar',
        title: 'Accounts Receivable',
        order: 2,
        visible: true,
        widgets: [
          {
            id: 'outstanding-invoices',
            title: 'Outstanding Invoices',
            type: 'list',
            gridSpan: 2,
            dataSource: { router: 'financeMetrics', procedure: 'getOutstandingInvoices' },
          },
          {
            id: 'profitability',
            title: 'Profitability by Account',
            type: 'list',
            gridSpan: 2,
            dataSource: { router: 'financeMetrics', procedure: 'getProfitabilityByAccount' },
          },
        ],
      },
      {
        id: 'forecast',
        title: 'Cash Flow',
        order: 3,
        visible: true,
        widgets: [
          {
            id: 'cash-flow',
            title: 'Cash Flow Projection',
            type: 'chart',
            gridSpan: 4,
            dataSource: { router: 'financeMetrics', procedure: 'getCashFlowProjection' },
          },
        ],
      },
    ],

    quickActions: [
      { id: 'generate-pl', label: 'Generate P&L', icon: FileSpreadsheet, action: 'generate-pl' },
      { id: 'revenue-forecast', label: 'Revenue Forecast', icon: TrendingUp, action: 'revenue-forecast' },
      { id: 'margin-analysis', label: 'Margin Analysis', icon: PieChart, action: 'margin-analysis' },
      { id: 'ar-aging', label: 'AR Aging Report', icon: Clock, action: 'ar-aging' },
    ],

    permissions: {
      ...EXECUTIVE_BASE_PERMISSIONS,
      canViewFinancials: true,
      canApproveExpenses: true,
      canManageBudgets: true,
      canViewCosts: true,
      canViewSalaries: true,
    },
  },

  ceo: {
    role: 'ceo',
    workspaceCategory: 'executive',
    label: 'Chief Executive Officer',
    description: 'Strategic oversight and company-wide metrics',
    hierarchyLevel: 'c_suite',
    dataScope: 'org',
    canViewSubordinates: true,
    subordinateRoles: ['coo', 'cfo', 'admin'],

    dashboardSections: [
      {
        id: 'metrics',
        title: 'Company KPIs',
        order: 0,
        visible: true,
        widgets: [
          {
            id: 'revenue-ytd',
            title: 'Revenue YTD',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'financeMetrics', procedure: 'getRevenueYTD' },
          },
          {
            id: 'gross-margin',
            title: 'Gross Margin',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'financeMetrics', procedure: 'getGrossMargin' },
          },
          {
            id: 'placements-ytd',
            title: 'Placements YTD',
            type: 'metric',
            gridSpan: 1,
            dataSource: { router: 'dashboard', procedure: 'getPlacementsYTD' },
          },
        ],
      },
      {
        id: 'divisions',
        title: 'Division Performance',
        order: 1,
        visible: true,
        widgets: [
          {
            id: 'revenue-by-division',
            title: 'Revenue by Division',
            type: 'chart',
            gridSpan: 2,
            dataSource: { router: 'financeMetrics', procedure: 'getRevenueByDivision' },
          },
          {
            id: 'deal-pipeline',
            title: 'Deal Pipeline',
            type: 'pipeline',
            entityType: 'deal',
            gridSpan: 2,
            dataSource: { router: 'crm', procedure: 'getDealPipeline' },
          },
        ],
      },
      {
        id: 'performance',
        title: 'Pod Performance',
        order: 2,
        visible: true,
        widgets: [
          {
            id: 'pod-scoreboard',
            title: 'Pod Scoreboard',
            type: 'list',
            gridSpan: 2,
            dataSource: { router: 'dashboard', procedure: 'getPodScoreboard' },
          },
          {
            id: 'top-accounts',
            title: 'Top Accounts',
            type: 'list',
            entityType: 'account',
            gridSpan: 2,
            dataSource: { router: 'dashboard', procedure: 'getTopAccounts' },
          },
        ],
      },
      {
        id: 'insights',
        title: 'AI Insights',
        order: 3,
        visible: true,
        widgets: [
          {
            id: 'ai-insights',
            title: 'Strategic Recommendations',
            type: 'list',
            gridSpan: 4,
            dataSource: { router: 'dashboard', procedure: 'getAIInsights' },
          },
        ],
      },
    ],

    quickActions: [
      { id: 'board-report', label: 'Export Board Report', icon: FileSpreadsheet, action: 'board-report' },
      { id: 'view-forecast', label: 'View Forecast', icon: TrendingUp, action: 'view-forecast' },
      { id: 'announcement', label: 'Company Announcement', icon: Megaphone, action: 'announcement' },
    ],

    permissions: {
      ...EXECUTIVE_BASE_PERMISSIONS,
      canManageRoles: true,
      canViewAuditLogs: true,
      canManageOrganization: true,
      canManageIntegrations: true,
      canViewFinancials: true,
      canApproveExpenses: true,
      canManageBudgets: true,
      canViewCosts: true,
      canViewSalaries: true,
      canManageEmployees: true,
      canViewTeamData: true,
    },
  },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function getSpecificRoleConfig(role: SpecificRole): SpecificRoleConfig {
  return specificRoleConfigs[role];
}

export function getWorkspaceCategoryForRole(role: SpecificRole): WorkspaceRole {
  return specificRoleConfigs[role]?.workspaceCategory || 'recruiting';
}

export function getHierarchyLevel(role: SpecificRole): HierarchyLevel {
  return specificRoleConfigs[role]?.hierarchyLevel || 'ic';
}

export function getDataScope(role: SpecificRole): DataScope {
  return specificRoleConfigs[role]?.dataScope || 'own';
}

export function getDashboardSections(role: SpecificRole): WidgetSection[] {
  return specificRoleConfigs[role]?.dashboardSections || [];
}

export function getSpecificQuickActions(role: SpecificRole): QuickAction[] {
  return specificRoleConfigs[role]?.quickActions || [];
}

export function getSpecificPermissions(role: SpecificRole): ExtendedPermissions {
  return specificRoleConfigs[role]?.permissions || IC_BASE_PERMISSIONS;
}

export function hasSpecificPermission(
  role: SpecificRole,
  permission: keyof ExtendedPermissions
): boolean {
  return specificRoleConfigs[role]?.permissions[permission] ?? false;
}

export function getSubordinateRoles(role: SpecificRole): SpecificRole[] {
  return specificRoleConfigs[role]?.subordinateRoles || [];
}

export function canViewSubordinates(role: SpecificRole): boolean {
  return specificRoleConfigs[role]?.canViewSubordinates ?? false;
}
