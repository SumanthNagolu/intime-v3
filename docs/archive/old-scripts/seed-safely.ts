#!/usr/bin/env tsx
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-sql`;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeSql(sql: string) {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });
  return await response.json();
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  InTime v3 - Safe Test Data Seeding                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Step 1: Disable all audit triggers on relevant tables
  console.log('🔧 Step 1: Disabling all triggers...');
  const tableTriggers = {
    'user_profiles': [
      'trigger_audit_user_profiles',
      'trigger_user_profiles_search',
      'trigger_user_profiles_updated_at'
    ],
    'user_roles': ['trigger_audit_user_roles'],
    'roles': ['trigger_audit_roles'],
    'events': ['trigger_audit_events'],
    'audit_logs': ['trigger_audit_audit_logs'],
  };

  const allTriggers: string[] = [];
  for (const [table, trigs] of Object.entries(tableTriggers)) {
    for (const trig of trigs) {
      const result = await executeSql(`ALTER TABLE ${table} DISABLE TRIGGER ${trig}`);
      if (result.success) {
        console.log(`   ✅ Disabled ${table}.${trig}`);
        allTriggers.push(`${table}.${trig}`);
      } else if (!result.error?.includes('does not exist')) {
        console.log(`   ⚠️  Could not disable ${table}.${trig}: ${result.error}`);
      }
    }
  }

  // Step 2: Run seed
  console.log('\n🌱 Step 2: Seeding data...');
  const seedPath = path.join(__dirname, 'seed-comprehensive-test-data.sql');
  const sql = fs.readFileSync(seedPath, 'utf-8');

  // Simple split - just by semicolon
  const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));

  let success = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (stmt.trim().length < 10) continue;

    const preview = stmt.substring(0, 60).replace(/\s+/g, ' ').trim();

    const result = await executeSql(stmt);
    if (result.success) {
      success++;
      if (preview.includes('INSERT INTO user_profiles')) {
        console.log(`\n   ✅ [#${i}] User INSERT succeeded! ${result.rowCount || 0} rows`);
      } else {
        process.stdout.write('.');
      }
    } else {
      failed++;
      if (!result.error?.includes('already exists') && !result.error?.includes('DO NOTHING')) {
        console.error(`\n   ⚠️  [#${i}: ${preview}...] ${result.error}`);
      }
    }
  }

  console.log(`\n   ✅ Success: ${success}, ⚠️  Failed: ${failed}`);

  // Step 3: Re-enable all triggers
  console.log('\n🔧 Step 3: Re-enabling all triggers...');
  for (const [table, trigs] of Object.entries(tableTriggers)) {
    for (const trig of trigs) {
      const result = await executeSql(`ALTER TABLE ${table} ENABLE TRIGGER ${trig}`);
      if (result.success) {
        console.log(`   ✅ Re-enabled ${table}.${trig}`);
      } else if (!result.error?.includes('does not exist')) {
        console.log(`   ⚠️  Could not re-enable ${table}.${trig}`);
      }
    }
  }

  // Step 4: Verify
  console.log('\n🔍 Step 4: Verifying...');
  const verify = await executeSql("SELECT COUNT(*)::int as count FROM user_profiles WHERE email LIKE '%@intime.com' AND deleted_at IS NULL");
  if (verify.success && verify.rows) {
    console.log(`   ✅ Users created: ${verify.rows[0].count}`);
  }

  console.log('\n✅ Done!\n');
}

main();
