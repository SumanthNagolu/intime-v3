<!-- ff9cf732-e0f3-4948-bb70-db934ed9d43e f9ffedeb-747e-427f-bc7d-cb1411afa1df -->
# Database Consolidation & Readiness Report (Phase 2 Prep)

## 1. Executive Summary

The database schema is **90% complete** and well-architected for the 5-pillar "InTime OS" vision. It successfully implements:

-   **Multi-Tenancy**: RLS and `org_id` are consistently applied.
-   **RBAC**: A comprehensive Role/Permission system (`rbac.ts`) aligned with the Master Framework.
-   **Workplan Engine**: A sophisticated Guidewire-inspired activity pattern system (`workplan.ts`).

**Critical Action Required**: The primary blocker to Phase 2 (UI) is **Activity Schema Fragmentation**. We currently have 4 overlapping ways to track "work":

1.  `activities` (The intended unified system)
2.  `crm_activities` (Duplicate in CRM)
3.  `marketing_activities` (Duplicate in Bench)
4.  `activity_log` (Legacy)

**Recommendation**: Consolidate ALL work tracking into the unified `activities` table before building UI components to avoid technical debt.

---

## 2. Detailed Analysis by Module

### 2.1 Core & Infrastructure (Status: ✅ Ready)

-   **Identity**: `user_profiles` is comprehensive, handling Student/Employee/Candidate personas in one unified table.
-   **Tenancy**: `organizations` and `regions` correctly implement the SaaS structure.
-   **Security**: `rbac` system matches the "User Roles" spec perfectly.

### 2.2 ATS Module (Status: 🟡 Needs Standardization)

-   **Coverage**: Excellent. Covers Jobs, Submissions, Interviews, Offers, Placements.
-   **Gap**: RACI ownership is implemented via `job_assignments`, but needs to be strictly mapped to the R/A/C/I roles defined in the Master Framework.
-   **Duplicate**: Uses legacy `activity_log` in some relations.

### 2.3 CRM Module (Status: 🔴 Needs Consolidation)

-   **Coverage**: Leads, Deals, Accounts, Contacts are well-defined.
-   **Conflict**: Defines `crm_activities` which duplicates the unified `activities` table. This MUST be removed.
-   **Conflict**: Defines `activity_log` (legacy) which is deprecated.

### 2.4 Bench Sales Module (Status: 🟡 Needs Alignment)

-   **Coverage**: Bench Consultants, Marketing, Vendors are solid.
-   **Conflict**: Defines `marketing_activities` which duplicates the unified `activities` table.
-   **Gap**: `job_orders` (incoming from vendors) needs clear integration with the `activities` engine for submission tracking.

### 2.5 Workplan & Activities (Status: 🟢 Powerful but duplicated)

-   **Coverage**: `workplan.ts` implements a high-end process engine (Patterns, Templates, Instances).
-   **Issue**: `activities` is defined in both `activities.ts` and `workplan.ts` (likely for circular typing). This needs clean export logic.

---

## 3. Consolidation Plan (Immediate Actions)

### Step 1: Unify Activity System (Highest Priority)

We will move all domain-specific activity tracking to the single `activities` table defined in `workplan.ts`/`activities.ts`.

-   **Action**: Delete `crm_activities` table from `crm.ts`.
-   **Action**: Delete `marketing_activities` table from `bench.ts`.
-   **Action**: Delete `activity_log` table from `crm.ts` (Legacy).
-   **Implementation**: Ensure the unified `activities` table has specific `activity_type` enums to cover CRM (call, email) and Marketing (campaign_blast, linkedin_msg) needs.

### Step 2: Standardize RACI (Ownership)

The Master Framework requires **Responsible (R), Accountable (A), Consulted (C), Informed (I)** for every object.

-   **Current State**:
    -   Jobs → `job_assignments` (Partial)
    -   Accounts → `account_team` (Partial)
    -   Activities → `activity_participants` (Perfect - has `role` column)
-   **Action**: Adopt the `activity_participants` pattern for business objects.
    -   Rename/Alias `job_assignments` -> `job_team` (cols: `job_id`, `user_id`, `role`='R'|'A'|'C'|'I')
    -   Refactor `account_team` to use standard R/A/C/I role codes instead of 'recruiter'/'secondary'.

### Step 3: Clean Up Schema Exports

-   **Action**: Centralize `activities` table definition. It is currently split/duplicated between `activities.ts` and `workplan.ts`.
-   **Action**: Ensure `src/lib/db/schema/index.ts` exports the single source of truth.

---

## 4. Implementation Roadmap

### Phase 2.1: Database Refactoring (1-2 Days)

1.  [ ] **Migration**: Create migration to drop `crm_activities`, `marketing_activities`, `activity_log`.
2.  [ ] **Schema Update**: Update `activities` enum to include all missing types from dropped tables.
3.  [ ] **RACI Standardization**: Update `account_team` and `job_assignments` to use strict RACI role enums.
4.  [ ] **Type Cleanup**: Fix the duplicate `activities` definition in TypeScript files.

### Phase 2.2: Seed Data Verification

1.  [ ] Ensure System Roles (`technical_recruiter`, `bench_sales`, etc.) are seeded with correct permissions.
2.  [ ] Seed `activity_patterns` for common workflows (e.g., "New Submission Follow-up").

---

## 5. Ready for UI?

**No.** Do not start UI coding until Step 1 (Unify Activity System) is complete. Building UI components against the fragmented activity tables will result in wasted effort.

**Approval Request:**
Please confirm this consolidation plan. Once approved, I will execute the database refactoring to provide a clean foundation for Phase 2.

### To-dos

- [ ] Refactor Activity Schema: Consolidate all activity tables (crm, marketing, legacy) into unified `activities` table
- [ ] Standardize RACI: Update account_team and job_assignments to use standard R/A/C/I role enums
- [ ] Cleanup TypeScript Definitions: Fix duplicate exports/definitions of `activities` in schema files
- [ ] Generate Migration: Create SQL migration for the schema consolidation