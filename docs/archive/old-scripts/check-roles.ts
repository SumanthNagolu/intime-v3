#!/usr/bin/env tsx
const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-sql`;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const result = await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ sql: 'SELECT COUNT(*)::int as count FROM roles' })
});

const data = await result.json();
console.log('Roles count:', data.rows?.[0]?.count || 0);

if (data.success && (data.rows?.[0]?.count || 0) > 0) {
  const list = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql: 'SELECT name FROM roles ORDER BY hierarchy_level' })
  });
  const listData = await list.json();
  console.log('\nExisting roles:');
  listData.rows?.forEach((r: any) => console.log('  -', r.name));
}
