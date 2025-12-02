# certificates Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `certificates` |
| Schema | `public` |
| Purpose | Issued certificates for course/path completion |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| enrollment_id | uuid | NO | - | Foreign key reference to enrollment |
| template_id | uuid | YES | - | Foreign key reference to template |
| certificate_number | text | NO | - | Certificate Number |
| issued_at | timestamp with time zone | NO | now() | Timestamp for issued |
| expiry_date | timestamp with time zone | YES | - | Expiry Date |
| pdf_url | text | YES | - | URL for pdf |
| verification_code | text | NO | - | Verification Code |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| enrollment_id | student_enrollments.id | certificates_enrollment_id_fkey |
| template_id | certificate_templates.id | certificates_template_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| certificates_pkey | `CREATE UNIQUE INDEX certificates_pkey ON public.certificates USING btree (id)` |
| certificates_certificate_number_key | `CREATE UNIQUE INDEX certificates_certificate_number_key ON public.certificates USING btree (certificate_number)` |
| certificates_verification_code_key | `CREATE UNIQUE INDEX certificates_verification_code_key ON public.certificates USING btree (verification_code)` |
| idx_certificates_enrollment_id | `CREATE INDEX idx_certificates_enrollment_id ON public.certificates USING btree (enrollment_id)` |
| idx_certificates_verification_code | `CREATE INDEX idx_certificates_verification_code ON public.certificates USING btree (verification_code)` |
| idx_certificates_certificate_number | `CREATE INDEX idx_certificates_certificate_number ON public.certificates USING btree (certificate_number)` |
