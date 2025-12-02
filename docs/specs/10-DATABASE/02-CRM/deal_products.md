# deal_products Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `deal_products` |
| Schema | `public` |
| Purpose | Products/services associated with deals |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| deal_id | uuid | NO | NULL | Reference to deal |
| product_type | text | NO | NULL | Product type |
| product_name | text | YES | NULL | Product name |
| description | text | YES | NULL | Detailed description |
| quantity | integer | YES | `1` | Quantity |
| unit_price | numeric | YES | NULL | Unit price |
| total_value | numeric | YES | NULL | Total value |
| discount | numeric | YES | NULL | Discount |
| currency | text | YES | `'USD'::text` | Currency |
| duration_months | integer | YES | NULL | Duration months |
| start_date | timestamp with time zone | YES | NULL | Start date |
| end_date | timestamp with time zone | YES | NULL | End date |
| notes | text | YES | NULL | Additional notes |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| deal_id | deals.id | deal_products_deal_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| deal_products_pkey | `CREATE UNIQUE INDEX deal_products_pkey ON public.deal_products USING btree (id)` |
| idx_deal_products_deal_id | `CREATE INDEX idx_deal_products_deal_id ON public.deal_products USING btree (deal_id)` |
| idx_deal_products_type | `CREATE INDEX idx_deal_products_type ON public.deal_products USING btree (product_type)` |
