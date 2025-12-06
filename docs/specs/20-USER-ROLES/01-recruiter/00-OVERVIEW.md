# Technical Recruiter Role - Complete Specification

**Version:** 4.0
**Last Updated:** 2025-12-05
**Role:** Technical Recruiter (Combined: BDM + AM + Recruiter + Delivery Manager)
**Status:** Canonical Reference - Agent Guidepost

---

## Table of Contents

**PART 0: VISION & CONTEXT (Agent Guidepost)**
- [0.1 Document Purpose](#01-document-purpose)
- [0.2 The Partner Model Vision](#02-the-partner-model-vision)
- [0.3 Why This Role Exists](#03-why-this-role-exists)
- [0.4 End-to-End Recruiting Lifecycle](#04-end-to-end-recruiting-lifecycle)
- [0.5 Core Entities & Relationships](#05-core-entities--relationships)
- [0.6 Agent Implementation Guide](#06-agent-implementation-guide)
- [0.7 Section Business Context](#07-section-business-context)

**PART 1: ROLE DEFINITION**
1. [Role Identity](#1-role-identity)
2. [Combined Responsibilities](#2-combined-responsibilities)
3. [Key Metrics & KPIs](#3-key-metrics--kpis)
4. [RACI Assignments](#4-raci-assignments)
5. [Permission Matrix](#5-permission-matrix)
6. [Daily/Weekly/Monthly Cadence](#6-dailyweeklymonthly-cadence)
7. [Navigation & Screens](#7-navigation--screens)
8. [Workflow Index](#8-workflow-index)
9. [Training Requirements](#9-training-requirements)
10. [Success Criteria](#10-success-criteria)

**APPENDICES**
- [Appendix A: Common Scenarios](#appendix-a-common-scenarios)
- [Appendix B: Quick Reference](#appendix-b-quick-reference)
- [Implementation Prompts](./IMPLEMENTATION-PROMPTS.md) - Ready-to-use RESEARCH/PLAN/IMPLEMENT prompts

---

# PART 0: VISION & CONTEXT

> **For AI Agents & Developers:** This section provides the essential context needed to understand and implement any recruiter workflow. Read this first before diving into specific specs.

---

## 0.1 Document Purpose

This overview serves as the **canonical guidepost** for:

| Audience | How to Use This Document |
|----------|-------------------------|
| **AI Agents** | Understand full context before implementing user stories. Find the right spec file, understand entity relationships, follow implementation checklists. |
| **Developers** | Reference for building recruiter workflows. Understand data flow, RACI model, permission boundaries. |
| **Product Managers** | Single source of truth for recruiter capabilities. Use for requirements, prioritization, roadmap planning. |
| **QA Engineers** | Validation criteria for each workflow. Test cases defined in individual spec files. |

### How Specs Are Organized

```
docs/specs/20-USER-ROLES/01-recruiter/
├── 00-OVERVIEW.md          ← YOU ARE HERE (Start here always)
├── A01-A04                  ← Section A: Campaigns & Lead Generation
├── B01-B05                  ← Section B: Lead Qualification & Deals
├── C01-C07                  ← Section C: Account Management
├── D01-D06                  ← Section D: Job Lifecycle
├── E01-E05                  ← Section E: Sourcing & Screening
├── F01-F06                  ← Section F: Submission & Interview
├── G01-G08                  ← Section G: Offers, Placements, Commissions
└── H01-H04                  ← Section H: Daily Operations & Reporting
```

### Spec File Structure (Every File Follows This Pattern)

Each spec file contains these standard sections:
1. **Overview** - Use case ID, actor, goal, frequency, priority
2. **Preconditions** - What must exist before this workflow
3. **Trigger** - What initiates this workflow
4. **Main Flow** - Click-by-click steps with screen mockups
5. **Postconditions** - Expected state after completion
6. **Events Logged** - Audit trail entries created
7. **Error Scenarios** - What can go wrong and how to handle
8. **Test Cases** - Validation criteria
9. **Backend Processing** - tRPC procedures, database operations

---

## 0.2 The Partner Model Vision

### The Problem with Traditional Recruiting

Traditional staffing agencies silo responsibilities:

```
TRADITIONAL MODEL (Fragmented)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BDM finds client → AM manages relationship → Recruiter sources → Delivery closes
     │                    │                       │                   │
     └── No ownership ────┴── Handoff friction ───┴── Lost context ───┘
     
Result: Poor client experience, finger-pointing, revenue leakage
```

### The InTime Partner Model Solution

In InTime OS, each Technical Recruiter owns the **complete revenue cycle**:

```
PARTNER MODEL (End-to-End Ownership)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    ┌─────────────────────────────────────┐
                    │      TECHNICAL RECRUITER            │
                    │      (Single Point of Ownership)    │
                    └─────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│  HUNT         │         │  MATCH        │         │  CLOSE        │
│  (Sections    │         │  (Sections    │         │  (Sections    │
│   A, B, C)    │         │   D, E, F)    │         │   G, H)       │
├───────────────┤         ├───────────────┤         ├───────────────┤
│ • Campaigns   │         │ • Jobs        │         │ • Offers      │
│ • Leads       │         │ • Sourcing    │         │ • Placements  │
│ • Deals       │         │ • Screening   │         │ • Commissions │
│ • Accounts    │         │ • Submissions │         │ • Check-ins   │
└───────────────┘         └───────────────┘         └───────────────┘

Result: Complete accountability, deep client relationships, maximized revenue
```

### Why This Matters for Implementation

Every feature you build must support **end-to-end ownership**:
- A recruiter must see their complete pipeline (campaigns → placements)
- Data must flow seamlessly between sections
- Commission tracking must trace back to original campaign/lead
- RACI model ensures clear accountability at every step

---

## 0.3 Why This Role Exists

### Business Value Chain

```
REVENUE GENERATION FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Campaign → Lead → Deal → Account → Job → Placement → Revenue → Commission
   │         │       │       │        │        │          │         │
   │         │       │       │        │        │          │         └─ 5% to Recruiter
   │         │       │       │        │        │          │
   │         │       │       │        │        │          └─ Bill Rate × Hours
   │         │       │       │        │        │
   │         │       │       │        │        └─ Successful hire
   │         │       │       │        │
   │         │       │       │        └─ Client needs talent
   │         │       │       │
   │         │       │       └─ Contract signed (MSA)
   │         │       │
   │         │       └─ Qualified opportunity
   │         │
   │         └─ Potential client identified
   │
   └─ Outreach initiated

EVERY STEP MATTERS: A broken link anywhere stops revenue flow
```

### Commission Model (The "Why" Behind Everything)

Technical Recruiters earn **5% of gross revenue** on all active placements:

```
COMMISSION CALCULATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Monthly Revenue = Bill Rate × Hours Worked
Recruiter Commission = Monthly Revenue × 5%

EXAMPLE:
┌─────────────────────────────────────────────────────────────┐
│ Placement: Senior Developer at TechCorp                     │
├─────────────────────────────────────────────────────────────┤
│ Bill Rate:           $100/hr                                │
│ Pay Rate:            $75/hr                                 │
│ Margin:              $25/hr (25%)                           │
│ Monthly Hours:       176                                    │
│ Monthly Revenue:     $17,600                                │
│ Monthly Commission:  $880 (5% of $17,600)                   │
│ Annual Commission:   $10,560 (if 12-month contract)         │
└─────────────────────────────────────────────────────────────┘

WHY 5% OF GROSS (not margin)?
• Aligns recruiter incentive with company revenue
• Encourages high-value placements
• Simple, transparent calculation
• Motivates retention (commission continues while placed)
```

---

## 0.4 End-to-End Recruiting Lifecycle

### The Complete Journey (Campaign to Commission)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        RECRUITING LIFECYCLE FLOWCHART                            │
│                         (Follow the Revenue Path)                                │
└─────────────────────────────────────────────────────────────────────────────────┘

PHASE 1: BUSINESS DEVELOPMENT (Revenue Funnel Entry)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│ CAMPAIGN  │───▶│   LEAD    │───▶│  QUALIFY  │───▶│   DEAL    │───▶│  ACCOUNT  │
│  (A01)    │    │ (A03-A04) │    │   (B02)   │    │ (B03-B05) │    │ (C01-C07) │
└───────────┘    └───────────┘    └───────────┘    └───────────┘    └───────────┘
     │                │                 │                │                │
     │                ▼                 ▼                ▼                │
     │           [Reject]          [Disqualify]     [Lost Deal]          │
     │                                                                    │
     └─────────────────────── Outreach Campaigns ────────────────────────┘

                                       │
                                       ▼ (Client Ready)

PHASE 2: FULFILLMENT (Matching Talent to Jobs)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│    JOB    │───▶│  SOURCE   │───▶│  SCREEN   │───▶│  SUBMIT   │───▶│ INTERVIEW │
│ (D01-D06) │    │ (E01-E02) │    │ (E03-E05) │    │ (F01-F02) │    │ (F03-F06) │
└───────────┘    └───────────┘    └───────────┘    └───────────┘    └───────────┘
     │                │                 │                │                │
     │                ▼                 ▼                ▼                ▼
     │           [No Match]        [Not Fit]       [Rejected]        [No Hire]
     │                                                                    │
     └──────────────── Job Requirements from Account ────────────────────┘

                                       │
                                       ▼ (Interview Success)

PHASE 3: CLOSING (Converting to Revenue)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│   OFFER   │───▶│ PLACEMENT │───▶│  CHECK-IN │───▶│  INVOICE  │───▶│COMMISSION │
│ (G01-G02) │    │ (G03-G04) │    │   (G04)   │    │ (Finance) │    │   (G05)   │
└───────────┘    └───────────┘    └───────────┘    └───────────┘    └───────────┘
     │                │                 │                                 │
     │                ▼                 ▼                                 │
     │           [Declined]        [Fall-off]                            │
     │               │                  │                                 │
     │               │                  └──▶ [G07: Handle Termination]    │
     │               │                                                    │
     │               └──▶ [G06: Handle Extension]──────────────────────▶│
     │                                                                    │
     └─────────────────────── 5% of Gross Revenue ───────────────────────┘
```

### Section Connections (Data Flow Map)

| From Section | To Section | Data Passed | Trigger |
|--------------|------------|-------------|---------|
| A (Campaign) | A (Lead) | Campaign ID, response data | Response received |
| A (Lead) | B (Deal) | Lead ID, qualification score | Lead qualified |
| B (Deal) | C (Account) | Deal ID, client info, MSA terms | Deal won |
| C (Account) | D (Job) | Account ID, contacts, preferences | Job requisition |
| D (Job) | E (Sourcing) | Job ID, requirements, skills | Job published |
| E (Candidate) | F (Submission) | Candidate ID, resume, rates | Match identified |
| F (Submission) | F (Interview) | Submission ID, feedback | Client accepts |
| F (Interview) | G (Offer) | Interview feedback, approval | Interview passed |
| G (Offer) | G (Placement) | Offer terms, acceptance | Offer accepted |
| G (Placement) | G (Commission) | Hours worked, bill rate | Invoice paid |

### State Transitions (What Can Go Wrong)

```
JOB STATES                    SUBMISSION STATES              PLACEMENT STATES
━━━━━━━━━━━━━━━━              ━━━━━━━━━━━━━━━━━              ━━━━━━━━━━━━━━━━
Draft → Open → Urgent         Sourced → Screening            Active → Extended
  │       │       │             │         │                    │         │
  │       │       │             ▼         ▼                    │         └─▶ Extended
  │       │       │          Submitted → Interview             │
  │       │       │             │         │                    ▼
  │       └───────┼─────────────┼─────────┤              Fall-off → Replaced
  │               │             │         │                    │
  ▼               ▼             ▼         ▼                    ▼
Cancelled     On Hold      Rejected   No Offer           Terminated
                               │
                               └─▶ Offer Extended → Placed
```

---

## 0.5 Core Entities & Relationships

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CORE ENTITY RELATIONSHIPS                              │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │  CAMPAIGN   │
                              │   (A01)     │
                              └──────┬──────┘
                                     │ generates
                                     ▼
                              ┌─────────────┐
                              │    LEAD     │
                              │  (A03-A04)  │
                              └──────┬──────┘
                                     │ converts to
                                     ▼
                              ┌─────────────┐
                              │    DEAL     │
                              │  (B03-B05)  │
                              └──────┬──────┘
                                     │ becomes
                                     ▼
┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│   CONTACT   │◀─────────────│   ACCOUNT   │─────────────▶│     JOB     │
│             │   belongs to │  (C01-C07)  │  creates     │  (D01-D06)  │
└─────────────┘              └─────────────┘              └──────┬──────┘
                                                                 │
                                     ┌───────────────────────────┘
                                     │ matched to
                                     ▼
┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│   RESUME    │◀─────────────│  CANDIDATE  │─────────────▶│ SUBMISSION  │
│             │   has        │  (E01-E05)  │  creates     │  (F01-F02)  │
└─────────────┘              └─────────────┘              └──────┬──────┘
                                                                 │
                                     ┌───────────────────────────┘
                                     │ leads to
                                     ▼
                              ┌─────────────┐
                              │  INTERVIEW  │
                              │  (F03-F06)  │
                              └──────┬──────┘
                                     │ results in
                                     ▼
                              ┌─────────────┐
                              │    OFFER    │
                              │  (G01-G02)  │
                              └──────┬──────┘
                                     │ accepted becomes
                                     ▼
                              ┌─────────────┐
                              │  PLACEMENT  │
                              │  (G03-G07)  │
                              └──────┬──────┘
                                     │ generates
                                     ▼
                              ┌─────────────┐
                              │ COMMISSION  │
                              │    (G05)    │
                              └─────────────┘
```

### Entity Quick Reference

| Entity | Primary Key | Key Fields | Created By | Owned By |
|--------|-------------|------------|------------|----------|
| **Campaign** | `campaign_id` | name, type, status, budget | Recruiter | Recruiter |
| **Lead** | `lead_id` | source, status, score, campaign_id | System/Recruiter | Recruiter |
| **Deal** | `deal_id` | value, stage, probability, lead_id | Recruiter | Recruiter |
| **Account** | `account_id` | name, industry, status, deal_id | Recruiter | Recruiter |
| **Contact** | `contact_id` | name, email, role, account_id | Recruiter | Account Owner |
| **Job** | `job_id` | title, requirements, status, account_id | Recruiter | Recruiter |
| **Candidate** | `candidate_id` | name, skills, visa, status | Recruiter | Sourcing Recruiter |
| **Submission** | `submission_id` | pay_rate, bill_rate, status, job_id | Recruiter | Job Owner |
| **Interview** | `interview_id` | date, type, feedback, submission_id | Recruiter | Submission Owner |
| **Offer** | `offer_id` | terms, status, submission_id | Recruiter | Submission Owner |
| **Placement** | `placement_id` | start_date, end_date, offer_id | Recruiter | Offer Owner |
| **Commission** | `commission_id` | amount, status, placement_id | System | Placement Owner |

### Ownership Chain (RACI Inheritance)

```
Campaign Owner
    └── Lead Owner (inherits)
        └── Deal Owner (inherits)
            └── Account Owner (inherits)
                └── Job Owner (may differ)
                    └── Submission Owner (inherits from Job)
                        └── Interview Owner (inherits)
                            └── Offer Owner (inherits)
                                └── Placement Owner (inherits)
                                    └── Commission Owner (inherits)
```

---

## 0.6 Agent Implementation Guide

### Step-by-Step: How to Implement a User Story

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    AGENT IMPLEMENTATION WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

STEP 1: UNDERSTAND CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────────────────────────────────────────────┐
│ □ Read this overview (Section 0) to understand full lifecycle                   │
│ □ Identify which section (A-H) the user story belongs to                        │
│ □ Understand upstream dependencies (what must exist before)                     │
│ □ Understand downstream effects (what happens after)                            │
└─────────────────────────────────────────────────────────────────────────────────┘

STEP 2: READ THE SPEC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────────────────────────────────────────────┐
│ □ Open the specific spec file (e.g., F01-submit-candidate.md)                   │
│ □ Read Preconditions - what must exist in the system                            │
│ □ Read Trigger - what initiates this workflow                                   │
│ □ Follow Main Flow - click-by-click implementation guide                        │
│ □ Note Postconditions - expected state after completion                         │
│ □ Review Events Logged - audit trail requirements                               │
└─────────────────────────────────────────────────────────────────────────────────┘

STEP 3: CHECK CROSS-CUTTING CONCERNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────────────────────────────────────────────┐
│ □ RACI: Who is R/A/C/I for this action? (Section 4)                             │
│ □ Permissions: Does the user have access? (Section 5)                           │
│ □ Multi-currency: Does this involve rates? Handle currency conversion           │
│ □ Timezone: Does this involve dates/times? Display in user's timezone           │
│ □ Audit: Log every action with user, timestamp, IP                              │
└─────────────────────────────────────────────────────────────────────────────────┘

STEP 4: IMPLEMENT & TEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────────────────────────────────────────────┐
│ □ Implement the main flow from the spec                                         │
│ □ Handle all error scenarios listed in the spec                                 │
│ □ Run test cases defined in the spec                                            │
│ □ Verify postconditions are met                                                 │
│ □ Confirm events are logged correctly                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### User Story → Spec Mapping Table

| User Story Pattern | Section | Key Specs | Related Entities |
|-------------------|---------|-----------|------------------|
| "...run a marketing campaign..." | A | A01, A02 | Campaign |
| "...generate or create leads..." | A | A03, A04 | Lead, Campaign |
| "...prospect new clients..." | B | B01, B02 | Lead |
| "...create or manage deals..." | B | B03, B04, B05 | Deal, Lead |
| "...create or manage accounts..." | C | C01, C02, C03 | Account, Deal |
| "...manage client relationships..." | C | C04, C05, C06 | Account, Contact |
| "...take job requisitions..." | C | C07 | Job, Account |
| "...create or manage jobs..." | D | D01-D06 | Job, Account |
| "...source candidates..." | E | E01, E02 | Candidate, Job |
| "...screen candidates..." | E | E03, E04, E05 | Candidate |
| "...submit candidates..." | F | F01, F02 | Submission, Candidate, Job |
| "...schedule interviews..." | F | F03, F04, F05, F06 | Interview, Submission |
| "...extend offers..." | G | G01, G02 | Offer, Submission |
| "...confirm placements..." | G | G03, G04 | Placement, Offer |
| "...track commissions..." | G | G05 | Commission, Placement |
| "...handle extensions..." | G | G06 | Placement |
| "...handle terminations..." | G | G07 | Placement |
| "...view dashboard/reports..." | H | H03, H04 | All entities |
| "...log activities..." | H | H02 | Activity |

### Ready-to-Use Implementation Prompts

For structured implementation, use the batch prompts in **[IMPLEMENTATION-PROMPTS.md](./IMPLEMENTATION-PROMPTS.md)**:
- 9 batches organized by entity dependencies
- Each batch has RESEARCH → PLAN → IMPLEMENT prompts
- Overview context included in each RESEARCH phase
- Estimated ~30-35% context usage per batch

### Implementation Checklist Template

Copy this checklist when implementing any user story:

```markdown
## Implementation Checklist: [USER_STORY_ID]

### Context
- [ ] Read 00-OVERVIEW.md Section 0
- [ ] Identified section: [A/B/C/D/E/F/G/H]
- [ ] Spec file: [SPEC_FILE.md]

### Preconditions Verified
- [ ] Required entities exist: [LIST]
- [ ] User has permissions: [LIST]
- [ ] RACI roles assigned: R=[WHO], A=[WHO]

### Implementation
- [ ] Main flow implemented
- [ ] Error scenarios handled
- [ ] Validation rules applied
- [ ] UI matches spec mockups

### Cross-Cutting
- [ ] Multi-currency handled (if applicable)
- [ ] Timezone handled (if applicable)
- [ ] GDPR/CCPA compliance (if applicable)
- [ ] Audit trail events logged

### Testing
- [ ] Test cases from spec passing
- [ ] Postconditions verified
- [ ] Edge cases covered
- [ ] Integration with related entities tested
```

---

## 0.7 Section Business Context

### Why Each Section Exists

| Section | Business Purpose | Revenue Impact | Success Metrics |
|---------|-----------------|----------------|-----------------|
| **A: Campaigns** | Generate new business pipeline through targeted outreach | Feeds entire revenue funnel | Lead volume, response rate, cost per lead |
| **B: Deals** | Convert interested prospects into paying clients | Direct path to revenue | Win rate, deal size, cycle time |
| **C: Accounts** | Maintain and grow client relationships | Recurring revenue, upsells | NPS, retention rate, jobs per account |
| **D: Jobs** | Track and fulfill client hiring needs | Defines fulfillment capacity | Fill rate, time-to-fill, jobs per recruiter |
| **E: Sourcing** | Build qualified candidate pipeline | Quality determines placements | Source mix, screen pass rate, time-to-source |
| **F: Submissions** | Match candidates to client requirements | Client satisfaction driver | Submit-to-interview %, feedback score |
| **G: Placements** | Convert matches to revenue-generating hires | **DIRECT REVENUE** | Placement count, retention, commission |
| **H: Operations** | Track productivity and enable improvement | Efficiency multiplier | Activity volume, pipeline velocity |

### Section Dependencies (Build Order)

```
IMPLEMENTATION PRIORITY ORDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Priority 1 (Core Infrastructure):
├── H: Daily Operations    ← Foundation: activity logging, dashboard
├── D: Job Lifecycle       ← Core entity for recruiting
└── E: Sourcing/Screening  ← Core entity for recruiting

Priority 2 (Revenue Flow):
├── F: Submissions         ← Connects candidates to jobs
├── G: Placements          ← Revenue generation
└── C: Accounts            ← Client management

Priority 3 (Growth):
├── B: Deals               ← New business
└── A: Campaigns           ← Lead generation
```

### KPIs by Section

| Section | Leading Indicator | Lagging Indicator | Target |
|---------|-------------------|-------------------|--------|
| A | Campaigns launched | Leads generated | 10 leads/week |
| B | Deals created | Deals won | 1 new client/month |
| C | Meetings held | Account retention | 90% retention |
| D | Jobs created | Jobs filled | 50% fill rate |
| E | Candidates sourced | Candidates screened | 75/week sourced |
| F | Submissions sent | Interviews scheduled | 30% to interview |
| G | Offers extended | Placements confirmed | 85% acceptance |
| H | Activities logged | Revenue per recruiter | $25K/month |

---

# PART 1: ROLE DEFINITION

---

## 1. Role Identity

### 1.1 Role Summary

| Property | Value |
|----------|-------|
| Role ID | `technical_recruiter` |
| Role Type | Individual Contributor (IC) - Partner Model |
| Reports To | Recruiting Manager (Pod Manager) |
| Pod Type | Recruiting |
| Primary Market | US + Canada |
| Data Scope | Own + RACI Assigned |
| Typical Team Size | 1 recruiter per pod (with 1 manager) |

### 1.2 Role Philosophy

In InTime OS's **Partner Model**, the Technical Recruiter is NOT a siloed specialist but a complete end-to-end recruiting professional who combines four traditional roles:

```
┌────────────────────────────────────────────────────────────────┐
│                     TECHNICAL RECRUITER                         │
│                   (End-to-End Ownership)                        │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │     BDM      │  │     AM       │  │  Recruiter   │         │
│  │  (Business   │  │  (Account    │  │  (Sourcing   │         │
│  │Development)  │  │ Management)  │  │  & Matching) │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                             │                                   │
│                  ┌──────────▼────────────┐                      │
│                  │  Delivery Manager     │                      │
│                  │  (Placement Success)  │                      │
│                  └───────────────────────┘                      │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Core Principle:** Every recruiter owns their client relationships, jobs, candidates, and placements from prospecting through 90-day retention.

---

## 2. Combined Responsibilities

> **Why This Matters:** Understanding all four responsibility areas is crucial because they form an interconnected system. Leads from BDM activities feed into AM relationships, which generate jobs for Recruiter activities, which create placements for DM to manage. Missing any area breaks the revenue chain.

### 2.1 Business Development Manager (BDM) Responsibilities

| Activity | Description | Frequency | Target |
|----------|-------------|-----------|--------|
| **Prospect New Clients** | Identify potential clients, initiate outreach, build relationships | Daily | 5 new contacts/week |
| **Qualify Opportunities** | Assess client fit, budget, staffing needs | Weekly | 3 qualified opps/week |
| **Create Accounts** | Set up new client accounts in system | As needed | 2 new accounts/month |
| **Generate Leads** | Network, referrals, LinkedIn, cold outreach | Daily | 10 leads/week |
| **Pitch Services** | Present InTime capabilities, value proposition | Weekly | 2 pitches/week |
| **Close Deals** | Negotiate MSAs, terms, onboard clients | Monthly | 1 new client/month |

**Related Workflows:**
- [B01-prospect-new-client.md](./B01-prospect-new-client.md)
- [B02-qualify-opportunity.md](./B02-qualify-opportunity.md)
- [C01-create-account.md](./C01-create-account.md)

### 2.2 Account Manager (AM) Responsibilities

| Activity | Description | Frequency | Target |
|----------|-------------|-----------|--------|
| **Client Relationship Management** | Regular check-ins, satisfaction monitoring | Weekly | 1 call/client/week |
| **Conduct Client Meetings** | Job intake, status reviews, feedback sessions | Weekly | 3 meetings/week |
| **Handle Escalations** | Resolve issues, complaints, urgent requests | As needed | < 24hr response |
| **Expand Accounts** | Identify new opportunities within existing clients | Monthly | 2 upsells/quarter |
| **Collect Feedback** | NPS surveys, testimonials, improvement areas | Quarterly | 100% coverage |
| **Maintain Satisfaction** | Ensure client happiness, reduce churn | Ongoing | NPS > 8/10 |

**Related Workflows:**
- [C04-manage-client-relationship.md](./C04-manage-client-relationship.md)
- [C05-conduct-client-meeting.md](./C05-conduct-client-meeting.md)
- [C06-handle-client-escalation.md](./C06-handle-client-escalation.md)

### 2.3 Recruiter Responsibilities

| Activity | Description | Frequency | Target |
|----------|-------------|-----------|--------|
| **Create Jobs** | Document requirements, set up requisitions | Daily | 2-3 jobs/week |
| **Publish Jobs** | Activate jobs, post to boards | Daily | Same day as created |
| **Source Candidates** | Find talent via LinkedIn, job boards, referrals | Daily (2-3 hrs) | 15 profiles/day |
| **Screen Candidates** | Phone screens, skill assessment, fit evaluation | Daily | 5 screens/day |
| **Submit to Clients** | Prepare candidate presentations, send to client | Daily | 5 submissions/week |
| **Manage Pipeline** | Track candidates through stages | Ongoing | 90% update rate |
| **Update Job Status** | Keep job states current | Daily | 100% accuracy |

**Related Workflows:**
- [D01-create-job.md](./D01-create-job.md)
- [E01-source-candidates.md](./E01-source-candidates.md)
- [F01-submit-candidate.md](./F01-submit-candidate.md)
- [F03-schedule-interview.md](./F03-schedule-interview.md)
- [D02-publish-job.md](./D02-publish-job.md)
- [D03-update-job.md](./D03-update-job.md)
- [D06-close-job.md](./D06-close-job.md)

### 2.4 Delivery Manager (DM) Responsibilities

| Activity | Description | Frequency | Target |
|----------|-------------|-----------|--------|
| **Extend Offers** | Negotiate terms, send offer letters | As needed | < 2 days from client OK |
| **Confirm Placements** | Complete paperwork, coordinate start date | Weekly | Same day as accepted |
| **Manage Placement** | 30/60/90 day check-ins, issue resolution | Monthly | 100% retention |
| **Ensure Onboarding** | Work with candidate and client for smooth start | Per placement | 95% success rate |
| **Handle Extensions** | Renew contracts, negotiate rate changes | As needed | 80% extension rate |
| **Collect Feedback** | Candidate & client satisfaction post-placement | 30/60/90 days | 100% coverage |

**Related Workflows:**
- [G01-extend-offer.md](./G01-extend-offer.md)
- [G03-confirm-placement.md](./G03-confirm-placement.md)
- [G04-manage-placement.md](./G04-manage-placement.md)

---

## 3. Key Metrics & KPIs

> **Why This Matters:** Metrics drive behavior. Every feature should support measurement of these KPIs. Dashboard displays, activity logging, and status tracking all exist to provide accurate metric calculation. When implementing, ensure data required for these metrics is captured.

### 3.1 Primary Metrics (Measured Weekly)

| Metric | Target | Formula | Weight |
|--------|--------|---------|--------|
| **Placements** | 2 per 2-week sprint | Count(status='placed', period='sprint') | 40% |
| **Placement Revenue** | $25K/month | Sum(billRate × hours × margin) | 30% |
| **Submissions** | 10/week | Count(status='submitted', period='week') | 15% |
| **Interviews Scheduled** | 3/week | Count(status='interview', period='week') | 10% |
| **Job Fill Rate** | 50% | (Jobs filled / Total jobs) × 100 | 5% |

### 3.2 Leading Indicators (Daily Activities)

| Activity | Daily Target | Weekly Target | Tracking |
|----------|--------------|---------------|----------|
| Candidate Screens | 5 | 25 | Phone/video calls logged |
| New Candidates Sourced | 15 profiles | 75 profiles | Candidates added to system |
| Client Touchpoints | 3 | 15 | Activities logged |
| LinkedIn Outreach | 20 messages | 100 messages | Tracked in CRM |
| Job Applications Reviewed | 30 | 150 | Review status updated |
| Submissions to Clients | 1 | 5 | Submission records created |

### 3.3 Quality Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **Client Satisfaction (NPS)** | > 8/10 | Net Promoter Score from clients |
| **Candidate Satisfaction** | > 8/10 | Post-placement survey |
| **Time-to-Submit** | < 48 hours | Job open → First submission |
| **Time-to-Fill** | < 21 days | Job open → Placement confirmed |
| **Interview-to-Offer Ratio** | > 40% | Interviews resulting in offers |
| **Offer Acceptance Rate** | > 85% | Offers accepted |
| **30-Day Retention** | > 95% | Placements active after 30 days |
| **90-Day Retention** | > 90% | Placements active after 90 days |
| **Submission-to-Interview** | > 30% | Submissions leading to interviews |

### 3.4 Business Development Metrics

| Metric | Target | Frequency |
|--------|--------|-----------|
| New Client Accounts | 1-2/month | Monthly |
| Qualified Leads Generated | 10/week | Weekly |
| Client Meetings Scheduled | 3/week | Weekly |
| MSAs Signed | 1/quarter | Quarterly |
| Account Expansion (Upsells) | 2/quarter | Quarterly |

### 3.5 Dashboard View

```
┌───────────────────────────────────────────────────────────────┐
│ RECRUITER DASHBOARD - John Smith                             │
│ Sprint: Week 1-2 of 2 (Nov 18 - Dec 1, 2025)                │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ PRIMARY METRICS (This Sprint)                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│ │ Placements  │ │ Revenue     │ │ Submissions │             │
│ │  1 / 2 🟡   │ │ $18K / $25K │ │  8 / 10 🟢  │             │
│ │  50%        │ │  72%        │ │  80%        │             │
│ └─────────────┘ └─────────────┘ └─────────────┘             │
│                                                               │
│ ACTIVITY THIS WEEK                                            │
│ Screens:        23 / 25 ████████████░                         │
│ Sourced:        71 / 75 ████████████░                         │
│ Client Calls:   14 / 15 █████████████                         │
│ Interviews:      2 /  3 ████████░░░░                         │
│                                                               │
│ PIPELINE HEALTH                                               │
│ Active Jobs:           12 (6 urgent, 4 high, 2 normal)       │
│ Candidates in Pipeline: 84 (15 submitted, 42 screening)      │
│ Upcoming Interviews:    4 (this week)                         │
│ Pending Offers:         1 (needs follow-up)                   │
│                                                               │
│ QUALITY SCORES (Last 30 Days)                                 │
│ Client NPS:      8.7/10 ⭐                                    │
│ Time-to-Submit:  36 hours ✓                                   │
│ 30-Day Retention: 97% ✓                                       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 4. RACI Assignments

> **Why This Matters:** RACI determines who sees what, who can edit what, and who gets notified. Every entity has RACI fields. Implement visibility rules based on RACI: R can edit, A can approve, C gets consulted before major changes, I gets notified after changes. This is the foundation of our permission model.

### 4.1 RACI by Object Type

#### Jobs

| Event | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|-------|-----------------|-----------------|---------------|--------------|
| **Job Created** | Recruiter (creator) | Recruiter | - | Pod Manager, COO |
| **Job Published** | Recruiter (owner) | Pod Manager | - | COO, Client |
| **Job Updated** | Recruiter (owner) | Pod Manager | Secondary Recruiter (if assigned) | COO |
| **Job Filled** | Recruiter (owner) | Pod Manager | Finance (for invoicing) | COO, Client |
| **Job Closed** | Recruiter (owner) | Pod Manager | - | COO |
| **Job Cancelled** | Recruiter (owner) | Pod Manager | Client contact | COO |
| **Job Reassigned** | New Recruiter | Pod Manager | Previous Recruiter | COO |

#### Candidates/Talent

| Event | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|-------|-----------------|-----------------|---------------|--------------|
| **Candidate Sourced** | Sourcing Recruiter | Sourcing Recruiter | - | Pod Manager |
| **Candidate Updated** | Owner Recruiter | Owner Recruiter | - | - |
| **Candidate Screened** | Screening Recruiter | Screening Recruiter | Pod Manager (if flags) | - |
| **Candidate Hotlisted** | Recruiter | Pod Manager | - | All recruiters in pod |
| **Candidate Placed** | Primary Recruiter | Pod Manager | Finance, HR | COO, Client |

#### Submissions

| Event | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|-------|-----------------|-----------------|---------------|--------------|
| **Submission Created** | Recruiter | Pod Manager | Secondary Recruiter (if multi-owner job) | COO |
| **Submission Sent to Client** | Recruiter | Pod Manager | - | COO, Candidate |
| **Rate Override (>10% margin)** | Recruiter | Pod Manager | Finance, Regional Director | COO |
| **Client Feedback Received** | Recruiter | Pod Manager | - | Candidate |
| **Interview Scheduled** | Recruiter | Pod Manager | - | Candidate, Client |
| **Interview Completed** | Recruiter | Pod Manager | - | COO |
| **Submission Rejected** | Recruiter | Pod Manager | - | Candidate |

#### Interviews

| Event | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|-------|-----------------|-----------------|---------------|--------------|
| **Interview Scheduled** | Recruiter | Recruiter | - | Candidate, Client, Pod Manager |
| **Interview Reminder Sent** | System (auto) | Recruiter | - | Candidate, Client |
| **Interview Rescheduled** | Recruiter | Recruiter | Pod Manager (if >2 reschedules) | Candidate, Client |
| **No-Show** | Recruiter | Pod Manager | - | COO |
| **Feedback Collected** | Recruiter | Recruiter | - | Pod Manager |

#### Offers & Placements

| Event | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|-------|-----------------|-----------------|---------------|--------------|
| **Offer Extended** | Recruiter | Pod Manager | Finance (rate verification) | COO, HR |
| **Offer Negotiation** | Recruiter | Pod Manager | Finance (if margin <15%) | COO |
| **Offer Accepted** | Recruiter | Pod Manager | HR, Finance | COO, CEO |
| **Offer Rejected** | Recruiter | Pod Manager | - | COO |
| **Placement Confirmed** | Recruiter | Pod Manager | Finance, HR, Legal | COO, CEO |
| **30-Day Check-in** | Recruiter | Pod Manager | - | HR |
| **60-Day Check-in** | Recruiter | Pod Manager | - | HR |
| **90-Day Check-in** | Recruiter | Pod Manager | - | HR |
| **Placement Extended** | Recruiter | Pod Manager | Finance | COO, Client |
| **Placement Terminated** | Recruiter | Pod Manager | HR, Legal | COO, CEO, Client |

#### Accounts (Client Relationships)

| Event | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|-------|-----------------|-----------------|---------------|--------------|
| **Account Created** | Creator (Recruiter or BD) | Pod Manager | Regional Director | COO |
| **Account Assigned** | New Owner | Pod Manager | Previous Owner | COO |
| **MSA Signed** | Account Owner | Regional Director | Finance, Legal | COO, CEO |
| **Account Escalation** | Account Owner | Regional Director | Pod Manager, COO | CEO |
| **Account Churned** | Account Owner | Regional Director | Pod Manager | COO, CEO |

#### Leads & Deals (BD Activities)

| Event | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|-------|-----------------|-----------------|---------------|--------------|
| **Lead Created** | Recruiter/BD | Recruiter | - | Pod Manager |
| **Lead Qualified** | Recruiter | Recruiter | Pod Manager | COO |
| **Deal Created** | Recruiter | Pod Manager | Finance | COO |
| **Deal Won** | Recruiter | Pod Manager | Recruiting Manager (job handoff) | COO, CEO |
| **Deal Lost** | Recruiter | Pod Manager | - | COO |

### 4.2 RACI Assignment UI (Standard Component)

Every object detail page includes:

```
┌─────────────────────────────────────────────────────────────┐
│ OWNERSHIP (RACI)                                    [Edit]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Responsible (R)          Accountable (A)                   │
│  ┌─────────────────┐      ┌─────────────────┐              │
│  │ 👤 John Smith   │      │ 👤 Sarah Jones  │              │
│  │ Tech Recruiter  │      │ Pod Manager     │              │
│  │ Assigned: Nov 1 │      │ Assigned: Nov 1 │              │
│  └─────────────────┘      └─────────────────┘              │
│                                                             │
│  Consulted (C)            Informed (I)                      │
│  ┌─────────────────┐      ┌─────────────────┐              │
│  │ 👤 Mike Brown   │      │ 👤 Lisa Chen    │              │
│  │ Secondary Rec   │      │ COO             │              │
│  │ + Add more...   │      │ + Regional Dir  │              │
│  └─────────────────┘      └─────────────────┘              │
│                                                             │
│  [View History]  [Transfer Ownership]  [Add Stakeholder]   │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Transfer Ownership Rules

| Object Type | Can Transfer R | Can Transfer A | Requires Approval |
|-------------|----------------|----------------|-------------------|
| Jobs | Yes (to any recruiter in pod) | Manager only | Manager approval |
| Candidates | Yes (to any recruiter) | Manager only | No |
| Submissions | Yes (tied to job owner) | Manager only | Manager approval |
| Accounts | Yes (Manager approval) | Regional Director only | Regional Director approval |
| Placements | No (locked after confirmed) | No | N/A |

---

## 5. Permission Matrix

> **Why This Matters:** Permission checks must be implemented at both UI and API layers. Use this matrix to determine what actions to show/hide and what API calls to allow/deny. Always check permissions before executing any CRUD operation.

### 5.1 Entity Permissions

| Entity | Create | Read | Update | Delete | Approve | Scope |
|--------|--------|------|--------|--------|---------|-------|
| **Jobs** | ✅ Yes | ✅ Own + RACI (C, I) | ✅ Own + RACI (R, A) | ❌ No | ❌ No | Own + RACI |
| **Candidates** | ✅ Yes | ✅ All in Org | ✅ Own | ❌ No | ❌ No | All (Read), Own (Edit) |
| **Submissions** | ✅ Yes | ✅ Own + Job RACI | ✅ Own | ❌ No | ❌ No | Own + Job RACI |
| **Interviews** | ✅ Yes | ✅ Own Submissions | ✅ Own | ✅ Own | ❌ No | Own |
| **Offers** | ✅ Yes | ✅ Own Submissions | ✅ Own | ❌ No | ❌ No | Own |
| **Placements** | ✅ Yes | ✅ Own | ✅ Limited (notes only) | ❌ No | ❌ No | Own |
| **Accounts** | ✅ Yes | ✅ All | ✅ Own (contact info only) | ❌ No | ❌ No | All (Read), Own (Edit) |
| **Contacts** | ✅ Yes | ✅ All | ✅ Own | ✅ Own | ❌ No | All (Read), Own (Edit) |
| **Activities** | ✅ Yes | ✅ Own + Related entities | ✅ Own | ✅ Own | ❌ No | Own |
| **Leads** | ✅ Yes | ✅ Own + Informed | ✅ Own | ❌ No | ❌ No | Own |
| **Deals** | ✅ Yes | ✅ Own + RACI | ✅ Own | ❌ No | ❌ No | Own + RACI |

### 5.2 Feature Permissions

| Feature | Access Level | Notes |
|---------|--------------|-------|
| **Job Pipeline View** | ✅ Full | Own jobs + RACI jobs |
| **Candidate Search** | ✅ Full | All candidates in org |
| **Resume Parsing** | ✅ Full | AI-powered resume extraction |
| **Activity Logging** | ✅ Full | All interactions tracked |
| **Interview Scheduling** | ✅ Full | Calendar integration |
| **Offer Management** | ✅ Full | Create, send, negotiate |
| **Placement Creation** | ✅ Full | Complete placement workflow |
| **Client Portal Access** | ✅ Limited | Can view client portal as admin |
| **Candidate Portal Access** | ✅ Limited | Can view candidate submissions |
| **Reports (Own Data)** | ✅ Full | Personal performance metrics |
| **Reports (Team Data)** | ❌ No | Manager only |
| **Analytics Dashboard** | ✅ Limited | Own metrics only |
| **Bulk Actions** | ✅ Limited | Max 25 records at once |
| **Import Candidates** | ✅ Full | CSV, LinkedIn, job boards |
| **Export Data** | ✅ Own Data | Own jobs, candidates, submissions |
| **Email Templates** | ✅ Full | Create, use, share |
| **Document Generation** | ✅ Full | Offer letters, submissions |
| **Calendar Sync** | ✅ Full | Google, Outlook integration |
| **System Settings** | ❌ No | Admin only |
| **User Management** | ❌ No | Admin only |
| **Pod Management** | ❌ No | Manager only |
| **Rate Overrides** | ✅ Limited | <10% margin change, else manager approval |
| **Commission View** | ✅ Own Only | Own commissions, not team |

### 5.3 Data Visibility Rules

| Data Type | Visibility | Filtering |
|-----------|------------|-----------|
| Jobs | Own + RACI (R, A, C, I) | By ownership, status, account |
| Candidates | All in Organization | By skills, status, location, visa |
| Submissions | Own jobs + Own candidates | By job, candidate, status |
| Placements | Own | By date, status, client |
| Accounts | All (Read-only unless owner) | By industry, status, owner |
| Contacts | All | By account, role |
| Activities | Own + Related entities | By type, date, entity |
| Reports | Own performance only | By date range |

---

## 6. Daily/Weekly/Monthly Cadence

> **Why This Matters:** Understanding the recruiter's day helps prioritize feature development. Features used in the "morning triage" (8-9 AM) need to be fast and reliable. The dashboard, notifications, and task views are critical path. Design UX around these natural workflow patterns.

### 6.1 Daily Workflow (8:00 AM - 5:00 PM)

```
MORNING (8:00 AM - 10:00 AM)
├─ 8:00 - 8:15    Check Today View Dashboard
│                 - Review today's interviews
│                 - Check pending tasks
│                 - See upcoming deadlines
│
├─ 8:15 - 8:45    Email & Message Triage
│                 - Client emails (priority)
│                 - Candidate responses
│                 - Internal messages
│                 - Update submission statuses
│
├─ 8:45 - 9:00    Stand-up Meeting (with Pod Manager)
│                 - Yesterday's wins
│                 - Today's priorities
│                 - Blockers
│
├─ 9:00 - 9:30    Follow-up Activities
│                 - Pending interviews (confirm)
│                 - Outstanding submissions (status check)
│                 - Offers (acceptance follow-up)
│
└─ 9:30 - 10:00   Client Relationship Calls
                  - Weekly check-ins
                  - Job status updates
                  - New opportunities discussion

MID-MORNING (10:00 AM - 12:00 PM)
├─ 10:00 - 11:30  Candidate Sourcing
│                 - LinkedIn searches
│                 - Job board reviews
│                 - Resume parsing
│                 - Hotlist additions
│                 - Target: 15 new profiles
│
└─ 11:30 - 12:00  Candidate Screening Calls
                  - Phone screens
                  - Skills assessment
                  - Availability confirmation
                  - Target: 2-3 screens

AFTERNOON (12:00 PM - 3:00 PM)
├─ 12:00 - 1:00   Lunch Break
│
├─ 1:00 - 2:00    Candidate Submissions
│                 - Prepare candidate write-ups
│                 - Match to jobs
│                 - Send to clients
│                 - Target: 1-2 submissions
│
└─ 2:00 - 3:00    Interview Preparation & Coordination
                  - Prep candidates for interviews
                  - Schedule interviews
                  - Collect feedback from completed interviews

LATE AFTERNOON (3:00 PM - 5:00 PM)
├─ 3:00 - 4:00    Pipeline Management
│                 - Update job statuses
│                 - Move candidates through stages
│                 - Log all activities
│                 - Update notes
│
├─ 4:00 - 4:30    BD & Lead Generation
│                 - LinkedIn outreach
│                 - Prospect research
│                 - Follow-up on leads
│                 - Target: 5 new prospects
│
└─ 4:30 - 5:00    EOD Wrap-up
                  - Review tomorrow's calendar
                  - Set priorities for next day
                  - Complete time-sensitive tasks
                  - Update dashboard
```

### 6.2 Weekly Cadence

**Monday:**
- 9:00 AM: Pod Stand-up (all week planning)
- 10:00 AM: Review open jobs, prioritize
- 11:00 AM: Client check-in calls (schedule 3-4 for week)
- Afternoon: Heavy sourcing day

**Tuesday:**
- Focus: Screening & Submissions
- 10:00 AM - 12:00 PM: Back-to-back phone screens
- 1:00 PM - 3:00 PM: Prepare and send submissions

**Wednesday:**
- Focus: Client meetings & BD
- 9:00 AM - 12:00 PM: Client meetings (in-person or video)
- 1:00 PM - 3:00 PM: BD calls, lead generation
- 3:00 PM - 5:00 PM: Follow-up on submissions

**Thursday:**
- Focus: Interview coordination & offer management
- 10:00 AM - 12:00 PM: Schedule interviews
- 1:00 PM - 3:00 PM: Interview prep with candidates
- 3:00 PM - 5:00 PM: Offer negotiations

**Friday:**
- 9:00 AM: Weekly metrics review with Pod Manager
- 10:00 AM - 12:00 PM: Pipeline cleanup
- 1:00 PM - 3:00 PM: Placement check-ins (30/60/90 day)
- 3:00 PM - 5:00 PM: Next week planning, lighter day

### 6.3 Monthly Cadence

**Week 1:**
- Sprint planning (2-week sprint kick-off)
- Set placement goals
- Review previous sprint results
- Monthly client NPS surveys

**Week 2:**
- Mid-sprint check-in
- Adjust tactics based on progress
- Focus on closing pending offers

**Week 3:**
- Sprint planning (new 2-week sprint)
- Account expansion planning
- Review quarterly BD goals

**Week 4:**
- Monthly one-on-one with Pod Manager
- Commission review
- Monthly performance review
- Training/skill development

**Monthly Activities:**
- New account creation: Target 1-2
- Account review meetings: All active clients
- BD pipeline review: Leads → Deals conversion
- 30/60/90 day placement check-ins: All recent placements

### 6.4 Quarterly Cadence

**Q1, Q2, Q3, Q4:**
- Quarterly Business Review (QBR) with Regional Director
- Account portfolio review
- Placement retention analysis
- BD pipeline health check
- Skills/training needs assessment
- Commission payout
- Goal setting for next quarter

---

## 7. Navigation & Screens

### 7.1 Sidebar Navigation

```
┌────────────────────────────────────┐
│  InTime OS                     [≡] │
├────────────────────────────────────┤
│                                    │
│  🏠 Today View              ✅ Full│
│  ✓ Tasks                    ✅ Full│
│                                    │
│  RECRUITING                        │
│  📋 Jobs                    ✅ Full│
│  👥 Candidates              ✅ Full│
│  📝 Submissions             ✅ Full│
│  🤝 Placements              ✅ Full│
│  📅 Interviews              ✅ Full│
│                                    │
│  BUSINESS DEVELOPMENT              │
│  🏢 Accounts                ✅ Full│
│  📞 Contacts                ✅ Full│
│  🎯 Leads                   ✅ Full│
│  💼 Deals                   ✅ Full│
│                                    │
│  ACTIVITY                          │
│  📝 Activities              ✅ Full│
│  📧 Email                   ✅ Full│
│  📞 Calls                   ✅ Full│
│                                    │
│  REPORTS                           │
│  📊 My Dashboard            ✅ Full│
│  📈 My Reports              ✅ Full│
│  🎯 Goals                   ✅ Full│
│                                    │
│  TOOLS                             │
│  📄 Documents               ✅ Full│
│  🔍 Search                  ✅ Full│
│  ⚙️ Settings (Own)          ✅ Full│
│                                    │
│  NO ACCESS                         │
│  👥 Team Analytics          ❌ No  │
│  🏗️ Pods                    ❌ No  │
│  👤 Users                   ❌ No  │
│  ⚙️ System Settings         ❌ No  │
│                                    │
└────────────────────────────────────┘
```

### 7.2 Screen Access Map

| Screen | Route | Access | Primary Actions |
|--------|-------|--------|-----------------|
| **Today View** | `/employee/workspace` | Full | View tasks, upcoming items, quick actions |
| **Tasks** | `/employee/workspace/tasks` | Full | View, create, complete tasks |
| **Jobs List** | `/employee/workspace/jobs` | Own + RACI | Create, filter, search, bulk actions |
| **Job Detail** | `/employee/workspace/jobs/[id]` | Own + RACI | Edit, publish, close, add candidates |
| **Candidates List** | `/employee/workspace/candidates` | All (org) | Create, search, filter, import |
| **Candidate Detail** | `/employee/workspace/candidates/[id]` | All (org) | Edit (own), add resume, submit to job |
| **Submissions List** | `/employee/workspace/submissions` | Own | Create, filter, update status |
| **Submission Detail** | `/employee/workspace/submissions/[id]` | Own | Edit, schedule interview, add feedback |
| **Placements List** | `/employee/workspace/placements` | Own | View, filter, check-in |
| **Placement Detail** | `/employee/workspace/placements/[id]` | Own | View, add notes, extend |
| **Interviews** | `/employee/workspace/interviews` | Own | Schedule, reschedule, add feedback |
| **Accounts List** | `/employee/workspace/accounts` | All (read) | Create, search, filter |
| **Account Detail** | `/employee/workspace/accounts/[id]` | All (read), Own (edit) | View, edit contacts, add jobs |
| **Contacts** | `/employee/workspace/contacts` | All | Create, search, filter |
| **Leads** | `/employee/workspace/leads` | Own | Create, qualify, convert to deal |
| **Deals** | `/employee/workspace/deals` | Own | Create, update stage, close/lose |
| **My Dashboard** | `/employee/workspace/dashboard` | Full | View metrics, KPIs, charts |
| **My Reports** | `/employee/workspace/reports` | Full | Generate reports, export |

### 7.3 Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Cmd/Ctrl + K` | Global Command Bar | Anywhere |
| `Cmd/Ctrl + N` | New Item (context-aware) | List pages |
| `Cmd/Ctrl + S` | Save | Forms |
| `Cmd/Ctrl + Enter` | Submit Form | Modals |
| `Escape` | Close Modal/Cancel | Modals |
| `g` then `j` | Go to Jobs | Anywhere |
| `g` then `c` | Go to Candidates | Anywhere |
| `g` then `s` | Go to Submissions | Anywhere |
| `g` then `p` | Go to Placements | Anywhere |
| `g` then `a` | Go to Accounts | Anywhere |
| `g` then `d` | Go to Dashboard | Anywhere |
| `l` | Log Activity | Detail pages |
| `e` | Edit Current Item | Detail pages |
| `?` | Show All Shortcuts | Anywhere |

---

## 8. Workflow Index (Section-Based Organization)

> **Why This Matters:** This is the master reference for all recruiter workflows. Each file follows a consistent structure. When implementing a user story, find the relevant spec here, then follow the Main Flow step-by-step. Priority indicates implementation order and business criticality.

The recruiter workflows are organized into 8 sections following the natural recruiting lifecycle:

### SECTION A: Campaigns and Lead Generation

| # | Workflow | File | Priority | Description |
|---|----------|------|----------|-------------|
| A01 | Run Campaign | [A01-run-campaign.md](./A01-run-campaign.md) | High | Create and manage outreach campaigns |
| A02 | Track Campaign Metrics | [A02-track-campaign-metrics.md](./A02-track-campaign-metrics.md) | Medium | Monitor campaign performance |
| A03 | Generate Lead from Campaign | [A03-generate-lead-from-campaign.md](./A03-generate-lead-from-campaign.md) | High | Convert responses to leads |
| A04 | Create Lead | [A04-create-lead.md](./A04-create-lead.md) | Medium | Manual lead creation |

### SECTION B: Lead Qualification and Deals

| # | Workflow | File | Priority | Description |
|---|----------|------|----------|-------------|
| B01 | Prospect New Client | [B01-prospect-new-client.md](./B01-prospect-new-client.md) | High | Outbound prospecting |
| B02 | Qualify Opportunity | [B02-qualify-opportunity.md](./B02-qualify-opportunity.md) | High | BANT qualification |
| B03 | Create Deal | [B03-create-deal.md](./B03-create-deal.md) | High | Create deal from qualified lead |
| B04 | Manage Deal Pipeline | [B04-manage-deal-pipeline.md](./B04-manage-deal-pipeline.md) | High | Track deals through stages |
| B05 | Close Deal | [B05-close-deal.md](./B05-close-deal.md) | Critical | Win/loss recording |

### SECTION C: Account Management

| # | Workflow | File | Priority | Description |
|---|----------|------|----------|-------------|
| C01 | Create Account | [C01-create-account.md](./C01-create-account.md) | Medium | Create from deal or manual |
| C02 | Onboard Account | [C02-onboard-account.md](./C02-onboard-account.md) | High | MSA, billing, contacts setup |
| C03 | Manage Account Profile | [C03-manage-account-profile.md](./C03-manage-account-profile.md) | Medium | Maintain file, POCs, categories |
| C04 | Manage Client Relationship | [C04-manage-client-relationship.md](./C04-manage-client-relationship.md) | Critical | Ongoing relationship |
| C05 | Conduct Client Meeting | [C05-conduct-client-meeting.md](./C05-conduct-client-meeting.md) | High | Job intake, status reviews |
| C06 | Handle Client Escalation | [C06-handle-client-escalation.md](./C06-handle-client-escalation.md) | Critical | Issue resolution |
| C07 | Take Job Requisition | [C07-take-job-requisition.md](./C07-take-job-requisition.md) | High | Document job requirements |

### SECTION D: Job Lifecycle

| # | Workflow | File | Priority | Description |
|---|----------|------|----------|-------------|
| D01 | Create Job | [D01-create-job.md](./D01-create-job.md) | Critical | Create job requisition |
| D02 | Publish Job | [D02-publish-job.md](./D02-publish-job.md) | High | Activate and distribute |
| D03 | Update Job | [D03-update-job.md](./D03-update-job.md) | Medium | Modify job details |
| D04 | Manage Job Pipeline | [D04-manage-pipeline.md](./D04-manage-pipeline.md) | High | Kanban pipeline |
| D05 | Update Job Status | [D05-update-job-status.md](./D05-update-job-status.md) | Medium | Status transitions |
| D06 | Close Job | [D06-close-job.md](./D06-close-job.md) | Medium | Fill, cancel, hold |

### SECTION E: Sourcing and Screening

| # | Workflow | File | Priority | Description |
|---|----------|------|----------|-------------|
| E01 | Source Candidates | [E01-source-candidates.md](./E01-source-candidates.md) | Critical | Multi-channel sourcing |
| E02 | Search Candidates | [E02-search-candidates.md](./E02-search-candidates.md) | Medium | ATS search/filtering |
| E03 | Screen Candidate | [E03-screen-candidate.md](./E03-screen-candidate.md) | Critical | Phone screen, assessment |
| E04 | Manage Hotlist | [E04-manage-hotlist.md](./E04-manage-hotlist.md) | Medium | Hot candidate list |
| E05 | Prepare Candidate Profile | [E05-prepare-candidate-profile.md](./E05-prepare-candidate-profile.md) | High | Format for presentation |

### SECTION F: Submission and Interview

| # | Workflow | File | Priority | Description |
|---|----------|------|----------|-------------|
| F01 | Submit Candidate | [F01-submit-candidate.md](./F01-submit-candidate.md) | Critical | Submit to client |
| F02 | Track Submission | [F02-track-submission.md](./F02-track-submission.md) | High | Follow-up cadence |
| F03 | Schedule Interview | [F03-schedule-interview.md](./F03-schedule-interview.md) | High | Interview coordination |
| F04 | Prepare Candidate for Interview | [F04-prepare-candidate-for-interview.md](./F04-prepare-candidate-for-interview.md) | High | Prep call, coaching |
| F05 | Coordinate Interview Rounds | [F05-coordinate-interview-rounds.md](./F05-coordinate-interview-rounds.md) | High | Multi-round management |
| F06 | Collect Interview Feedback | [F06-collect-interview-feedback.md](./F06-collect-interview-feedback.md) | High | Debrief process |

### SECTION G: Offers, Placements, and Commissions

| # | Workflow | File | Priority | Description |
|---|----------|------|----------|-------------|
| G01 | Extend Offer | [G01-extend-offer.md](./G01-extend-offer.md) | Critical | Create and send offer |
| G02 | Negotiate Offer | [G02-negotiate-offer.md](./G02-negotiate-offer.md) | High | Counter-offer handling |
| G03 | Confirm Placement | [G03-confirm-placement.md](./G03-confirm-placement.md) | Critical | Finalize placement |
| G04 | Manage Placement | [G04-manage-placement.md](./G04-manage-placement.md) | High | 30/60/90 check-ins |
| G05 | Track Commission | [G05-track-commission.md](./G05-track-commission.md) | High | 5% gross commission |
| G06 | Handle Extension | [G06-handle-extension.md](./G06-handle-extension.md) | Medium | Contract extensions |
| G07 | Handle Early Termination | [G07-handle-early-termination.md](./G07-handle-early-termination.md) | Critical | Fall-off process |
| - | Make Placement (Legacy) | [G08-make-placement.md](./G08-make-placement.md) | Reference | Legacy workflow |

### SECTION H: Daily Operations and Reporting

| # | Workflow | File | Priority | Description |
|---|----------|------|----------|-------------|
| H01 | Daily Workflow | [H01-daily-workflow.md](./H01-daily-workflow.md) | Reference | Daily structure |
| H02 | Log Activity | [H02-log-activity.md](./H02-log-activity.md) | Medium | Activity logging |
| H03 | Recruiter Dashboard | [H03-recruiter-dashboard.md](./H03-recruiter-dashboard.md) | High | Personal dashboard |
| H04 | Recruiter Reports | [H04-recruiter-reports.md](./H04-recruiter-reports.md) | Medium | Performance reports |

---

## 8.1 Commission Model

Technical Recruiters earn **5% of gross revenue** on all active placements:

```
Commission Calculation:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Monthly Revenue = Bill Rate × Hours Worked
Recruiter Commission = Monthly Revenue × 5%

Example (Contract Placement):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bill Rate:         $100/hr
Pay Rate:          $75/hr (25% margin)
Monthly Hours:     176
Monthly Revenue:   $17,600
Recruiter Commission: $880/month

Annual Commission (if 12-month contract): $10,560
```

**Commission Triggers:**
- Paid upon confirmed hours/invoicing
- Prorated for partial months
- Clawback if placement terminates <30 days
- Extensions continue commission accumulation

---

## 8.2 Enterprise & Multi-National Features

All recruiter workflows support enterprise-level operations:

| Feature | Implementation |
|---------|----------------|
| **Multi-Currency** | USD, CAD, EUR, GBP, INR, AUD - auto-conversion |
| **Timezone Support** | All dates/times in user's timezone |
| **Regional Teams** | NA, EMEA, APAC routing and permissions |
| **Compliance** | GDPR, CCPA, EEOC tracking built-in |
| **Audit Trail** | Every action logged with user, timestamp, IP |
| **Approval Workflows** | Rate overrides, high-value deals require approval |
| **Multi-Language** | UI supports EN, FR-CA, ES (content localization) |
| **Data Residency** | Region-specific data storage compliance |

---

## 8.3 Complete File Mapping

The recruiter specs are organized into logical sections. This table maps section codes to file names:

### Section A: Campaigns and Lead Generation

| Section Code | File Name | Status |
|--------------|-----------|--------|
| A01 | `A01-run-campaign.md` | NEW |
| A02 | `A02-track-campaign-metrics.md` | NEW |
| A03 | `A03-generate-lead-from-campaign.md` | NEW |
| A04 | `A04-create-lead.md` | Existing |

### Section B: Lead Qualification and Deals

| Section Code | File Name | Status |
|--------------|-----------|--------|
| B01 | `B01-prospect-new-client.md` | Existing |
| B02 | `B02-qualify-opportunity.md` | Existing |
| B03 | `B03-create-deal.md` | NEW |
| B04 | `B04-manage-deal-pipeline.md` | NEW |
| B05 | `B05-close-deal.md` | NEW |

### Section C: Account Management

| Section Code | File Name | Status |
|--------------|-----------|--------|
| C01 | `C01-create-account.md` | Existing (Enhanced) |
| C02 | `C02-onboard-account.md` | NEW |
| C03 | `C03-manage-account-profile.md` | NEW |
| C04 | `C04-manage-client-relationship.md` | Existing |
| C05 | `C05-conduct-client-meeting.md` | Existing |
| C06 | `C06-handle-client-escalation.md` | Existing |
| C07 | `C07-take-job-requisition.md` | NEW |

### Section D: Job Lifecycle

| Section Code | File Name | Status |
|--------------|-----------|--------|
| D01 | `D01-create-job.md` | Existing |
| D02 | `D02-publish-job.md` | Existing |
| D03 | `D03-update-job.md` | Existing |
| D04 | `D04-manage-pipeline.md` | Existing |
| D05 | `D05-update-job-status.md` | Existing |
| D06 | `D06-close-job.md` | Existing |

### Section E: Sourcing and Screening

| Section Code | File Name | Status |
|--------------|-----------|--------|
| E01 | `E01-source-candidates.md` | Existing (Enhanced) |
| E02 | `E02-search-candidates.md` | Existing |
| E03 | `E03-screen-candidate.md` | NEW |
| E04 | `E04-manage-hotlist.md` | NEW |
| E05 | `E05-prepare-candidate-profile.md` | NEW |

### Section F: Submission and Interview

| Section Code | File Name | Status |
|--------------|-----------|--------|
| F01 | `F01-submit-candidate.md` | Existing (Enhanced) |
| F02 | `F02-track-submission.md` | NEW |
| F03 | `F03-schedule-interview.md` | Existing |
| F04 | `F04-prepare-candidate-for-interview.md` | NEW |
| F05 | `F05-coordinate-interview-rounds.md` | NEW |
| F06 | `F06-collect-interview-feedback.md` | NEW |

### Section G: Offers, Placements, and Commissions

| Section Code | File Name | Status |
|--------------|-----------|--------|
| G01 | `G01-extend-offer.md` | Existing (Enhanced) |
| G02 | `G02-negotiate-offer.md` | NEW |
| G03 | `G03-confirm-placement.md` | Existing |
| G04 | `G04-manage-placement.md` | Existing (Enhanced) |
| G05 | `G05-track-commission.md` | NEW |
| G06 | `G06-handle-extension.md` | NEW |
| G07 | `G07-handle-early-termination.md` | NEW |

### Section H: Daily Operations and Reporting

| Section Code | File Name | Status |
|--------------|-----------|--------|
| H01 | `H01-daily-workflow.md` | Existing |
| H02 | `H02-log-activity.md` | Existing |
| H03 | `H03-recruiter-dashboard.md` | Existing |
| H04 | `H04-recruiter-reports.md` | Existing |
| H05 | `00-OVERVIEW.md` | This file |

### Summary Statistics

| Category | Existing | New | Enhanced | Total |
|----------|----------|-----|----------|-------|
| Campaigns (A) | 1 | 3 | - | 4 |
| Deals (B) | 2 | 3 | - | 5 |
| Accounts (C) | 4 | 3 | 1 | 7 |
| Jobs (D) | 6 | - | - | 6 |
| Sourcing (E) | 2 | 3 | 1 | 5 |
| Submissions (F) | 2 | 4 | 1 | 6 |
| Placements (G) | 4 | 4 | 2 | 8 |
| Operations (H) | 5 | - | - | 5 |
| **TOTAL** | **26** | **20** | **5** | **46** |

---

## 9. Training Requirements

### 9.1 Onboarding Program (Week 1-4)

**Week 1: System & Foundation**
- Day 1-2: InTime OS navigation (6 hours)
  - Dashboard walkthrough
  - Keyboard shortcuts mastery
  - Command bar usage
  - Entity relationships
- Day 3-4: Job workflow training (8 hours)
  - Creating jobs
  - Publishing jobs
  - Understanding RACI model
  - Job lifecycle management
- Day 5: Activity logging (4 hours)
  - Logging calls, emails, meetings
  - Best practices
  - Compliance requirements

**Week 2: Candidate Management**
- Day 1-2: Sourcing techniques (8 hours)
  - LinkedIn Recruiter training
  - Boolean search
  - Job board optimization
  - Resume parsing AI
- Day 3-4: Candidate profiles (8 hours)
  - Creating candidates
  - Managing resumes
  - Screening frameworks
  - Hotlist management
- Day 5: Submission process (4 hours)
  - Matching candidates to jobs
  - Writing compelling submissions
  - Client presentation

**Week 3: Client & BD**
- Day 1-2: Account management (8 hours)
  - Client relationship building
  - Meeting frameworks
  - Escalation handling
  - NPS tracking
- Day 3-4: Business development (8 hours)
  - Prospecting techniques
  - Lead qualification
  - Deal management
  - MSA process
- Day 5: Communication skills (4 hours)
  - Email templates
  - Phone scripts
  - Objection handling

**Week 4: Offers & Placements**
- Day 1-2: Offer management (8 hours)
  - Offer creation
  - Negotiation tactics
  - Acceptance strategies
  - Rate calculations
- Day 3-4: Placement workflow (8 hours)
  - Placement confirmation
  - Paperwork completion
  - Start date coordination
  - 30/60/90 day check-ins
- Day 5: Reporting & metrics (4 hours)
  - Dashboard usage
  - KPI tracking
  - Commission structure
  - Goal setting

### 9.2 Ongoing Training (Monthly)

- **Product Training:** New features, system updates (1 hour/month)
- **Skills Development:** Industry trends, tool mastery (2 hours/month)
- **Best Practices:** Peer learning, case studies (1 hour/month)
- **Compliance:** Legal updates, EEOC, privacy (1 hour/quarter)

### 9.3 Certifications & Milestones

| Milestone | Timeline | Criteria |
|-----------|----------|----------|
| **System Proficiency** | Week 4 | Pass navigation quiz, complete all workflows |
| **First Submission** | Week 2 | Submit candidate to client with approval |
| **First Placement** | Month 2-3 | Complete end-to-end placement |
| **BD Competency** | Month 3 | Create account, sign MSA, generate job |
| **Full Productivity** | Month 4 | Meet 50% of sprint targets consistently |
| **Senior Recruiter** | Month 12 | Meet 100%+ of targets for 3 consecutive months |

---

## 10. Success Criteria

### 10.1 Sprint Success (2-Week Sprint)

✅ **Minimum Viable Success:**
- 1 placement confirmed
- 5 submissions sent to clients
- 2 interviews scheduled
- 30 new candidates sourced
- $12K in placement revenue

✅ **Target Success:**
- 2 placements confirmed
- 10 submissions sent to clients
- 3 interviews scheduled
- 75 new candidates sourced
- $25K in placement revenue

✅ **Exceptional Success:**
- 3+ placements confirmed
- 15+ submissions sent
- 5+ interviews scheduled
- 100+ new candidates sourced
- $35K+ in placement revenue

### 10.2 Quality Standards

✅ **Client Satisfaction:**
- NPS score > 8/10
- < 3% client churn rate
- > 80% repeat business rate
- Zero escalations to Regional Director

✅ **Candidate Satisfaction:**
- NPS score > 8/10
- < 5% candidate drop-off after offer
- > 90% placement retention (30 days)
- > 85% placement retention (90 days)

✅ **Operational Excellence:**
- < 48 hours time-to-submit
- < 21 days time-to-fill
- > 30% interview-to-offer ratio
- > 85% offer acceptance rate
- 100% RACI compliance
- 100% activity logging

### 10.3 Business Development Success

✅ **Account Growth:**
- 1-2 new accounts per month
- 2 account expansions per quarter
- > 80% account retention rate
- > 70% lead-to-deal conversion

✅ **Pipeline Health:**
- 10+ qualified leads per week
- 3+ active deals per recruiter
- $100K+ pipeline value
- < 30 day average deal cycle

### 10.4 Career Progression Criteria

**Junior Recruiter (Month 0-6):**
- Learning mode
- 50% of targets acceptable
- Heavy manager support

**Recruiter (Month 7-12):**
- Meeting 80% of targets
- Minimal manager support
- Owns full client relationships

**Senior Recruiter (Month 13+):**
- Consistently exceeding 100% of targets
- Mentors junior recruiters
- Handles VIP clients
- Leads BD initiatives

---

## Appendix A: Common Scenarios

### A.1 Typical Day Timeline

**Best Case Day:**
- 2 phone screens → 2 submissions
- 1 interview → positive feedback
- 1 offer accepted → placement confirmed
- 3 client calls → 1 new job
- 15 candidates sourced

**Typical Day:**
- 3 phone screens → 1 submission
- 1 interview scheduled
- Follow-up on 2 pending offers
- 2 client calls → job updates
- 10 candidates sourced

**Challenging Day:**
- Interview no-show
- Offer rejected
- Client cancels job
- Lots of admin work
- Limited sourcing time

### A.2 Escalation Paths

**Issue:** Client unhappy with candidate quality
- **Level 1:** Recruiter addresses directly
- **Level 2 (if unresolved):** Pod Manager joins call
- **Level 3 (if still unresolved):** Regional Director intervention

**Issue:** Candidate drops out before start date
- **Immediate:** Notify client, Pod Manager, COO
- **24 hours:** Source replacement candidates
- **48 hours:** Submit new candidates

**Issue:** Placement terminated within 30 days
- **Immediate:** Understand reason, document
- **24 hours:** Offer free replacement to client
- **Week 1:** Source and submit replacements

---

## Appendix B: Quick Reference

### B.1 Entity Status Quick Reference

#### Job Statuses

| Status | Description | Can Transition To | Color |
|--------|-------------|-------------------|-------|
| `draft` | Job created but not published | `open`, `cancelled` | Gray |
| `open` | Actively accepting candidates | `urgent`, `on_hold`, `filled`, `cancelled` | Green |
| `urgent` | High priority, needs immediate attention | `open`, `on_hold`, `filled`, `cancelled` | Red |
| `on_hold` | Temporarily paused | `open`, `cancelled` | Yellow |
| `filled` | Position filled | `open` (reopen) | Blue |
| `cancelled` | Job cancelled | `open` (reopen) | Gray |

#### Submission Statuses

| Status | Description | Can Transition To |
|--------|-------------|-------------------|
| `sourced` | Candidate identified for job | `screening`, `withdrawn` |
| `screening` | Internal review in progress | `submitted`, `rejected` |
| `submitted` | Sent to client | `client_review`, `withdrawn` |
| `client_review` | Client reviewing | `interview`, `rejected` |
| `interview` | Interview scheduled/completed | `offer`, `rejected` |
| `offer` | Offer extended | `placed`, `rejected`, `declined` |
| `placed` | Candidate hired | - (terminal) |
| `rejected` | Client or recruiter rejected | - (terminal) |
| `withdrawn` | Removed from consideration | - (terminal) |

#### Placement Statuses

| Status | Description | Can Transition To |
|--------|-------------|-------------------|
| `pending_start` | Offer accepted, awaiting start | `active`, `cancelled` |
| `active` | Currently working | `extended`, `completed`, `terminated` |
| `extended` | Contract extended | `completed`, `terminated` |
| `completed` | Contract ended normally | - (terminal) |
| `terminated` | Ended early (fall-off) | - (terminal) |

### B.2 Rate & Margin Quick Reference

```
MARGIN CALCULATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bill Rate - Pay Rate = Margin ($/hr)
(Margin / Bill Rate) × 100 = Margin %

MARGIN GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
< 15%    → Not Allowed (requires CFO approval)
15-20%   → Low Margin (requires Manager approval)
20-35%   → Target Range (auto-approved)
> 35%    → High Margin (competitive review)

COMMISSION CALCULATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bill Rate × Hours × 5% = Recruiter Commission

Example: $100/hr × 176 hrs × 5% = $880/month
```

### B.3 RACI Quick Reference

| Object | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|--------|-----------------|-----------------|---------------|--------------|
| Campaign | Creator | Creator | - | Pod Manager |
| Lead | Creator | Creator | Pod Manager | - |
| Deal | Creator | Pod Manager | Finance | COO |
| Account | Owner | Pod Manager | Regional Dir | COO |
| Job | Owner | Pod Manager | Secondary Rec | COO |
| Submission | Job Owner | Pod Manager | - | Candidate |
| Interview | Sub Owner | Sub Owner | - | Client |
| Offer | Sub Owner | Pod Manager | Finance | HR |
| Placement | Offer Owner | Pod Manager | Finance, HR | COO |

### B.4 Common Error Codes

| Code | Meaning | Resolution |
|------|---------|------------|
| `E001` | Duplicate entity | Check for existing record |
| `E002` | Missing required field | Fill all required fields |
| `E003` | Invalid status transition | Check allowed transitions |
| `E004` | Permission denied | Contact Pod Manager |
| `E005` | Rate below minimum margin | Adjust rates or get approval |
| `E006` | Entity not found | Verify ID, check permissions |
| `E007` | Validation failed | Review field requirements |
| `E008` | External service error | Retry or contact support |

### B.5 Keyboard Shortcuts Summary

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Command bar |
| `Cmd/Ctrl + N` | New item |
| `g` → `j` | Go to Jobs |
| `g` → `c` | Go to Candidates |
| `g` → `s` | Go to Submissions |
| `g` → `p` | Go to Placements |
| `l` | Log activity |
| `e` | Edit current |
| `?` | Show shortcuts |

### B.6 API Endpoint Patterns

```
BASE: /api/trpc/

ENTITIES:
├── campaigns.[create|get|update|list]
├── leads.[create|get|update|list|qualify]
├── deals.[create|get|update|list|close]
├── accounts.[create|get|update|list]
├── jobs.[create|get|update|list|publish|close]
├── candidates.[create|get|update|list|search]
├── submissions.[create|get|update|list|submit]
├── interviews.[create|get|update|list|schedule]
├── offers.[create|get|update|list|extend]
├── placements.[create|get|update|list|checkin]
└── commissions.[get|list|calculate]
```

---

**Last Updated:** 2025-12-05
**Version:** 4.0
**Maintained By:** Product Team
**Next Review:** 2026-02-05



