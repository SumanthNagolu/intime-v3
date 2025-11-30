# Talent Acquisition (TA) Recruiter Role - Complete Specification

## Role Overview

The **TA Recruiter** is responsible for internal hiring for the staffing company itself. This role is distinct from Technical Recruiters (who place candidates at client companies) and Bench Sales (who market consultants). TA Recruiters build the company's internal team by sourcing, screening, and onboarding new employees.

---

## Role Summary

| Property | Value |
|----------|-------|
| Role ID | `ta_recruiter` |
| Role Type | Individual Contributor (IC) |
| Reports To | TA Manager / HR Manager |
| Primary Entities | Campaigns, Internal Jobs, Employee Candidates, Pods |
| RCAI Default | Responsible (R) on their assigned campaigns |
| Sprint Target | 2-3 quality hires per month |

---

## Key Distinctions

### TA Recruiter vs Technical Recruiter vs Bench Sales

| Aspect | TA Recruiter | Technical Recruiter | Bench Sales |
|--------|-------------|-------------------|-------------|
| **Purpose** | Build internal team | Place candidates at clients | Market consultants |
| **Customer** | Internal hiring managers | External clients | Consulting clients |
| **Candidates** | Full-time employees | Contractors/consultants | Bench consultants |
| **Outcome** | New employee hired | Placement fee | Consultant placement |
| **Focus** | Culture fit, long-term | Skills match, immediate | Marketing, availability |
| **Entities** | Campaigns, Internal Jobs | Jobs, Submissions | Hotlists, Marketing |

---

## Key Responsibilities

1. **Campaign Management** - Create and run talent acquisition campaigns (LinkedIn, email, job boards)
2. **Internal Job Posting** - Post internal positions, define requirements
3. **Candidate Sourcing** - Find qualified candidates for internal roles
4. **Screening & Interviewing** - Conduct initial screens, coordinate hiring manager interviews
5. **Offer Management** - Extend offers, negotiate compensation
6. **Onboarding Coordination** - Create user profiles, assign to pods, enroll in training
7. **Employer Branding** - Maintain careers page, showcase company culture
8. **Analytics Tracking** - Monitor campaign performance, time-to-fill, quality of hire

---

## Primary Metrics (KPIs)

| Metric | Target | Measurement Period |
|--------|--------|-------------------|
| Quality Hires | 2-3 | Per month |
| Time to Fill | 30 days | Per requisition |
| Campaign Response Rate | 15% | Per campaign |
| Interview-to-Offer Ratio | 30% | Per quarter |
| Offer Acceptance Rate | 85% | Per quarter |
| New Hire Retention (90 days) | 90% | Per quarter |
| Cost per Hire | <$3,000 | Per hire |
| Source Quality Score | 80%+ | Per quarter |

---

## Daily Workflow Summary

### Morning (8:00 AM - 10:00 AM)
1. Review open internal requisitions
2. Check campaign performance metrics
3. Review overnight responses from candidates
4. Follow up on pending interviews
5. Update candidate statuses

### Mid-Morning (10:00 AM - 12:00 PM)
1. Source candidates (LinkedIn Recruiter, job boards)
2. Conduct initial screening calls
3. Review resumes and applications
4. Log all activities

### Afternoon (12:00 PM - 3:00 PM)
1. Coordinate with hiring managers
2. Schedule interviews
3. Run outreach campaigns
4. Update campaign analytics

### Late Afternoon (3:00 PM - 5:00 PM)
1. Prepare offer letters (with HR)
2. Onboarding coordination for new hires
3. Update internal job postings
4. Plan next day priorities

---

## Permissions Matrix

### Entity Permissions

| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| Campaigns | ✅ | ✅ Own + Team | ✅ Own | ❌ | Can create and manage campaigns |
| Internal Jobs | ✅ | ✅ All | ✅ Own | ❌ | Can create internal job postings |
| Candidates (Internal) | ✅ | ✅ All in Org | ✅ Own | ❌ | Read all, edit assigned |
| Employee Profiles | ✅ | ✅ All | ❌ | ❌ | Create during onboarding, read-only after |
| Pods | ❌ | ✅ All | ❌ | ❌ | Read-only for pod assignment |
| Offers | ✅ | ✅ Own | ✅ Own | ❌ | Create and extend offers |
| Activities | ✅ | ✅ Own | ✅ Own | ✅ Own | Full control of own activities |
| Leads (Cross-Pillar) | ✅ | ✅ Informed | ❌ | ❌ | Can create leads for other departments |
| Accounts | ❌ | ✅ All | ❌ | ❌ | Read-only for context |

### Feature Permissions

| Feature | Access |
|---------|--------|
| Campaign Builder | ✅ Full |
| Candidate Search | ✅ Full |
| Resume Parsing | ✅ Full |
| Activity Logging | ✅ Full |
| Interview Scheduling | ✅ Full |
| Offer Management | ✅ Limited (requires approval) |
| Employee Onboarding | ✅ Full |
| Pod Assignment | ❌ No (HR/Admin only) |
| Reports (Own Data) | ✅ Full |
| Reports (Team Data) | ❌ No |
| LinkedIn Recruiter | ✅ Full |
| Job Board Integrations | ✅ Full |
| Email Campaigns | ✅ Full |
| Analytics Dashboard | ✅ Own campaigns only |

---

## RCAI Assignments (Typical)

| Scenario | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|----------|
| New Campaign Created | TA Recruiter | TA Manager | - | HR |
| Internal Job Posted | TA Recruiter | Hiring Manager | TA Manager | - |
| Candidate Sourced | TA Recruiter | TA Recruiter | - | Hiring Manager |
| Interview Scheduled | TA Recruiter | Hiring Manager | - | - |
| Offer Extended | TA Recruiter | HR Manager | TA Manager | CEO |
| New Hire Onboarded | TA Recruiter | HR Manager | IT, Finance | Manager |

---

## Navigation Quick Reference

### Sidebar Access
- ✅ Dashboard / Today View
- ✅ Tasks
- ✅ Campaigns
- ✅ Internal Jobs
- ✅ Candidates (Internal)
- ✅ Employee Directory
- ✅ Pods (read-only)
- ✅ Analytics (own campaigns)
- ❌ Client Jobs (no access)
- ❌ Submissions (no access)
- ❌ Placements (no access)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` | Open Command Bar |
| `g c` | Go to Campaigns |
| `g j` | Go to Internal Jobs |
| `g p` | Go to Candidates |
| `n` | New entity (context-aware) |
| `e` | Edit current entity |
| `l` | Log activity |

---

## Use Cases (Summary)

The following use cases are documented in detail in separate files:

| Use Case | File | Priority |
|----------|------|----------|
| Daily Workflow | [01-daily-workflow.md](./01-daily-workflow.md) | High |
| Create & Run Campaign | [02-run-campaign.md](./02-run-campaign.md) | High |
| Internal Position Hiring | [03-internal-hiring.md](./03-internal-hiring.md) | High |
| Onboard New Employee | [04-onboard-employee.md](./04-onboard-employee.md) | High |

---

## Screen Access Map

| Screen | Route | Access Level |
|--------|-------|--------------|
| Today View | `/employee/workspace` | Full |
| Campaigns List | `/employee/workspace/campaigns` | Own + Team |
| Campaign Detail | `/employee/workspace/campaigns/[id]` | Own + Team |
| Internal Jobs List | `/employee/workspace/internal-jobs` | All |
| Internal Job Detail | `/employee/workspace/internal-jobs/[id]` | All |
| Candidates List | `/employee/workspace/candidates/internal` | All (org) |
| Candidate Detail | `/employee/workspace/candidates/[id]` | All (org) |
| Employee Directory | `/employee/workspace/employees` | Read-only |
| Pods List | `/employee/workspace/pods` | Read-only |

---

## Training Requirements

Before using the system, a new TA Recruiter should complete:

1. **System Orientation** (1 hour)
   - Navigation and UI overview
   - Keyboard shortcuts
   - Command bar usage

2. **Campaign Management Training** (2 hours)
   - Creating campaigns
   - A/B testing setup
   - Analytics interpretation

3. **Internal Hiring Workflow** (2 hours)
   - Posting internal jobs
   - Screening best practices
   - Hiring manager coordination

4. **Onboarding Process Training** (2 hours)
   - User profile creation
   - Pod assignment workflow
   - Training enrollment
   - Equipment requests

5. **Compliance & Best Practices** (1 hour)
   - EEOC compliance
   - Interview question guidelines
   - Data privacy (GDPR, CCPA)

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Can't see a campaign | Check if you have RCAI assignment. Ask manager to add you. |
| Campaign analytics not updating | Refresh data, check if campaign is active. |
| Can't assign to pod | Contact HR/Admin for pod assignment. |
| Candidate already exists | Use deduplication flow, update existing profile. |
| Offer approval stuck | Follow up with HR Manager for approval. |

---

## Key Business Rules

1. **Internal vs External Candidates**: TA Recruiters handle ONLY internal hiring (building the company). External client placements are handled by Technical Recruiters.

2. **Pod Assignment**: TA Recruiters can recommend pod assignment but cannot execute it. HR/Admin must assign employees to pods.

3. **Offer Approval**: All offers require HR Manager approval before being extended to candidates.

4. **Onboarding Checklist**: Every new hire must complete the standard onboarding checklist (IT, training, equipment, benefits).

5. **Campaign Attribution**: When a candidate is hired through a campaign, the campaign must be credited in the `leadSource` field.

6. **Retention Tracking**: TA Recruiters are accountable for 90-day retention of their hires. Quality of hire is measured at 30, 60, and 90 days.

---

## Integration Points

### With Other Roles

| Role | Integration Point |
|------|------------------|
| HR Manager | Offer approvals, onboarding coordination, compliance |
| IT Admin | User account creation, equipment provisioning |
| Finance | Compensation approval, payroll setup |
| Hiring Managers | Job requirements, interview coordination, final decisions |
| Training Coordinator | Academy enrollment for new hires |

### With External Systems

| System | Purpose |
|--------|---------|
| LinkedIn Recruiter | Candidate sourcing |
| Indeed, Dice, Monster | Job posting, candidate sourcing |
| BambooHR / Gusto | Employee records, payroll |
| Calendly | Interview scheduling |
| DocuSign | Offer letter signing |
| Slack | Team notifications |

---

## Success Criteria

A TA Recruiter is successful when:

1. ✅ 90% of new hires pass 90-day retention
2. ✅ Time to fill averages 30 days or less
3. ✅ Hiring managers rate candidate quality 4+ out of 5
4. ✅ Offer acceptance rate exceeds 85%
5. ✅ Campaign response rates exceed 15%
6. ✅ Cost per hire remains under $3,000
7. ✅ All onboarding checklists completed on time
8. ✅ Positive feedback from new hires on onboarding experience

---

## Reporting Structure

```
CEO
 │
 ├─ HR Manager (VP of People)
 │   │
 │   ├─ TA Manager
 │   │   │
 │   │   ├─ TA Recruiter 1 (Senior)
 │   │   └─ TA Recruiter 2 (Junior)
 │   │
 │   └─ HR Generalist
 │
 └─ Recruiting Manager (Client-facing)
     ├─ Technical Recruiter 1
     └─ Technical Recruiter 2
```

---

*Last Updated: 2024-11-30*
