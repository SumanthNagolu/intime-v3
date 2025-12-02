# PROMPT: UI-MODALS (Window 4)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill.

Create reusable modal and drawer components for InTime v3 dialogs, panels, and overlays.

## Read First:
- docs/specs/10-DATABASE/00-ERD.md (Database overview)
- docs/specs/01-GLOSSARY.md (Business terms)
- docs/specs/20-USER-ROLES/01-recruiter/04-submit-candidate.md (Submission modal - detailed UI spec)
- docs/specs/20-USER-ROLES/01-recruiter/05-schedule-interview.md (Interview scheduler modal)
- docs/specs/20-USER-ROLES/02-bench-sales/00-OVERVIEW.md (Bench sales workflows)
- docs/specs/20-USER-ROLES/02-bench-sales/03-market-consultant.md (Marketing profile editor)
- docs/specs/20-USER-ROLES/02-bench-sales/06-create-hotlist.md (Hotlist creation)
- docs/specs/20-USER-ROLES/02-bench-sales/14-onboard-vendor.md (Vendor onboarding wizard)
- docs/specs/20-USER-ROLES/05-hr/02-employee-onboarding.md (HR onboarding wizard)
- docs/specs/30-SCREENS/01-LAYOUT-SHELL.md (Command bar specification)
- src/components/ui/dialog.tsx (Base shadcn dialog)
- src/components/ui/sheet.tsx (Base shadcn sheet/drawer)

## Create Modal Components:

### 1. Base Modals (src/components/modals/):

#### Modal.tsx
Base modal with:
- Sizes: sm (400px), md (500px), lg (640px), xl (800px), 2xl (1024px), full (100vw)
- Header with title, subtitle, close button (X)
- Body with scroll support
- Footer with actions (aligned right)
- Escape to close (configurable)
- Click outside to close (configurable)
- Focus trap on open
- Animation (fade + scale from 95%)
- Dark overlay backdrop (blur optional)

#### Drawer.tsx
Side panel with:
- Positions: left, right (default right)
- Sizes: sm (320px), md (400px), lg (500px), xl (640px), full (100vw)
- Header with title, subtitle, close button
- Body with scroll support
- Footer with actions (sticky)
- Slide animation from edge
- Overlay backdrop
- Resize handle (optional)

#### ConfirmDialog.tsx
- Icon variants: warning (yellow), danger (red), info (blue), success (green)
- Title, message (supports markdown)
- Primary action button (Confirm)
- Secondary action button (Cancel)
- Destructive variant (red primary button)
- Loading state on confirm
- Keyboard: Enter to confirm, Escape to cancel

#### AlertDialog.tsx
- Non-dismissible (no close on overlay/escape)
- Icon + title + message
- Single acknowledge button
- For critical notifications

### 2. Form Modals (src/components/modals/forms/):

#### QuickCreateModal.tsx
Generic modal for quick entity creation:
- Dynamic form based on entity type (job, candidate, contact, lead, deal, task, activity)
- Minimal required fields only
- Validation feedback
- Loading state during save
- Success toast on create
- Return created entity ID
- Option to "Create & Open" vs "Create & Close"

#### EditModal.tsx
Generic modal for inline editing:
- Load entity data on open
- Full form with all editable fields
- Save/Cancel buttons
- Dirty state tracking
- Warn before close if unsaved changes
- Optimistic update with rollback on error

#### BulkEditModal.tsx
For bulk operations:
- Selected record count display
- Field selector (checkbox list of updatable fields)
- Value inputs for selected fields
- Preview of affected records (collapsible list)
- Confirm step with summary
- Progress indicator during update
- Success/failure summary

### 3. Recruiting Modals (src/components/modals/recruiting/):

#### SubmitCandidateModal.tsx
**Based on:** 04-submit-candidate.md detailed specification
- Step 1: Select candidate (searchable, show recent)
- Step 2: Select job (searchable, filter by status: open/urgent)
- Step 3: Resume selection (radio list of versions + "Upload new")
- Step 4: Rate entry
  - Pay rate (currency input)
  - Bill rate (auto-calculated with margin preview)
  - Override checkbox + manual entry
  - Margin display (%)
  - Warning if outside job range
- Step 5: Submission details
  - Candidate highlights (textarea, min 50 chars, AI assist button)
  - Internal notes (textarea, not sent to client)
  - Additional documents (file upload)
- Step 6: Submission method (radio: email/vms/manual)
- Review summary before submit
- Submit button with loading state
- Success: toast + option to view submission

#### ScheduleInterviewModal.tsx
- Interview type selector (phone_screen, video, onsite, panel, technical, final)
- Date picker with calendar view
- Time picker with timezone display
- Duration selector (15, 30, 45, 60, 90, 120 min)
- Interviewer selector (multi-select, search employees)
- Candidate availability check (if available)
- Location/Meeting link entry
- Video platform selector (zoom/teams/google_meet/other)
- Auto-generate meeting link option
- Send invites toggle (candidate + interviewers)
- Calendar preview
- Notes/Instructions textarea

#### StatusChangeModal.tsx
- Current status badge display
- New status selector (dropdown with stage icons)
- Stage-specific fields:
  - Rejection: reason (select) + notes
  - Client response: accepted/rejected + feedback
  - Interview completed: outcome + notes
  - Offer: amount + start date
- Notify stakeholders toggle (with list of who)
- Change log preview

#### RescheduleModal.tsx
- Current schedule display
- New date/time picker
- Reason selector
- Notify attendees toggle
- Update calendar invites toggle

#### InterviewFeedbackModal.tsx
- Interview details header
- Rating inputs (technical skills, communication, culture fit)
- Recommendation (hire/no hire/maybe)
- Detailed notes (rich text)
- Strengths/Weaknesses sections
- Share with team toggle

### 4. Bench Sales Modals (src/components/modals/bench/):

#### AddToHotlistModal.tsx
- Hotlist selector (dropdown + "Create new")
- If creating new: name input, description
- Position in list (number or drag)
- Consultant profile preview
- Confirm button

#### HotlistDistributeModal.tsx
- Hotlist preview (consultant list)
- Recipient selection (multi-select vendors/contacts)
- Email template selector
- Customize subject + message
- Preview email
- Schedule send or send now
- Track engagement toggle

#### ConsultantMarketingModal.tsx
- Edit marketing headline
- Skills highlight order (drag to reorder)
- Rate display preferences
- Availability notes
- Generate PDF profile button
- Preview mode

#### VendorOnboardingWizard.tsx
Multi-step wizard:
- Step 1: Company info (name, website, industry)
- Step 2: Primary contact details
- Step 3: Document upload (W-9, COI, NDA, MSA)
- Step 4: Commission terms (custom negotiated)
  - Markup type (percentage/fixed/tiered)
  - Markup value
  - Payment terms (net 30/45/60)
  - Invoice frequency
- Step 5: Review & submit
- Progress indicator

#### VendorBenchImportModal.tsx
- Vendor selector
- Import method (API sync / CSV upload / Manual entry)
- Field mapping (if CSV)
- Duplicate handling (skip/merge/replace)
- Preview imported data
- Import progress bar
- Results summary

#### ImmigrationCaseModal.tsx
- Consultant info header
- Case type selector
- Filing date, approval date, expiry date
- Attorney selector
- Documents upload (receipt notices, I-797, EAD)
- Timeline milestones (editable)
- Notes section
- Set alert reminders

### 5. CRM Modals (src/components/modals/crm/):

#### ConvertLeadModal.tsx
- Lead info summary
- Convert to: Account + Contact + Deal (checkboxes)
- Account details form (pre-filled from lead)
- Contact details form (pre-filled)
- Deal details form (optional)
- Assign owner
- Convert button

#### DealStageChangeModal.tsx
- Current stage display
- New stage selector (visual pipeline)
- Stage-specific fields:
  - Proposal: upload proposal doc
  - Negotiation: competing vendors
  - Won: contract value, start date
  - Lost: loss reason, competitor
- Update probability auto/manual
- Notes

#### MergeRecordsModal.tsx
- Side-by-side record comparison
- Field-by-field selection (radio for each field)
- Preview merged record
- Secondary record disposition (delete/archive)
- Merge button

### 6. HR Modals (src/components/modals/hr/):

#### EmployeeOnboardingWizard.tsx
Multi-step wizard:
- Step 1: Personal info
- Step 2: Employment details (type, department, manager)
- Step 3: Compensation (salary type, amount)
- Step 4: I-9 verification
- Step 5: W-4 form
- Step 6: Direct deposit
- Step 7: Benefits enrollment
- Progress indicator, save draft option

#### TimesheetApprovalModal.tsx
- Employee info + period
- Hours breakdown (regular, overtime)
- Calendar view of entries
- Approve / Reject / Request revision
- Notes field
- Bulk approval option (for managers)

#### PTORequestModal.tsx
- Request type (vacation/sick/personal/bereavement)
- Date range picker
- Days calculation (auto)
- Current balance display
- Notes/reason
- Submit for approval

#### PerformanceReviewModal.tsx
- Employee header
- Review period
- Goals review section
- Competency ratings
- Overall rating
- Feedback sections (strengths, areas for improvement)
- Goals for next period
- Submit / Save draft

### 7. Detail Drawers (src/components/modals/drawers/):

#### EntityDrawerBase.tsx
- Entity header (icon, title, status badge)
- Quick actions toolbar
- Tabs for sections
- Related entities panel (collapsible)
- Activity feed (collapsible)
- RCAI assignment display

#### JobDrawer.tsx
Tabs: Overview, Requirements, Pipeline, Submissions, Activities, Documents
Actions: Edit, Clone, Pause, Close, Add Submission
Related: Account, Contacts, Submissions

#### CandidateDrawer.tsx
Tabs: Profile, Skills & Experience, Work Authorization, Submissions, Activities, Documents
Actions: Edit, Submit to Job, Add to Campaign, Log Activity
Related: Active Submissions, Placements

#### SubmissionDrawer.tsx
Tabs: Details, Timeline, Interview Schedule, Notes, Documents
Actions: Update Status, Schedule Interview, Add Note, Send to Client
Related: Job, Candidate, Interviews

#### ConsultantDrawer.tsx (Bench)
Tabs: Profile, Marketing Info, Rates, Immigration, Submissions, Activities
Actions: Edit Profile, Add to Hotlist, Submit to Requirement, Update Availability
Related: Active Submissions, Immigration Case

#### ActivityDrawer.tsx
Tabs: Details, Checklist, Comments, History
Actions: Start, Complete, Defer, Reassign, Add Comment
Related: Entity reference, Assigned user

#### AccountDrawer.tsx
Tabs: Overview, Contacts, Jobs, Deals, Activities, Documents
Actions: Add Job, Add Contact, Add Deal, Log Activity
Related: Primary Contact, Active Jobs, Open Deals

#### LeadDrawer.tsx
Tabs: Overview, Qualification, Activities, Notes
Actions: Edit, Qualify, Convert, Disqualify
Related: Contact, Company

#### DealDrawer.tsx
Tabs: Overview, Stakeholders, Activities, Documents
Actions: Update Stage, Add Note, Add Stakeholder
Related: Account, Contacts, Competitors

#### EmployeeDrawer.tsx (HR)
Tabs: Profile, Employment, Compensation, Time Off, Documents
Actions: Edit, Add Note, View Payroll
Related: Manager, Department

### 8. Specialized Modals (src/components/modals/specialized/):

#### CommandBarModal.tsx
**Based on:** 01-LAYOUT-SHELL.md command bar spec
- Global search input (auto-focus)
- Recent searches section
- Quick filters (entity type)
- Results grouped by category (Jobs, Candidates, Accounts, etc.)
- Keyboard navigation (up/down/enter/escape)
- Command mode (starts with ">")
- Action shortcuts display

#### PreviewModal.tsx
- Document preview (PDF, images, Word)
- Multi-page navigation
- Zoom controls
- Download button
- Print button
- Full-screen toggle

#### CompareModal.tsx
- Side-by-side entity comparison
- Highlight differences
- Field-by-field view
- Select "winner" option (for merge)
- Export comparison

#### TimelineModal.tsx
- Full activity/event timeline
- Filter by activity type
- Filter by date range
- Search within timeline
- Expand/collapse entries
- Export timeline

#### EmailComposeModal.tsx
- To, CC, BCC fields (with contact search)
- Subject line
- Template selector (optional)
- Rich text editor body
- Attachments
- Send / Schedule / Save draft
- Track opens toggle

#### BulkEmailModal.tsx
- Recipient list display (with count)
- Template selector (required)
- Personalization tokens preview
- Send test to self
- Schedule options
- Compliance warnings (CAN-SPAM)

### 9. Modal Utilities:

#### useModal.ts
```tsx
const { isOpen, open, close, toggle } = useModal();
const { isOpen, open, close, data, setData } = useModalWithData<T>();
```

#### useDrawer.ts
```tsx
const { isOpen, open, close, entityId, entityType } = useEntityDrawer();
```

#### ModalProvider.tsx
- Global modal management context
- Stack multiple modals (z-index management)
- Prevent body scroll when modal open
- Handle escape key for top-most modal

#### useConfirm.ts
```tsx
const confirm = useConfirm();
const result = await confirm({
  title: 'Delete Job?',
  message: 'This action cannot be undone.',
  variant: 'danger',
  confirmText: 'Delete',
});
```

## Requirements:
- Smooth animations (framer-motion or CSS transitions)
- Responsive (full-screen on mobile for larger modals)
- Focus management (trap focus, restore on close)
- Keyboard navigation (Tab, Escape, Enter)
- Accessibility (ARIA dialog role, labels, descriptions)
- Form validation before close (warn unsaved changes)
- Dirty state tracking
- Loading states during async operations
- Error handling with inline messages
- URL state sync for drawers (deep linking)

## Component Pattern:
```tsx
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  tabs?: TabConfig[];
  actions?: ActionConfig[];
  children: ReactNode;
  footer?: ReactNode;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  title: string;
  message: string;
  variant?: 'info' | 'warning' | 'danger' | 'success';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}
```

## After Components:
Export all from src/components/modals/index.ts

  use parallel agents.. not for sake of using..  only where it
  makes sense
