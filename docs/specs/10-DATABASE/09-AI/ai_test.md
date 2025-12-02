# ai_test Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_test` |
| Schema | `public` |
| Purpose | Simple test table for AI infrastructure validation and development testing |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier |

## Foreign Keys

None

## Indexes

| Index Name | Definition |
|------------|------------|
| ai_test_pkey | CREATE UNIQUE INDEX ai_test_pkey ON public.ai_test USING btree (id) |

## Usage Notes

- Minimal test table for development and CI/CD purposes
- Not used in production workflows
- Can be used to verify database connectivity and permissions
