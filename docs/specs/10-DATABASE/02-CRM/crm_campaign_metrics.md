# crm_campaign_metrics Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `crm_campaign_metrics` |
| Schema | `public` |
| Purpose | Performance metrics and analytics for campaigns |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| campaign_id | uuid | NO | NULL | Reference to campaign |
| period | text | YES | NULL | Period |
| period_start | timestamp with time zone | YES | NULL | Period start |
| period_end | timestamp with time zone | YES | NULL | Period end |
| total_targets | integer | YES | `0` | Total targets |
| total_sent | integer | YES | `0` | Total sent |
| total_delivered | integer | YES | `0` | Total delivered |
| total_bounced | integer | YES | `0` | Total bounced |
| total_opens | integer | YES | `0` | Total opens |
| unique_opens | integer | YES | `0` | Unique opens |
| total_clicks | integer | YES | `0` | Total clicks |
| unique_clicks | integer | YES | `0` | Unique clicks |
| total_responses | integer | YES | `0` | Total responses |
| total_conversions | integer | YES | `0` | Total conversions |
| total_leads_generated | integer | YES | `0` | Total leads generated |
| total_meetings_booked | integer | YES | `0` | Total meetings booked |
| open_rate | numeric | YES | NULL | Open rate |
| click_rate | numeric | YES | NULL | Click rate |
| response_rate | numeric | YES | NULL | Response rate |
| conversion_rate | numeric | YES | NULL | Conversion rate |
| bounce_rate | numeric | YES | NULL | Bounce rate |
| total_spend | numeric | YES | NULL | Total spend |
| cost_per_send | numeric | YES | NULL | Cost per send |
| cost_per_open | numeric | YES | NULL | Cost per open |
| cost_per_click | numeric | YES | NULL | Cost per click |
| cost_per_conversion | numeric | YES | NULL | Cost per conversion |
| roi | numeric | YES | NULL | Roi |
| attributed_revenue | numeric | YES | NULL | Attributed revenue |
| calculated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Calculated at |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| campaign_id | crm_campaigns.id | crm_campaign_metrics_campaign_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| crm_campaign_metrics_pkey | `CREATE UNIQUE INDEX crm_campaign_metrics_pkey ON public.crm_campaign_metrics USING btree (id)` |
| idx_crm_campaign_metrics_campaign_id | `CREATE INDEX idx_crm_campaign_metrics_campaign_id ON public.crm_campaign_metrics USING btree (campaign_id)` |
| idx_crm_campaign_metrics_period | `CREATE INDEX idx_crm_campaign_metrics_period ON public.crm_campaign_metrics USING btree (period)` |
