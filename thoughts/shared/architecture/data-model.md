# Data Model Architecture

This document defines the core entity relationships and shared field conventions for the InTime platform.

## Core Entities

### User & Authentication
- `auth.users` - Supabase auth users (managed by Supabase)
- `public.employees` - Employee profiles linked to auth users
- `public.workspaces` - Multi-tenant workspace containers

### Recruiting Module
- `public.jobs` - Job requisitions/postings
- `public.candidates` - Candidate profiles
- `public.applications` - Job applications linking candidates to jobs
- `public.interviews` - Interview scheduling and feedback
- `public.placements` - Active placements (candidates placed in jobs)

### CRM Module
- `public.leads` - Sales leads and prospects
- `public.companies` - Client companies
- `public.contacts` - Company contacts
- `public.campaigns` - Outreach campaigns
- `public.activities` - Activity log (calls, emails, meetings)

### Academy Module
- `public.courses` - Training courses
- `public.enrollments` - Course enrollments
- `public.progress` - Learning progress tracking

## Shared Field Conventions

### Timestamps
All tables should include:
```sql
created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
```

### Soft Deletes
Use `deleted_at` for soft deletes:
```sql
deleted_at TIMESTAMPTZ DEFAULT NULL
```

### Multi-Tenancy
All tenant-scoped tables must include:
```sql
workspace_id UUID REFERENCES workspaces(id) NOT NULL
```

### Audit Fields
For tables requiring audit trail:
```sql
created_by UUID REFERENCES employees(id),
updated_by UUID REFERENCES employees(id)
```

## Entity Relationships

```
workspaces
    ├── employees (1:N)
    ├── jobs (1:N)
    │   ├── applications (1:N)
    │   │   └── candidates (N:1)
    │   └── placements (1:N)
    ├── leads (1:N)
    ├── companies (1:N)
    │   └── contacts (1:N)
    ├── campaigns (1:N)
    │   └── campaign_leads (N:M with leads)
    └── courses (1:N)
        └── enrollments (1:N)
```

## Naming Conventions

### Tables
- Use plural, snake_case: `job_applications`, `campaign_leads`
- Junction tables: `{table1}_{table2}` alphabetically or by context

### Columns
- Use snake_case: `first_name`, `created_at`
- Foreign keys: `{referenced_table_singular}_id` (e.g., `job_id`, `candidate_id`)
- Boolean fields: `is_` or `has_` prefix (e.g., `is_active`, `has_resume`)

### Indexes
- Primary key: `{table}_pkey`
- Foreign key: `{table}_{column}_fkey`
- Unique: `{table}_{column(s)}_key`
- Index: `{table}_{column(s)}_idx`

## Adding New Entities

When adding a new entity:
1. Follow the naming conventions above
2. Include standard timestamp fields
3. Add `workspace_id` for tenant-scoped data
4. Create appropriate indexes for query patterns
5. Add RLS policies for security
6. Update this document with the new entity

---

**Last Updated**: 2025-12-08
**Maintainer**: Development Team

