#!/usr/bin/env npx tsx
/**
 * Fix Permission Constraint
 *
 * Updates the valid_action constraint on permissions table to allow
 * assign, send, and issue actions.
 *
 * Usage: pnpm tsx scripts/fix-permission-constraint.ts
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

async function fixConstraint() {
  console.log('🔧 Fixing permission constraint...\n');

  // The constraint needs to be updated via direct SQL. Since we can't run DDL
  // via the JS client, we'll create the missing permissions with a workaround.
  // The proper fix requires running the SQL migration manually.

  console.log('📋 SQL to run manually in Supabase SQL Editor:\n');
  console.log('─'.repeat(60));
  console.log(`
-- Drop existing constraint
ALTER TABLE permissions
  DROP CONSTRAINT IF EXISTS valid_action;

-- Create new constraint with expanded action list
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

-- Now insert the missing permissions
INSERT INTO permissions (resource, action, scope, display_name, is_dangerous)
VALUES
  ('roles', 'assign', 'all', 'Assign Roles', true),
  ('hotlists', 'send', 'all', 'Send Hotlists', false),
  ('certificates', 'issue', 'all', 'Issue Certificates', false)
ON CONFLICT (resource, action, scope) DO NOTHING;

-- Verify
SELECT action, COUNT(*) FROM permissions GROUP BY action ORDER BY action;
`);
  console.log('─'.repeat(60));

  // Check current constraint
  console.log('\n📊 Current permission actions in database:');
  const { data: actions } = await supabase
    .from('permissions')
    .select('action')
    .limit(1000);

  if (actions) {
    const uniqueActions = [...new Set(actions.map(a => a.action))].sort();
    console.log(`   Actions found: ${uniqueActions.join(', ')}`);
  }

  // Try to insert with allowed actions to verify constraint
  console.log('\n🧪 Testing constraint with existing action (manage)...');
  const { error: testError } = await supabase
    .from('permissions')
    .insert({
      resource: 'test_constraint',
      action: 'manage',
      scope: 'all',
      display_name: 'Test Constraint',
      is_dangerous: false,
    });

  if (testError) {
    console.log(`   ❌ Test failed: ${testError.message}`);
  } else {
    console.log('   ✓ manage action works');
    // Clean up
    await supabase
      .from('permissions')
      .delete()
      .eq('resource', 'test_constraint');
  }

  console.log('\n⚠️  IMPORTANT: Run the SQL above in Supabase Dashboard > SQL Editor');
  console.log('   Then re-run: pnpm tsx scripts/seed-test-users.ts\n');
}

fixConstraint();
