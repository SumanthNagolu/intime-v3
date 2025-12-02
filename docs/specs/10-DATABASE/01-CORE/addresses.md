# addresses Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `addresses` |
| Schema | `public` |
| Purpose | Polymorphic address storage for any entity (users, accounts, organizations). Supports multiple address types (home, work, billing) with verification and temporal validity. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID (multi-tenant) |
| entity_type | text | NO | - | Entity type (user_profile, account, organization, etc.) |
| entity_id | uuid | NO | - | Entity identifier |
| address_type | text | NO | - | Address type (home, work, billing, shipping, etc.) |
| address_line_1 | text | YES | - | Address line 1 |
| address_line_2 | text | YES | - | Address line 2 (apt, suite) |
| address_line_3 | text | YES | - | Address line 3 |
| city | text | YES | - | City |
| state_province | text | YES | - | State or province |
| postal_code | text | YES | - | Postal/ZIP code |
| country_code | text | NO | 'US' | ISO country code |
| county | text | YES | - | County/district |
| latitude | numeric | YES | - | Latitude for geocoding |
| longitude | numeric | YES | - | Longitude for geocoding |
| is_verified | boolean | YES | false | Address verification status |
| verified_at | timestamp with time zone | YES | - | Verification timestamp |
| verification_source | text | YES | - | Verification source (USPS, Google, manual) |
| is_primary | boolean | YES | false | Primary address flag |
| effective_from | date | YES | - | Effective start date |
| effective_to | date | YES | - | Effective end date |
| notes | text | YES | - | Additional notes |
| created_at | timestamp with time zone | YES | now() | Record creation timestamp |
| updated_at | timestamp with time zone | YES | now() | Last update timestamp |
| created_by | uuid | YES | - | Created by user_profiles.id |
| updated_by | uuid | YES | - | Updated by user_profiles.id |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | CASCADE |

## Indexes

| Index Name | Definition |
|------------|------------|
| addresses_pkey | CREATE UNIQUE INDEX addresses_pkey ON public.addresses USING btree (id) |
| idx_addresses_entity | CREATE INDEX idx_addresses_entity ON public.addresses USING btree (entity_type, entity_id) |
| idx_addresses_org | CREATE INDEX idx_addresses_org ON public.addresses USING btree (org_id) |
| idx_addresses_country | CREATE INDEX idx_addresses_country ON public.addresses USING btree (country_code) |

## Business Rules

1. **Polymorphic Design**: Single table for all entity types (users, accounts, organizations)
2. **Entity Lookup**: Combine entity_type + entity_id to find parent record
3. **Address Types**:
   - home: Home address
   - work: Work address
   - billing: Billing address
   - shipping: Shipping address
   - mailing: Mailing address
   - temporary: Temporary address
4. **Primary Address**: Each entity should have one is_primary=true per address_type
5. **Geocoding**: latitude/longitude enable distance calculations and mapping
6. **Address Verification**: is_verified + verification_source track validation
7. **Temporal Validity**: effective_from/effective_to support time-based addresses
8. **Multi-Tenant**: All addresses scoped to org_id
9. **Country Codes**: Use ISO 3166-1 alpha-2 codes (US, CA, GB, IN, etc.)
10. **Audit Trail**: created_by, updated_by, created_at, updated_at track changes
11. **Composite Index**: (entity_type, entity_id) for fast entity address lookups
12. **No Soft Deletes**: Addresses are hard deleted or marked inactive via effective_to
