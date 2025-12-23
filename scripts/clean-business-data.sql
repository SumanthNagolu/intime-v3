-- =============================================================================
-- CLEAN BUSINESS DATA SQL
-- =============================================================================
-- Run this in Supabase SQL Editor to clean all business data
-- while preserving user accounts and authentication.
--
-- PRESERVED TABLES:
--   - user_profiles (linked to auth.users)
--   - organizations (required for org_id FK constraints)
--   - roles (system role definitions)
--   - user_roles (user-role assignments)
--   - pods, pod_members (organizational structure)
--
-- WARNING: This is DESTRUCTIVE. All business data will be permanently deleted!
-- =============================================================================

-- Disable triggers temporarily for faster truncation
SET session_replication_role = replica;

-- =============================================================================
-- TRUNCATE ALL BUSINESS DATA TABLES
-- Using CASCADE to handle foreign key dependencies
-- =============================================================================

-- Activity/Event System
TRUNCATE TABLE IF EXISTS
  activity_attachments,
  activity_checklist_items,
  activity_comments,
  activity_dependencies,
  activity_field_values,
  activity_history,
  activity_metrics,
  activity_participants,
  activity_reminders,
  activity_stats_daily,
  activity_time_entries,
  activity_log,
  activities
CASCADE;

TRUNCATE TABLE IF EXISTS
  activity_auto_rules,
  activity_pattern_successors,
  activity_patterns
CASCADE;

-- Audit/History (handle partitioned tables carefully)
TRUNCATE TABLE IF EXISTS audit_log CASCADE;
TRUNCATE TABLE IF EXISTS audit_logs CASCADE;
TRUNCATE TABLE IF EXISTS entity_history CASCADE;

-- Recruiting Pipeline
TRUNCATE TABLE IF EXISTS
  placement_timesheets,
  placement_compliance,
  placement_rates,
  placements,
  offer_approvals,
  offers,
  interview_feedback,
  interview_panelists,
  interviews,
  submission_feedback,
  submission_status_history,
  submissions
CASCADE;

-- Jobs
TRUNCATE TABLE IF EXISTS
  job_requirements,
  job_skills,
  job_teams,
  job_status_history,
  jobs
CASCADE;

-- Candidates
TRUNCATE TABLE IF EXISTS
  candidate_availability,
  candidate_background_checks,
  candidate_certifications,
  candidate_compliance_documents,
  candidate_documents,
  candidate_education,
  candidate_embeddings,
  candidate_preferences,
  candidate_prepared_profiles,
  candidate_profiles,
  candidate_references,
  candidate_resumes,
  candidate_screenings,
  candidate_skills,
  candidate_work_authorizations,
  candidate_work_history
CASCADE;

-- CRM - Campaigns
TRUNCATE TABLE IF EXISTS
  campaign_documents,
  campaign_sequence_logs,
  campaign_sequences,
  campaign_enrollments,
  campaigns
CASCADE;

-- CRM - Deals
TRUNCATE TABLE IF EXISTS
  deal_competitors,
  deal_products,
  deal_stakeholders,
  deal_stages_history,
  deals
CASCADE;

-- Contacts
TRUNCATE TABLE IF EXISTS
  contact_agreements,
  contact_bench_data,
  contact_certifications,
  contact_communication_preferences,
  contact_compliance,
  contact_education,
  contact_lead_data,
  contact_merge_history,
  contact_rate_cards,
  contact_relationships,
  contact_roles,
  contact_skills,
  contact_work_history,
  contacts
CASCADE;

-- Companies
TRUNCATE TABLE IF EXISTS
  company_addresses,
  company_client_details,
  company_compliance_requirements,
  company_contacts,
  company_contracts,
  company_health_scores,
  company_metrics,
  company_notes,
  company_partner_details,
  company_preferences,
  company_rate_card_items,
  company_rate_cards,
  company_relationships,
  company_revenue,
  company_tags,
  company_team,
  company_vendor_details,
  companies
CASCADE;

-- Bench Sales
TRUNCATE TABLE IF EXISTS
  bench_consultants,
  consultant_availability,
  consultant_rates,
  consultant_visa_details,
  consultant_work_authorization,
  external_job_order_notes,
  external_job_order_requirements,
  external_job_order_skills,
  external_job_order_submissions,
  external_job_orders
CASCADE;

-- Contracts & Compliance
TRUNCATE TABLE IF EXISTS
  contract_parties,
  contract_clauses,
  contract_versions,
  contracts,
  compliance_items,
  compliance_requirements,
  entity_compliance_requirements
CASCADE;

-- Commissions
TRUNCATE TABLE IF EXISTS
  commission_payments,
  commissions
CASCADE;

-- Communications
TRUNCATE TABLE IF EXISTS
  communication_events,
  communications,
  email_logs,
  email_sends
CASCADE;

-- Documents
TRUNCATE TABLE IF EXISTS
  document_access_log,
  documents
CASCADE;

-- Notes & Comments
TRUNCATE TABLE IF EXISTS comments CASCADE;

-- Entity System
TRUNCATE TABLE IF EXISTS
  entity_rates,
  entity_skills
CASCADE;

-- AI/Learning System
TRUNCATE TABLE IF EXISTS
  ai_agent_interactions,
  ai_conversations,
  ai_cost_tracking,
  ai_embeddings,
  ai_mentor_chats,
  ai_mentor_escalations,
  ai_mentor_rate_limits,
  ai_mentor_sessions,
  ai_patterns,
  ai_prompt_variants,
  ai_prompts,
  ai_question_patterns,
  ai_test
CASCADE;

-- Achievements & Badges
TRUNCATE TABLE IF EXISTS
  badge_progress,
  badge_trigger_events,
  user_badges,
  achievements,
  badges
CASCADE;

-- Training & Courses
TRUNCATE TABLE IF EXISTS
  capstone_submissions,
  certificates,
  course_pricing,
  student_enrollments,
  course_modules,
  courses,
  module_topics
CASCADE;

-- Employees (separate from user_profiles)
TRUNCATE TABLE IF EXISTS
  employee_benefits,
  employee_compliance,
  employee_documents,
  employee_metadata,
  employee_onboarding,
  employee_profiles,
  employee_screenshots,
  employee_time_off,
  employee_twin_interactions,
  employees
CASCADE;

-- Misc Business Data
TRUNCATE TABLE IF EXISTS
  addresses,
  alert_rules,
  api_tokens,
  approval_instances,
  approval_steps,
  approval_workflows,
  archived_records,
  background_jobs,
  break_glass_access,
  bulk_activity_jobs,
  bulk_update_history,
  certificate_templates,
  certifications,
  content_assets,
  contract_templates,
  data_retention_policies,
  discount_code_usage,
  discount_codes,
  document_templates,
  duplicate_records,
  duplicate_rules,
  email_senders,
  email_templates,
  emergency_drills,
  engagement_tracking,
  entity_type_registry,
  escalation_notifications,
  escalation_updates,
  escalations,
  trainer_responses,
  events,
  event_delivery_log,
  event_subscriptions,
  export_jobs
CASCADE;

-- Notes table (polymorphic notes system)
TRUNCATE TABLE IF EXISTS notes CASCADE;

-- =============================================================================
-- Re-enable triggers
-- =============================================================================
SET session_replication_role = DEFAULT;

-- =============================================================================
-- VERIFY: Check what's preserved
-- =============================================================================
SELECT 'PRESERVED DATA SUMMARY' as info;
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'organizations', COUNT(*) FROM organizations
UNION ALL
SELECT 'roles', COUNT(*) FROM roles
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 'pods', COUNT(*) FROM pods;

-- Done!
SELECT '✅ Business data cleaned successfully! User accounts preserved.' as result;
