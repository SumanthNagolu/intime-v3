# HR Domain Database Tables

This directory contains comprehensive documentation for all HR (Human Resources) domain tables in InTime v3. The HR domain manages employee records, benefits, performance, payroll, teams, and related people operations.

## Table of Contents

### Core Employee Management
- [employees](./employees.md) - Core employee records with employment details, hierarchy, and compensation
- [employee_profiles](./employee_profiles.md) - Extended employee profile information and preferences
- [employee_metadata](./employee_metadata.md) - Flexible key-value metadata storage for employee records
- [employee_documents](./employee_documents.md) - Employee document storage and metadata
- [employee_screenshots](./employee_screenshots.md) - Employee screenshot tracking for productivity monitoring
- [employee_twin_interactions](./employee_twin_interactions.md) - AI Twin interactions with employee records

### Benefits Management
- [benefit_plans](./benefit_plans.md) - Benefit plan definitions (health, dental, 401k, etc.)
- [benefit_plan_options](./benefit_plan_options.md) - Available benefit plan options and tiers
- [employee_benefits](./employee_benefits.md) - Employee benefit enrollments and coverage tracking
- [benefit_dependents](./benefit_dependents.md) - Employee benefit dependents (spouse, children, etc.)

### Time Off & Attendance
- [employee_time_off](./employee_time_off.md) - Employee time off requests and approvals
- [pto_balances](./pto_balances.md) - Employee PTO accrual and balance tracking
- [time_attendance](./time_attendance.md) - Employee time tracking and attendance records

### Payroll
- [payroll_runs](./payroll_runs.md) - Payroll processing runs and batch metadata
- [payroll_items](./payroll_items.md) - Individual payroll line items and deductions

### Performance Management
- [performance_reviews](./performance_reviews.md) - Formal performance review cycles and ratings
- [performance_goals](./performance_goals.md) - Employee performance goals and objectives
- [performance_feedback](./performance_feedback.md) - Continuous performance feedback and comments

### Onboarding
- [employee_onboarding](./employee_onboarding.md) - Employee onboarding status and workflow tracking
- [onboarding_checklist](./onboarding_checklist.md) - Onboarding checklist templates
- [onboarding_tasks](./onboarding_tasks.md) - Individual onboarding task assignments and completion

### Teams & Pods
- [pods](./pods.md) - Team pods with sprint metrics (recruiting, bench sales, TA)
- [pod_members](./pod_members.md) - Pod membership and role assignments
- [pod_sprint_metrics](./pod_sprint_metrics.md) - Sprint-level performance metrics for pods
- [team_metrics](./team_metrics.md) - Team-level performance metrics and KPIs

### Compliance
- [employee_compliance](./employee_compliance.md) - Employee compliance requirements and completion status
- [compliance_requirements](./compliance_requirements.md) - Compliance requirement definitions

### Productivity & Reporting
- [productivity_reports](./productivity_reports.md) - Productivity analysis and reporting
- [org_standups](./org_standups.md) - Organization-wide standup meetings and notes

### Shared/Cross-Domain
- [object_owners](./object_owners.md) - Entity ownership and permission tracking
- [comments](./comments.md) - Comments and notes on any entity type
- [talking_point_templates](./talking_point_templates.md) - Reusable talking point templates for meetings

## Domain Overview

The HR domain in InTime v3 is designed to handle comprehensive people operations for an enterprise staffing organization. It supports:

### Key Features

1. **Employee Lifecycle Management**
   - Hiring and onboarding workflows
   - Employment status tracking (onboarding, active, terminated)
   - Organizational hierarchy via manager relationships
   - Soft deletes for data retention

2. **Benefits Administration**
   - Multiple benefit plan types (health, dental, vision, 401k, etc.)
   - Plan options with different coverage tiers
   - Dependent coverage tracking
   - Enrollment and coverage period management

3. **Time & Attendance**
   - PTO accrual and balance tracking
   - Time off request and approval workflows
   - Attendance monitoring
   - Screenshot-based productivity tracking

4. **Payroll Processing**
   - Batch payroll runs
   - Individual payroll items and deductions
   - Support for multiple salary types (annual, hourly, etc.)
   - Multi-currency support

5. **Performance Management**
   - Formal review cycles
   - Goal setting and tracking
   - Continuous feedback
   - 360-degree review support

6. **Team Organization (Pods)**
   - Sprint-based team structure
   - Senior/junior member pairing
   - Performance metrics tracking
   - Multiple pod types: recruiting, bench_sales, ta

7. **Compliance Tracking**
   - Requirement definitions
   - Employee-specific compliance status
   - Deadline and renewal tracking

## Key Business Rules

### Pods = Teams
In InTime v3, the `pods` table represents teams. Each pod:
- Has a `pod_type`: recruiting, bench_sales, or ta
- Contains a `senior_member_id` (manager) and `junior_member_id` (recruiter)
- Tracks sprint metrics and placement targets
- Operates on sprint cycles (default: 2 weeks)

### Employment Hierarchy
- `employees.manager_id` creates a self-referential hierarchy
- `employees.user_id` links to `user_profiles` (1:1 relationship)
- All employees belong to an organization via `org_id`

### Soft Deletes
Most tables support soft deletes via `deleted_at`:
- NULL = active record
- NOT NULL = soft deleted
- Indexed for efficient querying of active records

### Audit Trails
Standard audit fields across most tables:
- `created_at`, `created_by`
- `updated_at`, `updated_by`
- All timestamps use `timestamptz` (timezone-aware)

## Common Patterns

### Foreign Key Conventions
- All IDs are UUIDs
- Foreign keys follow naming: `{entity}_id`
- Cascade deletes are generally avoided (prefer soft deletes)

### Status Enums
Many tables use PostgreSQL enums for status fields:
- `employment_status`: onboarding, active, terminated, etc.
- `benefit_status`: pending, active, terminated
- `work_mode`: remote, hybrid, on_site
- `salary_type`: annual, hourly, daily, project_based

### Indexing Strategy
- Primary keys: UUID with btree index
- Foreign keys: Indexed for join performance
- Status fields: Indexed for filtering
- Soft delete: Partial index on `deleted_at IS NULL`
- Composite indexes for common query patterns

## Entity Ownership

The `object_owners` table provides generic ownership tracking:
- Supports any entity type via `entity_type` + `entity_id`
- Role-based permissions (owner, viewer, editor, etc.)
- Primary owner designation via `is_primary`
- Assignment types: auto (system-assigned) or manual

## Comments System

The `comments` table provides generic commenting:
- Supports any entity type
- Threaded discussions via `parent_id`
- Rich text content support
- Visibility controls (public, internal, private)

## Related Documentation

- [Core Tables](../01-CORE/README.md) - Organizations, user profiles, audit logs
- [Recruiting Tables](../03-RECRUITING/README.md) - ATS domain tables
- [CRM Tables](../02-CRM/README.md) - Client relationship management
- [Academy Tables](../05-ACADEMY/README.md) - Training and certification

## Database Conventions

### Migration Process
All migrations use the `execute-sql` Edge Function:

```bash
# Source environment variables
source .env.local

# Execute SQL via Edge Function
curl -X POST 'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql' \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"sql":"YOUR SQL STATEMENT HERE"}'
```

### Schema Sync
- Keep `supabase/migrations/` in sync with Drizzle schemas
- Always use idempotent DDL (IF NOT EXISTS, IF EXISTS)
- Document enum types and custom types

## Table Statistics

| Category | Table Count |
|----------|-------------|
| Employee Management | 6 |
| Benefits | 4 |
| Time & Attendance | 3 |
| Payroll | 2 |
| Performance | 3 |
| Onboarding | 3 |
| Teams/Pods | 3 |
| Compliance | 2 |
| Productivity | 2 |
| Shared | 3 |
| **Total** | **32** |

## Quick Reference: Key Relationships

```
organizations
  └── employees (org_id)
       ├── employee_profiles (employee_id)
       ├── employee_benefits (employee_id)
       │    └── benefit_plan_options (plan_option_id)
       │         └── benefit_plans (plan_id)
       ├── employee_time_off (employee_id)
       ├── pto_balances (employee_id)
       ├── performance_reviews (employee_id)
       ├── performance_goals (employee_id)
       ├── employee_onboarding (employee_id)
       │    └── onboarding_tasks (onboarding_id)
       └── employee_compliance (employee_id)

  └── pods (org_id)
       ├── pod_members (pod_id)
       └── pod_sprint_metrics (pod_id)

user_profiles
  ├── employees (user_id) [1:1]
  ├── pods.senior_member_id
  └── pods.junior_member_id
```

## Notes

- All tables use UUID primary keys
- Timestamps are timezone-aware (`timestamptz`)
- Most tables support soft deletes
- Standard audit fields: created_at, created_by, updated_at, updated_by
- Entity ownership tracked via `object_owners` table
- Comments supported on any entity via `comments` table
