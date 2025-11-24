/**
 * Deploy ACAD-007: Video Player with Progress Tracking
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
  console.log('\n🎬 Deploying ACAD-007: Video Player with Progress Tracking\n');

  // Read migration file
  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/20251121050000_create_video_progress.sql'
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

  // Verify table created
  console.log('🔍 Verifying table...\n');

  const verifyTableSQL = `
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'video_progress'
    ORDER BY ordinal_position;
  `;

  try {
    const result = await executeSQL(verifyTableSQL);
    if (result.rows && result.rows.length > 0) {
      console.log('✅ video_progress table created with columns:');
      result.rows.forEach((row: any) => {
        console.log(`   - ${row.column_name} (${row.data_type})`);
      });
    }
  } catch (error: any) {
    console.log('⚠️  Could not verify table:', error.message);
  }

  // Verify view created
  console.log('\n🔍 Verifying view...\n');

  const verifyViewSQL = `
    SELECT table_name
    FROM information_schema.views
    WHERE table_schema = 'public'
      AND table_name = 'video_watch_stats';
  `;

  try {
    const result = await executeSQL(verifyViewSQL);
    if (result.rows && result.rows.length > 0) {
      console.log('✅ View created:');
      result.rows.forEach((row: any) => {
        console.log(`   - ${row.table_name}`);
      });
    }
  } catch (error: any) {
    console.log('⚠️  Could not verify view:', error.message);
  }

  console.log('\n✅ ACAD-007 migration deployment complete!\n');
  console.log('Next: Run create-video-functions.ts to create database functions\n');
}

deploy();
