---
description: Design database schema, migrations, and RLS policies
---

I'll route this through our architecture workflow for database design.

**Database Design Workflow**:

1. **PM Agent** (if requirements don't exist):
   - Gather data requirements
   - Understand relationships and constraints
   - Define success criteria

2. **Architect Agent**:
   - Design database schema (tables, columns, types)
   - Define relationships and foreign keys
   - Create indexes for performance
   - Write RLS policies for security
   - Generate Drizzle schema
   - Create SQL migration file
   - Plan rollback strategy

**Deliverables**:
- `architecture.md` with complete schema design
- `src/lib/db/schema/[feature].ts` (Drizzle schema)
- `src/lib/db/migrations/XXXX_[feature].sql` (migration)
- RLS policies for org-level data isolation

**Standards Applied**:
- UUID primary keys (not auto-increment)
- Row Level Security (RLS) on ALL tables
- Audit fields (createdAt, createdBy, updatedAt, updatedBy)
- Soft deletes (deletedAt timestamp)
- Proper indexes on foreign keys and queried fields

Let me check if requirements exist, then spawn the appropriate agent(s)...
