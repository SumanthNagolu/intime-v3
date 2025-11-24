import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
  console.log('\n🔍 Verifying Academy Tables...\n');

  const tables = ['courses', 'course_modules', 'module_topics', 'topic_lessons'];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      console.log(`✅ ${table}: EXISTS (${count || 0} rows)`);
    }
  }

  console.log('\n✅ Verification complete!\n');
}

verify();
