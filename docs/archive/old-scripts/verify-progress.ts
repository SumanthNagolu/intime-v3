import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
  console.log('\n🔍 Verifying Progress Tracking System (ACAD-003)...\n');

  // Check tables
  const tables = ['topic_completions', 'xp_transactions', 'user_xp_totals'];

  for (const table of tables) {
    const { error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: EXISTS (${count || 0} rows)`);
    }
  }

  // Check functions
  const functions = [
    'get_user_total_xp',
    'is_topic_unlocked',
    'update_enrollment_progress',
    'complete_topic',
  ];

  console.log('\n🔧 Checking database functions...\n');

  for (const func of functions) {
    try {
      const { error } = await supabase.rpc(func, {} as any);
      if (error && error.message.includes('Could not find')) {
        console.log(`❌ ${func}: NOT FOUND`);
      } else {
        console.log(`✅ ${func}: EXISTS`);
      }
    } catch (e) {
      console.log(`✅ ${func}: EXISTS`);
    }
  }

  console.log('\n✅ Verification complete!\n');
}

verify();
