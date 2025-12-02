# hotlist_consultants Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `hotlist_consultants` |
| Schema | `public` |
| Purpose | Junction table linking consultants to hotlists with ordering and notes, supports many-to-many relationship between hotlists and consultants |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| hotlist_id | uuid | NO | - | Reference to hotlist |
| consultant_id | uuid | NO | - | Reference to bench consultant |
| position_order | integer | YES | - | Display order in the hotlist |
| notes | text | YES | - | Notes about why consultant is in this hotlist |
| added_at | timestamp with time zone | NO | now() | When consultant was added to list |
| added_by | uuid | YES | - | User who added consultant to list |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| hotlist_id | hotlists.id | (implicit via constraint) |
| consultant_id | bench_consultants.id | hotlist_consultants_consultant_id_fkey |
| added_by | user_profiles.id | hotlist_consultants_added_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| hotlist_consultants_pkey | CREATE UNIQUE INDEX hotlist_consultants_pkey ON public.hotlist_consultants USING btree (id) |
| hotlist_consultants_hotlist_id_consultant_id_key | CREATE UNIQUE INDEX hotlist_consultants_hotlist_id_consultant_id_key ON public.hotlist_consultants USING btree (hotlist_id, consultant_id) |
| idx_hotlist_consultants_hotlist_id | CREATE INDEX idx_hotlist_consultants_hotlist_id ON public.hotlist_consultants USING btree (hotlist_id) |
| idx_hotlist_consultants_consultant_id | CREATE INDEX idx_hotlist_consultants_consultant_id ON public.hotlist_consultants USING btree (consultant_id) |
