/**
 * Deploy ACAD-012 Capstone System Migration
 */

import { readFileSync } from 'fs';
import 'dotenv/config';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function deployMigration() {
  console.log('📦 Deploying ACAD-012 Capstone System Migration\n');

  const sql = readFileSync(
    'supabase/migrations/20251121090000_create_capstone_system.sql',
    'utf-8'
  );

  const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  const result = await response.json();

  if (result.success) {
    console.log('✅ Migration deployed successfully!');
    console.log(`   Rows affected: ${result.rowCount}`);
  } else {
    console.error('❌ Migration failed:');
    console.error(result.error);
    process.exit(1);
  }
}

deployMigration();
