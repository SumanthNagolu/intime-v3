#!/usr/bin/env tsx
/**
 * Post-introspect script to fix circular references in Drizzle schema
 *
 * This script applies two fixes for circular reference issues:
 * 1. Adds `as AnyPgColumn` to forward references in foreignColumns
 * 2. Adds explicit return type annotations to table callbacks
 *
 * Run: pnpm tsx scripts/fix-schema-circular-refs.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const SCHEMA_PATH = path.join(process.cwd(), 'src/db/schema/schema.ts')

// Tables that have circular dependencies and need callback return type annotations
const CIRCULAR_TABLES = ['contacts', 'offers', 'deals', 'submissions', 'placements']

interface TableInfo {
  name: string
  lineNumber: number
}

function main() {
  console.log('🔧 Fixing circular references in schema.ts...')

  let content = fs.readFileSync(SCHEMA_PATH, 'utf-8')
  const lines = content.split('\n')

  // Step 1: Find all table definitions and their line numbers
  const tables: TableInfo[] = []
  const tableDefRegex = /^export const (\w+) = pgTable\(/

  lines.forEach((line, index) => {
    const match = line.match(tableDefRegex)
    if (match) {
      tables.push({ name: match[1], lineNumber: index + 1 })
    }
  })

  console.log(`Found ${tables.length} table definitions`)

  // Step 2: Fix forward references and callback return types
  let forwardRefCount = 0
  let callbackFixCount = 0

  // Track which table we're currently inside
  let currentTable: string | null = null

  const newLines = lines.map((line, index) => {
    const lineNumber = index + 1

    // Check if we're entering a new table definition
    const tableMatch = line.match(/^export const (\w+) = pgTable\(/)
    if (tableMatch) {
      currentTable = tableMatch[1]
    }

    // Fix forward references in foreignColumns
    const foreignColMatch = line.match(/foreignColumns: \[(\w+)\.(\w+)\]/)
    if (foreignColMatch && !line.includes('as AnyPgColumn')) {
      const referencedTable = foreignColMatch[1]
      const tableInfo = tables.find(t => t.name === referencedTable)

      if (tableInfo && tableInfo.lineNumber > lineNumber) {
        forwardRefCount++
        line = line.replace(
          /foreignColumns: \[(\w+)\.(\w+)\]/,
          'foreignColumns: [$1.$2 as AnyPgColumn]'
        )
      }
    }

    // Fix callback return types for circular tables
    // Match: }, (table) => [
    if (currentTable && CIRCULAR_TABLES.includes(currentTable)) {
      if (line.match(/^\}, \(table\) => \[/) && !line.includes(': unknown[]')) {
        callbackFixCount++
        line = line.replace(
          /^\}, \(table\) => \[/,
          '}, (table): unknown[] => ['
        )
      }
    }

    return line
  })

  content = newLines.join('\n')
  fs.writeFileSync(SCHEMA_PATH, content)

  console.log(`✅ Fixed ${forwardRefCount} forward references with AnyPgColumn`)
  console.log(`✅ Fixed ${callbackFixCount} callback return types with explicit annotation`)
}

main()
