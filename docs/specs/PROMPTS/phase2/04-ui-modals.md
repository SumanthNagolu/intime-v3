# PROMPT: UI-MODALS (Window 4)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill.

Create reusable modal and drawer components for InTime v3 dialogs, panels, and overlays.

## Read First:
- docs/specs/20-USER-ROLES/01-recruiter/04-submit-candidate.md (Submission modal)
- docs/specs/20-USER-ROLES/01-recruiter/05-schedule-interview.md (Scheduler modal)
- docs/specs/20-USER-ROLES/02-bench-sales/02-build-marketing-profile.md (Profile editor)
- src/components/ui/dialog.tsx (Base shadcn dialog)
- src/components/ui/sheet.tsx (Base shadcn sheet/drawer)

## Create Modal Components:

### 1. Base Modals (src/components/modals/):

#### Modal.tsx
Base modal with:
- Sizes: sm, md, lg, xl, full
- Header with title, subtitle, close button
- Body with scroll
- Footer with actions
- Escape to close
- Click outside to close (optional)
- Focus trap
- Animation (fade + scale)

#### Drawer.tsx
Side panel with:
- Positions: left, right
- Sizes: sm, md, lg, xl
- Header with title, close
- Body with scroll
- Footer with actions
- Slide animation

#### ConfirmDialog.tsx
- Icon (warning, danger, info, success)
- Title, message
- Confirm/Cancel buttons
- Destructive variant
- Loading state on confirm

#### AlertDialog.tsx
- Non-dismissible alert
- Single acknowledge button

### 2. Form Modals (src/components/modals/forms/):

#### QuickCreateModal.tsx
Generic modal for quick entity creation:
- Dynamic form based on entity type
- Minimal required fields only
- Success toast
- Return created entity

#### EditModal.tsx
Generic modal for inline editing:
- Load entity data
- Form with all fields
- Save/Cancel
- Dirty state warning

#### BulkEditModal.tsx
For bulk operations:
- Field selector (which fields to update)
- Value inputs
- Preview of affected records
- Confirm step

### 3. Action Modals (src/components/modals/actions/):

#### SubmitCandidateModal.tsx
- Candidate selector (search)
- Job selector (search)
- Rate inputs (bill, pay)
- Auto-margin calculation
- Screening questions from job
- Notes field
- Submit action

#### ScheduleInterviewModal.tsx
- Interview type selector
- Date/time picker with calendar
- Duration selector
- Timezone display
- Interviewer selector (multi)
- Candidate availability check
- Meeting link option
- Send invites toggle

#### StatusChangeModal.tsx
- Current status display
- New status selector
- Reason field (if required)
- Notes field
- Notify toggle

#### ReassignModal.tsx
- Current assignee display
- New assignee selector
- Reason field
- Notify toggle

#### AddToHotlistModal.tsx
- Hotlist selector (or create new)
- Position in list
- Notes field

### 4. Detail Drawers (src/components/modals/drawers/):

#### EntityDrawer.tsx (Base)
- Entity header (icon, title, status)
- Tabs for sections
- Action buttons
- Related entities panel

#### JobDrawer.tsx
Tabs: Overview, Requirements, Submissions, Activities
Actions: Edit, Clone, Pause, Close

#### CandidateDrawer.tsx
Tabs: Profile, Skills, History, Submissions, Documents
Actions: Edit, Submit, Add to Hotlist

#### SubmissionDrawer.tsx
Tabs: Details, Timeline, Notes, Documents
Actions: Update Status, Schedule Interview, Add Note

#### ActivityDrawer.tsx
Tabs: Details, Checklist, Comments, History
Actions: Start, Complete, Defer, Reassign

#### ConsultantDrawer.tsx
Tabs: Profile, Marketing, Rates, Submissions, Immigration
Actions: Edit Profile, Generate Hotlist, Submit

### 5. Specialized Modals (src/components/modals/specialized/):

#### SearchModal.tsx (Command palette style)
- Global search input
- Recent searches
- Quick filters
- Results by category
- Keyboard navigation

#### PreviewModal.tsx
- Document preview (PDF, images)
- Navigation (if multi-page)
- Download button
- Print button

#### CompareModal.tsx
- Side-by-side comparison
- Highlight differences
- Select winner option

#### TimelineModal.tsx
- Full activity/event timeline
- Filter by type
- Date range selector

### 6. Modal Utilities:

#### useModal.ts
```tsx
const { isOpen, open, close, toggle } = useModal();
const { isOpen, open, close, data } = useModalWithData<T>();
```

#### ModalProvider.tsx
- Global modal management
- Stack multiple modals
- Z-index management

## Requirements:
- Smooth animations (framer-motion)
- Responsive (full-screen on mobile)
- Focus management
- Keyboard navigation
- Accessibility (ARIA dialog)
- Form validation before close
- Dirty state warning
- Loading states

## Component Pattern:
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}
```

## After Components:
Export all from src/components/modals/index.ts
