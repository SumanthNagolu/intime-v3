# InTime v3 - Implementation Roadmap

Step-by-step plan for implementing all entities and features.

---

## Implementation Phases

```
Phase 0: Foundation        ──► Phase 1: Core Entities    ──► Phase 2: Workflows
(Infrastructure)               (Root + Supporting)            (Workplan)
     │                              │                              │
     ▼                              ▼                              ▼
Phase 3: Portals           ──► Phase 4: AI Integration   ──► Phase 5: Polish
(Client, Talent, Academy)      (Twins, Matching)              (Performance, UX)
```

---

## Phase 0: Foundation (Complete)

### Infrastructure
- [x] Next.js 15 + React 19 setup
- [x] Supabase project + PostgreSQL
- [x] Drizzle ORM configuration
- [x] tRPC setup with auth middleware
- [x] shadcn/ui component library
- [x] Multi-tenant middleware

### Core Schemas
- [x] User profiles + organizations
- [x] RBAC (roles, permissions)
- [x] Workplan schema (templates, patterns, activities)
- [x] Audit logging

### Dev Tooling
- [x] Entity conversion commands
- [x] Skills documentation
- [x] MCP presets (coding, testing, full)

---

## Phase 1: Core Entities

### Priority Order

Entities are implemented in dependency order:

```
Week 1-2: CRM Foundation
├── 1. Account (Supporting) - No dependencies
├── 2. Lead (Root) - References Account
└── 3. Deal (Root) - References Account, Lead

Week 3-4: ATS Foundation
├── 4. Candidate (Supporting) - No dependencies
├── 5. Job (Root) - References Account
└── 6. Submission (Root) - References Job, Candidate

Week 5-6: Complete ATS
├── 7. Interview (Supporting) - References Submission
├── 8. Offer (Supporting) - References Submission
└── 9. Placement (Root) - References Submission, Offer

Week 7-8: Bench Sales
├── 10. Hotlist Entry (from Candidate)
└── 11. Bench Deal (Root) - References Candidate
```

### Per-Entity Implementation Steps

For each entity, run in sequence:

```bash
# Phase 1: Configuration (~15 min)
/convert-entity-config [entity]
git commit -m "feat([domain]): add [entity] entity configuration"

# Phase 2: Backend (~30 min)
/convert-entity-backend [entity]
git commit -m "feat([domain]): add [entity] backend procedures"

# Phase 3: Frontend + Tests (~45 min)
/convert-entity-ui [entity]
# Verify all tests pass
git commit -m "feat([domain]): add [entity] frontend + E2E tests"
```

---

## Entity Implementation Details

### 1. Account (CRM - Supporting)

**Priority:** 1 (No dependencies)

```bash
/convert-entity-config account
/convert-entity-backend account
/convert-entity-ui account
```

**Key Fields:**
- name, industry, website
- status (prospect, active, inactive, churned)
- tier (enterprise, mid_market, smb)
- primaryPocId, assignedToId

**No Workplan** (Supporting entity)

---

### 2. Lead (CRM - Root)

**Priority:** 2 (References Account)

```bash
/convert-entity-config lead
/convert-entity-backend lead
/convert-entity-ui lead
```

**Key Fields:**
- companyName, firstName, lastName, email, phone
- status (new, contacted, qualified, converted, lost)
- source, tier
- BANT scores (budget, authority, need, timeline)
- estimatedValue, expectedCloseDate

**Workplan Template:** `lead_workflow`
```
lead_created
  → initial_contact (Day 0)
  → qualification_call (Day 1)
  → follow_up_email (Day 3)
  → second_follow_up (Day 7)
  → lead_review (Day 14)
```

**Special Features:**
- BANT qualification section
- Convert to Deal/Account action
- Loss reason tracking

---

### 3. Deal (CRM - Root)

**Priority:** 3 (References Account, Lead)

```bash
/convert-entity-config deal
/convert-entity-backend deal
/convert-entity-ui deal
```

**Key Fields:**
- name, description
- accountId, leadId (source)
- value, probability
- stage (new, qualified, proposal, negotiation, closed_won, closed_lost)
- expectedCloseDate

**Workplan Template:** `deal_workflow`
```
deal_created
  → discovery_meeting (Day 0)
  → proposal_preparation (Day 3)
  → proposal_presentation (Day 7)
  → negotiation_call (on proposal_sent)
  → close_attempt (Day 14)
```

**Special Features:**
- Pipeline kanban view
- Win/loss analysis
- Links to Jobs

---

### 4. Candidate (ATS - Supporting)

**Priority:** 4 (No dependencies)

```bash
/convert-entity-config candidate
/convert-entity-backend candidate
/convert-entity-ui candidate
```

**Key Fields:**
- Personal: firstName, lastName, email, phone
- Professional: title, yearsExperience, skills[]
- Work Auth: visaStatus, visaType, visaExpiry
- Education, Experience (JSON)
- Resume URL

**No Workplan** (Supporting entity)

**Special Features:**
- Multi-tab profile (Personal, Professional, Experience, Education, Skills)
- Resume upload/parsing
- Skills matching

---

### 5. Job (ATS - Root)

**Priority:** 5 (References Account)

```bash
/convert-entity-config job
/convert-entity-backend job
/convert-entity-ui job
```

**Key Fields:**
- title, description, jobType
- accountId, dealId
- location, isRemote
- salaryMin, salaryMax, rateType
- requiredSkills[], niceToHaveSkills[]
- status (draft, open, on_hold, filled, cancelled)
- openings, filledCount

**Workplan Template:** `job_workflow`
```
job_created
  → requirements_review (Day 0)
  → sourcing_kickoff (Day 1)
  → first_submission_check (Day 3)
  → weekly_review (Day 7, recurring)
```

**Special Features:**
- Skills InputSet
- Position tracking (openings vs filled)
- Link to submissions

---

### 6. Submission (ATS - Root)

**Priority:** 6 (References Job, Candidate)

```bash
/convert-entity-config submission
/convert-entity-backend submission
/convert-entity-ui submission
```

**Key Fields:**
- jobId, candidateId
- status (full pipeline)
- recruiterNotes, clientFeedback
- billRate, payRate
- submittedAt, placedAt

**Status Pipeline:**
```
sourced → screening → submission_ready →
submitted_to_client → client_review → client_interview →
offer_stage → placed | rejected
```

**Workplan Template:** `submission_workflow`
```
submission_created
  → candidate_prep_call (Day 0)
  → client_submission (Day 1)
  → client_follow_up (Day 3)
  → interview_scheduling (on client_review)
  → post_interview_debrief (on interview_complete)
```

**Special Features:**
- Pipeline kanban view
- Client feedback tracking
- Rate management

---

### 7. Interview (ATS - Supporting)

**Priority:** 7 (References Submission)

```bash
/convert-entity-config interview
/convert-entity-backend interview
/convert-entity-ui interview
```

**Key Fields:**
- submissionId
- type (phone, video, onsite, panel)
- scheduledAt, duration
- interviewers[]
- status (scheduled, confirmed, completed, no_show, cancelled)
- feedback, rating

**No Workplan** (Supporting entity)

**Special Features:**
- Calendar integration
- Interviewer assignment
- Feedback forms

---

### 8. Offer (ATS - Supporting)

**Priority:** 8 (References Submission)

```bash
/convert-entity-config offer
/convert-entity-backend offer
/convert-entity-ui offer
```

**Key Fields:**
- submissionId
- salary, signOnBonus
- startDate, benefits
- status (draft, sent, countered, accepted, declined, expired)
- expiresAt
- counterOffer (JSON)

**No Workplan** (Supporting entity)

**Special Features:**
- Offer letter generation
- Counter-offer tracking
- Expiration management

---

### 9. Placement (ATS - Root)

**Priority:** 9 (References Submission, Offer)

```bash
/convert-entity-config placement
/convert-entity-backend placement
/convert-entity-ui placement
```

**Key Fields:**
- submissionId, offerId
- candidateId, jobId, accountId
- startDate, endDate
- billRate, payRate, margin
- status (active, extended, completed, terminated)

**Workplan Template:** `placement_workflow`
```
placement_started
  → onboarding_check (Day 1)
  → first_week_check (Day 7)
  → monthly_check (Day 30, recurring)
  → extension_review (30 days before end)
```

**Special Features:**
- Active engagement tracking
- Extension management
- Margin calculation

---

## Phase 2: Workplan System

### Workplan Templates Setup

Create templates for all root entities:

```sql
-- Lead workflow
INSERT INTO workplan_templates (code, name, entity_type, trigger_event)
VALUES ('lead_workflow', 'Lead Workflow', 'lead', 'create');

-- Job workflow
INSERT INTO workplan_templates (code, name, entity_type, trigger_event)
VALUES ('job_workflow', 'Job Workflow', 'job', 'create');

-- Submission workflow
INSERT INTO workplan_templates (code, name, entity_type, trigger_event)
VALUES ('submission_workflow', 'Submission Workflow', 'submission', 'create');

-- Deal workflow
INSERT INTO workplan_templates (code, name, entity_type, trigger_event)
VALUES ('deal_workflow', 'Deal Workflow', 'deal', 'create');

-- Placement workflow
INSERT INTO workplan_templates (code, name, entity_type, trigger_event)
VALUES ('placement_workflow', 'Placement Workflow', 'placement', 'create');
```

### Activity Patterns

Create activity patterns for each workflow:

```sql
-- Lead patterns
INSERT INTO activity_patterns (code, name, entity_type, category, target_days, priority)
VALUES
  ('lead_initial_contact', 'Initial Contact', 'lead', 'call', 0, 'high'),
  ('lead_qualification', 'Qualification Call', 'lead', 'call', 1, 'high'),
  ('lead_follow_up', 'Follow-up Email', 'lead', 'email', 3, 'normal'),
  ('lead_review', 'Lead Review', 'lead', 'task', 14, 'normal');
```

### Pattern Successors

Link patterns in chains:

```sql
-- When qualification is completed, schedule follow-up
INSERT INTO activity_pattern_successors (pattern_id, successor_pattern_id, trigger_on, delay_days)
SELECT p.id, s.id, 'complete', 2
FROM activity_patterns p, activity_patterns s
WHERE p.code = 'lead_qualification' AND s.code = 'lead_follow_up';
```

---

## Phase 3: Portals

### Employee Portal (Internal)
- [x] Auth + RBAC
- [ ] Recruiting dashboard
- [ ] CRM dashboard
- [ ] Bench sales dashboard
- [ ] HR dashboard
- [ ] Admin dashboard

### Academy Portal
- [ ] Student dashboard
- [ ] Course catalog
- [ ] Learning paths
- [ ] XP/Gamification
- [ ] Certificates

### Client Portal
- [ ] Job requisitions
- [ ] Candidate review
- [ ] Interview scheduling
- [ ] Feedback submission

### Talent Portal
- [ ] Profile management
- [ ] Job search
- [ ] Application tracking
- [ ] Document upload

---

## Phase 4: AI Integration

### Employee Twins
- [ ] Recruiter Twin
- [ ] Sales Twin
- [ ] Manager Twin
- [ ] HR Twin

### Features
- [ ] Morning briefings
- [ ] Candidate-job matching
- [ ] Follow-up suggestions
- [ ] Email drafting
- [ ] Interview prep

---

## Phase 5: Polish

### Performance
- [ ] Query optimization
- [ ] Caching strategy
- [ ] Image optimization
- [ ] Bundle size reduction

### UX
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Accessibility
- [ ] Mobile responsiveness

### Testing
- [ ] Unit test coverage
- [ ] Integration tests
- [ ] E2E test suite
- [ ] Performance tests

---

## Progress Tracking

### Entity Status

| Entity | Config | Backend | Frontend | Tests | Workplan |
|--------|--------|---------|----------|-------|----------|
| Account | ⬜ | ⬜ | ⬜ | ⬜ | N/A |
| Lead | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Deal | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Candidate | ⬜ | ⬜ | ⬜ | ⬜ | N/A |
| Job | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Submission | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Interview | ⬜ | ⬜ | ⬜ | ⬜ | N/A |
| Offer | ⬜ | ⬜ | ⬜ | ⬜ | N/A |
| Placement | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

Legend: ⬜ Not started | 🟡 In Progress | ✅ Complete

---

## Commands Reference

```bash
# Entity conversion
/convert-entity [entity]           # Full conversion
/convert-entity-config [entity]    # Phase 1: Config only
/convert-entity-backend [entity]   # Phase 2: Backend only
/convert-entity-ui [entity]        # Phase 3: Frontend + tests

# Sync and verification
/sync-entity [entity]              # Audit alignment

# Module rollout
/rollout/00-master-rollout         # Full deployment
/rollout/05-recruiting             # Recruiting module
```

---

## Next Steps

1. Start with Phase 1, Entity 1 (Account)
2. Run `/convert-entity-config account`
3. Continue through each entity in priority order
4. Commit after each phase
5. Update progress tracking table

**Command to start:**
```bash
/convert-entity-config account
```
