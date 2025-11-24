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
console.log('║  Cleaning Up Old Test Users                              ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// First, let's see what we have
console.log('📊 Analyzing current users...\n');

const analyze = await exec(`
  SELECT
    COUNT(*) FILTER (WHERE email LIKE '%@intime.com') as intime_users,
    COUNT(*) FILTER (WHERE email LIKE '%@example.com') as example_users,
    COUNT(*) FILTER (WHERE email LIKE '%@dsxv.com') as dsxv_users,
    COUNT(*) FILTER (WHERE email LIKE 'test%') as test_users,
    COUNT(*) FILTER (WHERE email LIKE '%@intime.test') as intime_test_users,
    COUNT(*) as total_users
  FROM user_profiles
  WHERE deleted_at IS NULL
`);

if (analyze.success && analyze.rows?.[0]) {
  const stats = analyze.rows[0];
  console.log('   Current users:');
  console.log(`   • @intime.com users: ${stats.intime_users}`);
  console.log(`   • @example.com users: ${stats.example_users}`);
  console.log(`   • @dsxv.com users: ${stats.dsxv_users}`);
  console.log(`   • @intime.test users: ${stats.intime_test_users}`);
  console.log(`   • test* users: ${stats.test_users}`);
  console.log(`   • Total active: ${stats.total_users}\n`);
}

// Soft delete old test users (keep our planned @intime.com users)
console.log('🗑️  Soft deleting old test users...\n');

const patternsToDelete = [
  '%@example.com',
  '%@dsxv.com',
  '%@intime.test',
  'integration-test%',
  'test-user-%'
];

let totalDeleted = 0;

for (const pattern of patternsToDelete) {
  const result = await exec(`
    UPDATE user_profiles
    SET deleted_at = NOW(), is_active = false
    WHERE email LIKE '${pattern}'
      AND deleted_at IS NULL
    RETURNING email
  `);

  if (result.success && result.rowCount > 0) {
    totalDeleted += result.rowCount;
    console.log(`   ✅ Deleted ${result.rowCount} users matching '${pattern}'`);
  }
}

console.log(`\n   Total deleted: ${totalDeleted} users`);

// Also clean up the extra test users we created (seedtest, test, testuser123)
console.log('\n🧹 Cleaning up extra test accounts...\n');

const extraUsers = ['seedtest@intime.com', 'test@intime.com', 'testuser123@intime.com'];
for (const email of extraUsers) {
  const result = await exec(`
    UPDATE user_profiles
    SET deleted_at = NOW(), is_active = false
    WHERE email = '${email}'
      AND deleted_at IS NULL
  `);

  if (result.success && result.rowCount > 0) {
    console.log(`   ✅ Deleted ${email}`);
  }
}

// Final verification
console.log('\n📊 Final user count...\n');

const final = await exec(`
  SELECT COUNT(*) as active
  FROM user_profiles
  WHERE deleted_at IS NULL AND is_active = true
`);

if (final.success && final.rows?.[0]) {
  console.log(`   ✅ Active users remaining: ${final.rows[0].active}`);
}

// List remaining users
const remaining = await exec(`
  SELECT email, full_name
  FROM user_profiles
  WHERE deleted_at IS NULL
  ORDER BY email
`);

if (remaining.success && remaining.rows) {
  console.log('\n   Remaining active users:');
  remaining.rows.forEach((u: any) => {
    console.log(`     • ${u.email.padEnd(35)} - ${u.full_name}`);
  });
}

console.log('\n✅ Cleanup complete!\n');
