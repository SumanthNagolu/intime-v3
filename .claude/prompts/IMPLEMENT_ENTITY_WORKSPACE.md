# Entity Workspace Implementation Prompt

Use this prompt when implementing a new entity workspace following the Account workspace patterns.

---

## Implementation Request Template

```
Implement a Hublot-inspired workspace for the [ENTITY] entity following the Account workspace patterns.

Reference implementation: /src/components/workspaces/account/
Reference rulebook: /.claude/rules/ENTITY_WORKSPACE_RULEBOOK.md

## Entity Details

Entity Name: [ENTITY_NAME]
Entity Type: [singular lowercase, e.g., "contact", "job", "candidate"]
Base Path: /employee/[module]/[entities]
Navigation Style: sections (not journey)

## Sections Structure

Overview Section: [summary/overview]
Main Sections:
1. [section_id]: [Label] - [description]
2. [section_id]: [Label] - [description]
...

Related Data Sections (collapsible):
- [section_id]: [Label] (showCount: true)
...

Tool Sections (collapsible):
- activities: Activities (showCount: true)
- notes: Notes (showCount: true)
- documents: Documents (showCount: true)
- history: History

## Quick Actions

Based on entity status, show these actions:
- [action_id]: [Label] - [icon] - [actionType: dialog/navigate/mutation]
...

## Special Considerations

[Any entity-specific notes, subtypes, or variations]
```

---

## Entity Implementation Prompts

### Contact Entity (with Person/Company subtypes)

```
Implement a Hublot-inspired workspace for the Contact entity with Person and Company subtypes.

Reference: Account workspace in /src/components/workspaces/account/

## Entity Details

Entity Name: Contact
Entity Type: contact
Subtypes: person, company (discriminated by `category` field)
Base Path: /employee/contacts
Navigation Style: sections

## Person Subtype Sections

Overview Section: summary
Main Sections:
1. profile: Profile - Personal details, photo, preferred contact method
2. employment: Employment - Current employer, title, work history
3. social: Social Profiles - LinkedIn, GitHub, portfolio links
4. skills: Skills & Expertise - Skills, certifications, languages
5. preferences: Preferences - Work preferences, availability, rates

Related Data Sections:
- accounts: Accounts (showCount: true) - Associated companies
- submissions: Submissions (showCount: true) - Job applications
- placements: Placements (showCount: true) - Work history
- meetings: Meetings (showCount: true)

## Company Subtype Sections

Overview Section: summary
Main Sections:
1. profile: Company Profile - Legal name, DBA, founded year
2. classification: Classification - Industry, segment, tier
3. locations: Locations (showCount: true) - Office addresses
4. people: Key People (showCount: true) - Contacts at this company
5. hierarchy: Corporate Hierarchy - Parent, subsidiaries

Related Data Sections:
- jobs: Jobs (showCount: true)
- placements: Placements (showCount: true)
- contracts: Contracts (showCount: true)

## Quick Actions (Person)

- email: Email Contact - Mail icon - navigate to mailto
- call: Call - Phone icon - navigate to tel
- add_note: Add Note - StickyNote icon - dialog
- schedule_meeting: Schedule Meeting - Calendar icon - dialog
- add_to_campaign: Add to Campaign - Target icon - dialog
- convert_to_candidate: Convert to Candidate - UserPlus icon - mutation (hideForStatuses: ['candidate'])

## Quick Actions (Company)

- add_contact: Add Contact - UserPlus icon - dialog
- add_job: Add Job - Briefcase icon - dialog
- add_note: Add Note - StickyNote icon - dialog
- schedule_meeting: Schedule Meeting - Calendar icon - dialog

## Implementation Tasks

1. Add contact sections to entity-sections.ts (both subtypes)
2. Update EntityJourneySidebar to handle contact subtypes
3. Create ContactWorkspaceProvider with subtype detection
4. Create ContactHeader component (adapts to subtype)
5. Create ContactOverviewSection (PersonOverview, CompanyOverview)
6. Create other section components
7. Update contact router for getFullContact with subtype data
```

---

### Job Entity

```
Implement a Hublot-inspired workspace for the Job entity.

Reference: Account workspace in /src/components/workspaces/account/

## Entity Details

Entity Name: Job
Entity Type: job
Base Path: /employee/recruiting/jobs
Navigation Style: sections

## Sections Structure

Overview Section: overview
Main Sections:
1. details: Job Details - Title, description, requirements
2. location: Location - Work location, remote options
3. compensation: Compensation - Rate, salary range, benefits
4. skills: Required Skills - Must-have and nice-to-have skills
5. hiring_team: Hiring Team - Client contacts, interviewers

Related Data Sections (Pipeline group):
- pipeline: Pipeline (showCount: true) - All candidates in process
- submissions: Submissions (showCount: true)
- interviews: Interviews (showCount: true)
- offers: Offers (showCount: true)

Tool Sections:
- activities, notes, documents, history

## Quick Actions

- submit_candidate: Submit Candidate - Send icon - dialog (showForStatuses: ['open', 'active'])
- add_note: Add Note - StickyNote icon - dialog
- schedule_interview: Schedule Interview - Calendar icon - dialog
- put_on_hold: Put on Hold - Pause icon - mutation (showForStatuses: ['open', 'active'])
- close_job: Close Job - X icon - mutation (variant: destructive, showForStatuses: ['open', 'on_hold'])
- reopen_job: Reopen Job - RefreshCw icon - mutation (showForStatuses: ['on_hold', 'closed'])

## KPI Cards for Overview

1. Time to Fill - Days open
2. Submissions - Count with breakdown by status
3. Interview Rate - % of submissions interviewed
4. Offer Rate - % of interviews resulting in offers
```

---

### Candidate Entity

```
Implement a Hublot-inspired workspace for the Candidate entity.

Reference: Account workspace in /src/components/workspaces/account/

## Entity Details

Entity Name: Candidate
Entity Type: candidate
Base Path: /employee/recruiting/candidates
Navigation Style: sections

## Sections Structure

Overview Section: summary
Main Sections:
1. profile: Profile - Contact info, work authorization, availability
2. experience: Experience - Work history, education
3. skills: Skills - Technical skills, certifications
4. resumes: Resumes (showCount: true) - Parsed and formatted versions
5. screening: Screening - Notes, assessment results
6. preferences: Preferences - Location, rate, job type preferences

Related Data Sections:
- submissions: Submissions (showCount: true)
- placements: Placements (showCount: true)
- interviews: Interviews (showCount: true)

Tool Sections:
- activities, notes, documents, history

## Quick Actions

- submit_to_job: Submit to Job - Send icon - dialog
- add_note: Add Note - StickyNote icon - dialog
- schedule_call: Schedule Call - Phone icon - dialog
- upload_resume: Upload Resume - Upload icon - dialog
- update_status: Update Status - RefreshCw icon - dialog
- mark_inactive: Mark Inactive - UserX icon - mutation (variant: destructive, showForStatuses: ['active', 'available'])

## KPI Cards for Overview

1. Active Submissions - Count in progress
2. Placements - Total successful placements
3. Interview Rate - % of submissions resulting in interviews
4. Availability - Current availability status
```

---

### Lead Entity

```
Implement a Hublot-inspired workspace for the Lead entity.

Reference: Account workspace in /src/components/workspaces/account/

## Entity Details

Entity Name: Lead
Entity Type: lead
Base Path: /employee/crm/leads
Navigation Style: sections

## Sections Structure

Overview Section: summary
Main Sections:
1. contact: Contact Info - Name, email, phone, company
2. qualification: Qualification - BANT scoring breakdown
3. engagement: Engagement - Activity timeline, touchpoints
4. source: Source - Campaign, referral source, channel

Related Data Sections:
- deals: Deals (showCount: true) - Associated opportunities
- meetings: Meetings (showCount: true)

Tool Sections:
- activities, notes, documents, history

## Quick Actions

- email: Send Email - Mail icon - navigate
- call: Call Lead - Phone icon - navigate
- add_note: Add Note - StickyNote icon - dialog
- schedule_meeting: Schedule Meeting - Calendar icon - dialog
- convert_to_deal: Convert to Deal - TrendingUp icon - dialog (showForStatuses: ['qualified'])
- disqualify: Disqualify - XCircle icon - mutation (variant: destructive)

## KPI Cards for Overview

1. BANT Score - Overall qualification score
2. Engagement Score - Activity engagement level
3. Days in Pipeline - Time since creation
4. Last Contact - Days since last touchpoint
```

---

### Deal Entity

```
Implement a Hublot-inspired workspace for the Deal entity.

Reference: Account workspace in /src/components/workspaces/account/

## Entity Details

Entity Name: Deal
Entity Type: deal
Base Path: /employee/crm/deals
Navigation Style: sections

## Sections Structure

Overview Section: overview
Main Sections:
1. details: Deal Details - Value, stage, probability
2. contacts: Stakeholders (showCount: true) - Decision makers, influencers
3. timeline: Timeline - Key dates, milestones
4. competitors: Competitors - Competitive landscape
5. proposal: Proposal - Pricing, terms, scope

Related Data Sections:
- jobs: Associated Jobs (showCount: true)
- meetings: Meetings (showCount: true)

Tool Sections:
- activities, notes, documents, history

## Quick Actions

- add_stakeholder: Add Stakeholder - UserPlus icon - dialog
- add_note: Add Note - StickyNote icon - dialog
- schedule_meeting: Schedule Meeting - Calendar icon - dialog
- advance_stage: Advance Stage - ArrowRight icon - dialog
- mark_won: Mark as Won - Trophy icon - mutation (showForStatuses: ['proposal', 'negotiation'])
- mark_lost: Mark as Lost - XCircle icon - mutation (variant: destructive)

## KPI Cards for Overview

1. Deal Value - Total contract value
2. Probability - Win probability %
3. Days in Stage - Time in current stage
4. Expected Close - Days until close date
```

---

### Campaign Entity

```
Implement a Hublot-inspired workspace for the Campaign entity.

Reference: Account workspace in /src/components/workspaces/account/

## Entity Details

Entity Name: Campaign
Entity Type: campaign
Base Path: /employee/crm/campaigns
Navigation Style: sections

## Sections Structure

Overview Section: overview
Main Sections:
1. prospects: Prospects (showCount: true) - Campaign audience
2. leads: Leads (showCount: true) - Converted prospects
3. funnel: Funnel - Visual pipeline progression
4. sequence: Sequence - Automation workflow
5. analytics: Analytics - Performance metrics

Tool Sections:
- activities, notes, documents, history

## Quick Actions

- add_prospects: Add Prospects - UserPlus icon - dialog
- pause_campaign: Pause Campaign - Pause icon - mutation (showForStatuses: ['active'])
- resume_campaign: Resume Campaign - Play icon - mutation (showForStatuses: ['paused'])
- add_note: Add Note - StickyNote icon - dialog
- export_report: Export Report - Download icon - mutation
- archive: Archive Campaign - Archive icon - mutation (variant: destructive)

## KPI Cards for Overview

1. Prospects - Total in campaign
2. Leads Generated - Conversions
3. Conversion Rate - % converted
4. Engagement Rate - Open/reply rates
```

---

### Team Entity

```
Implement a Hublot-inspired workspace for the Team entity.

Reference: Account workspace in /src/components/workspaces/account/

## Entity Details

Entity Name: Team
Entity Type: team
Base Path: /employee/settings/teams
Navigation Style: sections

## Sections Structure

Overview Section: summary
Main Sections:
1. details: Team Details - Name, description, department
2. members: Members (showCount: true) - Team members
3. roles: Roles & Permissions - Access control
4. workload: Workload - Assignment distribution
5. performance: Performance - Team metrics

Related Data Sections:
- accounts: Assigned Accounts (showCount: true)
- jobs: Assigned Jobs (showCount: true)

Tool Sections:
- activities, notes, history (no documents)

## Quick Actions

- add_member: Add Member - UserPlus icon - dialog
- remove_member: Remove Member - UserMinus icon - dialog
- add_note: Add Note - StickyNote icon - dialog
- reassign_work: Reassign Work - RefreshCw icon - dialog
- edit_permissions: Edit Permissions - Shield icon - navigate
- archive_team: Archive Team - Archive icon - mutation (variant: destructive)

## KPI Cards for Overview

1. Team Size - Number of members
2. Open Jobs - Jobs assigned to team
3. Active Candidates - Candidates being worked
4. Placements MTD - Month-to-date placements
```

---

## Files to Create/Modify

For each entity, create/modify:

### Navigation Configuration
```
src/lib/navigation/entity-sections.ts      # Add section definitions
src/lib/navigation/entity-journeys.ts      # Add quick actions
src/lib/navigation/entity-navigation.types.ts  # Add entity type (if new)
```

### Workspace Components
```
src/components/workspaces/{entity}/
├── {Entity}WorkspaceProvider.tsx
├── {Entity}Header.tsx
└── sections/
    ├── {Entity}OverviewSection.tsx
    └── {Entity}*Section.tsx
```

### Pages
```
src/app/employee/{module}/{entities}/[id]/
├── layout.tsx    # Data fetching, providers
└── page.tsx      # Section routing
```

### API Router
```
src/server/routers/{entity}.ts   # Add getFullEntity procedure
```

---

## Quality Checklist

Before considering implementation complete:

- [ ] Sidebar uses unified EntityJourneySidebar component
- [ ] Active sidebar items use black highlight (bg-charcoal-900)
- [ ] No colored count badges in sidebar
- [ ] Header has no action buttons (actions in sidebar)
- [ ] KPI cards use monochromatic icons (bg-charcoal-100)
- [ ] Info cards have consistent header pattern
- [ ] Staggered fade-in animations work
- [ ] Collapsible Related/Tools sections work
- [ ] Status badges use correct light/dark variants
- [ ] Quick actions popover shows correct actions for status
- [ ] All sections are navigable via URL params
- [ ] One database call pattern followed in layout
