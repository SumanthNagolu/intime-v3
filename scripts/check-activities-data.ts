import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const { db } = await import('../src/lib/db');
const { sql } = await import('drizzle-orm');

const result = await db.execute(sql`SELECT COUNT(*) as count FROM activities;`);
console.log('Activities count:', result.rows[0]);

const sample = await db.execute(sql`SELECT * FROM activities LIMIT 3;`);
console.log('Sample activities:', JSON.stringify(sample.rows, null, 2));

process.exit(0);














