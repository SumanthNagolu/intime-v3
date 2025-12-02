# vendor_relationships Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `vendor_relationships` |
| Schema | `public` |
| Purpose | Polymorphic relationship table linking vendors to other entities (accounts, contacts, etc.) with relationship type and strength tracking |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| vendor_id | uuid | NO | - | Reference to vendor |
| related_entity_type | text | NO | - | Type of related entity (account, contact, etc.) |
| related_entity_id | uuid | NO | - | ID of the related entity |
| relationship_type | text | NO | - | Type of relationship |
| strength | text | YES | - | Relationship strength (strong/medium/weak) |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| created_by | uuid | YES | - | User who created the relationship |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| vendor_id | vendors.id | vendor_relationships_vendor_id_fkey |
| created_by | user_profiles.id | vendor_relationships_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| vendor_relationships_pkey | CREATE UNIQUE INDEX vendor_relationships_pkey ON public.vendor_relationships USING btree (id) |
| idx_vendor_relationships_vendor_id | CREATE INDEX idx_vendor_relationships_vendor_id ON public.vendor_relationships USING btree (vendor_id) |
| idx_vendor_relationships_related_entity | CREATE INDEX idx_vendor_relationships_related_entity ON public.vendor_relationships USING btree (related_entity_type, related_entity_id) |
