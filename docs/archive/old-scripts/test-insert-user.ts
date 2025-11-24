#!/usr/bin/env tsx
const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-sql`;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const result = await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql: `INSERT INTO user_profiles (org_id, email, full_name, phone, timezone, locale, is_active)
          VALUES ('00000000-0000-0000-0000-000000000001', 'testuser123@intime.com', 'Test User', '+15551234567', 'America/New_York', 'en-US', true)
          RETURNING id, email`
  })
});

const data = await result.json();
console.log('Insert result:',JSON.stringify(data, null, 2));

// Check if it exists
const check = await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql: `SELECT id, email FROM user_profiles WHERE email = 'testuser123@intime.com'`
  })
});

const checkData = await check.json();
console.log('\nUser exists:', checkData.success && checkData.rows?.length > 0);
