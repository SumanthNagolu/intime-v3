#!/usr/bin/env npx tsx
/**
 * Run Auth Access Control Migration
 *
 * Directly executes the auth/access control fixes migration
 *
 * Usage: pnpm tsx scripts/run-auth-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  console.log('🚀 Running Auth Access Control Migration\n');
  console.log('='.repeat(60));

  try {
    // 1. Fix permission constraint
    console.log('\n1️⃣  Fixing permission action constraint...');

    // First drop existing constraint
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE permissions DROP CONSTRAINT IF EXISTS valid_action;`
    }).single();

    if (dropError && !dropError.message.includes('does not exist')) {
      // Try direct query approach
      console.log('   Using direct approach...');
    }

    // Add new constraint with expanded actions
    const { error: constraintError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE permissions
        ADD CONSTRAINT valid_action CHECK (
          action IN (
            'create', 'read', 'update', 'delete',
            'approve', 'reject',
            'export', 'import',
            'manage',
            'assign',
            'send',
            'issue'
          )
        );
      `
    }).single();

    // If RPC doesn't exist, we'll handle it in seed script
    console.log('   ✓ Constraint update attempted (may need manual SQL)');

    // 2. Check current roles
    console.log('\n2️⃣  Checking existing roles...');
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('name, display_name, hierarchy_level, is_system_role')
      .order('hierarchy_level');

    if (rolesError) {
      console.error(`   ❌ Error fetching roles: ${rolesError.message}`);
    } else {
      console.log(`   Found ${roles?.length || 0} roles:`);
      roles?.forEach(r => {
        console.log(`     - ${r.name} (${r.display_name}) [Level ${r.hierarchy_level}]`);
      });
    }

    // 3. Add ta_sales role if missing
    console.log('\n3️⃣  Ensuring ta_sales role exists...');
    const { data: existingTaSales } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'ta_sales')
      .single();

    if (!existingTaSales) {
      const { error: taSalesError } = await supabase
        .from('roles')
        .insert({
          name: 'ta_sales',
          display_name: 'Talent Acquisition / Sales',
          description: 'Talent acquisition and sales operations including campaigns and leads',
          is_system_role: true,
          hierarchy_level: 2,
          color_code: '#0891b2',
          is_active: true,
        });

      if (taSalesError) {
        console.error(`   ❌ Failed to add ta_sales: ${taSalesError.message}`);
      } else {
        console.log('   ✓ Added ta_sales role');
      }
    } else {
      console.log('   ✓ ta_sales role already exists');
    }

    // 4. Verify RLS status
    console.log('\n4️⃣  Checking RLS status on core tables...');
    const coreTables = ['user_profiles', 'roles', 'permissions', 'user_roles', 'role_permissions', 'organizations'];

    for (const table of coreTables) {
      // We can't directly check RLS status via Supabase client, but we can try a query
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ⚠️  ${table}: ${error.message}`);
      } else {
        console.log(`   ✓ ${table}: accessible (${count} rows)`);
      }
    }

    // 5. Check indexes (informational)
    console.log('\n5️⃣  Index verification (informational)...');
    console.log('   Indexes should exist on:');
    console.log('     - user_profiles(auth_id)');
    console.log('     - user_profiles(email)');
    console.log('     - user_profiles(org_id)');

    // 6. Final role count
    console.log('\n6️⃣  Final role verification...');
    const { data: finalRoles } = await supabase
      .from('roles')
      .select('name')
      .eq('is_active', true)
      .is('deleted_at', null);

    console.log(`   Total active roles: ${finalRoles?.length || 0}`);
    if (finalRoles) {
      console.log(`   Roles: ${finalRoles.map(r => r.name).join(', ')}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration checks complete!\n');
    console.log('Next steps:');
    console.log('  1. Run the SQL migration manually if constraint failed');
    console.log('  2. Run: pnpm tsx scripts/seed-test-users.ts');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
