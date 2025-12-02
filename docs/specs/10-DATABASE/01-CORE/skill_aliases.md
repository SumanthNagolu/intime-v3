# skill_aliases Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `skill_aliases` |
| Schema | `public` |
| Purpose | Organization-specific skill aliases/synonyms that map to canonical skills. Enables flexible skill matching while maintaining standardized taxonomy. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID (multi-tenant) |
| skill_id | uuid | NO | - | Canonical skill reference |
| alias | text | NO | - | Alternative skill name |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | CASCADE |
| skill_id | skills.id | CASCADE |

## Indexes

| Index Name | Definition |
|------------|------------|
| skill_aliases_pkey | CREATE UNIQUE INDEX skill_aliases_pkey ON public.skill_aliases USING btree (id) |
| idx_skill_aliases_skill_id | CREATE INDEX idx_skill_aliases_skill_id ON public.skill_aliases USING btree (skill_id) |

## Business Rules

1. **Alias Mapping**: Maps organization-specific skill terms to canonical skills
2. **Multi-Tenant**: Each organization can define their own aliases
3. **Soft Deletes**: Uses deleted_at for soft deletion
4. **Examples**:
   - alias='JS' -> skill='JavaScript'
   - alias='React.js' -> skill='React'
   - alias='Postgres' -> skill='PostgreSQL'
   - alias='AWS Lambda' -> skill='AWS'
5. **Skill Matching**: During resume parsing or job posting:
   - Check if input text matches skills.name
   - If not, check skill_aliases.alias for org
   - Map to canonical skills.id
6. **Resume Parsing**: When extracting skills from resumes:
   - Parse raw skill text
   - Look up in skill_aliases for org
   - Store canonical skill_id or name
7. **Search Enhancement**: Enables finding candidates by alias terms
8. **One-to-Many**: Multiple aliases can map to same skill_id
9. **Case Sensitivity**: Application should handle case-insensitive matching
10. **Cascade Deletes**: Deleting skill or org removes aliases
11. **Use Cases**:
    - Company-specific terminology (e.g., "React Framework" vs "React")
    - Abbreviations (e.g., "JS" vs "JavaScript")
    - Alternative spellings (e.g., "Node.js" vs "NodeJS")
    - Version-specific (e.g., "Java 17" maps to "Java")
12. **Uniqueness**: No enforced unique constraint - same alias can exist for different orgs
