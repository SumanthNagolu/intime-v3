# PROMPT: DB-BENCH (Window 4)

Copy everything below the line and paste into Claude Code CLI:

---

Use the database skill and bench-sales skill.

Design the complete Bench Sales database schema.

## Read First:
- docs/specs/20-USER-ROLES/02-bench-sales/00-OVERVIEW.md
- docs/specs/20-USER-ROLES/02-bench-sales/01-onboard-consultant.md
- docs/specs/20-USER-ROLES/02-bench-sales/02-build-marketing-profile.md
- docs/specs/20-USER-ROLES/02-bench-sales/03-manage-hotlist.md
- docs/specs/20-USER-ROLES/02-bench-sales/09-manage-vendors.md
- docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md (visa types, immigration)
- docs/specs/10-DATABASE/00-ERD.md (Entity relationships - CRITICAL)
- docs/specs/10-DATABASE/08-job-orders.md (Job orders table spec)
- src/lib/db/schema/bench.ts

## Create/Update src/lib/db/schema/bench.ts:

### BENCH CONSULTANTS
- `bench_consultants` - candidate_id (links to candidates table), status (onboarding/available/marketing/interviewing/placed/inactive), bench_start_date, visa_type, visa_expiry_date, work_auth_status, min_acceptable_rate, target_rate, currency, willing_relocate, preferred_locations (array), marketing_status (draft/active/paused)
- `consultant_visa_details` - consultant_id, visa_type (h1b/opt/cpt/tn/gc/citizen/l1/ead), visa_start_date, visa_expiry_date, lca_status, employer_of_record, grace_period_ends, alert_level (green/yellow/orange/red/black), notes
- `consultant_work_authorization` - consultant_id, auth_type, start_date, end_date, document_url, verified_by, verified_at
- `consultant_availability` - consultant_id, available_from, notice_period_days, blackout_dates (array of date ranges), travel_restrictions, relocation_assistance_needed
- `consultant_rates` - consultant_id, rate_type (hourly/daily), min_rate, target_rate, max_rate, currency, effective_from, notes
- `consultant_skills_matrix` - consultant_id, skill_id, proficiency_level (1-5), years_experience, last_used_date, is_certified, certification_name, certification_expiry

### MARKETING
- `marketing_profiles` - consultant_id, headline (max 100 chars), summary, highlights (array), target_roles (array), target_industries (array), version, status (draft/active/archived), created_by
- `marketing_formats` - profile_id, format_type (standard/detailed/one_pager/client_specific), content (text), file_url, version, is_default
- `marketing_templates` - name, format_type, template_content, placeholders (jsonb), is_active
- `hotlists` - name, description, purpose (general/client_specific/skill_specific), client_id, status (active/archived), created_by
- `hotlist_consultants` - hotlist_id, consultant_id, position_order, added_at, added_by, notes
- `marketing_activities` - consultant_id, activity_type (email_blast/linkedin/call/submission), target_type (vendor/client/job_board), target_id, target_name, sent_at, response_type (no_response/interested/not_interested/interview), response_at, notes, created_by

### VENDORS
- `vendors` - name, type (direct_client/prime_vendor/sub_vendor/msp/vms), status (active/inactive/blacklisted), tier (preferred/standard/new), website, industry_focus (array), geographic_focus (array), notes
- `vendor_contacts` - vendor_id, name, title, email, phone, is_primary, department
- `vendor_terms` - vendor_id, payment_terms_days, markup_min_percent, markup_max_percent, preferred_rate_range_min, preferred_rate_range_max, contract_type, contract_expiry, msa_on_file, notes
- `vendor_relationships` - vendor_id, related_entity_type (account/vendor), related_entity_id, relationship_type (partner/subcontractor/preferred), strength (strong/moderate/weak)
- `vendor_performance` - vendor_id, period (monthly), submissions_count, interviews_count, placements_count, avg_margin_percent, payment_timeliness_score (1-5), responsiveness_score (1-5)
- `vendor_blacklist` - vendor_id, reason, blacklisted_by, blacklisted_at, review_date

### JOB ORDERS
- `job_orders` - vendor_id, client_name, title, description, location, work_mode, rate_type, bill_rate, duration_months, positions, status (new/working/filled/closed/on_hold), priority, received_at, response_due_at, source (email/portal/call), original_source_url
- `job_order_requirements` - order_id, requirement, type (must_have/nice_to_have), priority
- `job_order_skills` - order_id, skill_name, years_required, proficiency_required
- `job_order_submissions` - order_id, consultant_id, status (submitted/shortlisted/rejected/interview/placed), submitted_rate, submitted_at, client_response_at, notes
- `job_order_notes` - order_id, note, created_by, created_at

### IMMIGRATION
- `immigration_cases` - consultant_id, case_type (h1b_transfer/h1b_extension/h1b_amendment/gc_perm/gc_i140/gc_i485/opt_extension/tn_renewal), status (not_started/in_progress/rfe/approved/denied/withdrawn), priority_date, receipt_number, attorney_id, employer_id, start_date, expected_completion, actual_completion, notes
- `immigration_attorneys` - name, firm, email, phone, specialization (array), rating
- `immigration_documents` - case_id, document_type (passport/visa/i94/lca/approval_notice/ead/other), file_url, file_name, issue_date, expiry_date, verified_by, verified_at
- `immigration_timelines` - case_id, milestone (filing/receipt/rfe_response/decision), target_date, actual_date, status (pending/completed/overdue), notes
- `immigration_alerts` - consultant_id, alert_type (visa_expiry/lca_expiry/gc_priority_date/document_expiry), entity_id, alert_date, severity (info/warning/critical), message, acknowledged_by, acknowledged_at

## Requirements:
- Implement visa expiry tracking with alert levels (green > 6mo, yellow 3-6mo, orange 1-3mo, red < 1mo, black expired)
- Rate negotiation history
- Vendor performance scoring
- Marketing activity tracking
- Proper indexes

## After Schema:
Generate migration: npx drizzle-kit generate

Use multi-agents to parallelize table creation. Analyze what we have in codebase, think hard and complete
