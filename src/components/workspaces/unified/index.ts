/**
 * Unified Workspace Components
 *
 * Export all unified workspace components for easy importing.
 */

// Core layout components
export {
  MasterDetailLayout,
  MasterList,
  MasterResizeHandle,
  MasterDetail,
  useMasterDetail,
  type MasterDetailLayoutProps,
  type MasterListProps,
  type MasterDetailProps,
  type MasterDetailContextValue,
} from './MasterDetailLayout';

// Virtualized list component
export {
  VirtualizedEntityList,
  type VirtualizedEntityListProps,
  type FilterConfig,
  type FilterOption,
  type EntityListItem,
} from './VirtualizedEntityList';

// Slide panel component
export {
  SlidePanelProvider,
  SlidePanelTrigger,
  useSlidePanel,
  type SlidePanelProviderProps,
  type SlidePanelTriggerProps,
  type SlidePanelItem,
  type SlidePanelContextValue,
} from './SlidePanel';

// Entity graph view component
export {
  EntityGraphView,
  MiniGraph,
  type EntityGraphViewProps,
  type MiniGraphProps,
  type GraphEntity,
  type GraphRelationship,
} from './EntityGraphView';

// =====================================================
// UNIFIED ENTITY WORKSPACES (v2 Modular Architecture)
// =====================================================

// Unified Job Workspace - modular job workspace using composers
export { UnifiedJobWorkspace } from './UnifiedJobWorkspace';

// Unified Talent Workspace - modular talent/candidate workspace
export { UnifiedTalentWorkspace } from './UnifiedTalentWorkspace';

// Unified Submission Workspace - modular submission workflow workspace
export { UnifiedSubmissionWorkspace } from './UnifiedSubmissionWorkspace';
