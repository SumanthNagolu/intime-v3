#!/usr/bin/env tsx
const EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-sql`;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeSql(sql: string) {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });
  return await response.json();
}

async function main() {
  console.log('🔍 Checking user_profiles schema...\n');

  // Check columns
  const cols = await executeSql(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    ORDER BY ordinal_position
  `);

  if (cols.success) {
    console.log('📋 Columns:');
    cols.rows.slice(0, 30).forEach((r: any) => {
      console.log(`   ${r.column_name} (${r.data_type}) ${r.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
  }

  console.log('\n🔧 Triggers:');
  const triggers = await executeSql(`
    SELECT tgname, pg_get_triggerdef(oid) as definition
    FROM pg_trigger
    WHERE tgrelid = 'user_profiles'::regclass
    AND tgisinternal = false
  `);

  if (triggers.success) {
    triggers.rows.forEach((r: any) => {
      console.log(`\n   ${r.tgname}:`);
      console.log(`   ${r.definition}`);
    });
  } else {
    console.log('   Error:', triggers.error);
  }
}

main();
