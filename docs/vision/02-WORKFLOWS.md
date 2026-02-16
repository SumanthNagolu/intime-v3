# InTime: Workflow Specifications

This document defines the seven core funnels, their workflows, automation points, human interventions, and gatekeeping requirements.

---

## The Automation Principle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   AUTOMATE: Data entry, scheduling, reminders, calculations,            │
│             notifications, document generation, status updates          │
│                                                                         │
│   HUMAN CONFIRMS: Submissions, offers, payments, contracts              │
│             (System prepares, human approves with one click)            │
│                                                                         │
│   HUMAN REQUIRED: Calls, negotiations, assessments, relationship        │
│             building, complex decisions, conflict resolution            │
│                                                                         │
│   GATEKEEPING: Large deals, rate exceptions, compliance waivers,        │
│             contracts, anything with legal/financial risk               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Funnel 1: Academy (Train New Talent)

### Purpose
Transform raw talent into job-ready IT professionals through structured training programs.

### Stages

#### 1.1 Intake
- **Screen**: Academy Application Form
- **Auto**: Create student record, send welcome email, assign intake reviewer
- **Human**: Review application, assess background
- **Gate**: Admission decision (accept/reject/waitlist)
- **SLA**: 48 hours to review

#### 1.2 Onboarding
- **Screen**: Student Onboarding Checklist
- **Auto**: Create LMS account, assign learning path, schedule orientation, send materials
- **Human**: Conduct orientation call
- **Gate**: Onboarding complete (all items checked)
- **SLA**: 5 business days

#### 1.3 Training
- **Screen**: Student Dashboard (progress, assignments, grades)
- **Auto**: Track progress, send reminders, flag at-risk students, schedule mentor sessions
- **Human**: Mentor check-ins, intervention if struggling
- **Gate**: Course completion (pass all modules with 70%+)
- **Duration**: 8-16 weeks depending on program

#### 1.4 Assessment
- **Screen**: Final Assessment Portal
- **Auto**: Generate assessment, grade automatically, create certificate on pass
- **Human**: Final interview/technical evaluation
- **Gate**: Graduation decision (pass/fail/remediation)

#### 1.5 Graduation → Pool
- **Screen**: Graduate Profile Builder
- **Auto**: Create candidate record, merge with contact, add to talent pool, notify bench sales
- **Human**: None (fully automated)
- **Output**: Candidate ready for placement

---

## Funnel 2: Recruiting (Source Experienced Talent)

### Purpose
Build a deep pool of qualified, pre-screened candidates ready for client opportunities.

### Stages

#### 2.1 Source
- **Screen**: Sourcing Dashboard (job boards, LinkedIn, referrals)
- **Auto**: Parse resumes, dedupe against existing, enrich profiles, AI match scoring
- **Human**: Review profiles, select to engage
- **SLA**: Same-day review for hot candidates

#### 2.2 Engage
- **Screen**: Candidate Inbox (email/LinkedIn/SMS in context)
- **Auto**: Sequence emails, track opens/replies, surface engaged candidates
- **Human**: Make initial contact (call/email/LinkedIn)
- **Confirm**: Log outcome (interested/not interested/callback)

#### 2.3 Screen
- **Screen**: Screening Call Interface
- **Auto**: Pre-populate screening questions, show talking points, record call (optional)
- **Human**: ★ CALL - Conduct screening call (15-30 min)
- **Confirm**: Log outcome, rate fit (1-5), capture availability/rate
- **Gate**: Pass/Fail screening (fail → nurture track)

#### 2.4 Qualify
- **Screen**: Candidate Profile Builder
- **Auto**: Parse resume details, suggest skills from job history, check references queue
- **Human**: Verify information, complete missing fields, request documents
- **Gate**: Profile complete (all required fields, resume uploaded)

#### 2.5 Add to Pool
- **Screen**: Pool Assignment
- **Auto**: Calculate availability date, rate expectations, skill match scores
- **Auto**: Add to relevant hotlists, notify recruiters with matching jobs
- **Output**: Candidate in pool, ready for job matching

---

## Funnel 3: Job Fulfillment (Fill Client Jobs)

### Purpose
Match qualified candidates to client jobs and manage through placement.

### Stages

#### 3.1 Receive Job
- **Screen**: Job Inbox (new job notification)
- **Auto**: Create job record, assign recruiter based on rules, start SLA timer
- **Human**: Review requirements, accept assignment
- **SLA**: 1 hour to acknowledge

#### 3.2 Intake
- **Screen**: Job Intake Form
- **Auto**: Pre-fill from account history, pull similar job templates
- **Human**: ★ CALL - Intake call with hiring manager (30 min)
- **Confirm**: Complete requirements, confirm bill rate, set priority
- **Gate**: Job approved to work (requirements complete)

#### 3.3 Source
- **Screen**: Candidate Matching (AI suggestions + manual search)
- **Auto**: Match from pool by skills/location/rate, score candidates, rank by fit
- **Human**: Select candidates to submit (3-5 typically)
- **SLA**: First submission within 24 hours

#### 3.4 Submit
- **Screen**: Submission Builder
- **Auto**: Generate submission package (formatted resume + summary), draft email
- **Confirm**: Review and send to client
- **Auto**: Log submission, schedule follow-up (48 hours), notify candidate

#### 3.5 Follow Up
- **Screen**: Submission Tracker
- **Auto**: Surface in inbox when follow-up due, show submission history
- **Human**: ★ CALL/EMAIL - Follow up with client
- **Confirm**: Log feedback (interview requested/reject/more info needed)
- **SLA**: No submission without follow-up > 72 hours

#### 3.6 Schedule Interview
- **Screen**: Interview Scheduler (calendar integration)
- **Auto**: Find mutual availability, send calendar invites, send prep materials
- **Human**: Coordinate if complex (multiple rounds, panel)
- **Confirm**: Interview scheduled and confirmed

#### 3.7 Prep Candidate
- **Screen**: Interview Prep Checklist
- **Auto**: Generate company brief, interviewer profiles, common questions
- **Human**: ★ CALL - Prep call with candidate (15 min)
- **Confirm**: Candidate prepared, knows what to expect
- **SLA**: Prep call minimum 24 hours before interview

#### 3.8 Interview
- **External**: Interview happens (client conducts)
- **Auto**: Send reminder day before, create feedback collection task
- **Human**: Be available for questions

#### 3.9 Collect Feedback
- **Screen**: Feedback Form (split view: candidate + feedback entry)
- **Human**: ★ CALL - Get feedback from client (same day)
- **Human**: ★ CALL - Debrief with candidate
- **Confirm**: Log feedback, determine next steps
- **Gate**: Proceed to offer / Reject / More interviews
- **SLA**: Feedback within 24 hours of interview

#### 3.10 Offer
- **Screen**: Offer Builder
- **Auto**: Generate offer letter from template, calculate margins
- **Human**: Negotiate terms if counter
- **Gate**: Rate approval if outside band
- **Confirm**: Send offer
- **Gate**: Offer accepted / rejected / counter

#### 3.11 Close
- **Screen**: Placement Setup Wizard
- **Auto**: Create placement record, trigger onboarding workflow
- **Auto**: Notify operations, send welcome packet, update job status
- **Output**: Placement created, onboarding workflow started

---

## Funnel 4: Account Acquisition (Win New Clients)

### Purpose
Convert prospects into active client accounts.

### Stages

#### 4.1 Prospect
- **Screen**: Prospecting Dashboard
- **Auto**: Enrich company data, find contacts via LinkedIn/ZoomInfo
- **Human**: Research company, identify decision makers, add to target list

#### 4.2 Outreach
- **Screen**: Outreach Sequence Builder
- **Auto**: Send sequence emails, track engagement (opens, clicks, replies)
- **Human**: ★ CALL - Cold/warm calls to prospects
- **Confirm**: Log outcome (meeting booked / not interested / callback)
- **SLA**: 5 touches before marking cold

#### 4.3 Discovery
- **Screen**: Meeting Prep (company intel, talking points, pain point questions)
- **Human**: ★ MEETING - Discovery meeting (30-60 min)
- **Confirm**: Log needs, pain points, timeline, budget signals
- **Gate**: Qualified opportunity / Not a fit

#### 4.4 Proposal
- **Screen**: Deal Builder (from discovery notes)
- **Auto**: Generate proposal from template, calculate pricing
- **Human**: Customize proposal, add case studies
- **Gate**: Internal approval if deal > $X or non-standard terms
- **Confirm**: Send proposal

#### 4.5 Negotiate
- **Screen**: Deal Tracker (proposal + communication history)
- **Human**: ★ CALL - Handle objections, negotiate terms
- **Confirm**: Log updates, next steps
- **Gate**: Verbal yes / No / More negotiation

#### 4.6 Contract
- **Screen**: Contract Builder
- **Auto**: Generate MSA/SOW from template, route for legal review if non-standard
- **Auto**: Send via DocuSign
- **Gate**: Contract signed by authorized signatory

#### 4.7 Onboard Account
- **Screen**: Account Onboarding Wizard
- **Auto**: Create account record, assign team, set up billing
- **Auto**: Trigger welcome workflow, schedule kickoff
- **Human**: ★ CALL - Kickoff meeting
- **Output**: Account active, ready to receive jobs

---

## Funnel 5: Bench Sales (Sell Available Consultants)

### Purpose
Place bench consultants with clients/vendors to minimize bench time and cost.

### Stages

#### 5.1 Identify Bench
- **Screen**: Bench Dashboard (consultants on bench, days on bench, burn rate)
- **Auto**: Track days on bench, calculate burn, alert at 30/60/90 days
- **Human**: Prioritize marketing efforts based on skills, marketability

#### 5.2 Market Consultant
- **Screen**: Consultant Marketing Profile
- **Auto**: Generate marketing profile from candidate data, format resume
- **Human**: Polish profile, identify target companies/vendors

#### 5.3 Outreach
- **Screen**: Vendor Outreach (email/call in context)
- **Auto**: Send marketing emails to vendor list, track responses
- **Human**: ★ CALL - Follow up calls to vendors
- **Confirm**: Log responses (requirement received / not now / no fit)

#### 5.4 Submit
- **Screen**: Submission Builder
- **Auto**: Match consultant to requirement, generate submission
- **Confirm**: Submit to vendor
- **Auto**: Log submission, schedule follow-up

#### 5.5 Interview Loop
- Same as Job Fulfillment stages 3.5-3.9

#### 5.6 Negotiate Rate
- **Screen**: Rate Negotiation (margin calculator, rate history)
- **Human**: ★ CALL - Negotiate bill rate with vendor
- **Gate**: Margin acceptable (minimum margin threshold)

#### 5.7 Place
- **Screen**: Placement Setup
- **Auto**: Create placement, end bench status, update metrics
- **Output**: Consultant placed, off bench

---

## Funnel 6: Delivery Management (Ensure Success)

### Purpose
Ensure placement success, handle issues, and maximize engagement duration.

### Stages

#### 6.1 Onboard Placement
- **Screen**: Placement Onboarding Checklist
- **Auto**: Create checklist from template, schedule check-ins
- **Human**: Ensure all paperwork complete (I-9, background, equipment)
- **Human**: ★ CALL - Day 1 check-in with consultant
- **Human**: ★ CALL - Week 1 check-in with client
- **Gate**: Onboarding complete (all items checked)
- **SLA**: Onboarding complete within 5 business days

#### 6.2 Ongoing Management
- **Screen**: Placement Dashboard
- **Auto**: Schedule recurring check-ins (bi-weekly), track timesheets, flag exceptions
- **Human**: ★ CALL - Regular check-ins (bi-weekly minimum)
- **Confirm**: Log status (green/yellow/red), capture feedback

#### 6.3 Issue Handling
- **Screen**: Issue Tracker
- **Auto**: Create issue from escalation, assign owner, start SLA
- **Human**: ★ CALL - Investigate with consultant and client
- **Human**: Mediate, propose resolution
- **Confirm**: Log resolution, lessons learned
- **Gate**: Issue resolved (client and consultant satisfied)
- **SLA**: Response within 4 hours, resolution within 48 hours

#### 6.4 Extension/Renewal
- **Screen**: Renewal Dashboard (placements ending in 30/60/90 days)
- **Auto**: Alert 60 days before end, create renewal task
- **Human**: ★ CALL - Discuss extension with client
- **Confirm**: Extension confirmed / End date confirmed
- **Gate**: Extension agreement signed (if extending)

#### 6.5 Offboard
- **Screen**: Offboarding Checklist
- **Auto**: Create checklist (final timesheet, equipment return, exit interview)
- **Human**: ★ CALL - Exit interview with consultant
- **Human**: ★ CALL - Feedback call with client
- **Gate**: Offboarding complete (all items checked)
- **Output**: Placement ended, consultant returns to pool (if applicable)

---

## Funnel 7: Operations (Timesheets, Payroll, Compliance)

### Purpose
Process timesheets, run payroll, generate invoices, maintain compliance.

### Weekly Cycle

#### 7.1 Timesheet Collection
- **Screen**: Timesheet Dashboard
- **Auto**: Send reminder to consultants (Friday 3pm)
- **Auto**: Send escalation if not submitted (Monday 10am)
- **Human**: ★ CALL - Chase non-submitters
- **Gate**: All timesheets submitted
- **SLA**: 100% submitted by Monday noon

#### 7.2 Timesheet Review
- **Screen**: Timesheet Review Queue
- **Auto**: Flag exceptions (overtime, unusual hours, missing codes)
- **Human**: Review exceptions only (not every timesheet)
- **Confirm**: Approve / Reject / Request correction
- **Gate**: All timesheets reviewed
- **SLA**: Review complete by Monday EOD

#### 7.3 Client Approval
- **Screen**: Client Approval Tracker
- **Auto**: Send timesheets to clients for approval
- **Auto**: Send reminder if not approved (24 hours)
- **Human**: ★ CALL - Follow up on stuck approvals
- **Gate**: Client approval received
- **SLA**: Client approval by Tuesday EOD

#### 7.4 Payroll Processing
- **Screen**: Payroll Run
- **Auto**: Calculate pay from approved timesheets, apply deductions/taxes
- **Human**: Review summary, spot check calculations
- **Confirm**: Approve payroll run
- **Gate**: Manager approval (if total > threshold)
- **Auto**: Send to Gusto, generate pay stubs
- **SLA**: Payroll processed by Wednesday

#### 7.5 Invoicing
- **Screen**: Invoice Generation
- **Auto**: Generate invoices from approved timesheets
- **Human**: Review, add adjustments/credits if needed
- **Confirm**: Approve and send invoices
- **Auto**: Track payment status, send reminders at 30/60/90 days
- **SLA**: Invoices sent by Thursday

#### 7.6 Compliance Tracking
- **Screen**: Compliance Dashboard
- **Auto**: Track expiring documents (I-9, certifications, insurance, etc.)
- **Auto**: Alert 30/60/90 days before expiration
- **Human**: ★ CALL/EMAIL - Request updated documents
- **Gate**: Document received and verified
- **SLA**: No expired compliance items

---

## Call Points Summary

These are the moments where human conversation is required:

| Call Type | Funnel | Duration | System Support |
|-----------|--------|----------|----------------|
| Screening call | Recruiting | 15-30 min | Questions, scoring rubric |
| Job intake call | Job Fulfillment | 30 min | Requirements template |
| Submission follow-up | Job Fulfillment | 5-10 min | Submission history |
| Candidate prep call | Job Fulfillment | 15 min | Company brief, tips |
| Feedback collection | Job Fulfillment | 10 min | Feedback form |
| Offer negotiation | Job Fulfillment | Variable | History, calculator |
| Discovery meeting | Account Acquisition | 30-60 min | Intel, questions |
| Vendor outreach | Bench Sales | 5-10 min | Consultant profile |
| Rate negotiation | Bench Sales | Variable | Margin calculator |
| Check-in call | Delivery | 15 min | Status history |
| Issue resolution | Delivery | Variable | Full context |
| Renewal discussion | Delivery | 15 min | Contract terms |
| Timesheet chase | Operations | 5 min | Outstanding list |

---

## Gatekeeping Points

Actions that require approval before proceeding:

| Gate | Approver | Criteria |
|------|----------|----------|
| Academy admission | Academy Manager | Application review |
| Job approved to work | Recruiting Manager | Requirements complete |
| Submission (first time client) | Account Manager | Relationship check |
| Offer outside rate band | Manager | Margin protection |
| Deal > $100K | Sales Director | Large deal review |
| Non-standard contract terms | Legal | Risk assessment |
| Contract signature | Authorized signatory | Authority level |
| Margin below threshold | Finance | Profitability |
| Compliance waiver | Compliance Officer | Risk acceptance |
| Large payroll run | Finance Manager | Fraud prevention |

---

## SLA Summary

| Activity | SLA | Escalation |
|----------|-----|------------|
| Job acknowledgment | 1 hour | Recruiting Manager |
| First submission | 24 hours | Account Manager |
| Submission follow-up | 48-72 hours | Recruiter reminder |
| Interview feedback | 24 hours | Account Manager |
| Candidate prep call | 24 hours before | Recruiter alert |
| Issue response | 4 hours | Delivery Manager |
| Issue resolution | 48 hours | Account Manager |
| Timesheet submission | Monday noon | Operations Manager |
| Timesheet review | Monday EOD | Operations Manager |
| Client approval | Tuesday EOD | Account Manager |
| Payroll processing | Wednesday | Finance Manager |
| Invoice generation | Thursday | Finance Manager |
