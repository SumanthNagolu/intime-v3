# Use Case: Run Campaign

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-A01 |
| Actor | Recruiter (Business Development Role) |
| Goal | Create and execute outreach campaigns to generate new leads for business development |
| Frequency | 2-4 campaigns per month per recruiter |
| Estimated Time | 30-60 minutes to set up, ongoing monitoring |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "campaign.create" permission (default for Recruiter role)
3. Target audience data available (prospect list, industry segment, or geographic region)
4. Email templates or messaging assets available
5. Pod Manager approval for campaign budget (if paid channels)

---

## Trigger

One of the following:
- Quarterly business development planning
- Pod Manager assigns lead generation target
- Market opportunity identified in target industry
- New geographic region expansion initiative
- Event-based campaign (conference, webinar, job fair)
- Re-engagement campaign for dormant leads
- Seasonal hiring surge anticipated

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Campaigns

**User Action:** Click "Campaigns" in sidebar under Business Development section

**System Response:**
- Sidebar item highlights with active state
- URL changes to: `/employee/workspace/campaigns`
- Campaigns list screen loads
- Shows active, scheduled, and completed campaigns

**Screen State:**
```
+----------------------------------------------------------+
| CAMPAIGNS                          [+ New Campaign] [Cmd+K]|
+----------------------------------------------------------+
| [Search campaigns...]              [Filter ▼] [Sort ▼]    |
+----------------------------------------------------------+
| ● Active │ ○ Scheduled │ ○ Completed │ ○ Draft │ ○ All    |
+----------------------------------------------------------+
| Status   Campaign Name          Channel    Leads   Conv%  |
| ──────────────────────────────────────────────────────────|
| 🟢 Active  Q4 FinTech Outreach   LinkedIn   42     8.5%   |
| 🟢 Active  DevOps Talent Hunt    Email      28     12.1%  |
| 📅 Sched   Healthcare IT Push    Multi      -      -      |
| ✓ Done    Q3 West Coast BD      Email      156    6.2%   |
+----------------------------------------------------------+
| Showing 4 campaigns                                        |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Click "New Campaign"

**User Action:** Click "+ New Campaign" button

**System Response:**
- Campaign creation wizard opens
- Multi-step form with progress indicator
- Step 1: Campaign Setup focused

**Screen State:**
```
+----------------------------------------------------------+
|                                    Create New Campaign [×]|
+----------------------------------------------------------+
| Step 1 of 5: Campaign Setup                               |
| ○───────○───────○───────○───────○                         |
|                                                           |
| CAMPAIGN BASICS                                           |
|                                                           |
| Campaign Name *                                           |
| [Q4 FinTech Startup Outreach                        ]    |
|                                                           |
| Campaign Type *                                           |
| ○ Lead Generation (New business)                         |
| ○ Re-engagement (Dormant leads/accounts)                 |
| ○ Event Promotion (Conference, webinar)                  |
| ○ Brand Awareness (Thought leadership)                   |
| ○ Candidate Sourcing (Talent pool building)              |
|                                                           |
| Primary Goal *                                            |
| [Generate qualified leads                           ▼]   |
|   - Generate qualified leads                             |
|   - Book discovery meetings                              |
|   - Drive event registrations                            |
|   - Build brand awareness                                |
|   - Expand candidate pool                                |
|                                                           |
| Campaign Owner *                                          |
| [John Smith (You)                               ▼]       |
|                                                           |
| Pod Manager Approval                                      |
| Status: ⏳ Pending (Submit for approval after setup)     |
|                                                           |
+----------------------------------------------------------+
|                         [Cancel]  [Next: Target Audience →]|
+----------------------------------------------------------+
```

**Field Specification: Campaign Name**
| Property | Value |
|----------|-------|
| Field Name | `campaignName` |
| Type | Text Input |
| Label | "Campaign Name" |
| Required | Yes |
| Max Length | 100 characters |
| Placeholder | "e.g., Q4 FinTech Startup Outreach" |

**Field Specification: Campaign Type**
| Property | Value |
|----------|-------|
| Field Name | `campaignType` |
| Type | Radio Button Group |
| Label | "Campaign Type" |
| Required | Yes |
| Options | lead_generation, re_engagement, event_promotion, brand_awareness, candidate_sourcing |
| Default | lead_generation |

**Time:** ~2 minutes

---

### Step 3: Define Target Audience

**User Action:** Click "Next: Target Audience →"

**System Response:**
- Validates Step 1 fields
- Slides to Step 2
- Shows audience definition options

**Screen State:**
```
+----------------------------------------------------------+
|                                    Create New Campaign [×]|
+----------------------------------------------------------+
| Step 2 of 5: Target Audience                              |
| ●───────○───────○───────○───────○                         |
|                                                           |
| AUDIENCE SELECTION                                        |
|                                                           |
| Audience Source *                                         |
| ○ New Prospects (Build from criteria)                    |
| ○ Existing Leads (Select from lead pool)                 |
| ○ Dormant Accounts (Re-engage past clients)              |
| ○ Import List (Upload CSV)                               |
|                                                           |
| PROSPECT CRITERIA (if building from criteria)            |
|                                                           |
| Industry *                                                |
| [Financial Technology (FinTech)                   ▼]     |
|   ☑ Financial Technology (FinTech)                       |
|   ☑ Banking & Finance                                    |
|   ☐ Insurance                                            |
|   ☐ Healthcare                                           |
|                                                           |
| Company Size *                                            |
| [Select company sizes...                          ▼]     |
|   ☑ 51-200 employees                                     |
|   ☑ 201-500 employees                                    |
|   ☑ 501-1000 employees                                   |
|   ☐ 1001-5000 employees                                  |
|   ☐ 5000+ employees                                      |
|                                                           |
| Geographic Region *                                       |
| [Select regions...                                ▼]     |
|   ☑ North America - West Coast                           |
|   ☑ North America - East Coast                           |
|   ☐ Europe - UK & Ireland                                |
|   ☐ Europe - DACH                                        |
|   ☐ APAC - Australia/NZ                                  |
|                                                           |
| Funding Stage (Optional)                                  |
| [Select stages...                                 ▼]     |
|   ☑ Series A                                             |
|   ☑ Series B                                             |
|   ☑ Series C+                                            |
|                                                           |
| Job Titles to Target *                                    |
| [VP Engineering, CTO, Director of Engineering      ]     |
| [+ Add more titles]                                       |
|                                                           |
| Exclusions                                                |
| ☑ Exclude existing clients                               |
| ☑ Exclude leads contacted in last 90 days                |
| ☑ Exclude competitors                                    |
|                                                           |
| ESTIMATED AUDIENCE SIZE: ~2,450 prospects                |
|                                                           |
+----------------------------------------------------------+
|            [← Back]  [Cancel]  [Next: Channel Setup →]   |
+----------------------------------------------------------+
```

**Field Specification: Industry**
| Property | Value |
|----------|-------|
| Field Name | `targetIndustries` |
| Type | Multi-select Dropdown |
| Label | "Industry" |
| Required | Yes |
| Options | 50+ industry categories |
| Max Selection | 5 industries |

**Field Specification: Geographic Region**
| Property | Value |
|----------|-------|
| Field Name | `targetRegions` |
| Type | Multi-select Dropdown |
| Label | "Geographic Region" |
| Required | Yes |
| Options | Hierarchical regions (Continent → Country → Region) |
| Multi-Currency | USD, CAD, EUR, GBP, AUD, INR |

**Time:** ~3 minutes

---

### Step 4: Configure Campaign Channels

**User Action:** Click "Next: Channel Setup →"

**System Response:**
- Validates Step 2 fields
- Slides to Step 3
- Shows channel configuration options

**Screen State:**
```
+----------------------------------------------------------+
|                                    Create New Campaign [×]|
+----------------------------------------------------------+
| Step 3 of 5: Channel Setup                                |
| ●───────●───────○───────○───────○                         |
|                                                           |
| CAMPAIGN CHANNELS                                         |
|                                                           |
| Select Outreach Channels *                                |
| ┌────────────────────────────────────────────────────┐  |
| │                                                     │  |
| │ ☑ LinkedIn Outreach                                 │  |
| │   Connection requests + InMail sequences            │  |
| │   Est. reach: 1,200 | Avg. response: 8-12%         │  |
| │   [Configure Sequence →]                            │  |
| │                                                     │  |
| │ ☑ Email Campaign                                    │  |
| │   Automated email sequences (4-6 touchpoints)       │  |
| │   Est. reach: 2,100 | Avg. open: 25-35%            │  |
| │   [Configure Sequence →]                            │  |
| │                                                     │  |
| │ ☐ Phone Outreach                                    │  |
| │   Cold calling with script guidance                 │  |
| │   Est. reach: 500 | Avg. connect: 15-20%           │  |
| │   [Configure Script →]                              │  |
| │                                                     │  |
| │ ☐ Event Invitation                                  │  |
| │   Webinar/conference invite sequences               │  |
| │   Est. reach: varies | Avg. registration: 5-10%    │  |
| │   [Configure Event →]                               │  |
| │                                                     │  |
| │ ☐ Direct Mail                                       │  |
| │   Physical mail (premium accounts only)             │  |
| │   Est. reach: 100 | Avg. response: 3-5%            │  |
| │   [Configure →]                                     │  |
| │                                                     │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| MULTI-CHANNEL ORCHESTRATION                              |
| ☑ Coordinate touchpoints across channels                 |
| ☑ De-duplicate to avoid over-contacting                  |
| ☑ Respect timezone for optimal delivery                  |
|                                                           |
| COMPLIANCE SETTINGS                                       |
| ☑ GDPR compliant (EU prospects)                          |
| ☑ CAN-SPAM compliant (US email)                          |
| ☑ CASL compliant (Canada)                                |
| ☑ Include unsubscribe option in all emails               |
|                                                           |
+----------------------------------------------------------+
|          [← Back]  [Cancel]  [Next: Content & Schedule →]|
+----------------------------------------------------------+
```

**Time:** ~3 minutes

---

### Step 5: Configure Email Sequence

**User Action:** Click "Configure Sequence →" under Email Campaign

**System Response:**
- Nested modal opens for email sequence configuration
- Shows sequence builder with templates

**Screen State:**
```
+----------------------------------------------------------+
|                            Email Sequence Configuration [×]|
+----------------------------------------------------------+
|                                                           |
| SEQUENCE NAME: Q4 FinTech Outreach - Email               |
|                                                           |
| EMAIL SEQUENCE STEPS                                      |
| ┌────────────────────────────────────────────────────┐  |
| │ Step 1: Initial Outreach              Day 0         │  |
| │ Subject: Scaling your engineering team in 2025?     │  |
| │ Template: [FinTech Growth Intro              ▼]    │  |
| │ [Preview] [Edit]                                    │  |
| │                                                     │  |
| │ Step 2: Follow-up #1                  Day 3         │  |
| │ Subject: Re: Scaling your engineering team          │  |
| │ Template: [Value Proposition Follow-up      ▼]     │  |
| │ [Preview] [Edit]                                    │  |
| │                                                     │  |
| │ Step 3: Case Study Share              Day 7         │  |
| │ Subject: How [Similar Company] scaled their team    │  |
| │ Template: [Case Study Email             ▼]         │  |
| │ [Preview] [Edit]                                    │  |
| │                                                     │  |
| │ Step 4: Value Add                     Day 12        │  |
| │ Subject: Industry insights for FinTech hiring       │  |
| │ Template: [Thought Leadership          ▼]          │  |
| │ [Preview] [Edit]                                    │  |
| │                                                     │  |
| │ Step 5: Final Follow-up               Day 18        │  |
| │ Subject: Last touch - here to help                  │  |
| │ Template: [Gentle Close               ▼]           │  |
| │ [Preview] [Edit]                                    │  |
| │                                                     │  |
| │ [+ Add Step]                                        │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| STOP CONDITIONS                                           |
| Stop sequence when prospect:                              |
| ☑ Replies to any email                                   |
| ☑ Books a meeting                                        |
| ☑ Unsubscribes                                           |
| ☑ Opens email and clicks link                            |
|                                                           |
| SENDING SETTINGS                                          |
| Send Time: [Business hours (9 AM - 5 PM)          ▼]    |
| Timezone: ☑ Respect prospect's timezone                  |
| Daily Limit: [100  ] emails per day                      |
| Throttle: [Spread throughout day               ▼]        |
|                                                           |
+----------------------------------------------------------+
|                         [Cancel]  [Save Sequence ✓]      |
+----------------------------------------------------------+
```

**Time:** ~5 minutes

---

### Step 6: Set Campaign Schedule

**User Action:** Complete channel configuration, click "Next: Content & Schedule →"

**System Response:**
- Validates Step 3 fields
- Slides to Step 4
- Shows schedule configuration

**Screen State:**
```
+----------------------------------------------------------+
|                                    Create New Campaign [×]|
+----------------------------------------------------------+
| Step 4 of 5: Schedule & Budget                            |
| ●───────●───────●───────○───────○                         |
|                                                           |
| CAMPAIGN SCHEDULE                                         |
|                                                           |
| Campaign Start Date *                                     |
| [12/09/2025                                     📅]      |
|                                                           |
| Campaign End Date *                                       |
| [01/31/2026                                     📅]      |
| Duration: 54 days                                         |
|                                                           |
| Campaign Status at Launch                                 |
| ○ Launch immediately at start date                       |
| ○ Start paused (manual activation required)              |
|                                                           |
| BUDGET (Optional)                                         |
|                                                           |
| LinkedIn Credits                                          |
| Allocated InMail Credits: [250  ]                        |
| Estimated cost: $250 USD                                  |
|                                                           |
| Email Platform                                            |
| Monthly email sends: [3000 ] (within plan limits)        |
|                                                           |
| Other Costs                                               |
| List acquisition: [$    0  ]                             |
| Event costs:      [$    0  ]                             |
| Direct mail:      [$    0  ]                             |
|                                                           |
| TOTAL ESTIMATED BUDGET: $250                             |
| □ Requires Pod Manager approval (budgets > $500)         |
|                                                           |
| GOALS & TARGETS                                           |
|                                                           |
| Lead Generation Target                                    |
| Target Leads: [50  ] qualified leads                     |
| Based on: 2,450 prospects × 8% response × 25% qualified  |
|                                                           |
| Meeting Target                                            |
| Target Meetings: [10  ] discovery calls booked           |
| Based on: 50 leads × 20% meeting conversion              |
|                                                           |
| Revenue Target (Optional)                                 |
| Target Revenue: [$75,000  ] from new accounts            |
| Based on: $7.5K average deal size                        |
|                                                           |
+----------------------------------------------------------+
|          [← Back]  [Cancel]  [Next: Review & Launch →]   |
+----------------------------------------------------------+
```

**Field Specification: Campaign Start Date**
| Property | Value |
|----------|-------|
| Field Name | `startDate` |
| Type | Date Picker |
| Label | "Campaign Start Date" |
| Required | Yes |
| Min Date | Today |
| Max Date | Today + 90 days |

**Field Specification: Lead Generation Target**
| Property | Value |
|----------|-------|
| Field Name | `targetLeads` |
| Type | Number Input |
| Label | "Target Leads" |
| Required | Yes |
| Min | 1 |
| Max | 10000 |
| Helper Text | System calculates estimate based on audience and historical conversion rates |

**Time:** ~3 minutes

---

### Step 7: Review and Launch Campaign

**User Action:** Click "Next: Review & Launch →"

**System Response:**
- Validates Step 4 fields
- Slides to Step 5
- Shows complete campaign summary

**Screen State:**
```
+----------------------------------------------------------+
|                                    Create New Campaign [×]|
+----------------------------------------------------------+
| Step 5 of 5: Review & Launch                              |
| ●───────●───────●───────●───────○                         |
|                                                           |
| CAMPAIGN SUMMARY                                          |
|                                                           |
| Campaign: Q4 FinTech Startup Outreach                    |
| Type: Lead Generation                                     |
| Owner: John Smith                                         |
|                                                           |
| TARGET AUDIENCE                                           |
| Industries: FinTech, Banking & Finance                   |
| Company Size: 51-1000 employees                          |
| Regions: North America (West & East Coast)               |
| Funding Stage: Series A, B, C+                           |
| Target Titles: VP Engineering, CTO, Dir. Engineering     |
| Estimated Reach: 2,450 prospects                         |
|                                                           |
| CHANNELS                                                  |
| ✅ LinkedIn Outreach (5-step sequence)                   |
| ✅ Email Campaign (5-step sequence)                      |
|                                                           |
| SCHEDULE                                                  |
| Start: December 9, 2025                                   |
| End: January 31, 2026 (54 days)                          |
| Status: Launch immediately                                |
|                                                           |
| TARGETS                                                   |
| Leads: 50 qualified leads                                 |
| Meetings: 10 discovery calls                              |
| Revenue: $75,000                                          |
|                                                           |
| BUDGET                                                    |
| LinkedIn Credits: $250                                    |
| Total: $250 (within self-approval limit)                 |
|                                                           |
| PRE-LAUNCH CHECKLIST                                      |
| ☑ Audience criteria defined                              |
| ☑ Email sequences configured                             |
| ☑ LinkedIn sequences configured                          |
| ☑ Compliance settings enabled                            |
| ☑ Stop conditions set                                    |
| ☑ Goals and targets defined                              |
|                                                           |
| NOTIFICATIONS                                             |
| Upon launch, the following will be notified:              |
| ✓ Pod Manager (Sarah Johnson) - Campaign started         |
| ✓ You - Daily performance summary                        |
|                                                           |
|                                                           |
| ⚠️  Ready to Launch                                       |
| This campaign will start sending on December 9, 2025.     |
| Make sure all sequences and templates are finalized.      |
|                                                           |
+----------------------------------------------------------+
|  [← Back]  [Save as Draft]  [Cancel]  [Launch Campaign ✓]|
+----------------------------------------------------------+
```

**Time:** ~2 minutes to review

---

### Step 8: Launch Campaign

**User Action:** Click "Launch Campaign ✓"

**System Response:**

1. **Campaign record created** (~100ms)
   ```sql
   INSERT INTO campaigns (
     id, org_id, name, campaign_type, goal,
     owner_id, start_date, end_date,
     target_industries, target_company_sizes, target_regions,
     target_titles, audience_size,
     channels, sequences,
     budget_total, target_leads, target_meetings, target_revenue,
     status, created_by, created_at, updated_at
   ) VALUES (...);
   ```

2. **Prospect list generated** (~2-5 seconds)
   - Queries prospect database with criteria
   - De-duplicates against existing leads
   - Creates campaign_prospects records

3. **Sequences activated** (~500ms)
   - LinkedIn sequence scheduled
   - Email sequence scheduled
   - First batch queued for start date

4. **Notifications sent** (~1 second)
   - Email to Pod Manager: Campaign launched
   - In-app notification: Campaign active

5. **On Success:**
   - Modal closes (300ms animation)
   - Toast: "Campaign launched successfully! First messages send Dec 9"
   - Redirects to campaign detail page
   - Campaign appears in active list

**Screen State (Campaign Detail):**
```
+----------------------------------------------------------+
| [← Back to Campaigns]                    Campaign Detail  |
+----------------------------------------------------------+
|                                                           |
| Q4 FinTech Startup Outreach                              |
| Status: 🟢 Active (Scheduled)           [Pause] [Edit]   |
| Owner: John Smith                                         |
| Launch: December 9, 2025 (4 days away)                   |
|                                                           |
+----------------------------------------------------------+
| Overview | Prospects | Activity | Analytics | Settings   |
+----------------------------------------------------------+
|                                                           |
| CAMPAIGN PROGRESS                                         |
| ┌────────────────────────────────────────────────────┐  |
| │ Prospects:   2,450 enrolled                         │  |
| │ Contacted:   0 (0%) - Starts Dec 9                  │  |
| │ Responded:   0                                       │  |
| │ Leads:       0 / 50 target                          │  |
| │ Meetings:    0 / 10 target                          │  |
| │                                                     │  |
| │ Progress: ░░░░░░░░░░░░░░░░░░░░ 0%                  │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| CHANNEL STATUS                                            |
| ┌────────────────────────────────────────────────────┐  |
| │ LinkedIn:  🟢 Ready (1,200 prospects)              │  |
| │ Email:     🟢 Ready (2,100 prospects)              │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| TIMELINE                                                  |
| ┌────────────────────────────────────────────────────┐  |
| │ Dec 5  - Campaign created                          │  |
| │ Dec 9  - First outreach sends (Day 1)              │  |
| │ Dec 12 - Follow-up #1 (Day 3)                      │  |
| │ Dec 16 - Case study (Day 7)                        │  |
| │ ...                                                │  |
| │ Jan 31 - Campaign ends                             │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~5-7 seconds total

---

## Postconditions

1. ✅ Campaign record created in `campaigns` table
2. ✅ Prospect list generated and linked to campaign
3. ✅ Email/LinkedIn sequences scheduled for start date
4. ✅ Pod Manager notified of campaign launch
5. ✅ Campaign appears in active campaigns list
6. ✅ Analytics tracking initialized
7. ✅ Compliance settings applied (GDPR, CAN-SPAM, etc.)
8. ✅ Budget allocated and tracked

---

## Events Logged

| Event | Payload |
|-------|---------|
| `campaign.created` | `{ campaign_id, name, type, owner_id, start_date, audience_size, created_at }` |
| `campaign.launched` | `{ campaign_id, channels, sequences, prospect_count, launched_at }` |
| `campaign.prospect_enrolled` | `{ campaign_id, prospect_id, channel, sequence_step }` |
| `notification.sent` | `{ type: 'campaign_launched', recipients: [...], campaign_id }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Empty Audience | No prospects match criteria | "No prospects found matching your criteria. Please broaden your search." | Adjust criteria |
| Invalid Email Template | Template has merge errors | "Email template has errors: {{company_name}} not found" | Fix template |
| Budget Exceeded | Total > approval limit | "Budget of $750 requires Pod Manager approval" | Submit for approval |
| Schedule Conflict | Start date in past | "Start date must be in the future" | Select future date |
| Duplicate Campaign | Same name exists | "Campaign with this name already exists" | Rename campaign |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `n` | New campaign |
| `e` | Edit campaign |
| `p` | Pause/Resume campaign |
| `d` | Duplicate campaign |
| `g` then `c` | Go to campaigns |

---

## Alternative Flows

### A1: Import Prospect List from CSV

1. Select "Import List" as audience source
2. Upload CSV file with required columns (name, email, company, title)
3. System validates and maps columns
4. Preview imported data
5. Confirm import and create campaign

### A2: Re-engagement Campaign for Dormant Leads

1. Select "Re-engagement" campaign type
2. Filter leads by last contact date (>90 days, >180 days, etc.)
3. Use re-engagement specific templates
4. Shorter sequence (3 touchpoints)
5. Different success metrics (reactivation rate)

### A3: Event-Based Campaign

1. Select "Event Promotion" campaign type
2. Link to event (webinar, conference, job fair)
3. Include event registration CTA
4. Track registration conversions
5. Post-event follow-up sequence

---

## Related Use Cases

- [A02-track-campaign-metrics.md](./A02-track-campaign-metrics.md) - Monitor campaign performance
- [A03-generate-lead-from-campaign.md](./A03-generate-lead-from-campaign.md) - Convert responses to leads
- [A04-create-lead.md](./A04-create-lead.md) - Manual lead creation
- [B01-prospect-new-client.md](./B01-prospect-new-client.md) - Individual prospecting

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Create campaign with all fields | Campaign created successfully |
| TC-002 | Launch campaign with LinkedIn + Email | Both channels scheduled |
| TC-003 | Prospect criteria returns 0 results | Warning shown, cannot launch |
| TC-004 | Budget exceeds self-approval limit | Routes to Pod Manager for approval |
| TC-005 | Duplicate prospect in multiple campaigns | De-duplicated, enrolled once |
| TC-006 | Cancel campaign before launch | Campaign saved as draft |
| TC-007 | Edit running campaign | Only future steps editable |
| TC-008 | Prospect responds (positive) | Sequence stops, lead created |
| TC-009 | Prospect unsubscribes | Sequence stops, marked unsubscribed |
| TC-010 | Campaign end date reached | Status changes to completed |

---

## Backend Processing

### tRPC Procedures

- `campaigns.create` - Create campaign record
- `campaigns.generateProspects` - Build prospect list from criteria
- `campaigns.launch` - Activate campaign sequences
- `campaigns.pause` - Pause running campaign
- `campaigns.getMetrics` - Fetch campaign analytics

### Database Schema

**Table:** `campaigns`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `org_id` | UUID | FK to organizations |
| `name` | VARCHAR(100) | Campaign name |
| `campaign_type` | ENUM | lead_generation, re_engagement, event_promotion, brand_awareness, candidate_sourcing |
| `goal` | VARCHAR(50) | Primary goal |
| `owner_id` | UUID | FK to users |
| `start_date` | DATE | Campaign start |
| `end_date` | DATE | Campaign end |
| `target_criteria` | JSONB | Industry, size, region, titles |
| `audience_size` | INTEGER | Number of prospects |
| `channels` | TEXT[] | linkedin, email, phone, etc. |
| `sequences` | JSONB | Sequence configurations |
| `budget_total` | DECIMAL | Total budget |
| `target_leads` | INTEGER | Lead target |
| `target_meetings` | INTEGER | Meeting target |
| `target_revenue` | DECIMAL | Revenue target |
| `status` | ENUM | draft, scheduled, active, paused, completed |
| `approval_status` | ENUM | pending, approved, rejected |
| `created_by` | UUID | Creator |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

**Table:** `campaign_prospects`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `campaign_id` | UUID | FK to campaigns |
| `prospect_id` | UUID | FK to prospects/leads |
| `channel` | VARCHAR(20) | Primary channel |
| `sequence_step` | INTEGER | Current step in sequence |
| `status` | ENUM | pending, contacted, responded, converted, unsubscribed |
| `first_contacted_at` | TIMESTAMP | |
| `last_contacted_at` | TIMESTAMP | |
| `responded_at` | TIMESTAMP | |
| `converted_at` | TIMESTAMP | |

---

## Multi-National Considerations

| Feature | Implementation |
|---------|----------------|
| **Timezone Handling** | All sends respect prospect's local timezone |
| **Language** | Templates support multi-language (EN, FR, DE, ES) |
| **Compliance** | GDPR (EU), CAN-SPAM (US), CASL (CA), LGPD (Brazil) |
| **Currency** | Budget displayed in user's preferred currency |
| **Regional Teams** | Campaigns can be scoped to regional territories |
| **Working Hours** | Sends only during local business hours |

---

*Last Updated: 2025-12-05*

