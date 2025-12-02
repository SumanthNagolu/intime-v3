# vendor_performance Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `vendor_performance` |
| Schema | `public` |
| Purpose | Tracks vendor performance metrics over time including submission counts, placement rates, margins, and timeliness scores |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| vendor_id | uuid | NO | - | Reference to vendor |
| period | text | NO | - | Performance period (e.g., "2025-01", "Q1-2025") |
| submissions_count | integer | YES | 0 | Number of submissions received |
| interviews_count | integer | YES | 0 | Number of interviews conducted |
| placements_count | integer | YES | 0 | Number of successful placements |
| avg_margin_percent | numeric | YES | - | Average margin percentage |
| payment_timeliness_score | integer | YES | - | Payment timeliness score (0-100) |
| responsiveness_score | integer | YES | - | Responsiveness score (0-100) |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| vendor_id | vendors.id | vendor_performance_vendor_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| vendor_performance_pkey | CREATE UNIQUE INDEX vendor_performance_pkey ON public.vendor_performance USING btree (id) |
| vendor_performance_vendor_id_period_key | CREATE UNIQUE INDEX vendor_performance_vendor_id_period_key ON public.vendor_performance USING btree (vendor_id, period) |
| idx_vendor_performance_vendor_id | CREATE INDEX idx_vendor_performance_vendor_id ON public.vendor_performance USING btree (vendor_id) |
