<!-- c63312d5-43cd-4dd2-916f-a60d6ad2b52b b1178449-de64-4a12-b057-75f253dd8e2b -->
# Database Audit & Consolidation Plan

## Step 1 – Inventory Current Schema & Docs

- Traverse the Drizzle definitions in [`src/lib/db/schema/**/*.ts`](src/lib/db/schema) and the SQL migrations under [`supabase/migrations/`](supabase/migrations) to capture the full list of tables, enums, and relations actually defined.
- Cross-reference every entity against the canonical specs in [`docs/specs/10-DATABASE/`](docs/specs/10-DATABASE) plus supporting references like [`docs/DATABASE-ARCHITECTURE.md`](docs/DATABASE-ARCHITECTURE.md) to align terminology and required lifecycles.
- Note any tables that exist in Drizzle but not in Supabase (or vice versa) for later reconciliation.

## Step 2 – Foundation Audit (Multi-Tenancy, Audit Trail, RLS)

- For platform primitives (`organizations`, `user_profiles`, RBAC, audit, events, activities, workplan) verify presence of `org_id`, audit columns, soft-delete fields, indexes, and uniqueness constraints in both Drizzle and SQL forms.
- Review available migration helpers (e.g., [`ALL-MIGRATIONS.sql`](ALL-MIGRATIONS.sql)) and recent SQL files to confirm RLS policies exist per table; catalog any missing `ALTER TABLE … ENABLE ROW LEVEL SECURITY` or policy definitions.
- Document global reference tables (e.g., `skills`) that intentionally omit `org_id`, so they are handled explicitly in the final plan.

## Step 3 – Module Deep Dives & Gaps

- CRM: Analyze tables in [`src/lib/db/schema/crm.ts`](src/lib/db/schema/crm.ts) versus CRM specs to ensure Account/Lead/Deal lifecycles, ownership, and campaign linkage are complete; note redundant contact constructs (`crmContacts`, `pointOfContacts`, workspace `contacts`).
- ATS: Review [`src/lib/db/schema/ats.ts`](src/lib/db/schema/ats.ts) for candidate master data, submissions, interviews, offers, placements, and ancillary tables; flag duplicated data between `user_profiles`, `candidate_profiles`, and ATS-specific tables.
- Bench/Talent Marketplace: Evaluate [`src/lib/db/schema/bench.ts`](src/lib/db/schema/bench.ts) for consultant, vendor, immigration, and job order definitions; highlight conflicts with workspace job orders and shared tables.
- TA/HR & Core HR: Compare [`src/lib/db/schema/ta-hr.ts`](src/lib/db/schema/ta-hr.ts) and [`src/lib/db/schema/hr.ts`](src/lib/db/schema/hr.ts) to ensure pods, campaigns, payroll, and employee data aren’t overlapping; document where a single source of truth is needed.
- Workspace/Ownership & Activity Systems: Inspect [`src/lib/db/schema/workspace.ts`](src/lib/db/schema/workspace.ts), [`src/lib/db/schema/activities.ts`](src/lib/db/schema/activities.ts), and [`src/lib/db/schema/workplan.ts`](src/lib/db/schema/workplan.ts) to ensure RCAI assignments, contacts, and workplan instances match Guidewire-style specs.
- Supporting modules (Strategy, Academy, Timeline/Events, Audit): Summarize their schemas and identify integration touchpoints or missing foreign keys.

## Step 4 – Duplicate & Normalization Analysis

- Produce a matrix of overlapping entities (e.g., job orders in bench vs workspace, multiple contact tables, candidate documents vs `file_uploads`, owner assignments vs `object_owners`).
- Recommend canonical tables per entity, mapping dependent tables to the chosen source and outlining required migrations or view replacements.
- Identify where polymorphic patterns (`addresses`, `object_owners`, `activities`) should replace bespoke tables to reduce redundancy.

## Step 5 – Security & Data Integrity Plan

- Enumerate every table lacking explicit RLS policies, soft-delete filters, or critical indexes and define the SQL/Drizzle updates needed.
- Plan consistency checks (constraints, triggers, derived columns) to enforce tenant isolation, referential integrity, and lifecycle rules across modules.
- Outline how to keep Drizzle schema, Supabase migrations, and documentation in sync going forward (versioning, automated lint scripts, etc.).

## Step 6 – Delivery: Report & Roadmap

- Compile findings into a structured report covering: schema inventory, module-by-module assessments, duplication issues, RLS/audit gaps, and success metrics tied to business pillars.
- Present a phased implementation roadmap (e.g., Foundation hardening → Entity consolidation → Advanced workflows) with clear sequencing, affected files, and migration considerations so engineering can execute confidently.

### To-dos

- [ ] Inventory schema & migrations
- [ ] Audit multi-tenancy/RLS/audit trails
- [ ] Deep dive per module (CRM/ATS/Bench/etc)
- [ ] Document duplicates/normalization gaps
- [ ] Define RLS/index/audit fixes
- [ ] Draft final report + phased roadmap