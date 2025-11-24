#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-sql`;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Applying all role assignments...\n');

const sqlPath = path.join(__dirname, 'role-assignments-only.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

// Disable triggers
await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ sql: 'ALTER TABLE user_roles DISABLE TRIGGER ALL' })
});

// Execute all role assignments as one batch
const result = await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ sql })
});

const data = await result.json();

// Re-enable triggers
await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ sql: 'ALTER TABLE user_roles ENABLE TRIGGER ALL' })
});

if (data.success) {
  console.log('✅ Role assignments applied successfully!\n');
} else {
  console.log('❌ Error:', data.error, '\n');
}

// Verify
const verify = await fetch(url, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql: `SELECT r.display_name as role, COUNT(ur.user_id)::int as user_count
          FROM roles r
          LEFT JOIN user_roles ur ON ur.role_id = r.id
          GROUP BY r.id, r.display_name
          HAVING COUNT(ur.user_id) > 0
          ORDER BY r.hierarchy_level, r.name`
  })
});

const verifyData = await verify.json();
if (verifyData.success && verifyData.rows) {
  console.log('📊 Role assignments:\n');
  verifyData.rows.forEach((r: any) => {
    console.log(`   ${r.role.padEnd(35)} ${r.user_count} users`);
  });
}

console.log('\n✅ Done!\n');
