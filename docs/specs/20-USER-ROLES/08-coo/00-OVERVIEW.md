# COO (Chief Operating Officer) - Complete Role Specification

**Version:** 1.0
**Last Updated:** 2025-11-30
**Owner:** Executive Team
**Status:** Active

---

## Table of Contents

1. [Role Overview](#1-role-overview)
2. [Key Responsibilities](#2-key-responsibilities)
3. [INFORMED Notification System](#3-informed-notification-system)
4. [Primary Metrics (KPIs)](#4-primary-metrics-kpis)
5. [Daily Workflow](#5-daily-workflow)
6. [Permissions Matrix](#6-permissions-matrix)
7. [RACI Assignments](#7-raci-assignments)
8. [Navigation & Access](#8-navigation--access)
9. [Use Cases](#9-use-cases)
10. [Integration Points](#10-integration-points)
11. [Distinction from Other Roles](#11-distinction-from-other-roles)
12. [Success Criteria](#12-success-criteria)

---

## 1. Role Overview

The **Chief Operating Officer (COO)** is responsible for day-to-day operational management, cross-functional coordination, process optimization, and operational excellence across all business pillars (Recruiting, Bench Sales, TA, Academy, CRM). The COO ensures efficient execution of strategic plans, maintains operational quality, drives continuous improvement, and serves as the primary escalation point for operational issues.

**Critical Distinction:** The COO is **ALWAYS INFORMED (I)** on ALL object changes across the organization. This notification architecture ensures the COO has complete operational visibility and can intervene proactively when issues arise.

| Property | Value |
|----------|-------|
| Role ID | `coo` |
| Role Type | Executive |
| Reports To | CEO |
| Direct Reports | Regional Directors, Pod Managers (dotted line), HR Manager (dotted line) |
| Primary Entities | All operational entities (Jobs, Candidates, Submissions, Placements, Accounts) |
| RACI Default | **Informed (I) on ALL changes**, Accountable (A) for operational processes |
| Key Focus | Operational excellence, efficiency, quality, scalability |
| Time Horizon | Daily to Quarterly execution |

---

## 2. Key Responsibilities

### 2.1 Operational Management
- **Day-to-day operations:** Oversee all operational activities across Recruiting, Bench Sales, TA, and Academy
- **Cross-functional coordination:** Ensure alignment between pods, pillars, and regions
- **Escalation management:** Primary point for operational escalations from Pod Managers and Regional Directors
- **Resource allocation:** Balance workload and capacity across teams
- **Performance monitoring:** Track operational KPIs in real-time and intervene when off-track

### 2.2 Process Optimization
- **Process design and improvement:** Identify bottlenecks and optimize workflows
- **Automation initiatives:** Drive technology adoption to increase efficiency
- **Best practice sharing:** Ensure successful practices spread across teams
- **SLA management:** Define, monitor, and enforce service level agreements
- **Quality assurance:** Maintain quality standards across all operations

### 2.3 Team Performance Management
- **Pod performance tracking:** Monitor pod-level metrics (efficiency, quality, output)
- **Performance coaching:** Work with Pod Managers and Regional Directors to improve team performance
- **Capacity planning:** Forecast staffing needs and manage team expansion
- **Skill development:** Identify training needs and coordinate with HR/Academy
- **Recognition and rewards:** Implement performance-based recognition programs

### 2.4 Strategic Execution
- **OKR ownership:** Own operational OKRs and drive execution
- **Strategic initiative support:** Ensure operational readiness for strategic initiatives (e.g., Canada expansion, AI Twin rollout)
- **Scalability planning:** Build processes and systems that scale with growth
- **Technology enablement:** Partner with CTO to implement operational technologies
- **Change management:** Lead organizational change initiatives

### 2.5 Operational Visibility & Intelligence
- **Real-time monitoring:** Continuously monitor operational dashboards for anomalies
- **Trend analysis:** Identify patterns and trends in operational data
- **Predictive intervention:** Anticipate issues before they become critical
- **Data-driven decision making:** Use analytics to drive operational decisions
- **Executive reporting:** Provide operational insights to CEO and Board

---

## 3. INFORMED Notification System

### 3.1 Core Principle

The COO is **ALWAYS INFORMED (I)** on all object changes. This is a fundamental business rule encoded in the RACI model:

```
Business Rule: COO-INFORMED-001

For EVERY entity change event (create, update, status change, assignment):
- System MUST send notification to COO
- Notification MUST be real-time (< 30 seconds)
- Notification MUST include entity type, ID, change summary, actor
- COO can configure notification aggregation (immediate, hourly digest, daily digest)
- COO can filter notifications by severity, entity type, or pillar
```

### 3.2 Notification Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      COO NOTIFICATION FEED                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ All Changes (Last 24 Hours): 247 notifications                     │
│                                                                      │
│ Filter: [All ▼] [Severity ▼] [Pillar ▼] [Search...]                │
│                                                                      │
│ 🔴 CRITICAL (3 notifications)                                       │
│ ├─ 2m ago  - SLA BREACH: Job#4523 - No activity 7 days             │
│ │            Job: "Sr Java Dev" @ Google                            │
│ │            Owner: Sarah Chen (Tech Recruiter)                     │
│ │            [View Job] [Escalate] [Assign]                         │
│ │                                                                    │
│ ├─ 8m ago  - PLACEMENT FAILED: Candidate no-show on Day 1          │
│ │            Placement: John Smith @ Meta ($95/hr)                  │
│ │            Recruiter: Mike Torres                                 │
│ │            [View Details] [Contact Recruiter] [Client Follow-up]  │
│ │                                                                    │
│ └─ 15m ago - CLIENT COMPLAINT: Invoice dispute $15K                 │
│              Account: Acme Corp                                      │
│              Issue: Billing rate discrepancy                         │
│              [View Invoice] [Contact Finance] [Resolve]              │
│                                                                      │
│ 🟡 HIGH (18 notifications)                                          │
│ ├─ 5m ago  - SUBMISSION CREATED: Jane Doe → Google Job#4521        │
│ │            Recruiter: Sarah Chen                                   │
│ │            Bill Rate: $95/hr | Pay Rate: $72/hr | Margin: 24%    │
│ │            [View Submission]                                       │
│ │                                                                    │
│ ├─ 12m ago - JOB CREATED: "DevOps Engineer" by Emily Rodriguez     │
│ │            Account: Amazon | Priority: High | TTF Target: 21 days │
│ │            [View Job]                                              │
│ │                                                                    │
│ └─ ... (16 more)                                                     │
│                                                                      │
│ 🟢 NORMAL (226 notifications)                                       │
│ ├─ 3m ago  - CANDIDATE UPDATED: Profile updated for Alex Johnson   │
│ ├─ 7m ago  - INTERVIEW SCHEDULED: Jane Doe with Google (Dec 5)     │
│ ├─ 10m ago - PLACEMENT STARTED: Tom Wilson @ Apple ($85/hr)        │
│ └─ ... (223 more)                                                    │
│                                                                      │
│ [Mark All Read] [Export] [Notification Settings]                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 Notification Categories

| Event Type | Severity | Notification Frequency | Action Required |
|------------|----------|------------------------|-----------------|
| **SLA Breach** | Critical | Immediate | Yes - Escalate or reassign |
| **Quality Issue** | Critical | Immediate | Yes - Investigate and resolve |
| **Placement Failure** | Critical | Immediate | Yes - Client recovery plan |
| **Client Complaint** | High | Immediate | Yes - Prioritize resolution |
| **Job Created** | Normal | Hourly digest (default) | No - Awareness only |
| **Candidate Submitted** | Normal | Hourly digest | No - Monitor pipeline |
| **Interview Scheduled** | Normal | Daily digest | No - Track progress |
| **Placement Started** | High | Immediate | No - Celebrate success |
| **Profile Updated** | Low | Daily digest | No - Awareness only |

### 3.4 Notification Configuration

COO can customize notification preferences:

```
┌─────────────────────────────────────────────────────────────────────┐
│ COO Notification Preferences                                  [Save]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Delivery Method:                                                    │
│ ☑ Real-time dashboard feed (always on)                              │
│ ☑ Email digest                                                       │
│ ☑ Mobile push notifications (critical only)                         │
│ ☐ SMS alerts (critical only)                                        │
│                                                                      │
│ Email Digest Schedule:                                              │
│ ○ Immediate (every notification)                                    │
│ ● Hourly digest (0-59 notifications per hour)                       │
│ ○ Daily digest (7 AM summary)                                       │
│                                                                      │
│ Filter Rules:                                                        │
│ Notify immediately for:                                              │
│ ☑ Critical severity (SLA breaches, quality issues, escalations)     │
│ ☑ High-value accounts (> $1M annual revenue)                        │
│ ☑ High-priority jobs (Priority: Critical or High)                   │
│ ☑ New placements (all)                                               │
│ ☐ All job creations                                                 │
│ ☐ All candidate submissions                                         │
│                                                                      │
│ Quiet Hours:                                                         │
│ ☑ Enable quiet hours (no notifications except critical)             │
│   Mon-Fri: 8 PM - 7 AM                                              │
│   Sat-Sun: All day (critical only)                                  │
│                                                                      │
│ [Save Preferences]  [Reset to Defaults]                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.5 Notification Workflow

```
Entity Change Event (e.g., Job Created)
         │
         ▼
┌────────────────────────┐
│ RACI Rule Engine       │
│ Determines: COO = I    │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Notification Builder   │
│ - Entity details       │
│ - Change summary       │
│ - Actor information    │
│ - Suggested actions    │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Severity Classifier    │
│ Critical / High / Normal│
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ COO Preference Engine  │
│ - Check delivery prefs │
│ - Apply filters        │
│ - Check quiet hours    │
└────────────────────────┘
         │
         ├─────────────────┬─────────────────┬─────────────────┐
         ▼                 ▼                 ▼                 ▼
   Dashboard Feed    Email Digest    Mobile Push         SMS
   (always)          (if enabled)    (if critical)   (if critical)
```

### 3.6 Notification Data Model

```typescript
interface COONotification {
  id: string;
  timestamp: Date;

  // Entity information
  entityType: 'job' | 'candidate' | 'submission' | 'placement' | 'account' | 'lead' | 'deal';
  entityId: string;
  entityTitle: string; // e.g., "Sr Java Developer @ Google"

  // Change details
  eventType: 'created' | 'updated' | 'status_changed' | 'assigned' | 'deleted';
  changeDescription: string; // Human-readable summary
  changedFields?: string[]; // List of fields that changed
  beforeValue?: any; // Previous value (for critical changes)
  afterValue?: any; // New value

  // Actor information
  actor: {
    id: string;
    name: string;
    role: string; // e.g., "Technical Recruiter"
  };

  // Severity and routing
  severity: 'critical' | 'high' | 'normal' | 'low';
  pillar: 'recruiting' | 'bench_sales' | 'ta' | 'academy' | 'crm';

  // Contextual data
  relatedEntities?: {
    account?: { id: string; name: string };
    job?: { id: string; title: string };
    candidate?: { id: string; name: string };
  };

  // Actions
  suggestedActions?: {
    label: string;
    action: string; // e.g., "view_job", "escalate", "reassign"
    url: string;
  }[];

  // Status
  read: boolean;
  archived: boolean;
  flagged: boolean;
}
```

---

## 4. Primary Metrics (KPIs)

The COO tracks and owns operational KPIs across all pillars:

| Metric | Target | Measurement Period | Dashboard |
|--------|--------|-------------------|-----------|
| **Operational Efficiency** | 85%+ | Daily | Real-time |
| Team Utilization | 82-90% | Weekly | Real-time |
| Avg Time-to-Fill (TTF) | ≤30 days | Weekly | Real-time |
| Placement Velocity | 8+ placements/day | Daily | Real-time |
| **SLA Compliance** | 95%+ | Daily | Real-time |
| On-Time Job Responses | 95%+ | Daily | Real-time |
| On-Time Submissions | 95%+ | Daily | Real-time |
| On-Time Placements | 95%+ | Daily | Real-time |
| **Quality Metrics** | | | |
| Client Satisfaction (NPS) | 70+ | Monthly | Monthly |
| Candidate Satisfaction | 80+ | Monthly | Monthly |
| Placement Retention (90-day) | 92%+ | Quarterly | Monthly |
| **Process Metrics** | | | |
| Process Adherence | 90%+ | Weekly | Weekly |
| SOP Compliance | 95%+ | Monthly | Monthly |
| Documentation Complete | 98%+ | Daily | Daily |
| **Productivity Metrics** | | | |
| Submittals per Recruiter | 15+/week | Weekly | Real-time |
| Interviews per Submission | 40%+ | Weekly | Real-time |
| Offer Rate | 50%+ of interviews | Weekly | Real-time |
| Acceptance Rate | 80%+ of offers | Weekly | Real-time |

---

## 5. Daily Workflow

### Morning (7:00 AM - 9:00 AM)

```
7:00 - Review overnight notifications (critical/high)
7:15 - Check operational dashboard for anomalies
7:30 - Review SLA compliance report
7:45 - Identify bottlenecks or at-risk items
8:00 - Morning standup with Regional Directors (15 min)
8:15 - Review escalations from previous day
8:30 - Operational metrics deep-dive
8:45 - Prepare for leadership meetings
```

### Mid-Morning (9:00 AM - 12:00 PM)

```
9:00  - Handle operational escalations
9:30  - Performance coaching sessions with Pod Managers
10:30 - Process improvement meetings
11:00 - Cross-functional coordination (with CFO, HR, etc.)
11:30 - Strategic project reviews (initiatives, OKRs)
```

### Afternoon (12:00 PM - 3:00 PM)

```
12:00 - Lunch / catch up on notifications
1:00  - Deep work: Process documentation, analysis
2:00  - Team performance reviews
2:30  - Technology/automation initiatives
```

### Late Afternoon (3:00 PM - 6:00 PM)

```
3:00  - Leadership team sync (CEO, CFO, COO, VPs)
4:00  - Ad-hoc escalations and fire-fighting
5:00  - End-of-day operational review
5:30  - Plan next day priorities
5:45  - Final notification review
```

### Weekly Rhythms

| Day | Focus |
|-----|-------|
| Monday | Week planning, performance reviews |
| Tuesday | Process optimization meetings |
| Wednesday | Regional Director 1:1s |
| Thursday | Strategic project reviews |
| Friday | Week-in-review, team recognition |

---

## 6. Permissions Matrix

### Entity Permissions

| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| Jobs | ✅ | ✅ All | ✅ All | ✅ Admin | Full operational control |
| Candidates | ✅ | ✅ All | ✅ All | ✅ Admin | Full operational control |
| Submissions | ✅ | ✅ All | ✅ All | ✅ Admin | Can override, reassign |
| Placements | ✅ | ✅ All | ✅ All | ✅ Admin | Operational oversight |
| Accounts | ✅ | ✅ All | ✅ All | ❌ | Cannot delete (finance impact) |
| Pods | ✅ | ✅ All | ✅ All | ✅ Admin | Organizational structure |
| Users | ❌ | ✅ All | ✅ Assignments | ❌ | HR owns user lifecycle |
| SLAs | ✅ | ✅ All | ✅ All | ✅ Own | Owns SLA definitions |
| Processes | ✅ | ✅ All | ✅ All | ✅ Own | Process ownership |

### Feature Permissions

| Feature | Access |
|---------|--------|
| COO Operations Dashboard | ✅ Full |
| Real-Time Notifications | ✅ Full (INFORMED on all) |
| SLA Management | ✅ Full (Define, Monitor, Enforce) |
| Process Management | ✅ Full (Design, Document, Improve) |
| Team Performance | ✅ Full (View all, coach, reassign) |
| Capacity Planning | ✅ Full |
| Quality Assurance | ✅ Full |
| Escalation Management | ✅ Full (Primary escalation point) |
| System Configuration | ✅ Operational settings |

---

## 7. RACI Assignments

### Typical COO RACI Patterns

| Event | COO | Pod Manager | Recruiter | CEO | CFO |
|-------|-----|-------------|-----------|-----|-----|
| Job Created | **I** (always) | C | R | - | - |
| Candidate Submitted | **I** | C | R | - | - |
| Placement Started | **I** | A | R | - | I |
| SLA Breach | **R/A** | C | I | I | - |
| Process Change | **R/A** | C | I | A | - |
| Escalation | **R/A** | C | I | I | - |
| Performance Issue | **R/A** | C | I | I | - |
| Capacity Planning | **R/A** | C | I | A | C |

**Key Pattern:** COO is **ALWAYS INFORMED (I)** on all entity changes, and **RESPONSIBLE/ACCOUNTABLE (R/A)** for operational processes and escalations.

---

## 8. Navigation & Access

### Sidebar Access

- ✅ **COO Operations Dashboard** (default home)
- ✅ **Real-Time Notifications** (INFORMED feed)
- ✅ SLA Management
- ✅ Process Management
- ✅ Team Performance
- ✅ Capacity Planning
- ✅ Quality Assurance
- ✅ Escalation Management
- ✅ All Jobs (full access)
- ✅ All Candidates (full access)
- ✅ All Submissions (full access)
- ✅ All Placements (full access)
- ✅ All Accounts (operational view)
- ✅ Pod Management
- ✅ Regional Views
- ✅ Reports & Analytics

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` | Open Command Bar |
| `g o` | Go to COO Dashboard |
| `g n` | Go to Notifications (INFORMED feed) |
| `g s` | Go to SLA Management |
| `g p` | Go to Processes |
| `g t` | Go to Team Performance |
| `e` | Escalate (context-aware) |
| `a` | Assign (context-aware) |
| `/` | Quick search |

---

## 9. Use Cases

The following use cases are documented in detail in separate files:

| Use Case | File | Priority |
|----------|------|----------|
| COO Daily Workflow | [01-daily-workflow.md](./01-daily-workflow.md) | High |
| Operational Dashboard | [10-operational-dashboard.md](./10-operational-dashboard.md) | Critical |
| SLA Management | [11-sla-management.md](./11-sla-management.md) | Critical |
| Process Optimization | [12-process-optimization.md](./12-process-optimization.md) | High |
| Escalation Management | [13-escalation-management.md](./13-escalation-management.md) | Critical |

---

## 10. Integration Points

### Notification System

**Purpose:** Real-time INFORMED notifications to COO

**Technology:** WebSocket (real-time) + Email (digest)

**Endpoints:**
- `ws://api/notifications/coo/stream` - Real-time notification stream
- `GET /api/notifications/coo` - Fetch notification history
- `POST /api/notifications/coo/preferences` - Update notification settings
- `PATCH /api/notifications/coo/{id}/read` - Mark notification as read

---

### Analytics Engine

**Purpose:** Operational KPI aggregation and dashboards

**Endpoints:**
- `GET /api/analytics/coo/kpis` - Current operational KPIs
- `GET /api/analytics/coo/sla-status` - Real-time SLA compliance
- `GET /api/analytics/coo/team-performance` - Pod/pillar performance
- `GET /api/analytics/coo/bottlenecks` - Process bottleneck analysis

---

## 11. Distinction from Other Roles

### COO vs. CEO

| Aspect | COO | CEO |
|--------|-----|-----|
| Focus | Execution (How) | Vision (Where) |
| Time Horizon | Daily to Quarterly | 3-5 years |
| Primary Stakeholder | Teams, Pods | Board, Investors |
| Key Metric | Efficiency, Quality | Market Share, Valuation |
| Decision Type | Tactical, Operational | Strategic |
| Notifications | INFORMED on ALL changes | High-level strategic alerts |

### COO vs. CFO

| Aspect | COO | CFO |
|--------|-----|-----|
| Focus | Operations | Finance |
| Primary Entities | Jobs, Candidates, Placements | Invoices, Commissions, Revenue |
| Key Metric | Efficiency, SLA | Margin, DSO, Revenue |
| Notifications | INFORMED on operational changes | Notified on financial events |
| Approval Role | Operational decisions | Financial approvals |

### COO vs. Regional Director

| Aspect | COO | Regional Director |
|--------|-----|----------------|
| Scope | Entire organization | Specific region |
| Reports To | CEO | COO |
| Focus | Cross-functional, strategic | Regional execution |
| RACI | I on all, R/A on processes | R on regional ops |
| Access | All entities, all regions | Region-specific |

---

## 12. Success Criteria

### Operational Excellence
- Operational efficiency: 85%+ sustained
- SLA compliance: 95%+ across all metrics
- Quality metrics: 90%+ client satisfaction
- Process adherence: 90%+ compliance

### Team Performance
- Team productivity: Top quartile vs industry
- Pod performance: 80%+ of pods "green" status
- Capacity utilization: 82-90% (optimal range)
- Employee satisfaction: 80%+ eNPS

### Scalability & Improvement
- Process automation: 20%+ efficiency gains annually
- Scalability: Systems support 2x growth without breaking
- Innovation: 3+ major process improvements per quarter
- Technology adoption: 90%+ adoption of new tools

### Executive Leadership
- CEO confidence: "COO has operations under control"
- Board feedback: Positive operational reports
- Cross-functional collaboration: Seamless coordination with CFO, HR, CTO
- Crisis management: Rapid resolution of operational crises

---

**End of COO Overview**

*This document provides the foundational understanding of the COO role in InTime OS, with emphasis on the INFORMED notification architecture that provides the COO with complete operational visibility.*
