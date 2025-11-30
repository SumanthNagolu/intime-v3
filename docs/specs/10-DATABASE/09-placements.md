# Placements Table Specification

## Overview

| Property | Value |
|----------|-------|
| Table Name | `placements` |
| Schema | `public` |
| Purpose | **REVENUE CENTER** - Track active consultant placements and revenue |
| Primary Owner | Recruiter & Account Manager |
| RLS Enabled | Yes |
| Soft Delete | No (never delete placements - they are revenue records) |
| Business Criticality | **HIGHEST** - Direct revenue impact |

---

## Business Context

Placements are the **MOST IMPORTANT** table financially in InTime OS. Each placement represents:
- **Active revenue stream** from client billing
- **Gross profit** calculation (bill rate - pay rate)
- **Recruiter commission** basis
- **Sprint metrics** (1 placement per person per 2-week sprint is the target)
- **Financial forecasting** for revenue projections
- **Performance tracking** for consultants and recruiters

---

## Table Definition

```sql
CREATE TABLE placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Associations (REQUIRED except offer_id)
  submission_id UUID NOT NULL REFERENCES submissions(id),
  offer_id UUID REFERENCES offers(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),
  account_id UUID NOT NULL REFERENCES accounts(id),

  -- Placement Details
  placement_type TEXT DEFAULT 'contract',
  start_date DATE NOT NULL,
  end_date DATE,

  -- Compensation (REQUIRED - Revenue Critical)
  bill_rate NUMERIC(10,2) NOT NULL,
  pay_rate NUMERIC(10,2) NOT NULL,
  markup_percentage NUMERIC(5,2),

  -- Status
  status TEXT NOT NULL DEFAULT 'active',
  end_reason TEXT,
  actual_end_date DATE,

  -- Financials (Calculated & Tracked)
  total_revenue NUMERIC(12,2),
  total_paid NUMERIC(12,2),

  -- Onboarding
  onboarding_status TEXT DEFAULT 'pending',
  onboarding_completed_at TIMESTAMPTZ,

  -- Performance
  performance_rating INTEGER,
  extension_count INTEGER DEFAULT 0,

  -- Assignment (REQUIRED)
  recruiter_id UUID NOT NULL REFERENCES user_profiles(id),
  account_manager_id UUID REFERENCES user_profiles(id),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
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
| Description | Unique identifier for the placement |
| UI Display | Hidden (used in URLs) |
| Business Note | NEVER reuse IDs - each placement must be unique |

---

### org_id
| Property | Value |
|----------|-------|
| Column Name | `org_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `organizations(id)` |
| On Delete | CASCADE |
| Description | Organization this placement belongs to (multi-tenancy) |
| UI Display | Hidden (auto-set from session) |
| RLS | Used in isolation policy |
| Business Note | Revenue is always org-specific |

---

### submission_id
| Property | Value |
|----------|-------|
| Column Name | `submission_id` |
| Type | `UUID` |
| Required | **Yes** |
| Foreign Key | `submissions(id)` |
| Description | The submission that led to this placement |
| UI Label | "Submission" |
| UI Type | Display only (pre-selected when creating placement) |
| Index | Yes (`idx_placements_submission_id`) |
| Business Note | Tracks the complete hiring funnel from submission to placement |
| Unique | One placement per submission (typically) |

---

### offer_id
| Property | Value |
|----------|-------|
| Column Name | `offer_id` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `offers(id)` |
| Description | The offer that led to this placement (if tracked) |
| UI Label | "Related Offer" |
| UI Type | Display only |
| Business Note | Optional - some placements happen without formal offer tracking |

---

### job_id
| Property | Value |
|----------|-------|
| Column Name | `job_id` |
| Type | `UUID` |
| Required | **Yes** |
| Foreign Key | `jobs(id)` |
| Description | The job this placement fulfills |
| UI Label | "Job" |
| UI Type | Display only |
| Index | Yes (`idx_placements_job_id`) |
| Business Note | Used to track "positions_filled" count on jobs table |
| Auto-Update | Increments `jobs.positions_filled` when placement created |

---

### candidate_id
| Property | Value |
|----------|-------|
| Column Name | `candidate_id` |
| Type | `UUID` |
| Required | **Yes** |
| Foreign Key | `user_profiles(id)` |
| Description | The consultant/candidate placed |
| UI Label | "Consultant" |
| UI Type | Display only |
| Index | Yes (`idx_placements_candidate_id`) |
| Business Note | Used for candidate revenue history & performance tracking |

---

### account_id
| Property | Value |
|----------|-------|
| Column Name | `account_id` |
| Type | `UUID` |
| Required | **Yes** |
| Foreign Key | `accounts(id)` |
| Description | The client account paying for this placement |
| UI Label | "Client Account" |
| UI Type | Display only |
| Index | Yes (`idx_placements_account_id`) |
| Business Note | **CRITICAL** for revenue rollup and client billing |

---

### placement_type
| Property | Value |
|----------|-------|
| Column Name | `placement_type` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'contract'` |
| Allowed Values | `contract`, `permanent`, `contract_to_hire`, `temp`, `sow` |
| Description | Type of placement |
| UI Label | "Placement Type" |
| UI Type | Dropdown (typically inherited from job) |
| Business Note | Affects commission structure |

**Enum Values:**
| Value | Display Label | Commission Rate | Description |
|-------|---------------|-----------------|-------------|
| `contract` | Contract | 15-20% margin | Hourly/daily contract work |
| `permanent` | Permanent (Direct Hire) | 15-25% of annual salary | Full-time direct hire placement |
| `contract_to_hire` | Contract to Hire | 15-20% margin + 10-15% conversion fee | Contract with conversion option |
| `temp` | Temporary | 10-15% margin | Short-term temporary work |
| `sow` | Statement of Work | Project-based | Project-based work |

---

### start_date
| Property | Value |
|----------|-------|
| Column Name | `start_date` |
| Type | `DATE` |
| Required | **Yes** |
| Description | Candidate's actual start date on the job |
| UI Label | "Start Date" |
| UI Type | Date Picker |
| Validation | Cannot be more than 90 days in the past or future (on create) |
| Business Note | **REVENUE STARTS HERE** - all revenue calculations begin from this date |
| Index | Yes (`idx_placements_start_date`) - for date range queries |

---

### end_date
| Property | Value |
|----------|-------|
| Column Name | `end_date` |
| Type | `DATE` |
| Required | No |
| Min | start_date + 1 day |
| Description | Expected/planned end date of placement |
| UI Label | "End Date" |
| UI Type | Date Picker |
| Validation | Must be after start_date |
| Business Note | For contract roles, this is the planned end. For permanent, leave NULL |
| Revenue Impact | Used to calculate total expected revenue |

---

### actual_end_date
| Property | Value |
|----------|-------|
| Column Name | `actual_end_date` |
| Type | `DATE` |
| Required | No |
| Description | Actual date the placement ended (if different from end_date) |
| UI Label | "Actual End Date" |
| UI Type | Date Picker (only visible when ending placement) |
| Business Note | **REVENUE ENDS HERE** - use this for final revenue calculations |
| Set When | Status changes to 'ended' or 'cancelled' |

---

### bill_rate
| Property | Value |
|----------|-------|
| Column Name | `bill_rate` |
| Type | `NUMERIC(10,2)` |
| Required | **Yes** |
| Min | 0 |
| Precision | 2 decimal places |
| Description | Hourly/daily/annual rate charged to client |
| UI Label | "Bill Rate" |
| UI Type | Currency Input |
| UI Prefix | "$" |
| UI Suffix | Based on job's rate_type |
| Validation | Must be > 0 and > pay_rate |
| Business Note | **PRIMARY REVENUE METRIC** - what client pays |
| Error Message | "Bill rate must be greater than pay rate" |

**Revenue Calculation:**
```
Hourly Contracts:
  Weekly Revenue = bill_rate × 40 hours
  Monthly Revenue = bill_rate × 40 hours × 4.33 weeks
  Annual Revenue = bill_rate × 2080 hours

Annual Placements:
  Annual Revenue = bill_rate
  Monthly Revenue = bill_rate / 12
```

---

### pay_rate
| Property | Value |
|----------|-------|
| Column Name | `pay_rate` |
| Type | `NUMERIC(10,2)` |
| Required | **Yes** |
| Min | 0 |
| Max | bill_rate |
| Precision | 2 decimal places |
| Description | Hourly/daily/annual rate paid to consultant |
| UI Label | "Pay Rate" |
| UI Type | Currency Input |
| UI Prefix | "$" |
| Validation | Must be > 0 and < bill_rate |
| Business Note | **COST METRIC** - what we pay the consultant |
| Error Message | "Pay rate must be less than bill rate" |

---

### markup_percentage
| Property | Value |
|----------|-------|
| Column Name | `markup_percentage` |
| Type | `NUMERIC(5,2)` |
| Required | No (auto-calculated) |
| Precision | 2 decimal places |
| Description | Markup percentage on pay rate |
| UI Label | "Markup %" |
| UI Type | Display only (calculated) |
| Business Note | **GROSS PROFIT MARGIN** - key profitability metric |
| Min Target | 15% |
| Standard Target | 20-25% |
| Excellent | 30%+ |

**Calculation Formula:**
```javascript
markup_percentage = ((bill_rate - pay_rate) / pay_rate) × 100

Example:
  Bill Rate: $100/hr
  Pay Rate: $80/hr
  Margin: $20/hr
  Markup: ($20 / $80) × 100 = 25%
```

**Business Rules:**
- Below 15%: Requires VP approval
- 15-20%: Standard approval
- 20-30%: Target range
- Above 30%: Excellent

---

### status
| Property | Value |
|----------|-------|
| Column Name | `status` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'active'` |
| Allowed Values | `active`, `extended`, `ended`, `cancelled` |
| Description | Current placement status |
| UI Label | "Status" |
| UI Type | Status Badge (Dropdown for authorized users) |
| Index | Yes (`idx_placements_status`) |
| Business Note | **REVENUE RECOGNITION** - only 'active' and 'extended' generate revenue |

**Enum Values:**
| Value | Display Label | Color | Badge | Revenue Impact | Description |
|-------|---------------|-------|-------|----------------|-------------|
| `active` | Active | Green | 🟢 | **YES** | Currently generating revenue |
| `extended` | Extended | Blue | 🔵 | **YES** | Contract extended beyond original end_date |
| `ended` | Ended | Gray | ⚫ | **NO** | Completed successfully |
| `cancelled` | Cancelled | Red | 🔴 | **NO** | Terminated early |

**Status Lifecycle:**
```
active → extended → ended
  ↓
cancelled
```

**Status Transitions:**
| From | To | Trigger | Required Fields |
|------|-----|---------|-----------------|
| `active` | `extended` | Contract extended | New `end_date` |
| `active` | `ended` | Normal completion | `actual_end_date`, optional `end_reason` |
| `active` | `cancelled` | Early termination | `actual_end_date`, **required** `end_reason` |
| `extended` | `ended` | Normal completion | `actual_end_date`, optional `end_reason` |
| `extended` | `cancelled` | Early termination | `actual_end_date`, **required** `end_reason` |

---

### end_reason
| Property | Value |
|----------|-------|
| Column Name | `end_reason` |
| Type | `TEXT` |
| Required | **Yes** when status = 'cancelled' |
| Allowed Values | `completed`, `client_terminated`, `candidate_quit`, `performance`, `budget_cuts`, `project_completed`, `no_show`, `failed_background_check`, `other` |
| Description | Reason placement ended |
| UI Label | "End Reason" |
| UI Type | Dropdown + optional notes |
| Business Note | **CRITICAL** for tracking placement quality and client satisfaction |

**Enum Values:**
| Value | Display Label | Impact on Metrics | Commission Impact |
|-------|---------------|-------------------|-------------------|
| `completed` | Contract Completed | Positive | Full commission |
| `client_terminated` | Client Terminated | Neutral | Pro-rated |
| `candidate_quit` | Candidate Quit | Negative | Pro-rated |
| `performance` | Performance Issues | Negative | Review required |
| `budget_cuts` | Budget Cuts | Neutral | Pro-rated |
| `project_completed` | Project Completed Early | Positive | Full commission |
| `no_show` | Candidate No-Show | Very Negative | No commission |
| `failed_background_check` | Failed BGC | Neutral | No commission |
| `other` | Other | Neutral | Review required |

---

### total_revenue
| Property | Value |
|----------|-------|
| Column Name | `total_revenue` |
| Type | `NUMERIC(12,2)` |
| Required | No (auto-calculated) |
| Precision | 2 decimal places |
| Description | Total revenue generated from this placement |
| UI Label | "Total Revenue" |
| UI Type | Display only (calculated) |
| Business Note | **KEY METRIC** - sum of all invoiced amounts |
| Update Frequency | Updated when invoices are created/paid |

**Calculation:**
```javascript
// For hourly contracts:
total_revenue = SUM(timesheets.hours × bill_rate)

// For annual placements:
total_revenue = bill_rate × (days_worked / 365)

// For completed placements:
total_revenue = FINAL calculated value
```

**Dashboard Display:**
- Individual Placement View: Show total revenue to date
- Recruiter Dashboard: Sum of all active placements
- Company Dashboard: Total active revenue (all placements)
- Sprint Metrics: Revenue per sprint (2 weeks)

---

### total_paid
| Property | Value |
|----------|-------|
| Column Name | `total_paid` |
| Type | `NUMERIC(12,2)` |
| Required | No (auto-calculated) |
| Precision | 2 decimal places |
| Description | Total amount paid to consultant |
| UI Label | "Total Paid" |
| UI Type | Display only (calculated) |
| Business Note | Used to calculate actual gross profit |

**Calculation:**
```javascript
total_paid = SUM(timesheets.hours × pay_rate)
```

**Gross Profit Calculation:**
```javascript
gross_profit = total_revenue - total_paid
gross_profit_margin = (gross_profit / total_revenue) × 100
```

---

### onboarding_status
| Property | Value |
|----------|-------|
| Column Name | `onboarding_status` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'pending'` |
| Allowed Values | `pending`, `in_progress`, `completed`, `blocked` |
| Description | Onboarding checklist completion status |
| UI Label | "Onboarding Status" |
| UI Type | Status Badge |
| Business Note | Placement cannot start billing until onboarding completed |

**Enum Values:**
| Value | Display Label | Color | Description |
|-------|---------------|-------|-------------|
| `pending` | Pending | Gray | Not started |
| `in_progress` | In Progress | Yellow | Checklist in progress |
| `completed` | Completed | Green | All items done, can bill |
| `blocked` | Blocked | Red | Waiting for external action |

**Onboarding Checklist (tracked in related table):**
- [ ] I-9 Form completed
- [ ] W-4/W-9 Form completed
- [ ] Direct deposit setup
- [ ] Background check cleared
- [ ] Drug test passed (if required)
- [ ] Client system access granted
- [ ] Equipment issued
- [ ] Orientation completed
- [ ] NDA signed
- [ ] Client onboarding completed

---

### onboarding_completed_at
| Property | Value |
|----------|-------|
| Column Name | `onboarding_completed_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | When onboarding was completed |
| UI Label | "Onboarding Completed" |
| UI Type | Display only |
| Auto-Set | When onboarding_status changes to 'completed' |
| Business Note | Time to onboard is a key efficiency metric |

**Metrics:**
- Target: Complete within 3 business days of start_date
- Standard: 5 business days
- Needs Improvement: > 7 business days

---

### performance_rating
| Property | Value |
|----------|-------|
| Column Name | `performance_rating` |
| Type | `INTEGER` |
| Required | No |
| Min | 1 |
| Max | 5 |
| Description | Client's performance rating of consultant |
| UI Label | "Performance Rating" |
| UI Type | Star Rating (5 stars) |
| Business Note | Used for future placement decisions and candidate quality metrics |

**Rating Scale:**
| Rating | Description | Action |
|--------|-------------|--------|
| 5 | Exceptional | Preferred candidate for future roles |
| 4 | Above Average | Recommend for similar roles |
| 3 | Meets Expectations | Acceptable performance |
| 2 | Below Average | Monitor closely, provide support |
| 1 | Poor | Immediate intervention required |

---

### extension_count
| Property | Value |
|----------|-------|
| Column Name | `extension_count` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Description | Number of times contract has been extended |
| UI Label | "Extensions" |
| UI Type | Display only (auto-incremented) |
| Business Note | **QUALITY INDICATOR** - more extensions = happy client |
| Auto-Update | Incremented each time end_date is extended |

**Business Rules:**
- 0 extensions: Normal
- 1-2 extensions: Good performance
- 3+ extensions: Excellent performance, strong client relationship

**Extension Workflow:**
1. Client requests extension
2. Recruiter negotiates rates (may increase bill rate)
3. Update `end_date` field
4. Increment `extension_count`
5. Update `status` to 'extended'
6. Create activity log entry
7. Notify finance team for revenue forecast update

---

### recruiter_id
| Property | Value |
|----------|-------|
| Column Name | `recruiter_id` |
| Type | `UUID` |
| Required | **Yes** |
| Foreign Key | `user_profiles(id)` |
| Description | Recruiter who made this placement |
| UI Label | "Recruiter" |
| UI Type | User Select |
| Index | Yes (`idx_placements_recruiter_id`) |
| Business Note | **COMMISSION BASIS** - used for commission calculations |

**Commission Rules:**
- Primary recruiter gets full commission on gross profit
- Commission typically 10-30% of gross profit based on margin
- Commission paid after 90 days (probationary period)
- If placement ends before 90 days, commission may be clawed back

**Dashboard Metrics by Recruiter:**
- Active placements count (Sprint target: 1 per 2 weeks)
- Total active revenue
- Average margin %
- Extension rate
- Placement survival rate (% lasting > 90 days)

---

### account_manager_id
| Property | Value |
|----------|-------|
| Column Name | `account_manager_id` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | Account Manager responsible for client relationship |
| UI Label | "Account Manager" |
| UI Type | User Select |
| Index | Yes (`idx_placements_account_mgr_id`) |
| Business Note | May receive commission split on extensions |

---

### created_at
| Property | Value |
|----------|-------|
| Column Name | `created_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Description | When placement record was created |
| UI Display | Display only, formatted |
| Business Note | Different from start_date (record creation vs actual start) |

---

### updated_at
| Property | Value |
|----------|-------|
| Column Name | `updated_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Auto Update | Yes (via trigger) |
| Description | Last update timestamp |
| UI Display | Display only, formatted |

---

### created_by
| Property | Value |
|----------|-------|
| Column Name | `created_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who created the placement record |
| UI Display | Display only |

---

## Calculated Fields (Not Stored)

### gross_profit
```javascript
gross_profit = total_revenue - total_paid
```

### gross_profit_margin
```javascript
gross_profit_margin = ((total_revenue - total_paid) / total_revenue) × 100
```

### days_active
```javascript
days_active = (actual_end_date || CURRENT_DATE) - start_date
```

### expected_total_revenue
```javascript
// For hourly contracts:
expected_weeks = (end_date - start_date) / 7
expected_total_revenue = bill_rate × 40 × expected_weeks

// For annual placements:
expected_days = end_date - start_date
expected_total_revenue = (bill_rate / 365) × expected_days
```

### time_to_onboard
```javascript
time_to_onboard = onboarding_completed_at - start_date
```

---

## Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `placements_pkey` | `id` | BTREE | Primary key |
| `idx_placements_org_id` | `org_id` | BTREE | Tenant filtering |
| `idx_placements_submission_id` | `submission_id` | BTREE | Submission lookup |
| `idx_placements_job_id` | `job_id` | BTREE | Job lookup |
| `idx_placements_candidate_id` | `candidate_id` | BTREE | Candidate history |
| `idx_placements_account_id` | `account_id` | BTREE | **REVENUE ROLLUP** |
| `idx_placements_recruiter_id` | `recruiter_id` | BTREE | **COMMISSION CALC** |
| `idx_placements_account_mgr_id` | `account_manager_id` | BTREE | AM dashboard |
| `idx_placements_status` | `status` | BTREE | **ACTIVE REVENUE** filter |
| `idx_placements_start_date` | `start_date` | BTREE | Date range queries |
| `idx_placements_status_start` | `status`, `start_date` | BTREE | Active placements by date |

---

## Composite Indexes (Performance Critical)

```sql
-- Active revenue queries (most common)
CREATE INDEX idx_placements_active_revenue
  ON placements(org_id, status, start_date)
  WHERE status IN ('active', 'extended');

-- Recruiter dashboard
CREATE INDEX idx_placements_recruiter_active
  ON placements(recruiter_id, status, start_date)
  WHERE status IN ('active', 'extended');

-- Account revenue
CREATE INDEX idx_placements_account_revenue
  ON placements(account_id, status, start_date)
  WHERE status IN ('active', 'extended');
```

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;

-- Organization isolation
CREATE POLICY "placements_org_isolation" ON placements
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Recruiters can see their own placements
CREATE POLICY "placements_recruiter_access" ON placements
  FOR SELECT
  USING (
    recruiter_id = (auth.jwt() ->> 'user_id')::uuid
    OR account_manager_id = (auth.jwt() ->> 'user_id')::uuid
  );

-- Executives and finance can see all
CREATE POLICY "placements_executive_access" ON placements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (auth.jwt() ->> 'user_id')::uuid
      AND role IN ('admin', 'executive', 'finance')
    )
  );
```

---

## Triggers

### Updated At Trigger
```sql
CREATE TRIGGER placements_updated_at
  BEFORE UPDATE ON placements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Auto-Calculate Markup Trigger
```sql
CREATE OR REPLACE FUNCTION calculate_placement_markup()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate markup percentage
  IF NEW.pay_rate > 0 THEN
    NEW.markup_percentage := ROUND(
      ((NEW.bill_rate - NEW.pay_rate) / NEW.pay_rate * 100)::numeric,
      2
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER placements_calculate_markup
  BEFORE INSERT OR UPDATE OF bill_rate, pay_rate ON placements
  FOR EACH ROW
  EXECUTE FUNCTION calculate_placement_markup();
```

### Increment Job Positions Filled
```sql
CREATE OR REPLACE FUNCTION increment_job_positions_filled()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment positions_filled on the job
  UPDATE jobs
  SET positions_filled = positions_filled + 1
  WHERE id = NEW.job_id;

  -- Update job status to 'filled' if all positions filled
  UPDATE jobs
  SET status = 'filled', filled_date = CURRENT_DATE
  WHERE id = NEW.job_id
  AND positions_filled >= positions_count;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER placements_increment_positions
  AFTER INSERT ON placements
  FOR EACH ROW
  EXECUTE FUNCTION increment_job_positions_filled();
```

### Update Submission Status
```sql
CREATE OR REPLACE FUNCTION update_submission_on_placement()
RETURNS TRIGGER AS $$
BEGIN
  -- Update submission status to 'placed'
  UPDATE submissions
  SET status = 'placed'
  WHERE id = NEW.submission_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER placements_update_submission
  AFTER INSERT ON placements
  FOR EACH ROW
  EXECUTE FUNCTION update_submission_on_placement();
```

### Extension Count Trigger
```sql
CREATE OR REPLACE FUNCTION track_placement_extension()
RETURNS TRIGGER AS $$
BEGIN
  -- If end_date is extended, increment extension_count
  IF NEW.end_date IS NOT NULL
     AND OLD.end_date IS NOT NULL
     AND NEW.end_date > OLD.end_date THEN
    NEW.extension_count := OLD.extension_count + 1;
    NEW.status := 'extended';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER placements_track_extension
  BEFORE UPDATE OF end_date ON placements
  FOR EACH ROW
  EXECUTE FUNCTION track_placement_extension();
```

### Revenue Forecast Update
```sql
CREATE OR REPLACE FUNCTION update_revenue_forecast()
RETURNS TRIGGER AS $$
BEGIN
  -- Trigger recalculation of revenue forecasts
  -- (Implementation depends on forecasting system)

  PERFORM pg_notify('revenue_changed', json_build_object(
    'placement_id', NEW.id,
    'org_id', NEW.org_id,
    'account_id', NEW.account_id
  )::text);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER placements_revenue_forecast
  AFTER INSERT OR UPDATE OF status, bill_rate, end_date ON placements
  FOR EACH ROW
  EXECUTE FUNCTION update_revenue_forecast();
```

---

## Related Tables

| Table | Relationship | FK Column | Purpose |
|-------|--------------|-----------|---------|
| organizations | Parent | `org_id` | Multi-tenancy |
| submissions | Parent | `submission_id` | Hiring funnel tracking |
| offers | Parent | `offer_id` | Offer tracking (optional) |
| jobs | Parent | `job_id` | Position fulfilled |
| user_profiles | Candidate | `candidate_id` | Consultant placed |
| accounts | Parent | `account_id` | **CLIENT BILLING** |
| user_profiles | Recruiter | `recruiter_id` | **COMMISSION** |
| user_profiles | AM | `account_manager_id` | Account management |
| timesheets | Children | `timesheets.placement_id` | **HOURS TRACKING** |
| invoices | Children | `invoices.placement_id` | **BILLING** |
| placement_extensions | Children | `placement_extensions.placement_id` | Extension history |
| compliance_documents | Related | `compliance_documents.placement_id` | Onboarding docs |
| background_checks | Related | `background_checks.placement_id` | BGC tracking |
| commission_records | Children | `commission_records.placement_id` | Commission tracking |

---

## Business Rules & Validations

### Rate Validation
```sql
ALTER TABLE placements ADD CONSTRAINT check_bill_rate_greater_than_pay_rate
  CHECK (bill_rate > pay_rate);

ALTER TABLE placements ADD CONSTRAINT check_positive_rates
  CHECK (bill_rate > 0 AND pay_rate > 0);
```

### Date Validation
```sql
ALTER TABLE placements ADD CONSTRAINT check_end_date_after_start
  CHECK (end_date IS NULL OR end_date > start_date);

ALTER TABLE placements ADD CONSTRAINT check_actual_end_after_start
  CHECK (actual_end_date IS NULL OR actual_end_date >= start_date);
```

### Status Validation
```sql
ALTER TABLE placements ADD CONSTRAINT check_cancelled_has_reason
  CHECK (status != 'cancelled' OR end_reason IS NOT NULL);
```

### Performance Rating Validation
```sql
ALTER TABLE placements ADD CONSTRAINT check_performance_rating_range
  CHECK (performance_rating IS NULL OR (performance_rating >= 1 AND performance_rating <= 5));
```

---

## Revenue Metrics & Calculations

### Key Performance Indicators (KPIs)

#### Individual Placement Metrics
```sql
-- Gross Profit
SELECT
  id,
  candidate_id,
  (total_revenue - total_paid) as gross_profit,
  ROUND(((total_revenue - total_paid) / total_revenue * 100)::numeric, 2) as margin_pct
FROM placements
WHERE status IN ('active', 'extended');

-- Revenue Per Day
SELECT
  id,
  ROUND((total_revenue / NULLIF(EXTRACT(days FROM (COALESCE(actual_end_date, CURRENT_DATE) - start_date)), 0))::numeric, 2) as revenue_per_day
FROM placements;
```

#### Recruiter Metrics
```sql
-- Active Placements & Revenue by Recruiter
SELECT
  recruiter_id,
  COUNT(*) as active_placements,
  SUM(total_revenue) as total_revenue,
  AVG(markup_percentage) as avg_margin,
  COUNT(*) FILTER (WHERE extension_count > 0) as extended_placements
FROM placements
WHERE status IN ('active', 'extended')
GROUP BY recruiter_id;

-- Sprint Metrics (2-week sprints)
SELECT
  recruiter_id,
  DATE_TRUNC('week', start_date) as sprint_start,
  COUNT(*) as placements_in_sprint
FROM placements
WHERE start_date >= CURRENT_DATE - INTERVAL '14 days'
GROUP BY recruiter_id, DATE_TRUNC('week', start_date);
```

#### Company Metrics
```sql
-- Total Active Revenue
SELECT
  SUM(bill_rate * 40 * 4.33) as monthly_active_revenue
FROM placements
WHERE status IN ('active', 'extended')
AND (end_date IS NULL OR end_date > CURRENT_DATE);

-- Average Margin
SELECT
  ROUND(AVG(markup_percentage)::numeric, 2) as avg_markup_pct
FROM placements
WHERE status IN ('active', 'extended');

-- Placement Survival Rate (lasting > 90 days)
SELECT
  COUNT(*) FILTER (WHERE actual_end_date >= start_date + INTERVAL '90 days' OR actual_end_date IS NULL) * 100.0 / COUNT(*) as survival_rate_pct
FROM placements
WHERE start_date >= CURRENT_DATE - INTERVAL '1 year';
```

#### Client Metrics
```sql
-- Revenue by Client
SELECT
  account_id,
  COUNT(*) as active_placements,
  SUM(total_revenue) as lifetime_revenue,
  AVG(performance_rating) as avg_performance,
  AVG(extension_count) as avg_extensions
FROM placements
WHERE status IN ('active', 'extended')
GROUP BY account_id;
```

---

## Commission Calculation Rules

### Standard Commission Structure
```sql
-- Commission = Gross Profit × Commission Rate
-- Commission Rate varies by margin:

SELECT
  id,
  recruiter_id,
  (total_revenue - total_paid) as gross_profit,
  CASE
    WHEN markup_percentage < 15 THEN 0.10  -- 10% commission for low margin
    WHEN markup_percentage < 20 THEN 0.15  -- 15% commission
    WHEN markup_percentage < 25 THEN 0.20  -- 20% commission
    WHEN markup_percentage < 30 THEN 0.25  -- 25% commission
    ELSE 0.30                               -- 30% commission for excellent margin
  END as commission_rate,
  (total_revenue - total_paid) *
  CASE
    WHEN markup_percentage < 15 THEN 0.10
    WHEN markup_percentage < 20 THEN 0.15
    WHEN markup_percentage < 25 THEN 0.20
    WHEN markup_percentage < 30 THEN 0.25
    ELSE 0.30
  END as commission_amount
FROM placements
WHERE status IN ('active', 'extended')
AND start_date <= CURRENT_DATE - INTERVAL '90 days';  -- 90-day probation
```

### Clawback Rules
- If placement ends before 90 days: Full clawback
- If placement ends 90-180 days: 50% clawback
- If placement ends after 180 days: No clawback

---

## Sprint Placement Metrics

**Target: 1 placement per person per 2-week sprint**

```sql
-- Sprint Performance Dashboard
WITH sprint_periods AS (
  SELECT
    DATE_TRUNC('week', CURRENT_DATE) - (n || ' weeks')::interval as sprint_start,
    DATE_TRUNC('week', CURRENT_DATE) - (n || ' weeks')::interval + INTERVAL '14 days' as sprint_end
  FROM generate_series(0, 12, 2) n  -- Last 6 sprints
)
SELECT
  sp.sprint_start,
  up.id as recruiter_id,
  up.full_name as recruiter_name,
  COUNT(p.id) as placements_count,
  CASE
    WHEN COUNT(p.id) >= 1 THEN '✅ On Target'
    ELSE '⚠️ Below Target'
  END as status
FROM sprint_periods sp
CROSS JOIN user_profiles up
LEFT JOIN placements p ON
  p.recruiter_id = up.id
  AND p.start_date >= sp.sprint_start
  AND p.start_date < sp.sprint_end
WHERE up.role IN ('recruiter', 'senior_recruiter')
GROUP BY sp.sprint_start, up.id, up.full_name
ORDER BY sp.sprint_start DESC, recruiter_name;
```

---

## Onboarding Checklist Integration

**Related Table: `placement_onboarding_tasks`**

```sql
CREATE TABLE placement_onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  task_category TEXT NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES user_profiles(id),
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Standard onboarding tasks (auto-created on placement insert)
INSERT INTO placement_onboarding_tasks (placement_id, task_name, task_category, is_required)
VALUES
  (NEW.id, 'I-9 Form - Section 1', 'compliance', TRUE),
  (NEW.id, 'I-9 Form - Section 2', 'compliance', TRUE),
  (NEW.id, 'W-4/W-9 Tax Form', 'payroll', TRUE),
  (NEW.id, 'Direct Deposit Form', 'payroll', TRUE),
  (NEW.id, 'Background Check', 'compliance', TRUE),
  (NEW.id, 'Drug Test', 'compliance', FALSE),  -- Client-dependent
  (NEW.id, 'NDA Signature', 'legal', TRUE),
  (NEW.id, 'Client System Access', 'technical', TRUE),
  (NEW.id, 'Equipment Issued', 'operations', FALSE),
  (NEW.id, 'Orientation Completed', 'hr', TRUE),
  (NEW.id, 'Client Onboarding', 'client', TRUE);
```

**Onboarding Completion Check:**
```sql
CREATE OR REPLACE FUNCTION check_onboarding_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_required INTEGER;
  completed_required INTEGER;
BEGIN
  -- Count required vs completed tasks
  SELECT
    COUNT(*) FILTER (WHERE is_required = TRUE),
    COUNT(*) FILTER (WHERE is_required = TRUE AND is_completed = TRUE)
  INTO total_required, completed_required
  FROM placement_onboarding_tasks
  WHERE placement_id = NEW.placement_id;

  -- Update placement onboarding status
  IF completed_required = total_required THEN
    UPDATE placements
    SET onboarding_status = 'completed',
        onboarding_completed_at = NOW()
    WHERE id = NEW.placement_id;
  ELSIF completed_required > 0 THEN
    UPDATE placements
    SET onboarding_status = 'in_progress'
    WHERE id = NEW.placement_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER onboarding_task_completion
  AFTER UPDATE OF is_completed ON placement_onboarding_tasks
  FOR EACH ROW
  EXECUTE FUNCTION check_onboarding_completion();
```

---

## Revenue Forecasting

### Monthly Revenue Forecast
```sql
CREATE VIEW monthly_revenue_forecast AS
SELECT
  DATE_TRUNC('month', forecast_date) as forecast_month,
  org_id,
  account_id,
  COUNT(DISTINCT placement_id) as active_placements,
  SUM(projected_revenue) as projected_monthly_revenue
FROM (
  SELECT
    p.id as placement_id,
    p.org_id,
    p.account_id,
    generate_series(
      DATE_TRUNC('month', GREATEST(p.start_date, CURRENT_DATE)),
      DATE_TRUNC('month', COALESCE(p.end_date, CURRENT_DATE + INTERVAL '12 months')),
      INTERVAL '1 month'
    ) as forecast_date,
    -- Monthly revenue calculation (assuming 40 hrs/week)
    p.bill_rate * 40 * 4.33 as projected_revenue
  FROM placements p
  WHERE p.status IN ('active', 'extended')
  AND (p.end_date IS NULL OR p.end_date > CURRENT_DATE)
) forecast_data
GROUP BY DATE_TRUNC('month', forecast_date), org_id, account_id;
```

---

## Timesheets Integration

**Related Table: `timesheets`** (tracks actual hours worked)

```sql
CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  placement_id UUID NOT NULL REFERENCES placements(id),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Time period
  week_ending_date DATE NOT NULL,

  -- Hours (by day)
  monday_hours NUMERIC(4,2) DEFAULT 0,
  tuesday_hours NUMERIC(4,2) DEFAULT 0,
  wednesday_hours NUMERIC(4,2) DEFAULT 0,
  thursday_hours NUMERIC(4,2) DEFAULT 0,
  friday_hours NUMERIC(4,2) DEFAULT 0,
  saturday_hours NUMERIC(4,2) DEFAULT 0,
  sunday_hours NUMERIC(4,2) DEFAULT 0,
  total_hours NUMERIC(5,2) GENERATED ALWAYS AS (
    monday_hours + tuesday_hours + wednesday_hours + thursday_hours +
    friday_hours + saturday_hours + sunday_hours
  ) STORED,

  -- Billing
  bill_rate NUMERIC(10,2) NOT NULL,  -- Stored at time of timesheet
  pay_rate NUMERIC(10,2) NOT NULL,

  -- Status
  status TEXT DEFAULT 'draft',  -- draft, submitted, approved, rejected, invoiced, paid

  -- Approval workflow
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES user_profiles(id),

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update placement total_revenue when timesheets approved
CREATE OR REPLACE FUNCTION update_placement_revenue()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE placements
  SET
    total_revenue = (
      SELECT COALESCE(SUM(total_hours * bill_rate), 0)
      FROM timesheets
      WHERE placement_id = NEW.placement_id
      AND status IN ('approved', 'invoiced', 'paid')
    ),
    total_paid = (
      SELECT COALESCE(SUM(total_hours * pay_rate), 0)
      FROM timesheets
      WHERE placement_id = NEW.placement_id
      AND status IN ('approved', 'invoiced', 'paid')
    )
  WHERE id = NEW.placement_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER timesheets_update_revenue
  AFTER INSERT OR UPDATE OF status ON timesheets
  FOR EACH ROW
  WHEN (NEW.status IN ('approved', 'invoiced', 'paid'))
  EXECUTE FUNCTION update_placement_revenue();
```

---

## Invoices Integration

**Related Table: `invoices`** (client billing)

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Invoice details
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,

  -- Association
  account_id UUID NOT NULL REFERENCES accounts(id),
  placement_id UUID REFERENCES placements(id),

  -- Line items (could be from multiple timesheets)
  timesheet_ids UUID[] DEFAULT ARRAY[]::UUID[],

  -- Amounts
  subtotal NUMERIC(12,2) NOT NULL,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,

  -- Payment
  status TEXT DEFAULT 'draft',  -- draft, sent, paid, overdue, cancelled
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);
```

---

## Dashboard Queries

### Executive Dashboard - Active Revenue Summary
```sql
SELECT
  COUNT(*) as total_active_placements,
  COUNT(DISTINCT account_id) as active_clients,
  COUNT(DISTINCT recruiter_id) as recruiters_with_placements,
  SUM(bill_rate * 40 * 4.33) as monthly_recurring_revenue,
  AVG(markup_percentage) as avg_margin,
  SUM((bill_rate - pay_rate) * 40 * 4.33) as monthly_gross_profit
FROM placements
WHERE status IN ('active', 'extended')
AND (end_date IS NULL OR end_date > CURRENT_DATE);
```

### Recruiter Performance Dashboard
```sql
SELECT
  r.id as recruiter_id,
  r.full_name,
  COUNT(p.id) as active_placements,
  SUM(p.total_revenue) as lifetime_revenue,
  AVG(p.markup_percentage) as avg_margin,
  AVG(p.extension_count) as avg_extensions,
  COUNT(*) FILTER (WHERE p.start_date >= CURRENT_DATE - INTERVAL '14 days') as sprint_placements
FROM user_profiles r
LEFT JOIN placements p ON p.recruiter_id = r.id AND p.status IN ('active', 'extended')
WHERE r.role IN ('recruiter', 'senior_recruiter')
GROUP BY r.id, r.full_name
ORDER BY active_placements DESC;
```

### Client Revenue Dashboard
```sql
SELECT
  a.id as account_id,
  a.name as client_name,
  COUNT(p.id) as active_placements,
  SUM(p.bill_rate * 40 * 4.33) as monthly_revenue,
  AVG(p.performance_rating) as avg_performance,
  AVG(p.extension_count) as avg_extensions,
  MAX(p.start_date) as last_placement_date
FROM accounts a
LEFT JOIN placements p ON p.account_id = a.id AND p.status IN ('active', 'extended')
GROUP BY a.id, a.name
ORDER BY monthly_revenue DESC;
```

---

## Data Integrity Checks

### Missing Revenue Data
```sql
-- Placements without timesheets
SELECT p.*
FROM placements p
LEFT JOIN timesheets t ON t.placement_id = p.id
WHERE p.status IN ('active', 'extended')
AND p.start_date < CURRENT_DATE - INTERVAL '1 week'
AND t.id IS NULL;
```

### Margin Below Threshold
```sql
-- Placements with margin < 15% (requires approval)
SELECT
  p.*,
  up.full_name as recruiter_name,
  a.name as client_name
FROM placements p
JOIN user_profiles up ON up.id = p.recruiter_id
JOIN accounts a ON a.id = p.account_id
WHERE p.markup_percentage < 15
AND p.status IN ('active', 'extended');
```

### Onboarding Delays
```sql
-- Placements with delayed onboarding
SELECT
  p.id,
  p.candidate_id,
  p.start_date,
  p.onboarding_status,
  EXTRACT(days FROM (CURRENT_DATE - p.start_date)) as days_since_start
FROM placements p
WHERE p.onboarding_status != 'completed'
AND p.start_date < CURRENT_DATE - INTERVAL '3 days'
ORDER BY p.start_date;
```

---

*Last Updated: 2025-11-30*
*Version: 1.0*
*Business Criticality: HIGHEST*
*Revenue Impact: DIRECT*
