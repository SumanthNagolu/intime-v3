/**
 * SAFE DEPLOYMENT CHECK SCRIPT
 *
 * This script performs comprehensive safety checks before any deployment
 * NEVER deploy without running these checks!
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

interface SafetyCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  critical: boolean;
}

const checks: SafetyCheck[] = [];

function addCheck(check: SafetyCheck) {
  checks.push(check);
  const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
  const color = check.status === 'pass' ? GREEN : check.status === 'fail' ? RED : YELLOW;
  console.log(`${color}${icon} ${check.name}${RESET}: ${check.message}`);
}

async function runSafetyChecks() {
  console.log(`\n${BOLD}${BLUE}╔════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${BLUE}║         CRITICAL DEPLOYMENT SAFETY CHECKS                     ║${RESET}`);
  console.log(`${BOLD}${BLUE}╚════════════════════════════════════════════════════════════════╝${RESET}\n`);

  // Check 1: Environment Variables
  console.log(`${BOLD}\n📋 Phase 1: Environment Validation${RESET}\n`);

  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      addCheck({
        name: `ENV: ${envVar}`,
        status: 'pass',
        message: 'Configured',
        critical: true,
      });
    } else {
      addCheck({
        name: `ENV: ${envVar}`,
        status: 'fail',
        message: 'NOT SET - Critical!',
        critical: true,
      });
    }
  }

  // Check 2: Database Connection
  console.log(`${BOLD}\n🔌 Phase 2: Database Connection${RESET}\n`);

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test connection
    const { error } = await supabase.from('_drizzle_migrations').select('*').limit(1);

    if (error) {
      addCheck({
        name: 'Database Connection',
        status: 'fail',
        message: `Connection failed: ${error.message}`,
        critical: true,
      });
    } else {
      addCheck({
        name: 'Database Connection',
        status: 'pass',
        message: 'Connected successfully',
        critical: true,
      });
    }
  } catch (err) {
    addCheck({
      name: 'Database Connection',
      status: 'fail',
      message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      critical: true,
    });
  }

  // Check 3: Database is NOT Empty
  console.log(`${BOLD}\n🗄️  Phase 3: Database State Verification${RESET}\n`);

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Count existing tables (check if database has data)
    const { count: userProfilesCount } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (userProfilesCount === null) {
      addCheck({
        name: 'Database State',
        status: 'warning',
        message: 'Could not verify table existence',
        critical: false,
      });
    } else if (userProfilesCount > 0) {
      addCheck({
        name: 'Database State',
        status: 'pass',
        message: `Database has ${userProfilesCount} user records (NOT empty)`,
        critical: true,
      });
    } else {
      addCheck({
        name: 'Database State',
        status: 'warning',
        message: 'Database tables exist but appear empty',
        critical: false,
      });
    }
  } catch (err) {
    addCheck({
      name: 'Database State',
      status: 'warning',
      message: `Could not verify: ${err instanceof Error ? err.message : 'Unknown error'}`,
      critical: false,
    });
  }

  // Check 4: Migration Status
  console.log(`${BOLD}\n📊 Phase 4: Migration History${RESET}\n`);

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: migrations, error } = await supabase
      .from('_drizzle_migrations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      addCheck({
        name: 'Migration History',
        status: 'warning',
        message: `Could not retrieve: ${error.message}`,
        critical: false,
      });
    } else if (migrations && migrations.length > 0) {
      addCheck({
        name: 'Migration History',
        status: 'pass',
        message: `Last migration: ${migrations[0].name || 'unknown'}`,
        critical: true,
      });

      console.log(`\n${BLUE}Recent migrations:${RESET}`);
      migrations.forEach((m: Record<string, unknown>, i: number) => {
        console.log(`  ${i + 1}. ${m.name || 'unnamed'} (${new Date(String(m.created_at)).toLocaleString()})`);
      });
    } else {
      addCheck({
        name: 'Migration History',
        status: 'warning',
        message: 'No migration history found',
        critical: false,
      });
    }
  } catch (err) {
    addCheck({
      name: 'Migration History',
      status: 'warning',
      message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      critical: false,
    });
  }

  // Check 5: Migration 021 Already Applied?
  console.log(`${BOLD}\n🔍 Phase 5: Migration 021 Status${RESET}\n`);

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if the new tables from migration 021 exist
    const { error: candidateEmbeddingsError } = await supabase
      .from('candidate_embeddings')
      .select('*')
      .limit(1);

    if (!candidateEmbeddingsError) {
      addCheck({
        name: 'Migration 021 Status',
        status: 'warning',
        message: '⚠️  ALREADY APPLIED - Tables exist! DO NOT reapply!',
        critical: true,
      });
    } else if (candidateEmbeddingsError.message.includes('does not exist')) {
      addCheck({
        name: 'Migration 021 Status',
        status: 'pass',
        message: 'Not yet applied - Safe to proceed',
        critical: true,
      });
    } else {
      addCheck({
        name: 'Migration 021 Status',
        status: 'warning',
        message: `Unclear status: ${candidateEmbeddingsError.message}`,
        critical: false,
      });
    }
  } catch (err) {
    addCheck({
      name: 'Migration 021 Status',
      status: 'warning',
      message: `Could not verify: ${err instanceof Error ? err.message : 'Unknown error'}`,
      critical: false,
    });
  }

  // Check 6: Build Status
  console.log(`${BOLD}\n🔨 Phase 6: Build Verification${RESET}\n`);

  const nextBuildDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextBuildDir)) {
    addCheck({
      name: 'Production Build',
      status: 'pass',
      message: 'Build artifacts exist',
      critical: true,
    });
  } else {
    addCheck({
      name: 'Production Build',
      status: 'fail',
      message: 'No build found - run `pnpm build` first',
      critical: true,
    });
  }

  // Final Summary
  console.log(`\n${BOLD}${BLUE}╔════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${BLUE}║                  SAFETY CHECK SUMMARY                          ║${RESET}`);
  console.log(`${BOLD}${BLUE}╚════════════════════════════════════════════════════════════════╝${RESET}\n`);

  const passCount = checks.filter(c => c.status === 'pass').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warnCount = checks.filter(c => c.status === 'warning').length;
  const criticalFails = checks.filter(c => c.critical && c.status === 'fail').length;

  console.log(`${GREEN}✅ Passed: ${passCount}${RESET}`);
  console.log(`${RED}❌ Failed: ${failCount}${RESET}`);
  console.log(`${YELLOW}⚠️  Warnings: ${warnCount}${RESET}`);
  console.log(`${RED}🚨 Critical Failures: ${criticalFails}${RESET}`);

  console.log(`\n${BOLD}DEPLOYMENT DECISION:${RESET}`);

  if (criticalFails > 0) {
    console.log(`${RED}${BOLD}❌ DEPLOYMENT BLOCKED${RESET}`);
    console.log(`${RED}   Fix ${criticalFails} critical failure(s) before proceeding${RESET}`);
    process.exit(1);
  } else if (failCount > 0) {
    console.log(`${YELLOW}${BOLD}⚠️  PROCEED WITH CAUTION${RESET}`);
    console.log(`${YELLOW}   ${failCount} non-critical issues found${RESET}`);
    process.exit(2);
  } else {
    console.log(`${GREEN}${BOLD}✅ SAFE TO PROCEED${RESET}`);
    console.log(`${GREEN}   All critical checks passed${RESET}`);
    process.exit(0);
  }
}

// Run checks
runSafetyChecks().catch((err) => {
  console.error(`${RED}${BOLD}FATAL ERROR:${RESET} ${err.message}`);
  process.exit(1);
});
