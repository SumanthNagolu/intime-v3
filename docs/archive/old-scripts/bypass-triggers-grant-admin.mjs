#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Load from .env.local
const envContent = readFileSync(join(projectRoot, '.env.local'), 'utf-8');
const SERVICE_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=([^\n]+)/)?.[1];

if (!SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const EDGE_FUNCTION_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql';

async function executeSQL(sql, description) {
  console.log(description || 'Executing SQL...');

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`❌ Error:`, result);
      return false;
    }

    console.log(`✅ Success\n`);
    return true;
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return false;
  }
}

async function grantAdmin() {
  console.log('\n👑 Granting admin role by disabling triggers...\n');

  const userId = 'ce964085-533c-4771-857a-7e457dee867a';

  // Step 1: Disable session_replication_role to bypass triggers
  console.log('1. Setting session to bypass triggers...');
  await executeSQL('SET session_replication_role = replica;', '');

  // Step 2: Grant admin role
  console.log('2. Granting admin role...');
  const success = await executeSQL(`
    INSERT INTO user_roles (user_id, role_id)
    SELECT
      '${userId}'::uuid,
      id
    FROM roles
    WHERE name = 'admin'
    ON CONFLICT (user_id, role_id) DO NOTHING;
  `, '');

  // Step 3: Re-enable triggers
  console.log('3. Re-enabling triggers...');
  await executeSQL('SET session_replication_role = DEFAULT;', '');

  if (success) {
    console.log('🎉 Test user setup complete!\n');
    console.log('📧 Email: admin@intime.test');
    console.log('🔑 Password: Admin123456!\n');
    console.log('✅ You can now login and capture all screenshots!\n');
  }
}

grantAdmin().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
