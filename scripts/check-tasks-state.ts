import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const { db } = await import('../src/lib/db');
const { sql } = await import('drizzle-orm');

async function check() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                  DATABASE TABLES STATE                      ');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Check if lead_tasks table exists
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'lead_tasks'
    );
  `);
  console.log('📋 lead_tasks table exists:', result.rows[0].exists);

  // Check if activities table exists
  const result2 = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'activities'
    );
  `);
  console.log('📋 activities table exists:', result2.rows[0].exists);

  // Count records in each
  if (result.rows[0].exists) {
    const count1 = await db.execute(sql`SELECT COUNT(*) FROM lead_tasks`);
    console.log('   └─ lead_tasks count:', count1.rows[0].count);
  }
  if (result2.rows[0].exists) {
    const count2 = await db.execute(sql`SELECT COUNT(*) FROM activities`);
    console.log('   └─ activities count:', count2.rows[0].count);
    
    // Show activities with type 'task'
    const tasks = await db.execute(sql`SELECT * FROM activities WHERE activity_type = 'task'`);
    console.log('   └─ activities with type "task":', tasks.rows.length);
  }

  process.exit(0);
}

check();



















