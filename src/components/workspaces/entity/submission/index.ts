/**
 * Submission Entity Content Components
 *
 * Modular components for Submission workspace content.
 * These compose shared tabs and sections for submission-specific views.
 */

export { SubmissionOverviewContent } from './SubmissionOverviewContent';
export { SubmissionWorkflowBar } from './SubmissionWorkflowBar';
export { SubmissionSidebarContent } from './SubmissionSidebarContent';
export { SubmissionInterviewsContent } from './SubmissionInterviewsContent';

// Re-export types
export type {
  SubmissionOverviewContentProps,
  SubmissionData,
} from './SubmissionOverviewContent';
export type {
  SubmissionWorkflowBarProps,
  WorkflowAction,
} from './SubmissionWorkflowBar';
export type { SubmissionSidebarContentProps } from './SubmissionSidebarContent';
export type { SubmissionInterviewsContentProps, Interview } from './SubmissionInterviewsContent';
