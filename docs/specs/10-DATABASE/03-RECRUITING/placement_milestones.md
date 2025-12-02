# placement_milestones Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `placement_milestones` |
| Schema | `public` |
| Purpose | Key milestones in placement lifecycle (start date, 30/60/90 day reviews) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| placement_id | uuid | NO | - | Foreign key to placement |
| milestone_type | text | NO | - | Milestone type |
| due_date | date | YES | - | Due date |
| completed_at | timestamp with time zone | YES | - | Completed at |
| notes | text | YES | - | Notes |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| org_id | organizations.id | Organizations |
| placement_id | placements.id | Placements |

## Indexes

| Index Name | Definition |
|------------|------------|
| placement_milestones_pkey | CREATE UNIQUE INDEX placement_milestones_pkey ON public.placement_milestones USING btree (id) |
| idx_placement_milestones_placement_id | CREATE INDEX idx_placement_milestones_placement_id ON public.placement_milestones USING btree (placement_id) |
| idx_placement_milestones_due_date | CREATE INDEX idx_placement_milestones_due_date ON public.placement_milestones USING btree (due_date) |
