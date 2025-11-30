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

const tables = ['user_profiles', 'user_roles', 'roles', 'events', 'audit_logs'];

for (const table of tables) {
  const result = await exec(`
    SELECT tgname, tgenabled
    FROM pg_trigger
    WHERE tgrelid = '${table}'::regclass
    AND tgisinternal = false
  `);

  if (result.success && result.rows?.length > 0) {
    console.log(`\n${table}:`);
    result.rows.forEach((r: Record<string, unknown>) => {
      console.log(`  - ${r.tgname} (${r.tgenabled === 'O' ? 'enabled' : 'disabled'})`);
    });
  }
}
