#!/usr/bin/env tsx
const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-sql`;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const result = await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql: `UPDATE user_profiles
          SET deleted_at = NOW(), is_active = false
          WHERE email = 'sacavcad@dsvv.com'
          RETURNING email`
  })
});

const data = await result.json();
if (data.success && data.rowCount > 0) {
  console.log('✅ Deleted sacavcad@dsvv.com');
} else {
  console.log('⚠️  User not found or already deleted');
}

// Final count
const count = await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql: "SELECT COUNT(*)::int as count FROM user_profiles WHERE deleted_at IS NULL AND email LIKE '%@intime.com'"
  })
});

const countData = await count.json();
console.log(`\n📊 Final count: ${countData.rows?.[0]?.count || 0} active @intime.com users\n`);
