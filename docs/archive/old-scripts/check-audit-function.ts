#!/usr/bin/env tsx
const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-sql`;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const result = await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql: `SELECT proname, pg_get_functiondef(oid) as definition
          FROM pg_proc
          WHERE proname = 'log_audit_event'`
  })
});

const data = await result.json();

if (data.success && data.rows?.length > 0) {
  console.log('Found log_audit_event function:\n');
  data.rows.forEach((f: any) => {
    console.log(f.definition);
  });
} else if (data.rows?.length === 0) {
  console.log('❌ log_audit_event function does NOT exist!');
} else {
  console.log('Error:', data.error);
}
