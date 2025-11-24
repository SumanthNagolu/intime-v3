#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrd2h4bXZ1Z25qd3d3aXVmbWR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQyMDAyNSwiZXhwIjoyMDc4OTk2MDI1fQ.tQUz_5hccWbYV338i-fV-X5aL5tzw5zwspZNFKD-4Tk';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log('📋 Fetching user_profiles schema...\n');

// Try to select with all columns to see what exists
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .limit(0);

if (error) {
  console.error('Error:', error.message);
} else {
  console.log('✅ Table exists but is empty (expected)');
  console.log('\n💡 Let me try inserting with minimal fields...\n');
}

// Try minimal insert
const userId = 'ce964085-533c-4771-857a-7e457dee867a';
const { data: profile, error: insertError } = await supabase
  .from('user_profiles')
  .insert({
    id: userId,
    email: 'admin@intime.test',
    full_name: 'Admin Test User',
    org_id: 'a0000000-0000-0000-0000-000000000001',
  })
  .select();

if (insertError) {
  console.log('❌ Error:', insertError.message);
  console.log('Details:', insertError);
} else {
  console.log('✅ Profile created successfully!');
  console.log(profile);
}
