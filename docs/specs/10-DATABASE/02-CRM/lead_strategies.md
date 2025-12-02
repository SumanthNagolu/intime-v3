# lead_strategies Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `lead_strategies` |
| Schema | `public` |
| Purpose | Sales strategies and approaches for leads |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| org_id | uuid | NO | NULL | Organization ID (tenant isolation) |
| lead_id | uuid | NO | NULL | Reference to lead |
| strategy_notes | text | YES | NULL | Strategy notes |
| talking_points | jsonb | YES | `'[]'::jsonb` | Talking points |
| value_proposition | text | YES | NULL | Value proposition |
| differentiators | jsonb | YES | `'[]'::jsonb` | Differentiators |
| objections | jsonb | YES | `'[]'::jsonb` | Objections |
| stakeholders | jsonb | YES | `'[]'::jsonb` | Stakeholders |
| competitors | jsonb | YES | `'[]'::jsonb` | Competitors |
| win_themes | jsonb | YES | `'[]'::jsonb` | Win themes |
| pain_points | jsonb | YES | `'[]'::jsonb` | Pain points |
| meeting_agenda | jsonb | YES | `'[]'::jsonb` | Meeting agenda |
| questions_to_ask | jsonb | YES | `'[]'::jsonb` | Questions to ask |
| desired_outcomes | jsonb | YES | `'[]'::jsonb` | Desired outcomes |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |
| created_by | uuid | YES | NULL | User who created the record |
| updated_by | uuid | YES | NULL | User who last updated the record |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| created_by | user_profiles.id | lead_strategies_created_by_fkey |
| lead_id | leads.id | lead_strategies_lead_id_fkey |
| org_id | organizations.id | lead_strategies_org_id_fkey |
| updated_by | user_profiles.id | lead_strategies_updated_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| lead_strategies_pkey | `CREATE UNIQUE INDEX lead_strategies_pkey ON public.lead_strategies USING btree (id)` |
| lead_strategies_lead_id_key | `CREATE UNIQUE INDEX lead_strategies_lead_id_key ON public.lead_strategies USING btree (lead_id)` |
| idx_lead_strategies_org | `CREATE INDEX idx_lead_strategies_org ON public.lead_strategies USING btree (org_id)` |
| idx_lead_strategies_lead | `CREATE INDEX idx_lead_strategies_lead ON public.lead_strategies USING btree (lead_id)` |
