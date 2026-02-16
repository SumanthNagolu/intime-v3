# InTime: Automation vs Human Matrix

This document defines exactly what the system automates, what humans confirm, what humans must do, and what requires approval gates.

---

## The Four Categories

### 1. FULL AUTOMATION (No Human Needed)
The system does it completely. User doesn't even see it happen.

### 2. HUMAN CONFIRMS (System Prepares, Human Approves)
The system does 90% of the work. Human reviews and clicks one button.

### 3. HUMAN REQUIRED (System Assists, Human Acts)
Human must perform the action. System provides context, templates, and prompts.

### 4. GATEKEEPING (Approval Required)
Cannot proceed without explicit sign-off from authorized person.

---

## Complete Action Matrix

### Candidate Management

| Action | Category | System Does | Human Does |
|--------|----------|-------------|------------|
| Parse resume | Auto | Extract text, identify sections, map fields | Nothing |
| Dedupe candidate | Auto | Match against existing, merge if confident | Review uncertain matches |
| Enrich profile | Auto | Pull LinkedIn, verify contact info | Nothing |
| Create candidate record | Auto | Insert all parsed data | Nothing |
| Calculate skill match score | Auto | Compare to job requirements | Nothing |
| Send nurture emails | Auto | Send scheduled sequence | Nothing |
| Track email engagement | Auto | Log opens, clicks, replies | Nothing |
| Initial outreach email | Confirm | Draft email from template | Review and send |
| Make screening call | Human | Show talking points, questions | ★ Make the call |
| Log screening outcome | Confirm | Show outcome options | Select outcome, add notes |
| Request documents | Confirm | Generate request email | Review and send |
| Verify documents | Human | Flag issues, suggest fields | Review and approve |
| Add to hotlist | Confirm | Suggest relevant hotlists | Select and confirm |
| Update availability | Auto | Capture from conversation/form | Nothing |
| Mark candidate inactive | Confirm | Suggest based on signals | Confirm reason |

### Job Management

| Action | Category | System Does | Human Does |
|--------|----------|-------------|------------|
| Create job from email | Auto | Parse job details, create draft | Review and publish |
| Assign recruiter | Auto | Route based on rules | Override if needed |
| Start SLA timer | Auto | Begin tracking from creation | Nothing |
| Match candidates | Auto | Score and rank pool | Select who to submit |
| Generate job brief | Auto | Compile requirements, history | Review |
| Schedule intake call | Confirm | Find availability, propose times | Confirm time |
| Conduct intake call | Human | Show template, capture answers | ★ Conduct the call |
| Update requirements | Confirm | Pre-fill from call notes | Review and save |
| Alert stale jobs | Auto | Notify when no activity | Nothing |
| Close job | Confirm | Update status, notify candidates | Confirm reason |

### Submission Management

| Action | Category | System Does | Human Does |
|--------|----------|-------------|------------|
| Generate submission package | Auto | Format resume, write summary | Review |
| Draft submission email | Auto | Create from template | Customize |
| Send submission | Confirm | Attach documents, address | Click send |
| Log submission | Auto | Record in system | Nothing |
| Schedule follow-up | Auto | Create task for 48 hours | Nothing |
| Surface follow-up | Auto | Show in inbox when due | Nothing |
| Make follow-up call | Human | Show context, history | ★ Make the call |
| Log follow-up outcome | Confirm | Show outcome options | Select outcome |
| Update submission status | Auto | Based on logged outcome | Nothing |
| Notify candidate of status | Auto | Send email on status change | Nothing |

### Interview Management

| Action | Category | System Does | Human Does |
|--------|----------|-------------|------------|
| Find availability | Auto | Check calendars, propose times | Nothing |
| Send calendar invites | Auto | Generate and send | Nothing |
| Send confirmation | Auto | Email candidate and client | Nothing |
| Generate prep materials | Auto | Company brief, tips, questions | Nothing |
| Schedule prep call | Confirm | Find time, create meeting | Confirm |
| Conduct prep call | Human | Show prep materials | ★ Conduct the call |
| Send reminder | Auto | Day before interview | Nothing |
| Create feedback task | Auto | After interview time | Nothing |
| Collect client feedback | Human | Show feedback form | ★ Call and capture |
| Debrief candidate | Human | Show interview context | ★ Call and discuss |
| Log feedback | Confirm | Pre-fill from conversation | Review and save |
| Determine next steps | Confirm | Suggest based on feedback | Confirm decision |

### Offer Management

| Action | Category | System Does | Human Does |
|--------|----------|-------------|------------|
| Generate offer letter | Auto | Create from template | Nothing |
| Calculate margins | Auto | Bill rate - pay rate - burden | Nothing |
| Check rate band | Auto | Compare to approved range | Nothing |
| Request rate approval | Gate | Route to manager | Manager approves |
| Customize offer terms | Human | Show template | Edit terms |
| Send offer | Confirm | Attach letter, create email | Review and send |
| Track offer status | Auto | Monitor for response | Nothing |
| Handle counter | Human | Show original, calculator | ★ Negotiate |
| Accept offer | Confirm | Update status | Confirm acceptance |
| Create placement | Auto | Generate placement record | Nothing |
| Trigger onboarding | Auto | Start onboarding workflow | Nothing |

### Placement Management

| Action | Category | System Does | Human Does |
|--------|----------|-------------|------------|
| Create onboarding checklist | Auto | Generate from template | Nothing |
| Assign onboarding tasks | Auto | Route to responsible parties | Nothing |
| Track onboarding progress | Auto | Monitor item completion | Nothing |
| Send welcome materials | Auto | Email consultant | Nothing |
| Schedule check-ins | Auto | Create recurring tasks | Nothing |
| Conduct check-in | Human | Show status, history | ★ Make the call |
| Log check-in status | Confirm | Show RAG options | Select status |
| Create issue | Human | Show context | Describe issue |
| Route issue | Auto | Assign based on type | Nothing |
| Investigate issue | Human | Show full context | ★ Investigate |
| Log resolution | Confirm | Show resolution options | Document resolution |
| Alert expiring placement | Auto | 60 days before end | Nothing |
| Discuss extension | Human | Show terms, history | ★ Have conversation |
| Process extension | Confirm | Generate amendment | Review and sign |
| Offboard consultant | Confirm | Generate checklist | Complete items |
| Return to pool | Auto | Update candidate status | Nothing |

### Account Management

| Action | Category | System Does | Human Does |
|--------|----------|-------------|------------|
| Calculate health score | Auto | Aggregate metrics | Nothing |
| Alert health decline | Auto | Notify account manager | Nothing |
| Schedule health review | Confirm | Suggest time | Confirm |
| Conduct health review | Human | Show health data | ★ Review internally |
| Identify expansion opportunities | Auto | Analyze org chart gaps | Review suggestions |
| Alert renewal coming | Auto | 60 days before | Nothing |
| Discuss renewal | Human | Show history, terms | ★ Have conversation |
| Generate renewal contract | Auto | From template | Nothing |
| Route for approval | Gate | If non-standard terms | Approver signs |
| Send for signature | Auto | Via DocuSign | Nothing |
| Track contract status | Auto | Monitor DocuSign | Nothing |

### Operations

| Action | Category | System Does | Human Does |
|--------|----------|-------------|------------|
| Send timesheet reminder | Auto | Friday 3pm | Nothing |
| Send timesheet escalation | Auto | Monday 10am if missing | Nothing |
| Chase non-submitters | Human | Show outstanding list | ★ Make calls |
| Flag timesheet exceptions | Auto | Identify unusual entries | Nothing |
| Review normal timesheets | Auto | Auto-approve if clean | Nothing |
| Review exception timesheets | Human | Show exception details | Approve/reject |
| Submit for client approval | Auto | Send to client | Nothing |
| Remind client | Auto | If not approved in 24hrs | Nothing |
| Chase client approval | Human | Show stuck approvals | ★ Follow up |
| Calculate payroll | Auto | From approved timesheets | Nothing |
| Review payroll summary | Human | Show totals, exceptions | Review |
| Approve payroll | Gate | Route for approval | Manager approves |
| Submit to Gusto | Auto | API call | Nothing |
| Generate invoices | Auto | From approved timesheets | Nothing |
| Review invoices | Human | Show invoice details | Review, adjust |
| Send invoices | Confirm | Attach, address | Click send |
| Track payment status | Auto | Monitor AR aging | Nothing |
| Send payment reminders | Auto | 30/60/90 days | Nothing |
| Chase payment | Human | Show AR aging | ★ Follow up |
| Alert compliance expiration | Auto | 30/60/90 days before | Nothing |
| Request compliance docs | Confirm | Generate request | Send |
| Verify compliance docs | Human | Show document | Verify and approve |

### Communication

| Action | Category | System Does | Human Does |
|--------|----------|-------------|------------|
| Log email automatically | Auto | From connected inbox | Nothing |
| Log call automatically | Auto | From phone integration | Nothing |
| Log meeting automatically | Auto | From calendar | Nothing |
| Link comm to entity | Auto | Match email/phone to record | Correct if wrong |
| Draft email reply | Auto | Suggest response | Review and send |
| Make phone call | Human | Show context, dial | ★ Have conversation |
| Send SMS | Confirm | Draft message | Review and send |
| Schedule meeting | Confirm | Find availability | Confirm details |
| Send meeting invite | Auto | Generate and send | Nothing |
| Record meeting notes | Human | Show template | Capture notes |
| Create follow-up tasks | Auto | From meeting outcomes | Nothing |

---

## Gatekeeping Summary

### Financial Gates

| Gate | Threshold | Approver | SLA |
|------|-----------|----------|-----|
| Rate below minimum margin | <20% margin | Finance Manager | 4 hours |
| Rate above standard band | >110% of band | Recruiting Manager | 2 hours |
| Deal value > $100K | $100K+ | Sales Director | 24 hours |
| Deal value > $500K | $500K+ | VP Sales | 48 hours |
| Non-standard payment terms | Net 60+ | Finance Director | 24 hours |
| Payroll run > $100K | $100K+ | Finance Manager | 4 hours |
| Invoice credit > $5K | $5K+ | Finance Director | 24 hours |

### Compliance Gates

| Gate | Condition | Approver | SLA |
|------|-----------|----------|-----|
| Compliance waiver | Any compliance gap | Compliance Officer | 24 hours |
| Background check exception | Failed/incomplete | HR Director | 24 hours |
| Work authorization exception | Questionable status | Legal | 24 hours |
| Contract deviation | Non-standard terms | Legal | 48 hours |
| NDA exception | Client refusing standard | Legal | 24 hours |

### Operational Gates

| Gate | Condition | Approver | SLA |
|------|-----------|----------|-----|
| Timesheet exception > 20% | Variance from normal | Delivery Manager | 24 hours |
| Client refuses timesheet | Disputed hours | Account Manager | 4 hours |
| Placement termination | Early end | Delivery Director | 4 hours |
| Issue escalation Level 2 | Not resolved in 48hrs | Account Director | 2 hours |
| Issue escalation Level 3 | Not resolved in 72hrs | VP Delivery | 1 hour |

### Access Gates

| Gate | Condition | Approver | SLA |
|------|-----------|----------|-----|
| New user access | Any new user | Hiring Manager | 24 hours |
| Admin access | Admin role | IT Director | 24 hours |
| Finance access | Finance data | Finance Director | 24 hours |
| Export data | Bulk export | Compliance Officer | 24 hours |

---

## Call Points (Human Conversations Required)

### Candidate Calls

| Call Type | When | Duration | Frequency | System Support |
|-----------|------|----------|-----------|----------------|
| Screening call | New candidate | 15-30 min | Once per candidate | Questions, scoring |
| Prep call | Before interview | 15 min | Before each interview | Company brief, tips |
| Debrief call | After interview | 10 min | After each interview | Interview notes |
| Offer call | Extending offer | 10-30 min | Once per offer | Offer details |
| Negotiation call | Counter offer | Variable | As needed | History, calculator |
| Rejection call | Candidate rejected | 5 min | Optional | Feedback talking points |

### Client Calls

| Call Type | When | Duration | Frequency | System Support |
|-----------|------|----------|-----------|----------------|
| Intake call | New job | 30 min | Once per job | Requirements template |
| Follow-up call | After submission | 5-10 min | 48 hrs after submit | Submission details |
| Feedback call | After interview | 10 min | After each interview | Feedback form |
| Check-in call | Active placement | 15 min | Bi-weekly | Status history |
| Issue call | Problem reported | Variable | As needed | Full context |
| Renewal call | 60 days before end | 15-30 min | Once per placement | Contract terms |

### Internal Calls

| Call Type | When | Duration | Frequency | System Support |
|-----------|------|----------|-----------|----------------|
| Pipeline review | Weekly | 30 min | Weekly | Pipeline dashboard |
| Account review | Monthly | 30 min | Monthly | Account health |
| Escalation review | Issue not resolved | 15 min | As needed | Issue timeline |
| Capacity planning | Weekly | 15 min | Weekly | Workload dashboard |

---

## Automation Triggers

### Event-Based Triggers

| Event | Triggers | Auto/Confirm |
|-------|----------|--------------|
| Candidate created | Parse resume, dedupe, enrich | Auto |
| Candidate screened (pass) | Add to pool, notify recruiters | Auto |
| Job created | Assign recruiter, start SLA, match candidates | Auto |
| Submission sent | Log, schedule follow-up, notify candidate | Auto |
| Interview scheduled | Send invites, create prep task, send materials | Auto |
| Interview completed | Create feedback task | Auto |
| Offer accepted | Create placement, trigger onboarding | Auto |
| Placement started | Create checklist, schedule check-ins | Auto |
| Placement ending soon | Alert delivery manager, create renewal task | Auto |
| Timesheet submitted | Route for approval | Auto |
| Timesheet approved | Add to payroll batch | Auto |
| Invoice created | Queue for sending | Auto |
| Payment received | Update AR, close invoice | Auto |
| Compliance expiring | Send alert, create renewal task | Auto |

### Time-Based Triggers

| Trigger | Action | Timing |
|---------|--------|--------|
| No submission on job | Alert recruiter | 24 hours after job |
| No follow-up on submission | Surface in inbox | 48 hours after submit |
| No feedback after interview | Alert recruiter | 24 hours after interview |
| Offer pending | Send reminder | 48 hours after sent |
| Timesheet not submitted | Send reminder | Friday 3pm |
| Timesheet still not submitted | Escalate | Monday 10am |
| Client hasn't approved | Send reminder | 24 hours after submission |
| Invoice not paid | Send reminder | 30/60/90 days |
| Placement ending | Alert | 90/60/30 days before |
| Compliance expiring | Alert | 90/60/30 days before |
| Candidate inactive | Trigger nurture | 90 days no activity |

### Condition-Based Triggers

| Condition | Action | Auto/Confirm |
|-----------|--------|--------------|
| Health score < 60 | Alert account manager | Auto |
| Margin < threshold | Route for approval | Gate |
| Rate outside band | Route for approval | Gate |
| SLA breached | Escalate to manager | Auto |
| Issue not resolved 48hrs | Escalate to director | Auto |
| Candidate matches hot job | Notify recruiter | Auto |
| High-value deal closing | Alert sales director | Auto |
| Consultant on bench > 30 days | Escalate marketing | Auto |
| Consultant on bench > 60 days | Alert management | Auto |
| Consultant on bench > 90 days | Executive alert | Auto |
