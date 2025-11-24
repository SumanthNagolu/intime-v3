import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrd2h4bXZ1Z25qd3d3aXVmbWR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQyMDAyNSwiZXhwIjoyMDc4OTk2MDI1fQ.tQUz_5hccWbYV338i-fV-X5aL5tzw5zwspZNFKD-4Tk';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' }
});

console.log('🔧 Applying audit log fix via migration file...\n');

// Read the migration SQL
const migrationSQL = readFileSync('./supabase/migrations/20251121120000_fix_audit_log_trigger.sql', 'utf8');

console.log('📄 Migration file loaded');
console.log('📝 SQL to execute:\n');
console.log(migrationSQL);
console.log('\n---\n');

// Since we can't execute raw SQL via the client, let's try via psql
console.log('⚠️  Note: This script displays the SQL. Please run it manually:\n');
console.log('psql "postgresql://postgres.gkwhxmvugnjwwwiufmdy:TIfyrFR8Q3fFywZZ@aws-0-us-west-1.pooler.supabase.com:6543/postgres" -c "ALTER TABLE audit_logs ALTER COLUMN org_id DROP NOT NULL;"\n');
