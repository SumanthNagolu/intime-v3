# placement_timesheets Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `placement_timesheets` |
| Schema | `public` |
| Purpose | Timesheet submissions for contractors |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| placement_id | uuid | NO | - | Foreign key to placement |
| week_ending | date | NO | - | Week ending |
| regular_hours | numeric | YES | 0 | Regular hours |
| overtime_hours | numeric | YES | 0 | Overtime hours |
| status | text | NO | 'draft'::text | Status |
| submitted_at | timestamp with time zone | YES | - | Submitted at |
| approved_by | uuid | YES | - | Approved by |
| approved_at | timestamp with time zone | YES | - | Approved at |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| approved_by | user_profiles.id | User profiles |
| org_id | organizations.id | Organizations |
| placement_id | placements.id | Placements |

## Indexes

| Index Name | Definition |
|------------|------------|
| placement_timesheets_pkey | CREATE UNIQUE INDEX placement_timesheets_pkey ON public.placement_timesheets USING btree (id) |
| idx_placement_timesheets_placement_id | CREATE INDEX idx_placement_timesheets_placement_id ON public.placement_timesheets USING btree (placement_id) |
| idx_placement_timesheets_week_ending | CREATE INDEX idx_placement_timesheets_week_ending ON public.placement_timesheets USING btree (week_ending) |
