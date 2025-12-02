# regions Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `regions` |
| Schema | `public` |
| Purpose | Defines geographic or organizational regions/territories for sales, recruiting, or operational management. Each region can have a manager and timezone. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID (multi-tenant) |
| name | text | NO | - | Region name (e.g., 'Northeast', 'West Coast') |
| code | text | YES | - | Short region code (e.g., 'NE', 'WC') |
| country | text | YES | - | Country or countries covered |
| timezone | text | YES | 'America/New_York' | Default timezone for region |
| manager_id | uuid | YES | - | Region manager (user_profiles.id) |
| is_active | boolean | YES | true | Active status |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |
| created_by | uuid | YES | - | Created by user_profiles.id |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| created_by | user_profiles.id | SET NULL |
| manager_id | user_profiles.id | SET NULL |
| org_id | organizations.id | CASCADE |

## Indexes

| Index Name | Definition |
|------------|------------|
| regions_pkey | CREATE UNIQUE INDEX regions_pkey ON public.regions USING btree (id) |
| idx_regions_org_id | CREATE INDEX idx_regions_org_id ON public.regions USING btree (org_id) |
| idx_regions_manager_id | CREATE INDEX idx_regions_manager_id ON public.regions USING btree (manager_id) |
| idx_regions_is_active | CREATE INDEX idx_regions_is_active ON public.regions USING btree (is_active) |

## Business Rules

1. **Territory Management**: Defines geographic sales/recruiting territories
2. **Regional Leadership**: manager_id assigns a regional manager
3. **Timezone Handling**: timezone helps with scheduling and time-based operations
4. **Multi-Tenant**: All regions scoped to org_id
5. **Soft Deletes**: Uses deleted_at for soft deletion
6. **Active Regions**: is_active filters for currently operational regions
7. **Region Codes**: Short codes (code) for quick reference
8. **Use Cases**:
   - Sales territories (Northeast, Southeast, West)
   - Recruiting territories (APAC, EMEA, Americas)
   - Operational regions (HQ, Remote, Field Offices)
9. **User Assignment**: Users can be assigned to regions via user_profiles.recruiter_territory
10. **Hierarchical**: Can be extended with parent_region_id for nested regions
11. **Reporting**: Enables region-based performance dashboards
12. **Country Coverage**: country field can be comma-separated or JSON array for multi-country regions
