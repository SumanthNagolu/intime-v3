import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env.local' })

const DATABASE_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('SUPABASE_DB_URL or DATABASE_URL not found in .env.local')
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/*',
  out: './src/db/schema',
  dbCredentials: {
    url: DATABASE_URL,
  },
  // Only introspect the public schema
  schemaFilter: ['public'],
  // Verbose output
  verbose: true,
  // Strict mode
  strict: true,
})
