import { readFileSync } from 'fs';

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrd2h4bXZ1Z25qd3d3aXVmbWR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQyMDAyNSwiZXhwIjoyMDc4OTk2MDI1fQ.tQUz_5hccWbYV338i-fV-X5aL5tzw5zwspZNFKD-4Tk';
const EDGE_FUNCTION_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql';

async function cleanupOldCourse() {
  try {
    console.log('🧹 Cleaning up old Guidewire courses...\n');

    const sql = `
-- Delete enrollments first (to avoid FK constraint violations)
DELETE FROM student_enrollments
WHERE course_id = '11111111-1111-1111-1111-111111111111'
   OR course_id IN (SELECT id FROM courses WHERE slug IN ('guidewire-developer', 'guidewire-policycenter-introduction'));

-- Delete old Guidewire courses (cascades to all related data)
DELETE FROM courses
WHERE id = '11111111-1111-1111-1111-111111111111'
   OR slug IN ('guidewire-developer', 'guidewire-policycenter-introduction');
`;

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
      console.log('✅ Old courses deleted successfully!');
      console.log('   Ready to seed fresh data.\n');
    } else {
      console.error('❌ Cleanup failed:', result.error);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupOldCourse();
