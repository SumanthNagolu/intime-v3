# Recruiter Spec Implementation - Batch Prompts

> **Usage:** Copy and paste these prompts in sequence (RESEARCH → PLAN → IMPLEMENT) for each batch.
> Each RESEARCH prompt includes the overview context for full system understanding.

## Implementation Order Rationale

Based on entity dependencies and the revenue flow:
1. **Foundation first**: H (Operations) - logging, dashboard needed by all
2. **Core entities**: D (Jobs), E (Candidates) - central to recruiting
3. **Matching flow**: F (Submissions/Interviews) - connects candidates to jobs
4. **Revenue closing**: G (Offers/Placements/Commissions) - generates revenue
5. **Client management**: C (Accounts) - manages relationships
6. **Growth engine**: B (Deals), A (Campaigns) - new business

---

## BATCH 1: Foundation - Daily Operations (H01-H04)
**Specs:** 4 | **Entities:** Activity, Dashboard, Report

### RESEARCH Prompt
```
** RESEARCH 

CONTEXT (read first for full system understanding):
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md

we are working on the requirement in -> 
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/H01-daily-workflow.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/H02-log-activity.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/H03-recruiter-dashboard.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/H04-recruiter-reports.md

please read the requirements and research the codebase to understand how the system works and what files+line numbers are relevant. 

Do not make an implementation plan or explain how to implement.
```

### PLAN Prompt
```
** PLAN 

we are implementing -> Section H: Daily Operations (H01-H04)

we've done the following research -> [paste research output]

create a plan to implement.
```

### IMPLEMENT Prompt
```
** IMPLEMENT

we are implementing -> Section H: Daily Operations (H01-H04)

we've done the following research -> [paste research output]

we've created a plan to implement -> [paste plan]

please implement the plan. I expect every element of page completed and every button working and doing action that is configured. Synced back to database. UI e2e tested. Plugged with prior flows for continuity.
```

---

## BATCH 2: Job Lifecycle (D01-D06)
**Specs:** 6 | **Entities:** Job, Account (read-only)

### RESEARCH Prompt
```
** RESEARCH 

CONTEXT (read first for full system understanding):
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md

we are working on the requirement in -> 
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/D01-create-job.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/D02-publish-job.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/D03-update-job.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/D04-manage-pipeline.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/D05-update-job-status.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/D06-close-job.md

please read the requirements and research the codebase to understand how the system works and what files+line numbers are relevant. 

Do not make an implementation plan or explain how to implement.
```

### PLAN Prompt
```
** PLAN 

we are implementing -> Section D: Job Lifecycle (D01-D06)

we've done the following research -> [paste research output]

create a plan to implement.
```

### IMPLEMENT Prompt
```
** IMPLEMENT

we are implementing -> Section D: Job Lifecycle (D01-D06)

we've done the following research -> [paste research output]

we've created a plan to implement -> [paste plan]

please implement the plan. I expect every element of page completed and every button working and doing action that is configured. Synced back to database. UI e2e tested. Plugged with prior flows for continuity.
```

---

## BATCH 3: Sourcing & Screening (E01-E05)
**Specs:** 5 | **Entities:** Candidate, Resume, Hotlist

### RESEARCH Prompt
```
** RESEARCH 

CONTEXT (read first for full system understanding):
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md

we are working on the requirement in -> 
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/E01-source-candidates.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/E02-search-candidates.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/E03-screen-candidate.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/E04-manage-hotlist.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/E05-prepare-candidate-profile.md

please read the requirements and research the codebase to understand how the system works and what files+line numbers are relevant. 

Do not make an implementation plan or explain how to implement.
```

### PLAN Prompt
```
** PLAN 

we are implementing -> Section E: Sourcing & Screening (E01-E05)

we've done the following research -> [paste research output]

create a plan to implement.
```

### IMPLEMENT Prompt
```
** IMPLEMENT

we are implementing -> Section E: Sourcing & Screening (E01-E05)

we've done the following research -> [paste research output]

we've created a plan to implement -> [paste plan]

please implement the plan. I expect every element of page completed and every button working and doing action that is configured. Synced back to database. UI e2e tested. Plugged with prior flows for continuity.
```

---

## BATCH 4: Submissions & Interviews (F01-F06)
**Specs:** 6 | **Entities:** Submission, Interview

### RESEARCH Prompt
```
** RESEARCH 

CONTEXT (read first for full system understanding):
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md

we are working on the requirement in -> 
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/F01-submit-candidate.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/F02-track-submission.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/F03-schedule-interview.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/F04-prepare-candidate-for-interview.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/F05-coordinate-interview-rounds.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/F06-collect-interview-feedback.md

please read the requirements and research the codebase to understand how the system works and what files+line numbers are relevant. 

Do not make an implementation plan or explain how to implement.
```

### PLAN Prompt
```
** PLAN 

we are implementing -> Section F: Submissions & Interviews (F01-F06)

we've done the following research -> [paste research output]

create a plan to implement.
```

### IMPLEMENT Prompt
```
** IMPLEMENT

we are implementing -> Section F: Submissions & Interviews (F01-F06)

we've done the following research -> [paste research output]

we've created a plan to implement -> [paste plan]

please implement the plan. I expect every element of page completed and every button working and doing action that is configured. Synced back to database. UI e2e tested. Plugged with prior flows for continuity.
```

---

## BATCH 5: Offers & Placements (G01-G04)
**Specs:** 4 | **Entities:** Offer, Placement

### RESEARCH Prompt
```
** RESEARCH 

CONTEXT (read first for full system understanding):
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md

we are working on the requirement in -> 
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/G01-extend-offer.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/G02-negotiate-offer.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/G03-confirm-placement.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/G04-manage-placement.md

please read the requirements and research the codebase to understand how the system works and what files+line numbers are relevant. 

Do not make an implementation plan or explain how to implement.
```

### PLAN Prompt
```
** PLAN 

we are implementing -> Section G Part 1: Offers & Placements (G01-G04)

we've done the following research -> [paste research output]

create a plan to implement.
```

### IMPLEMENT Prompt
```
** IMPLEMENT

we are implementing -> Section G Part 1: Offers & Placements (G01-G04)

we've done the following research -> [paste research output]

we've created a plan to implement -> [paste plan]

please implement the plan. I expect every element of page completed and every button working and doing action that is configured. Synced back to database. UI e2e tested. Plugged with prior flows for continuity.
```

---

## BATCH 6: Commissions & Lifecycle (G05-G08)
**Specs:** 4 | **Entities:** Commission, Extension, Termination

### RESEARCH Prompt
```
** RESEARCH 

CONTEXT (read first for full system understanding):
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md

we are working on the requirement in -> 
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/G05-track-commission.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/G06-handle-extension.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/G07-handle-early-termination.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/G08-make-placement.md

please read the requirements and research the codebase to understand how the system works and what files+line numbers are relevant. 

Do not make an implementation plan or explain how to implement.
```

### PLAN Prompt
```
** PLAN 

we are implementing -> Section G Part 2: Commissions & Lifecycle (G05-G08)

we've done the following research -> [paste research output]

create a plan to implement.
```

### IMPLEMENT Prompt
```
** IMPLEMENT

we are implementing -> Section G Part 2: Commissions & Lifecycle (G05-G08)

we've done the following research -> [paste research output]

we've created a plan to implement -> [paste plan]

please implement the plan. I expect every element of page completed and every button working and doing action that is configured. Synced back to database. UI e2e tested. Plugged with prior flows for continuity.
```

---

## BATCH 7: Account Management (C01-C07)
**Specs:** 7 | **Entities:** Account, Contact

### RESEARCH Prompt
```
** RESEARCH 

CONTEXT (read first for full system understanding):
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md

we are working on the requirement in -> 
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/C01-create-account.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/C02-onboard-account.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/C03-manage-account-profile.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/C04-manage-client-relationship.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/C05-conduct-client-meeting.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/C06-handle-client-escalation.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/C07-take-job-requisition.md

please read the requirements and research the codebase to understand how the system works and what files+line numbers are relevant. 

Do not make an implementation plan or explain how to implement.
```

### PLAN Prompt
```
** PLAN 

we are implementing -> Section C: Account Management (C01-C07)

we've done the following research -> [paste research output]

create a plan to implement.
```

### IMPLEMENT Prompt
```
** IMPLEMENT

we are implementing -> Section C: Account Management (C01-C07)

we've done the following research -> [paste research output]

we've created a plan to implement -> [paste plan]

please implement the plan. I expect every element of page completed and every button working and doing action that is configured. Synced back to database. UI e2e tested. Plugged with prior flows for continuity.
```

---

## BATCH 8: Deals Pipeline (B01-B05)
**Specs:** 5 | **Entities:** Lead, Deal

### RESEARCH Prompt
```
** RESEARCH 

CONTEXT (read first for full system understanding):
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md

we are working on the requirement in -> 
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/B01-prospect-new-client.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/B02-qualify-opportunity.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/B03-create-deal.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/B04-manage-deal-pipeline.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/B05-close-deal.md

please read the requirements and research the codebase to understand how the system works and what files+line numbers are relevant. 

Do not make an implementation plan or explain how to implement.
```

### PLAN Prompt
```
** PLAN 

we are implementing -> Section B: Deals Pipeline (B01-B05)

we've done the following research -> [paste research output]

create a plan to implement.
```

### IMPLEMENT Prompt
```
** IMPLEMENT

we are implementing -> Section B: Deals Pipeline (B01-B05)

we've done the following research -> [paste research output]

we've created a plan to implement -> [paste plan]

please implement the plan. I expect every element of page completed and every button working and doing action that is configured. Synced back to database. UI e2e tested. Plugged with prior flows for continuity.
```

---

## BATCH 9: Campaigns & Lead Gen (A01-A04)
**Specs:** 4 | **Entities:** Campaign, Lead

### RESEARCH Prompt
```
** RESEARCH 

CONTEXT (read first for full system understanding):
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md

we are working on the requirement in -> 
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/A01-run-campaign.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/A02-track-campaign-metrics.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/A03-generate-lead-from-campaign.md
/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/20-USER-ROLES/01-recruiter/A04-create-lead.md

please read the requirements and research the codebase to understand how the system works and what files+line numbers are relevant. 

Do not make an implementation plan or explain how to implement.
```

### PLAN Prompt
```
** PLAN 

we are implementing -> Section A: Campaigns & Lead Gen (A01-A04)

we've done the following research -> [paste research output]

create a plan to implement.
```

### IMPLEMENT Prompt
```
** IMPLEMENT

we are implementing -> Section A: Campaigns & Lead Gen (A01-A04)

we've done the following research -> [paste research output]

we've created a plan to implement -> [paste plan]

please implement the plan. I expect every element of page completed and every button working and doing action that is configured. Synced back to database. UI e2e tested. Plugged with prior flows for continuity.
```

---

## Summary

| Batch | Section | Specs | Entities | Dependencies |
|-------|---------|-------|----------|--------------|
| 1 | H: Operations | 4 | Activity, Dashboard | None (foundation) |
| 2 | D: Jobs | 6 | Job | H (logging) |
| 3 | E: Sourcing | 5 | Candidate | H (logging), D (jobs) |
| 4 | F: Submissions | 6 | Submission, Interview | D, E |
| 5 | G1: Offers | 4 | Offer, Placement | F |
| 6 | G2: Commissions | 4 | Commission | G1 |
| 7 | C: Accounts | 7 | Account, Contact | H (logging) |
| 8 | B: Deals | 5 | Lead, Deal | C (accounts) |
| 9 | A: Campaigns | 4 | Campaign | B (leads) |

**Total: 9 batches, 45 specs** (excluding G08 legacy reference)

---

## Context Efficiency Notes

- **Overview (~1800 lines)**: Read once per RESEARCH phase, provides full system context
- **Spec files (~500-800 lines each)**: 4-7 per batch
- **PLAN and IMPLEMENT**: Carry forward context from RESEARCH (no re-read needed)
- **Estimated context per batch**: ~30-35% (well under 40% target)

---

**Last Updated:** 2025-12-05
**Version:** 1.0

