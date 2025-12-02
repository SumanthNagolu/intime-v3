// Base Components
export { Modal, type ModalProps } from "./Modal";
export { Drawer, type DrawerProps } from "./Drawer";
export { ConfirmDialog, type ConfirmDialogProps } from "./ConfirmDialog";
export { AlertDialog, type AlertDialogProps } from "./AlertDialog";

// Provider & Context
export {
  ModalProvider,
  ModalStackProvider,
  useModalStack,
  ConfirmProvider,
} from "./ModalProvider";

// Hooks
export {
  useModal,
  useModalWithData,
  useWizardModal,
  useEntityDrawer,
  useDrawerWithTabs,
  useUrlSyncedDrawer,
  useConfirm,
} from "./hooks";

// Form Modals
export {
  QuickCreateModal,
  type QuickCreateModalProps,
  EditModal,
  type EditModalProps,
  BulkEditModal,
  type BulkEditModalProps,
} from "./forms";

// Recruiting Modals
export {
  SubmitCandidateModal,
  type SubmitCandidateModalProps,
  ScheduleInterviewModal,
  type ScheduleInterviewModalProps,
  StatusChangeModal,
  type StatusChangeModalProps,
  RescheduleModal,
  type RescheduleModalProps,
  InterviewFeedbackModal,
  type InterviewFeedbackModalProps,
} from "./recruiting";

// Bench Sales Modals
export {
  AddToHotlistModal,
  type AddToHotlistModalProps,
  VendorOnboardingWizard,
  type VendorOnboardingWizardProps,
  ImmigrationCaseModal,
  type ImmigrationCaseModalProps,
} from "./bench";

// CRM Modals
export {
  ConvertLeadModal,
  type ConvertLeadModalProps,
  DealStageChangeModal,
  type DealStageChangeModalProps,
  MergeRecordsModal,
  type MergeRecordsModalProps,
} from "./crm";

// HR Modals
export {
  EmployeeOnboardingWizard,
  type EmployeeOnboardingWizardProps,
  TimesheetApprovalModal,
  type TimesheetApprovalModalProps,
  PTORequestModal,
  type PTORequestModalProps,
  PerformanceReviewModal,
  type PerformanceReviewModalProps,
} from "./hr";

// Detail Drawers
export {
  EntityDrawerBase,
  type EntityDrawerBaseProps,
  type EntityTab,
  type EntityAction,
  JobDrawer,
  type JobDrawerProps,
  CandidateDrawer,
  type CandidateDrawerProps,
  AccountDrawer,
  type AccountDrawerProps,
  ConsultantDrawer,
  type ConsultantDrawerProps,
} from "./drawers";

// Specialized Modals
export {
  CommandBarModal,
  type CommandBarModalProps,
  EmailComposeModal,
  type EmailComposeModalProps,
  PreviewModal,
  type PreviewModalProps,
} from "./specialized";
