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
