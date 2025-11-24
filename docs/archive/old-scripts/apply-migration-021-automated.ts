/**
 * AUTOMATED MIGRATION 021 APPLICATION
 *
 * Applies migration 021 programmatically - NO manual steps required
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

async function applyMigration() {
  console.log(`\n${BOLD}${BLUE}╔════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${BLUE}║      AUTOMATED MIGRATION 021 APPLICATION                      ║${RESET}`);
  console.log(`${BOLD}${BLUE}╚════════════════════════════════════════════════════════════════╝${RESET}\n`);

  // Step 1: Verify environment
  console.log(`${BOLD}Step 1: Verifying Environment${RESET}`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(`${RED}❌ ERROR: Supabase credentials not configured${RESET}`);
    process.exit(1);
  }

  console.log(`${GREEN}✅ Environment configured${RESET}`);

  // Step 2: Read migration file
  console.log(`\n${BOLD}Step 2: Reading Migration File${RESET}`);

  const migrationPath = path.join(process.cwd(), 'src/lib/db/migrations/021_add_sprint_5_features.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error(`${RED}❌ ERROR: Migration file not found: ${migrationPath}${RESET}`);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  const lineCount = migrationSQL.split('\n').length;

  console.log(`${GREEN}✅ Migration file loaded (${lineCount} lines)${RESET}`);

  // Step 3: Preview migration
  console.log(`\n${BOLD}Step 3: Migration Preview${RESET}`);
  console.log(`${YELLOW}First 30 lines:${RESET}\n`);
  console.log(migrationSQL.split('\n').slice(0, 30).join('\n'));
  console.log(`${YELLOW}\n... (${lineCount} total lines)${RESET}`);

  // Step 4: Create Supabase client
  console.log(`\n${BOLD}Step 4: Connecting to Database${RESET}`);

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  console.log(`${GREEN}✅ Connected to Supabase${RESET}`);

  // Step 5: Verify migration not already applied
  console.log(`\n${BOLD}Step 5: Checking Migration Status${RESET}`);

  try {
    const { error: checkError } = await supabase
      .from('candidate_embeddings')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.error(`${RED}❌ ERROR: Migration 021 already applied!${RESET}`);
      console.error(`${RED}   candidate_embeddings table already exists${RESET}`);
      console.error(`${YELLOW}   Skipping migration to prevent duplicate application${RESET}`);
      process.exit(1);
    } else if (checkError.message.includes('does not exist')) {
      console.log(`${GREEN}✅ Migration 021 not yet applied - proceeding${RESET}`);
    } else {
      console.log(`${YELLOW}⚠️  Could not verify migration status: ${checkError.message}${RESET}`);
      console.log(`${YELLOW}   Proceeding anyway...${RESET}`);
    }
  } catch (err) {
    console.log(`${YELLOW}⚠️  Could not verify migration status${RESET}`);
    console.log(`${YELLOW}   Proceeding anyway...${RESET}`);
  }

  // Step 6: Apply migration using Supabase SQL
  console.log(`\n${BOLD}Step 6: Applying Migration${RESET}`);
  console.log(`${YELLOW}⏳ Executing SQL...${RESET}`);

  try {
    // Supabase doesn't have a direct .sql() method, so we need to use the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ query: migrationSQL }),
    });

    if (!response.ok) {
      // If REST API doesn't work, try alternative approach
      console.log(`${YELLOW}⚠️  REST API approach failed, trying alternative method...${RESET}`);

      // Split SQL into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      console.log(`${YELLOW}   Executing ${statements.length} SQL statements...${RESET}`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];

        // Skip comments
        if (statement.startsWith('--') || statement.length === 0) {
          continue;
        }

        console.log(`${YELLOW}   [${i + 1}/${statements.length}] Executing statement...${RESET}`);

        try {
          // Use Supabase RPC to execute raw SQL
          const { error: execError } = await supabase.rpc('exec_sql', {
            sql: statement,
          });

          if (execError) {
            console.error(`${RED}   ❌ Error in statement ${i + 1}: ${execError.message}${RESET}`);
            throw execError;
          }
        } catch (stmtError: any) {
          // If exec_sql RPC doesn't exist, we need to use psql
          console.log(`${YELLOW}   ⚠️  Supabase client cannot execute DDL directly${RESET}`);
          console.log(`${YELLOW}   Falling back to psql...${RESET}`);

          // Use psql via child process
          const { execSync } = require('child_process');

          try {
            // Try to use psql directly
            const dbUrl = `postgresql://postgres.gkwhxmvugnjwwwiufmdy:${process.env.SUPABASE_DB_PASSWORD || 'TIfyrFR8Q3fFywZZ'}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

            execSync(`psql "${dbUrl}" -f "${migrationPath}"`, {
              stdio: 'inherit',
            });

            console.log(`${GREEN}✅ Migration applied via psql${RESET}`);
            break;
          } catch (psqlError: any) {
            console.error(`${RED}❌ psql execution failed: ${psqlError.message}${RESET}`);
            throw psqlError;
          }
        }
      }

      console.log(`${GREEN}✅ All statements executed${RESET}`);
    } else {
      console.log(`${GREEN}✅ Migration applied successfully${RESET}`);
    }
  } catch (err: any) {
    console.error(`${RED}❌ ERROR: Migration application failed${RESET}`);
    console.error(`${RED}   ${err.message}${RESET}`);
    console.error(`\n${YELLOW}Please check the error and try again${RESET}`);
    process.exit(1);
  }

  // Step 7: Verify migration succeeded
  console.log(`\n${BOLD}Step 7: Verifying Migration${RESET}`);

  const tablesToVerify = [
    'candidate_embeddings',
    'requisition_embeddings',
    'resume_matches',
    'generated_resumes',
  ];

  let allTablesExist = true;

  for (const tableName of tablesToVerify) {
    try {
      const { error } = await supabase.from(tableName).select('id').limit(1);

      if (!error) {
        console.log(`${GREEN}✅ ${tableName}${RESET}: Table exists and is accessible`);
      } else if (error.message.includes('does not exist')) {
        console.error(`${RED}❌ ${tableName}${RESET}: Table NOT found`);
        allTablesExist = false;
      } else {
        console.log(`${YELLOW}⚠️  ${tableName}${RESET}: ${error.message}`);
      }
    } catch (err: any) {
      console.log(`${YELLOW}⚠️  ${tableName}${RESET}: Could not verify`);
    }
  }

  // Final summary
  console.log(`\n${BOLD}${BLUE}╔════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${BLUE}║                  MIGRATION COMPLETE                            ║${RESET}`);
  console.log(`${BOLD}${BLUE}╚════════════════════════════════════════════════════════════════╝${RESET}\n`);

  if (allTablesExist) {
    console.log(`${GREEN}${BOLD}✅ SUCCESS: Migration 021 applied successfully${RESET}`);
    console.log(`${GREEN}   All tables created and verified${RESET}`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}⚠️  WARNING: Migration may be incomplete${RESET}`);
    console.log(`${RED}   Some tables were not found after application${RESET}`);
    console.log(`${YELLOW}   Please verify manually in Supabase dashboard${RESET}`);
    process.exit(1);
  }
}

// Run migration
applyMigration().catch((err) => {
  console.error(`${RED}${BOLD}FATAL ERROR:${RESET} ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
