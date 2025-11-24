import { readFileSync } from 'fs';

const sql = readFileSync('supabase/migrations/20251121140001_add_traffic_percentage_constraint.sql', 'utf8');

async function deploy() {
  const response = await fetch('https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  const result = await response.json();
  console.log(result.success ? '✅ Traffic constraint deployed' : '❌ Failed: ' + result.error);
  process.exit(result.success ? 0 : 1);
}

deploy();
