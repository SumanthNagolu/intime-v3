// PCF - Page Configuration Framework
// Configuration-driven UI components for entity management

// List View Components
export {
  EntityListView,
  ListHeader,
  ListStats,
  ListFilters,
  ListTable,
  ListCards,
  ListPagination,
} from './list-view'

// Detail View Components
export {
  EntityDetailView,
  DetailHeader,
  DetailMetrics,
  DetailSections,
  DetailJourney,
} from './detail-view'

// Dashboard View Components
export {
  DashboardView,
  DashboardHeader,
  DashboardMetrics,
  DashboardGrid,
  DashboardWidget,
  DashboardViewSkeleton,
} from './dashboard-view'
export type {
  DashboardViewConfig,
  DashboardMetricConfig,
  DashboardWidgetConfig,
} from './dashboard-view'

// Workspace View Components
export {
  WorkspaceView,
  WorkspaceTabs,
  WorkspaceTable,
  WorkspaceSummary,
  WorkspaceViewSkeleton,
} from './workspace-view'
export type {
  WorkspaceViewConfig,
  WorkspaceTabConfig,
  WorkspaceSummaryConfig,
} from './workspace-view'

// Builder View Components
export {
  BuilderView,
  BuilderCanvas,
  BuilderToolbar,
  BuilderSidebar,
  BuilderNode,
  BuilderViewSkeleton,
} from './builder-view'
export type {
  BuilderViewConfig,
  BuilderNodeConfig,
  BuilderToolConfig,
} from './builder-view'

// Library View Components
export {
  LibraryView,
  LibraryHeader,
  LibraryGrid,
  LibraryCard,
  LibraryPreview,
  LibraryViewSkeleton,
} from './library-view'
export type {
  LibraryViewConfig,
  LibraryItemConfig,
  LibraryFilterConfig,
} from './library-view'

// Wizard Components
export {
  EntityWizard,
  WizardProgress,
  WizardStep,
  WizardNavigation,
  WizardReview,
} from './wizard'

// Form Components
export {
  EntityForm,
  FormSection,
  FormActions,
  FormFieldRenderer,
} from './form'

// Shared Components
export {
  StatusBadge,
  EmptyState,
  QuickActionBar,
  EntityListViewSkeleton,
  EntityDetailViewSkeleton,
  EntityWizardSkeleton,
  EntityFormSkeleton,
} from './shared'

// Polymorphic Section Components
export {
  ActivitiesSection,
  DocumentsSection,
  NotesSection,
} from './sections'

// Sidebar Components
export {
  EntitySidebar,
  SidebarHeader,
  SidebarSections,
  SidebarJourney,
  SidebarActions,
} from './sidebar'
export type {
  EntitySidebarConfig,
  SidebarSectionConfig,
  SidebarActionConfig,
} from './sidebar'
