# lead_qualification Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `lead_qualification` |
| Schema | `public` |
| Purpose | BANT qualification details for leads |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| lead_id | uuid | NO | NULL | Reference to lead |
| has_budget | boolean | YES | NULL | Has budget |
| budget_amount | numeric | YES | NULL | Budget amount |
| budget_timeframe | text | YES | NULL | Budget timeframe |
| budget_notes | text | YES | NULL | Budget notes |
| decision_maker | text | YES | NULL | Decision maker |
| decision_process | text | YES | NULL | Decision process |
| other_stakeholders | text | YES | NULL | Other stakeholders |
| authority_notes | text | YES | NULL | Authority notes |
| need_identified | boolean | YES | NULL | Need identified |
| need_urgency | text | YES | NULL | Need urgency |
| pain_points | ARRAY | YES | NULL | Pain points |
| current_solution | text | YES | NULL | Current solution |
| need_notes | text | YES | NULL | Need notes |
| timeline | text | YES | NULL | Timeline |
| decision_date | timestamp with time zone | YES | NULL | Decision date |
| project_start_date | timestamp with time zone | YES | NULL | Project start date |
| timeline_notes | text | YES | NULL | Timeline notes |
| qualified_by | uuid | YES | NULL | Qualified by |
| qualified_at | timestamp with time zone | YES | NULL | Qualified at |
| qualification_status | text | YES | NULL | Qualification status |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| lead_id | leads.id | lead_qualification_lead_id_fkey |
| qualified_by | user_profiles.id | lead_qualification_qualified_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| lead_qualification_pkey | `CREATE UNIQUE INDEX lead_qualification_pkey ON public.lead_qualification USING btree (id)` |
| idx_lead_qualification_lead_id | `CREATE INDEX idx_lead_qualification_lead_id ON public.lead_qualification USING btree (lead_id)` |
| idx_lead_qualification_status | `CREATE INDEX idx_lead_qualification_status ON public.lead_qualification USING btree (qualification_status)` |
