<!-- f6aef1f6-c9c9-4751-86b3-dade37207e19 61652caf-290a-47d0-aa8c-1c572003c7c6 -->
# Database Consolidation Plan

1. **Platform Baseline**  

- Audit `organizations`, `user_profiles`, `rbac`, `audit`, `events`, and `timeline` under [`src/lib/db/schema`](src/lib/db/schema) to ensure each table has `org_id`, full audit columns, and RLS coverage.  
- Introduce canonical enums/shared types (tiers, pod roles, notification channels) in one place and remove duplicates.

2. **People & Contact Normalization**  

- Split the overloaded [`user_profiles`](src/lib/db/schema/user-profiles.ts) table into core `users` + modular profile tables (candidate, employee, student, client) with FK back to the core record.  
- Replace the parallel contact stores (`crm_contacts`, `contacts`, `point_of_contacts`) with a single `contacts` table + role-specific pivots, updating CRM/Workspace/Bench modules accordingly.

3. **Pipeline Entity Unification**  

- Define one source of truth for Jobs/Job Orders, Candidates, Submissions, Interviews, Offers, Placements across [`ats.ts`](src/lib/db/schema/ats.ts), [`workspace.ts`](src/lib/db/schema/workspace.ts), and [`bench.ts`](src/lib/db/schema/bench.ts).  
- Merge redundant tables (e.g., dual `job_orders`, duplicate skill matrices) and ensure shared lookup tables (skills, rates, addresses) are multi-tenant.

4. **Activity & Workplan Alignment**  

- Make the unified [`activities`](src/lib/db/schema/activities.ts) + [`workplan`](src/lib/db/schema/workplan.ts) tables the only activity system by deprecating `crm_activities`, `activity_log`, `marketing_activities`, etc., updating FK references and triggers.  
- Backfill SLA/workqueue data and enforce usage via server actions.

5. **Module Hardening (Academy, HR, Bench, TA)**  

- Add `org_id`, audit columns, and indexes to Academy (`academy.ts`), HR (`hr.ts` + `ta-hr.ts`), and Bench tables; move shared concepts (e.g., payroll pods) into platform tables where needed.  
- Introduce supporting tables for financials (timesheets, invoices) and immigration with consistent naming.

6. **Governance & Migration Sequencing**  

- Author staged SQL migrations under `src/lib/db/migrations/` to implement the above, including data backfills, views for backward compatibility, and RLS policies per table.  
- Document the final entity map in `docs/DATABASE-ARCHITECTURE.md` and add automated checks (scripts in `scripts/`) for schema drift.

### To-dos

- [ ] Confirm shared platform tables meet RLS/audit standards
- [ ] Refactor user/contact data into modular tables
- [ ] Merge job/candidate/submission tables across modules
- [ ] Retire legacy activity tables in favor of unified Activities/Workplan
- [ ] Backfill org/audit fields in Academy/HR/Bench/TA tables
- [ ] Write migrations + docs and add schema guardrails