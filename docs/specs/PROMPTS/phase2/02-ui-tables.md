# PROMPT: UI-TABLES (Window 2)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill.

Create reusable data table components for InTime v3 list views and grids.

## Read First:
- docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md (List views needed)
- docs/specs/20-USER-ROLES/02-bench-sales/03-manage-hotlist.md (Drag-drop lists)
- docs/specs/20-USER-ROLES/05-manager/04-review-pipeline.md (Pipeline views)
- src/lib/db/schema/*.ts (Entity fields)
- src/components/ui/table.tsx (Base shadcn table)

## Create Table Components:

### 1. src/components/tables/DataTable.tsx
Core table with:
- Column definitions (type-safe)
- Sorting (single/multi-column)
- Filtering (column filters, global search)
- Pagination (page size, page number, total)
- Row selection (single/multi)
- Row expansion (nested details)
- Column visibility toggle
- Column reordering (drag-drop)
- Column resizing
- Sticky header
- Loading skeleton
- Empty state
- Error state

### 2. src/components/tables/DataTableToolbar.tsx
- Global search input
- Filter chips (active filters)
- View mode toggle (table/cards/kanban)
- Column visibility menu
- Export menu (CSV, Excel)
- Bulk action buttons (when selected)
- Refresh button
- Create new button

### 3. src/components/tables/DataTablePagination.tsx
- Page size selector
- Page navigation (first/prev/next/last)
- Current range display ("1-25 of 150")
- Keyboard navigation

### 4. src/components/tables/ColumnTypes.tsx
Specialized column renderers:
- TextColumn - Plain text with truncation
- StatusColumn - Badge with color by status
- DateColumn - Formatted date with relative option
- CurrencyColumn - Formatted currency
- RateColumn - Rate with type (hourly/annual)
- UserColumn - Avatar + name + role
- EntityColumn - Link to entity with icon
- ProgressColumn - Progress bar
- ActionsColumn - Row actions dropdown
- CheckboxColumn - Selection checkbox
- TagsColumn - Multiple tags/badges
- PriorityColumn - Priority indicator
- RatingColumn - Star rating

### 5. Domain Tables (src/components/tables/domain/):

#### JobsTable.tsx
Columns: title, account, status, priority, job_type, work_mode, location, positions, submissions_count, created_at
Filters: status, priority, job_type, work_mode, account
Actions: View, Edit, Clone, Pause, Close

#### CandidatesTable.tsx
Columns: name, email, status, source, current_title, visa_status, skills, created_at
Filters: status, source, visa_status, skills
Actions: View, Edit, Submit to Job, Add to Hotlist

#### SubmissionsTable.tsx
Columns: candidate, job, status, submitted_at, client_response_at, bill_rate, pay_rate, margin
Filters: status, job, submitted_by
Actions: View, Update Status, Schedule Interview

#### ConsultantsTable.tsx
Columns: name, status, visa_type, visa_expiry, available_from, target_rate, skills
Filters: status, visa_type, skills, availability
Actions: View, Edit Profile, Add to Hotlist, Submit

#### HotlistTable.tsx (Drag-drop sortable)
Columns: position, consultant, status, target_rate, visa_status, availability
Sortable by drag-drop
Actions: Remove, Move Up, Move Down, View Profile

#### LeadsTable.tsx
Columns: company, contact, source, status, score, assigned_to, last_touch, created_at
Filters: source, status, score_range, assigned_to
Actions: View, Qualify, Convert, Disqualify

#### ActivitiesTable.tsx
Columns: subject, pattern, status, priority, assigned_to, due_at, sla_status
Filters: status, priority, pattern, assigned_to, overdue
Actions: View, Start, Complete, Reassign, Defer

### 6. Table Hooks (src/hooks/tables/):

#### useTableState.ts
- Pagination state
- Sorting state
- Filtering state
- Selection state
- Column visibility state
- URL sync for state persistence

#### useTableData.ts
- tRPC query integration
- Debounced search
- Optimistic updates
- Polling option

## Requirements:
- Use @tanstack/react-table v8
- Virtual scrolling for large datasets
- Keyboard navigation
- Accessibility (ARIA table roles)
- Responsive (horizontal scroll on mobile)
- Export functionality (CSV, Excel)
- Print-friendly styles

## Component Pattern:
```tsx
interface ColumnDef<T> {
  accessorKey: keyof T;
  header: string;
  type: ColumnType;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  render?: (value: any, row: T) => ReactNode;
}
```

## After Components:
Export all from src/components/tables/index.ts
