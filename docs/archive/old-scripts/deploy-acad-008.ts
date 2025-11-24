/**
 * Deploy ACAD-008: Lab Environments System
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
  console.log('\n🧪 Deploying ACAD-008: Lab Environments System\n');

  // Read migration file
  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/20251121060000_create_lab_environments.sql'
  );

  console.log('📖 Reading migration file...');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  console.log('✅ Migration file loaded\n');

  console.log('🔄 Executing migration...');
  try {
    await executeSQL(migrationSQL);
    console.log('✅ Migration executed successfully\n');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }

  // Verify tables created
  console.log('🔍 Verifying tables...\n');

  const verifyTablesSQL = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('lab_templates', 'lab_instances', 'lab_submissions')
    ORDER BY table_name;
  `;

  try {
    const result = await executeSQL(verifyTablesSQL);
    if (result.rows && result.rows.length > 0) {
      console.log('✅ Tables created:');
      result.rows.forEach((row: any) => {
        console.log(`   - ${row.table_name}`);
      });
    }
  } catch (error: any) {
    console.log('⚠️  Could not verify tables:', error.message);
  }

  // Verify views created
  console.log('\n🔍 Verifying views...\n');

  const verifyViewsSQL = `
    SELECT table_name
    FROM information_schema.views
    WHERE table_schema = 'public'
      AND table_name IN ('grading_queue', 'lab_statistics');
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

  console.log('\n✅ ACAD-008 migration deployment complete!\n');
  console.log('Next: Run create-lab-functions.ts to create database functions\n');
}

deploy();
