#!/usr/bin/env tsx
const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-sql`;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const r = await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ sql: "SELECT tgname, tgenabled FROM pg_trigger WHERE tgrelid = 'user_profiles'::regclass AND tgisinternal = false" })
});

const result = await r.json();
console.log('Triggers on user_profiles:');
result.rows?.forEach((r: any) => {
  console.log(`  - ${r.tgname}: ${r.tgenabled === 'O' ? '✅ ENABLED' : '❌ DISABLED'}`);
});

// Now disable ALL triggers
console.log('\n🔧 Disabling ALL triggers...');
const disable = await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ sql: "ALTER TABLE user_profiles DISABLE TRIGGER ALL" })
});
const dr = await disable.json();
console.log(dr.success ? '✅ All triggers disabled' : `❌ Failed: ${dr.error}`);
