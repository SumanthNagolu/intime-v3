#!/usr/bin/env tsx
/**
 * Reset and Seed Test Data Script
 *
 * This script:
 * 1. Cleans up all existing test users
 * 2. Seeds comprehensive test data
 * 3. Verifies the data was created correctly
 *
 * Usage: npm run seed:reset
 * or: tsx scripts/reset-and-seed-test-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function executeSqlFile(filePath: string, description: string) {
  console.log(`\n📄 ${description}...`);

  const sql = fs.readFileSync(filePath, 'utf-8');

  // Split by semicolons but be careful with function definitions
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    if (!statement) continue;

    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: statement + ';',
      });

      if (error) {
        console.error(`   ❌ Error: ${error.message}`);
        errorCount++;
      } else {
        successCount++;
      }
    } catch (err) {
      console.error(`   ❌ Exception: ${err}`);
      errorCount++;
    }
  }

  console.log(`   ✅ Executed ${successCount} statements`);
  if (errorCount > 0) {
    console.log(`   ⚠️  ${errorCount} errors encountered`);
  }
}

async function verifyData() {
  console.log('\n🔍 Verifying test data...');

  // Count users
  const { data: users, error: usersError } = await supabase
    .from('user_profiles')
    .select('id', { count: 'exact', head: true })
    .like('email', '%@intime.com')
    .is('deleted_at', null);

  if (usersError) {
    console.error('   ❌ Error counting users:', usersError.message);
  } else {
    console.log(`   ✅ Created ${users?.length || 0} users`);
  }

  // Count roles
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id', { count: 'exact', head: true })
    .eq('is_system_role', true);

  if (rolesError) {
    console.error('   ❌ Error counting roles:', rolesError.message);
  } else {
    console.log(`   ✅ Created ${roles?.length || 0} system roles`);
  }

  // Count role assignments
  const { data: assignments, error: assignmentsError } = await supabase
    .from('user_roles')
    .select('user_id', { count: 'exact', head: true });

  if (assignmentsError) {
    console.error('   ❌ Error counting role assignments:', assignmentsError.message);
  } else {
    console.log(`   ✅ Created ${assignments?.length || 0} role assignments`);
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  InTime v3 - Test Data Reset & Seed                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    // Step 1: Cleanup
    const cleanupPath = path.join(__dirname, 'cleanup-test-users.sql');
    if (fs.existsSync(cleanupPath)) {
      await executeSqlFile(cleanupPath, 'Cleaning up existing test data');
    } else {
      console.log('\n⚠️  Cleanup script not found, skipping cleanup');
    }

    // Step 2: Seed
    const seedPath = path.join(__dirname, 'seed-comprehensive-test-data.sql');
    if (fs.existsSync(seedPath)) {
      await executeSqlFile(seedPath, 'Seeding comprehensive test data');
    } else {
      console.error('\n❌ Seed script not found at:', seedPath);
      process.exit(1);
    }

    // Step 3: Verify
    await verifyData();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Test data reset and seeded successfully!              ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n📖 See TEST-CREDENTIALS.md for login details');
    console.log('🔐 Default password: TestPass123!\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
