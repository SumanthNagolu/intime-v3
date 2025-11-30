#!/usr/bin/env tsx
const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-sql`;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const result = await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql: `SELECT id, email, full_name, is_active, deleted_at
          FROM user_profiles
          WHERE email LIKE '%@intime.com'
          ORDER BY email`
  })
});

const data = await result.json();

if (data.success && data.rows) {
  console.log(`\n📊 Found ${data.rows.length} users:\n`);

  data.rows.forEach((u: Record<string, unknown>) => {
    const status = u.deleted_at ? '❌ DELETED' : (u.is_active ? '✅ ACTIVE' : '⏸️  INACTIVE');
    const email = String(u.email || '');
    const fullName = String(u.full_name || '');
    console.log(`  ${status} ${email.padEnd(30)} - ${fullName}`);
  });

  const active = data.rows.filter((u: Record<string, unknown>) => !u.deleted_at && u.is_active).length;
  const deleted = data.rows.filter((u: Record<string, unknown>) => u.deleted_at).length;
  const inactive = data.rows.filter((u: Record<string, unknown>) => !u.deleted_at && !u.is_active).length;

  console.log(`\n📈 Summary:`);
  console.log(`   Active: ${active}`);
  console.log(`   Inactive: ${inactive}`);
  console.log(`   Deleted: ${deleted}`);
} else {
  console.log('❌ Error:', data.error);
}
