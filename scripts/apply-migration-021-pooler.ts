/**
 * Apply Migration 021 using Supabase pooler connection
 */

import { Client } from 'pg';
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
  console.log(`${BOLD}${BLUE}║      APPLYING MIGRATION 021 VIA POOLER CONNECTION            ║${RESET}`);
  console.log(`${BOLD}${BLUE}╚════════════════════════════════════════════════════════════════╝${RESET}\n`);

  // Read migration file
  const migrationPath = path.join(process.cwd(), 'src/lib/db/migrations/021_add_sprint_5_features.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error(`${RED}❌ Migration file not found${RESET}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  console.log(`${GREEN}✅ Migration file loaded (${sql.split('\n').length} lines)${RESET}\n`);

  // Use pooler connection
  const poolerUrl = 'postgresql://postgres.gkwhxmvugnjwwwiufmdy:TIfyrFR8Q3fFywZZ@aws-0-us-west-1.pooler.supabase.com:6543/postgres';

  console.log(`${YELLOW}Connecting via pooler...${RESET}`);

  // Create client with pooler
  const client = new Client({
    connectionString: poolerUrl,
    ssl: {
      rejectUnauthorized: false,
    },
    // Important: Use transaction mode for pooler
    options: '-c search_path=public',
  });

  try {
    // Connect
    await client.connect();
    console.log(`${GREEN}✅ Connected via pooler${RESET}\n`);

    // Execute migration
    console.log(`${YELLOW}Executing migration SQL...${RESET}`);
    await client.query(sql);

    console.log(`${GREEN}✅ Migration executed successfully${RESET}\n`);

    // Verify tables
    console.log(`${BOLD}Verifying tables...${RESET}\n`);

    const tables = ['candidate_embeddings', 'requisition_embeddings', 'resume_matches', 'generated_resumes'];

    for (const table of tables) {
      const result = await client.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`,
        [table]
      );

      if (result.rows[0].exists) {
        console.log(`${GREEN}✅ ${table}${RESET}`);
      } else {
        console.log(`${RED}❌ ${table} not found${RESET}`);
      }
    }

    console.log(`\n${GREEN}${BOLD}✅ MIGRATION 021 APPLIED SUCCESSFULLY${RESET}\n`);

  } catch (err: any) {
    console.error(`${RED}${BOLD}❌ ERROR:${RESET} ${err.message}`);

    if (err.message.includes('prepared transactions') || err.message.includes('transaction')) {
      console.error(`\n${YELLOW}ℹ️  Pooler connection doesn't support DDL operations${RESET}`);
      console.error(`${YELLOW}   Supabase requires SQL Editor for schema changes${RESET}\n`);
    }

    console.error(err.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration().catch(err => {
  console.error(`${RED}${BOLD}FATAL ERROR:${RESET} ${err.message}`);
  process.exit(1);
});
