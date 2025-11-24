/**
 * Verify ACAD-001 through ACAD-011 Database Objects
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface CheckResult {
  story: string;
  type: string;
  name: string;
  exists: boolean;
}

const EXPECTED_OBJECTS = {
  'ACAD-001': {
    tables: ['courses', 'course_modules', 'module_topics', 'topic_lessons'],
    functions: [],
    views: [],
  },
  'ACAD-002': {
    tables: ['student_enrollments'],
    functions: ['enroll_student'],
    views: [],
  },
  'ACAD-003': {
    tables: ['student_progress', 'topic_completions', 'xp_transactions'],
    functions: ['complete_topic', 'get_user_total_xp'],
    views: [],
  },
  'ACAD-004': {
    tables: ['content_assets'],
    functions: ['record_content_upload', 'get_topic_assets', 'replace_content_asset'],
    views: [],
  },
  'ACAD-005': {
    tables: [],
    functions: [],
    views: [],
  },
  'ACAD-006': {
    tables: [],
    functions: [
      'check_course_prerequisites',
      'check_module_prerequisites',
      'is_topic_unlocked',
      'get_next_unlocked_topic',
      'bypass_prerequisites_for_role',
    ],
    views: ['module_unlock_requirements', 'topic_unlock_requirements'],
  },
  'ACAD-007': {
    tables: ['video_progress'],
    functions: [
      'save_video_progress',
      'get_video_progress',
      'get_user_watch_stats',
      'get_course_watch_stats',
      'reset_video_progress',
    ],
    views: ['video_watch_stats'],
  },
  'ACAD-008': {
    tables: ['lab_templates', 'lab_instances', 'lab_submissions'],
    functions: [
      'start_lab_instance',
      'get_active_lab_instance',
      'submit_lab',
      'record_auto_grade',
      'record_manual_grade',
      'update_lab_activity',
      'get_lab_submission_history',
      'expire_old_lab_instances',
    ],
    views: ['grading_queue', 'lab_statistics'],
  },
  'ACAD-009': {
    tables: ['reading_progress'],
    functions: [
      'save_reading_progress',
      'get_reading_progress',
      'get_user_reading_stats',
      'get_course_reading_stats',
      'reset_reading_progress',
    ],
    views: ['reading_stats'],
  },
  'ACAD-010': {
    tables: ['quiz_questions', 'quiz_settings'],
    functions: [
      'create_quiz_question',
      'update_quiz_question',
      'delete_quiz_question',
      'get_question_bank',
      'get_quiz_questions',
      'get_or_create_quiz_settings',
      'update_quiz_settings',
      'bulk_import_quiz_questions',
    ],
    views: ['question_bank_stats', 'quiz_analytics'],
  },
  'ACAD-011': {
    tables: ['quiz_attempts'],
    functions: [
      'start_quiz_attempt',
      'submit_quiz_attempt',
      'get_user_quiz_attempts',
      'get_best_quiz_score',
      'get_quiz_attempt_results',
    ],
    views: [],
  },
};

async function checkObject(
  type: 'table' | 'function' | 'view',
  name: string
): Promise<boolean> {
  let sql = '';

  if (type === 'table') {
    sql = `
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = '${name}'
      ) as exists;
    `;
  } else if (type === 'function') {
    sql = `
      SELECT EXISTS (
        SELECT 1 FROM pg_proc
        JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
        WHERE pg_namespace.nspname = 'public'
        AND proname = '${name}'
      ) as exists;
    `;
  } else if (type === 'view') {
    sql = `
      SELECT EXISTS (
        SELECT 1 FROM information_schema.views
        WHERE table_schema = 'public' AND table_name = '${name}'
      ) as exists;
    `;
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  const data = await res.json();
  return data.rows?.[0]?.exists === true;
}

async function verifyACADMigrations() {
  console.log('🔍 VERIFYING ACAD-001 THROUGH ACAD-011 DATABASE OBJECTS\n');

  const results: CheckResult[] = [];
  let totalChecks = 0;
  let passedChecks = 0;

  for (const [story, objects] of Object.entries(EXPECTED_OBJECTS)) {
    console.log(`\n📋 ${story}`);

    // Check tables
    for (const table of objects.tables) {
      totalChecks++;
      const exists = await checkObject('table', table);
      results.push({ story, type: 'table', name: table, exists });

      if (exists) {
        passedChecks++;
        console.log(`  ✅ Table: ${table}`);
      } else {
        console.log(`  ❌ Table: ${table} - MISSING`);
      }
    }

    // Check functions
    for (const func of objects.functions) {
      totalChecks++;
      const exists = await checkObject('function', func);
      results.push({ story, type: 'function', name: func, exists });

      if (exists) {
        passedChecks++;
        console.log(`  ✅ Function: ${func}()`);
      } else {
        console.log(`  ❌ Function: ${func}() - MISSING`);
      }
    }

    // Check views
    for (const view of objects.views) {
      totalChecks++;
      const exists = await checkObject('view', view);
      results.push({ story, type: 'view', name: view, exists });

      if (exists) {
        passedChecks++;
        console.log(`  ✅ View: ${view}`);
      } else {
        console.log(`  ❌ View: ${view} - MISSING`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 SUMMARY: ${passedChecks}/${totalChecks} checks passed`);

  const failedChecks = results.filter((r) => !r.exists);
  if (failedChecks.length > 0) {
    console.log(`\n❌ FAILED CHECKS (${failedChecks.length}):`);
    failedChecks.forEach((check) => {
      console.log(`  - ${check.story}: ${check.type} "${check.name}"`);
    });
  } else {
    console.log('\n✅ ALL DATABASE MIGRATIONS SUCCESSFULLY APPLIED!');
  }
}

verifyACADMigrations();
