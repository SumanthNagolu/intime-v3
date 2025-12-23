#!/usr/bin/env tsx
/**
 * Clean Business Data Script
 *
 * Truncates all business data tables while PRESERVING:
 * - auth.users (Supabase Auth - managed separately)
 * - user_profiles (linked to auth.users)
 * - organizations (required for org_id FK constraints)
 * - roles (system role definitions)
 * - user_roles (user-role assignments)
 * - pods (organizational structure)
 *
 * Usage: pnpm tsx scripts/clean-business-data.ts
 *
 * WARNING: This is destructive! All business data will be permanently deleted.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Tables to PRESERVE (will NOT be truncated)
const PRESERVED_TABLES = [
  'user_profiles',
  'organizations',
  'roles',
  'user_roles',
  'pods',
  'pod_members',
  // Migration and system tables
  '_migration_candidate_mapping',
  '_migration_lead_mapping',
  // Drizzle migrations
  '__drizzle_migrations',
];

// Tables to truncate in order (dependencies matter!)
// Order: most dependent tables first, then base tables
const TABLES_TO_TRUNCATE = [
  // Activity/Event system (truncate first as they reference many entities)
  'activity_attachments',
  'activity_checklist_items',
  'activity_comments',
  'activity_dependencies',
  'activity_field_values',
  'activity_history',
  'activity_metrics',
  'activity_participants',
  'activity_reminders',
  'activity_stats_daily',
  'activity_time_entries',
  'activity_log',
  'activities',
  'activity_auto_rules',
  'activity_pattern_successors',
  'activity_patterns',

  // Audit/History (partitioned tables)
  'audit_log_2025_12',
  'audit_log_2026_01',
  'audit_log_2026_02',
  'audit_log_2026_03',
  'audit_log',
  'audit_logs_2025_11',
  'audit_logs_2025_12',
  'audit_logs_2026_01',
  'audit_logs_2026_02',
  'audit_logs',
  'entity_history_2025_12',
  'entity_history_2026_01',
  'entity_history_2026_02',
  'entity_history_2026_03',
  'entity_history',

  // Recruiting Pipeline (most dependent)
  'placement_timesheets',
  'placement_compliance',
  'placement_rates',
  'placements',
  'offer_approvals',
  'offers',
  'interview_feedback',
  'interview_panelists',
  'interviews',
  'submission_feedback',
  'submission_status_history',
  'submissions',

  // Jobs
  'job_requirements',
  'job_skills',
  'job_teams',
  'job_status_history',
  'jobs',

  // Candidates
  'candidate_availability',
  'candidate_background_checks',
  'candidate_certifications',
  'candidate_compliance_documents',
  'candidate_documents',
  'candidate_education',
  'candidate_embeddings',
  'candidate_preferences',
  'candidate_prepared_profiles',
  'candidate_profiles',
  'candidate_references',
  'candidate_resumes',
  'candidate_screenings',
  'candidate_skills',
  'candidate_work_authorizations',
  'candidate_work_history',

  // CRM - Campaigns
  'campaign_documents',
  'campaign_sequence_logs',
  'campaign_sequences',
  'campaign_enrollments',
  'campaigns',

  // CRM - Deals
  'deal_competitors',
  'deal_products',
  'deal_stakeholders',
  'deal_stages_history',
  'deals',

  // Contacts & Companies
  'contact_agreements',
  'contact_bench_data',
  'contact_certifications',
  'contact_communication_preferences',
  'contact_compliance',
  'contact_education',
  'contact_lead_data',
  'contact_merge_history',
  'contact_rate_cards',
  'contact_relationships',
  'contact_roles',
  'contact_skills',
  'contact_work_history',
  'contacts',

  'company_addresses',
  'company_client_details',
  'company_compliance_requirements',
  'company_contacts',
  'company_contracts',
  'company_health_scores',
  'company_metrics',
  'company_notes',
  'company_partner_details',
  'company_preferences',
  'company_rate_card_items',
  'company_rate_cards',
  'company_relationships',
  'company_revenue',
  'company_tags',
  'company_team',
  'company_vendor_details',
  'companies',

  // Bench Sales
  'bench_consultants',
  'consultant_availability',
  'consultant_rates',
  'consultant_visa_details',
  'consultant_work_authorization',
  'external_job_order_notes',
  'external_job_order_requirements',
  'external_job_order_skills',
  'external_job_order_submissions',
  'external_job_orders',

  // Contracts & Compliance
  'contract_parties',
  'contract_clauses',
  'contract_versions',
  'contracts',
  'compliance_items',
  'compliance_requirements',
  'entity_compliance_requirements',

  // Commissions
  'commission_payments',
  'commissions',

  // Communications
  'communication_events',
  'communications',
  'email_logs',
  'email_sends',

  // Documents
  'document_access_log',
  'documents',

  // Notes & Comments
  'comments',

  // Entity rates & skills
  'entity_rates',
  'entity_skills',

  // AI/Learning system
  'ai_agent_interactions',
  'ai_conversations',
  'ai_cost_tracking',
  'ai_embeddings',
  'ai_mentor_chats',
  'ai_mentor_escalations',
  'ai_mentor_rate_limits',
  'ai_mentor_sessions',
  'ai_patterns',
  'ai_prompt_variants',
  'ai_prompts',
  'ai_question_patterns',
  'ai_test',

  // Achievements & Badges
  'badge_progress',
  'badge_trigger_events',
  'user_badges',
  'achievements',
  'badges',

  // Training & Courses
  'capstone_submissions',
  'certificates',
  'course_pricing',
  'student_enrollments',
  'course_modules',
  'courses',
  'module_topics',

  // Employees (separate from user_profiles)
  'employee_benefits',
  'employee_compliance',
  'employee_documents',
  'employee_metadata',
  'employee_onboarding',
  'employee_profiles',
  'employee_screenshots',
  'employee_time_off',
  'employee_twin_interactions',
  'employees',

  // Misc business data
  'addresses',
  'alert_rules',
  'api_tokens',
  'approval_instances',
  'approval_steps',
  'approval_workflows',
  'archived_records',
  'background_jobs',
  'break_glass_access',
  'bulk_activity_jobs',
  'bulk_update_history',
  'certificate_templates',
  'certifications',
  'content_assets',
  'contract_templates',
  'data_retention_policies',
  'discount_code_usage',
  'discount_codes',
  'document_templates',
  'duplicate_records',
  'duplicate_rules',
  'email_senders',
  'email_templates',
  'emergency_drills',
  'engagement_tracking',
  'entity_type_registry',
  'escalation_notifications',
  'escalation_updates',
  'escalations',
  'trainer_responses',
  'events',
  'event_delivery_log',
  'event_subscriptions',
  'export_jobs',

  // Feature flags (may want to preserve - add to PRESERVED if needed)
  'feature_flag_categories',
  'feature_flag_feedback',
  'feature_flag_roles',
  'feature_flag_usage',
];

async function confirmAction(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  WARNING: This will DELETE ALL BUSINESS DATA!\n' +
        '   User accounts and login info will be preserved.\n\n' +
        '   Type "DELETE" to confirm: ',
      (answer) => {
        rl.close();
        resolve(answer === 'DELETE');
      }
    );
  });
}

async function cleanBusinessData() {
  console.log('🧹 Database Cleanup Script\n');
  console.log('━'.repeat(60));
  console.log('📋 Tables to PRESERVE:');
  PRESERVED_TABLES.forEach((t) => console.log(`   ✓ ${t}`));
  console.log('━'.repeat(60));

  // Ask for confirmation
  const confirmed = await confirmAction();

  if (!confirmed) {
    console.log('\n❌ Operation cancelled.');
    process.exit(0);
  }

  console.log('\n🚀 Starting cleanup...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const table of TABLES_TO_TRUNCATE) {
    try {
      // Use raw SQL via RPC or direct query
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `TRUNCATE TABLE public."${table}" CASCADE`,
      });

      if (error) {
        // Table might not exist or other error
        if (error.message.includes('does not exist')) {
          console.log(`⏭️  Skipped: ${table} (table not found)`);
          skipCount++;
        } else if (error.message.includes('exec_sql')) {
          // RPC doesn't exist, try alternative approach
          const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

          if (deleteError) {
            console.log(`⚠️  Warning: ${table} - ${deleteError.message}`);
            skipCount++;
          } else {
            console.log(`✅ Cleared: ${table}`);
            successCount++;
          }
        } else {
          console.log(`⚠️  Warning: ${table} - ${error.message}`);
          skipCount++;
        }
      } else {
        console.log(`✅ Truncated: ${table}`);
        successCount++;
      }
    } catch (err) {
      console.log(`❌ Error: ${table} - ${err}`);
      errorCount++;
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Successfully cleaned: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log('━'.repeat(60));

  if (successCount > 0) {
    console.log('\n🎉 Business data cleaned successfully!');
    console.log('   Your user accounts and login info are preserved.');
    console.log('\n💡 Next steps:');
    console.log('   - Run seed scripts to add test data:');
    console.log('     pnpm tsx scripts/seed-workspace-data.ts');
    console.log('   - Or start fresh with manual data entry');
  }
}

// Run
cleanBusinessData()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
  });
