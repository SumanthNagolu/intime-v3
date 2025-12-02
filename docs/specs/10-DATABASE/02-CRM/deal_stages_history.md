# deal_stages_history Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `deal_stages_history` |
| Schema | `public` |
| Purpose | Historical tracking of deal stage transitions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| deal_id | uuid | NO | NULL | Reference to deal |
| stage | text | NO | NULL | Stage |
| previous_stage | text | YES | NULL | Previous stage |
| entered_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Entered at |
| exited_at | timestamp with time zone | YES | NULL | Exited at |
| duration_days | integer | YES | NULL | Duration days |
| notes | text | YES | NULL | Additional notes |
| reason | text | YES | NULL | Reason |
| changed_by | uuid | YES | NULL | Changed by |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| changed_by | user_profiles.id | deal_stages_history_changed_by_fkey |
| deal_id | deals.id | deal_stages_history_deal_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| deal_stages_history_pkey | `CREATE UNIQUE INDEX deal_stages_history_pkey ON public.deal_stages_history USING btree (id)` |
| idx_deal_stages_history_deal_id | `CREATE INDEX idx_deal_stages_history_deal_id ON public.deal_stages_history USING btree (deal_id)` |
| idx_deal_stages_history_stage | `CREATE INDEX idx_deal_stages_history_stage ON public.deal_stages_history USING btree (stage)` |
| idx_deal_stages_history_entered_at | `CREATE INDEX idx_deal_stages_history_entered_at ON public.deal_stages_history USING btree (entered_at)` |
