# Pods Table Specification

## Overview

| Property | Value |
|----------|-------|
| Table Name | `pods` |
| Schema | `public` |
| Purpose | **PERFORMANCE CENTER** - Track team structures and sprint placement metrics |
| Primary Owner | HR Manager / COO |
| RLS Enabled | Yes |
| Soft Delete | No (use `dissolved_date` + `isActive` flag) |
| Business Criticality | **HIGH** - Core performance tracking |

---

## Business Context

Pods are the **CORE TEAM STRUCTURE** in InTime OS. Each pod represents:
- **Team unit** of Manager (senior) + ICs (individual contributors)
- **Sprint performance** tracking (target: 1 placement per person per 2-week sprint)
- **Independent end-to-end execution** - ICs handle full lifecycle (account management, delivery, recruiting)
- **Manager role** - "Path clearer / torch bearer" who handles Consulted and Informed (C and I) responsibilities
- **Autonomous operations** - Each IC works independently with manager oversight
- **Performance accountability** - Pods compete on leaderboards for placement metrics

### Pod Philosophy

In InTime OS, **Pod = Team**, but with a unique structure:
- **Managers** clear paths and remove blockers (not traditional supervisors)
- **ICs** are full-stack professionals handling everything end-to-end
- **Collaboration** within pods for knowledge sharing and support
- **Competition** between pods for performance metrics and recognition

---

## Table Definition

```sql
CREATE TABLE pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Pod Details
  name TEXT NOT NULL,
  pod_type TEXT NOT NULL,

  -- Members (2-person structure: 1 Manager + 1 IC)
  senior_member_id UUID REFERENCES user_profiles(id),
  junior_member_id UUID REFERENCES user_profiles(id),

  -- Goals
  sprint_duration_weeks INTEGER DEFAULT 2,
  placements_per_sprint_target INTEGER DEFAULT 2,

  -- Performance (computed from placements table)
  total_placements INTEGER DEFAULT 0,
  current_sprint_placements INTEGER DEFAULT 0,
  current_sprint_start_date DATE,
  average_placements_per_sprint NUMERIC(5,2),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  formed_date DATE,
  dissolved_date DATE,

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
| Description | Unique identifier for the pod |
| UI Display | Hidden (used in URLs) |
| Business Note | NEVER reuse IDs - each pod must be unique |

---

### org_id
| Property | Value |
|----------|-------|
| Column Name | `org_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `organizations(id)` |
| On Delete | CASCADE |
| Description | Organization this pod belongs to (multi-tenancy) |
| UI Display | Hidden (auto-set from session) |
| RLS | Used in isolation policy |
| Business Note | Pods are always org-specific |

---

### name
| Property | Value |
|----------|-------|
| Column Name | `name` |
| Type | `TEXT` |
| Required | Yes |
| Max Length | 100 characters |
| Min Length | 1 character |
| Description | Pod name/identifier |
| UI Label | "Pod Name" |
| UI Type | Text Input |
| UI Placeholder | "e.g., Alpha Recruiting Pod, Phoenix Bench Sales" |
| Validation | Not empty, alphanumeric with spaces allowed |
| Error Message | "Pod name is required" |
| Index | Yes (for searching) |

**Naming Conventions:**
| Pattern | Example | Usage |
|---------|---------|-------|
| Greek Letters + Type | "Alpha Recruiting Pod" | Standard naming |
| Metaphor + Type | "Phoenix Bench Sales" | Creative naming |
| Location + Type | "NYC TA Team" | Geographic naming |
| Number + Type | "Pod 1 - Recruiting" | Simple numbering |

---

### pod_type
| Property | Value |
|----------|-------|
| Column Name | `pod_type` |
| Type | `TEXT` |
| Required | Yes |
| Allowed Values | `recruiting`, `bench_sales`, `ta` |
| Description | Type of pod (business unit) |
| UI Label | "Pod Type" |
| UI Type | Dropdown (cannot change after creation) |
| Index | Yes (`idx_pods_type`) |
| Business Note | Determines KPIs and leaderboard categories |

**Enum Values:**
| Value | Display Label | Primary Focus | Sprint Target | Key Metrics |
|-------|---------------|---------------|---------------|-------------|
| `recruiting` | Recruiting | Job fulfillment, candidate placement | 1 placement per person per 2 weeks | Placements, Time-to-Fill, Client Satisfaction |
| `bench_sales` | Bench Sales | Consultant marketing, bench reduction | 1 placement per person per 2 weeks | Bench Utilization, Placement Rate, Revenue |
| `ta` | Talent Acquisition (TA) | Business development, lead generation | 1 deal closed per person per 2 weeks | Deals Closed, Pipeline Value, Conversion Rate |

---

### senior_member_id
| Property | Value |
|----------|-------|
| Column Name | `senior_member_id` |
| Type | `UUID` |
| Required | No (pods can have vacant manager position) |
| Foreign Key | `user_profiles(id)` |
| Description | The Manager (senior member) of the pod |
| UI Label | "Manager" |
| UI Type | User Select (filtered to eligible managers) |
| Index | Yes (`idx_pods_senior_member`) |
| Business Note | Manager = "Path clearer / torch bearer" who handles C and I responsibilities |

**Manager Responsibilities:**
| Responsibility | Description |
|----------------|-------------|
| Path Clearing | Remove blockers and obstacles for ICs |
| Torch Bearing | Set direction, maintain standards, inspire team |
| Consulted (C) | Provide expertise and guidance when asked |
| Informed (I) | Stay updated on pod activities and progress |
| Performance Reviews | Conduct regular 1:1s and performance evaluations |
| Escalation Handling | Manage escalations and critical issues |
| Cross-Pod Collaboration | Coordinate with other pod managers |

**Manager vs Traditional Supervisor:**
| Traditional Supervisor | InTime Manager |
|------------------------|----------------|
| Assigns tasks | ICs self-manage |
| Approves all work | ICs make decisions |
| Daily oversight | Weekly check-ins |
| Tells how to do work | Removes blockers |
| Controls processes | Empowers autonomy |

---

### junior_member_id
| Property | Value |
|----------|-------|
| Column Name | `junior_member_id` |
| Type | `UUID` |
| Required | No (pods can have vacant IC position) |
| Foreign Key | `user_profiles(id)` |
| Description | The IC (individual contributor) in the pod |
| UI Label | "Individual Contributor (IC)" |
| UI Type | User Select (filtered to eligible ICs) |
| Index | Yes (`idx_pods_junior_member`) |
| Business Note | IC = Full-stack professional handling end-to-end (account, delivery, recruiting) |

**IC Responsibilities:**
| Area | Description |
|------|-------------|
| Account Management | Build and maintain client relationships |
| Delivery Management | Ensure consultant success and client satisfaction |
| Recruiting | Source, screen, and place candidates |
| Sales | Identify opportunities, negotiate deals |
| End-to-End Ownership | Own the complete lifecycle from lead to placement |
| Self-Management | Manage own pipeline, priorities, and schedule |
| Collaboration | Work with pod and cross-pod for support |

**IC Autonomy:**
- **Decision Making:** ICs make daily operational decisions without approval
- **Client Communication:** Direct client contact without manager filtering
- **Process Ownership:** Choose own methods within company standards
- **Performance Accountability:** Measured on results (placements), not activities

---

### sprint_duration_weeks
| Property | Value |
|----------|-------|
| Column Name | `sprint_duration_weeks` |
| Type | `INTEGER` |
| Required | Yes |
| Default | 2 |
| Min | 1 |
| Max | 4 |
| Description | Length of sprint cycle in weeks |
| UI Label | "Sprint Duration" |
| UI Type | Number Input |
| UI Suffix | "weeks" |
| Business Note | Standard is 2 weeks (Agile sprint cycle) |

**Sprint Duration Options:**
| Weeks | Description | When to Use |
|-------|-------------|-------------|
| 1 | Rapid cycle | High-velocity teams, urgent hiring |
| 2 | **Standard** | Default for most pods |
| 3 | Extended | Slower industries, longer sales cycles |
| 4 | Monthly | Executive hiring, complex placements |

**Sprint Cadence:**
```
Sprint Cycle (2 weeks):
┌─────────────────────────────────────────────┐
│ Week 1                  │ Week 2            │
├─────────────────────────┼───────────────────┤
│ • Sprint Planning       │ • Mid-Sprint      │
│ • Goal Setting          │ • Progress Check  │
│ • Work Execution        │ • Final Push      │
│                         │ • Sprint Review   │
│                         │ • Sprint Retro    │
└─────────────────────────┴───────────────────┘
```

---

### placements_per_sprint_target
| Property | Value |
|----------|-------|
| Column Name | `placements_per_sprint_target` |
| Type | `INTEGER` |
| Required | Yes |
| Default | 2 |
| Min | 1 |
| Max | 10 |
| Description | Target number of placements for the pod per sprint |
| UI Label | "Placement Target per Sprint" |
| UI Type | Number Input |
| Business Note | **CORE KPI** - Default is 1 per person per sprint (2-person pod = 2 total) |

**Target Calculation:**
```
Default Formula:
  placements_per_sprint_target = number_of_ICs × 1

2-Person Pod (1 Manager + 1 IC):
  Target = 1 IC × 1 = 1 placement per sprint

  BUT: In practice, target is often set to 2:
    - Manager contributes when possible
    - IC exceeds 1 placement goal
    - Stretch goal for high performers

Multi-IC Pod (future expansion):
  3-Person Pod (1 Manager + 2 ICs):
    Target = 2 ICs × 1 = 2 placements per sprint

  5-Person Pod (1 Manager + 4 ICs):
    Target = 4 ICs × 1 = 4 placements per sprint
```

**Performance Tiers:**
| Performance | Formula | Example (2-person pod) |
|-------------|---------|------------------------|
| Below Target | < 100% | < 2 placements |
| On Target | 100% | 2 placements |
| Exceeding | 100-150% | 2-3 placements |
| Outstanding | 150%+ | 3+ placements |

---

### total_placements
| Property | Value |
|----------|-------|
| Column Name | `total_placements` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Description | Total placements made by pod since formation |
| UI Label | "Total Placements" |
| UI Type | Display only (auto-incremented) |
| Auto Update | Incremented when placement created by pod member |
| Business Note | Lifetime performance metric |

**Auto-Increment Trigger:**
```sql
CREATE OR REPLACE FUNCTION increment_pod_placements()
RETURNS TRIGGER AS $$
DECLARE
  pod_id_var UUID;
BEGIN
  -- Get pod_id from recruiter's employee_metadata
  SELECT pod_id INTO pod_id_var
  FROM employee_metadata
  WHERE user_id = NEW.recruiter_id;

  IF pod_id_var IS NOT NULL THEN
    -- Increment total_placements
    UPDATE pods
    SET total_placements = total_placements + 1
    WHERE id = pod_id_var;

    -- Check if in current sprint
    UPDATE pods
    SET current_sprint_placements = current_sprint_placements + 1
    WHERE id = pod_id_var
    AND current_sprint_start_date IS NOT NULL
    AND NEW.start_date >= current_sprint_start_date
    AND NEW.start_date < current_sprint_start_date + (sprint_duration_weeks || ' weeks')::interval;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER placements_update_pod_metrics
  AFTER INSERT ON placements
  FOR EACH ROW
  EXECUTE FUNCTION increment_pod_placements();
```

---

### current_sprint_placements
| Property | Value |
|----------|-------|
| Column Name | `current_sprint_placements` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Description | Placements made in current sprint cycle |
| UI Label | "Current Sprint Placements" |
| UI Type | Display only (auto-calculated) |
| Auto Update | Incremented when placement falls within current sprint dates |
| Business Note | **PRIMARY PERFORMANCE METRIC** - compared against `placements_per_sprint_target` |
| Reset | Set to 0 when new sprint starts |

**Sprint Progress Calculation:**
```javascript
sprint_progress_pct = (current_sprint_placements / placements_per_sprint_target) × 100

Status Indicators:
  0-25%   = 🔴 Critical - Needs Attention
  26-50%  = 🟡 Warning - Behind Schedule
  51-75%  = 🟠 Caution - Below Target
  76-99%  = 🟢 Good - Nearly There
  100%+   = 🟢 Excellent - On/Above Target
```

---

### current_sprint_start_date
| Property | Value |
|----------|-------|
| Column Name | `current_sprint_start_date` |
| Type | `DATE` |
| Required | No (set when pod formed or sprint reset) |
| Description | Start date of current sprint cycle |
| UI Label | "Current Sprint Start" |
| UI Type | Display only (auto-managed) |
| Default | Set to pod formation date on creation |
| Index | Yes (for date range queries) |
| Business Note | Used to calculate sprint boundaries and reset cycles |

**Sprint End Calculation:**
```javascript
current_sprint_end_date = current_sprint_start_date + (sprint_duration_weeks × 7 days)

Example:
  Sprint Start: 2025-11-18 (Monday)
  Duration: 2 weeks
  Sprint End: 2025-12-01 (Sunday)
```

**Sprint Auto-Reset Logic:**
```sql
-- Automated job runs daily to reset completed sprints
CREATE OR REPLACE FUNCTION auto_reset_completed_sprints()
RETURNS void AS $$
BEGIN
  UPDATE pods
  SET
    -- Update average before reset
    average_placements_per_sprint = CASE
      WHEN average_placements_per_sprint IS NULL THEN current_sprint_placements::numeric
      ELSE (average_placements_per_sprint + current_sprint_placements) / 2
    END,
    -- Reset sprint
    current_sprint_placements = 0,
    current_sprint_start_date = CURRENT_DATE
  WHERE
    is_active = TRUE
    AND current_sprint_start_date IS NOT NULL
    AND CURRENT_DATE >= current_sprint_start_date + (sprint_duration_weeks || ' weeks')::interval;
END;
$$ LANGUAGE plpgsql;
```

---

### average_placements_per_sprint
| Property | Value |
|----------|-------|
| Column Name | `average_placements_per_sprint` |
| Type | `NUMERIC(5,2)` |
| Required | No (calculated over time) |
| Precision | 2 decimal places |
| Description | Historical average placements per sprint |
| UI Label | "Average per Sprint" |
| UI Type | Display only (calculated) |
| Business Note | Used for trend analysis and performance prediction |

**Calculation Formula:**
```javascript
// Simple Moving Average (SMA)
average_placements_per_sprint = SUM(all_sprint_placements) / COUNT(sprints_completed)

// Weighted Moving Average (WMA) - gives more weight to recent sprints
weighted_average = (
  (recent_sprint × 0.4) +
  (previous_sprint × 0.3) +
  (older_sprint × 0.2) +
  (oldest_sprint × 0.1)
)

Example:
  Sprint 1: 1 placement
  Sprint 2: 2 placements
  Sprint 3: 3 placements
  Sprint 4 (current): 2 placements

  Average = (1 + 2 + 3 + 2) / 4 = 2.00
```

**Performance Trend Analysis:**
```javascript
trend = current_sprint_placements > average_placements_per_sprint ? 'up' : 'down'

Performance Status:
  current > average × 1.5   = "Exceptional"
  current > average × 1.25  = "Exceeding"
  current > average         = "Above Average"
  current = average (±10%)  = "On Track"
  current < average         = "Below Average"
  current < average × 0.5   = "Needs Improvement"
```

---

### is_active
| Property | Value |
|----------|-------|
| Column Name | `is_active` |
| Type | `BOOLEAN` |
| Required | Yes |
| Default | `TRUE` |
| Description | Whether pod is currently active |
| UI Label | "Active" |
| UI Type | Toggle/Checkbox |
| Business Note | Use instead of deleting - preserves historical data |
| Index | Yes (`idx_pods_active`) |

**Status Transitions:**
```
Active (is_active = TRUE):
  - Pod is operational
  - Accepting new members
  - Tracked in leaderboards
  - Counts in performance metrics

Inactive (is_active = FALSE):
  - Pod dissolved/disbanded
  - Members reassigned
  - Historical data preserved
  - Excluded from active metrics
```

**Deactivation Rules:**
- When deactivated, set `dissolved_date` to current date
- Do not delete pod record (preserves history)
- Remove member assignments (`senior_member_id`, `junior_member_id` set to NULL)
- Update `employee_metadata` to remove pod assignments
- Keep all historical placement data linked to pod

---

### formed_date
| Property | Value |
|----------|-------|
| Column Name | `formed_date` |
| Type | `DATE` |
| Required | No (auto-set on creation) |
| Description | Date pod was formed/created |
| UI Label | "Formed Date" |
| UI Type | Date Picker (or auto-set to today) |
| Default | Current date on creation |
| Business Note | Used for pod age and tenure calculations |

**Pod Age Calculation:**
```javascript
pod_age_days = CURRENT_DATE - formed_date
pod_age_months = EXTRACT(MONTH FROM AGE(CURRENT_DATE, formed_date))
pod_age_years = EXTRACT(YEAR FROM AGE(CURRENT_DATE, formed_date))

Pod Maturity Stages:
  0-3 months   = "New" (still forming, learning)
  3-6 months   = "Developing" (gaining traction)
  6-12 months  = "Established" (consistent performance)
  12+ months   = "Mature" (optimized, high performance)
```

---

### dissolved_date
| Property | Value |
|----------|-------|
| Column Name | `dissolved_date` |
| Type | `DATE` |
| Required | No |
| Description | Date pod was dissolved/deactivated |
| UI Label | "Dissolved Date" |
| UI Type | Display only (auto-set when is_active = FALSE) |
| Business Note | Marks end of pod lifecycle |

**Dissolution Reasons:**
| Reason | Description | Action |
|--------|-------------|--------|
| Restructuring | Org restructure, pod reorganization | Migrate members to new pods |
| Underperformance | Consistently missing targets | Reassign, provide coaching |
| Member Departure | Key member left company | Reform with new member or dissolve |
| Business Change | Pod type no longer needed | Close gracefully, redeploy talent |
| Voluntary Dissolution | Team requested split | Honor request, support transition |

---

### created_at
| Property | Value |
|----------|-------|
| Column Name | `created_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Description | Timestamp of pod creation |
| UI Display | Display only, formatted |
| Business Note | Different from `formed_date` (record creation vs operational start) |

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

---

### created_by
| Property | Value |
|----------|-------|
| Column Name | `created_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who created the pod |
| UI Display | Display only |
| Business Note | Typically HR Manager or COO |

---

## Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `pods_pkey` | `id` | BTREE | Primary key |
| `idx_pods_org_id` | `org_id` | BTREE | Tenant filtering |
| `idx_pods_type` | `pod_type` | BTREE | Type filtering |
| `idx_pods_senior_member` | `senior_member_id` | BTREE | Manager lookup |
| `idx_pods_junior_member` | `junior_member_id` | BTREE | IC lookup |
| `idx_pods_active` | `is_active` | BTREE | Active pods filter |
| `idx_pods_sprint_start` | `current_sprint_start_date` | BTREE | Sprint date queries |
| `idx_pods_name_search` | `name` | GIN (text_pattern_ops) | Name search |

---

## Composite Indexes (Performance Critical)

```sql
-- Active pods by type (leaderboard queries)
CREATE INDEX idx_pods_active_type_performance
  ON pods(org_id, pod_type, is_active, total_placements DESC)
  WHERE is_active = TRUE;

-- Sprint performance tracking
CREATE INDEX idx_pods_sprint_tracking
  ON pods(org_id, is_active, current_sprint_start_date, current_sprint_placements)
  WHERE is_active = TRUE;

-- Member assignment lookup
CREATE INDEX idx_pods_member_lookup
  ON pods(org_id, senior_member_id, junior_member_id)
  WHERE is_active = TRUE;
```

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;

-- Organization isolation
CREATE POLICY "pods_org_isolation" ON pods
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Pod members can view their pod
CREATE POLICY "pods_member_access" ON pods
  FOR SELECT
  USING (
    senior_member_id = (auth.jwt() ->> 'user_id')::uuid
    OR junior_member_id = (auth.jwt() ->> 'user_id')::uuid
  );

-- HR/Admin full access
CREATE POLICY "pods_hr_admin_access" ON pods
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (auth.jwt() ->> 'user_id')::uuid
      AND role IN ('admin', 'hr_manager', 'coo')
    )
  );
```

---

## Triggers

### Updated At Trigger
```sql
CREATE TRIGGER pods_updated_at
  BEFORE UPDATE ON pods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Set Formed Date on Create
```sql
CREATE OR REPLACE FUNCTION set_pod_formed_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.formed_date IS NULL THEN
    NEW.formed_date := CURRENT_DATE;
  END IF;

  IF NEW.current_sprint_start_date IS NULL THEN
    NEW.current_sprint_start_date := CURRENT_DATE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pods_set_formed_date
  BEFORE INSERT ON pods
  FOR EACH ROW
  EXECUTE FUNCTION set_pod_formed_date();
```

### Set Dissolved Date on Deactivation
```sql
CREATE OR REPLACE FUNCTION set_pod_dissolved_date()
RETURNS TRIGGER AS $$
BEGIN
  -- When pod is deactivated, set dissolved_date
  IF OLD.is_active = TRUE AND NEW.is_active = FALSE AND NEW.dissolved_date IS NULL THEN
    NEW.dissolved_date := CURRENT_DATE;
  END IF;

  -- When pod is reactivated, clear dissolved_date
  IF OLD.is_active = FALSE AND NEW.is_active = TRUE THEN
    NEW.dissolved_date := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pods_set_dissolved_date
  BEFORE UPDATE OF is_active ON pods
  FOR EACH ROW
  EXECUTE FUNCTION set_pod_dissolved_date();
```

### Update Employee Metadata on Member Assignment
```sql
CREATE OR REPLACE FUNCTION update_pod_member_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update senior member metadata
  IF NEW.senior_member_id IS NOT NULL AND (OLD.senior_member_id IS NULL OR NEW.senior_member_id != OLD.senior_member_id) THEN
    INSERT INTO employee_metadata (user_id, pod_id, pod_role)
    VALUES (NEW.senior_member_id, NEW.id, 'senior')
    ON CONFLICT (user_id)
    DO UPDATE SET pod_id = NEW.id, pod_role = 'senior';
  END IF;

  -- Update junior member metadata
  IF NEW.junior_member_id IS NOT NULL AND (OLD.junior_member_id IS NULL OR NEW.junior_member_id != OLD.junior_member_id) THEN
    INSERT INTO employee_metadata (user_id, pod_id, pod_role)
    VALUES (NEW.junior_member_id, NEW.id, 'junior')
    ON CONFLICT (user_id)
    DO UPDATE SET pod_id = NEW.id, pod_role = 'junior';
  END IF;

  -- Clear old senior member if changed
  IF OLD.senior_member_id IS NOT NULL AND (NEW.senior_member_id IS NULL OR NEW.senior_member_id != OLD.senior_member_id) THEN
    UPDATE employee_metadata
    SET pod_id = NULL, pod_role = NULL
    WHERE user_id = OLD.senior_member_id;
  END IF;

  -- Clear old junior member if changed
  IF OLD.junior_member_id IS NOT NULL AND (NEW.junior_member_id IS NULL OR NEW.junior_member_id != OLD.junior_member_id) THEN
    UPDATE employee_metadata
    SET pod_id = NULL, pod_role = NULL
    WHERE user_id = OLD.junior_member_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pods_update_member_metadata
  AFTER INSERT OR UPDATE OF senior_member_id, junior_member_id ON pods
  FOR EACH ROW
  EXECUTE FUNCTION update_pod_member_metadata();
```

---

## Related Tables

| Table | Relationship | FK Column | Purpose |
|-------|--------------|-----------|---------|
| organizations | Parent | `org_id` | Multi-tenancy |
| user_profiles | Senior Member | `senior_member_id` | Manager assignment |
| user_profiles | Junior Member | `junior_member_id` | IC assignment |
| user_profiles | Creator | `created_by` | Audit trail |
| employee_metadata | Children | `employee_metadata.pod_id` | Employee pod assignment |
| placements | Related | Via `employee_metadata` | **PERFORMANCE TRACKING** |

---

## Business Rules & Validations

### Pod Type Validation
```sql
ALTER TABLE pods ADD CONSTRAINT check_valid_pod_type
  CHECK (pod_type IN ('recruiting', 'bench_sales', 'ta'));
```

### Sprint Duration Validation
```sql
ALTER TABLE pods ADD CONSTRAINT check_sprint_duration_range
  CHECK (sprint_duration_weeks >= 1 AND sprint_duration_weeks <= 4);
```

### Target Validation
```sql
ALTER TABLE pods ADD CONSTRAINT check_positive_target
  CHECK (placements_per_sprint_target >= 1 AND placements_per_sprint_target <= 10);
```

### Performance Metrics Validation
```sql
ALTER TABLE pods ADD CONSTRAINT check_non_negative_placements
  CHECK (
    total_placements >= 0 AND
    current_sprint_placements >= 0 AND
    (average_placements_per_sprint IS NULL OR average_placements_per_sprint >= 0)
  );
```

### Date Validation
```sql
ALTER TABLE pods ADD CONSTRAINT check_dissolved_after_formed
  CHECK (dissolved_date IS NULL OR dissolved_date >= formed_date);
```

### Member Uniqueness (Prevent Same Person in Multiple Pods)
```sql
-- Unique index ensures a user can only be senior member of one active pod
CREATE UNIQUE INDEX idx_pods_unique_senior_active
  ON pods(senior_member_id)
  WHERE is_active = TRUE AND senior_member_id IS NOT NULL;

-- Unique index ensures a user can only be junior member of one active pod
CREATE UNIQUE INDEX idx_pods_unique_junior_active
  ON pods(junior_member_id)
  WHERE is_active = TRUE AND junior_member_id IS NOT NULL;
```

---

## Performance Metrics & Calculations

### Key Performance Indicators (KPIs)

#### Pod-Level Metrics
```sql
-- Pod Performance Summary
SELECT
  p.id,
  p.name,
  p.pod_type,
  p.total_placements,
  p.current_sprint_placements,
  p.placements_per_sprint_target,
  p.average_placements_per_sprint,

  -- Sprint Progress
  ROUND(
    (p.current_sprint_placements::numeric / NULLIF(p.placements_per_sprint_target, 0)) * 100,
    2
  ) as sprint_progress_pct,

  -- Performance Status
  CASE
    WHEN p.current_sprint_placements >= p.placements_per_sprint_target THEN 'On Target'
    WHEN p.current_sprint_placements >= p.placements_per_sprint_target * 0.75 THEN 'Nearly There'
    WHEN p.current_sprint_placements >= p.placements_per_sprint_target * 0.5 THEN 'Behind'
    ELSE 'Critical'
  END as status,

  -- Trend
  CASE
    WHEN p.current_sprint_placements > COALESCE(p.average_placements_per_sprint, 0) THEN 'up'
    WHEN p.current_sprint_placements < COALESCE(p.average_placements_per_sprint, 0) THEN 'down'
    ELSE 'flat'
  END as trend,

  -- Sprint Days Remaining
  (p.current_sprint_start_date + (p.sprint_duration_weeks || ' weeks')::interval)::date - CURRENT_DATE as days_remaining

FROM pods p
WHERE p.is_active = TRUE
ORDER BY sprint_progress_pct DESC;
```

#### Leaderboard Queries

**Pod Leaderboard (Current Sprint):**
```sql
SELECT
  p.id,
  p.name,
  p.pod_type,
  p.current_sprint_placements,
  p.placements_per_sprint_target,
  ROUND(
    (p.current_sprint_placements::numeric / NULLIF(p.placements_per_sprint_target, 0)) * 100,
    2
  ) as achievement_pct,

  -- Members
  sm.full_name as manager_name,
  jm.full_name as ic_name,

  -- Rank
  ROW_NUMBER() OVER (
    PARTITION BY p.pod_type
    ORDER BY p.current_sprint_placements DESC, p.name
  ) as rank_in_type,

  ROW_NUMBER() OVER (
    ORDER BY p.current_sprint_placements DESC, p.name
  ) as overall_rank

FROM pods p
LEFT JOIN user_profiles sm ON sm.id = p.senior_member_id
LEFT JOIN user_profiles jm ON jm.id = p.junior_member_id
WHERE p.is_active = TRUE
  AND p.org_id = :org_id
ORDER BY p.current_sprint_placements DESC;
```

**Pod Leaderboard (All-Time):**
```sql
SELECT
  p.id,
  p.name,
  p.pod_type,
  p.total_placements,
  p.average_placements_per_sprint,

  -- Pod Age
  EXTRACT(MONTH FROM AGE(CURRENT_DATE, p.formed_date)) as age_months,

  -- Placements per Month Rate
  ROUND(
    p.total_placements::numeric / NULLIF(EXTRACT(MONTH FROM AGE(CURRENT_DATE, p.formed_date)), 0),
    2
  ) as placements_per_month,

  -- Consistency Score (how often hit target)
  ROUND(
    CASE
      WHEN p.average_placements_per_sprint >= p.placements_per_sprint_target THEN 100.0
      ELSE (p.average_placements_per_sprint / NULLIF(p.placements_per_sprint_target, 0)) * 100
    END,
    2
  ) as consistency_score,

  -- Rank
  ROW_NUMBER() OVER (
    PARTITION BY p.pod_type
    ORDER BY p.total_placements DESC
  ) as rank_in_type

FROM pods p
WHERE p.is_active = TRUE
  AND p.org_id = :org_id
ORDER BY p.total_placements DESC;
```

#### Organization-Level Metrics
```sql
-- Org-Wide Pod Performance
SELECT
  org_id,

  -- Pod Counts
  COUNT(*) FILTER (WHERE is_active = TRUE) as active_pods,
  COUNT(*) FILTER (WHERE is_active = FALSE) as inactive_pods,

  -- By Type
  COUNT(*) FILTER (WHERE pod_type = 'recruiting' AND is_active = TRUE) as recruiting_pods,
  COUNT(*) FILTER (WHERE pod_type = 'bench_sales' AND is_active = TRUE) as bench_sales_pods,
  COUNT(*) FILTER (WHERE pod_type = 'ta' AND is_active = TRUE) as ta_pods,

  -- Performance
  SUM(total_placements) as org_total_placements,
  SUM(current_sprint_placements) as org_current_sprint_placements,
  AVG(average_placements_per_sprint) as org_avg_placements_per_sprint,

  -- Targets
  SUM(placements_per_sprint_target) as org_total_sprint_target,
  ROUND(
    (SUM(current_sprint_placements)::numeric / NULLIF(SUM(placements_per_sprint_target), 0)) * 100,
    2
  ) as org_sprint_achievement_pct,

  -- On-Target Pods
  COUNT(*) FILTER (
    WHERE is_active = TRUE
    AND current_sprint_placements >= placements_per_sprint_target
  ) as pods_on_target,

  ROUND(
    COUNT(*) FILTER (
      WHERE is_active = TRUE
      AND current_sprint_placements >= placements_per_sprint_target
    )::numeric / NULLIF(COUNT(*) FILTER (WHERE is_active = TRUE), 0) * 100,
    2
  ) as pct_pods_on_target

FROM pods
WHERE org_id = :org_id
GROUP BY org_id;
```

---

## Sprint Management

### Sprint Lifecycle

**Sprint States:**
```
┌──────────────────────────────────────────────────────────────┐
│                     Sprint Lifecycle                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. PLANNING                                                  │
│     ├─ Review previous sprint                                 │
│     ├─ Set goals for new sprint                              │
│     └─ Assign initial accounts/jobs                          │
│                                                               │
│  2. EXECUTION (Week 1)                                        │
│     ├─ Daily standup check-ins                               │
│     ├─ Progress tracking                                      │
│     └─ Mid-week pulse check                                  │
│                                                               │
│  3. EXECUTION (Week 2)                                        │
│     ├─ Sprint progress review                                │
│     ├─ Final push                                             │
│     └─ Close pending placements                              │
│                                                               │
│  4. REVIEW                                                    │
│     ├─ Sprint results analysis                               │
│     ├─ Team retrospective                                    │
│     └─ Celebrate wins                                         │
│                                                               │
│  5. RESET                                                     │
│     ├─ Update average_placements_per_sprint                  │
│     ├─ Reset current_sprint_placements to 0                  │
│     ├─ Set new current_sprint_start_date                     │
│     └─ Begin next sprint                                      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Manual Sprint Reset (Server Action)
```sql
CREATE OR REPLACE FUNCTION reset_pod_sprint(pod_id_param UUID)
RETURNS void AS $$
DECLARE
  pod_record RECORD;
  sprints_completed INTEGER;
  new_average NUMERIC(5,2);
BEGIN
  -- Get current pod data
  SELECT * INTO pod_record
  FROM pods
  WHERE id = pod_id_param;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pod not found';
  END IF;

  -- Calculate sprints completed
  sprints_completed := GREATEST(1,
    FLOOR(pod_record.total_placements::numeric / NULLIF(pod_record.placements_per_sprint_target, 0))
  );

  -- Calculate new average
  new_average := (
    (COALESCE(pod_record.average_placements_per_sprint, 0) * (sprints_completed - 1)) +
    pod_record.current_sprint_placements
  ) / sprints_completed;

  -- Reset sprint
  UPDATE pods
  SET
    current_sprint_placements = 0,
    current_sprint_start_date = CURRENT_DATE,
    average_placements_per_sprint = ROUND(new_average, 2)
  WHERE id = pod_id_param;

  -- Log event
  INSERT INTO audit_logs (
    table_name, action, record_id,
    old_values, new_values, severity, org_id
  )
  VALUES (
    'pods', 'reset_sprint', pod_id_param,
    jsonb_build_object('current_sprint_placements', pod_record.current_sprint_placements),
    jsonb_build_object('current_sprint_placements', 0, 'new_average', new_average),
    'info', pod_record.org_id
  );
END;
$$ LANGUAGE plpgsql;
```

### Automated Sprint Reset (Daily Cron)
```sql
-- Runs daily at midnight to check for completed sprints
CREATE OR REPLACE FUNCTION auto_reset_completed_sprints()
RETURNS TABLE(
  pod_id UUID,
  pod_name TEXT,
  old_sprint_placements INTEGER,
  new_average NUMERIC(5,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH updated_pods AS (
    UPDATE pods p
    SET
      average_placements_per_sprint = (
        COALESCE(p.average_placements_per_sprint, 0) + p.current_sprint_placements
      ) / 2,
      current_sprint_placements = 0,
      current_sprint_start_date = CURRENT_DATE
    WHERE
      p.is_active = TRUE
      AND p.current_sprint_start_date IS NOT NULL
      AND CURRENT_DATE >= p.current_sprint_start_date + (p.sprint_duration_weeks || ' weeks')::interval
    RETURNING
      p.id,
      p.name,
      p.current_sprint_placements as old_placements,
      p.average_placements_per_sprint as new_avg
  )
  SELECT * FROM updated_pods;
END;
$$ LANGUAGE plpgsql;

-- Schedule this function to run daily via pg_cron or application scheduler
```

---

## Pod Assignment for Recruiters

### Get Recruiter's Pod
```sql
CREATE OR REPLACE FUNCTION get_recruiter_pod(user_id_param UUID)
RETURNS TABLE(
  pod_id UUID,
  pod_name TEXT,
  pod_type TEXT,
  pod_role TEXT,
  manager_id UUID,
  manager_name TEXT,
  ic_id UUID,
  ic_name TEXT,
  sprint_target INTEGER,
  current_sprint_placements INTEGER,
  sprint_progress_pct NUMERIC(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as pod_id,
    p.name as pod_name,
    p.pod_type,
    em.pod_role,
    p.senior_member_id as manager_id,
    sm.full_name as manager_name,
    p.junior_member_id as ic_id,
    jm.full_name as ic_name,
    p.placements_per_sprint_target as sprint_target,
    p.current_sprint_placements,
    ROUND(
      (p.current_sprint_placements::numeric / NULLIF(p.placements_per_sprint_target, 0)) * 100,
      2
    ) as sprint_progress_pct
  FROM employee_metadata em
  INNER JOIN pods p ON p.id = em.pod_id
  LEFT JOIN user_profiles sm ON sm.id = p.senior_member_id
  LEFT JOIN user_profiles jm ON jm.id = p.junior_member_id
  WHERE em.user_id = user_id_param
    AND p.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;
```

### Assign Recruiter to Pod
```sql
CREATE OR REPLACE FUNCTION assign_user_to_pod(
  user_id_param UUID,
  pod_id_param UUID,
  role_param TEXT
)
RETURNS void AS $$
BEGIN
  -- Validate role
  IF role_param NOT IN ('senior', 'junior') THEN
    RAISE EXCEPTION 'Invalid pod role. Must be senior or junior.';
  END IF;

  -- Update pod based on role
  IF role_param = 'senior' THEN
    UPDATE pods
    SET senior_member_id = user_id_param
    WHERE id = pod_id_param;
  ELSE
    UPDATE pods
    SET junior_member_id = user_id_param
    WHERE id = pod_id_param;
  END IF;

  -- Update employee_metadata
  INSERT INTO employee_metadata (user_id, pod_id, pod_role)
  VALUES (user_id_param, pod_id_param, role_param)
  ON CONFLICT (user_id)
  DO UPDATE SET
    pod_id = pod_id_param,
    pod_role = role_param;
END;
$$ LANGUAGE plpgsql;
```

---

## Manager vs IC Responsibilities

### Manager (Senior Member) Responsibilities

**C - Consulted:**
| Scenario | Manager Role |
|----------|--------------|
| Complex Deal Negotiation | Provide pricing guidance, risk assessment |
| Difficult Client Situation | Offer escalation support, relationship management |
| Process Questions | Clarify company policies and best practices |
| Technical Challenges | Share expertise from past experience |

**I - Informed:**
| What | When | How |
|------|------|-----|
| Placement Wins | Immediately | Slack notification + weekly summary |
| Client Escalations | Real-time | Direct message or call |
| Pipeline Status | Weekly | Pod standup meeting |
| Performance Metrics | Sprint end | Sprint review dashboard |

**Manager Activities:**
- Weekly 1:1 with each pod member (30 min)
- Sprint planning session (1 hour every 2 weeks)
- Sprint retrospective (30 min every 2 weeks)
- Monthly performance review prep
- Blocker removal (ad-hoc, as needed)
- Cross-pod coordination meetings
- Manager leadership training

**Manager Success Metrics:**
- Pod placement rate (team performance)
- IC satisfaction score (team happiness)
- Blocker resolution time (efficiency)
- Sprint consistency (how often target hit)
- IC skill development (growth)

### IC (Junior Member) Responsibilities

**Full Lifecycle Ownership:**
```
┌─────────────────────────────────────────────────────────────┐
│              IC End-to-End Responsibilities                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ACCOUNT MANAGEMENT                                          │
│  ├─ Prospect new clients                                     │
│  ├─ Build relationships                                      │
│  ├─ Negotiate contracts                                      │
│  └─ Manage existing accounts                                │
│                                                              │
│  RECRUITING                                                  │
│  ├─ Source candidates                                        │
│  ├─ Screen and interview                                     │
│  ├─ Submit to jobs                                           │
│  └─ Manage interview process                                │
│                                                              │
│  DELIVERY MANAGEMENT                                         │
│  ├─ Onboard consultants                                      │
│  ├─ Monitor performance                                      │
│  ├─ Handle client satisfaction                              │
│  └─ Manage contract renewals                                │
│                                                              │
│  BUSINESS DEVELOPMENT                                        │
│  ├─ Identify opportunities                                   │
│  ├─ Create proposals                                         │
│  ├─ Close deals                                              │
│  └─ Expand accounts                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**IC Success Metrics:**
- Placements per sprint (primary KPI)
- Time-to-fill (efficiency)
- Candidate quality (performance ratings)
- Client satisfaction (NPS score)
- Deal close rate (sales effectiveness)

---

## Cross-Pod Collaboration Rules

### When ICs Collaborate Across Pods

**Allowed Collaboration:**
| Scenario | How It Works | Credit |
|----------|--------------|--------|
| Candidate Sharing | Pod A has candidate, Pod B has job | Split credit 50/50 |
| Client Referral | Pod A introduces Pod B to client | Referral bonus to Pod A |
| Knowledge Sharing | ICs share best practices | No credit, encouraged |
| Coverage | IC covers for another pod member | Thank you bonus |

**Collaboration Guidelines:**
- Always inform both pod managers
- Document collaboration in CRM
- Split credit fairly and transparently
- Celebrate cross-pod wins publicly

**Competition vs Collaboration:**
```
┌──────────────────────────────────────────────────────────────┐
│                    Healthy Competition                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  COMPETE ON:                                                  │
│  ✓ Placement numbers                                         │
│  ✓ Sprint targets                                             │
│  ✓ Leaderboard rankings                                      │
│  ✓ Quarterly awards                                           │
│                                                               │
│  COLLABORATE ON:                                              │
│  ✓ Best practices                                             │
│  ✓ Candidate pools                                            │
│  ✓ Client expansion                                           │
│  ✓ Process improvements                                       │
│  ✓ Training and development                                  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Leaderboard Display Examples

### Sprint Leaderboard UI
```
┌─────────────────────────────────────────────────────────────────┐
│                    Recruiting Pods - Current Sprint             │
│                     Week of Nov 18 - Dec 1, 2025                │
├────┬─────────────────┬───────────┬────────┬──────────┬─────────┤
│Rank│ Pod Name        │ Manager   │ IC     │ Progress │ Status  │
├────┼─────────────────┼───────────┼────────┼──────────┼─────────┤
│ 🥇 │ Alpha Squad     │ John M.   │ Sarah  │ 3/2      │ 🟢 150% │
│ 🥈 │ Phoenix Team    │ Lisa K.   │ Mike   │ 2/2      │ 🟢 100% │
│ 🥉 │ Delta Force     │ Tom R.    │ Anna   │ 2/2      │ 🟢 100% │
│  4 │ Bravo Unit      │ Emma S.   │ Chris  │ 1/2      │ 🟡 50%  │
│  5 │ Echo Group      │ David L.  │ Kelly  │ 1/2      │ 🟡 50%  │
│  6 │ Gamma Pod       │ Rachel W. │ Josh   │ 0/2      │ 🔴 0%   │
└────┴─────────────────┴───────────┴────────┴──────────┴─────────┘

📊 Org Total: 9/12 placements (75% of target)
🎯 Pods on Target: 3/6 (50%)
```

### All-Time Leaderboard UI
```
┌─────────────────────────────────────────────────────────────────┐
│              All Pods - Lifetime Performance                     │
├────┬─────────────────┬─────────┬────────────┬──────────┬────────┤
│Rank│ Pod Name        │ Type    │ Total      │ Avg/     │ Age    │
│    │                 │         │ Placements │ Sprint   │        │
├────┼─────────────────┼─────────┼────────────┼──────────┼────────┤
│  1 │ Alpha Squad     │ Recruit │    47      │  2.3     │ 10mo  │
│  2 │ Phoenix Team    │ Recruit │    42      │  2.1     │ 12mo  │
│  3 │ Sales Tigers    │ Bench   │    38      │  1.9     │ 11mo  │
│  4 │ TA Ninjas       │ TA      │    35      │  2.0     │  9mo  │
│  5 │ Delta Force     │ Recruit │    31      │  1.8     │  8mo  │
└────┴─────────────────┴─────────┴────────────┴──────────┴────────┘
```

---

## Data Integrity Checks

### Pods Without Members
```sql
-- Pods missing manager or IC
SELECT
  p.id,
  p.name,
  p.pod_type,
  p.is_active,
  CASE
    WHEN p.senior_member_id IS NULL THEN 'Missing Manager'
    WHEN p.junior_member_id IS NULL THEN 'Missing IC'
    ELSE 'Fully Staffed'
  END as staffing_status,
  p.formed_date,
  EXTRACT(MONTH FROM AGE(CURRENT_DATE, p.formed_date)) as months_active
FROM pods p
WHERE p.is_active = TRUE
  AND (p.senior_member_id IS NULL OR p.junior_member_id IS NULL)
ORDER BY p.formed_date;
```

### Sprint Data Anomalies
```sql
-- Pods with suspicious sprint data
SELECT
  p.id,
  p.name,
  p.current_sprint_placements,
  p.placements_per_sprint_target,
  p.current_sprint_start_date,
  CURRENT_DATE - p.current_sprint_start_date as days_since_sprint_start,
  CASE
    WHEN p.current_sprint_start_date IS NULL THEN 'No sprint start date'
    WHEN CURRENT_DATE - p.current_sprint_start_date > (p.sprint_duration_weeks * 7 + 7) THEN 'Sprint overdue for reset'
    WHEN p.current_sprint_placements > p.placements_per_sprint_target * 3 THEN 'Unusually high placements'
    WHEN p.current_sprint_placements < 0 THEN 'Negative placements'
    ELSE 'OK'
  END as issue
FROM pods p
WHERE p.is_active = TRUE
  AND (
    p.current_sprint_start_date IS NULL
    OR CURRENT_DATE - p.current_sprint_start_date > (p.sprint_duration_weeks * 7 + 7)
    OR p.current_sprint_placements > p.placements_per_sprint_target * 3
    OR p.current_sprint_placements < 0
  );
```

### Member Assignment Conflicts
```sql
-- Users assigned to multiple active pods
SELECT
  up.id,
  up.full_name,
  up.email,
  array_agg(DISTINCT p.id) as pod_ids,
  array_agg(DISTINCT p.name) as pod_names,
  COUNT(DISTINCT p.id) as pod_count
FROM user_profiles up
INNER JOIN employee_metadata em ON em.user_id = up.id
INNER JOIN pods p ON p.id = em.pod_id
WHERE p.is_active = TRUE
GROUP BY up.id, up.full_name, up.email
HAVING COUNT(DISTINCT p.id) > 1;
```

---

## Performance Optimization

### Query Performance Tips

**For Leaderboards:**
- Use composite index `idx_pods_active_type_performance`
- Filter `is_active = TRUE` first
- Limit results with `LIMIT` clause
- Cache results for 5-15 minutes

**For Sprint Tracking:**
- Use composite index `idx_pods_sprint_tracking`
- Pre-calculate sprint end dates in application
- Batch update sprint resets (don't reset one by one)

**For Member Lookups:**
- Use composite index `idx_pods_member_lookup`
- Join with `employee_metadata` for full profile
- Cache user's pod assignment in session

### Materialized View for Leaderboards
```sql
CREATE MATERIALIZED VIEW pod_leaderboard AS
SELECT
  p.id,
  p.name,
  p.pod_type,
  p.org_id,
  p.current_sprint_placements,
  p.placements_per_sprint_target,
  p.total_placements,
  p.average_placements_per_sprint,
  ROUND(
    (p.current_sprint_placements::numeric / NULLIF(p.placements_per_sprint_target, 0)) * 100,
    2
  ) as sprint_progress_pct,
  sm.full_name as manager_name,
  jm.full_name as ic_name,
  ROW_NUMBER() OVER (
    PARTITION BY p.org_id, p.pod_type
    ORDER BY p.current_sprint_placements DESC, p.name
  ) as rank_in_type,
  ROW_NUMBER() OVER (
    PARTITION BY p.org_id
    ORDER BY p.current_sprint_placements DESC, p.name
  ) as overall_rank
FROM pods p
LEFT JOIN user_profiles sm ON sm.id = p.senior_member_id
LEFT JOIN user_profiles jm ON jm.id = p.junior_member_id
WHERE p.is_active = TRUE;

-- Refresh every 15 minutes
CREATE INDEX idx_pod_leaderboard_org_type ON pod_leaderboard(org_id, pod_type);
CREATE INDEX idx_pod_leaderboard_rank ON pod_leaderboard(overall_rank);

-- Refresh materialized view (run via cron or application scheduler)
REFRESH MATERIALIZED VIEW CONCURRENTLY pod_leaderboard;
```

---

*Last Updated: 2025-11-30*
*Version: 1.0*
*Business Criticality: HIGH*
*Performance Impact: CORE*
