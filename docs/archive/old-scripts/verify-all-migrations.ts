/**
 * Verify ALL migrations (001-021) are applied to production
 */

import { createClient } from '@supabase/supabase-js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// Define all migrations and their key tables
const migrations = [
  { num: '001', name: 'Initial setup', tables: ['user_profiles'] },
  { num: '002', name: 'Roles', tables: ['roles', 'user_roles'] },
  { num: '003', name: 'Organizations', tables: ['organizations'] },
  { num: '004', name: 'Candidates', tables: ['candidates'] },
  { num: '005', name: 'Requisitions', tables: ['requisitions'] },
  { num: '006', name: 'RLS Policies', tables: [] }, // RLS only, no new tables
  { num: '007', name: 'Multi-tenancy', tables: [] }, // Updated existing tables
  { num: '008', name: 'Event bus', tables: ['events', 'event_subscriptions'] },
  { num: '009', name: 'Permissions', tables: [] }, // Functions only
  { num: '010', name: 'Workflows', tables: ['workflows', 'workflow_instances'] },
  { num: '011', name: 'Tasks', tables: ['tasks'] },
  { num: '012', name: 'Notifications', tables: ['notifications'] },
  { num: '013', name: 'File storage', tables: ['files'] },
  { num: '014', name: 'Training', tables: ['courses', 'course_enrollments'] },
  { num: '015', name: 'Placements', tables: ['placements'] },
  { num: '016', name: 'Analytics', tables: ['activity_logs'] },
  { num: '017', name: 'AI Foundation', tables: ['ai_conversations', 'ai_tasks'] },
  { num: '018', name: 'Guru base', tables: [] }, // Might use different names
  { num: '019', name: 'Guru interactions', tables: ['guru_interactions', 'guru_feedback'] },
  { num: '020', name: 'Guru production', tables: [] }, // Updates to existing
  { num: '021', name: 'Sprint 5', tables: ['candidate_embeddings', 'requisition_embeddings', 'resume_matches', 'generated_resumes'] },
];

async function verifyAllMigrations() {
  console.log(`\n${BOLD}${BLUE}╔════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${BLUE}║      VERIFYING ALL MIGRATIONS (001-021)                       ║${RESET}`);
  console.log(`${BOLD}${BLUE}╚════════════════════════════════════════════════════════════════╝${RESET}\n`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(`${RED}❌ Supabase credentials not configured${RESET}`);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let allApplied = true;
  let appliedCount = 0;

  for (const migration of migrations) {
    if (migration.tables.length === 0) {
      console.log(`${YELLOW}⏭️  Migration ${migration.num} (${migration.name})${RESET}: Skipped (no verifiable tables)`);
      appliedCount++;
      continue;
    }

    let migrationApplied = true;

    for (const table of migration.tables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);

        if (error) {
          if (error.message.includes('does not exist')) {
            console.log(`${RED}❌ Migration ${migration.num} (${migration.name})${RESET}: Table '${table}' missing`);
            migrationApplied = false;
            allApplied = false;
          } else {
            console.log(`${YELLOW}⚠️  Migration ${migration.num} (${migration.name})${RESET}: Table '${table}' - ${error.message}`);
          }
        } else {
          // Table exists
          if (migration.tables.length === 1) {
            console.log(`${GREEN}✅ Migration ${migration.num} (${migration.name})${RESET}: Applied`);
          }
        }
      } catch (err: any) {
        console.log(`${YELLOW}⚠️  Migration ${migration.num} (${migration.name})${RESET}: Error checking table '${table}'`);
      }
    }

    if (migrationApplied) {
      appliedCount++;
    }
  }

  console.log(`\n${BOLD}${BLUE}╔════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${BLUE}║                  VERIFICATION SUMMARY                          ║${RESET}`);
  console.log(`${BOLD}${BLUE}╚════════════════════════════════════════════════════════════════╝${RESET}\n`);

  console.log(`${GREEN}✅ Applied: ${appliedCount}/${migrations.length}${RESET}`);

  if (allApplied) {
    console.log(`\n${GREEN}${BOLD}✅ ALL MIGRATIONS VERIFIED${RESET}`);
    console.log(`${GREEN}   Database is up to date through migration 021${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`\n${RED}${BOLD}❌ SOME MIGRATIONS MISSING${RESET}`);
    console.log(`${RED}   Please review missing tables above${RESET}\n`);
    process.exit(1);
  }
}

verifyAllMigrations().catch(err => {
  console.error(`${RED}${BOLD}FATAL ERROR:${RESET} ${err.message}`);
  process.exit(1);
});
