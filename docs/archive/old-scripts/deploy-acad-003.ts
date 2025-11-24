/**
 * Deploy ACAD-003: Progress Tracking System
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const EXECUTE_SQL_URL = `${SUPABASE_URL}/functions/v1/execute-sql`;

async function executeSQL(sql: string): Promise<any> {
  const response = await fetch(EXECUTE_SQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response.json();
}

async function deploy() {
  console.log('\n🚀 Deploying ACAD-003: Progress Tracking System\n');

  // Read migration file
  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/20251121020000_create_progress_tracking.sql'
  );

  console.log('📖 Reading migration file...');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  console.log('✅ Migration file loaded\n');

  console.log('🔄 Executing migration...');
  try {
    const result = await executeSQL(migrationSQL);
    console.log('✅ Migration executed successfully\n');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }

  // Verify tables exist
  console.log('🔍 Verifying progress tracking tables...\n');

  const verifyTables = async (tableName: string) => {
    try {
      const result = await executeSQL(`SELECT COUNT(*) as count FROM ${tableName};`);
      console.log(`✅ ${tableName}: EXISTS (${result.rows?.[0]?.count || 0} rows)`);
    } catch (error: any) {
      console.log(`❌ ${tableName}: ${error.message}`);
    }
  };

  await verifyTables('topic_completions');
  await verifyTables('xp_transactions');

  // Verify materialized view
  try {
    const result = await executeSQL(`SELECT COUNT(*) as count FROM user_xp_totals;`);
    console.log(`✅ user_xp_totals (view): EXISTS (${result.rows?.[0]?.count || 0} rows)`);
  } catch (error: any) {
    console.log(`❌ user_xp_totals (view): ${error.message}`);
  }

  console.log('\n🔧 Verifying database functions...\n');

  const functions = [
    'complete_topic',
    'update_enrollment_progress',
    'is_topic_unlocked',
    'get_user_total_xp',
  ];

  for (const func of functions) {
    try {
      // Try to get function signature
      const result = await executeSQL(`
        SELECT proname, pg_get_function_arguments(oid) as args
        FROM pg_proc
        WHERE proname = '${func}';
      `);

      if (result.rows && result.rows.length > 0) {
        console.log(`✅ ${func}: EXISTS`);
      } else {
        console.log(`❌ ${func}: NOT FOUND`);
      }
    } catch (error: any) {
      console.log(`❌ ${func}: ${error.message}`);
    }
  }

  console.log('\n✅ ACAD-003 deployment complete!\n');
}

deploy();
