/**
 * Migration Script: Unified Activities
 * 
 * This script migrates data from the old `activity_log` and `lead_tasks` tables
 * to the new unified `activities` table.
 * 
 * Run: npx tsx scripts/migrate-to-unified-activities.ts
 */

// Load environment variables FIRST, before any other imports
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Verify env is loaded
if (!process.env.SUPABASE_DB_URL && !process.env.DATABASE_URL) {
  console.error('❌ SUPABASE_DB_URL or DATABASE_URL not found in .env.local');
  console.log('Tried loading from:', path.resolve(__dirname, '../.env.local'));
  process.exit(1);
}

// Dynamic import AFTER env vars are loaded
const { db } = await import('../src/lib/db');
const { sql } = await import('drizzle-orm');

async function main() {
  console.log('🚀 Starting migration to unified activities...\n');

  // Step 0: Drop existing empty activities table (if exists)
  console.log('🗑️  Step 0: Dropping old activities table (if exists and empty)...');
  await db.execute(sql`DROP TABLE IF EXISTS activities CASCADE;`);
  console.log('✅ Old table dropped\n');

  // Step 1: Create the new activities table
  console.log('📦 Step 1: Creating unified activities table...');
  
  await db.execute(sql`
    -- Create enum types if they don't exist
    DO $$ BEGIN
      CREATE TYPE activity_status AS ENUM ('scheduled', 'open', 'in_progress', 'completed', 'skipped', 'cancelled');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE activity_type_enum AS ENUM ('email', 'call', 'meeting', 'note', 'linkedin_message', 'task', 'follow_up', 'reminder');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE activity_priority AS ENUM ('low', 'medium', 'high', 'urgent');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE activity_outcome AS ENUM ('positive', 'neutral', 'negative');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE activity_direction AS ENUM ('inbound', 'outbound');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS activities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      
      -- Polymorphic association
      entity_type TEXT NOT NULL,
      entity_id UUID NOT NULL,
      
      -- Activity type & status
      activity_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      priority TEXT NOT NULL DEFAULT 'medium',
      
      -- Content
      subject TEXT,
      body TEXT,
      direction TEXT,
      
      -- Timing
      scheduled_at TIMESTAMPTZ,
      due_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      escalation_date TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      skipped_at TIMESTAMPTZ,
      duration_minutes INTEGER,
      
      -- Outcome
      outcome TEXT,
      
      -- Assignment
      assigned_to UUID NOT NULL REFERENCES user_profiles(id),
      performed_by UUID REFERENCES user_profiles(id),
      poc_id UUID REFERENCES point_of_contacts(id),
      
      -- Follow-up chain
      parent_activity_id UUID REFERENCES activities(id),
      
      -- Audit
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by UUID REFERENCES user_profiles(id)
    );
  `);
  console.log('✅ Activities table created\n');

  // Step 2: Create indexes
  console.log('📊 Step 2: Creating indexes...');
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_activities_org_id ON activities(org_id);
    CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
    CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date);
    CREATE INDEX IF NOT EXISTS idx_activities_assigned_to ON activities(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_activities_parent ON activities(parent_activity_id);
    CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
  `);
  console.log('✅ Indexes created\n');

  // Step 3: Enable RLS
  console.log('🔒 Step 3: Enabling Row Level Security...');
  await db.execute(sql`
    ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "activities_org_isolation" ON activities;
    DROP POLICY IF EXISTS "activities_select" ON activities;
    DROP POLICY IF EXISTS "activities_insert" ON activities;
    DROP POLICY IF EXISTS "activities_update" ON activities;
    DROP POLICY IF EXISTS "activities_delete" ON activities;
    
    -- Create RLS policies
    CREATE POLICY "activities_org_isolation" ON activities
      FOR ALL
      USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
  `);
  console.log('✅ RLS enabled\n');

  // Step 4: Migrate data from activity_log
  console.log('📤 Step 4: Migrating data from activity_log...');
  const _activityLogCount = await db.execute(sql`
    INSERT INTO activities (
      id, org_id, entity_type, entity_id, activity_type, status, priority,
      subject, body, direction, due_date, completed_at, duration_minutes,
      outcome, assigned_to, performed_by, poc_id, created_at, updated_at, created_by
    )
    SELECT 
      al.id,
      al.org_id,
      al.entity_type,
      al.entity_id,
      al.activity_type,
      'completed' as status,  -- All activity_log entries are completed activities
      'medium' as priority,
      al.subject,
      al.body,
      al.direction,
      COALESCE(al.activity_date, al.created_at) as due_date,
      al.activity_date as completed_at,
      al.duration_minutes,
      al.outcome,
      COALESCE(al.performed_by, (SELECT id FROM user_profiles WHERE org_id = al.org_id LIMIT 1)) as assigned_to,
      al.performed_by,
      al.poc_id,
      al.created_at,
      al.created_at as updated_at,
      al.performed_by as created_by
    FROM activity_log al
    WHERE NOT EXISTS (
      SELECT 1 FROM activities a WHERE a.id = al.id
    )
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log(`✅ Migrated activities from activity_log\n`);

  // Step 5: Migrate data from lead_tasks
  console.log('📤 Step 5: Migrating data from lead_tasks...');
  await db.execute(sql`
    INSERT INTO activities (
      org_id, entity_type, entity_id, activity_type, status, priority,
      subject, body, due_date, completed_at, assigned_to, performed_by,
      created_at, updated_at, created_by
    )
    SELECT 
      lt.org_id,
      'lead' as entity_type,
      lt.lead_id as entity_id,
      'task' as activity_type,
      CASE 
        WHEN lt.deleted_at IS NOT NULL THEN 'cancelled'
        WHEN lt.completed THEN 'completed'
        ELSE 'open'
      END as status,
      lt.priority,
      lt.title as subject,
      lt.description as body,
      lt.due_date::timestamptz as due_date,
      lt.completed_at,
      COALESCE(lt.assigned_to, lt.created_by, (SELECT id FROM user_profiles WHERE org_id = lt.org_id LIMIT 1)) as assigned_to,
      lt.completed_by as performed_by,
      lt.created_at,
      lt.updated_at,
      lt.created_by
    FROM lead_tasks lt
    WHERE lt.id NOT IN (
      SELECT id FROM activities WHERE activity_type = 'task'
    );
  `);
  console.log(`✅ Migrated tasks from lead_tasks\n`);

  // Step 6: Create follow-up activities from next_action in activity_log
  console.log('📤 Step 6: Creating follow-up activities from next_action...');
  await db.execute(sql`
    INSERT INTO activities (
      org_id, entity_type, entity_id, activity_type, status, priority,
      subject, due_date, assigned_to, parent_activity_id,
      created_at, updated_at, created_by
    )
    SELECT 
      al.org_id,
      al.entity_type,
      al.entity_id,
      'follow_up' as activity_type,
      CASE 
        WHEN al.next_action_date < NOW() THEN 'open'
        ELSE 'scheduled'
      END as status,
      'medium' as priority,
      al.next_action as subject,
      COALESCE(al.next_action_date, NOW() + INTERVAL '3 days') as due_date,
      COALESCE(al.performed_by, (SELECT id FROM user_profiles WHERE org_id = al.org_id LIMIT 1)) as assigned_to,
      al.id as parent_activity_id,
      al.created_at,
      al.created_at as updated_at,
      al.performed_by as created_by
    FROM activity_log al
    WHERE al.next_action IS NOT NULL 
      AND al.next_action != ''
      AND al.id IN (SELECT id FROM activities);  -- Only for migrated activities
  `);
  console.log(`✅ Created follow-up activities\n`);

  // Step 7: Add trigger for updated_at
  console.log('⚙️ Step 7: Creating updated_at trigger...');
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION update_activities_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS activities_updated_at ON activities;
    CREATE TRIGGER activities_updated_at
      BEFORE UPDATE ON activities
      FOR EACH ROW
      EXECUTE FUNCTION update_activities_updated_at();
  `);
  console.log('✅ Trigger created\n');

  // Step 8: Summary
  console.log('📊 Migration Summary:');
  const counts = await db.execute(sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      COUNT(*) FILTER (WHERE status = 'open') as open,
      COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
      COUNT(*) FILTER (WHERE activity_type = 'task') as tasks,
      COUNT(*) FILTER (WHERE activity_type = 'follow_up') as follow_ups
    FROM activities;
  `);
  
  if (counts.rows && counts.rows[0]) {
    const stats = counts.rows[0] as Record<string, number>;
    console.log(`  Total activities: ${stats.total}`);
    console.log(`  - Completed: ${stats.completed}`);
    console.log(`  - Open: ${stats.open}`);
    console.log(`  - Scheduled: ${stats.scheduled}`);
    console.log(`  - Tasks (from lead_tasks): ${stats.tasks}`);
    console.log(`  - Follow-ups (from next_action): ${stats.follow_ups}`);
  }

  console.log('\n✅ Migration completed successfully!');
  console.log('\n⚠️  IMPORTANT: After verifying the migration, you can optionally:');
  console.log('   1. Keep activity_log and lead_tasks as backup');
  console.log('   2. Or drop them with: DROP TABLE activity_log, lead_tasks;');
  
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});

