# Event Type Catalog

**Version:** 1.0
**Last Updated:** 2025-11-30
**Status:** Canonical Reference
**Related:** 01-ACTIVITIES-EVENTS-FRAMEWORK.md

---

## Table of Contents

1. [Event Naming Convention](#1-event-naming-convention)
2. [Event Categories](#2-event-categories)
3. [Candidate Events](#3-candidate-events)
4. [Job Events](#4-job-events)
5. [Submission Events](#5-submission-events)
6. [Interview Events](#6-interview-events)
7. [Offer Events](#7-offer-events)
8. [Placement Events](#8-placement-events)
9. [Account Events](#9-account-events)
10. [Contact Events](#10-contact-events)
11. [Lead Events](#11-lead-events)
12. [Deal Events](#12-deal-events)
13. [Activity Events](#13-activity-events)
14. [User Events](#14-user-events)
15. [System Events](#15-system-events)
16. [Integration Events](#16-integration-events)
17. [Security Events](#17-security-events)
18. [Notification Events](#18-notification-events)
19. [Bench Sales Events](#19-bench-sales-events)
20. [Immigration Events](#20-immigration-events)

---

## 1. Event Naming Convention

All events follow a consistent naming pattern:

```
Format: {entity}.{action}[.{qualifier}]

Examples:
- candidate.created
- candidate.status_changed
- candidate.submitted.to_client
- job.sla_breach.first_submission
- placement.milestone.30_day_review
```

### Naming Rules

1. **Entity**: Lowercase singular noun (candidate, job, submission, account, etc.)
2. **Action**: Lowercase verb in past tense (created, updated, deleted, etc.)
3. **Qualifier**: Optional context for specificity (to_client, first_submission, etc.)
4. **Separators**: Use underscores within words, dots between components

---

## 2. Event Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **entity** | CRUD operations on entities | created, updated, deleted, merged |
| **workflow** | State/status transitions | status_changed, stage_changed, approved, rejected |
| **system** | System-triggered events | stale, sla_warning, sla_breach, milestone |
| **integration** | External system events | sync_completed, sync_failed, import_completed |
| **security** | Auth and permission events | login, logout, permission_changed, access_denied |
| **notification** | Notification delivery events | email_sent, sms_sent, push_sent |

---

## 3. Candidate Events

### 3.1 Entity Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `candidate.created` | entity | info | New candidate profile created |
| `candidate.updated` | entity | info | Candidate profile updated |
| `candidate.deleted` | entity | warning | Candidate deleted (soft delete) |
| `candidate.merged` | entity | info | Multiple candidate profiles merged |
| `candidate.imported` | entity | info | Candidate imported from external source |
| `candidate.exported` | entity | info | Candidate data exported |

**Event Data Schema (candidate.created):**
```json
{
  "candidate_id": "uuid",
  "candidate_name": "string",
  "email": "string",
  "phone": "string",
  "source": "string",
  "owner_id": "uuid",
  "owner_name": "string",
  "status": "string"
}
```

**Triggers:** User creates candidate via UI, API import, LinkedIn scrape
**Auto-Activities:** CAND_NEW_INTRO_CALL (Introduction call due in 4 hours)
**Notifications:** Owner (in-app), Manager (daily digest)

---

### 3.2 Workflow Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `candidate.status_changed` | workflow | info | Candidate status updated |
| `candidate.owner_changed` | workflow | info | Candidate ownership transferred |
| `candidate.sourced` | workflow | info | Candidate sourced from platform (LinkedIn, etc.) |
| `candidate.contacted` | workflow | info | First contact made with candidate |
| `candidate.qualified` | workflow | info | Candidate marked as qualified for roles |
| `candidate.submitted` | workflow | info | Candidate submitted to a job |
| `candidate.interviewed` | workflow | info | Candidate completed interview |
| `candidate.offered` | workflow | info | Offer extended to candidate |
| `candidate.placed` | workflow | info | Candidate placement started |
| `candidate.rejected` | workflow | info | Candidate rejected from pipeline |
| `candidate.reactivated` | workflow | info | Inactive candidate reactivated |
| `candidate.marked_do_not_contact` | workflow | warning | Candidate requested no contact |
| `candidate.marked_blacklisted` | workflow | warning | Candidate blacklisted (compliance issue) |

**Event Data Schema (candidate.status_changed):**
```json
{
  "candidate_id": "uuid",
  "candidate_name": "string",
  "old_status": "string",
  "new_status": "string",
  "changed_by_id": "uuid",
  "changed_by_name": "string",
  "reason": "string"
}
```

**Triggers:** Manual status update, automated workflow transition
**Auto-Activities:** Varies by new status (e.g., qualified -> CAND_SUBMIT_SEARCH)
**Notifications:** Owner, RACI Informed parties

---

### 3.3 System Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `candidate.stale` | system | warning | No activity for 7+ days |
| `candidate.duplicate_detected` | system | warning | Potential duplicate profile found |
| `candidate.profile_incomplete` | system | info | Missing required profile fields |
| `candidate.resume_missing` | system | warning | No resume uploaded |
| `candidate.resume_updated` | system | info | New resume version uploaded |
| `candidate.skill_match_found` | system | info | Candidate matched to new job |
| `candidate.sla_warning.first_contact` | system | warning | No contact within 4 hours |
| `candidate.sla_breach.first_contact` | system | error | No contact within 24 hours |
| `candidate.birthday` | system | info | Candidate birthday (engagement opportunity) |
| `candidate.work_anniversary` | system | info | Work anniversary at current placement |

**Event Data Schema (candidate.stale):**
```json
{
  "candidate_id": "uuid",
  "candidate_name": "string",
  "days_since_activity": "number",
  "last_activity_type": "string",
  "last_activity_date": "timestamp",
  "owner_id": "uuid",
  "owner_name": "string"
}
```

**Triggers:** Daily system job checks activity timestamps
**Auto-Activities:** CAND_STALE_FOLLOWUP (Follow-up call immediately)
**Notifications:** Owner (email), Manager (daily report)

---

### 3.4 Document Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `candidate.resume.uploaded` | entity | info | Resume uploaded |
| `candidate.resume.parsed` | system | info | Resume AI parsing completed |
| `candidate.resume.version_created` | entity | info | New resume version created |
| `candidate.document.uploaded` | entity | info | Supporting document uploaded |
| `candidate.certification.added` | entity | info | Certification added to profile |
| `candidate.certification.expiring` | system | warning | Certification expiring in 30 days |
| `candidate.certification.expired` | system | error | Certification expired |

---

### 3.5 Compliance Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `candidate.i9.section1_completed` | workflow | info | I-9 Section 1 completed |
| `candidate.i9.section2_completed` | workflow | info | I-9 Section 2 completed |
| `candidate.i9.reverification_required` | system | warning | I-9 reverification needed |
| `candidate.work_auth.updated` | entity | info | Work authorization updated |
| `candidate.work_auth.expiring` | system | warning | Work auth expiring in 90 days |
| `candidate.work_auth.expired` | system | error | Work authorization expired |
| `candidate.background_check.initiated` | workflow | info | Background check started |
| `candidate.background_check.completed` | workflow | info | Background check completed |
| `candidate.background_check.adverse_action` | workflow | critical | Adverse findings requiring action |

---

## 4. Job Events

### 4.1 Entity Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `job.created` | entity | info | New job requisition created |
| `job.updated` | entity | info | Job details updated |
| `job.deleted` | entity | warning | Job deleted |
| `job.cloned` | entity | info | Job cloned from existing |
| `job.requirements_changed` | entity | info | Job requirements modified |

**Event Data Schema (job.created):**
```json
{
  "job_id": "uuid",
  "job_title": "string",
  "account_id": "uuid",
  "account_name": "string",
  "owner_id": "uuid",
  "owner_name": "string",
  "rate_min": "number",
  "rate_max": "number",
  "positions_count": "number",
  "urgency": "string",
  "required_skills": ["string"],
  "target_start_date": "date"
}
```

**Triggers:** User creates job, job imported from client
**Auto-Activities:** JOB_NEW_KICKOFF (Kickoff meeting with hiring manager)
**Notifications:** Owner, Recruiting team, Client (if configured)

---

### 4.2 Workflow Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `job.published` | workflow | info | Job activated and published |
| `job.paused` | workflow | info | Job paused/put on hold |
| `job.closed` | workflow | info | Job closed (not filled) |
| `job.filled` | workflow | info | All positions filled |
| `job.partially_filled` | workflow | info | Some positions filled |
| `job.extended` | workflow | info | Job timeline extended |
| `job.owner_changed` | workflow | info | Job ownership transferred |
| `job.priority_changed` | workflow | info | Job priority/urgency changed |
| `job.budget_changed` | workflow | info | Rate range updated |
| `job.reopened` | workflow | info | Closed job reopened |

---

### 4.3 System Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `job.no_submissions` | system | warning | No submissions in 5 days |
| `job.stale` | system | warning | No activity in 14 days |
| `job.sla_warning.first_submission` | system | warning | 72 hours without submission |
| `job.sla_breach.first_submission` | system | error | 120 hours without submission |
| `job.target_fill_date_approaching` | system | warning | Fill date in 7 days |
| `job.target_fill_date_passed` | system | error | Past target fill date |
| `job.candidate_match_found` | system | info | AI matched candidate to job |
| `job.submission_rate_low` | system | warning | Below expected submission rate |
| `job.interview_to_offer_ratio_low` | system | warning | Low conversion rate |

**Event Data Schema (job.sla_breach.first_submission):**
```json
{
  "job_id": "uuid",
  "job_title": "string",
  "account_name": "string",
  "owner_id": "uuid",
  "owner_name": "string",
  "hours_since_published": "number",
  "sla_threshold": "number",
  "urgency": "string"
}
```

**Triggers:** Scheduled job runs every hour, checks SLA metrics
**Auto-Activities:** JOB_URGENT_SOURCING (Escalate sourcing efforts)
**Notifications:** Owner (email + SMS), Manager (email), COO (critical only)

---

## 5. Submission Events

### 5.1 Entity Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `submission.created` | entity | info | New submission created |
| `submission.updated` | entity | info | Submission details updated |
| `submission.deleted` | entity | warning | Submission deleted |
| `submission.rate_changed` | entity | info | Bill/pay rate modified |

---

### 5.2 Workflow Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `submission.sent_to_client` | workflow | info | Submitted to client for review |
| `submission.approved` | workflow | info | Client approved submission |
| `submission.rejected` | workflow | info | Client rejected submission |
| `submission.withdrawn` | workflow | info | Recruiter withdrew submission |
| `submission.interview_requested` | workflow | info | Client requested interview |
| `submission.offer_pending` | workflow | info | Offer being prepared |
| `submission.vendor_screening_started` | workflow | info | Internal screening started |
| `submission.vendor_approved` | workflow | info | Internal approval received |
| `submission.vendor_rejected` | workflow | warning | Internal rejection |

**Event Data Schema (submission.sent_to_client):**
```json
{
  "submission_id": "uuid",
  "candidate_id": "uuid",
  "candidate_name": "string",
  "job_id": "uuid",
  "job_title": "string",
  "account_id": "uuid",
  "account_name": "string",
  "submitted_by_id": "uuid",
  "submitted_by_name": "string",
  "bill_rate": "number",
  "pay_rate": "number",
  "markup_percentage": "number"
}
```

**Triggers:** User action after internal approval
**Auto-Activities:** SUB_CLIENT_FOLLOWUP (Follow up in 48 hours)
**Notifications:** Owner, Manager, Client contact (external email)

---

### 5.3 System Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `submission.sla_warning.client_response` | system | warning | No client response in 24 hours |
| `submission.sla_breach.client_response` | system | error | No client response in 48 hours |
| `submission.stale` | system | warning | Stuck in status for 5+ days |
| `submission.duplicate_detected` | system | warning | Same candidate to same job exists |

---

## 6. Interview Events

### 6.1 Workflow Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `interview.scheduled` | workflow | info | Interview scheduled with client |
| `interview.rescheduled` | workflow | info | Interview date/time changed |
| `interview.cancelled` | workflow | warning | Interview cancelled |
| `interview.cancelled.candidate` | workflow | warning | Cancelled by candidate |
| `interview.cancelled.client` | workflow | warning | Cancelled by client |
| `interview.completed` | workflow | info | Interview finished |
| `interview.no_show.candidate` | workflow | error | Candidate didn't attend |
| `interview.no_show.client` | workflow | warning | Client didn't attend |
| `interview.feedback_submitted` | workflow | info | Interview feedback recorded |
| `interview.next_round_scheduled` | workflow | info | Advanced to next round |

**Event Data Schema (interview.scheduled):**
```json
{
  "interview_id": "uuid",
  "submission_id": "uuid",
  "candidate_id": "uuid",
  "candidate_name": "string",
  "job_id": "uuid",
  "job_title": "string",
  "scheduled_at": "timestamp",
  "duration_minutes": "number",
  "round_number": "number",
  "interview_type": "string",
  "interviewer_names": ["string"],
  "meeting_link": "string",
  "scheduled_by_id": "uuid"
}
```

**Triggers:** User schedules interview, calendar integration sync
**Auto-Activities:**
- CAND_INTERVIEW_PREP (24 hours before)
- CAND_INTERVIEW_DEBRIEF (2 hours after)
**Notifications:** Candidate (email + SMS), Interviewer (calendar invite), Owner (in-app)

---

### 6.2 System Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `interview.reminder_sent.24h` | system | info | 24-hour reminder sent |
| `interview.reminder_sent.1h` | system | info | 1-hour reminder sent |
| `interview.feedback_pending` | system | warning | Feedback not submitted 24h after |
| `interview.starting_soon` | system | info | Interview in 15 minutes |

---

## 7. Offer Events

### 7.1 Workflow Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `offer.created` | entity | info | Offer record created |
| `offer.sent` | workflow | info | Offer sent to candidate |
| `offer.viewed` | workflow | info | Candidate viewed offer |
| `offer.accepted` | workflow | info | Candidate accepted offer |
| `offer.declined` | workflow | warning | Candidate declined offer |
| `offer.countered` | workflow | info | Candidate submitted counter-offer |
| `offer.counter_accepted` | workflow | info | Counter-offer accepted |
| `offer.counter_rejected` | workflow | warning | Counter-offer rejected |
| `offer.withdrawn` | workflow | warning | Offer withdrawn by company |
| `offer.expired` | workflow | warning | Offer expired (no response) |
| `offer.extended` | workflow | info | Offer deadline extended |

**Event Data Schema (offer.sent):**
```json
{
  "offer_id": "uuid",
  "candidate_id": "uuid",
  "candidate_name": "string",
  "job_id": "uuid",
  "job_title": "string",
  "offer_type": "string",
  "rate": "number",
  "rate_type": "string",
  "start_date": "date",
  "expires_at": "timestamp",
  "sent_by_id": "uuid"
}
```

**Triggers:** User sends offer, DocuSign integration
**Auto-Activities:** OFFER_FOLLOWUP (Follow up in 48 hours)
**Notifications:** Candidate (email with offer letter), Owner, Manager

---

### 7.2 System Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `offer.expiring_soon` | system | warning | Offer expires in 24 hours |
| `offer.no_response` | system | warning | No response in 72 hours |

---

## 8. Placement Events

### 8.1 Workflow Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `placement.created` | entity | info | Placement record created |
| `placement.started` | workflow | info | Consultant started work |
| `placement.extended` | workflow | info | Placement contract extended |
| `placement.ended` | workflow | info | Placement ended normally |
| `placement.terminated` | workflow | critical | Placement terminated early |
| `placement.terminated.performance` | workflow | critical | Terminated for performance |
| `placement.terminated.client_request` | workflow | warning | Client requested termination |
| `placement.terminated.consultant_resigned` | workflow | warning | Consultant resigned |
| `placement.rate_changed` | workflow | info | Bill/pay rate adjusted |
| `placement.onboarding_started` | workflow | info | Onboarding process initiated |
| `placement.onboarding_completed` | workflow | info | Onboarding finished |

**Event Data Schema (placement.started):**
```json
{
  "placement_id": "uuid",
  "candidate_id": "uuid",
  "candidate_name": "string",
  "job_id": "uuid",
  "job_title": "string",
  "account_id": "uuid",
  "account_name": "string",
  "start_date": "date",
  "end_date": "date",
  "bill_rate": "number",
  "pay_rate": "number",
  "recruiter_id": "uuid",
  "recruiter_name": "string"
}
```

**Triggers:** Start date reached, manual activation
**Auto-Activities:**
- PLACE_DAY1_CLIENT (Day 1 check-in with client)
- PLACE_DAY1_CONSULTANT (Day 1 check-in with consultant)
- PLACE_30DAY_REVIEW (30-day review in 30 days)
**Notifications:** Consultant, Client, Recruiter, Accounting

---

### 8.2 System Events - Milestones

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `placement.milestone.day_1` | system | info | First day milestone |
| `placement.milestone.week_1` | system | info | Week 1 milestone |
| `placement.milestone.30_day` | system | info | 30-day review due |
| `placement.milestone.60_day` | system | info | 60-day review due |
| `placement.milestone.90_day` | system | info | 90-day review due |
| `placement.milestone.6_month` | system | info | 6-month anniversary |
| `placement.milestone.1_year` | system | info | 1-year anniversary |

---

### 8.3 System Events - SLA & Alerts

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `placement.start_approaching` | system | info | Start date in 3 days |
| `placement.end_approaching` | system | warning | End date in 30 days |
| `placement.end_imminent` | system | error | End date in 7 days |
| `placement.timesheet_missing` | system | warning | Weekly timesheet not submitted |
| `placement.timesheet_submitted` | workflow | info | Timesheet submitted |
| `placement.timesheet_approved` | workflow | info | Timesheet approved |
| `placement.timesheet_rejected` | workflow | warning | Timesheet rejected |
| `placement.invoice_generated` | system | info | Invoice auto-generated |
| `placement.payment_received` | workflow | info | Payment received from client |
| `placement.performance_issue` | workflow | critical | Performance issue reported |

---

## 9. Account Events

### 9.1 Entity Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `account.created` | entity | info | New account created |
| `account.updated` | entity | info | Account details updated |
| `account.deleted` | entity | warning | Account deleted |
| `account.merged` | entity | info | Accounts merged |

**Event Data Schema (account.created):**
```json
{
  "account_id": "uuid",
  "account_name": "string",
  "industry": "string",
  "tier": "string",
  "status": "string",
  "account_manager_id": "uuid",
  "account_manager_name": "string",
  "created_by_id": "uuid"
}
```

**Triggers:** User creates account, lead conversion
**Auto-Activities:** ACCT_NEW_WELCOME (Welcome email in 4 hours)
**Notifications:** Account Manager, Sales team

---

### 9.2 Workflow Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `account.status_changed` | workflow | info | Account status updated |
| `account.tier_changed` | workflow | info | Account tier changed |
| `account.owner_changed` | workflow | info | Account manager changed |
| `account.contract_signed` | workflow | info | MSA/contract executed |
| `account.contract_renewed` | workflow | info | Contract renewed |
| `account.upgraded` | workflow | info | Account upgraded to higher tier |
| `account.downgraded` | workflow | warning | Account downgraded |
| `account.churned` | workflow | critical | Account churned/lost |
| `account.won_back` | workflow | info | Churned account reactivated |

---

### 9.3 System Events - Health & Engagement

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `account.health_score_changed` | workflow | info | Health score updated |
| `account.health_score_dropped` | system | warning | Significant health score drop |
| `account.health_score_critical` | system | critical | Health score below 30 |
| `account.no_activity` | system | warning | No activity in 30 days |
| `account.no_jobs_60_days` | system | warning | No new jobs in 60 days |
| `account.no_placements_90_days` | system | error | No placements in 90 days |
| `account.engagement_declining` | system | warning | Decreasing engagement metrics |
| `account.at_risk` | system | critical | Account at risk of churn |

---

### 9.4 System Events - Business Milestones

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `account.contract_expiring` | system | warning | Contract expires in 90 days |
| `account.contract_expired` | system | error | Contract expired |
| `account.quarter_ended` | system | info | Quarterly business review due |
| `account.revenue_milestone` | system | info | Revenue milestone achieved |
| `account.placement_milestone` | system | info | Placement count milestone |
| `account.anniversary` | system | info | Account anniversary |

**Event Data Schema (account.contract_expiring):**
```json
{
  "account_id": "uuid",
  "account_name": "string",
  "contract_end_date": "date",
  "days_until_expiry": "number",
  "account_manager_id": "uuid",
  "annual_revenue": "number",
  "active_placements": "number"
}
```

**Triggers:** Daily job checks contract end dates
**Auto-Activities:** ACCT_CONTRACT_RENEWAL (Renewal discussion)
**Notifications:** Account Manager (email), VP Sales (weekly report)

---

## 10. Contact Events

### 10.1 Entity Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `contact.created` | entity | info | Point of contact added |
| `contact.updated` | entity | info | Contact details updated |
| `contact.deleted` | entity | warning | Contact removed |
| `contact.merged` | entity | info | Duplicate contacts merged |
| `contact.primary_changed` | workflow | info | Primary contact designation changed |
| `contact.deactivated` | workflow | info | Contact marked inactive |

---

## 11. Lead Events

### 11.1 Entity Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `lead.created` | entity | info | New lead created |
| `lead.updated` | entity | info | Lead details updated |
| `lead.deleted` | entity | warning | Lead deleted |
| `lead.imported` | entity | info | Lead imported from source |

**Event Data Schema (lead.created):**
```json
{
  "lead_id": "uuid",
  "lead_type": "string",
  "company_name": "string",
  "contact_name": "string",
  "email": "string",
  "source": "string",
  "owner_id": "uuid",
  "owner_name": "string",
  "status": "string",
  "estimated_value": "number"
}
```

**Triggers:** User creates lead, form submission, import
**Auto-Activities:** LEAD_NEW_QUALIFY (Qualification call in 24 hours)
**Notifications:** Owner, Sales Manager

---

### 11.2 Workflow Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `lead.qualified` | workflow | info | Lead qualified via BANT |
| `lead.disqualified` | workflow | info | Lead disqualified |
| `lead.status_changed` | workflow | info | Lead status updated (warm/hot/cold) |
| `lead.converted` | workflow | info | Lead converted to deal |
| `lead.converted.to_account` | workflow | info | Lead converted to account |
| `lead.owner_changed` | workflow | info | Lead ownership transferred |
| `lead.marked_warm` | workflow | info | Lead interest level increased |
| `lead.marked_hot` | workflow | info | Lead marked hot (ready to buy) |
| `lead.marked_cold` | workflow | warning | Lead interest dropped |

---

### 11.3 System Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `lead.stale` | system | warning | No activity in 7 days |
| `lead.engagement_high` | system | info | High engagement detected |
| `lead.engagement_low` | system | warning | Low engagement detected |
| `lead.duplicate_detected` | system | warning | Potential duplicate found |
| `lead.score_changed` | system | info | Lead scoring updated |
| `lead.nurture_ready` | system | info | Ready for nurture campaign |

---

## 12. Deal Events

### 12.1 Entity Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `deal.created` | entity | info | New deal created |
| `deal.updated` | entity | info | Deal details updated |
| `deal.deleted` | entity | warning | Deal deleted |
| `deal.value_changed` | entity | info | Deal value updated |

**Event Data Schema (deal.created):**
```json
{
  "deal_id": "uuid",
  "deal_title": "string",
  "account_id": "uuid",
  "account_name": "string",
  "value": "number",
  "stage": "string",
  "probability": "number",
  "expected_close_date": "date",
  "owner_id": "uuid",
  "owner_name": "string"
}
```

**Triggers:** User creates deal, lead conversion
**Auto-Activities:** DEAL_CREATED_PROPOSAL (Prepare proposal)
**Notifications:** Owner, Sales Manager

---

### 12.2 Workflow Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `deal.stage_changed` | workflow | info | Deal moved to new stage |
| `deal.stage_advanced` | workflow | info | Deal progressed forward |
| `deal.stage_regressed` | workflow | warning | Deal moved backward |
| `deal.probability_changed` | workflow | info | Win probability updated |
| `deal.won` | workflow | info | Deal won/closed |
| `deal.lost` | workflow | warning | Deal lost |
| `deal.proposal_sent` | workflow | info | Proposal sent to client |
| `deal.proposal_viewed` | workflow | info | Client viewed proposal |
| `deal.contract_sent` | workflow | info | Contract sent for signature |
| `deal.contract_signed` | workflow | info | Contract executed |
| `deal.owner_changed` | workflow | info | Deal ownership transferred |

---

### 12.3 System Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `deal.stale` | system | warning | Stuck in stage 7+ days |
| `deal.stale.critical` | system | error | Stuck in stage 30+ days |
| `deal.close_date_approaching` | system | info | Expected close in 7 days |
| `deal.close_date_passed` | system | warning | Past expected close date |
| `deal.no_activity` | system | warning | No activity in 14 days |
| `deal.engagement_required` | system | warning | Requires immediate attention |

---

## 13. Activity Events

### 13.1 Workflow Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `activity.created` | entity | info | New activity logged |
| `activity.updated` | entity | info | Activity details updated |
| `activity.started` | workflow | info | Activity marked in progress |
| `activity.completed` | workflow | info | Activity completed |
| `activity.cancelled` | workflow | info | Activity cancelled |
| `activity.deferred` | workflow | info | Activity postponed |
| `activity.reassigned` | workflow | info | Activity reassigned |
| `activity.due_date_changed` | workflow | info | Due date modified |

**Event Data Schema (activity.completed):**
```json
{
  "activity_id": "uuid",
  "activity_type": "string",
  "subject": "string",
  "assigned_to_id": "uuid",
  "assigned_to_name": "string",
  "completed_at": "timestamp",
  "duration_minutes": "number",
  "outcome": "string",
  "related_entity_type": "string",
  "related_entity_id": "uuid"
}
```

**Triggers:** User completes activity
**Auto-Activities:** May trigger follow-up based on outcome
**Notifications:** RACI Informed parties

---

### 13.2 System Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `activity.due_soon` | system | warning | Due in 1 hour |
| `activity.overdue` | system | error | Past due date |
| `activity.overdue.24h` | system | error | 24 hours overdue |
| `activity.overdue.48h` | system | critical | 48 hours overdue |
| `activity.auto_created` | system | info | Created by activity pattern |
| `activity.sla_warning` | system | warning | SLA warning threshold |
| `activity.sla_breach` | system | error | SLA breached |

---

## 14. User Events

### 14.1 Profile Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `user.created` | entity | info | New user account created |
| `user.updated` | entity | info | User profile updated |
| `user.deleted` | entity | warning | User account deleted |
| `user.activated` | workflow | info | User account activated |
| `user.deactivated` | workflow | warning | User account deactivated |
| `user.suspended` | workflow | critical | User account suspended |
| `user.role_changed` | workflow | warning | User role modified |
| `user.department_changed` | workflow | info | Department transfer |
| `user.pod_assigned` | workflow | info | Assigned to pod/team |
| `user.pod_removed` | workflow | info | Removed from pod |

---

### 14.2 Authentication Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `user.login` | security | info | Successful login |
| `user.login_failed` | security | warning | Failed login attempt |
| `user.login_failed.multiple` | security | error | Multiple failed attempts |
| `user.logout` | security | info | User logged out |
| `user.session_expired` | security | info | Session timed out |
| `user.password_changed` | security | info | Password updated |
| `user.password_reset_requested` | security | info | Password reset initiated |
| `user.password_reset_completed` | security | info | Password reset completed |
| `user.mfa_enabled` | security | info | MFA activated |
| `user.mfa_disabled` | security | warning | MFA deactivated |
| `user.mfa_failed` | security | warning | MFA verification failed |

---

## 15. System Events

### 15.1 Data Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `system.backup_started` | system | info | Database backup initiated |
| `system.backup_completed` | system | info | Database backup completed |
| `system.backup_failed` | system | critical | Database backup failed |
| `system.data_export.started` | system | info | Data export initiated |
| `system.data_export.completed` | system | info | Data export ready |
| `system.data_import.started` | system | info | Data import initiated |
| `system.data_import.completed` | system | info | Data import completed |
| `system.data_import.failed` | system | error | Data import failed |
| `system.migration.started` | system | info | Database migration started |
| `system.migration.completed` | system | info | Database migration completed |

---

### 15.2 Job Events (Scheduled Tasks)

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `system.job.daily_digest.started` | system | info | Daily digest generation started |
| `system.job.daily_digest.completed` | system | info | Daily digest sent |
| `system.job.sla_check.completed` | system | info | SLA check completed |
| `system.job.stale_entities.completed` | system | info | Stale entity check completed |
| `system.job.cleanup.completed` | system | info | Data cleanup completed |
| `system.job.failed` | system | error | Scheduled job failed |

---

### 15.3 Performance Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `system.performance.slow_query` | system | warning | Query exceeded threshold |
| `system.performance.high_cpu` | system | warning | CPU usage high |
| `system.performance.high_memory` | system | warning | Memory usage high |
| `system.performance.database_slow` | system | error | Database performance degraded |
| `system.error.500` | system | error | Server error occurred |
| `system.error.429` | system | warning | Rate limit exceeded |

---

## 16. Integration Events

### 16.1 Sync Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `integration.sync.started` | integration | info | External sync started |
| `integration.sync.completed` | integration | info | External sync completed |
| `integration.sync.failed` | integration | error | External sync failed |
| `integration.sync.partial` | integration | warning | Partial sync completed |

**Event Data Schema (integration.sync.completed):**
```json
{
  "integration_name": "string",
  "sync_type": "string",
  "records_synced": "number",
  "records_created": "number",
  "records_updated": "number",
  "records_failed": "number",
  "duration_ms": "number",
  "started_at": "timestamp",
  "completed_at": "timestamp"
}
```

---

### 16.2 Platform-Specific Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `integration.linkedin.profile_imported` | integration | info | LinkedIn profile imported |
| `integration.linkedin.rate_limited` | integration | warning | LinkedIn API rate limited |
| `integration.calendar.event_created` | integration | info | Calendar event created |
| `integration.email.sent` | integration | info | Email sent via integration |
| `integration.email.failed` | integration | error | Email send failed |
| `integration.docusign.sent` | integration | info | DocuSign envelope sent |
| `integration.docusign.signed` | integration | info | DocuSign document signed |
| `integration.slack.notification_sent` | integration | info | Slack notification sent |
| `integration.ats.candidate_imported` | integration | info | Candidate imported from ATS |
| `integration.crm.account_synced` | integration | info | Account synced with CRM |

---

## 17. Security Events

### 17.1 Access Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `security.permission_changed` | security | warning | User permissions modified |
| `security.role_assigned` | security | warning | Role assigned to user |
| `security.role_removed` | security | warning | Role removed from user |
| `security.access_denied` | security | warning | Unauthorized access attempt |
| `security.suspicious_activity` | security | critical | Suspicious behavior detected |
| `security.data_access.bulk` | security | warning | Bulk data access detected |
| `security.data_export.large` | security | warning | Large data export |

---

### 17.2 Compliance Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `security.audit_log_viewed` | security | info | Audit log accessed |
| `security.pii_accessed` | security | info | PII data viewed |
| `security.pii_exported` | security | warning | PII data exported |
| `security.gdpr.data_request` | security | info | GDPR data request received |
| `security.gdpr.data_deletion` | security | warning | GDPR deletion executed |

---

## 18. Notification Events

### 18.1 Delivery Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `notification.email.sent` | notification | info | Email notification sent |
| `notification.email.delivered` | notification | info | Email delivered |
| `notification.email.bounced` | notification | warning | Email bounced |
| `notification.email.opened` | notification | info | Email opened |
| `notification.email.clicked` | notification | info | Email link clicked |
| `notification.sms.sent` | notification | info | SMS sent |
| `notification.sms.delivered` | notification | info | SMS delivered |
| `notification.sms.failed` | notification | error | SMS delivery failed |
| `notification.push.sent` | notification | info | Push notification sent |
| `notification.push.delivered` | notification | info | Push delivered |
| `notification.in_app.created` | notification | info | In-app notification created |
| `notification.in_app.read` | notification | info | In-app notification read |

---

## 19. Bench Sales Events

### 19.1 Bench Consultant Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `bench.consultant.added` | entity | info | Consultant added to bench |
| `bench.consultant.removed` | entity | info | Consultant removed from bench |
| `bench.consultant.30_day_alert` | system | warning | 30 days on bench |
| `bench.consultant.60_day_alert` | system | error | 60 days on bench |
| `bench.consultant.90_day_alert` | system | critical | 90 days on bench (critical) |
| `bench.consultant.marketing_started` | workflow | info | Marketing campaign started |
| `bench.consultant.hotlist_added` | workflow | info | Added to hotlist |

---

### 19.2 External Job Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `external_job.scraped` | integration | info | External job scraped |
| `external_job.matched` | system | info | Job matched to bench consultant |
| `external_job.expired` | system | info | External job expired |
| `external_job.duplicate_detected` | system | warning | Duplicate job found |

---

### 19.3 Bench Submission Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `bench_submission.created` | entity | info | Bench submission created |
| `bench_submission.sent_to_vendor` | workflow | info | Submitted to external vendor |
| `bench_submission.vendor_approved` | workflow | info | Vendor approved candidate |
| `bench_submission.vendor_rejected` | workflow | warning | Vendor rejected candidate |
| `bench_submission.interview_scheduled` | workflow | info | Interview scheduled |
| `bench_submission.placed` | workflow | info | Consultant placed via bench |

---

### 19.4 Hotlist Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `hotlist.created` | entity | info | Hotlist created |
| `hotlist.sent` | workflow | info | Hotlist distributed |
| `hotlist.viewed` | workflow | info | Hotlist viewed by recipient |
| `hotlist.response_received` | workflow | info | Client response to hotlist |
| `hotlist.expired` | system | info | Hotlist expired |

---

## 20. Immigration Events

### 20.1 Immigration Case Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `immigration.case.created` | entity | info | Immigration case opened |
| `immigration.case.submitted` | workflow | info | Petition submitted to USCIS |
| `immigration.case.rfe_received` | workflow | warning | RFE (Request for Evidence) received |
| `immigration.case.rfe_responded` | workflow | info | RFE response submitted |
| `immigration.case.approved` | workflow | info | Case approved |
| `immigration.case.denied` | workflow | critical | Case denied |
| `immigration.case.withdrawn` | workflow | warning | Case withdrawn |

---

### 20.2 Work Authorization Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `work_auth.visa_expiring.90_days` | system | warning | Visa expires in 90 days |
| `work_auth.visa_expiring.60_days` | system | warning | Visa expires in 60 days |
| `work_auth.visa_expiring.30_days` | system | error | Visa expires in 30 days |
| `work_auth.visa_expired` | system | critical | Visa expired |
| `work_auth.ead_expiring` | system | warning | EAD expiring soon |
| `work_auth.h1b_transfer_started` | workflow | info | H1B transfer initiated |
| `work_auth.h1b_transfer_approved` | workflow | info | H1B transfer approved |

---

## Event Summary by Category

| Category | Count | Description |
|----------|-------|-------------|
| **Candidate** | 29 | All candidate-related events |
| **Job** | 17 | Job requisition events |
| **Submission** | 13 | Submission workflow events |
| **Interview** | 14 | Interview scheduling and feedback |
| **Offer** | 13 | Offer management events |
| **Placement** | 25 | Placement lifecycle events |
| **Account** | 19 | Client account events |
| **Contact** | 6 | Point of contact events |
| **Lead** | 13 | Lead management events |
| **Deal** | 15 | Deal pipeline events |
| **Activity** | 11 | Activity tracking events |
| **User** | 20 | User and authentication events |
| **System** | 13 | System operations events |
| **Integration** | 14 | External integration events |
| **Security** | 12 | Security and compliance events |
| **Notification** | 12 | Notification delivery events |
| **Bench Sales** | 13 | Bench sales operations |
| **Immigration** | 9 | Immigration case tracking |
| **TOTAL** | **268** | **Complete event catalog** |

---

## Usage Guidelines

### 1. When to Emit Events

Emit an event whenever:
- An entity is created, updated, or deleted
- A workflow status/stage changes
- A business rule threshold is crossed
- An SLA warning or breach occurs
- An external integration completes
- A user takes a significant action

### 2. Event Data Best Practices

- Include enough context to understand the event without additional queries
- Always include entity ID and name for quick reference
- Include actor information (who/what triggered the event)
- Add timestamps for time-sensitive events
- Include related entity references when relevant

### 3. Severity Guidelines

| Severity | When to Use |
|----------|-------------|
| **info** | Normal operations, successful completions |
| **warning** | Potential issues, missed SLAs, overdue items |
| **error** | Failures, rejections, breaches |
| **critical** | System failures, security issues, urgent escalations |

### 4. Auto-Activity Patterns

Each event can trigger zero or more auto-activities. Reference the Activity Pattern Library for complete mappings:
- `docs/specs/20-USER-ROLES/ACTIVITY-PATTERN-LIBRARY.md`

### 5. Event Retention

- **Hot Storage:** Last 90 days (indexed, fast queries)
- **Warm Storage:** 91-365 days (archived, slower queries)
- **Cold Storage:** 365+ days (compliance archive, export only)

---

## Related Documents

- [01-ACTIVITIES-EVENTS-FRAMEWORK.md](./01-ACTIVITIES-EVENTS-FRAMEWORK.md) - Core framework
- [ACTIVITY-PATTERN-LIBRARY.md](./ACTIVITY-PATTERN-LIBRARY.md) - Auto-activity patterns
- [00-MASTER-FRAMEWORK.md](./00-MASTER-FRAMEWORK.md) - Overall system architecture

---

**End of Event Type Catalog**

*This catalog defines all system events in InTime v3. When implementing new features, reference this catalog to ensure consistent event naming and data structures.*
