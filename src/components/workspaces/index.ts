/**
 * Unified Workspaces - Central Export
 *
 * All workspace components for the unified architecture.
 *
 * NEW MODULAR ARCHITECTURE (v2):
 * - tabs/      - Shared tab components (Activity, Documents, Tasks, etc.)
 * - sections/  - Reusable UI sections (InfoCard, MetricsGrid, etc.)
 * - modals/    - Shared modal dialogs (Upload, Attach, Workflow, etc.)
 * - entity/    - Entity-specific content components (Job, Talent, Submission)
 * - composers/ - High-level workspace composers (GenericEntityWorkspace)
 */

// =====================================================
// BASE COMPONENTS (Legacy)
// =====================================================
export * from './base';

// Hooks
export * from './hooks';

// CRM Workspaces
export { LeadsWorkspace } from './LeadsWorkspace';
export { DealsWorkspace } from './DealsWorkspace';
export { AccountsWorkspace } from './AccountsWorkspace';
export { ContactsWorkspace } from './ContactsWorkspace';

// ATS Workspaces
export { JobsWorkspace } from './JobsWorkspace';
export { SubmissionsWorkspace } from './SubmissionsWorkspace';
export { TalentWorkspace } from './TalentWorkspace';

// Staffing Workspaces
export { JobOrdersWorkspace } from './JobOrdersWorkspace';

// TA Workspaces
export { CampaignsWorkspace } from './CampaignsWorkspace';

// =====================================================
// NEW MODULAR TABS (v2)
// =====================================================
// Note: StatItem is already exported from './base', so we exclude it here
export {
  ActivityTab,
  DocumentsTab,
  TasksTab,
  PipelineTab,
  OverviewTab,
} from './tabs';
export type {
  ActivityTabProps,
  DocumentsTabProps,
  DocumentCategory,
  TasksTabProps,
  Task,
  PipelineTabProps,
  PipelineStage,
  OverviewTabProps,
  OverviewSection,
  // StatItem - excluded (already in ./base)
} from './tabs';

// =====================================================
// NEW MODULAR SECTIONS (v2)
// =====================================================
// Note: RelatedObject is already exported from './base', so we exclude it here
export {
  InfoCard,
  MetricsGrid,
  StatusBadge,
  QuickActionsBar,
  RelatedObjectsList,
} from './sections';
export type {
  InfoCardProps,
  InfoCardField,
  MetricsGridProps,
  MetricItem,
  StatusBadgeProps,
  QuickActionsBarProps,
  QuickActionItem,
  RelatedObjectsListProps,
  // RelatedObject - excluded (already in ./base)
} from './sections';

// =====================================================
// NEW MODULAR MODALS (v2)
// =====================================================
export * from './modals';

// =====================================================
// NEW ENTITY CONTENT COMPONENTS (v2)
// =====================================================
export * from './entity';

// =====================================================
// NEW WORKSPACE COMPOSERS (v2)
// =====================================================
// Note: WorkspaceTab and WorkspaceAction are already exported from './base', so we exclude them here
export {
  GenericEntityWorkspace,
  DEFAULT_TABS,
  getTabsForEntity,
  buildWorkspaceTabs,
  buildJobTabs,
  buildTalentTabs,
  buildSubmissionTabs,
} from './composers';
export type {
  GenericEntityWorkspaceProps,
  // WorkspaceTab - excluded (already in ./base)
  // WorkspaceAction - excluded (already in ./base)
  TabDefinition,
  TabConfig,
  JobTabsContentMap,
  TalentTabsContentMap,
  SubmissionTabsContentMap,
} from './composers';

// =====================================================
// UNIFIED WORKSPACES (v2 Complete Modular)
// =====================================================
export * from './unified';

// =====================================================
// WORKSPACE TYPE MAPPING
// =====================================================
export const WORKSPACE_COMPONENTS = {
  lead: 'LeadsWorkspace',
  deal: 'DealsWorkspace',
  account: 'AccountsWorkspace',
  contact: 'ContactsWorkspace',
  job: 'JobsWorkspace',
  submission: 'SubmissionsWorkspace',
  talent: 'TalentWorkspace',
  job_order: 'JobOrdersWorkspace',
  campaign: 'CampaignsWorkspace',
} as const;

export type WorkspaceType = keyof typeof WORKSPACE_COMPONENTS;
