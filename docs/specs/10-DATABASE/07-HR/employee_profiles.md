# employee_profiles Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `employee_profiles` |
| Schema | `public` |
| Purpose | Extended employee profile information and preferences |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `employee_id` | uuid | NO | - | Employee reference |
| `date_of_birth` | date | YES | - | Date Of Birth |
| `ssn_encrypted` | text | YES | - | Ssn Encrypted |
| `address_street` | text | YES | - | Address Street |
| `address_city` | text | YES | - | Address City |
| `address_state` | text | YES | - | Address State |
| `address_country` | text | YES | 'USA'::text | Address Country |
| `address_postal` | text | YES | - | Address Postal |
| `emergency_contact_name` | text | YES | - | Emergency Contact Name |
| `emergency_contact_phone` | text | YES | - | Emergency Contact Phone |
| `emergency_contact_relationship` | text | YES | - | Emergency Contact Relationship |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `employee_id` | `employees.id` | Links to employees |

## Indexes

| Index Name | Definition |
|------------|------------|
| `employee_profiles_pkey` | `CREATE UNIQUE INDEX employee_profiles_pkey ON public.employee_profiles USING btree (employee_id)` |

## Usage Notes

- Extends employee data with profiles information
- Linked to employees table via employee_id foreign key
