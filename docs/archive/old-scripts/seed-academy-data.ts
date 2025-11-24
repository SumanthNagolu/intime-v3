import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedData() {
  console.log('\n🌱 Seeding Academy Data...\n');

  // Course 1: Guidewire
  console.log('📚 Creating Guidewire course...');
  const { data: guidewireCourse, error: courseError } = await supabase
    .from('courses')
    .insert({
      id: '11111111-1111-1111-1111-111111111111',
      slug: 'guidewire-policycenter-development',
      title: 'Guidewire PolicyCenter Development',
      subtitle: 'Master insurance software development in 8 weeks',
      description: 'Transform into a job-ready Guidewire consultant. Learn PolicyCenter configuration, Gosu scripting, integrations, and deliver a portfolio-ready capstone project.',
      estimated_duration_weeks: 8,
      price_monthly: 499.00,
      skill_level: 'beginner',
      is_published: true,
      is_featured: true,
    })
    .select()
    .single();

  if (courseError) {
    console.log(`⚠️  Guidewire course: ${courseError.message}`);
  } else {
    console.log('✅ Guidewire course created');
  }

  // Module 1
  console.log('📖 Creating Module 1...');
  const { data: module1, error: module1Error } = await supabase
    .from('course_modules')
    .insert({
      id: '11111111-1111-1111-1111-111111111101',
      course_id: '11111111-1111-1111-1111-111111111111',
      slug: 'module-1-domain-fundamentals',
      title: 'Module 1: Insurance Domain Fundamentals',
      description: 'Understand insurance industry basics, terminology, and business processes',
      module_number: 1,
      estimated_duration_hours: 10,
      is_published: true,
    })
    .select()
    .single();

  if (module1Error) {
    console.log(`⚠️  Module 1: ${module1Error.message}`);
  } else {
    console.log('✅ Module 1 created');
  }

  // Module 2
  console.log('📖 Creating Module 2...');
  const { data: module2, error: module2Error } = await supabase
    .from('course_modules')
    .insert({
      id: '11111111-1111-1111-1111-111111111102',
      course_id: '11111111-1111-1111-1111-111111111111',
      slug: 'module-2-platform-basics',
      title: 'Module 2: PolicyCenter Platform Basics',
      description: 'PolicyCenter data model, navigation, and core configuration',
      module_number: 2,
      estimated_duration_hours: 12,
      prerequisite_module_ids: ['11111111-1111-1111-1111-111111111101'],
      is_published: true,
    })
    .select()
    .single();

  if (module2Error) {
    console.log(`⚠️  Module 2: ${module2Error.message}`);
  } else {
    console.log('✅ Module 2 created');
  }

  // Topics for Module 1
  console.log('📝 Creating topics for Module 1...');
  const topics = [
    {
      module_id: '11111111-1111-1111-1111-111111111101',
      slug: 'topic-1-1-insurance-basics',
      title: '1.1 Insurance Industry Overview',
      description: 'How insurance companies operate',
      topic_number: 1,
      content_type: 'video',
      estimated_duration_minutes: 45,
      is_published: true,
    },
    {
      module_id: '11111111-1111-1111-1111-111111111101',
      slug: 'topic-1-2-key-terminology',
      title: '1.2 Key Insurance Terminology',
      description: 'Premium, deductible, claim, policy, underwriting',
      topic_number: 2,
      content_type: 'reading',
      estimated_duration_minutes: 30,
      is_published: true,
    },
    {
      module_id: '11111111-1111-1111-1111-111111111101',
      slug: 'topic-1-3-business-processes',
      title: '1.3 Insurance Business Processes',
      description: 'Quote → Bind → Renew → Claim workflow',
      topic_number: 3,
      content_type: 'video',
      estimated_duration_minutes: 60,
      is_published: true,
    },
    {
      module_id: '11111111-1111-1111-1111-111111111101',
      slug: 'topic-1-4-quiz',
      title: '1.4 Module 1 Quiz',
      description: 'Test your insurance fundamentals knowledge',
      topic_number: 4,
      content_type: 'quiz',
      estimated_duration_minutes: 20,
      is_published: true,
    },
  ];

  const { data: topicsData, error: topicsError } = await supabase
    .from('module_topics')
    .insert(topics)
    .select();

  if (topicsError) {
    console.log(`⚠️  Topics: ${topicsError.message}`);
  } else {
    console.log(`✅ Created ${topicsData?.length || 0} topics`);
  }

  // Course 2: Salesforce
  console.log('\n📚 Creating Salesforce course...');
  const { data: salesforceCourse, error: salesforceError } = await supabase
    .from('courses')
    .insert({
      id: '22222222-2222-2222-2222-222222222222',
      slug: 'salesforce-admin-certification',
      title: 'Salesforce Admin Certification',
      subtitle: 'Become a certified Salesforce Administrator',
      description: 'Master Salesforce administration, automation, security, and earn your Admin certification. Hands-on labs with real Salesforce org.',
      estimated_duration_weeks: 6,
      price_monthly: 399.00,
      skill_level: 'beginner',
      is_published: true,
      is_featured: false,
    })
    .select()
    .single();

  if (salesforceError) {
    console.log(`⚠️  Salesforce course: ${salesforceError.message}`);
  } else {
    console.log('✅ Salesforce course created');
  }

  // Course 3: AWS
  console.log('📚 Creating AWS course...');
  const { data: awsCourse, error: awsError } = await supabase
    .from('courses')
    .insert({
      id: '33333333-3333-3333-3333-333333333333',
      slug: 'aws-solutions-architect',
      title: 'AWS Solutions Architect Associate',
      subtitle: 'Master cloud architecture and pass AWS SAA exam',
      description: 'Comprehensive AWS training covering compute, storage, networking, databases, and security. Includes hands-on labs and certification prep.',
      estimated_duration_weeks: 10,
      price_monthly: 599.00,
      price_one_time: 1499.00,
      skill_level: 'intermediate',
      is_published: false,
      is_featured: false,
    })
    .select()
    .single();

  if (awsError) {
    console.log(`⚠️  AWS course: ${awsError.message}`);
  } else {
    console.log('✅ AWS course created');
  }

  // Verify final state
  console.log('\n🔍 Verifying final state...\n');

  const { data: allCourses } = await supabase
    .from('courses')
    .select('slug, title, is_published, is_featured, total_modules, total_topics');

  console.log('📚 Courses in database:');
  console.table(allCourses);

  console.log('\n✅ Seed data complete!\n');
}

seedData();
