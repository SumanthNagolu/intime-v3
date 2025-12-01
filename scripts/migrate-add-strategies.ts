/**
 * Migration: Add Strategy Tables
 * 
 * Creates lead_strategies and talking_point_templates tables.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!process.env.SUPABASE_DB_URL && !process.env.DATABASE_URL) {
  console.error('❌ SUPABASE_DB_URL or DATABASE_URL not found');
  process.exit(1);
}

const { db } = await import('../src/lib/db');
const { sql } = await import('drizzle-orm');

async function main() {
  console.log('🚀 Creating Strategy tables...\n');

  // Create lead_strategies table
  console.log('📦 Creating lead_strategies table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS lead_strategies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      
      -- Strategy notes
      strategy_notes TEXT,
      
      -- JSON fields for complex data
      talking_points JSONB DEFAULT '[]'::jsonb,
      value_proposition TEXT,
      differentiators JSONB DEFAULT '[]'::jsonb,
      objections JSONB DEFAULT '[]'::jsonb,
      stakeholders JSONB DEFAULT '[]'::jsonb,
      competitors JSONB DEFAULT '[]'::jsonb,
      win_themes JSONB DEFAULT '[]'::jsonb,
      pain_points JSONB DEFAULT '[]'::jsonb,
      meeting_agenda JSONB DEFAULT '[]'::jsonb,
      questions_to_ask JSONB DEFAULT '[]'::jsonb,
      desired_outcomes JSONB DEFAULT '[]'::jsonb,
      
      -- Audit
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by UUID REFERENCES user_profiles(id),
      updated_by UUID REFERENCES user_profiles(id),
      
      -- Unique constraint: one strategy per lead
      UNIQUE(lead_id)
    );
  `);
  console.log('✅ lead_strategies table created\n');

  // Create talking_point_templates table
  console.log('📦 Creating talking_point_templates table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS talking_point_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      
      talking_points JSONB DEFAULT '[]'::jsonb,
      
      is_default BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by UUID REFERENCES user_profiles(id)
    );
  `);
  console.log('✅ talking_point_templates table created\n');

  // Create indexes
  console.log('📊 Creating indexes...');
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_lead_strategies_org ON lead_strategies(org_id);
    CREATE INDEX IF NOT EXISTS idx_lead_strategies_lead ON lead_strategies(lead_id);
    CREATE INDEX IF NOT EXISTS idx_talking_point_templates_org ON talking_point_templates(org_id);
  `);
  console.log('✅ Indexes created\n');

  // Enable RLS
  console.log('🔒 Enabling Row Level Security...');
  await db.execute(sql`
    ALTER TABLE lead_strategies ENABLE ROW LEVEL SECURITY;
    ALTER TABLE talking_point_templates ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "lead_strategies_org_isolation" ON lead_strategies;
    CREATE POLICY "lead_strategies_org_isolation" ON lead_strategies
      FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
    
    DROP POLICY IF EXISTS "talking_point_templates_org_isolation" ON talking_point_templates;
    CREATE POLICY "talking_point_templates_org_isolation" ON talking_point_templates
      FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
  `);
  console.log('✅ RLS enabled\n');

  // Create updated_at trigger
  console.log('⚙️ Creating triggers...');
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION update_lead_strategies_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS lead_strategies_updated_at ON lead_strategies;
    CREATE TRIGGER lead_strategies_updated_at
      BEFORE UPDATE ON lead_strategies
      FOR EACH ROW
      EXECUTE FUNCTION update_lead_strategies_updated_at();
  `);
  console.log('✅ Triggers created\n');

  console.log('✅ Strategy tables migration completed!');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});










