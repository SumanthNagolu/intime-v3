# consultant_availability Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `consultant_availability` |
| Schema | `public` |
| Purpose | Tracks detailed availability information for bench consultants including start dates, notice periods, blackout dates, and travel restrictions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| consultant_id | uuid | NO | - | Reference to bench consultant |
| available_from | date | NO | - | Date consultant is available to start |
| notice_period_days | integer | YES | 0 | Notice period in days |
| blackout_dates | jsonb | YES | - | JSON array of dates when consultant is unavailable |
| travel_restrictions | text | YES | - | Any travel restrictions or limitations |
| relocation_assistance_needed | boolean | YES | false | Whether consultant needs relocation assistance |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| consultant_id | bench_consultants.id | consultant_availability_consultant_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| consultant_availability_pkey | CREATE UNIQUE INDEX consultant_availability_pkey ON public.consultant_availability USING btree (id) |
| idx_consultant_availability_consultant_id | CREATE INDEX idx_consultant_availability_consultant_id ON public.consultant_availability USING btree (consultant_id) |
