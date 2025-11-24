/**
 * Direct Migration Application via Supabase Management API
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
  console.log(`\n${BOLD}${BLUE}════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${BLUE}  APPLYING MIGRATION 021 TO PRODUCTION  ${RESET}`);
  console.log(`${BOLD}${BLUE}════════════════════════════════════════${RESET}\n`);

  // Read migration file
  const migrationPath = path.join(process.cwd(), 'src/lib/db/migrations/021_add_sprint_5_features.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error(`${RED}❌ Migration file not found${RESET}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  console.log(`${GREEN}✅ Loaded migration (${sql.split('\n').length} lines)${RESET}\n`);

  // Get credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(`${RED}❌ Supabase credentials not configured${RESET}`);
    process.exit(1);
  }

  // Extract project ref from URL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  if (!projectRef) {
    console.error(`${RED}❌ Could not extract project ref from URL${RESET}`);
    process.exit(1);
  }

  console.log(`${YELLOW}📡 Project: ${projectRef}${RESET}`);
  console.log(`${YELLOW}🔌 Executing SQL via Supabase API...${RESET}\n`);

  try {
    // Use Supabase's query endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        query: sql,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`${GREEN}✅ Migration executed via API${RESET}`);
    console.log(result);

  } catch (apiError: any) {
    console.log(`${YELLOW}⚠️  API method failed: ${apiError.message}${RESET}`);
    console.log(`${YELLOW}Trying alternative method with supabase-js client...${RESET}\n`);

    // Alternative: Use supabase-js client with raw SQL
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Split into statements and execute one by one
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 10 && !s.startsWith('--'));

    console.log(`${YELLOW}Found ${statements.length} SQL statements${RESET}\n`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i] + ';';
      console.log(`${YELLOW}[${i + 1}/${statements.length}] Executing...${RESET}`);

      try {
        // Try to execute via rpc
        const { data, error } = await supabase.rpc('exec', { sql: stmt });

        if (error) {
          console.error(`${RED}  ❌ Error: ${error.message}${RESET}`);

          // Check if it's a "function does not exist" error
          if (error.message.includes('function') && error.message.includes('does not exist')) {
            console.log(`${YELLOW}  ℹ️  The rpc('exec') function doesn't exist in Supabase${RESET}`);
            console.log(`${YELLOW}  ℹ️  You'll need to apply this migration manually${RESET}\n`);

            // Print instructions
            console.log(`${BOLD}${BLUE}════════════════════════════════════════${RESET}`);
            console.log(`${BOLD}${BLUE}  MANUAL APPLICATION REQUIRED          ${RESET}`);
            console.log(`${BOLD}${BLUE}════════════════════════════════════════${RESET}\n`);

            console.log(`Unfortunately, Supabase doesn't allow programmatic SQL execution for security reasons.`);
            console.log(`\nPlease apply the migration manually:`);
            console.log(`\n1. Go to: ${GREEN}https://supabase.com/dashboard/project/${projectRef}/sql/new${RESET}`);
            console.log(`2. Copy the contents of: ${YELLOW}src/lib/db/migrations/021_add_sprint_5_features.sql${RESET}`);
            console.log(`3. Paste into the SQL editor`);
            console.log(`4. Click ${GREEN}"Run"${RESET}`);
            console.log(`5. Verify no errors`);
            console.log(`6. Run verification: ${GREEN}pnpm exec tsx scripts/verify-migration-021.ts${RESET}\n`);

            process.exit(2); // Exit with code 2 = manual action required
          }
          throw error;
        }

        console.log(`${GREEN}  ✅ Success${RESET}`);
      } catch (stmtError: any) {
        console.error(`${RED}  ❌ Failed: ${stmtError.message}${RESET}`);
        throw stmtError;
      }
    }

    console.log(`\n${GREEN}${BOLD}✅ All statements executed successfully${RESET}`);
  }

  // Verification
  console.log(`\n${BOLD}Running verification...${RESET}\n`);

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const tables = ['candidate_embeddings', 'requisition_embeddings', 'resume_matches', 'generated_resumes'];
  let allExist = true;

  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);

    if (!error) {
      console.log(`${GREEN}✅ ${table}${RESET}`);
    } else {
      console.log(`${RED}❌ ${table}: ${error.message}${RESET}`);
      allExist = false;
    }
  }

  if (allExist) {
    console.log(`\n${GREEN}${BOLD}✅ MIGRATION 021 APPLIED SUCCESSFULLY${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`\n${YELLOW}${BOLD}⚠️  VERIFICATION INCOMPLETE${RESET}\n`);
    process.exit(1);
  }
}

applyMigration().catch(err => {
  console.error(`${RED}${BOLD}❌ FATAL ERROR:${RESET} ${err.message}`);
  process.exit(1);
});
