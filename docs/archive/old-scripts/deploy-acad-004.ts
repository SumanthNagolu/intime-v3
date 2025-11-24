/**
 * Deploy ACAD-004: Content Upload System
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
  console.log('\n🚀 Deploying ACAD-004: Content Upload System\n');

  // Read migration file
  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/20251121030000_create_content_assets.sql'
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

  // Verify table exists
  console.log('🔍 Verifying content_assets table...\n');

  const verifySQL = `SELECT COUNT(*) as count FROM content_assets;`;

  try {
    const result = await executeSQL(verifySQL);
    console.log('✅ content_assets table exists!');
    console.log('📊 Current assets:', result.rows?.[0]?.count || 0, '\n');
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
  }

  // Verify functions
  console.log('🔧 Verifying database functions...\n');

  const checkFunctionsSQL = `
    SELECT proname, pg_get_function_arguments(oid) as args
    FROM pg_proc
    WHERE proname IN (
      'record_content_upload',
      'replace_content_asset',
      'get_asset_storage_path',
      'get_topic_assets',
      'get_course_storage_usage'
    )
    ORDER BY proname;
  `;

  try {
    const result = await executeSQL(checkFunctionsSQL);
    if (result.rows && result.rows.length > 0) {
      console.log('✅ Functions created:');
      result.rows.forEach((row: any) => {
        console.log(`   - ${row.proname}(${row.args})`);
      });
    } else {
      console.log('⚠️  Functions not found - they may need to be created separately');
    }
  } catch (error: any) {
    console.log('⚠️  Could not verify functions:', error.message);
  }

  console.log('\n✅ ACAD-004 deployment complete!\n');
  console.log('📝 Note: Create Supabase Storage bucket "course-content" via dashboard\n');
}

deploy();
