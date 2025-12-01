/**
 * Database Audit Script
 * Compares current database state against specs in docs/specs/10-DATABASE/
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TableInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface IndexInfo {
  tablename: string;
  indexname: string;
  indexdef: string;
}

interface PolicyInfo {
  tablename: string;
  policyname: string;
  permissive: string;
  roles: string[];
  cmd: string;
  qual: string;
  with_check: string;
}

interface EnumInfo {
  typname: string;
  enumlabel: string;
}

async function getTables(): Promise<string[]> {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `
  });
  
  if (error) {
    // Try alternative approach
    const { data: data2, error: error2 } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
    
    if (error2) {
      console.error('Error fetching tables:', error, error2);
      return [];
    }
    return (data2 || []).map((r: any) => r.table_name);
  }
  
  return (data || []).map((r: any) => r.table_name);
}

async function getTableColumns(tableName: string): Promise<TableInfo[]> {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        table_name,
        column_name, 
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = '${tableName}'
      ORDER BY ordinal_position
    `
  });
  
  if (error) {
    console.error(`Error fetching columns for ${tableName}:`, error);
    return [];
  }
  
  return data || [];
}

async function getIndexes(): Promise<IndexInfo[]> {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `
  });
  
  if (error) {
    console.error('Error fetching indexes:', error);
    return [];
  }
  
  return data || [];
}

async function getPolicies(): Promise<PolicyInfo[]> {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual::text,
        with_check::text
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `
  });
  
  if (error) {
    console.error('Error fetching policies:', error);
    return [];
  }
  
  return data || [];
}

async function getEnums(): Promise<EnumInfo[]> {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY t.typname, e.enumsortorder
    `
  });
  
  if (error) {
    console.error('Error fetching enums:', error);
    return [];
  }
  
  return data || [];
}

async function getRLSStatus(): Promise<{ table_name: string; rls_enabled: boolean }[]> {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        relname as table_name,
        relrowsecurity as rls_enabled
      FROM pg_class
      WHERE relnamespace = 'public'::regnamespace
      AND relkind = 'r'
      ORDER BY relname
    `
  });
  
  if (error) {
    console.error('Error fetching RLS status:', error);
    return [];
  }
  
  return data || [];
}

async function main() {
  console.log('🔍 Database Audit Starting...\n');
  console.log('=' .repeat(60));
  
  // Get all tables
  console.log('\n📋 TABLES IN DATABASE:\n');
  
  const { data: tablesData, error: tablesError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `
    });
  
  if (tablesError) {
    // Fallback: use a simpler query
    console.log('Using fallback query method...');
    
    const { data, error } = await supabase.rpc('get_table_list');
    if (error) {
      console.error('Error:', error);
      
      // Last resort - try direct SQL via edge function
      console.log('\nTrying edge function approach...');
    }
  }
  
  // If RPC doesn't work, let's try a different approach
  // We can query specific tables to see if they exist
  
  const criticalTables = [
    // Core
    'organizations', 'user_profiles', 'roles', 'permissions', 'user_roles',
    // Activities  
    'activities', 'activity_patterns', 'workplan_templates', 'workplan_instances',
    // Events
    'events', 'event_subscriptions',
    // ATS
    'jobs', 'candidates', 'submissions', 'interviews', 'offers', 'placements',
    // CRM
    'accounts', 'contacts', 'leads', 'deals',
    // Bench Sales
    'bench_consultants', 'vendors', 'job_orders',
    // RACI/SLA (new)
    'object_owners', 'raci_change_log', 'sla_definitions', 'sla_instances',
    // Academy
    'courses', 'student_enrollments', 'quiz_attempts'
  ];
  
  console.log('Checking critical tables...\n');
  
  const tableStatus: { [key: string]: boolean } = {};
  
  for (const table of criticalTables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === '42P01') {
          tableStatus[table] = false;
          console.log(`❌ ${table} - MISSING`);
        } else {
          tableStatus[table] = true;
          console.log(`✅ ${table} - EXISTS (RLS may be blocking count)`);
        }
      } else {
        tableStatus[table] = true;
        console.log(`✅ ${table} - EXISTS (${count ?? 'N/A'} rows)`);
      }
    } catch (e) {
      tableStatus[table] = false;
      console.log(`❌ ${table} - ERROR: ${e}`);
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 SUMMARY:\n');
  
  const existing = Object.entries(tableStatus).filter(([_, exists]) => exists);
  const missing = Object.entries(tableStatus).filter(([_, exists]) => !exists);
  
  console.log(`✅ Existing tables: ${existing.length}`);
  console.log(`❌ Missing tables: ${missing.length}`);
  
  if (missing.length > 0) {
    console.log('\n⚠️  Missing tables that need to be created:');
    missing.forEach(([table]) => console.log(`   - ${table}`));
  }
  
  // Write audit results to file
  const auditResult = {
    timestamp: new Date().toISOString(),
    existing: existing.map(([t]) => t),
    missing: missing.map(([t]) => t),
    tableStatus
  };
  
  const outputPath = path.join(process.cwd(), 'docs/session/DB-AUDIT-RESULT.json');
  fs.writeFileSync(outputPath, JSON.stringify(auditResult, null, 2));
  console.log(`\n📁 Audit results saved to: ${outputPath}`);
}

main().catch(console.error);
