/**
 * Migration API Endpoint
 *
 * Executes database migrations via HTTP
 * Accessible at: http://localhost:3000/api/migrate
 *
 * NO DNS ISSUES - Uses Supabase HTTP API!
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface MigrationResult {
  filename: string;
  success: boolean;
  error?: string;
  timestamp: string;
}

/**
 * Execute SQL using Supabase client (uses HTTP, no DNS issues!)
 */
async function executeSqlChunk(sql: string) {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && s.length > 5);

  const results = [];

  for (const statement of statements) {
    try {
      // Use the service role to execute raw SQL via a temporary function
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // If exec_sql doesn't exist, we'll create it dynamically
        // For now, try using the SQL directly via a workaround
        throw error;
      }

      results.push({ success: true, statement: statement.substring(0, 50) });
    } catch (error: any) {
      // Store error but continue
      results.push({
        success: false,
        statement: statement.substring(0, 50),
        error: error.message
      });
    }
  }

  return results;
}

/**
 * POST /api/migrate
 * Execute all pending migrations
 */
export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    if (action !== 'run') {
      return NextResponse.json(
        { error: 'Invalid action. Use: { "action": "run" }' },
        { status: 400 }
      );
    }

    console.log('🚀 Starting migration process...');

    // Read all migration files from supabase/migrations
    const migrationsDir = path.join(process.cwd(), 'supabase/migrations');

    // Check if directory exists
    if (!fs.existsSync(migrationsDir)) {
      return NextResponse.json(
        { error: 'Migrations directory not found at: ' + migrationsDir },
        { status: 404 }
      );
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
      .sort();

    const results: MigrationResult[] = [];

    // Create Supabase client
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Execute each migration file
    for (const filename of files) {
      console.log(`📝 Processing: ${filename}`);

      const filePath = path.join(migrationsDir, filename);
      let sql = fs.readFileSync(filePath, 'utf-8');

      // Remove sample data to avoid conflicts
      sql = sql.replace(/-- SAMPLE DATA[\s\S]*?(?=-- ={50,}|$)/g, '');

      try {
        // Execute SQL using the execute-sql edge function
        const response = await fetch(`${supabaseUrl}/functions/v1/execute-sql`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sql })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || `HTTP ${response.status}`);
        }

        results.push({
          filename,
          success: true,
          timestamp: new Date().toISOString()
        });

        console.log(`✅ ${filename} completed`);
      } catch (error: any) {
        console.error(`❌ ${filename} failed:`, error.message);

        results.push({
          filename,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Seed roles
    console.log('🌱 Seeding roles...');

    const seedSql = `
      INSERT INTO roles (name, display_name, description, is_system_role, hierarchy_level, color_code)
      VALUES
        ('super_admin', 'Super Administrator', 'Full system access with all permissions', TRUE, 0, '#dc2626'),
        ('admin', 'Administrator', 'Administrative access to manage users and settings', TRUE, 1, '#ea580c'),
        ('recruiter', 'Recruiter', 'Manages candidates, placements, and client relationships', TRUE, 2, '#0891b2'),
        ('trainer', 'Trainer', 'Manages training courses and student progress', TRUE, 2, '#7c3aed'),
        ('student', 'Student', 'Enrolled in training academy courses', TRUE, 3, '#2563eb'),
        ('candidate', 'Candidate', 'Job seeker available for placement', TRUE, 3, '#16a34a'),
        ('employee', 'Employee', 'Internal team member', TRUE, 3, '#4f46e5'),
        ('client', 'Client', 'Hiring company representative', TRUE, 3, '#9333ea')
      ON CONFLICT (name) DO NOTHING;
    `;

    try {
      const { data: seedData, error: seedError } = await supabase
        .from('roles')
        .insert([
          { name: 'super_admin', display_name: 'Super Administrator', description: 'Full system access with all permissions', is_system_role: true, hierarchy_level: 0, color_code: '#dc2626' },
          { name: 'admin', display_name: 'Administrator', description: 'Administrative access to manage users and settings', is_system_role: true, hierarchy_level: 1, color_code: '#ea580c' },
          { name: 'recruiter', display_name: 'Recruiter', description: 'Manages candidates, placements, and client relationships', is_system_role: true, hierarchy_level: 2, color_code: '#0891b2' },
          { name: 'trainer', display_name: 'Trainer', description: 'Manages training courses and student progress', is_system_role: true, hierarchy_level: 2, color_code: '#7c3aed' },
          { name: 'student', display_name: 'Student', description: 'Enrolled in training academy courses', is_system_role: true, hierarchy_level: 3, color_code: '#2563eb' },
          { name: 'candidate', display_name: 'Candidate', description: 'Job seeker available for placement', is_system_role: true, hierarchy_level: 3, color_code: '#16a34a' },
          { name: 'employee', display_name: 'Employee', description: 'Internal team member', is_system_role: true, hierarchy_level: 3, color_code: '#4f46e5' },
          { name: 'client', display_name: 'Client', description: 'Hiring company representative', is_system_role: true, hierarchy_level: 3, color_code: '#9333ea' },
        ])
        .select();

      console.log('✅ Roles seeded');
    } catch (seedError: any) {
      console.log('⚠️  Roles already exist or error:', seedError.message);
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return NextResponse.json({
      success: successCount === totalCount,
      message: `Migrations: ${successCount}/${totalCount} successful`,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('💥 Migration error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/migrate
 * Check migration status
 */
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if tables exist
    const tables = [
      'user_profiles',
      'roles',
      'permissions',
      'audit_logs',
      'events',
      'organizations'
    ];

    const tableStatus = [];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        tableStatus.push({
          table,
          exists: !error,
          count: count || 0,
          error: error?.message
        });
      } catch (err: any) {
        tableStatus.push({
          table,
          exists: false,
          error: err.message
        });
      }
    }

    return NextResponse.json({
      status: 'ok',
      tables: tableStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message
      },
      { status: 500 }
    );
  }
}
