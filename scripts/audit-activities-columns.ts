/**
 * Audit activities table columns against spec
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Expected columns from docs/specs/10-DATABASE/11-activities.md
const expectedActivityColumns = [
  'id', 'org_id', 'activity_number',
  'pattern_code', 'pattern_id', 'workplan_instance_id',
  'entity_type', 'entity_id',
  'secondary_entity_type', 'secondary_entity_id',
  'activity_type', 'status', 'priority',
  'subject', 'body', 'description', 'category', 'direction',
  'instructions', 'checklist', 'checklist_progress',
  'assigned_to', 'performed_by', 'assigned_group', 'assigned_at', 'poc_id',
  'scheduled_at', 'due_date', 'escalation_date', 'started_at', 'completed_at', 'skipped_at', 'scheduled_for',
  'duration_minutes',
  'outcome', 'outcome_notes',
  'follow_up_required', 'follow_up_date', 'follow_up_activity_id',
  'auto_created', 'auto_completed',
  'predecessor_activity_id', 'parent_activity_id',
  'escalation_count', 'last_escalated_at',
  'reminder_sent_at', 'reminder_count',
  'deleted_at', 'tags', 'custom_fields',
  'created_at', 'created_by', 'updated_at', 'updated_by'
];

// Expected columns for object_owners from docs/specs/10-DATABASE/12-object-owners.md
const expectedObjectOwnersColumns = [
  'id', 'org_id',
  'entity_type', 'entity_id',
  'user_id', 'role', 'permission', 'is_primary',
  'assigned_at', 'assigned_by', 'assignment_type',
  'notes',
  'created_at', 'updated_at'
];

// Expected columns for sla_definitions
const expectedSlaDefinitionsColumns = [
  'id', 'org_id',
  'sla_name', 'sla_code', 'description',
  'entity_type', 'activity_type', 'activity_category', 'priority',
  'target_hours', 'warning_hours', 'critical_hours',
  'use_business_hours', 'business_hours_start', 'business_hours_end',
  'escalate_on_breach', 'escalate_to_user_id', 'escalate_to_group_id',
  'is_active', 'created_at', 'updated_at'
];

async function getTableColumns(tableName: string): Promise<string[]> {
  // Use Supabase's introspection
  const { data, error } = await supabase
    .from(tableName)
    .select()
    .limit(0);
  
  // The error will contain column info, or we can try another approach
  if (error && error.code === '42501') {
    // RLS blocking, but table exists - try introspection differently
  }
  
  // Alternative: Use a raw query through a function
  // For now, let's just try to insert an empty object and see what fields are expected
  
  return [];
}

async function checkTableStructure(tableName: string, expectedColumns: string[]) {
  console.log(`\n📋 Checking ${tableName.toUpperCase()} table...\n`);
  
  // Try to select with all expected columns
  const selectQuery = expectedColumns.join(', ');
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(selectQuery)
      .limit(1);
    
    if (error) {
      // Parse error to find missing columns
      const match = error.message.match(/column (\w+\.\w+) does not exist/);
      if (match) {
        console.log(`❌ Missing column: ${match[1]}`);
      } else if (error.message.includes('does not exist')) {
        console.log(`❌ Error: ${error.message}`);
      } else {
        console.log(`✅ All expected columns appear to exist (or RLS is blocking)`);
        console.log(`   Note: ${error.message}`);
      }
    } else {
      console.log(`✅ All ${expectedColumns.length} expected columns exist!`);
    }
  } catch (e) {
    console.log(`❌ Error checking ${tableName}:`, e);
  }
  
  // Also check one column at a time to find specific missing ones
  const missingColumns: string[] = [];
  const existingColumns: string[] = [];
  
  for (const col of expectedColumns) {
    try {
      const { error } = await supabase
        .from(tableName)
        .select(col)
        .limit(0);
      
      if (error && error.message.includes('does not exist')) {
        missingColumns.push(col);
      } else {
        existingColumns.push(col);
      }
    } catch (e) {
      missingColumns.push(col);
    }
  }
  
  console.log(`\n   ✅ Existing columns (${existingColumns.length}): ${existingColumns.length > 10 ? existingColumns.slice(0, 10).join(', ') + '...' : existingColumns.join(', ')}`);
  
  if (missingColumns.length > 0) {
    console.log(`   ❌ Missing columns (${missingColumns.length}): ${missingColumns.join(', ')}`);
  }
  
  return { existing: existingColumns, missing: missingColumns };
}

async function main() {
  console.log('🔍 Column Audit Starting...');
  console.log('=' .repeat(60));
  
  const results: { [key: string]: { existing: string[], missing: string[] } } = {};
  
  // Check activities table
  results.activities = await checkTableStructure('activities', expectedActivityColumns);
  
  // Check object_owners table
  results.object_owners = await checkTableStructure('object_owners', expectedObjectOwnersColumns);
  
  // Check sla_definitions table
  results.sla_definitions = await checkTableStructure('sla_definitions', expectedSlaDefinitionsColumns);
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 COLUMN AUDIT SUMMARY:\n');
  
  for (const [table, result] of Object.entries(results)) {
    const status = result.missing.length === 0 ? '✅' : '⚠️';
    console.log(`${status} ${table}: ${result.existing.length} existing, ${result.missing.length} missing`);
    if (result.missing.length > 0) {
      console.log(`   Missing: ${result.missing.join(', ')}`);
    }
  }
  
  // Write results
  const fs = await import('fs');
  const path = await import('path');
  const outputPath = path.join(process.cwd(), 'docs/session/COLUMN-AUDIT-RESULT.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n📁 Results saved to: ${outputPath}`);
}

main().catch(console.error);

