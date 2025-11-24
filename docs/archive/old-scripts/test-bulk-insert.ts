#!/usr/bin/env tsx
const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-sql`;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Disable triggers first
console.log('Disabling triggers...');
await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ sql: 'ALTER TABLE user_profiles DISABLE TRIGGER ALL' })
});

// Try bulk insert
console.log('\nInserting users...');
const insertSql = `
INSERT INTO user_profiles (org_id, email, full_name, phone, timezone, locale, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@intime.com', 'System Administrator', '+15550001', 'America/New_York', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'ceo@intime.com', 'Sumanth Rajkumar Nagolu', '+15550002', 'America/New_York', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'cfo@intime.com', 'Sarah Johnson', '+15550003', 'America/New_York', 'en-US', true)
ON CONFLICT (email) DO NOTHING
RETURNING id, email`;

const result = await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ sql: insertSql })
});

const data = await result.json();
console.log('Result:', JSON.stringify(data, null, 2));

// Re-enable triggers
console.log('\nRe-enabling triggers...');
await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ sql: 'ALTER TABLE user_profiles ENABLE TRIGGER ALL' })
});

// Check count
const check = await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ sql: "SELECT COUNT(*)::int as count FROM user_profiles WHERE email LIKE '%@intime.com' AND deleted_at IS NULL" })
});

const checkData = await check.json();
console.log('\nTotal users:', checkData.rows?.[0]?.count || 0);
