import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Prevent hot reload from creating too many connections in dev
const globalForDb = globalThis as unknown as {
    conn: Pool | undefined;
};

// Supabase Direct connection (port 5432)
// Use DATABASE_URL or SUPABASE_DB_URL - some tools expect DATABASE_URL
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL!;

if (!connectionString) {
    throw new Error('DATABASE_URL or SUPABASE_DB_URL must be set');
}

// Create a new pool only if one doesn't exist in the global cache
// Force recreation if the connection string has sslmode in it
const conn = globalForDb.conn ?? new Pool({
    connectionString,
    // SSL is handled via sslmode=require in connection string
    // Only set ssl object if sslmode is not in the connection string
    ...(!connectionString.includes('sslmode=') && {
        ssl: {
            rejectUnauthorized: false,
        },
    }),
    // Connection pool settings
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

if (process.env.NODE_ENV !== 'production') {
    globalForDb.conn = conn;
}

export const db = drizzle(conn, { schema });
