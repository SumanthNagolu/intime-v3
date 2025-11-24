import { readFileSync } from 'fs';
import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.SUPABASE_DB_URL || 'postgresql://postgres.gkwhxmvugnjwwwiufmdy:TIfyrFR8Q3fFywZZ@aws-0-us-west-1.pooler.supabase.com:6543/postgres';

async function applyEventFunctions() {
  const client = new Client({ connectionString });

  try {
    console.log('📦 Connecting to database...');
    await client.connect();
    console.log('✓ Connected');

    console.log('\n📦 Reading migration file...');
    const sql = readFileSync('supabase/migrations/20251121090000_create_event_admin_functions.sql', 'utf8');

    // Extract individual CREATE FUNCTION statements
    const functionMatches = sql.matchAll(/CREATE OR REPLACE FUNCTION[\s\S]+?\$\$;/g);
    const functions = Array.from(functionMatches);

    console.log(`\n🔧 Found ${functions.length} functions to create\n`);

    for (const [funcSql] of functions) {
      // Extract function name
      const nameMatch = funcSql.match(/CREATE OR REPLACE FUNCTION\s+(\w+)\s*\(/);
      const funcName = nameMatch ? nameMatch[1] : 'unknown';

      console.log(`Creating: ${funcName}`);

      try {
        await client.query(funcSql);
        console.log(`   ✓ Created successfully`);
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    // Apply GRANT statements
    console.log('\n🔒 Applying permissions...');
    const grantMatches = sql.matchAll(/GRANT EXECUTE ON FUNCTION [\s\S]+?;/g);
    const grants = Array.from(grantMatches);

    for (const [grantSql] of grants) {
      try {
        await client.query(grantSql);
        console.log(`   ✓ Permission granted`);
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log('\n✅ Migration applied successfully');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyEventFunctions();
