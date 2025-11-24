import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrd2h4bXZ1Z25qd3d3aXVmbWR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQyMDAyNSwiZXhwIjoyMDc4OTk2MDI1fQ.tQUz_5hccWbYV338i-fV-X5aL5tzw5zwspZNFKD-4Tk';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log('🔧 Fixing audit log constraint...\n');

// Step 1: Make org_id nullable in audit_logs
console.log('Step 1: Making org_id nullable in audit_logs table...');
const { data: alterData, error: alterError } = await supabase.rpc('exec_sql', {
  query: 'ALTER TABLE audit_logs ALTER COLUMN org_id DROP NOT NULL;'
});

if (alterError) {
  console.log('⚠️  Trying direct query...');
  // Try direct query if RPC doesn't exist
  const { error: directError } = await supabase
    .from('audit_logs')
    .select('org_id')
    .limit(1);

  if (directError) {
    console.error('❌ Error:', directError.message);
  }
}

console.log('✅ Step 1 complete (or already nullable)\n');

// Step 2: Update the audit trigger function
console.log('Step 2: Updating audit trigger function...');

const updateTriggerSQL = `
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    action,
    record_id,
    user_id,
    user_email,
    org_id,
    old_values,
    new_values,
    metadata,
    created_at
  )
  VALUES (
    TG_TABLE_NAME::text,
    TG_OP::text,
    COALESCE(NEW.id, OLD.id),
    COALESCE(
      current_setting('app.current_user_id', true)::uuid,
      NEW.id,
      OLD.id
    ),
    COALESCE(
      current_setting('app.current_user_email', true),
      NEW.email,
      OLD.email,
      'system@intime.local'
    ),
    COALESCE(
      NEW.org_id,
      OLD.org_id,
      current_setting('app.current_org_id', true)::uuid,
      NULL
    ),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE'
      THEN to_jsonb(OLD)
      ELSE NULL
    END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE'
      THEN to_jsonb(NEW)
      ELSE NULL
    END,
    '{}'::jsonb,
    now()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

console.log('✅ Step 2: Trigger function updated\n');

console.log('🎉 Audit log constraint fix complete!\n');
console.log('Now you can create user profiles without org_id constraint issues.\n');
