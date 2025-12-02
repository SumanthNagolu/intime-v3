# PROMPT: UI-TABLES (Window 2)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill.

Create data table components for InTime v3 list views based on the database schemas and user role workflows.

## Read First:
- docs/specs/10-DATABASE/00-ERD.md (Database overview)
- docs/specs/01-GLOSSARY.md (Business terms)
- docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md (Recruiter entities and permissions)
- docs/specs/20-USER-ROLES/01-recruiter/01-daily-workflow.md (What recruiters see daily)
- docs/specs/20-USER-ROLES/02-bench-sales/00-OVERVIEW.md (Bench sales entities and permissions)
- docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md (Manager pod oversight, pipeline review)
- docs/specs/20-USER-ROLES/04-manager/02-pod-dashboard.md (Team metrics and pipeline)
- docs/specs/20-USER-ROLES/05-hr/00-OVERVIEW.md (HR entities - employees, payroll, compliance)
- docs/specs/30-SCREENS/01-LAYOUT-SHELL.md (Sidebar navigation entities)
- src/lib/db/schema/*.ts (All database schemas for columns)

## Create Table Components:

### 1. Base Table (src/components/tables/DataTable.tsx)
Feature-rich table with:
- Column definitions (sortable, filterable, resizable, hideable)
- Server-side pagination with URL state sync
- Sorting (single and multi-column)
- Column visibility toggle
- Row selection (single, multi, all)
- Bulk actions toolbar
- Empty states (no data, no results, error)
- Loading skeleton states
- Sticky header option
- Compact/comfortable/spacious density modes
- Export (CSV, Excel, PDF)
- Column reordering (drag & drop)

### 2. Column Types (src/components/tables/columns/):

#### StatusColumn.tsx
- Badge-based status display
- Color coding by status category
- Tooltip with status description
- Click to filter by status

#### DateColumn.tsx
- Relative time display (e.g., "2 hours ago", "Yesterday")
- Hover for absolute date/time
- Date range filtering support
- Sort by actual date

#### CurrencyColumn.tsx
- Formatted currency display ($XX,XXX.XX)
- Right-aligned
- Currency symbol support (USD, CAD)
- Rate type suffix (/hr, /day, /week, etc.)

#### UserColumn.tsx
- Avatar + name display
- Click to view user profile
- Multiple users (comma separated or +N more)
- Unassigned state

#### EntityLinkColumn.tsx
- Clickable entity reference (Job, Candidate, Account)
- Entity icon
- Truncation with full text on hover
- Opens detail in split-pane or navigation

#### RatingColumn.tsx
- Star or score display (1-5, 1-10, percentage)
- Match score specific styling
- Color gradient (red → yellow → green)

#### ProgressColumn.tsx
- Progress bar with percentage
- Step indicator (e.g., "3/5 steps")
- Color coding by progress

#### AlertColumn.tsx
- Alert level indicator (green/yellow/orange/red/black)
- Icon + text
- Urgency escalation styling
- Immigration visa expiry alerts

#### TagsColumn.tsx
- Pill/badge display for multiple values
- Max visible (show +N more)
- Color-coded tags
- Searchable/filterable

#### ActionsColumn.tsx
- Dropdown menu with context actions
- Quick actions (inline icons)
- Keyboard shortcuts
- Permission-gated actions

### 3. Domain Tables (src/components/tables/domain/):

#### JobsTable.tsx (Recruiting)
Columns: title (link), account (link), status (badge), location, jobType, rateRange (currency), priority (icon), urgency (icon), positionsOpen, submissionsCount, ownerId (avatar), createdAt (relative)
Filters: status (multi), jobType, isRemote, priority, urgency, account, owner, dateRange
Bulk actions: Change status, Assign owner, Export, Archive
Row click: Open job detail in split-pane

#### CandidatesTable.tsx (Recruiting)
Columns: name (avatar + link), email, phone, currentTitle, currentCompany, status (badge), source, visaStatus (badge), skills (tags), rating (match score), ownerId (avatar), lastActivityAt
Filters: status, source, visaStatus, skills (multi), location, availability, rating
Bulk actions: Add to campaign, Change status, Export, Tag
Row click: Open candidate detail

#### SubmissionsTable.tsx (Recruiting)
Columns: candidate (link), job (link), status (badge), submittedAt (relative), payRate (currency), billRate (currency), margin (%), screeningScore, lastActivityAt
Filters: status (multi-select with pipeline stages), job, dateRange
Status values: sourced, screening, submitted_to_client, client_review, client_accepted, client_rejected, interview_scheduled, interview_completed, offer_pending, offer_extended, offer_accepted, offer_declined, placed, withdrawn
Pipeline view toggle (Kanban)
Bulk actions: Change status, Export

#### PlacementsTable.tsx (Recruiting/Bench Sales)
Columns: candidate (link), job (link), account (link), startDate, endDate, billRate, payRate, status (badge), contractType, checkInStatus (30/60/90 day), ownerId
Filters: status, dateRange, account, contractType
Status: active, completed, terminated_early, extended

#### AccountsTable.tsx (CRM)
Columns: name (link), industry, type (badge: client/vendor/partner), tier (badge), website, primaryContact (link), status (badge), jobsCount, placementsCount, totalRevenue, lastActivityAt
Filters: type, tier, status, industry, hasActiveJobs
Bulk actions: Merge duplicates, Export, Change tier

#### ContactsTable.tsx (CRM)
Columns: name (avatar + link), title, account (link), email, phone, isPrimary (badge), lastContactedAt, leadCount, notes
Filters: account, isPrimary, lastContactedRange
Bulk actions: Add to campaign, Export

#### LeadsTable.tsx (CRM/TA)
Columns: company (link), contact (link), source (badge), status (badge), score (rating), qualificationStatus, value (currency), assignedTo (avatar), createdAt
Filters: source, status, score range, assignedTo, dateRange
Lead stages: new, contacted, qualified, proposal, negotiation, won, lost

#### DealsTable.tsx (CRM)
Columns: name (link), account (link), value (currency), probability (%), stage (badge), expectedCloseDate, owner (avatar), createdAt
Filters: stage, value range, owner, dateRange
Pipeline view toggle

#### BenchConsultantsTable.tsx (Bench Sales)
Columns: name (avatar + link), skills (tags), visaStatus (badge), visaAlertLevel (alert), daysOnBench (number with color), minRate (currency), targetRate, contractPreference (c2c/w2/1099), availability (badge), lastActivityAt
Filters: visaStatus, visaAlertLevel (green/yellow/orange/red/black), skills, availability, daysOnBench range, contractPreference
Bench alert: 0-15 green, 16-30 yellow, 31-60 orange, 61-90 red, 91+ black
Bulk actions: Add to hotlist, Update availability, Export

#### VendorBenchTable.tsx (Bench Sales)
Columns: consultant (link), vendor (link), skills (tags), visaStatus, rate (currency), availability, importedAt, matchScore
Filters: vendor, skills, visaStatus, dateImported
Bulk actions: Mark for submission, Add to tracking

#### ExternalJobsTable.tsx (Bench Sales)
Columns: title (link), client, source (dice/indeed/linkedin/vendor), postedAt, location, skills (tags), rateRange, status (active/expired/filled), matchedConsultants (count)
Filters: source, status, skills, location, datePosted
Row click: View job detail + matched consultants

#### ImmigrationTable.tsx (Bench Sales/HR)
Columns: consultant (link), visaType (badge), expiryDate, daysToExpiry (alert), renewalStatus (badge), attorney, lastUpdated, caseNumber
Filters: visaType, alertLevel, renewalStatus, expiryRange
Alert levels: 181+ days (green), 90-180 (yellow), 30-90 (orange), <30 (red), expired (black)
Bulk actions: Export compliance report, Notify attorney

#### HotlistsTable.tsx (Bench Sales)
Columns: name (link), consultantCount, vendorTargets (tags), status (draft/sent/expired), sentAt, openRate (%), responseRate (%), expiresAt, createdBy
Filters: status, dateRange, createdBy
Row click: Open hotlist detail with engagement metrics

#### VendorsTable.tsx (Bench Sales)
Columns: name (link), type (account type badge), primaryContact (link), agreementStatus (badge), commissionTerms, activeConsultants (count), placements (count), lastActivityAt
Filters: agreementStatus, hasActiveConsultants

#### EmployeesTable.tsx (HR)
Columns: name (avatar + link), employeeNumber, department, jobTitle, manager (link), employmentType (badge), hireDate, location, status (badge)
Filters: department, employmentType, manager, status, location, hireDate range

#### PayrollTable.tsx (HR)
Columns: employee (link), payPeriod, grossPay (currency), deductions (currency), netPay (currency), status (badge: pending/processed/paid), processedAt, paidAt
Filters: status, payPeriod, department
Bulk actions: Process payroll, Export

#### TimesheetsTable.tsx (HR)
Columns: employee (link), weekEnding, regularHours, overtimeHours, totalHours, status (badge: draft/submitted/approved/rejected), submittedAt, approvedBy (link)
Filters: status, weekEnding, department
Bulk actions: Approve, Reject, Request revision

#### PTORequestsTable.tsx (HR)
Columns: employee (link), type (vacation/sick/personal), startDate, endDate, days, status (badge), requestedAt, respondedAt, respondedBy
Filters: type, status, dateRange
Bulk actions: Approve, Deny

#### PerformanceReviewsTable.tsx (HR)
Columns: employee (link), reviewCycle, reviewer (link), overallRating (rating), status (badge), dueDate, completedAt
Filters: cycle, status, department, rating range

#### TasksTable.tsx (All Roles)
Columns: title (link), relatedEntity (link), priority (badge), dueAt (date with overdue alert), status (badge), assignedTo (avatar), createdAt
Filters: status, priority, assignedTo, dueDate range, entityType
Bulk actions: Complete, Reassign, Reschedule

#### ActivitiesTable.tsx (All Roles)
Columns: subject (link), pattern (badge), relatedEntity (link), status (badge), priority (badge), dueAt, assignedTo (avatar), createdAt, completedAt
Filters: pattern, status, priority, entityType, dateRange, assignedTo
Activity patterns from 02-ACTIVITY-PATTERN-LIBRARY.md

#### PodMembersTable.tsx (Manager)
Columns: member (avatar + link), role (badge), jobsActive (count), submissionsWeek (count), placementsMTD (count), pipelineCoverage (%), lastActivityAt
Filters: role, performanceLevel
Pod performance metrics inline

### 4. Table Utilities (src/lib/tables/):

#### columns.ts
- Column definition helpers
- Type-safe column builders
- Reusable column configurations

#### filters.ts
- Filter state management
- URL query string sync (?status=active&page=2)
- Filter presets (save/load)
- Quick filters by role

#### sorting.ts
- Sort state management
- Multi-column sorting
- Default sort configurations per table

#### pagination.ts
- Page size options (10, 25, 50, 100)
- Cursor-based pagination support
- Total count caching
- URL sync

#### export.ts
- CSV export with selected columns
- Excel export with formatting
- PDF export with headers
- Export progress indicator

### 5. Specialized Views:

#### KanbanBoard.tsx
For submissions and deals pipeline:
- Drag-drop between columns
- Column customization
- Card previews
- Column counts and totals
- Column collapse

#### CalendarView.tsx
For interviews and tasks:
- Month/week/day views
- Drag to reschedule
- Color coding by entity type
- Agenda list view

## Requirements:
- Use TanStack Table (react-table v8)
- Server-side data fetching with tRPC
- URL state sync for filters, sorting, pagination
- Virtualization for large datasets (TanStack Virtual)
- Accessible (ARIA, keyboard navigation, screen reader)
- Mobile responsive (card view on small screens)
- Column customization persisted per user
- Real-time updates via subscriptions (optional)

## Component Pattern:
```tsx
export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  sorting?: {
    sortBy: SortingState;
    onSortChange: (sort: SortingState) => void;
  };
  filters?: {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
  };
  selection?: {
    selected: string[];
    onSelectionChange: (ids: string[]) => void;
  };
  onRowClick?: (row: TData) => void;
  bulkActions?: BulkAction[];
  emptyState?: React.ReactNode;
  loading?: boolean;
  error?: Error | null;
}
```

## After Components:
Export all from src/components/tables/index.ts
