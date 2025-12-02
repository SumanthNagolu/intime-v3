# placement_rates Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `placement_rates` |
| Schema | `public` |
| Purpose | Billing rates and terms for active placements |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| placement_id | uuid | NO | - | Foreign key to placement |
| bill_rate | numeric | NO | - | Bill rate |
| pay_rate | numeric | NO | - | Pay rate |
| margin_percent | numeric | YES | - | Margin percent |
| effective_from | date | NO | - | Effective from |
| effective_to | date | YES | - | Effective to |
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
| placement_rates_pkey | CREATE UNIQUE INDEX placement_rates_pkey ON public.placement_rates USING btree (id) |
| idx_placement_rates_placement_id | CREATE INDEX idx_placement_rates_placement_id ON public.placement_rates USING btree (placement_id) |
