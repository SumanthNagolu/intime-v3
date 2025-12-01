<!-- 1dcfe179-7ad4-4ebd-92ee-4793e73b1c40 f2566865-81d5-4307-beea-51513a0d4c77 -->
# Database Consolidation & Unification Plan

## 1. Executive Summary

The current database schema contains significantly overlapping definitions across the `ATS`, `CRM`, `Bench`, and `Workspace` modules. While the core pillars (Multi-tenancy, RLS, Audit) are sound, there are **three critical areas of duplication** that jeopardize data integrity and application logic:

1.  **Contacts**: Multiple definitions (`crm_contacts`, `point_of_contacts`, `vendor_contacts`, `workspace.contacts`).
2.  **Activities**: Fragmented tracking (`crm_activities`, `marketing_activities`, `activity_log`, `unified.activities`).
3.  **Job Orders**: Split definition between `bench.ts` and `workspace.ts`.

This plan proposes a strict **Core + Modules** architecture to eliminate these redundancies, ensuring a "Single Source of Truth" for all cross-cutting entities.

## 2. Gap & Duplication Analysis

| Entity Domain | Current State (Fragmented) | Issues | Target State (Unified) |
| :--- | :--- | :--- | :--- |
| **Contacts** | `crm.crmContacts`<br>`crm.pointOfContacts` (legacy)<br>`bench.vendorContacts`<br>`workspace.contacts` | Data silos; impossible to track a person moving from Candidate → Contact; fragmented history. | **`contacts` (Universal)**<br>Located in `workspace.ts`<br>Type: `client`, `candidate`, `vendor`, `internal` |
| **Activities** | `crm.crmActivities`<br>`bench.marketingActivities`<br>`crm.activityLog`<br>`activities.activities` | Reporting nightmares; scattered history; inconsistent enums. | **`activities` (Polymorphic)**<br>Located in `activities.ts`<br>Links to ANY entity via `entity_type/id` |
| **Job Orders** | `bench.jobOrders`<br>`workspace.jobOrders` | Conflicting schemas for the same business entity. | **`job_orders`**<br>Located in `workspace.ts`<br>Centralized client requirements. |
| **Addresses** | `ats.addresses` (polymorphic)<br>`crm.accountAddresses` | Inconsistent handling of locations. | **`addresses` (Polymorphic)**<br>Located in `shared.ts`<br>Standardized geo-location & validation. |
| **Ownership** | `crm.accountTeam`<br>`ats.jobAssignments`<br>`workspace.objectOwners` | Permissions logic is scattered. | **`object_owners` (RCAI)**<br>Located in `workspace.ts`<br>Unified permission/role matrix. |

## 3. Consolidation Plan

### Phase 1: Establish Core "Truth" Schemas

We will designate specific files as the "Owner" of shared entities and deprecate the rest.

1.  **Promote `src/lib/db/schema/workspace.ts`**:

    -   **Contacts**: Becomes the master definition. Merge fields from `crmContacts` and `vendorContacts`.
    -   **Job Orders**: Becomes the master definition. Merge fields from `bench.jobOrders`.
    -   **Object Owners**: Remains master for RCAI.

2.  **Promote `src/lib/db/schema/activities.ts`**:

    -   **Activities**: Becomes master. Ensure all enums from `crmActivities` and `marketingActivities` are covered.

3.  **Promote `src/lib/db/schema/shared.ts`**:

    -   **Addresses**: Move `ats.addresses` here. Drop `accountAddresses` in favor of polymorphic association.

### Phase 2: Refactor Business Modules

Update module schemas to reference Core tables instead of defining their own.

-   **CRM Module (`crm.ts`)**:
    -   Drop `crmContacts`, `pointOfContacts`.
    -   Drop `crmActivities`, `activityLog`.
    -   Drop `accountAddresses`.
    -   Update `leads` and `deals` to reference `workspace.contacts`.
    -   Update `accounts` to use `object_owners` instead of `accountTeam` (or view `accountTeam` as a convenience wrapper).

-   **Bench Module (`bench.ts`)**:
    -   Drop `vendorContacts` → Use `contacts` with `type='vendor'`.
    -   Drop `jobOrders` → Use `workspace.jobOrders`.
    -   Drop `marketingActivities` → Use `activities` with `type='marketing_campaign'`.

-   **ATS Module (`ats.ts`)**:
    -   Remove `addresses` (moved to shared).
    -   Ensure `submissions` and `interviews` link to unified `activities` for scheduling.

### Phase 3: Migration & Cleanup Strategy

Since this is a schema refactor during development (pre-production for v3):

1.  **Consolidate Drizzle Files**: Physically move the code in `src/lib/db/schema/`.
2.  **Generate Migration**: Run `drizzle-kit generate` to produce a SQL migration that:

    -   Alters tables to add missing columns from the merged definitions.
    -   Migrates data (if any exists in dev) via SQL scripts (e.g., `INSERT INTO contacts SELECT * FROM crm_contacts`).
    -   Drops the redundant tables.

## 4. Target Schema Architecture

**1. Shared Infrastructure (`shared.ts`)**

-   `organizations` (Tenants)
-   `users` (Auth & Profile)
-   `files` (Universal uploads)
-   `addresses` (Universal location)
-   `tags` (Universal classification)

**2. Unified Workspace (`workspace.ts`)**

-   `contacts` (People: Candidates, POCs, Vendors)
-   `job_orders` (Incoming Client Reqs)
-   `object_owners` (RCAI Permissions)
-   `notifications`

**3. Activity Engine (`activities.ts`)**

-   `activities` (Tasks, Calls, Emails, Notes)
-   `activity_relations` (Thread/Chain links)

**4. CRM Module (`crm.ts`)**

-   `accounts` (Companies)
-   `leads` (Sales opportunities)
-   `deals` (Pipeline)
-   `campaigns` (Marketing outreach)

**5. ATS Module (`ats.ts`)**

-   `jobs` (Internal Requisitions)
-   `submissions` (Candidate Applications)
-   `interviews` (Events)
-   `offers` & `placements`

**6. Bench Module (`bench.ts`)**

-   `bench_consultants` (Talent pool)
-   `marketing_profiles` (Resumes/Bios)
-   `vendors` (Partners)

## 5. Next Steps

1.  **Approve Plan**: Confirm this consolidation strategy.
2.  **Execute File Changes**:

    -   Modify `workspace.ts` to include all Contact/JobOrder fields.
    -   Modify `shared.ts` to include Addresses.
    -   Modify `crm.ts`, `bench.ts`, `ats.ts` to remove duplicates and fix references.

3.  **Generate Migration**: Create the `consolidation_fix.sql`.
4.  **Validation**: Verify type safety and relationship integrity.