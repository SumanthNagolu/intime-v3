# InTime v3 - Master Implementation Guide

**Created:** 2025-12-10
**Updated:** 2025-12-11
**Status:** FINAL (Architecture Review + Gap Analysis Complete)
**Total Issues:** 25 (was 23, added ADDRESSES-01, ENTITIES-01)
**Estimated Effort:** 18-22 weeks

---

## Executive Summary

This guide provides the **definitive implementation order** for transforming InTime v3 into an enterprise-grade ATS/CRM/Staffing platform. The order is based on:

1. **Dependency analysis** - What must exist before what
2. **Foundation first** - Core entities before dependent systems
3. **Revenue path** - Prioritize the money flow (placements → timesheets → invoices → payroll)
4. **Risk mitigation** - Smaller, validated wins before complex migrations

### Architecture Review Changes (2025-12-11)

| Change | Reason |
|--------|--------|
| **Added OFFERS-01** | Critical ATS pipeline gap between interviews and placements |
| **Added ONBOARDING-01** | Critical gap: consultant onboarding workflow after offer acceptance |
| **Fixed COMMS-01 dependencies** | Removed circular dependency with CAMPAIGNS-01 |
| **Fixed 6+ dependency declarations** | Issues were missing required dependencies |
| **Standardized entity_type values** | Removed 'employee', 'lead' - use 'contact' with extensions |
| **Clarified CONTACTS-01 scope** | 7 tables moved to their proper issues |
| **Added standard sections** | RLS, Indexes, Migration, Rollback templates to all issues |
| **Added missing fields** | Source tracking (CONTACTS), job posting (JOBS), scoring (SUBMISSIONS), change orders (PLACEMENTS) |
| **Added workflow triggers** | COMPLIANCE-01 now supports auto-workflows on expiry |
| **Added ADDRESSES-01** | Documentation for existing centralized addresses system |
| **Added ENTITIES-01** | Polymorphic Entity Resolution Service |
| **Reordered Wave 6** | Resolved circular dependency (Workflows ↔ Notifications) |

---

## Pre-Flight Checks (CRITICAL)

Before starting **Wave 2 (Contacts)**, you must run these validation checks. If these fail, the migration scripts will corrupt data.

1. **For CONTACTS-01:**
   - **Duplicate Email Check:** Ensure no two candidates share an email, or the merge logic will fail.
   - **Orphaned Records:** Check for submissions referencing non-existent candidates.

2. **For ACCOUNTS-02:**
   - **Name Collisions:** Ensure no Vendor has the exact same name as a Client, or the unification might merge them incorrectly.

---

## Final Implementation Order (25 Issues)

### WAVE 0: Completed & Partial Work
*Accurate status based on schema analysis*

| Issue | Phase | Status | What Exists | What's Missing |
|-------|-------|--------|-------------|----------------|
| **ADDRESSES-01** | - | ✅ **DONE** | `addresses` table | Documentation created |
| **ACCOUNTS-02** | - | ✅ **DONE** | `companies` table | - |
| **CONTACTS-01** | Phase 1 | ✅ **DONE** | `contacts` base + extensions | - |
| **CONTACTS-01** | Phase 2 (Leads) | ⚠️ **PARTIAL** | `contact_lead_data` exists | Legacy `leads` table not deprecated |
| **CONTACTS-01** | Phase 3 (Bench) | ❌ **NOT DONE** | - | `contact_bench_data` missing, `bench_consultants` still separate |

---

### WAVE 1: Foundation (Parallel - No Dependencies)
*Polymorphic infrastructure tables*

| # | Issue ID | Title | Priority | Status | Effort |
|---|----------|-------|----------|--------|--------|
| **01** | **ENTITIES-01** | **Entity Resolution Service** | **High** | **🔴 TODO** | **0.5 week** |
| **02** | SKILLS-01 | Skills Taxonomy & Matching | Critical | 🔴 TODO | 1 week |
| **03** | DOCS-01 | Centralized Documents System | High | 🔴 TODO | 1 week |
| **04** | NOTES-01 | Centralized Notes System | Medium | 🔴 TODO | 0.5 week |
| **05** | HISTORY-01 | Unified Audit Trail | High | 🔴 TODO | 1 week |

**Rationale:** These are foundation tables with NO dependencies. Can be implemented in parallel.

---

### WAVE 2: Complete CONTACTS-01
*Finish unified contacts before dependent systems*

| # | Issue ID | Title | Priority | Status | Effort |
|---|----------|-------|----------|--------|--------|
| **06** | CONTACTS-01 Phase 2 | Deprecate legacy `leads` table | High | ⚠️ PARTIAL | 0.5 week |
| **07** | CONTACTS-01 Phase 3 | Bench Integration - Create `contact_bench_data` | High | 🔴 TODO | 1 week |

**👉 CONTACTS-01 Scope Clarification:**

CONTACTS-01 should ONLY cover:
- Core contacts table enhancement (subtypes, categories)
- `contact_relationships` (person↔company, person↔person)
- `contact_roles` (multiple concurrent roles)
- `contact_work_history` (employment history)
- `contact_education` (degrees, schools)
- `contact_pipeline_stages` (sales/recruiting funnel)
- `contact_merge_history` (deduplication audit)

**Removed from CONTACTS-01** (handled by their proper issues):
| Table | Moved To | Reason |
|-------|----------|--------|
| contact_skills | SKILLS-01 | entity_skills polymorphic table |
| contact_certifications | SKILLS-01 | certifications polymorphic table |
| contact_rate_cards | RATES-01 | entity_rates polymorphic table |
| contact_agreements | CONTRACTS-01 | contracts polymorphic table |
| contact_compliance | COMPLIANCE-01 | compliance_items polymorphic table |
| contact_campaign_enrollments | CAMPAIGNS-01 | campaign_prospects table |
| contact_communication_preferences | COMMS-01 | communication_preferences table |

---

### WAVE 3: Legal & Financial Infrastructure
*Compliance, contracts, and rate management*

| # | Issue ID | Title | Priority | Depends On | Effort |
|---|----------|-------|----------|------------|--------|
| **08** | COMPLIANCE-01 | Compliance Tracking System | High | DOCS-01 | 1 week |
| **09** | CONTRACTS-01 | Contract Management System | High | DOCS-01, CONTACTS-01, ACCOUNTS-02 | 1 week |
| **10** | RATES-01 | Entity Rate Cards System | High | CONTACTS-01, ACCOUNTS-02 | 1 week |

**Dependency Fixes Applied:**
- CONTRACTS-01: Added CONTACTS-01, ACCOUNTS-02 (contracts reference both)
- RATES-01: Added ACCOUNTS-02 (company rate cards)

---

### WAVE 4: ATS Pipeline
*The core recruiting workflow*

| # | Issue ID | Title | Priority | Depends On | Effort |
|---|----------|-------|----------|------------|--------|
| **11** | JOBS-01 | Jobs Migration | Critical | SKILLS-01, ACCOUNTS-02, CONTACTS-01 | 1.5 weeks |
| **12** | SUBMISSIONS-01 | Submissions Migration | Critical | JOBS-01, CONTACTS-01 | 1.5 weeks |
| **13** | INTERVIEWS-01 | Interviews System Cleanup | High | SUBMISSIONS-01, CONTACTS-01 | 1 week |
| **14** | **OFFERS-01** | **Offers & Negotiations** | **Critical** | **INTERVIEWS-01, CONTACTS-01, RATES-01** | **1 week** |
| **15** | PLACEMENTS-01 | Placements Migration | Critical | OFFERS-01, RATES-01, CONTRACTS-01 | 1.5 weeks |
| **16** | **ONBOARDING-01** | **Consultant Onboarding** | **Critical** | **PLACEMENTS-01, CONTACTS-01, COMPLIANCE-01, DOCS-01** | **1 week** |

**⚠️ CRITICAL: OFFERS-01 & ONBOARDING-01 are NEW**

**OFFERS-01** fills a critical gap in the ATS pipeline:
- Tracks offer extended, negotiation, acceptance, decline
- Captures counter-offers with version history
- Enables offer-to-placement conversion metrics
- Without this, pipeline jumps directly from interview to placement

**ONBOARDING-01** fills a critical gap in staffing operations:
- Manages consultant onboarding workflow from offer acceptance to first day
- Tracks I-9, background checks, equipment, client-specific requirements
- Template-based checklists per client/placement type
- Integration with COMPLIANCE-01 for auto-creating compliance items

---

### WAVE 5: Revenue Operations
*The money flow: Time → Invoice → Payment*

| # | Issue ID | Title | Priority | Depends On | Effort |
|---|----------|-------|----------|------------|--------|
| **17** | TIMESHEETS-01 | Enterprise Timesheet System | Critical | PLACEMENTS-01, RATES-01 | 1.5 weeks |
| **18** | INVOICES-01 | Invoicing System | Critical | TIMESHEETS-01, RATES-01 | 1.5 weeks |
| **19** | PAYROLL-01 | Payroll Processing System | High | TIMESHEETS-01, RATES-01, CONTRACTS-01, COMPLIANCE-01 | 1.5 weeks |

**Dependency Fixes Applied:**
- TIMESHEETS-01: Added RATES-01 (timesheets use rates from placements)
- PAYROLL-01: Added COMPLIANCE-01 (payroll needs tax compliance)

---

### WAVE 6: CRM & Automation
*Sales pipeline and system automation*

| # | Issue ID | Title | Priority | Depends On | Effort |
|---|----------|-------|----------|------------|--------|
| **20** | DEALS-01 | CRM Deals Migration | Medium | CONTACTS-01, ACCOUNTS-02, HISTORY-01 | 1 week |
| **21** | COMMS-01 | Communications System | Medium | CONTACTS-01, DOCS-01 | 1 week |
| **22** | **WORKFLOWS-01** | **Workflow Automation (Phase 1)** | **High** | **HISTORY-01, CONTACTS-01, ACCOUNTS-02** | **1 week** |
| **23** | **NOTIFICATIONS-01** | **Notification System** | **High** | **CONTACTS-01** | **1 week** |
| **24** | **WORKFLOWS-01** | **Workflow Automation (Phase 2)** | **High** | **NOTIFICATIONS-01** | **0.5 week** |
| **25** | **CAMPAIGNS-01** | **Campaign Management System** | **Medium** | **COMMS-01, CONTACTS-01, ACCOUNTS-02** | **1.5 weeks** |

**Dependency Fixes Applied:**
- COMMS-01: Removed CAMPAIGNS-01 (was circular), added DOCS-01 (attachments)
- WORKFLOWS-01: Split into Phase 1 (Core) and Phase 2 (Notifications) to avoid circular dependency.
- CAMPAIGNS-01: Depends on COMMS-01 directly (not via WORKFLOWS-01).

---

### Reference (Not Numbered - Superseded/Merged)

| Issue ID | Status | Notes |
|----------|--------|-------|
| LEADS-01 | Merged into CONTACTS-01 | Phase 2 of CONTACTS-01 |
| CONSULTANTS-01 | Merged into CONTACTS-01 | Phase 3 of CONTACTS-01 |

---

## Dependency Graph (Corrected)

```
                         ┌─────────────────┐
                         │     START       │
                         └────────┬────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│  01: ENTITIES │         │  02: SKILLS   │         │  03: DOCS     │
│  (resolution) │         │  (taxonomy)   │         │  (documents)  │
└───────┬───────┘         └───────┬───────┘         └───────┬───────┘
        │                         │                         │
        │                         │                 ┌───────┴───────┐
        │                         │                 │  04: NOTES    │
        │                         │                 │  05: HISTORY  │
        │                         │                 └───────┬───────┘
        │                         │                         │
        │                 ┌───────┴───────┐                 │
        │                 │               │                 │
        │                 ▼               ▼                 │
        │         ┌───────────────┐  ┌───────────────┐     │
        │         │08: COMPLIANCE │  │09: CONTRACTS  │     │
        │         │  (requires)   │  │  (docs+accts) │     │
        │         └───────────────┘  └───────────────┘     │
        │                                                   │
        ├───────────────────────────────────────────────────┤
        │                                                   │
        ▼                                                   ▼
┌───────────────┐                                   ┌───────────────┐
│ 06-07: CONTACTS│                                  │  10: RATES    │
│  (Phase 2+3)  │                                   │  (rate cards) │
└───────┬───────┘                                   └───────┬───────┘
        │                                                   │
        ├───────────────────────────────────────────────────┤
        │                                                   │
        ▼                                                   │
┌───────────────┐                                           │
│   11: JOBS    │◄──────────────────────────────────────────┤
│  (requisitions)│                                          │
└───────┬───────┘                                           │
        │                                                   │
        ▼                                                   │
┌───────────────┐                                           │
│12: SUBMISSIONS│                                           │
│  (candidates) │                                           │
└───────┬───────┘                                           │
        │                                                   │
        ▼                                                   │
┌───────────────┐                                           │
│13: INTERVIEWS │                                           │
│  (screening)  │                                           │
└───────┬───────┘                                           │
        │                                                   │
        ▼                                                   │
┌───────────────┐◄──────────────────────────────────────────┤
│ 14: OFFERS    │  (NEW - critical pipeline step)          │
│  (negotiate)  │                                           │
└───────┬───────┘                                           │
        │                                                   │
        ▼                                                   │
┌───────────────┐◄──────────────────────────────────────────┘
│15: PLACEMENTS │
│  (assignments)│
└───────┬───────┘
        │
        ▼
┌───────────────┐
│16: ONBOARDING │  (NEW - critical for staffing ops)
│  (consultant) │
└───────┬───────┘
        │
        ├─────────────────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌───────────────┐
│17: TIMESHEETS │         │ 19: PAYROLL   │
│  (time entry) │────────►│  (payment)    │
└───────┬───────┘         └───────────────┘
        │
        ▼
┌───────────────┐
│ 18: INVOICES  │
│  (billing)    │
└───────────────┘

        ════════════════════════════════════
                   WAVE 6: CRM/AUTOMATION
        ════════════════════════════════════

┌───────────────┐         ┌───────────────┐
│  20: DEALS    │         │  21: COMMS    │
│  (sales pipe) │         │  (messaging)  │
└───────────────┘         └───────┬───────┘
                                  │
┌───────────────┐         ┌───────┴───────┐
│ 22: WORKFLOWS │────────►│ 25: CAMPAIGNS │
│  (Phase 1)    │         │  (marketing)  │
└───────┬───────┘         └───────────────┘
        │
        ▼
┌───────────────┐
│23: NOTIFICATIONS│
│  (alerts)     │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│24: WORKFLOWS  │
│  (Phase 2)    │
└───────────────┘
```

---

## Canonical Entity Types

**CRITICAL: Use these exact values for all polymorphic entity_type columns**

```sql
-- Primary entities
'contact'         -- All people (prospects, leads, candidates, employees, etc.)
'company'         -- All organizations (clients, vendors, partners, etc.)

-- ATS entities
'job'             -- Job requisitions
'submission'      -- Candidate submissions to jobs
'interview'       -- Interview records
'offer'           -- Offer records (NEW)
'placement'       -- Active placements/assignments
'onboarding'      -- Onboarding checklist instances (NEW)

-- Financial entities
'timesheet'       -- Time entry records
'timesheet_entry' -- Individual timesheet day entries (NEW)
'invoice'         -- Client invoices
'payment'         -- Payment records
'expense'         -- Expense reports (NEW)
'pay_item'        -- Payroll item (NEW)

-- CRM entities
'deal'            -- Sales opportunities
'campaign'        -- Marketing campaigns

-- Infrastructure entities
'contract'        -- Legal contracts
'document'        -- Uploaded documents
'note'            -- Persistent notes
'communication'   -- Email/SMS/call logs
```

**⚠️ DO NOT USE:**
- `'employee'` → Use `'contact'` + check subtype or `contact_employee_data`
- `'lead'` → Use `'contact'` + check `contact_lead_data` extension
- `'candidate'` → Use `'contact'` + check subtype
- `'prospect'` → Use `'contact'` + check subtype
- `'vendor'` → Use `'company'` + check category

---

## Standard Issue Sections

**Every issue MUST include these sections:**

### 1. RLS Policy Specification
```sql
-- Tenant isolation (REQUIRED)
CREATE POLICY org_isolation ON table_name
FOR ALL USING (org_id = current_setting('app.org_id')::uuid);

-- Soft delete filtering (REQUIRED)
CREATE POLICY hide_deleted ON table_name
FOR SELECT USING (deleted_at IS NULL);

-- Role-based access (if applicable)
CREATE POLICY role_access ON table_name
FOR ALL USING (
  current_setting('app.user_role') = 'admin'
  OR created_by = current_setting('app.user_id')::uuid
);
```

### 2. Index Strategy
```sql
-- Required indexes per table:
-- 1. Primary lookup
CREATE INDEX idx_table_org ON table(org_id, id);

-- 2. Polymorphic entity reference (if applicable)
CREATE INDEX idx_table_entity ON table(entity_type, entity_id) WHERE deleted_at IS NULL;

-- 3. Status filtering
CREATE INDEX idx_table_status ON table(status) WHERE status = 'active' AND deleted_at IS NULL;

-- 4. Date ranges
CREATE INDEX idx_table_dates ON table(created_at DESC);

-- 5. Full-text search (if applicable)
CREATE INDEX idx_table_search ON table USING gin(search_vector);

-- 6. All FK columns explicitly indexed
CREATE INDEX idx_table_fk ON table(foreign_key_id);
```

### 3. Migration Template
```markdown
## Migration Strategy

### Pre-Migration Checklist
- [ ] Backup affected tables: [list]
- [ ] Validation queries pass: [list]
- [ ] Estimated records: [count]
- [ ] Estimated duration: [time]
- [ ] Downtime window: [if needed]

### Migration Steps
1. Create new tables (non-breaking)
2. Add new columns to existing tables
3. Run data migration scripts (batched, 10k records)
4. Create backward compatibility views
5. Update application code (feature flagged)
6. Shadow period (2 weeks minimum)
7. Validate data integrity
8. Drop legacy columns/tables

### Rollback Plan
1. If migration script fails: [restore from backup]
2. If validation fails: [revert changes, specific commands]
3. If performance degrades: [rollback feature flag]

### Post-Migration Validation
- [ ] Row counts match expected
- [ ] FK integrity verified
- [ ] Application tests pass
- [ ] Performance benchmarks met
```

---

## Implementation Checklist per Issue

For each issue, follow this workflow:

### Research Phase
```bash
/research_codebase <issue-id>
# Output: thoughts/shared/research/YYYY-MM-DD-<issue-id>-current-state.md
```

### Planning Phase
```bash
/create_plan <issue-id>
# Output: thoughts/shared/plans/YYYY-MM-DD-<issue-id>-implementation.md
```

### Implementation Phase
```bash
/implement_plan <issue-id>
# Implements the plan with verification
```

### Validation Phase
```bash
/validate_plan <issue-id>
# Verifies implementation matches plan
```

---

## Success Criteria

### Per-Issue Success
- [ ] All schema changes migrated
- [ ] All data migrated without loss
- [ ] Backward compatibility views working
- [ ] RLS policies enforced
- [ ] Indexes optimized
- [ ] tRPC routers updated
- [ ] Frontend using new schema
- [ ] Tests passing
- [ ] Performance benchmarks met
- [ ] Rollback tested

### Platform-Wide Success
- [ ] Single contact record per person (no duplicates)
- [ ] Single company record per organization
- [ ] Unified timeline per entity
- [ ] Complete audit trail
- [ ] Revenue flow: Placement → Timesheet → Invoice → Payment
- [ ] All polymorphic tables using consistent entity_type values
- [ ] Zero data loss during migrations
- [ ] <100ms query response for common operations

---

## Risk Mitigation

### Data Migration Risks
1. **Always create backward-compatible views** before dropping columns
2. **Run migrations on staging first** with production data copy
3. **Create rollback scripts** for every migration
4. **Shadow period**: Run old and new in parallel, compare results
5. **Batch large migrations**: 10k records per transaction

### Performance Risks
1. **Index all polymorphic lookups** (entity_type, entity_id)
2. **Denormalize counters** (active_jobs_count, total_placements)
3. **Use materialized paths** for hierarchy traversal
4. **Benchmark before/after** each migration
5. **Add composite indexes** for common query patterns

### Integration Risks
1. **API contracts preserved** via backward-compatible views
2. **Feature flags** for gradual frontend rollout
3. **Monitoring dashboards** for error rate spikes
4. **Health checks** for critical paths

---

## Quick Reference: Issue Locations

### Completed ✅
| Issue ID | File Path | Status |
|----------|-----------|--------|
| **ADDRESSES-01** | `thoughts/shared/issues/addresses-01` | ✅ DONE |
| **ACCOUNTS-02** | `thoughts/shared/issues/accounts-02` | ✅ DONE |
| **CONTACTS-01** | `thoughts/shared/issues/contacts-01` | ✅ DONE (Phase 1) |

### Remaining (in order)
| # | Issue ID | File Path | Dependencies |
|---|----------|-----------|--------------|
| 01 | **ENTITIES-01** | `thoughts/shared/issues/entities-01` | None |
| 02 | SKILLS-01 | `thoughts/shared/issues/skills-01` | None |
| 03 | DOCS-01 | `thoughts/shared/issues/docs-01` | None |
| 04 | NOTES-01 | `thoughts/shared/issues/notes-01` | None |
| 05 | HISTORY-01 | `thoughts/shared/issues/history-01` | None |
| 06-07 | CONTACTS-01 | `thoughts/shared/issues/contacts-01` | None |
| 08 | COMPLIANCE-01 | `thoughts/shared/issues/compliance-01` | DOCS-01 |
| 09 | CONTRACTS-01 | `thoughts/shared/issues/contracts-01` | DOCS-01, CONTACTS-01, ACCOUNTS-02 |
| 10 | RATES-01 | `thoughts/shared/issues/rates-01` | CONTACTS-01, ACCOUNTS-02 |
| 11 | JOBS-01 | `thoughts/shared/issues/jobs-01` | SKILLS-01, ACCOUNTS-02, CONTACTS-01 |
| 12 | SUBMISSIONS-01 | `thoughts/shared/issues/submissions-01` | JOBS-01, CONTACTS-01 |
| 13 | INTERVIEWS-01 | `thoughts/shared/issues/interviews-01` | SUBMISSIONS-01, CONTACTS-01, RATES-01 |
| **14** | **OFFERS-01** | **`thoughts/shared/issues/offers-01`** | **INTERVIEWS-01, CONTACTS-01, RATES-01** |
| 15 | PLACEMENTS-01 | `thoughts/shared/issues/placements-01` | OFFERS-01, RATES-01, CONTRACTS-01 |
| **16** | **ONBOARDING-01** | **`thoughts/shared/issues/onboarding-01`** | **PLACEMENTS-01, CONTACTS-01, COMPLIANCE-01, DOCS-01** |
| 17 | TIMESHEETS-01 | `thoughts/shared/issues/timesheets-01` | PLACEMENTS-01, RATES-01 |
| 18 | INVOICES-01 | `thoughts/shared/issues/invoices-01` | TIMESHEETS-01, RATES-01 |
| 19 | PAYROLL-01 | `thoughts/shared/issues/payroll-01` | TIMESHEETS-01, RATES-01, CONTRACTS-01, COMPLIANCE-01 |
| 20 | DEALS-01 | `thoughts/shared/issues/deals-01` | CONTACTS-01, ACCOUNTS-02, HISTORY-01 |
| 21 | COMMS-01 | `thoughts/shared/issues/comms-01` | CONTACTS-01, DOCS-01 |
| 22 | **WORKFLOWS-01** | `thoughts/shared/issues/workflows-01` | HISTORY-01, CONTACTS-01, ACCOUNTS-02 |
| 23 | **NOTIFICATIONS-01** | `thoughts/shared/issues/notifications-01` | WORKFLOWS-01, CONTACTS-01 |
| 24 | **WORKFLOWS-01 P2** | `thoughts/shared/issues/workflows-01` | NOTIFICATIONS-01 |
| 25 | **CAMPAIGNS-01** | `thoughts/shared/issues/campaigns-01` | COMMS-01, CONTACTS-01, ACCOUNTS-02 |

---

## Future Considerations (Not in Initial 25)

These issues may be needed for enterprise completeness but are not in the initial 25:

| Issue ID | Description | Priority |
|----------|-------------|----------|
| EXPENSES-01 | Consultant expense tracking and reimbursement | Medium |
| ASSESSMENTS-01 | Skills assessments and coding challenges | Low |
| REFERENCES-01 | Reference check tracking and feedback | Low |
| TERMINATIONS-01 | Off-boarding workflow and exit procedures | Medium |
| BENCH-01 | Expanded bench management beyond CONTACTS-01 Phase 3 | Medium |
| REPORTS-01 | Custom report builder and analytics | Medium |
| ACCOUNTING-SYNC-01 | QuickBooks/Xero integration | Medium |

**Note:** ONBOARDING-01 was moved into the initial 25 as it's critical for staffing operations.

---

## Next Action

**👉 START with Wave 1: Foundation (Parallel)**

These 5 issues have NO dependencies and can be done in parallel or any order:

1. **ENTITIES-01** - Entity Resolution Service
2. **SKILLS-01** - Skills taxonomy with vector embeddings
3. **DOCS-01** - Centralized document storage
4. **NOTES-01** - Unified notes system
5. **HISTORY-01** - Audit trail infrastructure

Then complete CONTACTS-01 Phases 2-3 before Wave 3.

```bash
# Example: Start with SKILLS-01
/research_codebase SKILLS-01
```
