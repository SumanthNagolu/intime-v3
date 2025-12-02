# file_uploads Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `file_uploads` |
| Schema | `public` |
| Purpose | Tracks all file uploads with metadata, storage location, entity associations, and soft deletion support. Integrates with Supabase Storage. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for file upload |
| org_id | uuid | NO | - | Organization ID for multi-tenant isolation |
| bucket | text | NO | - | Supabase Storage bucket name (e.g., 'resumes', 'documents', 'avatars') |
| file_path | text | NO | - | Full path to file in bucket (e.g., 'org-id/resumes/file.pdf') |
| file_name | text | NO | - | Original filename uploaded by user |
| file_size | integer | NO | - | File size in bytes |
| mime_type | text | NO | - | MIME type (e.g., 'application/pdf', 'image/jpeg') |
| entity_type | text | YES | - | Type of entity file is attached to (e.g., 'candidate', 'job', 'user_profile') |
| entity_id | uuid | YES | - | ID of the entity file is attached to |
| uploaded_by | uuid | NO | - | ID of user who uploaded the file |
| uploaded_at | timestamp with time zone | NO | now() | Timestamp when file was uploaded |
| deleted_at | timestamp with time zone | YES | - | Soft deletion timestamp |
| metadata | jsonb | NO | '{}' | Additional file metadata (dimensions, duration, extracted text, etc.) |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | CASCADE |
| uploaded_by | user_profiles.id | SET NULL |

## Indexes

| Index Name | Definition |
|------------|------------|
| file_uploads_pkey | CREATE UNIQUE INDEX ON file_uploads (id) |
| idx_file_uploads_org | CREATE INDEX ON file_uploads (org_id) |
| idx_file_uploads_entity | CREATE INDEX ON file_uploads (entity_type, entity_id) WHERE deleted_at IS NULL |
| idx_file_uploads_uploaded_by | CREATE INDEX ON file_uploads (uploaded_by) |
| idx_file_uploads_uploaded_at | CREATE INDEX ON file_uploads (uploaded_at DESC) |
| idx_file_uploads_bucket | CREATE INDEX ON file_uploads (bucket) |

## Use Cases

1. **Resume Storage** - Store candidate resumes and cover letters
2. **Document Management** - Attach contracts, offer letters, NDAs
3. **Profile Pictures** - Store user avatars and company logos
4. **Course Materials** - Store training videos, PDFs, presentations
5. **Attachments** - General file attachments to any entity
6. **Compliance** - Track who uploaded what and when
7. **Storage Analytics** - Monitor storage usage by org, user, or entity type

## Common Buckets

- **resumes** - Candidate resumes and CVs
- **avatars** - User profile pictures
- **documents** - Contracts, offer letters, legal documents
- **course-materials** - Training videos, slides, PDFs
- **attachments** - General file attachments
- **exports** - Generated reports and exports

## File Metadata Examples

```json
{
  "dimensions": {"width": 1920, "height": 1080},
  "duration": 120.5,
  "extractedText": "Resume content...",
  "thumbnailPath": "thumbnails/file-id.jpg",
  "virus_scan": {"status": "clean", "scanned_at": "2025-12-01T10:00:00Z"}
}
```

## Example Queries

```sql
-- Get all resumes for a candidate
SELECT * FROM file_uploads
WHERE entity_type = 'candidate'
  AND entity_id = 'candidate-uuid'
  AND deleted_at IS NULL
ORDER BY uploaded_at DESC;

-- Calculate storage usage by organization
SELECT
  org_id,
  COUNT(*) as file_count,
  SUM(file_size) / 1024 / 1024 / 1024 as total_gb
FROM file_uploads
WHERE deleted_at IS NULL
GROUP BY org_id
ORDER BY total_gb DESC;

-- Get recent uploads by user
SELECT
  file_name,
  mime_type,
  file_size,
  entity_type,
  uploaded_at
FROM file_uploads
WHERE uploaded_by = 'user-uuid'
  AND deleted_at IS NULL
ORDER BY uploaded_at DESC
LIMIT 50;
```

## Storage Path Convention

Files are organized in a hierarchical structure:

```
{bucket}/{org_id}/{entity_type}/{year}/{month}/{uuid}.{ext}
```

Example: `resumes/org-123/candidate/2025/12/file-uuid.pdf`
