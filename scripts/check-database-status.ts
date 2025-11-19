/**
 * Script to check Supabase database migration status
 * Verifies which tables exist and reports on migration state
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkDatabaseStatus() {
  console.log('\n🔍 Checking Supabase Database Status...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const expectedTables = [
    { name: 'user_profiles', migration: '002' },
    { name: 'roles', migration: '003' },
    { name: 'permissions', migration: '003' },
    { name: 'role_permissions', migration: '003' },
    { name: 'user_roles', migration: '003' },
    { name: 'audit_logs', migration: '004' },
    { name: 'events', migration: '005' },
    { name: 'event_subscriptions', migration: '005' },
    { name: 'organizations', migration: '007' }
  ];

  let allTablesExist = true;
  const missingTables: string[] = [];

  for (const table of expectedTables) {
    try {
      const { count, error } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01') {
          // Table does not exist
          console.log(`❌ ${table.name.padEnd(25)} - NOT FOUND (Migration ${table.migration})`);
          allTablesExist = false;
          missingTables.push(table.name);
        } else {
          console.log(`⚠️  ${table.name.padEnd(25)} - ERROR: ${error.message}`);
        }
      } else {
        console.log(`✅ ${table.name.padEnd(25)} - EXISTS (${count ?? 0} rows)`);
      }
    } catch (err: any) {
      console.log(`⚠️  ${table.name.padEnd(25)} - ERROR: ${err.message}`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (allTablesExist) {
    console.log('✅ All migrations have been applied successfully!\n');
    console.log('📋 Next Steps:');
    console.log('   - Implement FOUND-005: Supabase Auth helpers');
    console.log('   - Implement FOUND-006: Role assignment during signup\n');
  } else {
    console.log('❌ Some tables are missing. Need to apply migrations.\n');
    console.log(`📋 Missing Tables (${missingTables.length}):`, missingTables.join(', '));
    console.log('\n📝 To apply migrations:');
    console.log('   1. Option A: Use Supabase Dashboard SQL Editor');
    console.log('      - Copy contents of APPLY-MIGRATIONS.sql');
    console.log('      - Paste and execute in SQL Editor\n');
    console.log('   2. Option B: Use psql command');
    console.log('      - psql $SUPABASE_DB_URL < APPLY-MIGRATIONS.sql\n');
  }

  return allTablesExist;
}

// Run the check
checkDatabaseStatus()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Fatal Error:', error);
    process.exit(1);
  });
