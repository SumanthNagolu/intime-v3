/**
 * Seed Activity Patterns
 * 
 * This script seeds all activity patterns into the database.
 * Run with: npx tsx scripts/seed-activity-patterns.ts
 * 
 * Options:
 *   --org-id=<uuid>    Seed patterns for specific org (required)
 *   --dry-run          Preview without inserting
 *   --clear            Clear existing patterns before seeding
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

// Import all pattern definitions
import {
  CANDIDATE_PATTERNS,
  JOB_PATTERNS,
  SUBMISSION_PATTERNS,
  INTERVIEW_PATTERNS,
  PLACEMENT_PATTERNS,
  type ActivityPatternSeed,
} from '../src/configs/activity-patterns-seed'

import {
  ACCOUNT_PATTERNS,
  CONTACT_PATTERNS,
  LEAD_PATTERNS,
  DEAL_PATTERNS,
  CONSULTANT_PATTERNS,
  VENDOR_PATTERNS,
  GENERAL_PATTERNS,
} from '../src/configs/activity-patterns-seed-part2'

// ============================================
// CONFIGURATION
// ============================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

// ============================================
// ALL PATTERNS COMBINED
// ============================================

const ALL_PATTERNS: ActivityPatternSeed[] = [
  ...CANDIDATE_PATTERNS,
  ...JOB_PATTERNS,
  ...SUBMISSION_PATTERNS,
  ...INTERVIEW_PATTERNS,
  ...PLACEMENT_PATTERNS,
  ...ACCOUNT_PATTERNS,
  ...CONTACT_PATTERNS,
  ...LEAD_PATTERNS,
  ...DEAL_PATTERNS,
  ...CONSULTANT_PATTERNS,
  ...VENDOR_PATTERNS,
  ...GENERAL_PATTERNS,
]

// ============================================
// HELPER FUNCTIONS
// ============================================

function parseArgs(): { orgId: string | null; dryRun: boolean; clear: boolean } {
  const args = process.argv.slice(2)
  let orgId: string | null = null
  let dryRun = false
  let clear = false

  for (const arg of args) {
    if (arg.startsWith('--org-id=')) {
      orgId = arg.split('=')[1]
    } else if (arg === '--dry-run') {
      dryRun = true
    } else if (arg === '--clear') {
      clear = true
    }
  }

  return { orgId, dryRun, clear }
}

function transformPatternForDb(pattern: ActivityPatternSeed, orgId: string) {
  return {
    org_id: orgId,
    code: pattern.code,
    name: pattern.name,
    description: pattern.description,
    category: pattern.category,
    entity_type: pattern.entityType,
    icon: pattern.icon,
    color: pattern.color,
    target_days: pattern.targetDays,
    priority: pattern.priority,
    outcomes: pattern.outcomes,
    points: pattern.points,
    display_order: pattern.displayOrder,
    is_active: true,
    is_system: true, // Mark as system patterns
    show_in_timeline: true,
    auto_log_integrations: [],
    followup_rules: [],
    field_dependencies: [],
    point_multipliers: [],
  }
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function seedActivityPatterns() {
  console.log('\n🌱 Activity Patterns Seeder')
  console.log('=' .repeat(50))

  const { orgId, dryRun, clear } = parseArgs()

  if (!orgId) {
    console.error('\n❌ Error: --org-id is required')
    console.log('\nUsage:')
    console.log('  npx tsx scripts/seed-activity-patterns.ts --org-id=<uuid>')
    console.log('\nOptions:')
    console.log('  --dry-run    Preview without inserting')
    console.log('  --clear      Clear existing patterns before seeding')
    console.log('\nExample:')
    console.log('  npx tsx scripts/seed-activity-patterns.ts --org-id=abc-123-def --dry-run')
    process.exit(1)
  }

  // Validate org exists
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', orgId)
    .single()

  if (orgError || !org) {
    console.error(`\n❌ Organization not found: ${orgId}`)
    process.exit(1)
  }

  console.log(`\n📍 Organization: ${org.name}`)
  console.log(`   ID: ${orgId}`)
  console.log(`   Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE'}`)
  console.log(`   Clear existing: ${clear ? 'Yes' : 'No'}`)

  // Show pattern counts by category
  console.log('\n📊 Pattern Summary:')
  const categoryCounts: Record<string, number> = {}
  const entityCounts: Record<string, number> = {}
  
  for (const pattern of ALL_PATTERNS) {
    categoryCounts[pattern.category] = (categoryCounts[pattern.category] || 0) + 1
    entityCounts[pattern.entityType] = (entityCounts[pattern.entityType] || 0) + 1
  }

  console.log('\n   By Category:')
  for (const [category, count] of Object.entries(categoryCounts).sort()) {
    console.log(`     ${category}: ${count}`)
  }

  console.log('\n   By Entity Type:')
  for (const [entity, count] of Object.entries(entityCounts).sort()) {
    console.log(`     ${entity}: ${count}`)
  }

  console.log(`\n   Total Patterns: ${ALL_PATTERNS.length}`)

  if (dryRun) {
    console.log('\n🔍 DRY RUN - Patterns to be created:')
    for (const pattern of ALL_PATTERNS.slice(0, 10)) {
      console.log(`   • [${pattern.entityType}] ${pattern.name} (${pattern.code})`)
    }
    if (ALL_PATTERNS.length > 10) {
      console.log(`   ... and ${ALL_PATTERNS.length - 10} more`)
    }
    console.log('\n✅ Dry run complete. No changes made.')
    process.exit(0)
  }

  // Clear existing patterns if requested
  if (clear) {
    console.log('\n🗑️  Clearing existing patterns...')
    
    // First delete pattern fields
    const { error: fieldsError } = await supabase
      .from('pattern_fields')
      .delete()
      .in('pattern_id', 
        supabase
          .from('activity_patterns')
          .select('id')
          .eq('org_id', orgId)
          .eq('is_system', true)
      )

    if (fieldsError) {
      console.log(`   ⚠️  Could not clear pattern fields: ${fieldsError.message}`)
    }

    // Then delete patterns
    const { count: deletedCount, error: deleteError } = await supabase
      .from('activity_patterns')
      .delete({ count: 'exact' })
      .eq('org_id', orgId)
      .eq('is_system', true)

    if (deleteError) {
      console.error(`\n❌ Error clearing patterns: ${deleteError.message}`)
      process.exit(1)
    }

    console.log(`   Deleted ${deletedCount || 0} existing system patterns`)
  }

  // Check for existing patterns (to avoid duplicates)
  const { data: existingPatterns } = await supabase
    .from('activity_patterns')
    .select('code')
    .eq('org_id', orgId)

  const existingCodes = new Set(existingPatterns?.map(p => p.code) || [])

  // Filter out patterns that already exist
  const patternsToCreate = ALL_PATTERNS.filter(p => !existingCodes.has(p.code))
  const skippedCount = ALL_PATTERNS.length - patternsToCreate.length

  if (skippedCount > 0) {
    console.log(`\n⏭️  Skipping ${skippedCount} patterns that already exist`)
  }

  if (patternsToCreate.length === 0) {
    console.log('\n✅ All patterns already exist. Nothing to seed.')
    process.exit(0)
  }

  // Transform patterns for database
  const dbPatterns = patternsToCreate.map(p => transformPatternForDb(p, orgId))

  // Insert patterns in batches
  console.log(`\n📝 Inserting ${patternsToCreate.length} patterns...`)
  
  const BATCH_SIZE = 50
  let insertedCount = 0
  let errorCount = 0

  for (let i = 0; i < dbPatterns.length; i += BATCH_SIZE) {
    const batch = dbPatterns.slice(i, i + BATCH_SIZE)
    
    const { data: inserted, error: insertError } = await supabase
      .from('activity_patterns')
      .insert(batch)
      .select('id, code')

    if (insertError) {
      console.error(`\n❌ Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}: ${insertError.message}`)
      errorCount += batch.length
    } else {
      insertedCount += inserted?.length || 0
      process.stdout.write(`   Progress: ${insertedCount}/${patternsToCreate.length}\r`)
    }
  }

  console.log('\n')

  // Summary
  console.log('=' .repeat(50))
  console.log('📊 Seed Summary:')
  console.log(`   ✅ Inserted: ${insertedCount}`)
  console.log(`   ⏭️  Skipped (existing): ${skippedCount}`)
  if (errorCount > 0) {
    console.log(`   ❌ Errors: ${errorCount}`)
  }
  console.log(`   📦 Total patterns in org: ${insertedCount + skippedCount}`)

  // Verify
  const { count: finalCount } = await supabase
    .from('activity_patterns')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)

  console.log(`\n✅ Verification: ${finalCount} patterns in database for this org`)
  console.log('\n🎉 Seeding complete!')
}

// ============================================
// RUN
// ============================================

seedActivityPatterns().catch((error) => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})

