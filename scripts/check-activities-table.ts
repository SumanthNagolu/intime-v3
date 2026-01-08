import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const { db } = await import('../src/lib/db');
const { sql } = await import('drizzle-orm');

const result = await db.execute(sql`
  SELECT column_name, data_type FROM information_schema.columns 
  WHERE table_name = 'activities' ORDER BY ordinal_position;
`);

console.log('Activities table columns:');
console.log(JSON.stringify(result.rows, null, 2));
process.exit(0);
























