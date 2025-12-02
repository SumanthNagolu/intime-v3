# deal_competitors Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `deal_competitors` |
| Schema | `public` |
| Purpose | Competitive analysis for deals |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| deal_id | uuid | NO | NULL | Reference to deal |
| competitor_name | text | NO | NULL | Competitor name |
| competitor_website | text | YES | NULL | Competitor website |
| strengths | text | YES | NULL | Strengths |
| weaknesses | text | YES | NULL | Weaknesses |
| our_differentiators | text | YES | NULL | Our differentiators |
| pricing | text | YES | NULL | Pricing |
| status | text | YES | `'active'::text` | Current status |
| threat_level | text | YES | NULL | Threat level |
| notes | text | YES | NULL | Additional notes |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| deal_id | deals.id | deal_competitors_deal_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| deal_competitors_pkey | `CREATE UNIQUE INDEX deal_competitors_pkey ON public.deal_competitors USING btree (id)` |
| idx_deal_competitors_deal_id | `CREATE INDEX idx_deal_competitors_deal_id ON public.deal_competitors USING btree (deal_id)` |
| idx_deal_competitors_name | `CREATE INDEX idx_deal_competitors_name ON public.deal_competitors USING btree (competitor_name)` |
| idx_deal_competitors_status | `CREATE INDEX idx_deal_competitors_status ON public.deal_competitors USING btree (status)` |
