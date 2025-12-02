# skills Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `skills` |
| Schema | `public` |
| Purpose | Master skill taxonomy supporting hierarchical skill relationships. Used for candidate skills, job requirements, and skill matching across the platform. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| name | text | NO | - | Canonical skill name (unique) |
| category | text | YES | - | Skill category (programming, framework, database, soft_skill, etc.) |
| parent_skill_id | uuid | YES | - | Parent skill for hierarchy (e.g., React -> JavaScript) |
| description | text | YES | - | Skill description |
| is_verified | boolean | YES | false | Whether skill is verified/approved |
| usage_count | integer | YES | 0 | Number of times skill is used (denormalized) |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| parent_skill_id | skills.id | CASCADE (self-referencing) |

## Indexes

| Index Name | Definition |
|------------|------------|
| skills_pkey | CREATE UNIQUE INDEX skills_pkey ON public.skills USING btree (id) |
| skills_name_key | CREATE UNIQUE INDEX skills_name_key ON public.skills USING btree (name) |
| idx_skills_category | CREATE INDEX idx_skills_category ON public.skills USING btree (category) |
| idx_skills_name_lower | CREATE INDEX idx_skills_name_lower ON public.skills USING btree (lower(name)) |
| idx_skills_parent | CREATE INDEX idx_skills_parent ON public.skills USING btree (parent_skill_id) |

## Business Rules

1. **Global Skill Registry**: Single source of truth for all skills across the platform
2. **Unique Names**: Skill names must be unique (case-insensitive via lower(name) index)
3. **Hierarchical Structure**: Supports skill taxonomy via parent_skill_id
   - Example: React -> JavaScript -> Programming Languages
   - Example: PostgreSQL -> SQL Databases -> Databases
4. **Skill Categories**:
   - programming_language: Java, Python, JavaScript
   - framework: React, Angular, Spring Boot
   - database: PostgreSQL, MongoDB, MySQL
   - cloud: AWS, Azure, GCP
   - tool: Git, Docker, Jenkins
   - soft_skill: Communication, Leadership
   - domain: Healthcare, Finance, E-commerce
5. **Verification**: is_verified=true indicates approved/canonical skills
6. **Usage Tracking**: usage_count tracks popularity (incremented when used)
7. **Skill Aliases**: Alternative names handled in skill_aliases table
8. **Case Insensitive Search**: idx_skills_name_lower enables case-insensitive lookups
9. **No Org Scope**: Skills are global, not org-specific (aliases are org-specific)
10. **Matching**: Used for:
    - Candidate skills (user_profiles.candidate_skills array)
    - Job requirements
    - Skill-based search and matching
11. **Auto-Complete**: Indexed for fast typeahead search
12. **Deduplication**: Before creating new skills, check for existing via case-insensitive search
