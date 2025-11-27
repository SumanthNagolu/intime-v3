---
name: crm
description: CRM (Customer Relationship Management) domain expertise for InTime v3
---

# CRM Skill

## Domain Overview
Client relationship management: accounts, leads, deals, contacts.

## Key Tables (src/lib/db/schema/crm.ts)

| Table | Purpose |
|-------|---------|
| `accounts` | Client companies |
| `leads` | Sales leads |
| `deals` | Active deals/opportunities |
| `pocs` | Points of contact |
| `activities` | Activity logging |

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

## Integration Points
- Deals link to Jobs in ATS
- Accounts link to Jobs for requisitions
- Activity logging across all entities
- AI Twin for deal insights and follow-ups
