import { readFileSync } from 'fs';

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrd2h4bXZ1Z25qd3d3aXVmbWR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQyMDAyNSwiZXhwIjoyMDc4OTk2MDI1fQ.tQUz_5hccWbYV338i-fV-X5aL5tzw5zwspZNFKD-4Tk';
const EDGE_FUNCTION_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql';

async function seedGuidewireCourse() {
  try {
    console.log('📦 Reading Guidewire PolicyCenter seed file...');
    const sql = readFileSync('scripts/seed-guidewire-policycenter-final.sql', 'utf8');

    console.log('📝 Seed file stats:');
    console.log(`   - File size: ${(sql.length / 1024).toFixed(2)} KB`);
    console.log(`   - Lines: ${sql.split('\n').length}`);

    console.log('\n🚀 Executing SQL via Supabase Edge Function...\n');

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
      console.log('✅ Guidewire PolicyCenter course seeded successfully!\n');
      console.log('📊 Results:');
      console.log(`   - Rows affected: ${result.rowCount || 0}`);
      console.log(`   - Course: Guidewire PolicyCenter Introduction`);
      console.log(`   - Module: PolicyCenter Fundamentals`);
      console.log(`   - Topics: 5 (Accounts, Policy Transactions, Policy Files, Product Model, Full Application)`);
      console.log(`   - Lessons: 19 total`);
      console.log(`   - Test student: student@intime.com (enrolled)`);
      console.log('\n✨ Ready to test! Login with:');
      console.log('   Email: student@intime.com');
      console.log('   Password: password123');
    } else {
      console.error('❌ Seeding failed:', result.error);
      if (result.error?.message) {
        console.error('   Error message:', result.error.message);
      }
      if (result.error?.detail) {
        console.error('   Detail:', result.error.detail);
      }
      if (result.error?.hint) {
        console.error('   Hint:', result.error.hint);
      }
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
    process.exit(1);
  }
}

seedGuidewireCourse();
