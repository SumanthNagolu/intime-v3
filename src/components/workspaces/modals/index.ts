/**
 * Shared Workspace Modal Components
 *
 * Reusable modal dialogs used across all workspace types.
 */

export { DocumentUploadModal } from './DocumentUploadModal';
export { AttachEntityModal } from './AttachEntityModal';
export { WorkflowTransitionModal } from './WorkflowTransitionModal';
export { ConfirmDeleteModal } from './ConfirmDeleteModal';

// Re-export types
export type { DocumentUploadModalProps, UploadedFileMetadata } from './DocumentUploadModal';
export type { AttachEntityModalProps, SearchResultItem } from './AttachEntityModal';
export type { WorkflowTransitionModalProps, WorkflowTransition } from './WorkflowTransitionModal';
export type { ConfirmDeleteModalProps } from './ConfirmDeleteModal';
