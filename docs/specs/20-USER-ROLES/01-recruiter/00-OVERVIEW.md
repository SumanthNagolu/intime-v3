# Recruiter Role - Complete Specification

## Role Overview

The **Recruiter** is the primary individual contributor (IC) role in InTime OS. Recruiters are responsible for the full lifecycle of talent acquisition: sourcing candidates, managing job requisitions, submitting candidates to clients, coordinating interviews, and closing placements.

---

## Role Summary

| Property | Value |
|----------|-------|
| Role ID | `recruiter` |
| Role Type | Individual Contributor (IC) |
| Reports To | Recruiting Manager |
| Primary Entities | Jobs, Candidates, Submissions, Placements |
| RCAI Default | Responsible (R) on their assigned items |
| Sprint Target | 2 placements per 2-week sprint |

---

## Key Responsibilities

1. **Job Management** - Receive job requirements, understand client needs, maintain job accuracy
2. **Candidate Sourcing** - Find qualified candidates through various channels
3. **Screening** - Evaluate candidate fit (skills, experience, availability, rate expectations)
4. **Submission** - Present candidates to clients with compelling write-ups
5. **Interview Coordination** - Schedule and prepare candidates for interviews
6. **Offer Management** - Extend offers, negotiate terms, close candidates
7. **Placement** - Complete placement paperwork, coordinate start date
8. **Activity Logging** - Document all interactions (calls, emails, meetings)

---

## Primary Metrics (KPIs)

| Metric | Target | Measurement Period |
|--------|--------|-------------------|
| Placements | 2 | Per 2-week sprint |
| Submissions | 10 | Per week |
| Client Submittals | 5 | Per week |
| Interviews Scheduled | 3 | Per week |
| Candidate Screens | 15 | Per week |
| Job Fill Rate | 50% | Per quarter |
| Time to Submit | 48 hours | Per job |

---

## Daily Workflow Summary

### Morning (8:00 AM - 10:00 AM)
1. Review **Today View** dashboard
2. Check open tasks and due items
3. Review overnight emails and messages
4. Update submission statuses from client feedback
5. Follow up on pending interviews

### Mid-Morning (10:00 AM - 12:00 PM)
1. Source candidates for priority jobs
2. Conduct candidate screening calls
3. Log all activities

### Afternoon (12:00 PM - 3:00 PM)
1. Prepare and submit candidates to clients
2. Interview prep with candidates
3. Coordinate interview scheduling

### Late Afternoon (3:00 PM - 5:00 PM)
1. Candidate follow-ups
2. Client relationship calls
3. Update job notes and status
4. Plan next day priorities

---

## Permissions Matrix

### Entity Permissions

| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| Jobs | ✅ | ✅ Own + Consulted | ✅ Own | ❌ | Can create but not delete |
| Candidates | ✅ | ✅ All in Org | ✅ Own | ❌ | Read all, edit assigned |
| Submissions | ✅ | ✅ Own + Job | ✅ Own | ❌ | Primary entity for recruiters |
| Interviews | ✅ | ✅ Own Submissions | ✅ Own | ✅ Own | Can manage interviews |
| Offers | ✅ | ✅ Own Submissions | ✅ Own | ❌ | Create and extend offers |
| Placements | ✅ | ✅ Own | ✅ Limited | ❌ | Create only, limited edits |
| Accounts | ❌ | ✅ All | ❌ | ❌ | Read-only for context |
| Contacts | ✅ | ✅ All | ✅ Own | ❌ | Can create POCs |
| Activities | ✅ | ✅ Own | ✅ Own | ✅ Own | Full control of own activities |
| Leads | ✅ | ✅ Informed | ❌ | ❌ | Can create cross-pillar leads |

### Feature Permissions

| Feature | Access |
|---------|--------|
| Job Pipeline View | ✅ Full |
| Candidate Search | ✅ Full |
| Resume Parsing | ✅ Full |
| Activity Logging | ✅ Full |
| Interview Scheduling | ✅ Full |
| Offer Management | ✅ Full |
| Placement Creation | ✅ Full |
| Reports (Own Data) | ✅ Full |
| Reports (Team Data) | ❌ No |
| Bulk Actions | ✅ Limited |
| Import Candidates | ✅ Full |
| Export Data | ✅ Own Data |
| System Settings | ❌ No |
| User Management | ❌ No |

---

## RCAI Assignments (Typical)

| Scenario | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|----------|
| New Job Created by Recruiter | Recruiter | Recruiter | - | Manager |
| Job Assigned to Recruiter | Recruiter | Manager | - | - |
| Submission Created | Recruiter | Recruiter | - | Manager |
| Interview Scheduled | Recruiter | Recruiter | - | Manager |
| Offer Extended | Recruiter | Manager | Recruiter | CEO |
| Placement Completed | Recruiter | Manager | - | CEO, HR |

---

## Navigation Quick Reference

### Sidebar Access
- ✅ Dashboard / Today View
- ✅ Tasks
- ✅ Jobs
- ✅ Candidates
- ✅ Submissions
- ✅ Placements
- ✅ Accounts (read-only)
- ✅ Contacts
- ❌ Leads (limited - can create, not manage)
- ❌ Deals (no access)
- ❌ Pods (no access)
- ❌ Analytics (no access - see own metrics only)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` | Open Command Bar |
| `g j` | Go to Jobs |
| `g c` | Go to Candidates |
| `g s` | Go to Submissions |
| `n` | New entity (context-aware) |
| `e` | Edit current entity |
| `l` | Log activity |

---

## Use Cases (Summary)

The following use cases are documented in detail in separate files:

| Use Case | File | Priority |
|----------|------|----------|
| Create Job | [02-create-job.md](./02-create-job.md) | High |
| Source Candidates | [03-source-candidates.md](./03-source-candidates.md) | High |
| Submit Candidate | [04-submit-candidate.md](./04-submit-candidate.md) | High |
| Schedule Interview | [05-schedule-interview.md](./05-schedule-interview.md) | High |
| Make Placement | [06-make-placement.md](./06-make-placement.md) | High |
| Log Activity | [07-log-activity.md](./07-log-activity.md) | Medium |
| Manage Pipeline | [08-manage-pipeline.md](./08-manage-pipeline.md) | Medium |
| Search Candidates | [09-search-candidates.md](./09-search-candidates.md) | Medium |
| Update Job Status | [10-update-job-status.md](./10-update-job-status.md) | Medium |
| Create Lead (Cross-Pollination) | [11-create-lead.md](./11-create-lead.md) | Low |

---

## Screen Access Map

| Screen | Route | Access Level |
|--------|-------|--------------|
| Today View | `/employee/workspace` | Full |
| Jobs List | `/employee/workspace/jobs` | Own + Consulted |
| Job Detail | `/employee/workspace/jobs/[id]` | Own + Consulted |
| Candidates List | `/employee/workspace/candidates` | All (org) |
| Candidate Detail | `/employee/workspace/candidates/[id]` | All (org) |
| Submissions List | `/employee/workspace/submissions` | Own |
| Submission Detail | `/employee/workspace/submissions/[id]` | Own + Job |
| Placements List | `/employee/workspace/placements` | Own |
| Placement Detail | `/employee/workspace/placements/[id]` | Own |
| Accounts List | `/employee/workspace/accounts` | Read-only |
| Account Detail | `/employee/workspace/accounts/[id]` | Read-only |

---

## Training Requirements

Before using the system, a new Recruiter should complete:

1. **System Orientation** (1 hour)
   - Navigation and UI overview
   - Keyboard shortcuts
   - Command bar usage

2. **Job Workflow Training** (2 hours)
   - Creating and managing jobs
   - Understanding job statuses
   - RCAI ownership model

3. **Candidate Management Training** (2 hours)
   - Sourcing techniques
   - Resume parsing
   - Candidate profiles

4. **Submission Process Training** (2 hours)
   - Submission workflow
   - Client presentation
   - Interview coordination

5. **Placement Completion Training** (1 hour)
   - Offer management
   - Placement paperwork
   - Onboarding handoff

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Can't see a job | Check if you have RCAI assignment. Ask manager to add you as Consulted. |
| Submission stuck | Check client decision status. Contact manager if blocked. |
| Can't edit candidate | You must be assigned or have created the candidate. |
| Missing permissions | Contact Admin for role adjustment. |

---

*Last Updated: 2024-11-30*


