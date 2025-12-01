# UC-MGR-006: Pod Reassignment and Object Transfer

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** Pod Manager / Regional Director
**Status:** Canonical Reference

---

## 1. Overview

Pod reassignment involves transferring ICs, objects (jobs, candidates, submissions), or entire workflows between pods. This is a critical capability as business needs evolve, ICs develop new skills, or organizational structure changes. This document defines how objects and team members move between pods while preserving data integrity and RACI relationships.

**Key Principle:** "Follow the work" - Objects should be with the pod best positioned to deliver results.

---

## 2. Actors

- **Primary:** Pod Manager (initiates reassignment within pod), Regional Director (cross-pod reassignment)
- **Secondary:** IC (subject of reassignment), Receiving Pod Manager
- **Supporting:** COO (approves major restructuring), System (enforces RACI updates)
- **Informed:** All stakeholders on affected objects (via RACI)

---

## 3. Preconditions

- Source and destination pods exist and are active
- Requester has authority (Pod Manager for intra-pod, Regional Director for cross-pod)
- Reason for reassignment documented
- Affected IC notified (for IC transfers)
- Receiving pod has capacity

---

## 4. Reassignment Scenarios

### 4.1 When to Reassign

| Scenario | Trigger | Example | Decision Maker |
|----------|---------|---------|----------------|
| **IC Transfer** | IC promotion, skill development, pod rebalancing | Junior IC → Senior IC, move to new pod | Regional Director |
| **Client Handoff** | Account manager change, strategic focus | Client moved to dedicated account pod | Regional Director |
| **Geographic Realignment** | IC relocates, pod reorganization | NYC IC moves to LA, transfer to West Coast pod | Regional Director |
| **Workload Balancing** | Pod overloaded, uneven distribution | Pod A has 15 jobs, Pod B has 3 | Pod Managers + Regional Director |
| **Skill Specialization** | Vertical expertise needed | Healthcare jobs → Healthcare Pod | Pod Manager |
| **Performance Issues** | IC struggling, needs different environment | IC not thriving → Move to smaller pod | Regional Director + HR |
| **Strategic Account** | Client elevated to strategic status | Client signed $5M deal → Strategic Account Pod | Regional Director |
| **Pod Disbanding** | Pod sunset, merge, or closure | Sunset pod → Distribute ICs and work | Regional Director |

### 4.2 Reassignment Types

```
Reassignment Types:

1. IC TRANSFER (Person moves, objects may follow or stay)
   ┌─────────┐                    ┌─────────┐
   │  Pod A  │  ──── IC ────→     │  Pod B  │
   └─────────┘                    └─────────┘
   Objects: Stay OR Follow (configurable)

2. OBJECT TRANSFER (Work moves, people stay)
   ┌─────────┐                    ┌─────────┐
   │  Pod A  │  ── Job/Client →   │  Pod B  │
   └─────────┘                    └─────────┘
   IC: Stays in Pod A

3. POD MERGE (Two pods become one)
   ┌─────────┐
   │  Pod A  │ ────┐
   └─────────┘     │
                   ├─────→  ┌─────────┐
   ┌─────────┐     │        │ Pod A+B │
   │  Pod B  │ ────┘        └─────────┘
   └─────────┘
   All ICs + Objects combine

4. POD SPLIT (One pod becomes two)
   ┌─────────┐              ┌─────────┐
   │  Pod A  │ ────────→    │  Pod A  │
   └─────────┘         ↘    └─────────┘
                        ↘   ┌─────────┐
                         →  │  Pod B  │
                            └─────────┘
   Divide ICs + Objects
```

---

## 5. Main Flow: IC Transfer Between Pods

### 5.1 UC-MGR-006-F01: Transfer IC to Different Pod

**Trigger:** Regional Director or COO determines IC should move to different pod

**Steps:**

```
Step 1: Identify Transfer Need
┌───────────────────────────────────────────────────────────┐
│ Regional Director identifies reason for IC transfer       │
│ - Review IC performance in current pod                    │
│ - Assess receiving pod capacity and fit                   │
│ - Document business justification                         │
│ - Consult with both pod managers                          │
└───────────────────────────────────────────────────────────┘
                        ↓
Step 2: Determine Object Transfer Policy
┌───────────────────────────────────────────────────────────┐
│ Decide what happens to IC's current work                  │
│                                                            │
│ Options:                                                   │
│ A. TRANSFER ALL: IC takes all jobs/candidates to new pod  │
│ B. TRANSFER NONE: Objects stay in current pod             │
│ C. SELECTIVE: IC chooses which objects to take            │
│ D. STRATEGIC: Strategic objects follow, rest stay         │
│                                                            │
│ Default Policy: SELECTIVE (IC chooses)                    │
└───────────────────────────────────────────────────────────┘
                        ↓
Step 3: Notify Stakeholders
┌───────────────────────────────────────────────────────────┐
│ Regional Director notifies:                               │
│ - IC (primary stakeholder)                                │
│ - Current Pod Manager                                     │
│ - Receiving Pod Manager                                   │
│ - All RACI stakeholders on IC's objects                   │
│                                                            │
│ Notification includes:                                    │
│ - Transfer date (typically 2-4 weeks notice)              │
│ - Reason for transfer                                     │
│ - Object transfer policy                                  │
│ - Transition plan                                         │
└───────────────────────────────────────────────────────────┘
                        ↓
Step 4: Execute Transfer in System
┌───────────────────────────────────────────────────────────┐
│ Regional Director executes transfer via UI:               │
│ - Navigate to: /admin/users/{userId}/transfer-pod         │
│ - Select destination pod                                  │
│ - Choose object transfer policy                           │
│ - Set effective date                                      │
│ - Document reason                                         │
│ - Confirm transfer                                        │
└───────────────────────────────────────────────────────────┘
                        ↓
Step 5: System Updates (Automated)
┌───────────────────────────────────────────────────────────┐
│ System performs following updates:                        │
│ 1. Update user.pod_id → new pod                           │
│ 2. Update pod_members table                               │
│ 3. For each object (based on policy):                     │
│    - Update object.pod_id if transferring                 │
│    - Update RACI if needed                                │
│    - Notify Consulted (C) stakeholders                    │
│ 4. Update permissions (RLS policies)                      │
│ 5. Recalculate pod metrics                                │
│ 6. Create audit log entries                               │
│ 7. Send notifications to all stakeholders                 │
└───────────────────────────────────────────────────────────┘
                        ↓
Step 6: Transition Period
┌───────────────────────────────────────────────────────────┐
│ IC transitions between pods (1-4 weeks):                  │
│ - Attend both pod standups during transition              │
│ - Hand off non-transferred objects to pod                 │
│ - Onboard to new pod processes and tools                  │
│ - Meet new pod team members                               │
│ - Access new pod scope (clients, regions, etc.)           │
└───────────────────────────────────────────────────────────┘
                        ↓
Step 7: Complete Transfer
┌───────────────────────────────────────────────────────────┐
│ After transition period:                                  │
│ - Remove IC from old pod standups/meetings                │
│ - Remove access to old pod-specific resources             │
│ - Update IC's dashboard to show new pod metrics           │
│ - Conduct 30-day check-in with IC and new manager         │
│ - Close transfer ticket                                   │
└───────────────────────────────────────────────────────────┘
                        ↓
                  [Transfer Complete]
```

**Postconditions:**
- IC's pod_id updated in system
- Objects transferred or reassigned per policy
- RACI updated on all affected objects
- Both pod managers aware and tracking
- Audit trail complete

---

## 6. Main Flow: Object Transfer (Jobs, Candidates, Accounts)

### 6.1 UC-MGR-006-F02: Transfer Job Between Pods

**Trigger:** Pod Manager or Regional Director determines job should move to different pod

**Steps:**

```
Step 1: Identify Transfer Need
┌───────────────────────────────────────────────────────────┐
│ Determine why job should transfer:                        │
│ - Client moved to different pod (strategic account)       │
│ - Geographic realignment (job location changed)           │
│ - Vertical specialization (need domain expertise)         │
│ - Workload balancing (pod overloaded)                     │
│ - IC transferred and taking job with them                 │
└───────────────────────────────────────────────────────────┘
                        ↓
Step 2: Select Destination Pod
┌───────────────────────────────────────────────────────────┐
│ Regional Director selects receiving pod:                  │
│ - Review pod capacity and workload                        │
│ - Verify pod scope matches job (client, region, vertical) │
│ - Check pod has appropriate skills                        │
│ - Consult with receiving pod manager                      │
└───────────────────────────────────────────────────────────┘
                        ↓
Step 3: Transfer Job via UI
┌───────────────────────────────────────────────────────────┐
│ Transfer initiated by authorized user:                    │
│ - Navigate to job detail page                             │
│ - Click [Transfer to Different Pod]                       │
│ - Select destination pod                                  │
│ - Choose whether to transfer related objects:             │
│   ☑ Transfer submissions (recommended)                    │
│   ☑ Transfer interviews (recommended)                     │
│   ☐ Transfer candidates (optional - may stay global)      │
│ - Document reason for transfer                            │
│ - Confirm transfer                                        │
└───────────────────────────────────────────────────────────┘
                        ↓
Step 4: System Updates RACI
┌───────────────────────────────────────────────────────────┐
│ System automatically updates RACI:                        │
│ - Responsible (R): Assign to IC in new pod OR unassigned  │
│ - Accountable (A): Reassign to new pod manager            │
│ - Consulted (C): New pod manager (replace old)            │
│ - Informed (I): Preserve COO/Regional Director            │
│                                                            │
│ If job has active submissions:                            │
│ - Notify all candidates and clients                       │
│ - Update point of contact to new IC                       │
└───────────────────────────────────────────────────────────┘
                        ↓
Step 5: Handoff Process
┌───────────────────────────────────────────────────────────┐
│ Old IC hands off to new IC (if both exist):               │
│ - Schedule 30-min handoff call                            │
│ - Share job context: client needs, challenges             │
│ - Transfer candidate pipeline and notes                   │
│ - Introduce new IC to client (email/call)                 │
│ - Document handoff in activity log                        │
└───────────────────────────────────────────────────────────┘
                        ↓
                  [Transfer Complete]
```

---

## 7. Screen Specifications

### 7.1 Screen: IC Transfer Modal (SCR-MGR-007)

**Route:** `/admin/users/{userId}/transfer-pod`
**Access:** Regional Director, COO, CEO
**Layout:** Modal Dialog

```
┌──────────────────────────────────────────────────────────────────┐
│ Transfer IC to Different Pod                                [X]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Transferring: 👤 John Smith (Technical Recruiter)               │
│ Current Pod: West Coast Recruiting Pod                          │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ TRANSFER DETAILS                                           │  │
│ │                                                            │  │
│ │ Destination Pod *                                          │  │
│ │ ┌──────────────────────────────────────────────────────┐   │  │
│ │ │ East Coast Recruiting Pod                         ▼  │   │  │
│ │ └──────────────────────────────────────────────────────┘   │  │
│ │                                                            │  │
│ │ Pod Manager: Sarah Johnson                                 │  │
│ │ Current Size: 7 / 10 ICs (capacity available)              │  │
│ │                                                            │  │
│ │ Effective Date *                                           │  │
│ │ ┌────────────────┐                                         │  │
│ │ │ 2025-12-15  📅│                                          │  │
│ │ └────────────────┘  (2 weeks from today)                  │  │
│ │                                                            │  │
│ │ What happens to John's current work?                       │  │
│ │ ○ Transfer All (IC takes all jobs/candidates)             │  │
│ │ ○ Transfer None (Objects stay in current pod)             │  │
│ │ ● IC Selects (IC chooses which objects to take)           │  │
│ │ ○ Strategic Only (Major accounts follow, rest stay)       │  │
│ │                                                            │  │
│ │ Current Work Summary:                                      │  │
│ │ ┌──────────────────────────────────────────────────────┐   │  │
│ │ │ • 8 active jobs (5 with submissions)                 │   │  │
│ │ │ • 12 candidate relationships                         │   │  │
│ │ │ • 3 accounts (primary contact)                       │   │  │
│ │ │ • 2 scheduled interviews this week                   │   │  │
│ │ └──────────────────────────────────────────────────────┘   │  │
│ │                                                            │  │
│ │ Reason for Transfer *                                      │  │
│ │ ┌──────────────────────────────────────────────────────┐   │  │
│ │ │ IC relocating to New York, aligning with East       │   │  │
│ │ │ Coast pod for geographic focus and client timezone  │   │  │
│ │ │ coverage.                                            │   │  │
│ │ └──────────────────────────────────────────────────────┘   │  │
│ │                                                            │  │
│ │ ☑ Notify all stakeholders (IC, managers, RACI parties)    │  │
│ │ ☑ Create transition plan                                  │  │
│ │ ☑ Schedule 30-day check-in                                │  │
│ │                                                            │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ [Cancel]                                    [Execute Transfer]   │
└──────────────────────────────────────────────────────────────────┘
```

### 7.2 Screen: Job Transfer Modal (SCR-MGR-008)

```
┌──────────────────────────────────────────────────────────────────┐
│ Transfer Job to Different Pod                               [X]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Job: Senior Java Developer @ Acme Corp                           │
│ Current Pod: West Coast Recruiting Pod                           │
│ Current Owner: John Smith                                        │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ TRANSFER DETAILS                                           │  │
│ │                                                            │  │
│ │ Destination Pod *                                          │  │
│ │ ┌──────────────────────────────────────────────────────┐   │  │
│ │ │ Strategic Account Pod - Acme Corp             ▼      │   │  │
│ │ └──────────────────────────────────────────────────────┘   │  │
│ │                                                            │  │
│ │ Pod Manager: Michael Brown                                 │  │
│ │ Scope: Dedicated to Acme Corp                              │  │
│ │                                                            │  │
│ │ New Owner (Responsible IC) *                               │  │
│ │ ┌──────────────────────────────────────────────────────┐   │  │
│ │ │ 🔍 Select IC from pod...                          ▼  │   │  │
│ │ └──────────────────────────────────────────────────────┘   │  │
│ │                                                            │  │
│ │ Available ICs:                                             │  │
│ │ • Lisa Chen (Acme Corp specialist, 3 active jobs)          │  │
│ │ • Tom Davis (Available, 5 active jobs)                     │  │
│ │ • Unassigned (pod manager will assign later)               │  │
│ │                                                            │  │
│ │ Transfer Related Objects                                   │  │
│ │ ☑ Transfer all 3 submissions                              │  │
│ │ ☑ Transfer 2 scheduled interviews                         │  │
│ │ ☐ Transfer 5 candidates (keep global)                     │  │
│ │                                                            │  │
│ │ Reason for Transfer *                                      │  │
│ │ ┌──────────────────────────────────────────────────────┐   │  │
│ │ │ Acme Corp elevated to strategic account. Moving all │   │  │
│ │ │ Acme jobs to dedicated account pod for better       │   │  │
│ │ │ service and relationship management.                │   │  │
│ │ └──────────────────────────────────────────────────────┘   │  │
│ │                                                            │  │
│ │ Handoff Options                                            │  │
│ │ ☑ Schedule handoff call between old and new IC            │  │
│ │ ☑ Send introduction email to client                       │  │
│ │ ☑ Notify all candidates in pipeline                       │  │
│ │                                                            │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ [Cancel]                                      [Transfer Job]     │
└──────────────────────────────────────────────────────────────────┘
```

### 7.3 Screen: Bulk Object Transfer (SCR-MGR-009)

```
┌──────────────────────────────────────────────────────────────────┐
│ Bulk Transfer Objects Between Pods                         [X]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Source Pod: West Coast Recruiting Pod                            │
│ Destination Pod: Strategic Account Pod - Acme Corp               │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ SELECT OBJECTS TO TRANSFER                                 │  │
│ │                                                            │  │
│ │ [Jobs] [Candidates] [Accounts] [Submissions]               │  │
│ │                                                            │  │
│ │ ┌──────────────────────────────────────────────────────┐   │  │
│ │ │ Jobs (8 total) - Filter: Client = "Acme Corp"       │   │  │
│ │ ├──────────────────────────────────────────────────────┤   │  │
│ │ │ ☑ Senior Java Developer (3 submissions, 2 interview)│   │  │
│ │ │ ☑ DevOps Engineer (5 submissions, 1 interview)      │   │  │
│ │ │ ☑ Product Manager (Draft, no submissions)           │   │  │
│ │ │ ☐ QA Engineer (Different client - not transferring) │   │  │
│ │ └──────────────────────────────────────────────────────┘   │  │
│ │                                                            │  │
│ │ Selected: 3 jobs with 8 submissions, 3 interviews          │  │
│ │                                                            │  │
│ │ RACI Assignment for Transferred Objects                    │  │
│ │ New Responsible (R): [Unassigned - pod manager assigns ▼]  │  │
│ │ New Accountable (A): [Michael Brown (Pod Manager)      ▼]  │  │
│ │ Consulted (C): [Auto: Michael Brown]                       │  │
│ │ Informed (I): [Auto: COO, Regional Director]               │  │
│ │                                                            │  │
│ │ Effective Date: [Immediate ▼]                              │  │
│ │                                                            │  │
│ │ Notifications                                              │  │
│ │ ☑ Notify all RACI stakeholders                            │  │
│ │ ☑ Notify clients (3 unique clients affected)              │  │
│ │ ☑ Notify candidates (8 active candidates)                 │  │
│ │                                                            │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ [Cancel]                           [Transfer 3 Jobs + Related]   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 8. Field Specifications

### 8.1 Pod Transfer Log Table

| Field | Type | Required | Validation | Default | Notes |
|-------|------|----------|------------|---------|-------|
| id | uuid | Yes | UUID v4 | Auto-generated | Primary key |
| transfer_type | enum | Yes | ic, job, candidate, account, bulk | - | What was transferred |
| object_type | string | No | users, jobs, candidates, etc. | - | Table name |
| object_id | uuid | No | Valid object ID | - | Transferred object |
| source_pod_id | uuid | Yes | Valid pod ID | - | Origin pod |
| destination_pod_id | uuid | Yes | Valid pod ID | - | Receiving pod |
| initiated_by | uuid | Yes | Valid user ID | Current user | Who started transfer |
| reason | text | Yes | min:10, max:500 | - | Business justification |
| effective_date | date | Yes | Valid date | Today | When transfer occurs |
| status | enum | Yes | pending, in_progress, completed, cancelled | pending | Transfer status |
| objects_count | integer | No | >= 0 | 1 | How many objects transferred |
| related_transfers | uuid[] | No | Valid transfer IDs | [] | Related transfers |
| created_at | timestamp | Yes | - | Now | Audit timestamp |

---

## 9. Business Rules

### 9.1 IC Transfer Rules

1. **Single Pod:** IC can only be in one pod at a time (no double-assignment)
2. **Manager Approval:** IC transfer requires approval from both pod managers
3. **Notice Period:** Minimum 1 week notice (recommended 2-4 weeks)
4. **Object Policy Required:** Must specify what happens to IC's current work
5. **Capacity Check:** Destination pod must have capacity (<12 ICs)
6. **Skills Validation:** IC should have skills matching destination pod scope

### 9.2 Object Transfer Rules

1. **RACI Update:** All transferred objects must have RACI updated
2. **Referential Integrity:** Cannot transfer job without transferring related submissions
3. **Client Notification:** Client must be notified if primary contact changes
4. **Candidate Notification:** Candidates notified if recruiter changes
5. **Active Interviews:** Cannot transfer job with interview scheduled <48 hours
6. **Permission Check:** Receiving pod must have permission to access object scope

### 9.3 Pod Merge/Split Rules

1. **Regional Director Approval:** Pod structural changes require Regional Director
2. **COO Notification:** All pod merges/splits notify COO
3. **IC Consultation:** All ICs must be consulted before pod merge/split
4. **Object Reassignment:** All objects must be explicitly reassigned
5. **Metrics Preservation:** Historical metrics preserved for disbanded pods

---

## 10. Integration Points

### 10.1 tRPC Procedures

```typescript
// IC transfer between pods
pods.transferIC({
  input: {
    userId: string;
    sourcePodId: string;
    destinationPodId: string;
    effectiveDate: Date;
    objectTransferPolicy: 'all' | 'none' | 'selective' | 'strategic';
    reason: string;
    notifyStakeholders: boolean;
  };
  output: {
    transferId: string;
    affectedObjectsCount: number;
    success: boolean;
  };
});

// Job transfer between pods
jobs.transferToPod({
  input: {
    jobId: string;
    destinationPodId: string;
    newResponsibleIC?: string; // Optional, can assign later
    transferSubmissions: boolean;
    transferInterviews: boolean;
    reason: string;
  };
  output: {
    success: boolean;
    notificationsSent: number;
  };
});

// Bulk object transfer
pods.bulkTransferObjects({
  input: {
    objectType: 'jobs' | 'candidates' | 'accounts';
    objectIds: string[];
    destinationPodId: string;
    raciAssignments: {
      responsible?: string;
      accountable?: string;
    };
    reason: string;
  };
  output: {
    transferId: string;
    successCount: number;
    failedCount: number;
    errors: TransferError[];
  };
});
```

### 10.2 System Side Effects

**On IC Transfer:**
1. Update user.pod_id
2. Update pod_members table (remove from old, add to new)
3. For each object (based on policy):
   - Update object.pod_id
   - Update RACI assignments
   - Notify stakeholders
4. Recalculate both pod metrics
5. Update permissions/RLS policies
6. Create audit log entries
7. Send notifications

**On Object Transfer:**
1. Update object.pod_id
2. Update RACI assignments
3. Notify all RACI stakeholders
4. Notify client/candidate if applicable
5. Create activity log entry
6. Update pod metrics for both pods
7. Create audit log entry

---

## 11. Metrics & Analytics

### 11.1 Transfer Metrics

| Metric | Target | Purpose |
|--------|--------|---------|
| Average Transfer Completion Time | < 7 days | Measure efficiency |
| IC Retention Post-Transfer | > 90% at 6 months | Validate good transfers |
| Object Transfer Success Rate | > 95% | System reliability |
| Stakeholder Satisfaction | > 4.0/5.0 | Process quality |

### 11.2 Transfer Analysis

**Track transfer patterns to identify:**
- Pods with high turnover (investigate management)
- Pods that are growing (consider splitting)
- Pods that are shrinking (consider merging)
- Common transfer reasons (inform policy)

---

## 12. Test Cases

### TC-MGR-006-001: Transfer IC with Selective Object Policy

**Priority:** Critical
**Type:** E2E
**Automated:** Yes

**Preconditions:**
- IC has active jobs and submissions
- Destination pod has capacity
- Regional Director logged in

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to /admin/users/{userId} | User profile displayed |
| 2 | Click [Transfer to Different Pod] | Transfer modal opens |
| 3 | Select destination pod | Pod details shown |
| 4 | Choose "IC Selects" policy | Object selection UI appears |
| 5 | IC selects 5 of 8 jobs to transfer | Jobs marked for transfer |
| 6 | Enter reason, set date | Validation passes |
| 7 | Click [Execute Transfer] | Transfer initiated |
| 8 | Wait for completion | Transfer completes, notifications sent |
| 9 | Verify IC's pod updated | pod_id changed |
| 10 | Verify 5 jobs transferred | Jobs in new pod |
| 11 | Verify 3 jobs stayed | Jobs remain in old pod |

**Postconditions:**
- IC in new pod
- Selected objects transferred
- RACI updated correctly
- Both pod managers notified

---

## 13. Accessibility

**WCAG 2.1 AA Compliance:**
- Transfer modals fully keyboard navigable
- Screen reader announces transfer impacts
- Clear labels on all form fields
- Confirmation dialogs before destructive actions

---

## 14. Security

**Authorization:**
- Pod Managers can only reassign within their pod
- Regional Directors can reassign across pods in their region
- COO can reassign across all regions
- All transfers logged in audit trail

**Data Protection:**
- Transfer logs are immutable
- PII in transfer reasons encrypted
- Client notifications via secure channels

---

## 15. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | System Architect | Initial comprehensive specification |

---

**End of UC-MGR-006: Pod Reassignment and Object Transfer**
