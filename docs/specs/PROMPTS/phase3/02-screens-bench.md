# PROMPT: SCREENS-BENCH (Window 2)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill and bench-sales skill.

Create/Update Bench Sales role screens for InTime v3 using the metadata-driven screen definition approach.

## Read First (Required):
- docs/specs/20-USER-ROLES/02-bench-sales/00-OVERVIEW.md (Complete role spec with KPIs, permissions, screen access)
- docs/specs/20-USER-ROLES/02-bench-sales/01-daily-workflow.md (Daily workflow)
- docs/specs/20-USER-ROLES/02-bench-sales/02-manage-bench.md (Bench management)
- docs/specs/20-USER-ROLES/02-bench-sales/05-submit-bench-consultant.md (Submission workflow)
- docs/specs/20-USER-ROLES/02-bench-sales/06-create-hotlist.md (Hotlist marketing)
- docs/specs/20-USER-ROLES/02-bench-sales/08-track-immigration.md (Immigration tracking)
- docs/specs/20-USER-ROLES/02-bench-sales/11-source-bench-consultant.md (Consultant sourcing)
- docs/specs/20-USER-ROLES/02-bench-sales/13-manage-vendors.md (Vendor management)
- docs/specs/20-USER-ROLES/02-bench-sales/14-onboard-vendor.md (Vendor onboarding)
- docs/specs/01-GLOSSARY.md (Business terms, visa types)
- CLAUDE.md (Tech stack)

## Read Existing Code:
- src/screens/bench-sales/index.ts (Existing screen registry)
- src/screens/bench-sales/bench-dashboard.screen.ts (Dashboard reference)
- src/screens/bench-sales/consultant-list.screen.ts
- src/lib/metadata/types.ts (ScreenDefinition type)
- src/lib/db/schema/bench.ts (Bench schema)
- src/components/forms/domain/ (Phase 2 forms)
- src/components/activities/ (Phase 2 activity components)

## Context:
- Routes: `/employee/workspace/bench/*` for bench sales screens
- Per 00-OVERVIEW.md: Bench Sales combines 5 traditional roles (Bench Builder, Marketing, Vendor Relations, Immigration, Placement)
- Visa color coding: 🟢 Green (181+ days), 🟡 Yellow (90-180), 🟠 Orange (30-90), 🔴 Red (<30), ⚫ Black (expired)
- Contract types: C2C, W2, 1099 with different rate implications
- Custom commission per vendor (no standard percentages)

## Screen Definitions to Create/Update (src/screens/bench-sales/):

### 1. Bench Dashboard (UPDATE existing)
File: bench-dashboard.screen.ts
Route: `/employee/workspace/bench`
Status: EXISTS - Enhance per 00-OVERVIEW.md

KPI cards (per Section 4):
- On Bench count (with days-on-bench distribution)
- Bench Utilization Rate (target <25%)
- Average Days on Bench (target <30 days)
- Placements This Month (target: 2)
- Marketing Active count
- Interviews This Week

Widgets:
- Visa Expiration Alerts (color-coded by urgency)
- Bench Status Distribution (Green/Yellow/Orange/Red/Black)
- Pipeline by Status (Available → Marketing → Interviewing → Placed)
- Today's Activities (follow-ups, submissions due)
- Job Order Feed (new vendor requirements)
- Commission MTD

### 2. Consultants List (UPDATE existing)
File: consultant-list.screen.ts
Route: `/employee/workspace/bench/consultants`
Status: EXISTS - Verify per spec

Per 00-OVERVIEW.md Section 6.1:
- View: All (org), Edit: Assigned
- Columns: name, status, visaType (with expiry indicator), visaExpiryDate, daysOnBench, minRate, targetRate, availability, marketingStatus
- Filters: Status (on_bench/marketing/interviewing/placed), Visa type, Contract preference (C2C/W2/1099), Availability
- Bulk actions: Add to Hotlist, Update Status, Send Marketing

Visa badge colors per Section 8.4:
- 🟢 >180 days = green
- 🟡 90-180 days = yellow
- 🟠 30-90 days = orange
- 🔴 <30 days = red
- ⚫ expired = black

### 3. Consultant Detail (UPDATE existing)
File: consultant-detail.screen.ts
Route: `/employee/workspace/bench/consultants/[id]`
Status: EXISTS - Verify tabs

Tabs:
- Profile: Personal info, summary, skills matrix
- Marketing: Marketing profile, headline, formats (Standard/Detailed/One-Pager)
- Visa & Auth: Visa details, work authorization, documents, expiry countdown
- Rates: Rate history, current rates (C2C/W2/1099 breakdown), rate negotiation log
- Submissions: All job order submissions
- Immigration: Immigration cases (if any), attorney info, milestones
- Activities: Timeline

Header: Avatar, Name, Status badge, Visa badge (color-coded), Contract type badge
Side Panel: Days on bench, Availability status, Rate summary, Quick actions

### 4. Consultant Onboarding (CREATE if missing)
File: consultant-onboard.screen.ts
Route: `/employee/workspace/bench/consultants/onboard`

Multi-step form per 12-onboard-bench-consultant.md:
1. Source Selection: Internal / Referral / Vendor
2. Candidate Selection: Search existing or create new
3. Visa & Work Authorization: visaType, visaExpiryDate, workAuthStatus, documents
4. Rates & Availability: minRate, targetRate, contractPreference, willingRelocate, preferredLocations
5. Skills Matrix: Technical skills with proficiency
6. Marketing Profile: Draft headline, summary, highlights
7. Review & Activate

### 5. Vendor Bench (CREATE if missing)
File: vendor-bench-list.screen.ts
Route: `/employee/workspace/bench/vendor-consultants`

Per 00-OVERVIEW.md: Third-party consultant profiles from vendor APIs
Columns: name, vendorName, visaType, skills, rate, availability, lastUpdated
Filters: Vendor, Visa type, Skills, Availability
Actions: Import from vendor, Refresh sync, Claim consultant

### 6. Marketing Profiles (CREATE if missing)
File: marketing-profiles.screen.ts
Route: `/employee/workspace/bench/marketing`

Grid/List of consultant marketing profiles
Filters: Status (draft/active), Skills, Visa type
Card view: Photo, Headline, Key skills, Visa badge, Rate range
Actions: Edit Profile, Generate Formats, Preview, Send

### 7. Marketing Profile Editor (CREATE if missing)
File: marketing-profile-editor.screen.ts
Route: `/employee/workspace/bench/marketing/[id]`

Split view:
- Left: Form (headline, summary, highlights, target roles, target industries)
- Right: Live preview

Format tabs: Standard, Detailed, One-Pager
Actions: Save Draft, Publish, Generate PDF, Share

### 8. Hotlists (UPDATE existing)
File: hotlist-list.screen.ts
Route: `/employee/workspace/bench/hotlists`
Status: EXISTS - Verify per 06-create-hotlist.md

Per Section 8.3: Min 5, Max 25 consultants per hotlist
Columns: name, purpose, consultantCount, lastUpdated, engagementStats
Filters: Purpose (general/client-specific/skill-specific), Status (active/expired)

### 9. Hotlist Detail (UPDATE existing)
File: hotlist-detail.screen.ts
Route: `/employee/workspace/bench/hotlists/[id]`
Status: EXISTS - Verify features

Features:
- Drag-drop sortable consultant list
- Columns: position, consultant card, status, rate, availability
- Per-row actions: View Profile, Remove, Move Up/Down
- Bulk actions: Export PDF/HTML, Email to Vendor
- Add Consultant modal with search

### 10. Job Orders (UPDATE existing)
File: job-order-list.screen.ts
Route: `/employee/workspace/bench/jobs`
Status: EXISTS - Verify

External job requirements from vendors/market
Views: Table | Kanban (by status)
Columns: vendorName, title, location, rateRange, status, priority, receivedAt
Filters: Status (new/active/submitted/closed), Vendor, Priority, Work mode (remote/hybrid/onsite)

### 11. Job Order Detail (UPDATE existing)
File: job-order-detail.screen.ts
Route: `/employee/workspace/bench/jobs/[id]`
Status: EXISTS - Verify

Layout:
- Header: Title, Vendor, Status, Priority
- Main: Description, requirements, skills match, rate info
- Side Panel: Submissions list, Match score calculator, Quick submit

Tabs:
- Details: Full order info
- Submissions: Consultants submitted
- Notes: Order notes, vendor communication
- Activities: Related activities

### 12. Submit to Job Order (CREATE if missing)
File: job-order-submit.screen.ts
Route: `/employee/workspace/bench/jobs/[id]/submit`

Split view:
- Left: Job order summary, requirements
- Right: Consultant selector with matching indicators

Match indicators per 00-OVERVIEW.md Section 8.2:
- Skills match (>70% required)
- Visa match (>180 days validity or pending renewal)
- Rate match

Submission form: consultant, submitRate, notes

### 13. Vendors List (UPDATE existing)
File: vendor-list.screen.ts
Route: `/employee/workspace/bench/vendors`
Status: EXISTS - Verify

Columns: name, type, tier, status, activeOrders, placementCount, paymentTerms
Filters: Type, Tier, Status (active/inactive/pending)
Row click → Vendor detail

### 14. Vendor Detail (UPDATE existing)
File: vendor-detail.screen.ts
Route: `/employee/workspace/bench/vendors/[id]`
Status: EXISTS - Verify tabs

Tabs per 13-manage-vendors.md:
- Overview: Company info, website, focus areas
- Contacts: VendorContactsTable
- Terms: Payment terms, markup type, commission structure, contract dates
- Job Orders: Orders from this vendor
- Performance: Response rate, placement rate, NPS
- Documents: MSA, NDA, COI, W-9
- Relationships: Related accounts
- Activities: Vendor timeline

### 15. Vendor Onboarding (CREATE if missing)
File: vendor-onboard.screen.ts
Route: `/employee/workspace/bench/vendors/onboard`

Multi-step form per 14-onboard-vendor.md:
1. Company Info: name, website, industry, address
2. Contacts: Primary contact (name, email, phone), additional contacts
3. Agreement Terms: MSA upload, NDA upload, COI upload, W-9 upload
4. Commission Structure: markupType (percentage/fixed/tiered), markupValue, paymentTerms (net_30/45/60), invoiceFrequency
5. Focus Areas: Preferred skills, industries, locations
6. Review & Activate

### 16. Immigration Dashboard (CREATE if missing)
File: immigration-dashboard.screen.ts
Route: `/employee/workspace/bench/immigration`

Per 08-track-immigration.md:
Tabs: Active Cases | Alerts | Attorneys

Active Cases table: consultant, caseType, status, priorityDate, attorney, nextMilestone
Alerts panel: Upcoming expirations, RFE deadlines, Critical items
Attorney directory with contact info

Color coding per Section 8.4 Immigration Alerts:
- 🟢 >180 days: Routine monitoring
- 🟡 90-180 days: Start renewal planning
- 🟠 30-90 days: Initiate renewal process
- 🔴 <30 days: Escalate, stop submissions
- ⚫ Expired: Cannot work

### 17. Immigration Case Detail (CREATE if missing)
File: immigration-case-detail.screen.ts
Route: `/employee/workspace/bench/immigration/[id]`

Layout:
- Header: Case type, Status, Consultant name, Attorney
- Timeline: Milestones with dates (filing, receipt, approval, etc.)
- Documents: Upload/view documents (I-797, EAD cards, etc.)
- Notes: Case notes, RFE responses
- Actions: Update Status, Add Document, Add Milestone

### 18. Placements List (CREATE if missing)
File: bench-placements-list.screen.ts
Route: `/employee/workspace/bench/placements`

Per 00-OVERVIEW.md: Own + Team view
Columns: consultantName, vendorName, clientName, role, startDate, endDate, status, billRate, margin
Filters: Status (active/pending/completed), Date range, Vendor

Include: 30/60/90 day check-in indicators per Section 5.4

### 19. Placement Detail (CREATE if missing)
File: bench-placement-detail.screen.ts
Route: `/employee/workspace/bench/placements/[id]`

Tabs:
- Overview: Contract details, rates (C2C/W2/1099 breakdown), dates, vendor info
- Check-ins: 30/60/90 day tracker
- Extensions: History, pending requests
- Timesheets: If integrated
- Commission: Commission calculation, custom vendor terms
- Activities: Timeline

### 20. Commission Dashboard (CREATE if missing)
File: commission-dashboard.screen.ts
Route: `/employee/workspace/bench/commission`

Per 00-OVERVIEW.md Section 6.1: Own commission view
- Earnings MTD/YTD
- Pending commissions
- Claims submitted
- Payment history
- Per-vendor commission breakdown (custom terms per vendor)

### 21. Activities Queue (CREATE if missing)
File: bench-activities.screen.ts
Route: `/employee/workspace/bench/activities`

Bench-specific activity patterns:
- Source consultant
- Update consultant profile
- Market consultant (hotlist)
- Submit to requirement
- Update availability
- Immigration status check
- Vendor follow up
- Close placement

Use Phase 2 ActivityQueue component

## Rate Calculation Display:
Per Section 8.6 & 8.7, show rate stack:
```
Client Bill Rate: $100/hr
├── Vendor Markup: $10/hr (10%)
├── InTime Margin: $20/hr (20%)
└── Consultant Pay: $70/hr
```

## Screen Definition Pattern:
```typescript
import type { ScreenDefinition } from '@/lib/metadata/types';

export const screenNameScreen: ScreenDefinition = {
  id: 'bench-screen-id',
  type: 'list' | 'detail' | 'dashboard',
  title: 'Screen Title',
  icon: 'IconName',

  dataSource: {
    type: 'query',
    query: { procedure: 'bench.procedure' },
  },

  layout: { /* sections */ },
  actions: [...],
};
```

## Requirements:
- Visa expiry color coding throughout (use VisaBadge component)
- Rate calculations with margin display
- Drag-drop for hotlist ordering
- Marketing profile live preview
- Immigration timeline visualization
- Commission tracking with custom vendor terms
- Follow existing pattern from bench-dashboard.screen.ts

## After Screens:
1. Export from src/screens/bench-sales/index.ts
2. Add to benchSalesScreens registry
3. Create routes in src/app/employee/workspace/bench/
4. Update navigation config
