# candidate_compliance_documents Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `candidate_compliance_documents` |
| Schema | `public` |
| Purpose | Tracks compliance-related documents (I-9, work authorization, etc.) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| placement_id | uuid | YES | - | Foreign key to placement |
| submission_id | uuid | YES | - | Foreign key to submission |
| document_type | text | NO | - | Document type |
| document_name | text | NO | - | Document name |
| document_description | text | YES | - | Document description |
| document_category | text | YES | - | Document category |
| status | text | NO | 'required'::text | Status |
| required_by | date | YES | - | Required by |
| requested_at | timestamp with time zone | YES | - | Requested at |
| submitted_at | timestamp with time zone | YES | - | Submitted at |
| reviewed_at | timestamp with time zone | YES | - | Reviewed at |
| reviewed_by | uuid | YES | - | Reviewed by |
| approved_at | timestamp with time zone | YES | - | Approved at |
| approved_by | uuid | YES | - | Approved by |
| rejected_at | timestamp with time zone | YES | - | Rejected at |
| rejected_by | uuid | YES | - | Rejected by |
| rejection_reason | text | YES | - | Rejection reason |
| effective_date | date | YES | - | Effective date |
| expires_at | date | YES | - | Expires at |
| file_id | uuid | YES | - | Foreign key to file |
| file_url | text | YES | - | File url |
| file_name | text | YES | - | File name |
| file_size | integer | YES | - | File size |
| file_mime_type | text | YES | - | File mime type |
| requires_signature | boolean | YES | true | Requires signature |
| is_signed | boolean | YES | false | Is signed |
| signed_at | timestamp with time zone | YES | - | Signed at |
| signer_name | text | YES | - | Signer name |
| signer_email | text | YES | - | Signer email |
| signature_ip | text | YES | - | Signature ip |
| signature_user_agent | text | YES | - | Signature user agent |
| signature_method | text | YES | - | Signature method |
| signature_envelope_id | text | YES | - | Foreign key to signature_envelope |
| version | integer | YES | 1 | Version |
| previous_version_id | uuid | YES | - | Foreign key to previous_version |
| is_current_version | boolean | YES | true | Is current version |
| client_id | uuid | YES | - | Foreign key to client |
| client_name | text | YES | - | Client name |
| notes | text | YES | - | Notes |
| internal_notes | text | YES | - | Internal notes |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |
| created_by | uuid | YES | - | User who created the record |
| updated_by | uuid | YES | - | Updated by |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| candidate_id | user_profiles.id | User profiles |
| org_id | organizations.id | Organizations |
| placement_id | placements.id | Placements |
| submission_id | submissions.id | Submissions |

## Indexes

| Index Name | Definition |
|------------|------------|
| candidate_compliance_documents_pkey | CREATE UNIQUE INDEX candidate_compliance_documents_pkey ON public.candidate_compliance_documents USING btree (id) |
| idx_compliance_docs_candidate | CREATE INDEX idx_compliance_docs_candidate ON public.candidate_compliance_documents USING btree (candidate_id) |
| idx_compliance_docs_org | CREATE INDEX idx_compliance_docs_org ON public.candidate_compliance_documents USING btree (org_id) |
