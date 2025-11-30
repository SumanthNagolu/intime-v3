/**
 * Shared Workspace Tab Components
 *
 * Entity-agnostic tab components used across all workspace types.
 * Each tab accepts standardized props and uses the entity-registry for configuration.
 */

export { ActivityTab } from './ActivityTab';
export { DocumentsTab } from './DocumentsTab';
export { TasksTab } from './TasksTab';
export { PipelineTab } from './PipelineTab';
export { OverviewTab } from './OverviewTab';

// Re-export types
export type { ActivityTabProps } from './ActivityTab';
export type { DocumentsTabProps, DocumentCategory } from './DocumentsTab';
export type { TasksTabProps, Task } from './TasksTab';
export type { PipelineTabProps, PipelineStage } from './PipelineTab';
export type { OverviewTabProps, OverviewSection, StatItem } from './OverviewTab';
