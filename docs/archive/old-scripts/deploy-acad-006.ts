/**
 * Deploy ACAD-006: Prerequisites and Sequencing
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
  console.log('\n🚀 Deploying ACAD-006: Prerequisites and Sequencing\n');

  // Read migration file
  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/20251121040000_create_prerequisite_views.sql'
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

  // Verify views exist
  console.log('🔍 Verifying views...\n');

  const verifyViewsSQL = `
    SELECT table_name
    FROM information_schema.views
    WHERE table_schema = 'public'
      AND table_name IN ('module_unlock_requirements', 'topic_unlock_requirements');
  `;

  try {
    const result = await executeSQL(verifyViewsSQL);
    if (result.rows && result.rows.length > 0) {
      console.log('✅ Views created:');
      result.rows.forEach((row: any) => {
        console.log(`   - ${row.table_name}`);
      });
    }
  } catch (error: any) {
    console.log('⚠️  Could not verify views:', error.message);
  }

  // Verify functions
  console.log('\n🔧 Verifying functions...\n');

  const checkFunctionsSQL = `
    SELECT proname
    FROM pg_proc
    WHERE proname IN (
      'check_course_prerequisites',
      'check_module_prerequisites',
      'get_locked_topics_for_user',
      'get_next_unlocked_topic',
      'bypass_prerequisites_for_role'
    )
    ORDER BY proname;
  `;

  try {
    const result = await executeSQL(checkFunctionsSQL);
    if (result.rows && result.rows.length > 0) {
      console.log('✅ Functions created:');
      result.rows.forEach((row: any) => {
        console.log(`   - ${row.proname}()`);
      });
    }
  } catch (error: any) {
    console.log('⚠️  Could not verify functions:', error.message);
  }

  console.log('\n✅ ACAD-006 deployment complete!\n');
}

deploy();
