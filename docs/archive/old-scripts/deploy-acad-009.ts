/**
 * Deploy ACAD-009: Reading Materials Progress Tracking
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
  console.log('\n📚 Deploying ACAD-009: Reading Materials Progress Tracking\n');

  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/20251121070000_create_reading_progress.sql'
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

  console.log('✅ ACAD-009 migration deployment complete!\n');
  console.log('Next: Run create-reading-functions.ts to create database functions\n');
}

deploy();
