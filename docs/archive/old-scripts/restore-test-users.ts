#!/usr/bin/env tsx
const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-sql`;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔄 Restoring soft-deleted test users...\n');

const result = await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql: `UPDATE user_profiles
          SET deleted_at = NULL, is_active = true
          WHERE email LIKE '%@intime.com'
            AND deleted_at IS NOT NULL
          RETURNING email`
  })
});

const data = await result.json();

if (data.success) {
  console.log(`✅ Restored ${data.rowCount} users:\n`);
  data.rows?.forEach((u: any) => {
    console.log(`   ✓ ${u.email}`);
  });

  // Verify
  const check = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sql: "SELECT COUNT(*)::int as count FROM user_profiles WHERE email LIKE '%@intime.com' AND deleted_at IS NULL"
    })
  });

  const checkData = await check.json();
  console.log(`\n📊 Total active users: ${checkData.rows?.[0]?.count || 0}`);
} else {
  console.log('❌ Error:', data.error);
}
