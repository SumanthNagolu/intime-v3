#!/usr/bin/env tsx
const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-sql`;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function exec(sql: string) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql })
  });
  return await r.json();
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Restoring Test Users (with triggers disabled)           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Step 1: Disable triggers
console.log('🔧 Step 1: Disabling triggers...');
await exec('ALTER TABLE user_profiles DISABLE TRIGGER ALL');
console.log('   ✅ Triggers disabled\n');

// Step 2: Restore deleted users
console.log('🔄 Step 2: Restoring soft-deleted users...');
const result = await exec(`
  UPDATE user_profiles
  SET deleted_at = NULL, is_active = true
  WHERE email LIKE '%@intime.com'
    AND deleted_at IS NOT NULL
  RETURNING email
`);

if (result.success) {
  console.log(`   ✅ Restored ${result.rowCount} users`);
} else {
  console.log(`   ❌ Error: ${result.error}`);
}

// Step 3: Re-enable triggers
console.log('\n🔧 Step 3: Re-enabling triggers...');
await exec('ALTER TABLE user_profiles ENABLE TRIGGER ALL');
console.log('   ✅ Triggers re-enabled\n');

// Step 4: Verify
console.log('📊 Step 4: Verification...');
const check = await exec("SELECT COUNT(*)::int as count FROM user_profiles WHERE email LIKE '%@intime.com' AND deleted_at IS NULL");
console.log(`   ✅ Total active users: ${check.rows?.[0]?.count || 0}\n`);

console.log('✅ Done!\n');
