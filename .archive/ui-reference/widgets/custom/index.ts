/**
 * Custom Widgets Index
 *
 * Registers all custom section widgets with the section widget registry.
 * These components are used for specialized UI that doesn't fit standard patterns.
 */

import { registerSectionWidget } from '../../registry/section-widget-registry';

// Import all custom widgets
import { PermissionsMatrix } from './PermissionsMatrix';
import { ResumeViewer } from './ResumeViewer';
import { DocumentRepository } from './DocumentRepository';
import { IntegrationCategoryGrid } from './IntegrationCategoryGrid';
import { FieldMappingEditor } from './FieldMappingEditor';
import { WebhookEventSelector } from './WebhookEventSelector';
import { DuplicateMergePreview } from './DuplicateMergePreview';
import { BusinessHoursEditor } from './BusinessHoursEditor';

// HR Components
import { HRAnalyticsDashboard } from './HRAnalyticsDashboard';
import { LearningAdminPanel } from './LearningAdminPanel';
import { RecruitmentWorkflow } from './RecruitmentWorkflow';

// Detail Components
import { InterviewerList } from './InterviewerList';
import { WorkHistoryTimeline } from './WorkHistoryTimeline';
import { CheckInProgressTracker } from './CheckInProgressTracker';

/**
 * Register all custom widgets
 * Call this on app initialization alongside registerDashboardWidgets()
 */
export function registerCustomWidgets(): void {
  // Core custom components
  registerSectionWidget('PermissionsMatrix', PermissionsMatrix);
  registerSectionWidget('ResumeViewer', ResumeViewer);
  registerSectionWidget('DocumentRepository', DocumentRepository);

  // Admin components
  registerSectionWidget('IntegrationCategoryGrid', IntegrationCategoryGrid);
  registerSectionWidget('FieldMappingEditor', FieldMappingEditor);
  registerSectionWidget('WebhookEventSelector', WebhookEventSelector);
  registerSectionWidget('DuplicateMergePreview', DuplicateMergePreview);
  registerSectionWidget('BusinessHoursEditor', BusinessHoursEditor);

  // HR components
  registerSectionWidget('HRAnalyticsDashboard', HRAnalyticsDashboard);
  registerSectionWidget('LearningAdminPanel', LearningAdminPanel);
  registerSectionWidget('RecruitmentWorkflow', RecruitmentWorkflow);

  // Detail components
  registerSectionWidget('InterviewerList', InterviewerList);
  registerSectionWidget('WorkHistoryTimeline', WorkHistoryTimeline);
  registerSectionWidget('CheckInProgressTracker', CheckInProgressTracker);
}

// Export individual widgets for direct use
export { PermissionsMatrix } from './PermissionsMatrix';
export { ResumeViewer } from './ResumeViewer';
export { DocumentRepository } from './DocumentRepository';
export { IntegrationCategoryGrid } from './IntegrationCategoryGrid';
export { FieldMappingEditor } from './FieldMappingEditor';
export { WebhookEventSelector } from './WebhookEventSelector';
export { DuplicateMergePreview } from './DuplicateMergePreview';
export { BusinessHoursEditor } from './BusinessHoursEditor';

// HR Components
export { HRAnalyticsDashboard } from './HRAnalyticsDashboard';
export { LearningAdminPanel } from './LearningAdminPanel';
export { RecruitmentWorkflow } from './RecruitmentWorkflow';

// Detail Components
export { InterviewerList } from './InterviewerList';
export { WorkHistoryTimeline } from './WorkHistoryTimeline';
export { CheckInProgressTracker } from './CheckInProgressTracker';
