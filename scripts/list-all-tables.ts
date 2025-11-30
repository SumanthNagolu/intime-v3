/**
 * List all tables in production database
 */

const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

async function listAllTables() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const response = await fetch(
    'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
      }),
    }
  );

  const result = await response.json();

  console.log(`\n${BOLD}${BLUE}All Tables in Production Database:${RESET}\n`);

  if (result.success) {
    // The result might be in rows or a different format
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.error('Error:', result.error);
  }
}

listAllTables().catch(console.error);
