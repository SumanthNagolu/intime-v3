/**
 * Apply Migration 021 using Supabase Edge Function
 */

import * as fs from 'fs';
import * as path from 'path';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

async function applyMigration() {
  console.log(`\n${BOLD}${BLUE}╔════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${BLUE}║      APPLYING MIGRATION 021 VIA EDGE FUNCTION                 ║${RESET}`);
  console.log(`${BOLD}${BLUE}╚════════════════════════════════════════════════════════════════╝${RESET}\n`);

  // Read migration file
  const migrationPath = path.join(process.cwd(), 'src/lib/db/migrations/021_add_sprint_5_features.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error(`${RED}❌ Migration file not found${RESET}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  console.log(`${GREEN}✅ Migration file loaded (${sql.split('\n').length} lines)${RESET}\n`);

  // Get credentials
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.error(`${RED}❌ SUPABASE_SERVICE_ROLE_KEY not configured${RESET}`);
    process.exit(1);
  }

  console.log(`${YELLOW}Invoking Edge Function: execute-sql${RESET}`);

  try {
    const response = await fetch(
      'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error(`${RED}❌ Edge Function error:${RESET}`);
      console.error(result.error || 'Unknown error');
      process.exit(1);
    }

    console.log(`${GREEN}✅ Migration executed via Edge Function${RESET}\n`);

    // Verify tables
    console.log(`${BOLD}Verifying tables...${RESET}\n`);

    const tables = ['candidate_embeddings', 'requisition_embeddings', 'resume_matches', 'generated_resumes'];

    for (const table of tables) {
      const checkResponse = await fetch(
        'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sql: `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${table}')`,
          }),
        }
      );

      const checkResult = await checkResponse.json();

      if (checkResult.success) {
        console.log(`${GREEN}✅ ${table}${RESET}`);
      } else {
        console.log(`${RED}❌ ${table}${RESET}`);
      }
    }

    console.log(`\n${GREEN}${BOLD}✅ MIGRATION 021 APPLIED SUCCESSFULLY${RESET}\n`);

  } catch (err: any) {
    console.error(`${RED}${BOLD}❌ ERROR:${RESET} ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

applyMigration().catch(err => {
  console.error(`${RED}${BOLD}FATAL ERROR:${RESET} ${err.message}`);
  process.exit(1);
});
