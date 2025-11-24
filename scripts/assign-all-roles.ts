#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Assigning Roles to All Test Users                       ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Read and execute role assignments from the seed file
const seedPath = path.join(__dirname, 'seed-comprehensive-test-data.sql');
const seedSql = fs.readFileSync(seedPath, 'utf-8');

// Extract just the role assignment section (STEP 4)
const step4Start = seedSql.indexOf('-- STEP 4: Assign Roles to Users');
const step5Start = seedSql.indexOf('-- ============================================================================', step4Start + 50);
const roleAssignmentsSql = seedSql.substring(step4Start, step5Start);

// Split into individual INSERT statements
const statements = roleAssignmentsSql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.startsWith('INSERT INTO user_roles'));

console.log(`Found ${statements.length} role assignment statements\n`);

let success = 0;
let failed = 0;

// Disable triggers
await exec('ALTER TABLE user_roles DISABLE TRIGGER ALL');

for (const stmt of statements) {
  const result = await exec(stmt);
  if (result.success) {
    success++;
    if (result.rowCount > 0) {
      process.stdout.write('✓');
    } else {
      process.stdout.write('.');
    }
  } else {
    failed++;
    process.stdout.write('✗');
  }
}

// Re-enable triggers
await exec('ALTER TABLE user_roles ENABLE TRIGGER ALL');

console.log(`\n\n   ✅ Success: ${success}`);
console.log(`   ❌ Failed: ${failed}`);

// Verify
const verify = await exec(`
  SELECT r.display_name as role, COUNT(ur.user_id)::int as user_count
  FROM roles r
  LEFT JOIN user_roles ur ON ur.role_id = r.id
  GROUP BY r.id, r.display_name
  HAVING COUNT(ur.user_id) > 0
  ORDER BY COUNT(ur.user_id) DESC
`);

if (verify.success && verify.rows) {
  console.log('\n📊 Role assignments:');
  verify.rows.forEach((r: any) => {
    console.log(`   ${r.role.padEnd(35)} ${r.user_count} users`);
  });
}

console.log('\n✅ Done!\n');
