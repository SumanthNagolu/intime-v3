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
console.log('║  Test Data Verification Report                           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// 1. Check users
console.log('📊 1. User Profiles\n');
const users = await exec(`
  SELECT COUNT(*) FILTER (WHERE deleted_at IS NULL AND is_active = true) as active,
         COUNT(*) FILTER (WHERE deleted_at IS NULL AND is_active = false) as inactive,
         COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted
  FROM user_profiles
  WHERE email LIKE '%@intime.com'
`);

if (users.success && users.rows?.[0]) {
  const u = users.rows[0];
  console.log(`   ✅ Active users: ${u.active}`);
  console.log(`   ⏸️  Inactive users: ${u.inactive}`);
  console.log(`   ❌ Deleted users: ${u.deleted}`);
}

// 2. Check roles
console.log('\n📋 2. Roles\n');
const roles = await exec('SELECT COUNT(*) as total FROM roles');
if (roles.success && roles.rows?.[0]) {
  console.log(`   ✅ Total roles: ${roles.rows[0].total}`);

  const roleList = await exec('SELECT name, display_name FROM roles ORDER BY hierarchy_level, name');
  if (roleList.success && roleList.rows) {
    console.log('\n   Roles:');
    roleList.rows.forEach((r: any) => {
      console.log(`     • ${r.display_name.padEnd(30)} (${r.name})`);
    });
  }
}

// 3. Check role assignments
console.log('\n🔗 3. Role Assignments\n');
const assignments = await exec(`
  SELECT r.display_name as role, COUNT(ur.user_id)::int as user_count
  FROM roles r
  LEFT JOIN user_roles ur ON ur.role_id = r.id
  GROUP BY r.id, r.display_name
  ORDER BY r.hierarchy_level, r.name
`);

if (assignments.success && assignments.rows) {
  console.log('   Role assignments:');
  let totalAssigned = 0;
  assignments.rows.forEach((a: any) => {
    totalAssigned += a.user_count;
    const count = a.user_count > 0 ? `✅ ${a.user_count}` : '⚠️  0';
    console.log(`     ${count.padEnd(6)} users with ${a.role}`);
  });
  console.log(`\n   Total role assignments: ${totalAssigned}`);
}

// 4. Check users without roles
console.log('\n👤 4. Users Without Roles\n');
const noRoles = await exec(`
  SELECT u.email, u.full_name
  FROM user_profiles u
  WHERE u.email LIKE '%@intime.com'
    AND u.deleted_at IS NULL
    AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id)
  ORDER BY u.email
`);

if (noRoles.success && noRoles.rows) {
  if (noRoles.rows.length === 0) {
    console.log('   ✅ All users have at least one role');
  } else {
    console.log(`   ⚠️  ${noRoles.rows.length} users without roles:`);
    noRoles.rows.forEach((u: any) => {
      console.log(`     • ${u.email} - ${u.full_name}`);
    });
  }
}

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  Verification Complete                                    ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
