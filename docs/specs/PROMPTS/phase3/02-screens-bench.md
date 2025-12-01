# PROMPT: SCREENS-BENCH (Window 2)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill and bench-sales skill.

Create all Bench Sales role screens for InTime v3.

## Read First:
- docs/specs/20-USER-ROLES/02-bench-sales/00-OVERVIEW.md
- docs/specs/20-USER-ROLES/02-bench-sales/01-onboard-consultant.md
- docs/specs/20-USER-ROLES/02-bench-sales/02-build-marketing-profile.md
- docs/specs/20-USER-ROLES/02-bench-sales/03-manage-hotlist.md
- docs/specs/20-USER-ROLES/02-bench-sales/09-manage-vendors.md
- docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md (visa types)
- src/lib/db/schema/bench.ts

## Create Screens (src/app/(app)/bench-sales/):

### 1. Dashboard (/bench-sales)
File: page.tsx

Layout:
- Welcome banner
- KPI cards row: On Bench, Marketing Active, Interviews This Week, Placements This Month
- Alert cards: Visa Expiring Soon (color-coded by urgency)
- Two-column:
  - Left: My Activities (follow-ups, submissions due)
  - Right: Job Order Feed (new orders from vendors)
- Bottom: Pipeline by Status (Available → Marketing → Interviewing → Placed)

### 2. Consultants List (/bench-sales/consultants)
File: consultants/page.tsx

Layout:
- Page header: "Consultants" + Onboard Consultant button
- Toolbar: Search, Status filter, Visa filter, Availability filter, Marketing status filter
- ConsultantsTable with columns: name, status, visa (with expiry indicator), rate, availability, marketing_status
- Bulk actions: Add to Hotlist, Update Status
- Click row → Consultant drawer

### 3. Consultant Detail (/bench-sales/consultants/[id])
File: consultants/[id]/page.tsx

Layout:
- DetailLayout with tabs
- Header: Avatar, Name, Status, Visa badge (color by alert level), Actions
- Tabs:
  - Profile: Candidate profile, summary, skills matrix
  - Marketing: Marketing profile, headline, formats
  - Visa & Auth: Visa details, work authorization, documents
  - Rates: Rate history, current rates
  - Submissions: Job order submissions
  - Immigration: Immigration cases (if any)
  - Activities: Related activities
- Side panel: Quick stats, Availability, Rate summary

### 4. Consultant Onboarding (/bench-sales/consultants/onboard)
File: consultants/onboard/page.tsx

Layout:
- Multi-step form (FormStepper)
- Steps:
  1. Select/Create Candidate
  2. Visa & Work Authorization
  3. Rates & Availability
  4. Skills Matrix
  5. Marketing Profile (draft)
  6. Review & Activate
- Progress indicator

### 5. Marketing Profiles (/bench-sales/marketing)
File: marketing/page.tsx

Layout:
- Profile cards grid (ConsultantCard variant)
- Filters: Status (draft/active), Skills, Visa type
- Actions: Edit Profile, Generate Formats, Preview
- View toggle: Grid | List

### 6. Marketing Profile Editor (/bench-sales/marketing/[id])
File: marketing/[id]/page.tsx

Layout:
- Split view
- Left: Form with headline, summary, highlights, target roles/industries
- Right: Live preview of marketing profile
- Format tabs: Standard, Detailed, One-Pager
- Actions: Save Draft, Publish, Generate PDF

### 7. Hotlists (/bench-sales/hotlists)
File: hotlists/page.tsx

Layout:
- Page header: "Hotlists" + Create Hotlist button
- Hotlist cards: name, purpose, consultant count, last updated
- Filters: Purpose (general/client-specific/skill-specific), Status
- Click → Hotlist detail

### 8. Hotlist Detail (/bench-sales/hotlists/[id])
File: hotlists/[id]/page.tsx

Layout:
- Header: Name, Purpose, Client (if specific), Actions
- HotlistTable (drag-drop sortable)
- Columns: position, consultant card, status, rate, availability
- Actions per row: View Profile, Remove, Move Up/Down
- Bulk actions: Export, Email to Vendor
- Add Consultant modal

### 9. Vendors List (/bench-sales/vendors)
File: vendors/page.tsx

Layout:
- Page header: "Vendors" + Add Vendor button
- VendorsTable: name, type, tier, status, active_orders, placements
- Filters: Type, Tier, Status
- Click → Vendor detail

### 10. Vendor Detail (/bench-sales/vendors/[id])
File: vendors/[id]/page.tsx

Layout:
- DetailLayout with tabs
- Header: Name, Type badge, Tier badge, Status, Actions
- Tabs:
  - Overview: Company info, website, focus areas
  - Contacts: VendorContactsTable
  - Terms: Payment terms, markup ranges, contract info
  - Job Orders: Orders from this vendor
  - Performance: Metrics, scores, history
  - Relationships: Related accounts/vendors
  - Activities: Vendor-related activities

### 11. Job Orders (/bench-sales/job-orders)
File: job-orders/page.tsx

Layout:
- Page header: "Job Orders" + Add Order button
- View toggle: Table | Kanban (by status)
- JobOrdersTable: vendor, title, location, rate, status, priority, received_at
- Filters: Status, Vendor, Priority, Work mode
- Click → Job Order detail

### 12. Job Order Detail (/bench-sales/job-orders/[id])
File: job-orders/[id]/page.tsx

Layout:
- Header: Title, Vendor, Status, Priority, Actions
- Main content: Description, requirements, skills, rate info
- Side panel: Submissions list, Quick submit button
- Tabs:
  - Details: Full order info
  - Submissions: Consultants submitted
  - Notes: Order notes
  - Activities: Related activities

### 13. Submit to Job Order (/bench-sales/job-orders/[id]/submit)
File: job-orders/[id]/submit/page.tsx

Layout:
- Split view
- Left: Job order summary, requirements
- Right: Consultant selector with matching score
- Submission form: consultant, rate, notes
- Match indicators: skills match, visa match, rate match

### 14. Immigration (/bench-sales/immigration)
File: immigration/page.tsx

Layout:
- Page header: "Immigration Cases"
- Tabs: Active Cases | Alerts | Attorneys
- Active Cases table: consultant, case_type, status, priority_date, attorney
- Alerts panel: Upcoming expirations, RFE deadlines
- Filters: Case type, Status, Attorney

### 15. Immigration Case Detail (/bench-sales/immigration/[id])
File: immigration/[id]/page.tsx

Layout:
- Case header: Type, Status, Consultant, Attorney
- Timeline: Milestones with dates
- Documents section: Upload/view documents
- Notes section
- Actions: Update Status, Add Document, Add Milestone

### 16. Activities (/bench-sales/activities)
File: activities/page.tsx

Layout:
- MyActivitiesWidget
- ActivityQueue
- Filters specific to bench sales patterns
- Create Activity button

## Screen Metadata:
Create metadata in src/lib/metadata/screens/bench-sales/

## Requirements:
- Visa expiry color coding (green/yellow/orange/red/black)
- Drag-drop for hotlist ordering
- Marketing profile preview
- Rate negotiation history
- Immigration timeline visualization

## After Screens:
- Add routes to navigation config
- Export screen metadata
