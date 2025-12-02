---
name: crm
description: CRM (Customer Relationship Management) domain expertise for InTime v3
---

# CRM Skill

## Domain Overview
Client relationship management: accounts, leads, deals, contacts.

## Entity Categories

| Category | Entities | Workplan | Activity Logging |
|----------|----------|----------|------------------|
| **Root** | lead, deal | Yes - auto-created | Yes - all operations |
| **Supporting** | account, contact (poc) | No | Optional |

**Root entities** get automatic workplan creation and activity logging.

## Key Tables (src/lib/db/schema/crm.ts)

| Table | Purpose | Category |
|-------|---------|----------|
| `accounts` | Client companies | Supporting |
| `leads` | Sales leads | **Root** |
| `deals` | Active deals/opportunities | **Root** |
| `pocs` | Points of contact | Supporting |

## Workflow
```
Lead → Qualified → Opportunity (Deal) → Account (Client)
```

## Deal Stages
```
new → qualified → proposal → negotiation → closed_won | closed_lost
```

## Lead Status
```
new → contacted → qualified → converted | disqualified
```

## Components (src/components/recruiting/)

| Component | Purpose |
|-----------|---------|
| AccountsList.tsx | Account listing |
| AccountDetail.tsx | Account details |
| LeadsList.tsx | Lead pipeline |
| LeadDetail.tsx | Lead details |
| DealsPipeline.tsx | Kanban deal pipeline |
| DealDetail.tsx | Deal details |

## API Endpoints

```typescript
// Accounts
trpc.crm.accounts.list({ status?, industry? })
trpc.crm.accounts.getById({ id })
trpc.crm.accounts.create({ name, industry, ... })
trpc.crm.accounts.update({ id, data })

// Leads
trpc.crm.leads.list({ status?, source? })
trpc.crm.leads.create({ companyName, contactName, ... })
trpc.crm.leads.updateStatus({ id, status })
trpc.crm.leads.convert({ id })  // Convert to deal + account

// Deals
trpc.crm.deals.list({ stage?, accountId? })
trpc.crm.deals.create({ accountId, value, ... })
trpc.crm.deals.updateStage({ id, stage })
trpc.crm.deals.close({ id, won, notes })

// POCs (Contacts)
trpc.crm.pocs.list({ accountId })
trpc.crm.pocs.create({ accountId, name, email, role })

// Activities
trpc.crm.activities.log({ entityType, entityId, type, notes })
trpc.crm.activities.getByEntity({ entityType, entityId })
```

## Key Schema Fields

### Accounts
```typescript
{
  id, orgId,
  name, industry, website,
  status,  // prospect | active | inactive | churned
  tier,    // enterprise | mid_market | smb
  primaryPocId,
  assignedToId,  // Account manager
  createdAt, updatedAt, deletedAt
}
```

### Deals
```typescript
{
  id, orgId,
  accountId,
  name, description,
  value, currency,
  stage,       // new | qualified | proposal | negotiation | closed
  probability,
  expectedCloseDate,
  closedAt, closedWon,
  assignedToId,
  createdAt, updatedAt
}
```

## Workplan Templates (Root Entities)

### Lead Workflow (`lead_workflow`)
```
lead_created
  → initial_contact (Day 0) - First outreach
  → qualification_call (Day 1) - BANT qualification
  → follow_up_email (Day 3) - If no response
  → second_follow_up (Day 7) - Final attempt
  → lead_review (Day 14) - Convert or disqualify
```

### Deal Workflow (`deal_workflow`)
```
deal_created
  → discovery_meeting (Day 0) - Requirements gathering
  → proposal_preparation (Day 3) - Draft proposal
  → proposal_presentation (Day 7) - Present to client
  → negotiation_call (on proposal_sent) - Address concerns
  → close_attempt (Day 14) - Push for decision
  → win_loss_review (on closed) - Analyze outcome
```

### Activity Categories
- `call` - Phone calls
- `email` - Email communications
- `meeting` - In-person or video meetings
- `task` - Internal tasks
- `follow_up` - Follow-up activities
- `note` - General notes
- `lifecycle` - Status changes, creation, etc.

## Integration Points
- Deals link to Jobs in ATS
- Accounts link to Jobs for requisitions
- Lead/Deal creation → triggers workplan
- Status changes → trigger successor activities
- AI Twin for deal insights and follow-ups

## Activity-Centric Integration

### Golden Rule
```
"NO WORK IS CONSIDERED DONE UNLESS AN ACTIVITY IS CREATED"
```

### Events Emitted

| Event | Trigger | Auto-Activities |
|-------|---------|-----------------|
| `lead.created` | New lead added | LEAD_NEW_QUALIFY |
| `lead.qualified` | Lead marked qualified | LEAD_QUALIFIED_PROPOSAL |
| `lead.stale` | 7 days no activity | LEAD_STALE_FOLLOWUP |
| `deal.created` | New deal created | DEAL_CREATED_DISCOVERY |
| `deal.stage_changed` | Stage progression | Stage-specific patterns |
| `deal.proposal_sent` | Proposal sent | DEAL_PROPOSAL_FOLLOWUP |
| `deal.stale` | 7 days stuck in stage | DEAL_STALE_REVIEW |
| `deal.won` | Deal closed won | DEAL_WON_ONBOARD |
| `account.created` | New account added | ACCT_NEW_WELCOME |
| `account.health_score_dropped` | Health < 50 | ACCT_AT_RISK |
| `account.no_activity` | 30 days no activity | ACCT_REENGAGEMENT |

### Activity Patterns (CRM)

| Pattern Code | Trigger | Activity | Due |
|--------------|---------|----------|-----|
| `LEAD_NEW_QUALIFY` | lead.created | Call: Qualification call | +24 hours |
| `LEAD_WARM_FOLLOWUP` | lead.marked_warm | Task: Send capability deck | +4 hours |
| `LEAD_STALE_FOLLOWUP` | lead.stale | Call: Re-engage lead | +0 hours |
| `DEAL_CREATED_DISCOVERY` | deal.created | Meeting: Discovery call | +24 hours |
| `DEAL_PROPOSAL_PREP` | deal.qualified | Task: Prepare proposal | +48 hours |
| `DEAL_PROPOSAL_FOLLOWUP` | deal.proposal_sent | Call: Follow up on proposal | +72 hours |
| `DEAL_STALE_REVIEW` | deal.stale | Review: Assess deal progress | +24 hours |
| `ACCT_NEW_WELCOME` | account.created | Email: Welcome email | +4 hours |
| `ACCT_FIRST_JOB` | job.created (first) | Meeting: Relationship building | +48 hours |
| `ACCT_QUARTERLY_REVIEW` | account.quarter_ended | Meeting: QBR | +5 days |
| `ACCT_AT_RISK` | account.health_dropped | Escalation: Review at-risk | +4 hours |

### Transition Guards

```typescript
// Lead cannot be qualified without a call
{
  entity: 'lead',
  from: 'new',
  to: 'qualified',
  requires: [{ type: 'call', count: 1, status: 'completed' }],
  error: 'Complete qualification call before marking as qualified'
}

// Deal cannot close without proposal activity
{
  entity: 'deal',
  from: 'negotiation',
  to: 'closed_won',
  requires: [{ type: 'document', count: 1, status: 'completed' }],
  error: 'Must have proposal activity before closing'
}
```

### SLA Rules

| Entity | Metric | Warning | Breach |
|--------|--------|---------|--------|
| Lead | First contact | 4 hours | 24 hours |
| Deal | Proposal follow-up | 48 hours | 72 hours |
| Account | Quarterly check-in | 80 days | 95 days |

### UI Requirements
- Activity queue on CRM dashboard
- Timeline tab on Account/Lead/Deal detail pages
- Quick log buttons: Call, Email, Meeting, Note
- Deal health indicators based on activity recency
- Account at-risk alerts
