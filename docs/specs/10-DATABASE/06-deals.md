# Deals Table Specification

## Overview

| Property | Value |
|----------|-------|
| Table Name | `deals` |
| Schema | `public` |
| Purpose | Store sales opportunities and revenue forecasting data |
| Primary Owner | Account Executive / Sales Rep |
| RLS Enabled | Yes |
| Soft Delete | Yes (`deleted_at`) |

---

## Table Definition

```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Associations
  lead_id UUID REFERENCES leads(id),
  account_id UUID REFERENCES accounts(id),

  -- Deal Details
  title TEXT NOT NULL,
  description TEXT,
  value NUMERIC(12,2) NOT NULL,

  -- Pipeline Stage
  stage TEXT NOT NULL DEFAULT 'discovery',
  probability INTEGER,
  expected_close_date DATE,
  actual_close_date DATE,

  -- Assignment
  owner_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Outcome
  close_reason TEXT,

  -- Linked Jobs
  linked_job_ids UUID[],

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);
```

---

## Field Specifications

### id
| Property | Value |
|----------|-------|
| Column Name | `id` |
| Type | `UUID` |
| Required | Yes (auto-generated) |
| Default | `gen_random_uuid()` |
| Primary Key | Yes |
| Description | Unique identifier for the deal |
| UI Display | Hidden (used in URLs) |

---

### org_id
| Property | Value |
|----------|-------|
| Column Name | `org_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `organizations(id)` |
| On Delete | CASCADE |
| Description | Organization this deal belongs to (multi-tenancy) |
| UI Display | Hidden (auto-set from session) |
| RLS | Used in isolation policy |

---

### lead_id
| Property | Value |
|----------|-------|
| Column Name | `lead_id` |
| Type | `UUID` |
| Required | No (auto-filled during conversion) |
| Foreign Key | `leads(id)` |
| Description | Lead this deal was converted from |
| UI Label | "Source Lead" |
| UI Type | Display only / Link |
| UI Display | Read-only reference to original lead |
| Business Rule | Set during lead-to-deal conversion workflow |
| Index | Yes (`idx_deals_lead_id`) |

---

### account_id
| Property | Value |
|----------|-------|
| Column Name | `account_id` |
| Type | `UUID` |
| Required | Yes (in UI) |
| Foreign Key | `accounts(id)` |
| Description | Account/company this deal is with |
| UI Label | "Account" |
| UI Type | Searchable Dropdown |
| UI Placeholder | "Search accounts..." |
| Validation | Must be active account in same org |
| Business Rule | Inherited from lead during conversion or manually selected |
| Index | Yes (`idx_deals_account_id`) |

---

### title
| Property | Value |
|----------|-------|
| Column Name | `title` |
| Type | `TEXT` |
| Required | Yes |
| Max Length | 200 characters |
| Min Length | 3 characters |
| Description | Deal name/title describing the opportunity |
| UI Label | "Deal Name" |
| UI Type | Text Input |
| UI Placeholder | "e.g., Q1 2024 Staff Augmentation - Acme Corp" |
| Validation | Not empty, no special chars except `- () / &` |
| Error Message | "Deal title is required" |
| Searchable | Yes |
| Auto-fill Suggestion | "[Account Name] - [Service Type]" during creation |

---

### description
| Property | Value |
|----------|-------|
| Column Name | `description` |
| Type | `TEXT` |
| Required | No (recommended) |
| Max Length | 10000 characters |
| Description | Detailed description of the opportunity, scope, requirements |
| UI Label | "Description" |
| UI Type | Rich Text Editor / Textarea |
| UI Placeholder | "Describe the opportunity, scope, and key details..." |
| Searchable | Yes |
| Rich Text | Optional (bold, italic, lists, bullets) |

---

### value
| Property | Value |
|----------|-------|
| Column Name | `value` |
| Type | `NUMERIC(12,2)` |
| Required | Yes |
| Min | 0 |
| Max | 999,999,999.99 |
| Precision | 2 decimal places |
| Description | Expected revenue/contract value (USD) |
| UI Label | "Deal Value" |
| UI Type | Currency Input |
| UI Prefix | "$" |
| Validation | Must be positive number |
| Error Message | "Deal value must be greater than 0" |
| Forecasting | Used in weighted pipeline calculation |
| Index | Yes (`idx_deals_value`) for revenue reporting |

---

### stage
| Property | Value |
|----------|-------|
| Column Name | `stage` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'discovery'` |
| Allowed Values | `discovery`, `qualification`, `proposal`, `negotiation`, `closed_won`, `closed_lost` |
| Description | Current stage in the sales pipeline |
| UI Label | "Stage" |
| UI Type | Dropdown / Pipeline Visual |
| Index | Yes (`idx_deals_stage`) |

**Enum Values:**

| Value | Display Label | Default Probability | Color | Description | Forecasting |
|-------|---------------|---------------------|-------|-------------|-------------|
| `discovery` | Discovery | 10% | Gray (#6B7280) | Initial research and qualification | Included in pipeline |
| `qualification` | Qualification | 25% | Blue (#3B82F6) | BANT qualification in progress | Included in pipeline |
| `proposal` | Proposal | 50% | Yellow (#EAB308) | Proposal submitted to client | Included in best case |
| `negotiation` | Negotiation | 75% | Orange (#F97316) | Terms negotiation underway | Included in commit |
| `closed_won` | Closed Won | 100% | Green (#10B981) | Deal won - convert to jobs | Included in bookings |
| `closed_lost` | Closed Lost | 0% | Red (#EF4444) | Deal lost - archive | Excluded from forecast |

**Stage Transition Rules:**
- Discovery → Qualification: BANT score >= 50/100 required
- Qualification → Proposal: All 4 BANT criteria scored >= 15/25
- Proposal → Negotiation: Proposal submitted date required
- Negotiation → Closed Won: Requires close reason (e.g., "Contract signed")
- Any → Closed Lost: Requires close reason (e.g., "Lost to competitor")
- Cannot reopen Closed Won/Lost without admin override

---

### probability
| Property | Value |
|----------|-------|
| Column Name | `probability` |
| Type | `INTEGER` |
| Required | No |
| Min | 0 |
| Max | 100 |
| Default | Auto-set based on stage (see table above) |
| Description | Percentage likelihood of closing (0-100%) |
| UI Label | "Win Probability" |
| UI Type | Number Input / Slider |
| UI Suffix | "%" |
| Validation | 0-100 range |
| Auto-fill | Set to stage default, editable by user |
| Forecasting Formula | `weighted_value = value * (probability / 100)` |

**Probability Guidelines:**
- Discovery: 10% (early stage, needs qualification)
- Qualification: 25% (BANT in progress)
- Proposal: 50% (active engagement)
- Negotiation: 75% (high confidence)
- Closed Won: 100% (won)
- Closed Lost: 0% (lost)

---

### expected_close_date
| Property | Value |
|----------|-------|
| Column Name | `expected_close_date` |
| Type | `DATE` |
| Required | Yes (in UI) |
| Min | Today |
| Description | Target date for closing the deal |
| UI Label | "Expected Close Date" |
| UI Type | Date Picker |
| Validation | Cannot be in the past |
| Warning | Show warning if > 90 days from today |
| Forecasting | Used for quarterly revenue projections |
| Index | Yes (`idx_deals_expected_close`) for pipeline views |

**Forecasting Buckets:**
- This Month: `expected_close_date` <= end of current month
- This Quarter: `expected_close_date` <= end of current quarter
- This Year: `expected_close_date` <= end of current fiscal year
- Future: Beyond current fiscal year

---

### actual_close_date
| Property | Value |
|----------|-------|
| Column Name | `actual_close_date` |
| Type | `DATE` |
| Required | No |
| Description | Actual date the deal was closed (won or lost) |
| UI Label | "Close Date" |
| UI Type | Date Picker (auto-filled) |
| Auto-fill | Set to today when stage changes to `closed_won` or `closed_lost` |
| UI Display | Display only after close |
| Reporting | Used for win/loss analysis and closed date reporting |

---

### owner_id
| Property | Value |
|----------|-------|
| Column Name | `owner_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `user_profiles(id)` |
| Description | Sales rep/account executive responsible for this deal |
| UI Label | "Owner" |
| UI Type | User Select Dropdown |
| Default | Current user (on create) |
| Filter By | Role: Account Executive, Sales Rep, or Manager |
| Business Rule | Inherited from lead owner during conversion |
| Index | Yes (`idx_deals_owner_id`) for user-specific views |

---

### close_reason
| Property | Value |
|----------|-------|
| Column Name | `close_reason` |
| Type | `TEXT` |
| Required | Required when stage = `closed_won` or `closed_lost` |
| Max Length | 500 characters |
| Description | Explanation for why deal was won or lost |
| UI Label | "Close Reason" |
| UI Type | Dropdown + Text Area |
| UI Visible | Only when closing deal |
| Validation | Required to move to closed_won or closed_lost |

**Won Reasons (Dropdown):**
| Value | Display Label |
|-------|---------------|
| `contract_signed` | Contract Signed |
| `po_received` | Purchase Order Received |
| `verbal_commitment` | Verbal Commitment Received |
| `msa_executed` | MSA/Master Agreement Executed |

**Lost Reasons (Dropdown):**
| Value | Display Label |
|-------|---------------|
| `lost_to_competitor` | Lost to Competitor |
| `budget_constraints` | Budget Constraints |
| `no_decision` | No Decision Made |
| `timing_not_right` | Timing Not Right |
| `requirements_changed` | Requirements Changed |
| `went_dark` | Client Went Dark |
| `price_too_high` | Price Too High |
| `other` | Other (specify in notes) |

---

### linked_job_ids
| Property | Value |
|----------|-------|
| Column Name | `linked_job_ids` |
| Type | `UUID[]` (Array) |
| Required | No |
| Description | Job requisitions created from this deal (after closing won) |
| UI Label | "Related Jobs" |
| UI Type | Multi-select or Display List |
| UI Display | Show job titles as links |
| Business Rule | Auto-populated when jobs are created from deal |
| Workflow | When deal closes won, prompt user to create job requisitions |

**Deal-to-Job Conversion Workflow:**
1. Deal reaches `closed_won` stage
2. System prompts: "Create Job Requisitions from Deal?"
3. User creates one or more jobs, pre-filled with:
   - `account_id` from deal
   - `deal_id` reference
   - Deal description copied to job description
   - Owner inherited from deal owner
4. Job IDs added to `linked_job_ids` array
5. Deal shows "3 Jobs Created" badge in UI

---

### created_at
| Property | Value |
|----------|-------|
| Column Name | `created_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Description | Timestamp of deal creation |
| UI Display | Display only, formatted |
| Format | "Created on Jan 15, 2024 at 10:30 AM" |

---

### updated_at
| Property | Value |
|----------|-------|
| Column Name | `updated_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Auto Update | Yes (via trigger) |
| Description | Timestamp of last update |
| UI Display | Display only, formatted |
| Format | "Last updated 2 hours ago" (relative) |

---

### created_by
| Property | Value |
|----------|-------|
| Column Name | `created_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who created the deal |
| UI Display | Display only, show user name |
| Format | "Created by John Smith" |

---

### deleted_at
| Property | Value |
|----------|-------|
| Column Name | `deleted_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Default | NULL |
| Description | Soft delete timestamp |
| UI Display | Hidden from users |
| Query Filter | `WHERE deleted_at IS NULL` in all queries |
| Admin Only | Only admins can view/restore deleted deals |

---

## Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `deals_pkey` | `id` | BTREE | Primary key |
| `idx_deals_org_id` | `org_id` | BTREE | Tenant filtering |
| `idx_deals_account_id` | `account_id` | BTREE | Account lookup |
| `idx_deals_lead_id` | `lead_id` | BTREE | Lead conversion tracking |
| `idx_deals_owner_id` | `owner_id` | BTREE | Owner lookup |
| `idx_deals_stage` | `stage` | BTREE | Pipeline filtering |
| `idx_deals_value` | `value` | BTREE | Revenue reporting |
| `idx_deals_expected_close` | `expected_close_date` | BTREE | Forecasting queries |
| `idx_deals_deleted_at` | `deleted_at` | BTREE | Soft delete (WHERE NULL) |

**Composite Indexes:**
```sql
CREATE INDEX idx_deals_pipeline ON deals(org_id, stage, expected_close_date)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_deals_forecast ON deals(org_id, expected_close_date, stage)
  WHERE stage NOT IN ('closed_won', 'closed_lost') AND deleted_at IS NULL;
```

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Organization isolation
CREATE POLICY "deals_org_isolation" ON deals
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Users can view deals they own or are in their team
CREATE POLICY "deals_owner_access" ON deals
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR owner_id IN (SELECT user_id FROM pod_members WHERE pod_id IN
      (SELECT pod_id FROM pod_members WHERE user_id = auth.uid()))
  );
```

---

## Triggers

### Updated At Trigger
```sql
CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Auto-close Date Trigger
```sql
CREATE OR REPLACE FUNCTION deals_auto_close_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-set actual_close_date when closing
  IF NEW.stage IN ('closed_won', 'closed_lost')
     AND OLD.stage NOT IN ('closed_won', 'closed_lost')
     AND NEW.actual_close_date IS NULL THEN
    NEW.actual_close_date := CURRENT_DATE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_auto_close_date_trigger
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION deals_auto_close_date();
```

### Auto-probability Trigger
```sql
CREATE OR REPLACE FUNCTION deals_auto_probability()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-set probability based on stage if not manually set
  IF NEW.probability IS NULL OR OLD.stage != NEW.stage THEN
    NEW.probability := CASE NEW.stage
      WHEN 'discovery' THEN 10
      WHEN 'qualification' THEN 25
      WHEN 'proposal' THEN 50
      WHEN 'negotiation' THEN 75
      WHEN 'closed_won' THEN 100
      WHEN 'closed_lost' THEN 0
      ELSE NEW.probability
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_auto_probability_trigger
  BEFORE INSERT OR UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION deals_auto_probability();
```

### Lead Conversion Trigger
```sql
CREATE OR REPLACE FUNCTION deals_update_lead_on_create()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark lead as converted when deal is created
  IF NEW.lead_id IS NOT NULL THEN
    UPDATE leads SET
      status = 'converted',
      converted_to_deal_id = NEW.id,
      converted_at = NOW()
    WHERE id = NEW.lead_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_mark_lead_converted_trigger
  AFTER INSERT ON deals
  FOR EACH ROW
  EXECUTE FUNCTION deals_update_lead_on_create();
```

---

## Related Tables

| Table | Relationship | FK Column | Description |
|-------|--------------|-----------|-------------|
| organizations | Parent | `org_id` | Multi-tenant owner |
| accounts | Parent | `account_id` | Company/client |
| leads | Source | `lead_id` | Originating lead |
| user_profiles | Owner | `owner_id` | Deal owner |
| jobs | Children | Via `linked_job_ids` array | Jobs created from deal |
| activities | Children | Polymorphic (`entity_type='deal'`) | Deal activities |
| object_owners | RCAI | Polymorphic | RCAI ownership |

---

## Business Workflows

### 1. Lead-to-Deal Conversion

**Trigger:** Lead status changes to "Hot" or "Qualified" (BANT >= 75/100)

**Workflow:**
1. User clicks "Convert to Deal" on lead detail page
2. System validates:
   - Lead status = `hot` or `warm` with BANT >= 75
   - Lead has `account_id` (or will create new account)
   - Lead has `owner_id`
3. Pre-fill deal form:
   ```
   title: "[Company Name] - Staffing Opportunity"
   account_id: lead.convertedToAccountId || lead.accountId
   lead_id: lead.id
   owner_id: lead.ownerId
   stage: 'qualification'
   probability: 25
   value: lead.estimatedValue || 0 (user must update)
   description: Copied from lead.notes
   ```
4. User completes required fields:
   - Deal title (editable)
   - Deal value (required)
   - Expected close date (required)
5. On submit:
   - Create deal record
   - Update lead: `status='converted'`, `converted_to_deal_id=deal.id`, `converted_at=NOW()`
   - Create activity log: "Lead converted to deal by [User]"
6. Redirect to new deal detail page

**Validation Rules:**
- Lead must not already be converted (`converted_to_deal_id IS NULL`)
- Deal value must be > 0
- Expected close date must be in future
- Account must be active

---

### 2. Deal Stage Progression

**Stage Gate Requirements:**

| From Stage | To Stage | Requirements |
|------------|----------|--------------|
| Discovery | Qualification | - Description filled<br>- Value > 0<br>- Expected close date set |
| Qualification | Proposal | - Account has primary POC<br>- At least 1 discovery call logged<br>- BANT score >= 50 (recommended) |
| Proposal | Negotiation | - Proposal activity logged<br>- Expected close date <= 60 days |
| Negotiation | Closed Won | - Close reason required (e.g., "Contract signed")<br>- Actual close date auto-filled<br>- Probability = 100% |
| Any | Closed Lost | - Close reason required<br>- Actual close date auto-filled<br>- Probability = 0% |

**UI Stage Progression:**
- Horizontal pipeline visual (like Kanban)
- Drag-and-drop to move stages (with validation)
- Stage change triggers:
  - Auto-update probability
  - Create activity log entry
  - Send notification to owner
  - Update forecast calculations

---

### 3. Deal-to-Job Conversion

**Trigger:** Deal closes won (stage = `closed_won`)

**Workflow:**
1. Deal status changes to `closed_won`
2. System shows modal: "Create Job Requisitions?"
3. User clicks "Yes" → Opens job creation wizard
4. Job form pre-filled:
   ```
   account_id: deal.accountId
   deal_id: deal.id
   title: "[Job title from deal notes]"
   description: deal.description
   owner_id: deal.ownerId
   status: 'draft'
   ```
5. User fills job-specific fields:
   - Job type (contract, permanent, etc.)
   - Rate range
   - Required skills
   - Location
   - Number of positions
6. User can create multiple jobs (common for large deals)
7. On submit:
   - Create job(s)
   - Update deal: Add job IDs to `linked_job_ids` array
   - Create activity: "Job [Job ID] created from deal"
8. Deal detail page shows "3 Jobs Created" badge with links

**Business Rules:**
- One deal can spawn multiple jobs
- Jobs inherit account and owner from deal
- Job creation is optional (user can skip)
- Jobs can be created later via "Create Job from Deal" button

---

### 4. Revenue Forecasting

**Forecast Categories:**

| Category | Filter Criteria | Use Case |
|----------|----------------|----------|
| **Pipeline** | `stage NOT IN ('closed_won', 'closed_lost')` | Total active opportunities |
| **Best Case** | `stage IN ('proposal', 'negotiation')` | High-confidence deals |
| **Commit** | `stage = 'negotiation'` AND `probability >= 75` | Nearly certain revenue |
| **Closed/Won** | `stage = 'closed_won'` | Actual bookings |

**Weighted Pipeline Calculation:**
```sql
SELECT
  SUM(value) AS total_pipeline_value,
  SUM(value * probability / 100) AS weighted_pipeline_value,
  COUNT(*) AS deal_count
FROM deals
WHERE
  org_id = $1
  AND stage NOT IN ('closed_won', 'closed_lost')
  AND deleted_at IS NULL
  AND expected_close_date BETWEEN $2 AND $3;
```

**Time-based Forecasts:**
```sql
-- This Quarter Forecast
SELECT
  stage,
  COUNT(*) AS deal_count,
  SUM(value) AS total_value,
  SUM(value * probability / 100) AS weighted_value
FROM deals
WHERE
  org_id = $1
  AND expected_close_date BETWEEN $quarter_start AND $quarter_end
  AND stage NOT IN ('closed_won', 'closed_lost')
  AND deleted_at IS NULL
GROUP BY stage
ORDER BY
  CASE stage
    WHEN 'negotiation' THEN 1
    WHEN 'proposal' THEN 2
    WHEN 'qualification' THEN 3
    WHEN 'discovery' THEN 4
  END;
```

**Win Rate Analysis:**
```sql
SELECT
  COUNT(CASE WHEN stage = 'closed_won' THEN 1 END) AS won_count,
  COUNT(CASE WHEN stage = 'closed_lost' THEN 1 END) AS lost_count,
  ROUND(
    100.0 * COUNT(CASE WHEN stage = 'closed_won' THEN 1 END) /
    NULLIF(COUNT(CASE WHEN stage IN ('closed_won', 'closed_lost') THEN 1 END), 0),
    2
  ) AS win_rate_percentage
FROM deals
WHERE
  org_id = $1
  AND actual_close_date >= $period_start
  AND deleted_at IS NULL;
```

---

## Validation Rules

### Field-level Validation

```typescript
// Zod schema example
const dealSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title cannot exceed 200 characters"),

  value: z.number()
    .positive("Value must be greater than 0")
    .max(999999999.99, "Value exceeds maximum"),

  stage: z.enum([
    'discovery',
    'qualification',
    'proposal',
    'negotiation',
    'closed_won',
    'closed_lost'
  ]),

  probability: z.number()
    .int("Probability must be a whole number")
    .min(0, "Probability cannot be negative")
    .max(100, "Probability cannot exceed 100")
    .optional(),

  expectedCloseDate: z.date()
    .min(new Date(), "Expected close date cannot be in the past"),

  closeReason: z.string()
    .min(1, "Close reason is required when closing deal")
    .when('stage', {
      is: (stage: string) => ['closed_won', 'closed_lost'].includes(stage),
      then: z.string().min(1, "Close reason required for closed deals")
    }),

  accountId: z.string().uuid("Invalid account ID"),
  ownerId: z.string().uuid("Invalid owner ID"),
});
```

### Business Logic Validation

```typescript
// Pre-save validation
async function validateDealTransition(
  oldDeal: Deal,
  newDeal: Partial<Deal>
): Promise<ValidationResult> {
  const errors: string[] = [];

  // Cannot reopen closed deals without admin override
  if (
    ['closed_won', 'closed_lost'].includes(oldDeal.stage) &&
    newDeal.stage &&
    !['closed_won', 'closed_lost'].includes(newDeal.stage) &&
    !currentUser.isAdmin
  ) {
    errors.push("Only admins can reopen closed deals");
  }

  // Must have POC before proposal stage
  if (newDeal.stage === 'proposal') {
    const pocCount = await db
      .select({ count: count() })
      .from(pointOfContacts)
      .where(
        and(
          eq(pointOfContacts.accountId, oldDeal.accountId),
          eq(pointOfContacts.isActive, true)
        )
      );

    if (pocCount[0].count === 0) {
      errors.push("Account must have at least one active POC before proposal stage");
    }
  }

  // Close reason required when closing
  if (
    newDeal.stage &&
    ['closed_won', 'closed_lost'].includes(newDeal.stage) &&
    !newDeal.closeReason
  ) {
    errors.push("Close reason is required when closing a deal");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## UI Specifications

### Deal Card (List View)

```
┌─────────────────────────────────────────────────────────┐
│ [Stage Badge: Negotiation 75%]         Value: $150,000 │
│ Q1 2024 Staff Augmentation - Acme Corp                 │
│ Account: Acme Corp • Owner: John Smith                 │
│ Expected Close: Feb 28, 2024 (23 days)                 │
│ [3 Activities] [2 Jobs Created]         [···] Actions  │
└─────────────────────────────────────────────────────────┘
```

### Deal Detail Page Sections

1. **Header:**
   - Deal title (editable inline)
   - Stage pipeline visual (horizontal stepper)
   - Value (large, prominent)
   - Win probability percentage

2. **Key Details (Left Column):**
   - Account (with link)
   - Owner (user avatar + name)
   - Expected close date (with countdown)
   - Actual close date (if closed)
   - Source lead (if converted)

3. **Deal Information (Main Column):**
   - Description (rich text, editable)
   - Close reason (if closed)
   - Linked jobs (list with links)
   - Created/updated timestamps

4. **Activity Timeline (Right Column):**
   - All activities related to deal
   - Stage changes
   - Notes, calls, meetings
   - Job creation events

5. **Actions (Top Right):**
   - Edit Deal
   - Change Stage (dropdown or drag)
   - Log Activity
   - Create Job (if closed_won)
   - Clone Deal
   - Delete Deal

### Pipeline View

```
Discovery (10%)      Qualification (25%)   Proposal (50%)       Negotiation (75%)
$250K (5 deals)      $400K (8 deals)       $600K (12 deals)     $300K (6 deals)
┌──────────────┐     ┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│ Deal 1       │     │ Deal 6       │      │ Deal 14      │     │ Deal 27      │
│ $50K         │     │ $30K         │      │ $100K        │     │ $80K         │
│ Acme Corp    │     │ Beta Inc     │      │ Gamma LLC    │     │ Delta Co     │
│ Close: 3/15  │     │ Close: 2/28  │      │ Close: 2/15  │     │ Close: 1/31  │
└──────────────┘     └──────────────┘      └──────────────┘     └──────────────┘
[Drag to move]       [Drag to move]        [Drag to move]       [Drag to move]
```

---

## Performance Considerations

### Query Optimization

1. **Pipeline Dashboard Query:**
   ```sql
   -- Use covering index for fast pipeline aggregation
   SELECT
     stage,
     COUNT(*) AS count,
     SUM(value) AS total,
     AVG(probability) AS avg_probability
   FROM deals
   WHERE
     org_id = $1
     AND deleted_at IS NULL
     AND stage NOT IN ('closed_won', 'closed_lost')
   GROUP BY stage;
   ```

2. **Owner Dashboard Query:**
   ```sql
   -- Use composite index (org_id, owner_id, stage)
   SELECT * FROM deals
   WHERE
     org_id = $1
     AND owner_id = $2
     AND deleted_at IS NULL
   ORDER BY expected_close_date ASC
   LIMIT 50;
   ```

3. **Forecast Query:**
   ```sql
   -- Use composite index (org_id, expected_close_date, stage)
   SELECT
     DATE_TRUNC('month', expected_close_date) AS month,
     SUM(value * probability / 100) AS weighted_forecast
   FROM deals
   WHERE
     org_id = $1
     AND expected_close_date BETWEEN $start AND $end
     AND stage NOT IN ('closed_won', 'closed_lost')
     AND deleted_at IS NULL
   GROUP BY DATE_TRUNC('month', expected_close_date)
   ORDER BY month;
   ```

### Caching Strategy

- Cache pipeline totals: 5-minute TTL
- Cache user's deal count: 1-minute TTL
- Cache forecast data: 15-minute TTL
- Invalidate on deal create/update/delete

---

## Reporting & Analytics

### Key Metrics

1. **Pipeline Health:**
   - Total pipeline value
   - Weighted pipeline value
   - Average deal size
   - Deals by stage distribution

2. **Velocity:**
   - Average days in each stage
   - Average time from discovery to close
   - Stage conversion rates

3. **Win/Loss Analysis:**
   - Win rate by stage
   - Win rate by owner
   - Lost reasons breakdown
   - Average won deal value vs. lost

4. **Forecast Accuracy:**
   - Forecasted vs. actual closed revenue
   - Slippage rate (deals pushed to later quarters)
   - Commit accuracy (negotiation stage forecast vs. actual)

---

*Last Updated: 2024-11-30*
