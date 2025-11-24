/**
 * MIGRATION 021 VERIFICATION SCRIPT
 *
 * Verifies that migration 021 was applied successfully
 */

import { createClient } from '@supabase/supabase-js';

// ANSI color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

interface VerificationCheck {
  name: string;
  status: 'pass' | 'fail';
  message: string;
}

const checks: VerificationCheck[] = [];

function addCheck(check: VerificationCheck) {
  checks.push(check);
  const icon = check.status === 'pass' ? '✅' : '❌';
  const color = check.status === 'pass' ? GREEN : RED;
  console.log(`${color}${icon} ${check.name}${RESET}: ${check.message}`);
}

async function verifyMigration021() {
  console.log(`\n${BOLD}${BLUE}╔════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${BLUE}║         MIGRATION 021 VERIFICATION                            ║${RESET}`);
  console.log(`${BOLD}${BLUE}╚════════════════════════════════════════════════════════════════╝${RESET}\n`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    console.error(`${RED}${BOLD}ERROR: Supabase credentials not configured${RESET}`);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check 1: candidate_embeddings table
  console.log(`${BOLD}\n📋 Checking Tables${RESET}\n`);

  try {
    const { error } = await supabase.from('candidate_embeddings').select('id').limit(1);

    if (!error) {
      addCheck({
        name: 'candidate_embeddings table',
        status: 'pass',
        message: 'Table exists and is accessible',
      });
    } else if (error.message.includes('does not exist')) {
      addCheck({
        name: 'candidate_embeddings table',
        status: 'fail',
        message: 'Table does not exist',
      });
    } else {
      addCheck({
        name: 'candidate_embeddings table',
        status: 'fail',
        message: `Error: ${error.message}`,
      });
    }
  } catch (err) {
    addCheck({
      name: 'candidate_embeddings table',
      status: 'fail',
      message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    });
  }

  // Check 2: requisition_embeddings table
  try {
    const { error } = await supabase.from('requisition_embeddings').select('id').limit(1);

    if (!error) {
      addCheck({
        name: 'requisition_embeddings table',
        status: 'pass',
        message: 'Table exists and is accessible',
      });
    } else if (error.message.includes('does not exist')) {
      addCheck({
        name: 'requisition_embeddings table',
        status: 'fail',
        message: 'Table does not exist',
      });
    } else {
      addCheck({
        name: 'requisition_embeddings table',
        status: 'fail',
        message: `Error: ${error.message}`,
      });
    }
  } catch (err) {
    addCheck({
      name: 'requisition_embeddings table',
      status: 'fail',
      message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    });
  }

  // Check 3: resume_matches table
  try {
    const { error } = await supabase.from('resume_matches').select('id').limit(1);

    if (!error) {
      addCheck({
        name: 'resume_matches table',
        status: 'pass',
        message: 'Table exists and is accessible',
      });
    } else if (error.message.includes('does not exist')) {
      addCheck({
        name: 'resume_matches table',
        status: 'fail',
        message: 'Table does not exist',
      });
    } else {
      addCheck({
        name: 'resume_matches table',
        status: 'fail',
        message: `Error: ${error.message}`,
      });
    }
  } catch (err) {
    addCheck({
      name: 'resume_matches table',
      status: 'fail',
      message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    });
  }

  // Check 4: generated_resumes table
  try {
    const { error } = await supabase.from('generated_resumes').select('id').limit(1);

    if (!error) {
      addCheck({
        name: 'generated_resumes table',
        status: 'pass',
        message: 'Table exists and is accessible',
      });
    } else if (error.message.includes('does not exist')) {
      addCheck({
        name: 'generated_resumes table',
        status: 'fail',
        message: 'Table does not exist',
      });
    } else {
      addCheck({
        name: 'generated_resumes table',
        status: 'fail',
        message: `Error: ${error.message}`,
      });
    }
  } catch (err) {
    addCheck({
      name: 'generated_resumes table',
      status: 'fail',
      message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    });
  }

  // Summary
  console.log(`\n${BOLD}${BLUE}╔════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${BLUE}║                  VERIFICATION SUMMARY                          ║${RESET}`);
  console.log(`${BOLD}${BLUE}╚════════════════════════════════════════════════════════════════╝${RESET}\n`);

  const passCount = checks.filter(c => c.status === 'pass').length;
  const failCount = checks.filter(c => c.status === 'fail').length;

  console.log(`${GREEN}✅ Passed: ${passCount}/4${RESET}`);
  console.log(`${RED}❌ Failed: ${failCount}/4${RESET}`);

  if (failCount === 0) {
    console.log(`\n${GREEN}${BOLD}✅ MIGRATION 021 VERIFIED SUCCESSFULLY${RESET}`);
    console.log(`${GREEN}   All tables created and accessible${RESET}`);
    process.exit(0);
  } else {
    console.log(`\n${RED}${BOLD}❌ MIGRATION 021 VERIFICATION FAILED${RESET}`);
    console.log(`${RED}   ${failCount} table(s) not found or not accessible${RESET}`);
    console.log(`\n${YELLOW}Please verify the migration was applied correctly in Supabase dashboard${RESET}`);
    process.exit(1);
  }
}

// Run verification
verifyMigration021().catch((err) => {
  console.error(`${RED}${BOLD}FATAL ERROR:${RESET} ${err.message}`);
  process.exit(1);
});
