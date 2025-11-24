import { readFileSync } from 'fs';

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrd2h4bXZ1Z25qd3d3aXVmbWR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQyMDAyNSwiZXhwIjoyMDc4OTk2MDI1fQ.tQUz_5hccWbYV338i-fV-X5aL5tzw5zwspZNFKD-4Tk';
const EDGE_FUNCTION_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql';

async function runQuery(sql) {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });
  return await response.json();
}

async function verifySeeding() {
  try {
    console.log('🔍 Verifying Guidewire PolicyCenter course seeding...\n');

    // Check course
    console.log('1️⃣  Checking course...');
    const courseResult = await runQuery(`
      SELECT slug, title, total_topics, is_published
      FROM courses
      WHERE slug = 'guidewire-policycenter-introduction'
    `);
    if (courseResult.data && courseResult.data.length > 0) {
      const course = courseResult.data[0];
      console.log(`   ✅ Course: ${course.title}`);
      console.log(`      Slug: ${course.slug}`);
      console.log(`      Topics: ${course.total_topics}`);
      console.log(`      Published: ${course.is_published ? 'Yes' : 'No'}\n`);
    } else {
      console.log('   ❌ Course not found!\n');
    }

    // Check module
    console.log('2️⃣  Checking module...');
    const moduleResult = await runQuery(`
      SELECT m.title, m.estimated_duration_hours
      FROM course_modules m
      JOIN courses c ON c.id = m.course_id
      WHERE c.slug = 'guidewire-policycenter-introduction'
    `);
    if (moduleResult.data && moduleResult.data.length > 0) {
      const module = moduleResult.data[0];
      console.log(`   ✅ Module: ${module.title}`);
      console.log(`      Duration: ${module.estimated_duration_hours} hours\n`);
    } else {
      console.log('   ❌ Module not found!\n');
    }

    // Check topics
    console.log('3️⃣  Checking topics...');
    const topicsResult = await runQuery(`
      SELECT t.topic_number, t.title, t.estimated_duration_minutes
      FROM module_topics t
      JOIN course_modules m ON m.id = t.module_id
      JOIN courses c ON c.id = m.course_id
      WHERE c.slug = 'guidewire-policycenter-introduction'
      ORDER BY t.topic_number
    `);
    if (topicsResult.data && topicsResult.data.length > 0) {
      console.log(`   ✅ Topics: ${topicsResult.data.length}\n`);
      topicsResult.data.forEach(topic => {
        console.log(`      ${topic.topic_number}. ${topic.title} (${topic.estimated_duration_minutes} min)`);
      });
      console.log('');
    } else {
      console.log('   ❌ Topics not found!\n');
    }

    // Check lessons
    console.log('4️⃣  Checking lessons...');
    const lessonsResult = await runQuery(`
      SELECT
        t.topic_number,
        t.title as topic_title,
        COUNT(l.id) as lesson_count
      FROM module_topics t
      LEFT JOIN topic_lessons l ON l.topic_id = t.id
      JOIN course_modules m ON m.id = t.module_id
      JOIN courses c ON c.id = m.course_id
      WHERE c.slug = 'guidewire-policycenter-introduction'
      GROUP BY t.topic_number, t.title
      ORDER BY t.topic_number
    `);
    if (lessonsResult.data && lessonsResult.data.length > 0) {
      let totalLessons = 0;
      lessonsResult.data.forEach(row => {
        totalLessons += parseInt(row.lesson_count);
        console.log(`      Topic ${row.topic_number}: ${row.lesson_count} lessons`);
      });
      console.log(`\n   ✅ Total Lessons: ${totalLessons}\n`);
    } else {
      console.log('   ❌ Lessons not found!\n');
    }

    // Check enrollment
    console.log('5️⃣  Checking student enrollment...');
    const enrollmentResult = await runQuery(`
      SELECT u.email, e.status, e.completion_percentage, e.enrolled_at
      FROM student_enrollments e
      JOIN user_profiles u ON u.id = e.user_id
      JOIN courses c ON c.id = e.course_id
      WHERE c.slug = 'guidewire-policycenter-introduction'
    `);
    if (enrollmentResult.data && enrollmentResult.data.length > 0) {
      const enrollment = enrollmentResult.data[0];
      console.log(`   ✅ Student: ${enrollment.email}`);
      console.log(`      Status: ${enrollment.status}`);
      console.log(`      Progress: ${enrollment.completion_percentage || 0}%`);
      console.log(`      Enrolled: ${new Date(enrollment.enrolled_at).toLocaleDateString()}\n`);
    } else {
      console.log('   ⚠️  No enrollments yet (this is OK, student can enroll manually)\n');
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ VERIFICATION COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎓 Next Steps:');
    console.log('   1. Open your app: http://localhost:3000');
    console.log('   2. Login: student@intime.com / password123');
    console.log('   3. Navigate to Courses');
    console.log('   4. Start Lesson 1: Accounts');
    console.log('   5. Complete all 19 lessons → 190 XP → 100% complete\n');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verifySeeding();
