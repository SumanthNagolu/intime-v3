/**
 * Deploy Admin Helper Functions
 */

import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function deploy() {
  const sql = readFileSync(
    'supabase/migrations/20251121140000_create_admin_helper_functions.sql',
    'utf8'
  );

  const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  const result = await response.json();

  if (result.success) {
    console.log('✅ Admin helper functions deployed');
  } else {
    console.error('❌ Deployment failed:', result.error);
    process.exit(1);
  }
}

deploy();
