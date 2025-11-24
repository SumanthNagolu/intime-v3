import { readFileSync } from 'fs';

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrd2h4bXZ1Z25qd3d3aXVmbWR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQyMDAyNSwiZXhwIjoyMDc4OTk2MDI1fQ.tQUz_5hccWbYV338i-fV-X5aL5tzw5zwspZNFKD-4Tk';
const EDGE_FUNCTION_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql';

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...');
    const sql = readFileSync('supabase/migrations/20251121090000_create_event_admin_functions.sql', 'utf8');

    console.log('🚀 Executing SQL via Supabase Edge Function...\n');

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Migration applied successfully!');
      console.log(`   Rows affected: ${result.rowCount || 0}`);
    } else {
      console.error('❌ Migration failed:', result.error);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyMigration();
