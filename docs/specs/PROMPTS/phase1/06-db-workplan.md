# PROMPT: DB-WORKPLAN (Window 6)

Copy everything below the line and paste into Claude Code CLI:

---

Use the database skill.

Design the Workplan, Activities, and Events database schema (Guidewire-inspired activity-centric architecture).

## Read First:
- docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
- docs/specs/20-USER-ROLES/02-ACTIVITY-PATTERN-LIBRARY.md
- docs/specs/20-USER-ROLES/03-EVENT-TYPE-CATALOG.md
- docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md
- docs/specs/10-DATABASE/00-ERD.md (Entity relationships)
- docs/specs/10-DATABASE/11-activities.md (CRITICAL: Unified activities table spec with full details)
- docs/specs/10-DATABASE/12-object-owners.md (RCAI ownership pattern)
- src/lib/db/schema/workplan.ts

## Core Principle:
"No work is done unless an activity is created" - Every trackable action creates an activity. System actions create events.

## Create/Update src/lib/db/schema/workplan.ts:

### ACTIVITY PATTERNS
- `activity_patterns` - code (unique), name, description, category (recruiting/bench_sales/crm/hr/academy/client/system), default_priority (critical/high/medium/low), default_due_offset_hours, auto_create_on_event (event type that triggers), requires_completion_note, allowed_outcomes (array), sla_warning_hours, sla_critical_hours, is_system, is_active
- `pattern_fields` - pattern_id, field_name, field_type (text/number/date/select/boolean/entity_ref), is_required, options (jsonb for select), default_value, sequence
- `pattern_checklist_items` - pattern_id, item_text, sequence, is_required

### WORKPLANS
- `workplans` - entity_type (candidate/job/submission/lead/deal/consultant/employee/course), entity_id, status (active/completed/cancelled), started_at, completed_at, completion_reason
- `workplan_phases` - workplan_id, phase_name, sequence, status (pending/in_progress/completed/skipped), started_at, completed_at

### ACTIVITIES
- `activities` - workplan_id, pattern_id, subject, description, priority (critical/high/medium/low), status (pending/in_progress/completed/cancelled/deferred), assigned_to, assigned_by, due_at, started_at, completed_at, completed_by, outcome, completion_notes, parent_activity_id, related_entity_type, related_entity_id, correlation_id, sla_status (ok/warning/critical/breached)
- `activity_participants` - activity_id, user_id, role (owner/participant/observer), added_at
- `activity_field_values` - activity_id, field_name, field_value
- `activity_checklist` - activity_id, item_text, is_completed, completed_at, completed_by, sequence
- `activity_comments` - activity_id, comment, created_by, created_at, is_internal
- `activity_attachments` - activity_id, file_name, file_url, file_type, file_size, uploaded_by, uploaded_at
- `activity_reminders` - activity_id, remind_at, reminder_type (email/push/sms), sent_at
- `activity_time_entries` - activity_id, user_id, started_at, ended_at, duration_minutes, description

### ACTIVITY DEPENDENCIES
- `activity_dependencies` - activity_id, depends_on_activity_id, dependency_type (blocks/requires_completion)
- `activity_auto_rules` - trigger_event_type, pattern_id, conditions (jsonb), field_mappings (jsonb), assign_to_rule (owner/team/specific), priority_override, is_active

### EVENTS
- `events` - event_type, event_category (entity_lifecycle/workflow/user_action/system/integration/communication), severity (info/warning/error/critical), entity_type, entity_id, actor_type (user/system/integration), actor_id, event_data (jsonb), related_entities (jsonb array), correlation_id, parent_event_id, occurred_at
- `event_subscriptions` - user_id, event_pattern (regex or exact), channel (email/push/sms/webhook), filter_conditions (jsonb), is_active
- `event_deliveries` - event_id, subscription_id, channel, status (pending/sent/failed), sent_at, error_message

### SLA CONFIGURATION
- `sla_definitions` - name, entity_type, metric_type (response_time/resolution_time/first_contact), target_value, target_unit (hours/days), warning_threshold_percent, critical_threshold_percent, business_hours_only, applies_to_priorities (array)
- `sla_instances` - sla_definition_id, entity_type, entity_id, started_at, target_at, warning_at, critical_at, completed_at, status (active/met/warning/breached), breach_reason

### QUEUES
- `work_queues` - name, description, queue_type (personal/team/escalation), filter_criteria (jsonb), sort_order (jsonb), owner_type (user/team), owner_id, is_active
- `queue_items` - queue_id, activity_id, priority_score, added_at, claimed_by, claimed_at, removed_at

### TEMPLATES
- `workplan_templates` - name, description, entity_type, phases (jsonb), is_active, created_by
- `template_activities` - template_id, pattern_id, phase_name, sequence, offset_days, assign_to_role, conditions (jsonb)

### BULK OPERATIONS
- `bulk_activity_jobs` - job_type (create/update/reassign), status (pending/processing/completed/failed), total_count, processed_count, failed_count, criteria (jsonb), action_data (jsonb), created_by, started_at, completed_at, error_log (jsonb)

### DASHBOARDS & METRICS
- `activity_metrics` - user_id, period (daily/weekly/monthly), period_start, activities_created, activities_completed, avg_completion_time_hours, sla_met_count, sla_breached_count, overdue_count
- `team_metrics` - team_id, period, period_start, total_activities, completed_activities, avg_response_time_hours, avg_resolution_time_hours

## Key Relationships:
- activities → workplan_id, pattern_id, assigned_to, parent_activity_id
- events → entity_type/entity_id, actor_type/actor_id, correlation_id
- activity_auto_rules → trigger on event_type, create from pattern_id

## Requirements:
- Support for activity hierarchies (parent/child)
- Activity dependencies (blocking)
- Auto-activity creation from events
- SLA tracking with warning/critical thresholds
- Work queue management
- Time tracking on activities
- Bulk operations support
- Proper indexes for queue queries, due dates, assignments

## After Schema:
Generate migration: npx drizzle-kit generate

Use multi-agents to parallelize table creation. Analyze what we have, think hard and complete

/Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/specs/10-DATABASE -> For additional reference


