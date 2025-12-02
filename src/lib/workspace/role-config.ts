/**
 * Role Configuration
 *
 * Defines role-specific defaults and permissions for the unified workspace.
 * Each role has different default views, visible entities, and quick actions.
 */

import type { EntityType } from './entity-registry';
import type { ViewMode } from '@/stores/workspace-store';
import type { LucideIcon } from 'lucide-react';
import {
  UserPlus,
  Send,
  Calendar,
  Briefcase,
  Target,
  Star,
  FileText,
  Users,
} from 'lucide-react';

// =====================================================
// TYPES
// =====================================================

export type WorkspaceRole =
  | 'recruiting'  // ATS Recruiter
  | 'bench'       // Bench Sales
  | 'ta'          // Talent Acquisition / Business Development
  | 'manager'     // Hiring Manager / Team Lead
  | 'executive';  // Executive / C-Suite

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  action: string;
  entityTypes?: EntityType[];  // Which entity pages show this action
  shortcut?: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'list' | 'chart' | 'pipeline';
  entityType?: EntityType;
  config?: Record<string, unknown>;
}

export interface TabConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface RoleConfig {
  role: WorkspaceRole;
  label: string;
  description: string;

  // Default workspace view
  defaultEntityType: EntityType;
  defaultViewMode: ViewMode;

  // Visible entities in navigation
  visibleEntities: EntityType[];

  // Default tabs per entity type
  defaultTabs: Partial<Record<EntityType, TabConfig[]>>;

  // Quick actions available
  quickActions: QuickAction[];

  // Dashboard widgets
  dashboardWidgets: DashboardWidget[];

  // Permissions
  permissions: {
    canCreateLeads: boolean;
    canCreateAccounts: boolean;
    canCreateDeals: boolean;
    canCreateJobs: boolean;
    canCreateSubmissions: boolean;
    canApproveSubmissions: boolean;
    canViewAnalytics: boolean;
    canExport: boolean;
  };
}

// =====================================================
// COMMON TAB CONFIGS
// =====================================================

const COMMON_TABS = {
  overview: { id: 'overview', label: 'Overview', visible: true, order: 0 },
  activity: { id: 'activity', label: 'Activity', visible: true, order: 90 },
  documents: { id: 'documents', label: 'Documents', visible: true, order: 95 },
  graph: { id: 'graph', label: 'Relationships', visible: true, order: 99 },
};

const JOB_TABS: TabConfig[] = [
  COMMON_TABS.overview,
  { id: 'pipeline', label: 'Pipeline', visible: true, order: 10 },
  { id: 'submissions', label: 'Submissions', visible: true, order: 20 },
  { id: 'interviews', label: 'Interviews', visible: true, order: 30 },
  { id: 'offers', label: 'Offers', visible: true, order: 40 },
  COMMON_TABS.activity,
  COMMON_TABS.documents,
  COMMON_TABS.graph,
];

const TALENT_TABS: TabConfig[] = [
  COMMON_TABS.overview,
  { id: 'personal', label: 'Personal', visible: true, order: 5 },
  { id: 'contact', label: 'Contact', visible: true, order: 10 },
  { id: 'professional', label: 'Professional', visible: true, order: 15 },
  { id: 'experience', label: 'Experience', visible: true, order: 20 },
  { id: 'education', label: 'Education', visible: true, order: 25 },
  { id: 'skills', label: 'Skills', visible: true, order: 30 },
  { id: 'certifications', label: 'Certifications', visible: true, order: 35 },
  { id: 'workauth', label: 'Work Auth', visible: true, order: 40 },
  { id: 'addresses', label: 'Addresses', visible: true, order: 45 },
  { id: 'references', label: 'References', visible: true, order: 50 },
  { id: 'compliance', label: 'Compliance', visible: true, order: 55 },
  { id: 'resumes', label: 'Resumes', visible: true, order: 60 },
  { id: 'compensation', label: 'Compensation', visible: true, order: 65 },
  { id: 'source', label: 'Source', visible: true, order: 70 },
  { id: 'submissions', label: 'Submissions', visible: true, order: 75 },
  COMMON_TABS.activity,
  COMMON_TABS.documents,
  COMMON_TABS.graph,
];

const SUBMISSION_TABS: TabConfig[] = [
  COMMON_TABS.overview,
  { id: 'candidate', label: 'Candidate', visible: true, order: 10 },
  { id: 'job', label: 'Job', visible: true, order: 15 },
  { id: 'interviews', label: 'Interviews', visible: true, order: 20 },
  { id: 'offers', label: 'Offers', visible: true, order: 30 },
  { id: 'workflow', label: 'Workflow', visible: true, order: 40 },
  COMMON_TABS.activity,
  COMMON_TABS.documents,
];

const LEAD_TABS: TabConfig[] = [
  COMMON_TABS.overview,
  { id: 'qualification', label: 'BANT', visible: true, order: 10 },
  { id: 'engagement', label: 'Engagement', visible: true, order: 20 },
  { id: 'strategy', label: 'Strategy', visible: true, order: 30 },
  COMMON_TABS.activity,
  COMMON_TABS.documents,
  COMMON_TABS.graph,
];

const ACCOUNT_TABS: TabConfig[] = [
  COMMON_TABS.overview,
  { id: 'contacts', label: 'Contacts', visible: true, order: 10 },
  { id: 'jobs', label: 'Jobs', visible: true, order: 20 },
  { id: 'deals', label: 'Deals', visible: true, order: 30 },
  { id: 'submissions', label: 'Submissions', visible: true, order: 40 },
  { id: 'placements', label: 'Placements', visible: true, order: 50 },
  COMMON_TABS.activity,
  COMMON_TABS.documents,
  COMMON_TABS.graph,
];

const DEAL_TABS: TabConfig[] = [
  COMMON_TABS.overview,
  { id: 'pipeline', label: 'Pipeline', visible: true, order: 10 },
  { id: 'contacts', label: 'Contacts', visible: true, order: 20 },
  { id: 'jobs', label: 'Jobs', visible: true, order: 30 },
  { id: 'financials', label: 'Financials', visible: true, order: 40 },
  COMMON_TABS.activity,
  COMMON_TABS.documents,
  COMMON_TABS.graph,
];

// =====================================================
// ROLE CONFIGURATIONS
// =====================================================

export const roleConfigs: Record<WorkspaceRole, RoleConfig> = {
  recruiting: {
    role: 'recruiting',
    label: 'ATS Recruiter',
    description: 'Full-cycle recruiting with job and candidate management',

    defaultEntityType: 'job',
    defaultViewMode: 'kanban',

    visibleEntities: ['lead', 'account', 'deal', 'job', 'talent', 'submission'],

    defaultTabs: {
      job: JOB_TABS,
      talent: TALENT_TABS,
      submission: SUBMISSION_TABS,
      lead: LEAD_TABS,
      account: ACCOUNT_TABS,
      deal: DEAL_TABS,
      contact: [],
      job_order: [],
    } as Partial<Record<EntityType, TabConfig[]>>,

    quickActions: [
      { id: 'source-talent', label: 'Source Talent', icon: UserPlus, action: 'source-talent', entityTypes: ['job'] },
      { id: 'create-submission', label: 'Submit Candidate', icon: Send, action: 'create-submission', entityTypes: ['job', 'talent'], shortcut: 'cmd+shift+s' },
      { id: 'schedule-interview', label: 'Schedule Interview', icon: Calendar, action: 'schedule-interview', entityTypes: ['submission'] },
      { id: 'post-job', label: 'Post Job', icon: Briefcase, action: 'post-job', shortcut: 'cmd+shift+j' },
    ],

    dashboardWidgets: [
      { id: 'open-jobs', title: 'Open Jobs', type: 'metric', entityType: 'job' },
      { id: 'pipeline-summary', title: 'Pipeline', type: 'pipeline', entityType: 'submission' },
      { id: 'pending-submissions', title: 'Pending Submissions', type: 'list', entityType: 'submission' },
      { id: 'interviews-today', title: 'Today\'s Interviews', type: 'list', entityType: 'submission' },
    ],

    permissions: {
      canCreateLeads: true,
      canCreateAccounts: true,
      canCreateDeals: true,
      canCreateJobs: true,
      canCreateSubmissions: true,
      canApproveSubmissions: false,
      canViewAnalytics: true,
      canExport: true,
    },
  },

  bench: {
    role: 'bench',
    label: 'Bench Sales',
    description: 'Consultant marketing and job order fulfillment',

    defaultEntityType: 'talent',
    defaultViewMode: 'list',

    visibleEntities: ['account', 'job_order', 'talent', 'submission'],

    defaultTabs: {
      job: JOB_TABS,
      talent: [
        ...TALENT_TABS.filter(t => ['overview', 'professional', 'skills', 'workauth', 'resumes', 'compensation', 'activity'].includes(t.id)),
        { id: 'availability', label: 'Availability', visible: true, order: 8 },
        { id: 'hotlist', label: 'Hotlist', visible: true, order: 9 },
      ],
      submission: SUBMISSION_TABS,
      lead: LEAD_TABS,
      account: ACCOUNT_TABS,
      deal: DEAL_TABS,
      contact: [],
      job_order: JOB_TABS,
    } as Partial<Record<EntityType, TabConfig[]>>,

    quickActions: [
      { id: 'submit-to-order', label: 'Submit to Job Order', icon: Send, action: 'submit-to-order', entityTypes: ['talent'] },
      { id: 'add-hotlist', label: 'Add to Hotlist', icon: Star, action: 'add-hotlist', entityTypes: ['talent'] },
      { id: 'send-marketing', label: 'Send Marketing', icon: FileText, action: 'send-marketing', entityTypes: ['talent'] },
    ],

    dashboardWidgets: [
      { id: 'available-talent', title: 'Available Talent', type: 'metric', entityType: 'talent' },
      { id: 'hotlist', title: 'Hotlist', type: 'list', entityType: 'talent' },
      { id: 'active-job-orders', title: 'Active Job Orders', type: 'list', entityType: 'job_order' },
      { id: 'pending-submissions', title: 'Pending Submissions', type: 'list', entityType: 'submission' },
    ],

    permissions: {
      canCreateLeads: false,
      canCreateAccounts: false,
      canCreateDeals: false,
      canCreateJobs: false,
      canCreateSubmissions: true,
      canApproveSubmissions: false,
      canViewAnalytics: true,
      canExport: true,
    },
  },

  ta: {
    role: 'ta',
    label: 'TA / BD',
    description: 'Business development and lead generation',

    defaultEntityType: 'lead',
    defaultViewMode: 'kanban',

    visibleEntities: ['lead', 'account', 'deal', 'job', 'contact'],

    defaultTabs: {
      job: JOB_TABS.filter(t => !['submissions', 'interviews', 'offers'].includes(t.id)),
      talent: [],
      submission: [],
      lead: LEAD_TABS,
      account: ACCOUNT_TABS,
      deal: DEAL_TABS,
      contact: [],
      job_order: [],
    } as Partial<Record<EntityType, TabConfig[]>>,

    quickActions: [
      { id: 'create-lead', label: 'New Lead', icon: Target, action: 'create-lead', shortcut: 'cmd+shift+l' },
      { id: 'qualify-lead', label: 'Qualify Lead', icon: Target, action: 'qualify-lead', entityTypes: ['lead'] },
      { id: 'create-deal', label: 'Create Deal', icon: FileText, action: 'create-deal', entityTypes: ['lead', 'account'] },
    ],

    dashboardWidgets: [
      { id: 'new-leads', title: 'New Leads', type: 'metric', entityType: 'lead' },
      { id: 'lead-pipeline', title: 'Lead Pipeline', type: 'pipeline', entityType: 'lead' },
      { id: 'deal-pipeline', title: 'Deal Pipeline', type: 'pipeline', entityType: 'deal' },
      { id: 'conversion-rate', title: 'Conversion Rate', type: 'chart' },
    ],

    permissions: {
      canCreateLeads: true,
      canCreateAccounts: true,
      canCreateDeals: true,
      canCreateJobs: true,
      canCreateSubmissions: false,
      canApproveSubmissions: false,
      canViewAnalytics: true,
      canExport: true,
    },
  },

  manager: {
    role: 'manager',
    label: 'Manager',
    description: 'Team oversight and submission approvals',

    defaultEntityType: 'submission',
    defaultViewMode: 'kanban',

    visibleEntities: ['account', 'deal', 'job', 'talent', 'submission'],

    defaultTabs: {
      job: JOB_TABS,
      talent: TALENT_TABS,
      submission: [
        ...SUBMISSION_TABS,
        { id: 'approval', label: 'Approval', visible: true, order: 25 },
      ],
      lead: LEAD_TABS,
      account: ACCOUNT_TABS,
      deal: DEAL_TABS,
      contact: [],
      job_order: [],
    } as Partial<Record<EntityType, TabConfig[]>>,

    quickActions: [
      { id: 'approve-submission', label: 'Approve', icon: Send, action: 'approve-submission', entityTypes: ['submission'] },
      { id: 'assign-recruiter', label: 'Assign Recruiter', icon: Users, action: 'assign-recruiter', entityTypes: ['job'] },
      { id: 'view-analytics', label: 'View Analytics', icon: FileText, action: 'view-analytics' },
    ],

    dashboardWidgets: [
      { id: 'pending-approvals', title: 'Pending Approvals', type: 'list', entityType: 'submission' },
      { id: 'team-metrics', title: 'Team Metrics', type: 'chart' },
      { id: 'active-jobs', title: 'Active Jobs', type: 'metric', entityType: 'job' },
      { id: 'placements-mtd', title: 'Placements MTD', type: 'metric', entityType: 'submission' },
    ],

    permissions: {
      canCreateLeads: true,
      canCreateAccounts: true,
      canCreateDeals: true,
      canCreateJobs: true,
      canCreateSubmissions: true,
      canApproveSubmissions: true,
      canViewAnalytics: true,
      canExport: true,
    },
  },

  executive: {
    role: 'executive',
    label: 'Executive',
    description: 'High-level overview and strategic insights',

    defaultEntityType: 'deal',
    defaultViewMode: 'kanban',

    visibleEntities: ['account', 'deal', 'job', 'submission'],

    defaultTabs: {
      job: JOB_TABS.filter(t => ['overview', 'pipeline', 'activity'].includes(t.id)),
      talent: [],
      submission: SUBMISSION_TABS.filter(t => ['overview', 'workflow', 'activity'].includes(t.id)),
      lead: LEAD_TABS.filter(t => ['overview', 'qualification', 'activity'].includes(t.id)),
      account: ACCOUNT_TABS,
      deal: [
        ...DEAL_TABS,
        { id: 'forecast', label: 'Forecast', visible: true, order: 45 },
      ],
      contact: [],
      job_order: [],
    } as Partial<Record<EntityType, TabConfig[]>>,

    quickActions: [
      { id: 'view-analytics', label: 'Analytics', icon: FileText, action: 'view-analytics' },
      { id: 'export-report', label: 'Export Report', icon: FileText, action: 'export-report' },
    ],

    dashboardWidgets: [
      { id: 'revenue-mtd', title: 'Revenue MTD', type: 'metric' },
      { id: 'deal-pipeline', title: 'Deal Pipeline', type: 'pipeline', entityType: 'deal' },
      { id: 'placements-trend', title: 'Placements Trend', type: 'chart' },
      { id: 'top-accounts', title: 'Top Accounts', type: 'list', entityType: 'account' },
    ],

    permissions: {
      canCreateLeads: false,
      canCreateAccounts: false,
      canCreateDeals: false,
      canCreateJobs: false,
      canCreateSubmissions: false,
      canApproveSubmissions: true,
      canViewAnalytics: true,
      canExport: true,
    },
  },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function getRoleConfig(role: WorkspaceRole): RoleConfig {
  return roleConfigs[role];
}

export function getVisibleEntities(role: WorkspaceRole): EntityType[] {
  return roleConfigs[role]?.visibleEntities || [];
}

export function getDefaultTabs(role: WorkspaceRole, entityType: EntityType): TabConfig[] {
  return roleConfigs[role]?.defaultTabs[entityType] || [];
}

export function getQuickActions(role: WorkspaceRole, entityType?: EntityType): QuickAction[] {
  const config = roleConfigs[role];
  if (!config) return [];

  if (entityType) {
    return config.quickActions.filter(
      (action) => !action.entityTypes || action.entityTypes.includes(entityType)
    );
  }

  return config.quickActions;
}

export function getDashboardWidgets(role: WorkspaceRole): DashboardWidget[] {
  return roleConfigs[role]?.dashboardWidgets || [];
}

export function hasPermission(
  role: WorkspaceRole,
  permission: keyof RoleConfig['permissions']
): boolean {
  return roleConfigs[role]?.permissions[permission] ?? false;
}
