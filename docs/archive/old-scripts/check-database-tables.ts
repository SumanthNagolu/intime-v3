/**
 * Check all tables in database via Supabase client
 */

import { createClient } from '@supabase/supabase-js';

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

async function checkTables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`\n${BOLD}${BLUE}Checking database tables...${RESET}\n`);

  // List of tables we expect from migrations 001-021
  const expectedTables = [
    // Migration 001
    'project_timeline_sessions',
    'project_timeline_events',
    // Migration 002
    'user_profiles',
    // Migration 003
    'roles',
    'user_roles',
    'organizations',
    // Migration 004
    'audit_logs',
    // Migration 005
    'events',
    'event_subscriptions',
    // Migration 008 might update events
    // Migration 010
    'workflows',
    'workflow_instances',
    // Migration 011
    'documents',
    // Migration 012
    'files',
    // Migration 013
    'email_templates',
    'email_queue',
    // Migration 014
    'background_jobs',
    // Migration 016
    'activities',
    'activity_summaries',
    // Migration 017
    'ai_conversations',
    'ai_messages',
    'ai_tasks',
    // Migration 019
    'guru_interactions',
    'guru_feedback',
    // Migration 021
    'candidate_embeddings',
    'requisition_embeddings',
    'resume_matches',
    'generated_resumes',
  ];

  let existingCount = 0;
  let missingCount = 0;

  for (const table of expectedTables) {
    const { error } = await supabase.from(table).select('id').limit(1);

    if (error) {
      if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
        console.log(`${YELLOW}⚠️  ${table}${RESET}`);
        missingCount++;
      } else {
        console.log(`${GREEN}✅ ${table}${RESET}`);
        existingCount++;
      }
    } else {
      console.log(`${GREEN}✅ ${table}${RESET}`);
      existingCount++;
    }
  }

  console.log(`\n${BOLD}Summary:${RESET}`);
  console.log(`${GREEN}Existing: ${existingCount}${RESET}`);
  console.log(`${YELLOW}Missing or inaccessible: ${missingCount}${RESET}`);

  console.log(`\n${BOLD}Sprint 5 Tables (Migration 021):${RESET}`);
  const sprint5Tables = ['candidate_embeddings', 'requisition_embeddings', 'resume_matches', 'generated_resumes'];

  for (const table of sprint5Tables) {
    const { error } = await supabase.from(table).select('id').limit(1);

    if (!error) {
      console.log(`${GREEN}✅ ${table}${RESET}`);
    } else {
      console.log(`${YELLOW}⚠️  ${table}${RESET}: ${error.message}`);
    }
  }
}

checkTables().catch(console.error);
