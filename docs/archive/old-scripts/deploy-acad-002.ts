/**
 * Deploy ACAD-002: Enrollment System
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
  console.log('\n🚀 Deploying ACAD-002: Enrollment System\n');

  // Read migration file
  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/20251121010000_create_student_enrollments.sql'
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
  console.log('🔍 Verifying enrollment table...\n');

  const verifySQL = `
    SELECT COUNT(*) as count
    FROM student_enrollments;
  `;

  try {
    const result = await executeSQL(verifySQL);
    console.log('✅ Enrollment table exists!\n');
    console.log('📊 Current enrollments:', result.rows?.[0]?.count || 0);
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
  }

  console.log('\n✅ ACAD-002 deployment complete!\n');
}

deploy();
