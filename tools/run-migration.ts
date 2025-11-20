import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function runMigration() {
    if (!process.env.SUPABASE_DB_URL) {
        console.error('Error: SUPABASE_DB_URL is not defined in .env.local');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.SUPABASE_DB_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const migrationFile = 'src/lib/db/migrations/007_add_multi_tenancy.sql';
        const migrationPath = path.join(process.cwd(), migrationFile);

        if (!fs.existsSync(migrationPath)) {
            console.error(`Error: Migration file not found at ${migrationPath}`);
            process.exit(1);
        }

        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log(`Running migration: ${migrationFile}`);
        await client.query(sql);
        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Error running migration:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
