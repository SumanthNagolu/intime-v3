# V Clients View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_clients` |
| Schema | `public` |
| Purpose | Active client accounts and their contract details |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | YES | Unique identifier |
| email | text | YES | User email address |
| contact_name | text | YES | contact name |
| client_company_name | text | YES | client company name |
| client_industry | text | YES | client industry |
| client_tier | text | YES | client tier |
| client_contract_start_date | timestamptz | YES | client contract start date |
| client_contract_end_date | timestamptz | YES | client contract end date |
| client_payment_terms | integer | YES | client payment terms |

## Definition

```sql
CREATE OR REPLACE VIEW v_clients AS
 SELECT id,
    email,
    full_name AS contact_name,
    client_company_name,
    client_industry,
    client_tier,
    client_contract_start_date,
    client_contract_end_date,
    client_payment_terms
   FROM user_profiles
  WHERE ((client_company_name IS NOT NULL) AND (deleted_at IS NULL))
  ORDER BY client_tier DESC, client_company_name;
```
