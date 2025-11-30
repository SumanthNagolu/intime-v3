# Bench Sales Recruiter Role - Complete Specification

## Role Overview

The **Bench Sales Recruiter** is the primary individual contributor (IC) role in the Bench Sales pillar of InTime OS. Bench Sales Recruiters are responsible for marketing consultants who are "on the bench" (not currently placed), finding external job requirements, submitting consultants to vendors, and closing placements to reduce bench time.

---

## Role Summary

| Property | Value |
|----------|-------|
| Role ID | `bench_sales_recruiter` |
| Role Type | Individual Contributor (IC) |
| Reports To | Bench Sales Manager |
| Primary Entities | Bench Consultants, External Jobs, Hotlists, Bench Submissions |
| RCAI Default | Responsible (R) on their assigned bench consultants |
| Sprint Target | 1 placement per 2-week sprint |

---

## Role Definition

A Bench Sales Recruiter works with internal consultants who are currently "on the bench" (not on client projects). Unlike standard recruiters who work with external candidates and client job orders, Bench Sales Recruiters:

1. **Market internal consultants** to external vendors and clients
2. **Find external requirements** from job boards, vendor portals, and client networks
3. **Submit bench consultants** to external opportunities
4. **Manage bench utilization** to minimize days on bench
5. **Track immigration cases** that may affect consultant availability
6. **Create and distribute hotlists** to marketing networks

**Key Difference from Recruiter:** Recruiters place external candidates into client jobs. Bench Sales places internal consultants into external opportunities found in the market.

---

## Key Responsibilities

1. **Bench Management** - Monitor bench consultants, track availability, maintain profiles
2. **Marketing & Outreach** - Create hotlists, market consultants to vendors, build vendor relationships
3. **Job Discovery** - Scan external job boards (Dice, Indeed, LinkedIn), vendor portals for matching requirements
4. **Submission** - Submit bench consultants to external opportunities
5. **Interview Coordination** - Schedule vendor/client interviews, prepare consultants
6. **Placement** - Close placements, coordinate start dates, reduce bench time
7. **Bench Utilization** - Maintain low days-on-bench metrics, ensure consultants stay engaged
8. **Immigration Tracking** - Monitor visa expiry, H1B transfers, work authorization changes

---

## Primary Metrics (KPIs)

| Metric | Target | Measurement Period |
|--------|--------|-------------------|
| Placements | 1 | Per 2-week sprint |
| Bench Utilization Rate | <30% | Ongoing (% of consultants on bench) |
| Average Days on Bench | <45 days | Per consultant |
| Bench Submissions | 15 | Per week |
| Vendor Submittals | 8 | Per week |
| Hotlists Sent | 2 | Per week |
| Marketing Calls | 20 | Per week |
| External Jobs Added | 10 | Per week |
| Consultant Engagement | 100% | Weekly contact rate |

---

## Daily Workflow Summary

### Morning (8:00 AM - 10:00 AM)
1. Review **Bench Dashboard** - Check consultant status, days on bench, alerts
2. Review overnight responses from vendors
3. Update bench submission statuses
4. Check for new consultants joining bench
5. Identify priority placements (30+ days on bench)

### Mid-Morning (10:00 AM - 12:00 PM)
1. Scan external job boards (Dice, Indeed, LinkedIn, vendor portals)
2. Add matching external jobs to system
3. Marketing calls to vendors and clients
4. Update consultant profiles and availability

### Afternoon (12:00 PM - 3:00 PM)
1. Submit consultants to matched requirements
2. Create/update hotlists
3. Interview prep with consultants
4. Follow up on pending submissions

### Late Afternoon (3:00 PM - 5:00 PM)
1. Vendor follow-ups
2. Update bench metrics
3. Log all activities
4. Plan next day priorities
5. Escalate 60+ day bench consultants

---

## Permissions Matrix

### Entity Permissions

| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| Bench Consultants | ❌ | ✅ Assigned | ✅ Assigned | ❌ | Read/update assigned consultants |
| External Jobs | ✅ | ✅ All in Org | ✅ Own | ✅ Own | Can manage external job postings |
| Bench Submissions | ✅ | ✅ Own | ✅ Own | ❌ | Primary submission entity |
| Hotlists | ✅ | ✅ Own + Team | ✅ Own | ✅ Own | Can create and manage hotlists |
| Immigration Cases | ❌ | ✅ Assigned | ❌ | ❌ | Read-only for context |
| Accounts | ❌ | ✅ All | ❌ | ❌ | Read-only for vendor info |
| Contacts | ✅ | ✅ All | ✅ Own | ❌ | Can create vendor POCs |
| Activities | ✅ | ✅ Own | ✅ Own | ✅ Own | Full control of own activities |
| User Profiles | ❌ | ✅ Consultants | ✅ Limited | ❌ | Can update consultant metadata |

### Feature Permissions

| Feature | Access |
|---------|--------|
| Bench Dashboard | ✅ Full |
| External Job Search | ✅ Full |
| Hotlist Builder | ✅ Full |
| Bench Submission | ✅ Full |
| Consultant Profiles | ✅ Read + Limited Edit |
| Immigration Dashboard | ✅ Read-only |
| Activity Logging | ✅ Full |
| Vendor Management | ✅ Limited (contacts only) |
| Reports (Own Data) | ✅ Full |
| Reports (Team Data) | ❌ No |
| Bulk Actions | ✅ Limited |
| Email Marketing | ✅ Full |
| Export Data | ✅ Own Data |
| System Settings | ❌ No |
| User Management | ❌ No |

---

## RCAI Assignments (Typical)

| Scenario | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|----------|
| New Consultant to Bench | Bench Sales Recruiter | Bench Sales Manager | HR | CEO |
| Hotlist Created | Bench Sales Recruiter | Bench Sales Recruiter | - | Manager |
| External Job Added | Bench Sales Recruiter | Bench Sales Recruiter | - | - |
| Bench Submission Created | Bench Sales Recruiter | Bench Sales Recruiter | - | Manager |
| Consultant Submitted to Vendor | Bench Sales Recruiter | Bench Sales Manager | - | - |
| Interview Scheduled | Bench Sales Recruiter | Bench Sales Recruiter | - | Manager |
| Placement Completed | Bench Sales Recruiter | Bench Sales Manager | - | CEO, HR |
| 60-Day Bench Alert | Bench Sales Recruiter | Bench Sales Manager | CEO | HR |

---

## Navigation Quick Reference

### Sidebar Access
- ✅ Dashboard / Bench View
- ✅ Tasks
- ✅ Bench Consultants
- ✅ External Jobs
- ✅ Bench Submissions
- ✅ Hotlists
- ✅ Immigration (read-only)
- ✅ Accounts (read-only, vendors)
- ✅ Contacts (vendors)
- ❌ Internal Jobs (no access)
- ❌ Deals (no access)
- ❌ Pods (no access)
- ❌ Analytics (no access - see own metrics only)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` | Open Command Bar |
| `g b` | Go to Bench Dashboard |
| `g e` | Go to External Jobs |
| `g h` | Go to Hotlists |
| `g s` | Go to Bench Submissions |
| `n` | New entity (context-aware) |
| `e` | Edit current entity |
| `l` | Log activity |
| `m` | Add to hotlist |

---

## Use Cases (Summary)

The following use cases are documented in detail in separate files:

| Use Case | File | Priority |
|----------|------|----------|
| View Bench Dashboard | [02-manage-bench.md](./02-manage-bench.md) | High |
| Market Consultant | [03-market-consultant.md](./03-market-consultant.md) | High |
| Find External Requirements | [04-find-requirements.md](./04-find-requirements.md) | High |
| Submit to External Job | [05-submit-bench-consultant.md](./05-submit-bench-consultant.md) | High |
| Create Hotlist | [06-create-hotlist.md](./06-create-hotlist.md) | Medium |
| Update Consultant Profile | [07-update-consultant.md](./07-update-consultant.md) | Medium |
| Track Immigration Case | [08-track-immigration.md](./08-track-immigration.md) | Medium |
| Schedule Vendor Interview | [09-schedule-interview.md](./09-schedule-interview.md) | Medium |
| Make Placement | [10-make-placement.md](./10-make-placement.md) | High |

---

## Screen Access Map

| Screen | Route | Access Level |
|--------|-------|--------------|
| Bench Dashboard | `/employee/workspace/bench` | Full |
| Bench Consultants List | `/employee/workspace/bench/consultants` | Assigned |
| Consultant Detail | `/employee/workspace/bench/consultants/[id]` | Assigned |
| External Jobs List | `/employee/workspace/bench/jobs` | All (org) |
| External Job Detail | `/employee/workspace/bench/jobs/[id]` | All (org) |
| Bench Submissions List | `/employee/workspace/bench/submissions` | Own |
| Submission Detail | `/employee/workspace/bench/submissions/[id]` | Own |
| Hotlists List | `/employee/workspace/bench/hotlists` | Own + Team |
| Hotlist Builder | `/employee/workspace/bench/hotlists/new` | Full |
| Immigration Cases | `/employee/workspace/bench/immigration` | Read-only |

---

## Training Requirements

Before using the system, a new Bench Sales Recruiter should complete:

1. **System Orientation** (1 hour)
   - Navigation and UI overview
   - Keyboard shortcuts
   - Command bar usage
   - Bench dashboard walkthrough

2. **Bench Sales Process Training** (2 hours)
   - Understanding the bench concept
   - Bench vs traditional recruiting
   - Bench utilization metrics
   - RCAI ownership model

3. **Marketing & Outreach Training** (2 hours)
   - Hotlist creation
   - Vendor relationship building
   - Marketing email templates
   - Compliance and branding

4. **Job Discovery Training** (2 hours)
   - External job board scraping
   - Adding external jobs to system
   - Matching consultants to requirements
   - Rate negotiation strategies

5. **Submission Process Training** (2 hours)
   - Bench submission workflow
   - Vendor portal navigation
   - Interview coordination
   - Placement completion

6. **Immigration Basics** (1 hour)
   - Visa types and restrictions
   - H1B transfer timelines
   - Work authorization verification
   - Immigration case tracking

---

## Bench Sales Business Rules

### Bench Definition
- **On Bench** = Consultant not currently on a billable client project
- **Bench Start Date** = Last project end date OR hire date if never placed
- **Days on Bench** = Current date - Bench start date

### Alert Thresholds
| Days on Bench | Alert Level | Action Required |
|---------------|-------------|-----------------|
| 0-15 days | Green | Normal marketing |
| 16-30 days | Yellow | Increase marketing, daily contact |
| 31-60 days | Orange | Manager escalation, hotlist priority |
| 61+ days | Red | CEO notification, urgent action plan |

### Submission Rules
- Maximum 3 active submissions per consultant at a time
- Must contact consultant before each submission
- Cannot submit to same vendor twice within 30 days
- Maintain 24-hour response SLA to vendors

### Hotlist Rules
- Maximum 20 consultants per hotlist
- Must update consultant profiles before hotlist creation
- Hotlist expires after 14 days
- Track all hotlist engagement (opens, clicks, responses)

### Immigration Restrictions
- Cannot submit consultants with <180 days visa validity
- H1B transfer requires current valid H1B
- OPT consultants: Track EAD expiry, cannot submit if <60 days

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Consultant not responding | Try multiple channels (phone, email, text). Escalate to manager after 3 attempts. |
| Vendor rejecting consultant | Document rejection reason, update consultant profile with feedback. |
| External job expired | Mark job as expired, remove from active matching. |
| Visa about to expire | Flag in immigration dashboard, notify HR and manager immediately. |
| Consultant wants rate increase | Discuss with manager, review market rates, update profile if approved. |
| Multiple bench reps contacting same consultant | Check assignment in system. Consultant should have single assigned bench rep. |
| No external jobs matching skills | Expand search to adjacent skills, consider training/upskilling consultant. |

---

## Escalation Path

| Situation | Escalate To | Timeline |
|-----------|-------------|----------|
| Consultant 30+ days on bench | Bench Sales Manager | Immediate |
| Consultant 60+ days on bench | Manager + CEO | Immediate |
| Visa expiring <90 days | Manager + HR | Within 24 hours |
| Consultant unresponsive | Manager | After 3 contact attempts |
| Rate negotiation required | Manager | Before vendor submission |
| Consultant performance issues | Manager | As soon as identified |
| Vendor payment disputes | Manager + Finance | Immediate |

---

## Success Metrics

### Individual Performance (Weekly)
- Placements: Target 0.5 per week (1 per sprint)
- Submissions: Target 15 per week
- Marketing calls: Target 20 per week
- Hotlists sent: Target 2 per week
- Vendor engagement rate: >40%

### Bench Health (Team)
- Average days on bench: <45 days
- Bench utilization rate: <30%
- 30-day placement rate: >50%
- 60-day placement rate: >80%
- Consultant satisfaction: >4/5

---

## Tools & Integrations

### External Job Sources
- **Dice.com** - IT contractor jobs
- **Indeed.com** - General job search
- **LinkedIn Jobs** - Professional network
- **Vendor Portals** - Direct vendor job boards
- **Email Job Blasts** - Vendor email distributions

### Marketing Tools
- **Email Templates** - Pre-approved consultant profiles
- **Hotlist Generator** - Automated PDF/HTML creation
- **Mass Email** - Bulk vendor outreach
- **LinkedIn Outreach** - Social selling tools

### Tracking Tools
- **Bench Dashboard** - Real-time bench status
- **Activity Logging** - All interactions tracked
- **Submission Pipeline** - Visual workflow
- **Immigration Calendar** - Visa expiry alerts

---

*Last Updated: 2024-11-30*
