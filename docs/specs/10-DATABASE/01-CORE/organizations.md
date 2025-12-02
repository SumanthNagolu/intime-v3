# organizations Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `organizations` |
| Schema | `public` |
| Purpose | Central table storing multi-tenant organization data including subscription details, billing information, and organization settings |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| name | text | NO | - | Organization display name |
| slug | text | NO | - | Unique URL-friendly identifier |
| legal_name | text | YES | - | Legal business name |
| email | text | YES | - | Primary organization contact email |
| phone | text | YES | - | Organization phone number |
| website | text | YES | - | Organization website URL |
| address_line1 | text | YES | - | Address line 1 |
| address_line2 | text | YES | - | Address line 2 |
| city | text | YES | - | City |
| state | text | YES | - | State/Province |
| postal_code | text | YES | - | Postal/ZIP code |
| country | text | YES | 'US' | Country code |
| billing_email | text | YES | - | Billing contact email |
| tax_id | text | YES | - | Tax identification number |
| subscription_tier | text | NO | 'free' | Subscription tier (free, starter, pro, enterprise) |
| subscription_status | text | NO | 'active' | Subscription status |
| max_users | integer | YES | 5 | Maximum allowed users |
| max_candidates | integer | YES | 100 | Maximum allowed candidates |
| max_storage_gb | integer | YES | 10 | Maximum storage in GB |
| features | jsonb | YES | '{}' | Enabled feature flags |
| settings | jsonb | YES | '{}' | Organization-specific settings |
| status | text | NO | 'active' | Organization status (active, suspended, etc.) |
| onboarding_completed | boolean | YES | false | Whether onboarding is complete |
| onboarding_step | text | YES | - | Current onboarding step |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |
| timezone | text | YES | 'America/New_York' | Organization timezone |
| locale | text | YES | 'en-US' | Organization locale |
| logo_url | text | YES | - | Organization logo URL |
| favicon_url | text | YES | - | Organization favicon URL |
| plan | text | YES | 'free' | Subscription plan |
| metadata | jsonb | YES | '{}' | Additional metadata |
| stripe_coupon_id | text | YES | - | Stripe coupon identifier |
| stripe_customer_id | text | YES | - | Stripe customer identifier |
| tier | text | YES | 'starter' | Organization tier |
| industry | text | YES | - | Industry vertical |
| health_score | integer | YES | - | Customer health score (0-100) |

## Foreign Keys

No foreign keys (root entity in multi-tenant hierarchy)

## Indexes

| Index Name | Definition |
|------------|------------|
| organizations_pkey | CREATE UNIQUE INDEX organizations_pkey ON public.organizations USING btree (id) |
| organizations_slug_key | CREATE UNIQUE INDEX organizations_slug_key ON public.organizations USING btree (slug) |
| idx_organizations_slug | CREATE INDEX idx_organizations_slug ON public.organizations USING btree (slug) |
| idx_organizations_status | CREATE INDEX idx_organizations_status ON public.organizations USING btree (status) |
| idx_organizations_subscription_tier | CREATE INDEX idx_organizations_subscription_tier ON public.organizations USING btree (subscription_tier) |
| idx_organizations_deleted_at | CREATE INDEX idx_organizations_deleted_at ON public.organizations USING btree (deleted_at) WHERE (deleted_at IS NULL) |
| idx_organizations_stripe_customer | CREATE INDEX idx_organizations_stripe_customer ON public.organizations USING btree (stripe_customer_id) WHERE (stripe_customer_id IS NOT NULL) |
| idx_organizations_email | CREATE INDEX idx_organizations_email ON public.organizations USING btree (email) WHERE (deleted_at IS NULL) |

## Business Rules

1. **Multi-Tenancy**: Root entity for tenant isolation - all other tables reference org_id
2. **Subscription Management**: Tracks plan limits (max_users, max_candidates, max_storage_gb)
3. **Soft Deletes**: Uses deleted_at for soft deletion
4. **Unique Slug**: Slug must be globally unique for subdomain/routing
5. **Stripe Integration**: Links to Stripe customer via stripe_customer_id
6. **Health Score**: Tracks customer engagement/usage for retention efforts
