'use client'

/**
 * Lazy-loaded dialogs for code splitting
 *
 * These dialogs are heavy components that should only be loaded when needed.
 * Import from this file to ensure proper code splitting.
 *
 * Usage:
 * import { LazyCreateJobDialog, LazyScheduleInterviewDialog } from '@/components/lazy-dialogs'
 */

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

// Loading placeholder for dialogs
function DialogLoadingFallback() {
  return (
    <Dialog open>
      <DialogContent className="sm:max-w-[600px]">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-charcoal-400" />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Loading placeholder for large dialogs/wizards
function WizardLoadingFallback() {
  return (
    <Dialog open>
      <DialogContent className="sm:max-w-[700px]">
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-charcoal-400" />
          <p className="text-charcoal-500 text-sm">Loading wizard...</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==============================================
// JOB DIALOGS
// ==============================================

// Job creation wizard is now at: /employee/recruiting/jobs/new

export const LazyCloseJobWizard = dynamic(
  () => import('./recruiting/jobs/CloseJobWizard').then((mod) => mod.CloseJobWizard),
  { loading: () => <WizardLoadingFallback />, ssr: false }
)

export const LazyAddToPipelineDialog = dynamic(
  () => import('./recruiting/jobs/AddToPipelineDialog').then((mod) => mod.AddToPipelineDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

// ==============================================
// INTERVIEW DIALOGS
// ==============================================

export const LazyScheduleInterviewDialog = dynamic(
  () => import('./recruiting/interviews/ScheduleInterviewDialog').then((mod) => mod.ScheduleInterviewDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

export const LazyRecordFeedbackDialog = dynamic(
  () => import('./recruiting/submissions/RecordFeedbackDialog').then((mod) => mod.RecordFeedbackDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

export const LazyInterviewFeedbackDialog = dynamic(
  () => import('./recruiting/interviews/InterviewFeedbackDialog').then((mod) => mod.InterviewFeedbackDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

// ==============================================
// SUBMISSION DIALOGS
// ==============================================

export const LazySubmitToClientDialog = dynamic(
  () => import('./recruiting/submissions/SubmitToClientDialog').then((mod) => mod.SubmitToClientDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

// ==============================================
// ACCOUNT DIALOGS
// ==============================================

// OnboardingWizardDialog has been migrated to a dedicated page:
// /employee/recruiting/accounts/[id]/onboarding

export const LazyCreateAccountDialog = dynamic(
  () => import('./recruiting/accounts/CreateAccountDialog').then((mod) => mod.CreateAccountDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

export const LazyEditMeetingDialog = dynamic(
  () => import('./recruiting/accounts/EditMeetingDialog').then((mod) => mod.EditMeetingDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

export const LazyCreateEscalationDialog = dynamic(
  () => import('./recruiting/accounts/CreateEscalationDialog').then((mod) => mod.CreateEscalationDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

export const LazyEditEscalationDialog = dynamic(
  () => import('./recruiting/accounts/EditEscalationDialog').then((mod) => mod.EditEscalationDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

// ==============================================
// PLACEMENT DIALOGS
// ==============================================

export const LazyConfirmPlacementWizard = dynamic(
  () => import('./recruiting/placements/ConfirmPlacementWizard').then((mod) => mod.ConfirmPlacementWizard),
  { loading: () => <WizardLoadingFallback />, ssr: false }
)

export const LazyExtendPlacementDialog = dynamic(
  () => import('./recruiting/placements/ExtendPlacementDialog').then((mod) => mod.ExtendPlacementDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

export const LazyTerminatePlacementDialog = dynamic(
  () => import('./recruiting/placements/TerminatePlacementDialog').then((mod) => mod.TerminatePlacementDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

export const LazyCheckInDialog = dynamic(
  () => import('./recruiting/placements/CheckInDialog').then((mod) => mod.CheckInDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

// ==============================================
// CANDIDATE DIALOGS
// ==============================================

export const LazyScreeningRoom = dynamic(
  () => import('./recruiting/candidates/ScreeningRoom').then((mod) => mod.ScreeningRoom),
  { loading: () => <WizardLoadingFallback />, ssr: false }
)

export const LazyProfileBuilder = dynamic(
  () => import('./recruiting/candidates/ProfileBuilder').then((mod) => mod.ProfileBuilder),
  { loading: () => <WizardLoadingFallback />, ssr: false }
)

export const LazyAddToHotlistDialog = dynamic(
  () => import('./recruiting/hotlists/AddToHotlistDialog').then((mod) => mod.AddToHotlistDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

// ==============================================
// OFFER DIALOGS
// ==============================================

export const LazyExtendOfferDialog = dynamic(
  () => import('./recruiting/offers/ExtendOfferDialog').then((mod) => mod.ExtendOfferDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

// ==============================================
// ADMIN DIALOGS
// ==============================================

export const LazyImportWizard = dynamic(
  () => import('./admin/data/ImportWizard').then((mod) => mod.ImportWizard),
  { loading: () => <WizardLoadingFallback />, ssr: false }
)

export const LazyExportBuilder = dynamic(
  () => import('./admin/data/ExportBuilder').then((mod) => mod.ExportBuilder),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

export const LazyExportAuditLogsDialog = dynamic(
  () => import('./admin/audit/ExportAuditLogsDialog').then((mod) => mod.ExportAuditLogsDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

// ==============================================
// CRM DIALOGS
// ==============================================

export const LazyCreateCampaignDialog = dynamic(
  () => import('./crm/campaigns/CreateCampaignDialog').then((mod) => mod.CreateCampaignDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

export const LazyCreateDealDialog = dynamic(
  () => import('./crm/deals/CreateDealDialog').then((mod) => mod.CreateDealDialog),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)

// ==============================================
// TALENT DIALOGS
// ==============================================

export const LazyMarketingProfileEditor = dynamic(
  () => import('./recruiting/talent/MarketingProfileEditor').then((mod) => mod.MarketingProfileEditor),
  { loading: () => <DialogLoadingFallback />, ssr: false }
)
