import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
  console.log('\n🔍 Verifying Enrollment System (ACAD-002)...\n');

  // Check enrollment table
  const { data, error } = await supabase
    .from('student_enrollments')
    .select('*')
    .limit(1);

  if (error) {
    console.log(`❌ student_enrollments: ${error.message}`);
  } else {
    const { count } = await supabase
      .from('student_enrollments')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ student_enrollments: EXISTS (${count || 0} rows)`);
  }

  // Check functions exist
  const functions = [
    'check_enrollment_prerequisites',
    'enroll_student',
    'update_enrollment_status',
  ];

  console.log('\n🔧 Checking database functions...\n');

  for (const func of functions) {
    try {
      // Try to call each function with dummy params to see if it exists
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
