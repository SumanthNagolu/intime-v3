#!/usr/bin/env tsx
const EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-sql`;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeSql(sql: string) {
  const response = await fetch(EDGE_FUNCTION_URL!, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });
  return await response.json();
}

const result = await executeSql(`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_name = 'user_profiles'
  ORDER BY ordinal_position
`);

console.log('All columns in user_profiles:');
result.rows?.forEach((r: Record<string, unknown>) => console.log(`  - ${r.column_name}`));

console.log('\nChecking for meta columns:');
const metaCols = ['org_id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at', 'is_active'];
for (const col of metaCols) {
  const exists = result.rows?.some((r: Record<string, unknown>) => r.column_name === col);
  console.log(`  ${exists ? '✅' : '❌'} ${col}`);
}
