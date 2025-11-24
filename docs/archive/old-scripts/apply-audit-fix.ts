#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-sql`;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Applying Fixed Audit Trigger Migration                  ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const migrationPath = path.join(__dirname, '../supabase/migrations/20251122000000_fix_audit_trigger.sql');
const sql = fs.readFileSync(migrationPath, 'utf-8');

console.log('📄 Running migration: 20251122000000_fix_audit_trigger.sql\n');

const result = await fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ sql }),
});

const data = await result.json();

if (data.success) {
  console.log('✅ Migration applied successfully!\n');
} else {
  console.log('❌ Migration failed:', data.error, '\n');
  process.exit(1);
}
