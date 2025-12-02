# V Sprint 5 Status View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_sprint_5_status` |
| Schema | `public` |
| Purpose | Sprint 5 development status and progress |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| table_name | text | YES | table name |
| total_records | bigint | YES | total records |
| unique_orgs | bigint | YES | unique orgs |
| unique_users | bigint | YES | unique users |
| placements | bigint | YES | placements |
| avg_quality | numeric | YES | avg quality |

## Definition

```sql
CREATE OR REPLACE VIEW v_sprint_5_status AS
 SELECT 'generated_resumes'::text AS table_name,
    count(*) AS total_records,
    count(DISTINCT generated_resumes.org_id) AS unique_orgs,
    count(DISTINCT generated_resumes.user_id) AS unique_users,
    count(*) FILTER (WHERE (generated_resumes.placement_achieved = true)) AS placements,
    round(avg(generated_resumes.quality_score), 2) AS avg_quality
   FROM generated_resumes
UNION ALL
 SELECT 'candidate_embeddings'::text AS table_name,
    count(*) AS total_records,
    count(DISTINCT candidate_embeddings.org_id) AS unique_orgs,
    count(DISTINCT candidate_embeddings.candidate_id) AS unique_users,
    NULL::bigint AS placements,
    NULL::numeric AS avg_quality
   FROM candidate_embeddings
UNION ALL
 SELECT 'requisition_embeddings'::text AS table_name,
    count(*) AS total_records,
    count(DISTINCT requisition_embeddings.org_id) AS unique_orgs,
    count(DISTINCT requisition_embeddings.requisition_id) AS unique_users,
    NULL::bigint AS placements,
    NULL::numeric AS avg_quality
   FROM requisition_embeddings
UNION ALL
 SELECT 'resume_matches'::text AS table_name,
    count(*) AS total_records,
    count(DISTINCT resume_matches.org_id) AS unique_orgs,
    count(DISTINCT resume_matches.candidate_id) AS unique_users,
    count(*) FILTER (WHERE (resume_matches.placement_achieved = true)) AS placements,
    round(avg(resume_matches.match_score), 2) AS avg_quality
   FROM resume_matches;
```
