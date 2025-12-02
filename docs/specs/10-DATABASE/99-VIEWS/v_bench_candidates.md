# V Bench Candidates View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_bench_candidates` |
| Schema | `public` |
| Purpose | Available bench candidates with their skills and availability |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | YES | Unique identifier |
| email | text | YES | User email address |
| full_name | text | YES | User full name |
| candidate_skills | ARRAY | YES | candidate skills |
| candidate_experience_years | integer | YES | candidate experience years |
| candidate_current_visa | text | YES | candidate current visa |
| candidate_hourly_rate | numeric | YES | candidate hourly rate |
| candidate_availability | text | YES | candidate availability |
| candidate_location | text | YES | candidate location |
| candidate_bench_start_date | timestamptz | YES | candidate bench start date |

## Definition

```sql
CREATE OR REPLACE VIEW v_bench_candidates AS
 SELECT id,
    email,
    full_name,
    candidate_skills,
    candidate_experience_years,
    candidate_current_visa,
    candidate_hourly_rate,
    candidate_availability,
    candidate_location,
    candidate_bench_start_date
   FROM user_profiles
  WHERE ((candidate_status = 'bench'::text) AND (deleted_at IS NULL))
  ORDER BY candidate_bench_start_date;
```
