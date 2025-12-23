#!/usr/bin/env tsx
/**
 * Dump the database schema to database/schema.sql
 *
 * This script dumps the current database schema for:
 * - Documentation/reference
 * - Fresh database setup
 *
 * Usage: pnpm db:dump-schema
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const DATABASE_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('Error: SUPABASE_DB_URL or DATABASE_URL not found in .env.local')
  process.exit(1)
}

// Parse database URL
const url = new URL(DATABASE_URL)
const host = url.hostname
const port = url.port || '5432'
const user = url.username
const password = url.password
const database = url.pathname.slice(1)

const outputDir = join(process.cwd(), 'database')
const outputFile = join(outputDir, 'schema.sql')

console.log('┌─────────────────────────────────────────────────────────┐')
console.log('│  🗄️  Database Schema Dump                              │')
console.log('└─────────────────────────────────────────────────────────┘')
console.log('')

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true })
  console.log(`✓ Created directory: ${outputDir}`)
}

console.log(`Dumping schema from: ${host}`)
console.log(`Output: ${outputFile}`)
console.log('')

try {
  // Run pg_dump
  const cmd = `PGPASSWORD='${password}' pg_dump -h ${host} -p ${port} -U ${user} -d ${database} --schema=public --schema-only --no-owner --no-privileges`

  const output = execSync(cmd, {
    encoding: 'utf-8',
    maxBuffer: 50 * 1024 * 1024 // 50MB buffer
  })

  // Remove the \restrict line that pg_dump adds
  const cleanedOutput = output.split('\n').filter(line => !line.startsWith('\\restrict')).join('\n')

  writeFileSync(outputFile, cleanedOutput)

  // Count tables, functions, etc.
  const tableCount = (cleanedOutput.match(/CREATE TABLE/g) || []).length
  const functionCount = (cleanedOutput.match(/CREATE FUNCTION/g) || []).length
  const indexCount = (cleanedOutput.match(/CREATE INDEX/g) || []).length
  const typeCount = (cleanedOutput.match(/CREATE TYPE/g) || []).length

  console.log('✓ Schema dumped successfully!')
  console.log('')
  console.log('📊 Schema Statistics:')
  console.log(`   Tables:    ${tableCount}`)
  console.log(`   Functions: ${functionCount}`)
  console.log(`   Indexes:   ${indexCount}`)
  console.log(`   Types:     ${typeCount}`)
  console.log('')
  console.log(`📁 File size: ${(readFileSync(outputFile).length / 1024 / 1024).toFixed(2)} MB`)

} catch (error) {
  console.error('Error dumping schema:', error)
  process.exit(1)
}
