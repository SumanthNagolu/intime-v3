# account_team Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `account_team` |
| Schema | `public` |
| Purpose | Team members assigned to accounts (RCAI assignments) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| account_id | uuid | NO | NULL | Reference to account |
| user_id | uuid | NO | NULL | Reference to user |
| role | text | NO | NULL | Role |
| assigned_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Assigned at |
| unassigned_at | timestamp with time zone | YES | NULL | Unassigned at |
| is_active | boolean | YES | `true` | Whether this record is active |
| is_primary | boolean | YES | `false` | Whether this is the primary record |
| notes | text | YES | NULL | Additional notes |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| created_by | uuid | YES | NULL | User who created the record |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| account_id | accounts.id | account_team_account_id_fkey |
| created_by | user_profiles.id | account_team_created_by_fkey |
| user_id | user_profiles.id | account_team_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| account_team_pkey | `CREATE UNIQUE INDEX account_team_pkey ON public.account_team USING btree (id)` |
| idx_account_team_account_id | `CREATE INDEX idx_account_team_account_id ON public.account_team USING btree (account_id)` |
| idx_account_team_user_id | `CREATE INDEX idx_account_team_user_id ON public.account_team USING btree (user_id)` |
| idx_account_team_role | `CREATE INDEX idx_account_team_role ON public.account_team USING btree (role)` |
