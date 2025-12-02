# deal_stakeholders Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `deal_stakeholders` |
| Schema | `public` |
| Purpose | Key stakeholders involved in deals |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| deal_id | uuid | NO | NULL | Reference to deal |
| contact_id | uuid | YES | NULL | Reference to contact |
| name | text | YES | NULL | Name or title |
| title | text | YES | NULL | Title |
| email | text | YES | NULL | Email address |
| role | text | NO | NULL | Role |
| influence_level | text | YES | NULL | Influence level |
| sentiment | text | YES | NULL | Sentiment |
| engagement_notes | text | YES | NULL | Engagement notes |
| is_active | boolean | YES | `true` | Whether this record is active |
| is_primary | boolean | YES | `false` | Whether this is the primary record |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| deal_id | deals.id | deal_stakeholders_deal_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| deal_stakeholders_pkey | `CREATE UNIQUE INDEX deal_stakeholders_pkey ON public.deal_stakeholders USING btree (id)` |
| idx_deal_stakeholders_deal_id | `CREATE INDEX idx_deal_stakeholders_deal_id ON public.deal_stakeholders USING btree (deal_id)` |
| idx_deal_stakeholders_contact_id | `CREATE INDEX idx_deal_stakeholders_contact_id ON public.deal_stakeholders USING btree (contact_id)` |
| idx_deal_stakeholders_role | `CREATE INDEX idx_deal_stakeholders_role ON public.deal_stakeholders USING btree (role)` |
