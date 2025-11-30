#!/usr/bin/env npx tsx
/**
 * Fix Permission Constraint via Edge Function
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function execSQL(sql: string, description: string): Promise<boolean> {
  console.log(`\n📝 ${description}...`);

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });

    const result = await response.json();

    if (!result.success) {
      // Ignore "already exists" or "does not exist" errors
      if (result.error?.includes('does not exist') ||
          result.error?.includes('already exists') ||
          result.error?.includes('duplicate')) {
        console.log(`   ⚠️  ${result.error} (continuing...)`);
        return true;
      }
      console.error(`   ❌ Error: ${result.error}`);
      return false;
    }

    console.log(`   ✅ Done (${result.rowCount || 0} rows affected)`);
    return true;
  } catch (error) {
    console.error(`   ❌ Fetch error: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function main() {
  console.log('🔧 Fixing Permission Constraint via Edge Function\n');
  console.log('='.repeat(60));

  // Step 1: Drop existing constraint
  await execSQL(
    `ALTER TABLE permissions DROP CONSTRAINT IF EXISTS valid_action`,
    'Dropping existing constraint'
  );

  // Step 2: Add new constraint with expanded actions
  const success = await execSQL(
    `ALTER TABLE permissions ADD CONSTRAINT valid_action CHECK (
      action IN (
        'create', 'read', 'update', 'delete',
        'approve', 'reject',
        'export', 'import',
        'manage',
        'assign',
        'send',
        'issue'
      )
    )`,
    'Adding new constraint with assign/send/issue'
  );

  if (!success) {
    console.error('\n❌ Failed to update constraint');
    process.exit(1);
  }

  // Step 3: Insert missing permissions
  console.log('\n📝 Inserting missing permissions...');

  const missingPermissions = [
    { resource: 'roles', action: 'assign', scope: 'all', display_name: 'Assign Roles', is_dangerous: true },
    { resource: 'hotlists', action: 'send', scope: 'all', display_name: 'Send Hotlists', is_dangerous: false },
    { resource: 'certificates', action: 'issue', scope: 'all', display_name: 'Issue Certificates', is_dangerous: false },
  ];

  for (const perm of missingPermissions) {
    const { error } = await supabase
      .from('permissions')
      .upsert(perm, { onConflict: 'resource,action,scope' });

    if (error) {
      console.log(`   ⚠️  ${perm.resource}:${perm.action}: ${error.message}`);
    } else {
      console.log(`   ✅ ${perm.resource}:${perm.action}:${perm.scope}`);
    }
  }

  // Step 4: Add missing indexes
  console.log('\n📝 Adding missing indexes...');

  await execSQL(
    `CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_id ON user_profiles(auth_id) WHERE auth_id IS NOT NULL`,
    'Index on auth_id'
  );

  await execSQL(
    `CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email) WHERE deleted_at IS NULL`,
    'Index on email'
  );

  await execSQL(
    `CREATE INDEX IF NOT EXISTS idx_user_profiles_org_id_active ON user_profiles(org_id) WHERE deleted_at IS NULL`,
    'Index on org_id'
  );

  // Step 5: Verify
  console.log('\n🔍 Verifying...');

  const { data: actions } = await supabase
    .from('permissions')
    .select('action')
    .limit(1000);

  if (actions) {
    const uniqueActions = [...new Set(actions.map(a => a.action))].sort();
    console.log(`\n   Actions in DB: ${uniqueActions.join(', ')}`);
  }

  const { count } = await supabase
    .from('permissions')
    .select('*', { count: 'exact', head: true });

  console.log(`   Total permissions: ${count}`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ Constraint fix complete!');
  console.log('\nNow run: pnpm tsx scripts/seed-test-users.ts');
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
