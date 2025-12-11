---
date: 2025-12-11T17:53:25-05:00
researcher: Claude Code
git_commit: 9feeb9f
branch: main
repository: intime-v3
topic: "WAVE 3: Legal & Financial Infrastructure - Current State Analysis"
tags: [research, codebase, wave-3, compliance, contracts, rates, legal, financial]
status: complete
last_updated: 2025-12-11
last_updated_by: Claude Code
---

# Research: WAVE 3 - Legal & Financial Infrastructure

**Date**: 2025-12-11T17:53:25-05:00
**Researcher**: Claude Code
**Git Commit**: 9feeb9f
**Branch**: main
**Repository**: intime-v3

## Research Question

Document the current state of WAVE 3: Legal & Financial Infrastructure components (COMPLIANCE-01, CONTRACTS-01, RATES-01) including existing database schema, tRPC routers, UI components, and integration points with completed dependencies.

## Summary

WAVE 3 encompasses three critical infrastructure issues that form the foundation for staffing operations:

| Issue | Status | Dependencies | Effort |
|-------|--------|--------------|--------|
| **COMPLIANCE-01** | Ready to Start | DOCS-01 ✅ | 1 week |
| **CONTRACTS-01** | Ready to Start | DOCS-01 ✅, CONTACTS-01 ✅, ACCOUNTS-02 ✅ | 1 week |
| **RATES-01** | Ready to Start | CONTACTS-01 ✅, ACCOUNTS-02 ✅ | 1 week |

**All dependencies are satisfied.** WAVE 0, 1, and 2 are complete. WAVE 3 can proceed immediately with any issue.

### Current State Summary

| Domain | Existing Tables | Active Routers | UI Components | Unified System? |
|--------|-----------------|----------------|---------------|-----------------|
| Compliance | 15 tables | 1 (`contactCompliance`) | 2 (settings) | ❌ Fragmented |
| Contracts | 3 tables | 2 (`contactAgreements`, CRM) | 2 (onboarding, docs section) | ❌ Fragmented |
| Rates | 7+ tables + inline fields | 1 (`contactRateCards`) | 5+ (wizards, dialogs) | ❌ Fragmented |

---

## Detailed Findings

### 1. COMPLIANCE-01: Compliance Tracking System

#### Current Database Schema

**15 compliance-related tables exist**, scattered across modules:

| Table | Location | Purpose | Has Router? |
|-------|----------|---------|-------------|
| `candidate_compliance_documents` | baseline.sql:15235 | Candidate compliance with signatures | No |
| `candidate_background_checks` | baseline.sql:15132 | Background check lifecycle | No |
| `candidate_work_authorizations` | baseline.sql:15673 | Work auth + I-9 + E-Verify | No |
| `contact_compliance` | baseline.sql:16853 | Insurance, W9, compliance | **Yes** |
| `company_compliance_requirements` | baseline.sql:16065 | Client compliance requirements | No |
| `compliance_requirements` | baseline.sql:16597 | Master requirements catalog | No |
| `employee_compliance` | baseline.sql:18140 | Employee-requirement junction | No |
| `employee_documents` | baseline.sql:18158 | HR documents | No |
| `i9_records` | baseline.sql:19373 | I-9 form tracking | No |
| `consultant_work_authorization` | baseline.sql:16696 | Bench consultant work auth | No |
| `immigration_documents` | baseline.sql:19449 | Immigration case docs | No |
| `immigration_alerts` | baseline.sql:19398 | Visa expiry alerts | No |
| `immigration_timelines` | baseline.sql:19476 | Case milestones | No |
| `immigration_attorneys` | baseline.sql:19423 | Attorney directory | No |
| `documents` (DOCS-01) | 20251211140000 | Unified docs (includes compliance types) | Yes |

**Key Issues:**
- Only `contact_compliance` has an active tRPC router
- Only `contact_compliance` and `documents` support soft delete
- Inconsistent status enums vs CHECK constraints
- No unified view across candidate → employee → consultant compliance

#### Active tRPC Router

**File**: `src/server/routers/contact-compliance.ts`

**Procedures**:
- `list` - Paginated list with filters (contactId, type, status, expiring)
- `getById` - Single compliance item
- `getByContact` - All compliance for a contact
- `getExpiring` - Items expiring within N days
- `create` - Add new compliance item
- `update` - Modify existing item
- `delete` - Soft delete
- `verify` - Mark as verified with verifier tracking
- `reject` - Mark as rejected with reason
- `stats` - Compliance statistics

**Compliance Types Supported**:
- Company: `general_liability`, `workers_comp`, `e_o`, `cyber`, `w9`, `coi`
- Person: `background_check`, `drug_test`, `i9`, `w4`, `direct_deposit`

#### Existing UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `ComplianceStep` | `campaigns/new/steps/ComplianceStep.tsx` | Email compliance (GDPR, CAN-SPAM, CASL) |
| `ComplianceSettingsPage` | `admin/settings/ComplianceSettingsPage.tsx` | Data retention, GDPR settings |

**Gap**: No compliance tracking UI for contacts/entities exists.

---

### 2. CONTRACTS-01: Contract Management System

#### Current Database Schema

**3 contract tables exist** with inconsistent schemas:

| Table | Location | Purpose | Has Router? | Soft Delete? |
|-------|----------|---------|-------------|--------------|
| `account_contracts` | baseline.sql:11229 | Legacy account contracts | Yes (CRM) | No |
| `company_contracts` | baseline.sql:16150 | Modern company contracts | No | Yes |
| `contact_agreements` | baseline.sql:16754 | Contact-level agreements | **Yes** | Yes |

**Tables NOT Found** (mentioned in spec):
- `placement_contracts` - Does not exist; placements have inline contract fields
- `vendor_agreements` - No separate table; handled via `contact_agreements` type='vendor_agreement'
- `engagement_agreements` - Does not exist

#### Schema Comparison

| Feature | account_contracts | company_contracts | contact_agreements |
|---------|-------------------|-------------------|-------------------|
| org_id | No | Yes | Yes |
| Soft delete | No | Yes | Yes |
| Type system | TEXT | ENUM | TEXT + CHECK |
| Versioning | No | Via parent_contract_id | No |
| Hierarchy | No | Yes | No |
| Auto-renewal | No | Yes | Yes |
| Both signatories | No | Yes | Yes |

**`company_contracts` is most modern** but has no active router.

#### Active tRPC Routers

**1. `contactAgreements` Router** (`src/server/routers/contact-agreements.ts`)

**Procedures**:
- `list`, `getById`, `getByContact`, `getActiveMsa`
- `create`, `update`, `delete`
- `activate`, `terminate`, `stats`

**Agreement Types**: `msa`, `nda`, `sow`, `rate_card`, `sla`, `vendor_agreement`, `other`

**2. CRM Router - Contracts Sub-router** (`src/server/routers/crm.ts:918-1130`)

**Procedures**: `list`, `create`, `upload`, `getById`, `update`

**Contract Types**: `msa`, `sow`, `nda`, `amendment`, `addendum`, `other`

#### Existing UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `OnboardingStep2Contract` | `accounts/onboarding/OnboardingStep2Contract.tsx` | Account onboarding contract step |
| `AccountDocumentsSection` | `accounts/sections/AccountDocumentsSection.tsx` | Contract list with inline panel |

---

### 3. RATES-01: Rate Cards & Billing System

#### Current Database Schema

**7+ dedicated rate tables** plus inline fields in entities:

| Table | Location | Purpose | Has Router? |
|-------|----------|---------|-------------|
| `company_rate_cards` | baseline.sql:16398 | Master rate cards for clients | No |
| `company_rate_card_items` | baseline.sql:16372 | Rate card line items | No |
| `contact_rate_cards` | baseline.sql:16981 | Per-contact rates | **Yes** |
| `job_rates` | baseline.sql:20097 | Job rate ranges | No |
| `placement_rates` | baseline.sql:22579 | Placement rate history | No |
| `submission_rates` | baseline.sql:24100 | Submission rates | No |
| `consultant_rates` | baseline.sql:16642 | Bench consultant rates | No |

**Inline Rate Fields** (embedded in entity tables):

| Table | Fields |
|-------|--------|
| `placements` | `bill_rate`, `pay_rate`, `markup_percentage` (GENERATED), `rate_type` |
| `submissions` | `submitted_rate`, `submitted_rate_type` |
| `jobs` | `rate_min`, `rate_max`, `rate_type`, `currency` |
| `offers` | `rate`, `pay_rate`, `bill_rate`, `overtime_rate`, `bonus`, `sign_on_bonus` |
| `contacts` | `candidate_hourly_rate`, `bench_bill_rate`, `bench_pay_rate` |
| `contact_bench_data` | `min_acceptable_rate`, `target_rate`, `max_rate`, `bill_rate`, `pay_rate` |
| `companies` | `client_default_markup`, `client_default_bill_rate` |
| `deals` | `avg_bill_rate` |

#### Active tRPC Router

**File**: `src/server/routers/contact-rate-cards.ts`

**Procedures**:
- `list`, `getById`, `getByContact`
- `getDefaultRate`, `getByClient`
- `create`, `update`, `delete`
- `deactivate`, `setDefault`, `stats`

**Features**:
- Client-specific rates via `clientId`
- Skill/level context via `skillCategory`, `jobLevel`
- Auto-calculates markup % when both rates provided
- Default rate management with auto-unset logic

#### Rate Flow Pattern

```
Company Rate Card (company_rate_cards)
    └── Job Rate Range (jobs.rate_min/max)
        └── Submission Rate (submissions.submitted_rate)
            └── Offer Rate (offers.bill_rate/pay_rate)
                └── Placement Rate (placements.bill_rate/pay_rate)
                    └── Rate History (placement_rates)
```

#### Existing UI Components

| Component | File | Purpose | Margin Calculation? |
|-----------|------|---------|---------------------|
| `IntakeStep4Compensation` | `jobs/intake/IntakeStep4Compensation.tsx` | Job rate ranges | No |
| `ExtendOfferDialog` | `offers/ExtendOfferDialog.tsx` | Offer rates with margin preview | **Yes** |
| `SubmitToClientDialog` | `submissions/SubmitToClientDialog.tsx` | Submission rates with margin | **Yes** |
| `ConfirmPlacementWizard` | `placements/ConfirmPlacementWizard.tsx` | Placement rates with commission | **Yes** |
| `ExtendPlacementDialog` | `placements/ExtendPlacementDialog.tsx` | Rate changes with margin impact | **Yes** |
| `PlacementOverviewSectionPCF` | `sections/placements.sections.tsx` | Rate display with margin | **Yes** |
| `VendorPerformanceDashboard` | `vendors/VendorPerformanceDashboard.tsx` | Average margin metric | **Yes** |

#### Common Margin Calculation Formula

All components use identical calculation:

```typescript
const marginAmount = billRate - payRate
const marginPercent = billRate > 0 ? ((marginAmount / billRate) * 100) : 0
```

**Margin Quality Thresholds** (consistent across components):
- Excellent: ≥20% (Green)
- Good: ≥15% (Amber)
- Low: ≥10% (Yellow)
- Below Minimum: <10% (Red)

---

### 4. Dependency Status

All WAVE 3 dependencies are **COMPLETE**:

#### DOCS-01: Centralized Documents System ✅

**Table**: `documents` (20251211140000_create_documents.sql)
- Polymorphic entity reference (`entity_type`, `entity_id`)
- 19 document types including compliance types
- Versioning system with history
- Expiration tracking & alerts
- Access control (4 levels)
- OCR/AI processing pipeline
- Full audit trail (`document_access_log`)

**Router**: `src/server/routers/documents.ts` with 13 procedures

#### CONTACTS-01: Unified Contacts System ✅

**Table**: `contacts` with Single Table Inheritance
- 22 subtypes (13 person, 9 company)
- Extension tables: `contact_lead_data`, `contact_bench_data`
- 10+ supporting tables (skills, compliance, certifications)

**Router**: `src/server/routers/unified-contacts.ts`
- Core operations + 3 sub-routers (candidates, leads, bench)

#### ACCOUNTS-02: Unified Companies System ✅

**Table**: `companies` with 4 categories (client, vendor, partner, prospect)
- Extension tables: `company_client_details`, `company_vendor_details`
- Company hierarchy support
- Health scoring algorithm
- Team management

**Router**: `src/server/routers/companies.ts` with 20+ procedures

---

## Code References

### Database Schema

**Compliance**:
- `supabase/migrations/00000000000000_baseline.sql:15132-19493` - Legacy compliance tables
- `supabase/migrations/20251211140000_create_documents.sql` - Unified documents

**Contracts**:
- `supabase/migrations/00000000000000_baseline.sql:11229` - account_contracts
- `supabase/migrations/00000000000000_baseline.sql:16150` - company_contracts
- `supabase/migrations/00000000000000_baseline.sql:16754` - contact_agreements

**Rates**:
- `supabase/migrations/00000000000000_baseline.sql:16398` - company_rate_cards
- `supabase/migrations/00000000000000_baseline.sql:16981` - contact_rate_cards
- `supabase/migrations/00000000000000_baseline.sql:22305-22307` - placements inline rates

### tRPC Routers

- `src/server/routers/contact-compliance.ts` - Compliance CRUD
- `src/server/routers/contact-agreements.ts` - Agreements CRUD
- `src/server/routers/contact-rate-cards.ts` - Rate cards CRUD
- `src/server/routers/crm.ts:918-1130` - Account contracts sub-router
- `src/server/routers/documents.ts` - Unified documents
- `src/server/routers/unified-contacts.ts` - Unified contacts
- `src/server/routers/companies.ts` - Unified companies

### UI Components

**Compliance**:
- `src/app/employee/crm/campaigns/new/steps/ComplianceStep.tsx`
- `src/components/admin/settings/ComplianceSettingsPage.tsx`

**Contracts**:
- `src/components/recruiting/accounts/onboarding/OnboardingStep2Contract.tsx`
- `src/components/recruiting/accounts/sections/AccountDocumentsSection.tsx`

**Rates/Margin**:
- `src/components/recruiting/offers/ExtendOfferDialog.tsx`
- `src/components/recruiting/submissions/SubmitToClientDialog.tsx`
- `src/components/recruiting/placements/ConfirmPlacementWizard.tsx`
- `src/components/recruiting/placements/ExtendPlacementDialog.tsx`

---

## Architecture Documentation

### Proposed Unified Schema (from Issue Specs)

#### COMPLIANCE-01 Target Schema

| Table | Purpose |
|-------|---------|
| `compliance_requirements` | Master requirement definitions |
| `compliance_items` | Polymorphic compliance records |
| `compliance_audit_log` | Audit trail |
| `entity_compliance_requirements` | Requirements per entity |

#### CONTRACTS-01 Target Schema

| Table | Purpose |
|-------|---------|
| `contracts` | Unified contracts with hierarchy |
| `contract_versions` | Amendment tracking |
| `contract_templates` | Reusable templates |
| `contract_clauses` | Clause library |
| `contract_parties` | Multi-signatory tracking |
| `contract_audit_log` | Audit trail |

#### RATES-01 Target Schema

| Table | Purpose |
|-------|---------|
| `rate_cards` | Master rate cards with versioning |
| `rate_card_items` | Line items per category/level |
| `entity_rates` | Polymorphic entity rates |
| `rate_change_history` | Rate change audit |
| `rate_approvals` | Approval workflow |

---

## Historical Context (from thoughts/)

### Issue Specifications

- `thoughts/shared/issues/compliance-01` - Full spec with schema, migration, acceptance criteria
- `thoughts/shared/issues/contracts-01` - Full spec with templates, clauses, e-signature
- `thoughts/shared/issues/rates-01` - Full spec with versioning, margin calculations

### Previous Wave Research

- `thoughts/shared/research/2025-12-11-wave-0-implementation-status.md` - WAVE 0 validation
- `thoughts/shared/research/2025-12-11-wave-1-foundation-current-state.md` - WAVE 1 analysis
- `thoughts/shared/research/2025-12-11-CONTACTS-01-wave-2-completion.md` - WAVE 2 completion

### Completed Implementation Plans

- `thoughts/shared/plans/2025-12-11-wave-0-completion.md`
- `thoughts/shared/plans/2025-12-11-wave-1-foundation.md`
- `thoughts/shared/plans/2025-12-11-CONTACTS-01-wave-2-completion.md`

---

## Related Research

- [WAVE 0 Implementation Status](./2025-12-11-wave-0-implementation-status.md)
- [WAVE 1 Foundation Current State](./2025-12-11-wave-1-foundation-current-state.md)
- [CONTACTS-01 WAVE 2 Completion](./2025-12-11-CONTACTS-01-wave-2-completion.md)

---

## Implementation Readiness

### COMPLIANCE-01 Readiness

| Aspect | Status | Notes |
|--------|--------|-------|
| Dependency (DOCS-01) | ✅ Complete | `documents` table supports compliance types |
| Existing Router | ✅ Partial | `contactCompliance` router exists, can extend |
| Data Migration | ⚠️ Complex | 15 tables to consolidate |
| UI Components | ❌ Missing | No compliance tracking UI for entities |

### CONTRACTS-01 Readiness

| Aspect | Status | Notes |
|--------|--------|-------|
| Dependencies | ✅ Complete | DOCS-01, CONTACTS-01, ACCOUNTS-02 all done |
| Existing Router | ✅ Partial | `contactAgreements` exists, `company_contracts` has no router |
| Data Migration | ⚠️ Moderate | 3 tables to unify |
| UI Components | ⚠️ Limited | Onboarding step only, no contract workspace |

### RATES-01 Readiness

| Aspect | Status | Notes |
|--------|--------|-------|
| Dependencies | ✅ Complete | CONTACTS-01, ACCOUNTS-02 done |
| Existing Router | ✅ Partial | `contactRateCards` exists with good patterns |
| Data Migration | ⚠️ Complex | 7+ tables + inline fields |
| UI Components | ✅ Good | Multiple margin calculators exist |

---

## Open Questions

1. **Migration Strategy**: Should legacy tables be kept as views or fully migrated?
2. **Router Naming**: Should new routers replace existing ones or create unified alternatives?
3. **Entity Types**: Should new polymorphic tables use `entity_type_registry` for validation?
4. **Versioning**: How should contract/rate card versions interact with the unified history system?
5. **Approval Workflows**: Should rate/contract approvals use WORKFLOWS-01 (WAVE 6)?

---

## Next Steps

Per the Master Implementation Guide, WAVE 3 issues can start in parallel:

```bash
# Start research phase for each issue
/research_codebase COMPLIANCE-01
/research_codebase CONTRACTS-01
/research_codebase RATES-01

# Or create implementation plans
/create_plan COMPLIANCE-01
/create_plan CONTRACTS-01
/create_plan RATES-01
```

**Recommended Sequence**:
1. **RATES-01** - Most complete existing infrastructure, good router patterns
2. **CONTRACTS-01** - Clean existing schema in `company_contracts`
3. **COMPLIANCE-01** - Most fragmented, benefits from patterns established in 1 & 2
