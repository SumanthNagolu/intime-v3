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

async function fixAuditConstraint() {
  console.log('\n🔧 Fixing audit log constraint...\n');

  const sql = 'ALTER TABLE audit_logs ALTER COLUMN org_id DROP NOT NULL;';

  console.log('📝 Executing SQL:', sql);
  console.log('');

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
      console.log('\n💡 The edge function might not exist. Trying alternative method...\n');
      return false;
    }

    console.log(`✅ Successfully made org_id nullable in audit_logs`);
    console.log('\n🎉 Now you can create user profiles!\n');
    return true;
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    console.log('\n💡 Tip: The execute-sql edge function might not be deployed.\n');
    return false;
  }
}

fixAuditConstraint().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
