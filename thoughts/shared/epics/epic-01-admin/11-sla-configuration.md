# User Story: SLA Configuration

**Epic:** Admin Portal (Epic-01)
**Story ID:** ADMIN-US-011
**Priority:** Medium
**Estimated Context:** ~30K tokens
**Source Spec:** `docs/specs/20-USER-ROLES/10-admin/12-sla-configuration.md`

---

## User Story

**As an** Admin user,
**I want** to define and monitor Service Level Agreements for various entity types,
**So that** I can ensure timely response and maintain quality standards.

---

## Acceptance Criteria

### AC-1: SLA Rule List
- [ ] Display all SLA rules
- [ ] Filter by entity type, status
- [ ] Show breach rate per rule
- [ ] Enable/disable rules

### AC-2: Create SLA Rule
- [ ] Select entity type (job, submission, etc.)
- [ ] Select metric to measure
- [ ] Set target time (hours/days)
- [ ] Configure warning threshold
- [ ] Configure breach threshold
- [ ] Set escalation actions

### AC-3: Escalation Levels
- [ ] Configure warning level (e.g., 80% of time)
- [ ] Configure breach level (100% of time)
- [ ] Configure critical level (e.g., 150%)
- [ ] Set notification recipients per level
- [ ] Set actions per level

### AC-4: SLA Monitoring Dashboard
- [ ] Display active SLAs with status
- [ ] Show items approaching breach
- [ ] Show breached items
- [ ] Show SLA compliance metrics

### AC-5: Business Hours
- [ ] Configure business hours per org
- [ ] Configure holidays
- [ ] SLA timers pause outside hours

### AC-6: Custom SLA Per Client
- [ ] Override org SLA for specific client
- [ ] Set client-specific targets
- [ ] Track per-client compliance

---

## UI/UX Requirements

### SLA Rule List
```
┌────────────────────────────────────────────────────────────────┐
│ SLA Configuration                                [+ New Rule]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ [Entity: All ▼] [Status: Active ▼] [🔍 Search...]             │
│                                                                │
│ ┌────────────────────┬──────────┬─────────┬─────────┬────────┐│
│ │ SLA Rule           │ Entity   │ Target  │ Complnce│ Status ││
│ ├────────────────────┼──────────┼─────────┼─────────┼────────┤│
│ │ First Submission   │ Job      │ 48h     │ 92%     │ Active ││
│ │ Interview Schedule │ Submis.  │ 24h     │ 87%     │ Active ││
│ │ Offer Response     │ Offer    │ 72h     │ 95%     │ Active ││
│ │ Client Response    │ Comm.    │ 4h      │ 78%     │ Active ││
│ │ Internal Task      │ Task     │ 8h      │ 91%     │ Active ││
│ └────────────────────┴──────────┴─────────┴─────────┴────────┘│
│                                                                │
│ BUSINESS HOURS                                    [Configure] │
│ Mon-Fri 9:00 AM - 6:00 PM EST | Holidays: 10 configured       │
└────────────────────────────────────────────────────────────────┘
```

### SLA Rule Editor
```
┌────────────────────────────────────────────────────────────────┐
│ SLA Rule - First Submission                              [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ BASIC INFO                                                     │
│ Name:        [First Submission SLA                       ]    │
│ Description: [Time to submit first candidate to new job  ]    │
│                                                                │
│ MEASUREMENT                                                    │
│ Entity Type: [Job                                        ▼]   │
│ Metric:      [Time from Created to First Submission      ▼]   │
│ Target:      [48] [Hours ▼]                                   │
│                                                                │
│ ESCALATION LEVELS                                              │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ 🟡 WARNING (80% = 38.4 hours)                             ││
│ │    Notify: [Recruiter (owner)                         ▼]  ││
│ │    Action: Send reminder email                             ││
│ ├────────────────────────────────────────────────────────────┤│
│ │ 🔴 BREACH (100% = 48 hours)                               ││
│ │    Notify: [Pod Manager                               ▼]  ││
│ │    Action: Send alert, Add to breach report                ││
│ ├────────────────────────────────────────────────────────────┤│
│ │ 🔴 CRITICAL (150% = 72 hours)                             ││
│ │    Notify: [Regional Director                         ▼]  ││
│ │    Action: Send escalation, Flag for review                ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ APPLIES TO                                                     │
│ ● All jobs                                                    │
│ ○ Jobs matching conditions:                                   │
│   [priority = "high"] [+ Add Condition]                       │
│                                                                │
│ ☑ Count only business hours                                   │
│                                                                │
│ [Cancel]                                    [Save] [Activate]  │
└────────────────────────────────────────────────────────────────┘
```

### SLA Monitoring Dashboard
```
┌────────────────────────────────────────────────────────────────┐
│ SLA Monitoring                                                 │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ COMPLIANCE OVERVIEW (Last 30 Days)                             │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│ │ Overall      │ On Track     │ At Risk      │ Breached     │ │
│ │ 89%          │ 156          │ 12           │ 8            │ │
│ │ compliance   │ items        │ items        │ items        │ │
│ └──────────────┴──────────────┴──────────────┴──────────────┘ │
│                                                                │
│ AT RISK (Approaching Breach)                        [View All]│
│ ┌────────────────────────────────────────────────────────────┐│
│ │ 🟡 JOB-1234 | First Submission | 42h of 48h | Owner: Sarah││
│ │    Remaining: 6 hours | [View Job] [Extend]               ││
│ ├────────────────────────────────────────────────────────────┤│
│ │ 🟡 SUB-5678 | Interview Sched. | 20h of 24h | Owner: John ││
│ │    Remaining: 4 hours | [View Submission] [Extend]        ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ RECENT BREACHES                                     [View All]│
│ ┌────────────────────────────────────────────────────────────┐│
│ │ 🔴 JOB-1200 | First Submission | 52h (4h over) | Mike     ││
│ │    Breached: Dec 3, 4:00 PM | [View Job] [Acknowledge]    ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ COMPLIANCE BY RULE                                             │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ First Submission:    ████████████████░░░░ 92%             ││
│ │ Interview Schedule:  ████████████████░░░░ 87%             ││
│ │ Offer Response:      ██████████████████░░ 95%             ││
│ │ Client Response:     ███████████████░░░░░ 78%             ││
│ └────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- SLA rules
CREATE TABLE sla_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  entity_type VARCHAR(50) NOT NULL, -- job, submission, interview, task
  metric VARCHAR(50) NOT NULL, -- time_to_first_submission, etc.
  target_hours DECIMAL(10,2) NOT NULL,
  warning_threshold DECIMAL(5,2) DEFAULT 0.80, -- 80%
  breach_threshold DECIMAL(5,2) DEFAULT 1.00, -- 100%
  critical_threshold DECIMAL(5,2) DEFAULT 1.50, -- 150%
  conditions JSONB, -- Optional conditions for applicability
  use_business_hours BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SLA escalation levels
CREATE TABLE sla_escalation_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sla_rule_id UUID NOT NULL REFERENCES sla_rules(id) ON DELETE CASCADE,
  level VARCHAR(20) NOT NULL, -- warning, breach, critical
  notify_role_id UUID REFERENCES roles(id),
  notify_user_id UUID REFERENCES user_profiles(id),
  notify_owner BOOLEAN DEFAULT false,
  actions JSONB, -- {sendEmail, sendSlack, addToReport, flagForReview}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SLA metrics (active tracking)
CREATE TABLE sla_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  sla_rule_id UUID NOT NULL REFERENCES sla_rules(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  owner_id UUID REFERENCES user_profiles(id),
  started_at TIMESTAMPTZ NOT NULL,
  target_at TIMESTAMPTZ NOT NULL, -- When SLA should be met
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active', -- active, met, breached, cancelled
  elapsed_hours DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SLA escalation history
CREATE TABLE sla_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sla_metric_id UUID NOT NULL REFERENCES sla_metrics(id) ON DELETE CASCADE,
  escalation_level_id UUID NOT NULL REFERENCES sla_escalation_levels(id),
  level VARCHAR(20) NOT NULL,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  notified_user_id UUID REFERENCES user_profiles(id),
  acknowledged_by UUID REFERENCES user_profiles(id),
  acknowledged_at TIMESTAMPTZ
);

-- Business hours
CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) UNIQUE,
  timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
  monday_start TIME,
  monday_end TIME,
  tuesday_start TIME,
  tuesday_end TIME,
  wednesday_start TIME,
  wednesday_end TIME,
  thursday_start TIME,
  thursday_end TIME,
  friday_start TIME,
  friday_end TIME,
  saturday_start TIME,
  saturday_end TIME,
  sunday_start TIME,
  sunday_end TIME,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Holidays
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, date)
);

-- Indexes
CREATE INDEX idx_sla_rules_org ON sla_rules(organization_id);
CREATE INDEX idx_sla_rules_entity ON sla_rules(entity_type);
CREATE INDEX idx_sla_metrics_org ON sla_metrics(organization_id);
CREATE INDEX idx_sla_metrics_entity ON sla_metrics(entity_type, entity_id);
CREATE INDEX idx_sla_metrics_status ON sla_metrics(status);
CREATE INDEX idx_sla_metrics_target ON sla_metrics(target_at);
```

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-SLA-001 | View SLA rules | Shows all rules with compliance |
| ADMIN-SLA-002 | Create SLA rule | Rule created with escalations |
| ADMIN-SLA-003 | Edit SLA rule | Rule updated |
| ADMIN-SLA-004 | Configure escalation | Escalation levels saved |
| ADMIN-SLA-005 | Warning triggered | Notification sent at 80% |
| ADMIN-SLA-006 | Breach triggered | Notification sent at 100% |
| ADMIN-SLA-007 | Critical triggered | Notification sent at 150% |
| ADMIN-SLA-008 | SLA met | Status = met, metrics recorded |
| ADMIN-SLA-009 | Business hours applied | Timer pauses outside hours |
| ADMIN-SLA-010 | Holiday applied | Timer pauses on holiday |
| ADMIN-SLA-011 | View monitoring dashboard | Shows compliance metrics |
| ADMIN-SLA-012 | View at-risk items | Shows items near breach |
| ADMIN-SLA-013 | Acknowledge breach | Breach acknowledged, logged |
| ADMIN-SLA-014 | Deactivate rule | Rule inactive, no new tracking |
| ADMIN-SLA-015 | Client-specific SLA | Override applied for client |

---

## Dependencies

- Entity event system (create triggers)
- Notification system
- Background job processor (timer checks)
- Business hours configuration

---

## Out of Scope

- Complex SLA calculations (multi-condition)
- SLA reporting/analytics dashboard
- SLA penalties/billing integration
