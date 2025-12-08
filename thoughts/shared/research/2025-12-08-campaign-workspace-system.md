---
date: 2025-12-08T10:19:46-05:00
researcher: Claude
git_commit: 6f15b8b
branch: main
repository: intime-v3
topic: "Campaign Workspace System - Complete Architecture"
tags: [research, codebase, campaigns, crm, activities, lead-generation]
status: complete
last_updated: 2025-12-08
last_updated_by: Claude
---

# Research: Campaign Workspace System - Complete Architecture

**Date**: 2025-12-08T10:19:46-05:00
**Researcher**: Claude
**Git Commit**: 6f15b8b
**Branch**: main
**Repository**: intime-v3

## Research Question

How does the Campaign workspace function from creation through activities to natural culminations (lead, deal, account, or failure)? What files and line numbers are relevant?

## Summary

The Campaign system in InTime v3 is a comprehensive outbound sales/marketing platform with two parallel implementations:
1. **`campaigns` table** - TA/HR campaigns for talent sourcing
2. **`crm_campaigns` table** - Sales/marketing campaigns for business development

The current UI at `/employee/crm/campaigns/[id]` uses a component-based approach (not metadata-driven). The system tracks prospects through a complete engagement funnel (Enrolled → Contacted → Opened → Clicked → Responded → Leads → Meetings) and supports conversion to qualified leads with BANT scoring.

## Detailed Findings

### 1. Campaign Pages & Components

#### App Routes (Next.js Pages)

| Route | File | Purpose |
|-------|------|---------|
| `/employee/crm/campaigns` | `src/app/employee/crm/campaigns/page.tsx` | Campaign list |
| `/employee/crm/campaigns/[id]` | `src/app/employee/crm/campaigns/[id]/page.tsx` | Campaign detail |
| Layout | `src/app/employee/crm/campaigns/layout.tsx` | Layout wrapper |

#### Campaign Components

**Location**: `src/components/crm/campaigns/`

| File | Purpose |
|------|---------|
| `CampaignsListPage.tsx` | Campaign list view with table/cards |
| `CampaignDetailPage.tsx` | Campaign detail view (screenshot page) |
| `CreateCampaignDialog.tsx` | Multi-step campaign creation wizard |
| `EditCampaignDialog.tsx` | Campaign editing |
| `DuplicateCampaignDialog.tsx` | Campaign duplication |
| `ConvertProspectDialog.tsx` | Convert campaign prospect to lead |
| `index.ts` | Component exports |

#### Archived Screen Definitions (Metadata-driven)

**Location**: `.archive/ui-reference/screens/crm/`

| File | Purpose |
|------|---------|
| `campaign-list.screen.ts` | Metadata for campaign list |
| `campaign-detail.screen.ts` | Metadata for campaign detail |
| `campaign-form.screen.ts` | Metadata for campaign form |

**Note**: These are archived and not actively used. Current implementation is component-based.

---

### 2. CRM Router - Campaign Procedures

**Location**: `src/server/routers/crm.ts`

**Campaigns Sub-Router**: Lines 4120-4817

#### CRUD Procedures

| Procedure | Lines | Purpose |
|-----------|-------|---------|
| `campaigns.list` | 4122-4189 | Paginated list with filtering/sorting |
| `campaigns.getById` | 4192-4238 | Single campaign with funnel metrics and channel performance |
| `campaigns.create` | 4241-4346 | Multi-step wizard creation (A01 spec) |
| `campaigns.update` | 4348-4396 | Update campaign fields |
| `campaigns.updateStatus` | 4398-4437 | Change workflow status (pause/resume/complete) |
| `campaigns.delete` | 4742-4762 | Soft delete |
| `campaigns.duplicate` | 4765-4816 | Clone campaign |

#### Prospect Management Procedures

| Procedure | Lines | Purpose |
|-----------|-------|---------|
| `campaigns.getProspects` | 4511-4549 | List prospects with status filtering |
| `campaigns.addProspects` | 4552-4605 | Bulk add prospects to campaign |
| `campaigns.convertProspectToLead` | 4608-4739 | Convert prospect to qualified lead (A03 spec) |

#### Analytics Procedure

| Procedure | Lines | Purpose |
|-----------|-------|---------|
| `campaigns.getMetrics` | 4440-4508 | Funnel, channel performance, daily trends, budget, costs (A02 spec) |

#### Create Campaign Input Structure (lines 4242-4293)

**Step 1: Campaign Setup**
- `name`: 3-100 characters
- `campaignType`: `lead_generation`, `re_engagement`, `event_promotion`, `brand_awareness`, `candidate_sourcing`
- `goal`: `generate_qualified_leads`, `book_discovery_meetings`, etc.

**Step 2: Target Audience**
- `targetCriteria.audienceSource`: `new_prospects`, `existing_leads`, `dormant_accounts`, `import_list`
- `targetCriteria.industries`, `companySizes`, `regions`, `fundingStages`, `targetTitles`
- `targetCriteria.exclusions`: Boolean/numeric exclusion rules

**Step 3: Channels**
- `channels`: `linkedin`, `email`, `phone`, `event`, `direct_mail`
- `sequences`: Channel-specific sequence configurations with steps, stop conditions, send times

**Step 4: Schedule & Budget**
- `startDate`, `endDate`, `launchImmediately`
- `budgetTotal`, `budgetCurrency`, `targetLeads`, `targetMeetings`, `targetRevenue`

**Step 5: Compliance**
- `complianceSettings`: GDPR, CAN-SPAM, CASL flags

---

### 3. Database Schema

#### Core Campaign Tables

**`campaigns` table** (TA/HR campaigns)
- **Spec**: `docs/specs/10-DATABASE/02-CRM/campaigns.md`
- **Migration**: `supabase/migrations/20260115000000_campaigns_and_lead_credits.sql:12-135`

Key columns:
- Core: `id`, `org_id`, `name`, `description`, `campaign_type`, `goal`, `status`, `owner_id`
- Targeting: `target_criteria` (JSONB), `target_audience`, `target_locations[]`, `target_skills[]`
- Channels: `channels[]`, `sequences` (JSONB)
- A/B Testing: `is_ab_test`, `variant_a_template_id`, `variant_b_template_id`, `ab_split_percentage`
- Budget: `budget_total`, `budget_spent`, `target_leads`, `target_meetings`, `target_revenue`
- Metrics (denormalized): `audience_size`, `prospects_contacted`, `prospects_opened`, `prospects_clicked`, `prospects_responded`, `leads_generated`, `meetings_booked`
- Approval: `approval_status`, `approved_by`, `approved_at`
- Compliance: `compliance_settings` (JSONB)

**`crm_campaigns` table** (Sales/Marketing campaigns)
- **Spec**: `docs/specs/10-DATABASE/02-CRM/crm_campaigns.md`
- Simpler structure for business development campaigns

#### Supporting Tables

| Table | Spec Location | Purpose |
|-------|---------------|---------|
| `campaign_prospects` | Migration:140-212 | Prospects enrolled in campaigns with engagement tracking |
| `campaign_sequence_logs` | Migration:217-253 | Action/interaction logs for sequences |
| `crm_campaign_content` | `docs/specs/10-DATABASE/02-CRM/crm_campaign_content.md` | Email templates and assets |
| `crm_campaign_metrics` | `docs/specs/10-DATABASE/02-CRM/crm_campaign_metrics.md` | Performance metrics |
| `crm_campaign_targets` | `docs/specs/10-DATABASE/02-CRM/crm_campaign_targets.md` | Target contacts with engagement tracking |
| `campaign_contacts` | `docs/specs/10-DATABASE/02-CRM/campaign_contacts.md` | TA/HR campaign contacts |
| `lead_sourcing_credits` | Migration:258-296 | Cross-pillar lead attribution |

#### Database Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `get_campaign_funnel(p_campaign_id)` | Migration:453-489 | Returns funnel metrics (prospects→contacted→opened→clicked→responded→leads→meetings) |
| `get_campaign_channel_performance(p_campaign_id)` | Migration:505-524 | Returns per-channel performance breakdown |
| `calculate_lead_score(...)` | Migration:528-560 | Calculates lead score 0-100 based on engagement and fit |

#### Status Workflows

**Campaign Status**: `draft` → `scheduled` → `active` → [`paused`] → `completed`

**Prospect Status**: `enrolled` → `contacted` → `engaged` → `responded` → `converted` (or `unsubscribed`/`bounced`)

**Sequence Status**: `pending` → `in_progress` → [`stopped`] → `completed`

---

### 4. Activity System Integration

#### Activity Tables

| Table | Used For |
|-------|----------|
| `activities` | Recruiting, ATS, submissions, placements, candidates, jobs |
| `crm_activities` | Accounts, leads, deals, campaigns, contacts |

#### Campaign Activity Creation (in crm.ts)

**Campaign Created** (lines 4333-4343):
```typescript
await adminClient.from('crm_activities').insert({
  org_id: orgId,
  entity_type: 'campaign',
  entity_id: data.id,
  activity_type: 'note',
  subject: 'Campaign Created',
  description: `Campaign "${input.name}" created with ${input.channels.length} channels`,
  created_by: user?.id,
})
```

**Campaign Status Changed** (lines 4424-4434):
```typescript
await adminClient.from('crm_activities').insert({
  org_id: orgId,
  entity_type: 'campaign',
  entity_id: input.id,
  activity_type: 'note',
  subject: status === 'active' ? 'Campaign Resumed' : status === 'paused' ? 'Campaign Paused' : 'Campaign Completed',
  description: `Campaign status changed to ${status}`,
  created_by: user?.id,
})
```

**Lead Created from Campaign** (lines 4726-4736):
```typescript
await adminClient.from('crm_activities').insert({
  org_id: orgId,
  entity_type: 'lead',
  entity_id: lead.id,
  activity_type: 'note',
  subject: 'Lead Created from Campaign',
  description: `Lead created from campaign "${prospect.campaign?.name}" with ${input.interestLevel} interest`,
  created_by: user?.id,
})
```

#### Activity Pattern References

- **Framework Spec**: `docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md`
- **Pattern Library**: `docs/specs/20-USER-ROLES/02-ACTIVITY-PATTERN-LIBRARY.md`
- **Activities Router**: `src/server/routers/activities.ts`
- **Workflow Action Executor**: `src/lib/workflows/action-executor.ts:221-262`

#### Activity Query Pattern (CRM)

**Location**: `src/server/routers/crm.ts:3915-3945`

```typescript
let query = adminClient
  .from('crm_activities')
  .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
  .eq('org_id', orgId)
  .eq('entity_type', 'account')  // or 'campaign', 'lead', etc.
  .eq('entity_id', input.accountId)
  .order('created_at', { ascending: false })
```

---

### 5. Campaign Lifecycle & Conversion Flow

#### Campaign Creation Workflow (A01 Spec)

**Spec**: `docs/specs/20-USER-ROLES/01-recruiter/A01-run-campaign.md`

1. **Campaign Setup** (Draft)
   - Set name, type, goal, description
   - Assign owner

2. **Audience Definition**
   - Configure targeting criteria
   - Set exclusion rules
   - Define audience source

3. **Channel & Sequence Configuration**
   - Select channels (LinkedIn, Email, Phone, Event, Direct Mail)
   - Configure multi-step sequences with timing
   - Set stop conditions

4. **Schedule & Budget**
   - Set dates, budget, targets
   - Configure approval workflow (required for budgets >$500)

5. **Launch**
   - Status changes to `active` or `scheduled`
   - Prospects enrolled automatically

#### Prospect Engagement Funnel

```
Enrolled (2,450)
    ↓
Contacted (1,847) - 75.4%
    ↓
Opened (782) - 42.3%
    ↓
Clicked (161) - 8.7%
    ↓
Responded (32) - 1.3%
    ↓
Leads (6) - 20% of responses
    ↓
Meetings (2)
```

#### Lead Conversion Process (A03 Spec)

**Spec**: `docs/specs/20-USER-ROLES/01-recruiter/A03-generate-lead-from-campaign.md`

**Trigger Conditions**:
- Positive response to campaign
- LinkedIn connection + interest
- Information or meeting request
- Lead score threshold (>80)

**Conversion Steps** (in `convertProspectToLead` lines 4608-4739):

1. **Validate Prospect** (lines 4639-4648)
   - Fetch prospect with campaign data
   - Verify not already converted

2. **Create Lead** (lines 4656-4693)
   - Copy prospect data to leads table
   - Set `source = 'campaign'`
   - Link to `campaign_id` and `campaign_prospect_id`
   - Set initial status to `qualified`

3. **BANT Qualification** (lines 4674-4688)
   - Budget: `unknown`, `limited`, `defined`, `approved`
   - Authority: `unknown`, `influencer`, `decision_maker`, `champion`
   - Need: `unknown`, `identified`, `defined`, `urgent`
   - Timeline: `unknown`, `long`, `medium`, `short`

4. **Update Prospect** (lines 4700-4707)
   - Set status to `converted`
   - Record conversion timestamp
   - Link to created lead

5. **Create Follow-up Task** (lines 4710-4723)
   - Automatic task with due date
   - Priority derived from urgency

6. **Log Activity** (lines 4726-4736)
   - Creates activity on lead entity
   - Documents campaign source

#### Lead Scoring Algorithm (Migration:528-560)

**Maximum 100 Points**:

| Category | Signals | Max Points |
|----------|---------|------------|
| Engagement | Opens (3pt each, max 15), Clicks (5pt each, max 15), Reply (10pt) | 40 |
| Company Fit | Industry match (10pt), Size match (10pt), Funding match (10pt) | 30 |
| Response Quality | Positive sentiment (10pt), Mentions hiring (10pt), Requests meeting (10pt) | 30 |

---

### 6. Metrics & Analytics (A02 Spec)

**Spec**: `docs/specs/20-USER-ROLES/01-recruiter/A02-track-campaign-metrics.md`

#### Metrics Retrieved (lines 4440-4508)

**Funnel Metrics** (via `get_campaign_funnel` RPC):
- `total_prospects`, `contacted`, `opened`, `clicked`, `responded`, `leads`, `meetings`
- `open_rate`, `response_rate`, `conversion_rate`

**Channel Performance** (via `get_campaign_channel_performance` RPC):
- Per-channel breakdown: sent, open_rate, click_rate, response_rate, leads

**Daily Trends** (from `campaign_sequence_logs`):
- Last 14 days of action logs
- Ordered by `action_at` chronologically

**Budget & Costs** (calculated):
- `costPerLead`: `budgetSpent / leadsGenerated`
- `costPerMeeting`: `budgetSpent / meetingsBooked`

#### Key Benchmarks

| Metric | Target |
|--------|--------|
| Open Rate | 35-45% |
| Click Rate | 8-12% |
| Response Rate | 6-10% |
| Conversion Rate (Response→Lead) | 15-25% |
| Cost per Lead | <$10 |
| Cost per Meeting | <$50 |
| ROI | >10x |

---

### 7. Navigation Configuration

**Top Navigation**: `src/lib/navigation/top-navigation.ts`
- CRM dropdown includes Campaigns link

**Recruiter Navigation**: `src/lib/navigation/recruiterNavConfig.ts`
- Campaigns section for recruiter role

---

## Code References

### Campaign Pages
- `src/app/employee/crm/campaigns/page.tsx` - Campaign list route
- `src/app/employee/crm/campaigns/[id]/page.tsx` - Campaign detail route
- `src/app/employee/crm/campaigns/layout.tsx` - Layout wrapper

### Campaign Components
- `src/components/crm/campaigns/CampaignsListPage.tsx` - List view
- `src/components/crm/campaigns/CampaignDetailPage.tsx` - Detail view
- `src/components/crm/campaigns/CreateCampaignDialog.tsx` - Creation wizard
- `src/components/crm/campaigns/ConvertProspectDialog.tsx` - Lead conversion

### CRM Router
- `src/server/routers/crm.ts:4120-4817` - Campaigns sub-router
- `src/server/routers/crm.ts:4241-4346` - Campaign creation
- `src/server/routers/crm.ts:4608-4739` - Prospect to lead conversion
- `src/server/routers/crm.ts:4440-4508` - Campaign metrics
- `src/server/routers/crm.ts:3915-3945` - CRM activities query

### Database
- `docs/specs/10-DATABASE/02-CRM/campaigns.md` - TA/HR campaigns spec
- `docs/specs/10-DATABASE/02-CRM/crm_campaigns.md` - Sales campaigns spec
- `supabase/migrations/20260115000000_campaigns_and_lead_credits.sql` - Main migration

### Activity System
- `src/server/routers/activities.ts:84-111` - Activity creation pattern
- `src/server/routers/crm.ts:4333-4343` - Campaign created activity
- `src/server/routers/crm.ts:4726-4736` - Lead from campaign activity

### Functional Specs
- `docs/specs/20-USER-ROLES/01-recruiter/A01-run-campaign.md` - Campaign creation
- `docs/specs/20-USER-ROLES/01-recruiter/A02-track-campaign-metrics.md` - Analytics
- `docs/specs/20-USER-ROLES/01-recruiter/A03-generate-lead-from-campaign.md` - Lead conversion

### Tests
- `tests/e2e/campaigns-lead-gen.spec.ts` - E2E test for campaigns

---

## Architecture Documentation

### Current Implementation Pattern

The campaign workspace uses a **component-based approach** (not metadata-driven):

```
Route (page.tsx)
    ↓
Component (CampaignDetailPage.tsx)
    ↓
tRPC Query (campaigns.getById)
    ↓
Database (campaigns, campaign_prospects, campaign_sequence_logs)
    ↓
RPC Functions (get_campaign_funnel, get_campaign_channel_performance)
```

### Activity Integration Pattern

```
User Action (create campaign, convert prospect, etc.)
    ↓
tRPC Mutation (campaigns.create, campaigns.convertProspectToLead)
    ↓
Insert to crm_activities table
    ↓
Activity logged with entity_type='campaign' or 'lead'
```

### Dual Campaign System

The codebase maintains two parallel campaign systems:

| System | Table | Purpose | Router |
|--------|-------|---------|--------|
| TA/HR | `campaigns` | Talent acquisition, candidate sourcing | `crm.campaigns` |
| Sales | `crm_campaigns` | Business development, lead generation | `crm.campaigns` |

The tRPC router primarily uses the `campaigns` table (TA/HR system).

---

## Historical Context (from thoughts/)

No dedicated campaign research or implementation plans were found in `thoughts/`. Campaign documentation primarily exists in:

- `docs/specs/10-DATABASE/02-CRM/` - Database specifications (6 files)
- `docs/specs/20-USER-ROLES/01-recruiter/` - Recruiter workflow specs (3 files)
- `docs/specs/20-USER-ROLES/03-ta/` - TA specialist specs
- `thoughts/shared/epics/epic-01-admin/` - Admin configuration docs (email templates, workflows, feature flags)

---

## Open Questions

1. **Sidebar Navigation**: The screenshot shows "Select a section from the top navigation" - the section sidebar is not populated for campaigns. Is there a `CampaignSectionSidebar.tsx` component needed?

2. **Sequence Execution**: How are multi-step sequences actually executed? Is there a background job/cron that processes `campaign_sequence_logs` and sends messages?

3. **Email Integration**: How do email sends and tracking (opens/clicks) connect to the campaign system? What email service provider is integrated?

4. **LinkedIn Integration**: How does LinkedIn outreach connect? Is there a LinkedIn API integration or manual tracking?

5. **Activity Timeline**: The campaign detail page should likely show an activity timeline - is this implemented in `CampaignDetailPage.tsx`?

6. **Conversion to Deal/Account**: The specs mention leads can convert to deals/accounts, but the campaign router only handles lead conversion. How does the lead → deal → account flow work?
