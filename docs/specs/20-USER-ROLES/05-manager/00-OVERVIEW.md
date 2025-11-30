# Manager Role - Complete Specification

## Role Overview

The **Manager** is the "path clearer / torch bearer" role in InTime OS. Managers oversee pods (teams) of Individual Contributors (ICs), enabling their success by removing blockers, handling escalations, and providing strategic guidance. Crucially, **Managers do not do the work themselves** - they empower ICs to work independently end-to-end while monitoring performance and stepping in only when needed.

---

## Role Summary

| Property | Value |
|----------|-------|
| Role ID | `manager` |
| Role Type | Leadership / Oversight |
| Reports To | COO / CEO |
| Oversees | Pod of ICs (Technical Recruiters, Bench Sales, or TA) |
| RCAI Default | Receives C (Consulted) and I (Informed) assignments |
| Sprint Focus | Enable pod to hit collective target (1 placement per IC per sprint) |

---

## Core Philosophy

### Path Clearer / Torch Bearer

The Manager role is **not** a traditional supervisor who assigns work and micromanages. Instead:

- **ICs are autonomous** - Each recruiter/bench sales/TA person handles jobs end-to-end
- **Manager removes obstacles** - Handles blockers that ICs cannot resolve themselves
- **Manager provides visibility** - Ensures leadership knows what's happening
- **Manager coaches** - Helps ICs level up their skills and performance
- **Manager handles escalations** - Takes over when client/candidate issues exceed IC authority

**Analogy:** The Manager is like a trail guide who clears fallen trees and lights the path, but doesn't carry anyone's backpack.

---

## Key Responsibilities

1. **Monitor Pod Performance** - Track pod-level metrics (placements, pipeline health, activity levels)
2. **Remove Blockers** - Resolve issues preventing ICs from hitting targets
3. **Handle Escalations** - Take over client complaints, candidate issues, or complex negotiations
4. **Coach ICs** - 1:1s, skill development, performance feedback
5. **RCAI Management** - Receive C and I notifications, stay informed without interfering
6. **Sprint Planning** - Help pod set realistic goals and priorities each sprint
7. **Cross-Pod Coordination** - Facilitate collaboration between recruiting/bench/TA pods
8. **Client Relationship Management** - Manage strategic accounts (high-value or complex)
9. **Approve High-Stakes Decisions** - Review submissions with unusual rates, placements with negative margin

---

## Primary Metrics (KPIs)

| Metric | Target | Measurement Period |
|--------|--------|-------------------|
| Pod Placement Rate | 1 per IC per sprint | Per 2-week sprint |
| IC Productivity (Avg) | Meet individual targets | Per sprint |
| Sprint Goal Achievement | 100% of sprints hit target | Per quarter |
| Escalation Resolution Time | < 24 hours | Per escalation |
| IC Satisfaction Score | > 4.0/5.0 | Quarterly survey |
| Pod Pipeline Health | > 3x coverage ratio | Weekly |
| Client Escalation Rate | < 5% of placements | Per quarter |

### Secondary Metrics
- IC Retention Rate (low turnover = good management)
- Cross-Pollination Lead Quality (from pod conversations)
- Time to Fill Jobs (pod average vs org average)
- Client Satisfaction (NPS for pod's accounts)

---

## What Managers Do NOT Do

❌ **Do NOT assign individual jobs to ICs** - ICs choose from available jobs
❌ **Do NOT do the recruiting work** - Sourcing, screening, submitting is IC responsibility
❌ **Do NOT micromanage daily tasks** - ICs manage their own pipelines
❌ **Do NOT take credit for placements** - Placements belong to the IC who made them
❌ **Do NOT interfere unless asked** - Trust ICs to execute independently

---

## RCAI Assignments (Typical)

| Scenario | Manager's RCAI Role | Actions Required |
|----------|---------------------|------------------|
| IC creates Job | Informed (I) | Notification only, no action needed |
| IC creates Submission | Informed (I) | Notification only, monitor pipeline |
| IC schedules Interview | Informed (I) | Notification only |
| Offer Extended | Consulted (C) | Review offer terms, provide input |
| Placement Completed | Informed (I) | Celebrate, update pod metrics |
| Client Escalation | Responsible (R) + Accountable (A) | Handle issue, resolve, inform IC |
| Unusual Rate Submission | Consulted (C) | Approve or reject with guidance |
| IC Requests Help | Consulted (C) | Provide coaching, remove blocker |

---

## Daily Workflow Summary

### Morning (8:00 AM - 10:00 AM)
1. Review **Pod Dashboard** - Check overnight activity, escalations
2. Review individual IC metrics - Who's on track? Who needs help?
3. Handle overnight escalations (emails, client complaints)
4. Check C and I notifications - Stay informed on major deals

### Mid-Morning (10:00 AM - 12:00 PM)
1. Pod stand-up (async or 15-min sync) - Blockers? Wins? Priorities?
2. Coach IC on difficult situation (client negotiation, candidate issue)
3. Handle escalated client call or candidate problem

### Afternoon (12:00 PM - 3:00 PM)
1. Strategic account management - High-value client relationships
2. Review and approve high-value/unusual submissions
3. 1:1 with IC (weekly rotation)
4. Cross-pod coordination call (with other managers)

### Late Afternoon (3:00 PM - 5:00 PM)
1. Sprint planning and pipeline review with pod
2. Administrative work (approvals, reports)
3. Plan next day priorities
4. Update COO/CEO on critical items

---

## Permissions Matrix

### Entity Permissions

| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| Jobs | ✅ | ✅ All Pod Jobs | ✅ All Pod Jobs | ⚠️ With Justification | Can view/edit pod's work |
| Candidates | ✅ | ✅ All Org | ✅ All Pod Candidates | ❌ | Read org-wide, edit pod's |
| Submissions | ✅ | ✅ All Pod Submissions | ✅ All Pod Submissions | ❌ | Full pod visibility |
| Interviews | ✅ | ✅ All Pod Interviews | ✅ All Pod Interviews | ✅ | Can reschedule if needed |
| Offers | ✅ | ✅ All Pod Offers | ✅ All Pod Offers | ❌ | Approve/edit offers |
| Placements | ✅ | ✅ All Pod Placements | ✅ Limited | ❌ | View pod metrics |
| Accounts | ✅ | ✅ All Org | ✅ Assigned | ❌ | Manage strategic accounts |
| Contacts | ✅ | ✅ All Org | ✅ Own | ❌ | Add contacts for accounts |
| Activities | ✅ | ✅ All Pod Activities | ✅ Own | ✅ Own | View pod activity, edit own |
| Leads | ✅ | ✅ All Org | ✅ Assigned | ❌ | Can reassign leads |
| Deals | ✅ | ✅ All Pod Deals | ✅ All Pod Deals | ❌ | Manage pod deals |
| Pods | ❌ | ✅ Own Pod | ⚠️ Limited | ❌ | View pod, update targets |

### Feature Permissions

| Feature | Access |
|---------|--------|
| Pod Dashboard | ✅ Full (own pod) |
| Individual IC Dashboards | ✅ Full (view-only) |
| Bulk Actions | ✅ Full (on pod items) |
| Reports (Pod Data) | ✅ Full |
| Reports (Org Data) | ✅ Read-Only |
| User Management | ⚠️ Limited (can't add/remove users, can coach) |
| Transfer Ownership | ✅ Full (within pod) |
| Override IC Decisions | ⚠️ With Justification |
| Escalation Handling | ✅ Full |
| Approval Workflows | ✅ Full |

---

## Navigation Quick Reference

### Sidebar Access
- ✅ Dashboard / Today View (Manager view)
- ✅ Pod Dashboard (primary workspace)
- ✅ Tasks (pod + own)
- ✅ Jobs (all pod jobs)
- ✅ Candidates (all org, focus on pod)
- ✅ Submissions (all pod submissions)
- ✅ Placements (all pod placements)
- ✅ Accounts (all org)
- ✅ Contacts (all org)
- ✅ Leads (all org)
- ✅ Deals (pod deals)
- ✅ Analytics (pod analytics)
- ✅ Pod Settings (manage pod members, targets)
- ❌ System Settings (no access)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` | Open Command Bar |
| `g p` | Go to Pod Dashboard |
| `g t` | Go to Tasks (pod tasks) |
| `g j` | Go to Jobs (pod jobs) |
| `g s` | Go to Submissions (pod submissions) |
| `e` | Escalate current item (context-aware) |
| `a` | Approve current item (context-aware) |

---

## Use Cases (Summary)

The following use cases are documented in detail in separate files:

| Use Case | File | Priority |
|----------|------|----------|
| Monitor Pod Performance | [02-pod-dashboard.md](./02-pod-dashboard.md) | High |
| Handle Escalation | [03-handle-escalation.md](./03-handle-escalation.md) | High |
| Approve High-Value Submission | [04-approve-submission.md](./04-approve-submission.md) | Medium |
| Conduct 1:1 with IC | [05-conduct-1on1.md](./05-conduct-1on1.md) | Medium |
| Sprint Planning | [06-sprint-planning.md](./06-sprint-planning.md) | Medium |
| Coach IC on Deal | [07-coach-ic.md](./07-coach-ic.md) | Medium |
| Manage Strategic Account | [08-manage-strategic-account.md](./08-manage-strategic-account.md) | Medium |
| Transfer Ownership | [09-transfer-ownership.md](./09-transfer-ownership.md) | Low |
| Review Pod Analytics | [10-review-analytics.md](./10-review-analytics.md) | Low |

---

## Screen Access Map

| Screen | Route | Access Level |
|--------|-------|--------------|
| Manager Dashboard | `/employee/workspace` | Full (manager view) |
| Pod Dashboard | `/employee/manager/pod` | Full |
| Pod Jobs | `/employee/workspace/jobs?pod={pod_id}` | Full |
| Pod Submissions | `/employee/workspace/submissions?pod={pod_id}` | Full |
| Pod Placements | `/employee/workspace/placements?pod={pod_id}` | Full |
| Pod Analytics | `/employee/manager/analytics` | Full |
| Escalations Queue | `/employee/manager/escalations` | Full |
| Approvals Queue | `/employee/manager/approvals` | Full |
| IC Performance | `/employee/manager/team/{user_id}` | Full |
| Sprint Board | `/employee/manager/sprint` | Full |
| 1:1 Notes | `/employee/manager/1on1/{user_id}` | Full (own pod) |

---

## Training Requirements

Before using the system as a Manager, complete:

1. **Manager Orientation** (2 hours)
   - Manager philosophy: Path clearer, not task assigner
   - RCAI model deep dive
   - Pod structure and expectations

2. **Pod Dashboard Training** (1 hour)
   - Reading pod metrics
   - Identifying at-risk ICs
   - Sprint progress tracking

3. **Escalation Handling Training** (2 hours)
   - When to intervene vs. when to let IC handle
   - Client escalation protocols
   - Candidate issue resolution

4. **Coaching Skills Training** (3 hours)
   - Effective 1:1 conversations
   - Performance feedback delivery
   - Skill development planning

5. **Approval Workflows Training** (1 hour)
   - What requires approval
   - How to review submissions
   - Override protocols

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| IC not hitting targets | Review pipeline with IC, identify blockers, provide coaching |
| Too many escalations | Investigate root cause - is IC lacking skills? Or are clients problematic? |
| Pod metrics not visible | Check RLS permissions, ensure pod assignment is active |
| Can't approve submission | Verify submission is flagged for approval and assigned to your pod |
| IC feels micromanaged | Step back, clarify expectations, focus on outcomes not tasks |
| Pod performance lagging | Sprint retrospective, identify systemic issues, adjust targets if needed |

---

## Manager Success Criteria

A successful Manager:
- ✅ Pod consistently hits sprint targets
- ✅ ICs feel supported, not controlled
- ✅ Low escalation rate (ICs handle most issues independently)
- ✅ High IC retention (people want to stay on the team)
- ✅ ICs are leveling up (improving skills, taking on harder challenges)
- ✅ Clients are satisfied (low complaint rate)
- ✅ Leadership trusts the pod (minimal oversight needed)

---

## Reporting Structure

```
CEO / COO
    │
    ├─ Manager (Recruiting Pod)
    │       ├─ Technical Recruiter 1
    │       ├─ Technical Recruiter 2
    │       └─ Technical Recruiter 3
    │
    ├─ Manager (Bench Sales Pod)
    │       ├─ Bench Sales Recruiter 1
    │       └─ Bench Sales Recruiter 2
    │
    └─ Manager (Talent Acquisition Pod)
            ├─ TA Recruiter 1
            └─ TA Recruiter 2
```

---

## Decision Authority Matrix

| Decision Type | Manager Authority | Requires Escalation To |
|---------------|-------------------|------------------------|
| Approve standard submission | ✅ Full | - |
| Approve unusual rate | ✅ Full | - |
| Approve negative margin placement | ⚠️ With CEO approval | CEO |
| Transfer job between ICs | ✅ Full | - |
| Remove IC from pod | ❌ No | COO/CEO |
| Change sprint targets | ⚠️ With justification | COO |
| Override client complaint | ✅ Full | - |
| Waive penalty fee | ❌ No | CEO |
| Adjust commission split | ❌ No | CEO/Finance |

---

*Last Updated: 2024-11-30*
