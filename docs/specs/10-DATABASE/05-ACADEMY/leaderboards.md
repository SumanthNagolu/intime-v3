# leaderboards Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `leaderboards` |
| Schema | `public` |
| Purpose | Configuration for different leaderboard types and rules |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| type | USER-DEFINED | NO | - | Type |
| scope | USER-DEFINED | NO | - | Scope |
| period_start | timestamp with time zone | NO | - | Period Start |
| period_end | timestamp with time zone | NO | - | Period End |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

No foreign key constraints defined.

## Indexes

| Index Name | Definition |
|------------|------------|
| leaderboards_pkey | `CREATE UNIQUE INDEX leaderboards_pkey ON public.leaderboards USING btree (id)` |
| idx_leaderboards_type | `CREATE INDEX idx_leaderboards_type ON public.leaderboards USING btree (type)` |
| idx_leaderboards_scope | `CREATE INDEX idx_leaderboards_scope ON public.leaderboards USING btree (scope)` |
| idx_leaderboards_period | `CREATE INDEX idx_leaderboards_period ON public.leaderboards USING btree (period_start, period_end)` |
