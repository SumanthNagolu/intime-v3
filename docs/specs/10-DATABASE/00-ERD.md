# InTime v3 Database Schema - Complete Reference

## Overview

This document provides a comprehensive overview of the InTime v3 database schema. The database contains **290+ tables** and **27 views** organized into 10 functional domains.

**Last Updated:** 2025-12-01

---

## Database Statistics

| Metric | Count |
|--------|-------|
| Total Tables | 290+ |
| Total Views | 27 |
| Domains | 10 |
| Foreign Key Relationships | 500+ |
| Indexes | 800+ |

---

## Domain Structure

The documentation is organized into the following domain folders:

| Domain | Folder | Tables | Description |
|--------|--------|--------|-------------|
| **Core** | `01-CORE/` | 11 | Organizations, users, roles, permissions, addresses |
| **CRM** | `02-CRM/` | 25 | Accounts, contacts, leads, deals, campaigns |
| **Recruiting** | `03-RECRUITING/` | 44 | Jobs, candidates, submissions, interviews, offers, placements |
| **Bench Sales** | `04-BENCH-SALES/` | 23 | Consultants, hotlists, vendors, external jobs |
| **Academy** | `05-ACADEMY/` | 60 | Courses, modules, quizzes, achievements, badges |
| **Activities** | `06-ACTIVITIES/` | 35 | Activities, patterns, workplans, workflows, approvals |
| **HR** | `07-HR/` | 32 | Employees, payroll, benefits, performance, pods |
| **Immigration** | `08-IMMIGRATION/` | 6 | Cases, documents, timelines, I-9 records |
| **AI** | `09-AI/` | 34 | Embeddings, conversations, prompts, twins, mentors |
| **System** | `10-SYSTEM/` | 20 | Audit logs, notifications, events, background jobs |
| **Views** | `99-VIEWS/` | 27 | Pre-computed views for dashboards and reports |

---

## Core Entity Relationships

```
                                    ┌─────────────────┐
                                    │  organizations  │
                                    │   (Tenant Root) │
                                    └────────┬────────┘
                                             │ 1
            ┌────────────────────────────────┼────────────────────────────────┐
            │                                │                                │
            ▼ *                              ▼ *                              ▼ *
   ┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
   │  user_profiles  │◄─────────────│      pods       │              │    accounts     │
   │   (All Users)   │    *     1   │    (Teams)      │              │   (Clients)     │
   └────────┬────────┘              └─────────────────┘              └────────┬────────┘
            │                                                                  │
   ┌────────┴────────────────────────────────────────────────┐                │
   │                    │                │                   │                │
   ▼ *                  ▼ *              ▼ *                 ▼ *              ▼ *
┌─────────┐    ┌──────────────┐   ┌────────────┐   ┌─────────────┐   ┌─────────────┐
│employees│    │bench_consult.│   │  candidate │   │  contacts   │   │    jobs     │
│         │    │              │   │  _profiles │   │             │   │             │
└─────────┘    └──────────────┘   └─────┬──────┘   └─────────────┘   └──────┬──────┘
                                        │                                    │
                                        │                                    │
                                        └────────────────┬───────────────────┘
                                                         │
                                                         ▼ *
                                                ┌─────────────────┐
                                                │   submissions   │
                                                │                 │
                                                └────────┬────────┘
                                                         │
                                    ┌────────────────────┼────────────────────┐
                                    │                    │                    │
                                    ▼ *                  ▼ *                  ▼ *
                           ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
                           │ interviews  │      │   offers    │      │ placements  │
                           └─────────────┘      └─────────────┘      └─────────────┘
```

---

## Domain Details

### 01-CORE (11 tables)

Foundation tables for multi-tenancy, authentication, and authorization.

| Table | Purpose |
|-------|---------|
| `organizations` | Multi-tenant root entity |
| `user_profiles` | Universal user profile (112 columns) |
| `roles` | Custom organization roles |
| `permissions` | Granular RBAC permissions |
| `role_permissions` | Role-permission mappings |
| `user_roles` | User-role assignments |
| `system_roles` | Predefined role templates |
| `addresses` | Polymorphic address storage |
| `regions` | Geographic territories |
| `skills` | Global skill taxonomy |
| `skill_aliases` | Organization-specific skill synonyms |

---

### 02-CRM (25 tables)

Customer relationship management and sales pipeline.

| Category | Tables |
|----------|--------|
| Accounts | `accounts`, `account_addresses`, `account_contracts`, `account_metrics`, `account_preferences`, `account_team` |
| Contacts | `contacts` |
| Leads | `leads`, `lead_qualification`, `lead_scores`, `lead_strategies`, `lead_tasks`, `lead_touchpoints` |
| Deals | `deals`, `deal_competitors`, `deal_products`, `deal_stages_history`, `deal_stakeholders` |
| Campaigns | `crm_campaigns`, `crm_campaign_content`, `crm_campaign_metrics`, `crm_campaign_targets`, `campaigns`, `campaign_contacts` |
| Activities | `crm_activities` |

---

### 03-RECRUITING (44 tables)

Complete ATS (Applicant Tracking System) workflow.

| Category | Tables |
|----------|--------|
| Jobs | `jobs`, `job_assignments`, `job_rates`, `job_requirements`, `job_screening_questions`, `job_skills` |
| Candidates | `candidate_profiles`, `candidate_availability`, `candidate_background_checks`, `candidate_certifications`, `candidate_compliance_documents`, `candidate_documents`, `candidate_education`, `candidate_embeddings`, `candidate_preferences`, `candidate_references`, `candidate_resumes`, `candidate_skills`, `candidate_work_authorizations`, `candidate_work_history` |
| Submissions | `submissions`, `submission_notes`, `submission_rates`, `submission_screening_answers`, `submission_status_history` |
| Interviews | `interviews`, `interview_feedback`, `interview_participants`, `interview_reminders`, `interview_sessions` |
| Offers | `offers`, `offer_approvals`, `offer_negotiations`, `offer_terms` |
| Placements | `placements`, `placement_credits`, `placement_extensions`, `placement_milestones`, `placement_rates`, `placement_timesheets` |
| AI/Matching | `graduate_candidates`, `resume_matches`, `resume_versions`, `requisition_embeddings` |

---

### 04-BENCH-SALES (23 tables)

Consultant marketing and vendor management.

| Category | Tables |
|----------|--------|
| Consultants | `bench_consultants`, `consultant_availability`, `consultant_rates`, `consultant_visa_details`, `consultant_work_authorization` |
| Marketing | `marketing_profiles`, `marketing_formats`, `marketing_templates`, `marketing_activities`, `hotlists`, `hotlist_consultants` |
| Vendors | `vendors`, `vendor_contacts`, `vendor_terms`, `vendor_performance`, `vendor_relationships`, `vendor_blacklist` |
| External Jobs | `external_job_orders`, `external_job_order_notes`, `external_job_order_requirements`, `external_job_order_skills`, `external_job_order_submissions` |

---

### 05-ACADEMY (60 tables)

Gamified learning management system.

| Category | Tables |
|----------|--------|
| Courses | `courses`, `course_modules`, `course_pricing`, `module_topics`, `topic_lessons`, `topic_completions`, `topic_difficulty_stats`, `topic_unlock_requirements` |
| Learning Paths | `learning_paths`, `learning_path_courses`, `path_enrollments`, `learning_streaks` |
| Students | `student_enrollments`, `student_progress`, `student_interventions` |
| Quizzes | `quiz_settings`, `quiz_questions`, `quiz_attempts`, `quiz_analytics`, `question_bank_stats` |
| Labs | `lab_templates`, `lab_instances`, `lab_submissions`, `lab_statistics` |
| Capstones | `capstone_submissions`, `capstone_grading_queue`, `capstone_statistics` |
| Gamification | `achievements`, `user_achievements`, `rare_achievements`, `badges`, `user_badges`, `badge_progress`, `user_badge_progress`, `badge_completion_stats`, `badge_trigger_events`, `badge_leaderboard`, `xp_transactions`, `level_definitions`, `user_levels` |
| Leaderboards | `leaderboards`, `leaderboard_entries`, `leaderboard_all_time`, `leaderboard_weekly`, `leaderboard_by_course`, `leaderboard_by_cohort`, `leaderboard_global` |
| Content | `reading_progress`, `reading_stats`, `video_progress`, `video_watch_stats`, `content_assets` |
| Certificates | `certificates`, `certificate_templates` |
| Pricing | `pricing_plans`, `discount_codes`, `discount_code_usage` |
| Peer Review | `peer_reviews`, `peer_review_leaderboard`, `grading_queue` |

---

### 06-ACTIVITIES (35 tables)

Activity management, workflows, and automation.

| Category | Tables |
|----------|--------|
| Core Activities | `activities`, `activity_attachments`, `activity_checklist_items`, `activity_comments`, `activity_dependencies`, `activity_field_values`, `activity_history`, `activity_log`, `activity_metrics`, `activity_participants`, `activity_reminders`, `activity_time_entries` |
| Patterns | `activity_patterns`, `activity_pattern_successors`, `activity_auto_rules`, `pattern_checklist_items`, `pattern_fields` |
| Workplans | `workplan_templates`, `workplan_template_activities`, `workplan_instances`, `workplan_phases` |
| Workflows | `workflows`, `workflow_states`, `workflow_transitions`, `workflow_instances`, `workflow_history` |
| Approvals | `approval_workflows`, `approval_steps`, `approval_instances` |
| SLAs | `sla_definitions`, `sla_instances` |
| Queues | `work_queues`, `queue_items`, `tasks`, `bulk_activity_jobs` |

---

### 07-HR (32 tables)

Human resources and employee management.

| Category | Tables |
|----------|--------|
| Employees | `employees`, `employee_profiles`, `employee_metadata`, `employee_documents`, `employee_screenshots`, `employee_twin_interactions` |
| Benefits | `benefit_plans`, `benefit_plan_options`, `employee_benefits`, `benefit_dependents` |
| Time Off | `employee_time_off`, `pto_balances`, `time_attendance` |
| Payroll | `payroll_runs`, `payroll_items` |
| Performance | `performance_reviews`, `performance_goals`, `performance_feedback` |
| Onboarding | `employee_onboarding`, `onboarding_checklist`, `onboarding_tasks` |
| Teams | `pods`, `pod_members`, `pod_sprint_metrics`, `team_metrics`, `productivity_reports`, `org_standups` |
| Compliance | `employee_compliance`, `compliance_requirements` |
| Shared | `object_owners`, `comments`, `talking_point_templates` |

---

### 08-IMMIGRATION (6 tables)

Immigration case management and compliance.

| Table | Purpose |
|-------|---------|
| `immigration_cases` | H1B, Green Card, OPT, TN, L1 case tracking |
| `immigration_alerts` | Deadline and compliance alerts |
| `immigration_attorneys` | Attorney directory with specializations |
| `immigration_documents` | Document storage and verification |
| `immigration_timelines` | Case milestones and deadlines |
| `i9_records` | I-9 employment eligibility verification |

---

### 09-AI (34 tables)

AI infrastructure, mentors, twins, and document generation.

| Category | Tables |
|----------|--------|
| Core AI | `ai_agent_interactions`, `ai_conversations`, `ai_cost_tracking`, `ai_embeddings`, `ai_foundation_validation`, `ai_patterns` |
| AI Mentor | `ai_mentor_chats`, `ai_mentor_sessions`, `ai_mentor_rate_limits`, `ai_mentor_escalations` + 8 analytics views |
| Escalations | `escalation_queue`, `escalation_notifications`, `trainer_responses`, `trainer_escalation_stats`, `escalation_daily_stats` |
| Prompts | `ai_prompts`, `ai_prompt_variants`, `ai_prompt_variant_performance`, `ai_question_patterns`, `ai_test` |
| Twins | `twin_conversations`, `twin_events`, `twin_preferences` |
| Generation | `document_templates`, `generated_documents`, `generated_resumes` |
| Specialized | `guru_interactions` |

---

### 10-SYSTEM (20 tables)

Infrastructure, audit, and system services.

| Category | Tables |
|----------|--------|
| Audit | `audit_logs`, `audit_log_retention_policy`, `audit_logs_2025_11`, `audit_logs_2025_12`, `audit_logs_2026_01`, `audit_logs_2026_02` |
| Notifications | `notifications`, `email_logs`, `email_templates` |
| Events | `events`, `event_subscriptions`, `event_delivery_log` |
| Jobs | `background_jobs` |
| Files | `file_uploads` |
| Analytics | `engagement_tracking`, `project_timeline` |
| Sessions | `session_metadata`, `user_session_context` |
| Cache | `org_context_cache` |
| Payments | `payment_transactions` |

---

### 99-VIEWS (27 views)

Pre-computed views for dashboards and reporting.

| Category | Views |
|----------|-------|
| Users | `v_active_users`, `v_user_activity_summary`, `v_user_roles_detailed`, `v_session_summary` |
| Business | `v_bench_candidates`, `v_clients`, `v_employees`, `v_students` |
| Audit | `v_audit_logs_critical`, `v_audit_logs_recent`, `v_events_failed`, `v_events_recent`, `v_event_stats_by_type` |
| Security | `v_rls_policies`, `v_rls_status`, `v_auth_rls_status`, `v_role_permissions_audit`, `v_roles_with_permissions` |
| Workflows | `v_workflow_instances_with_state`, `v_workflow_metrics` |
| Timeline | `v_timeline_recent`, `v_timeline_stats_by_tag` |
| System | `v_agent_framework_status`, `v_multi_tenancy_status`, `v_organization_stats`, `v_sprint_5_status`, `v_subscriber_performance` |

---

## Design Patterns

### Multi-Tenancy

All tenant-scoped tables include `org_id`:

```sql
org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
```

With RLS policy:

```sql
CREATE POLICY "org_isolation" ON [table_name]
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
```

### Soft Delete

Most entities support soft deletion:

```sql
deleted_at TIMESTAMPTZ DEFAULT NULL
```

### Audit Trail

Standard audit columns:

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
created_by UUID REFERENCES user_profiles(id)
updated_by UUID REFERENCES user_profiles(id)
```

### Polymorphic References

Used by `activities`, `object_owners`, `addresses`:

```sql
entity_type TEXT NOT NULL  -- 'job', 'candidate', 'account', etc.
entity_id UUID NOT NULL
```

### Full-Text Search

Searchable entities include:

```sql
search_vector TSVECTOR
-- With GIN index for fast searching
CREATE INDEX idx_[table]_search ON [table] USING GIN(search_vector)
```

---

## Cardinality Legend

| Symbol | Meaning |
|--------|---------|
| 1 | Exactly one |
| * | Zero or more |
| 1:1 | One-to-one |
| 1:* | One-to-many |
| *:1 | Many-to-one |
| *:* | Many-to-many |

---

## Navigation

Each domain folder contains:
- **README.md** - Domain overview and relationships
- **[table_name].md** - Detailed table specification including:
  - Overview (purpose, schema)
  - Complete column definitions
  - Foreign key relationships
  - All indexes

---

*Generated from live database schema on 2025-12-01*
