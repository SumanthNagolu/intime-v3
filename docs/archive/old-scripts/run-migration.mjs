#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EDGE_FUNCTION_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql';

if (!SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function runMigration(filename) {
  console.log(`\n📋 Applying ${filename}...`);

  const sqlPath = join(projectRoot, 'src/lib/db/migrations', filename);
  const sql = readFileSync(sqlPath, 'utf-8');

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`❌ Error:`, result);
      return false;
    }

    console.log(`✅ ${filename} applied successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error applying ${filename}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Applying migrations...\n');

  const migrations = [
    '008_refine_event_bus.sql',
    '009_add_permission_function.sql',
  ];

  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (!success) {
      console.log('\n❌ Migration failed. Stopping.');
      process.exit(1);
    }
  }

  console.log('\n✅ All migrations applied successfully!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
