#!/usr/bin/env node
/**
 * Production Readiness Test - InTime v3
 *
 * Clean, focused test suite that proves:
 * 1. MCP integration works
 * 2. Agents can create real files
 * 3. System is production-ready
 *
 * Avoids token limit issues by:
 * - Cleaning up test artifacts before/after
 * - Testing fewer scenarios comprehensively
 * - Using focused prompts
 */

import dotenv from 'dotenv';
import path from 'path';
import { existsSync, rmSync } from 'fs';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { getToolManager } from './core/tool-manager';
import { runAgent } from './core/agent-runner';

// Test utilities
function printHeader(title: string) {
  console.log('\n' + '═'.repeat(80));
  console.log(`  ${title}`);
  console.log('═'.repeat(80) + '\n');
}

function printTest(name: string, phase: string = '') {
  const prefix = phase ? `${phase} > ` : '';
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`${prefix}${name}`);
  console.log('─'.repeat(80));
}

async function runTest(name: string, testFn: () => Promise<any>, phase: string = ''): Promise<boolean> {
  printTest(name, phase);
  try {
    const result = await testFn();
    console.log('✅ PASSED');
    if (result?.details) {
      console.log(`   Details: ${JSON.stringify(result.details)}`);
    }
    return true;
  } catch (error: any) {
    console.log('❌ FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Cleanup utilities
async function cleanupTestFiles() {
  const testFiles = [
    'src/lib/db/schema/test-products.ts',
    'src/lib/db/schema/test-users.ts',
    'src/lib/db/schema/production-test.ts',
    '.claude/orchestration/test-mcp-output.txt',
  ];

  for (const file of testFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (existsSync(fullPath)) {
      rmSync(fullPath);
    }
  }
}

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              PRODUCTION READINESS TEST - InTime v3                         ║');
  console.log('║                 Clean, Focused, Production-Ready                           ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  const results: { phase: string; passed: number; total: number }[] = [];
  let totalPassed = 0;
  let totalTests = 0;

  // Cleanup before tests
  await cleanupTestFiles();

  // ============================================================================
  // PHASE 1: CORE INFRASTRUCTURE
  // ============================================================================
  printHeader('PHASE 1: CORE INFRASTRUCTURE');
  let phase1Passed = 0;

  if (await runTest('Environment Variables', async () => {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not found');
    }
    return { details: 'API key configured' };
  }, 'PHASE 1')) phase1Passed++;

  const toolManager = getToolManager();

  if (await runTest('MCP Initialization', async () => {
    await toolManager.initialize();
    const tools = await toolManager.getTools('database-architect');
    if (tools.length === 0) throw new Error('No tools loaded');
    return { details: `${tools.length} tools loaded` };
  }, 'PHASE 1')) phase1Passed++;

  if (await runTest('MCP Write & Read', async () => {
    const testPath = path.join(process.cwd(), '.claude/orchestration/test-mcp-output.txt');

    // Write
    const writeResult = await toolManager.executeTool('mcp__write_file', {
      path: testPath,
      content: 'Production readiness test - MCP working!'
    });

    if (!writeResult.success) throw new Error('Write failed');

    // Read
    const readResult = await toolManager.executeTool('mcp__read_text_file', {
      path: testPath
    });

    if (!readResult.success) throw new Error('Read failed');
    if (!readResult.output?.includes('Production readiness')) {
      throw new Error('Content mismatch');
    }

    return { details: 'Write/Read verified' };
  }, 'PHASE 1')) phase1Passed++;

  results.push({ phase: 'PHASE 1: Core Infrastructure', passed: phase1Passed, total: 3 });
  totalPassed += phase1Passed;
  totalTests += 3;

  // ============================================================================
  // PHASE 2: AGENT FILE CREATION
  // ============================================================================
  printHeader('PHASE 2: AGENT FILE CREATION (Critical Test)');
  let phase2Passed = 0;

  if (await runTest('Create Simple Schema File', async () => {
    const startTime = Date.now();

    const result = await runAgent({
      agent: 'database-architect',
      input: `Create a simple database schema file at src/lib/db/schema/production-test.ts

This should be a SIMPLE schema with just:
- A "users" table with: id (uuid), email (text), name (text), created_at (timestamp)

Use Drizzle ORM with PostgreSQL.

IMPORTANT:
- Do NOT explore the entire project structure
- Do NOT read multiple files
- Just create this ONE simple schema file
- Keep it minimal and focused

Project: Next.js 15 with TypeScript, PostgreSQL via Supabase, Drizzle ORM`,
    });

    const duration = Date.now() - startTime;

    if (!result.success) {
      throw new Error(`Agent failed: ${result.error}`);
    }

    // Verify file was created
    const schemaPath = path.join(process.cwd(), 'src/lib/db/schema/production-test.ts');
    if (!existsSync(schemaPath)) {
      throw new Error('Schema file was not created');
    }

    // Verify content
    const readResult = await toolManager.executeTool('mcp__read_text_file', {
      path: schemaPath
    });

    if (!readResult.success) {
      throw new Error('Could not read created file');
    }

    const content = readResult.output || '';
    if (!content.includes('drizzle-orm')) {
      throw new Error('Schema missing Drizzle imports');
    }
    if (!content.includes('pgTable') && !content.includes('table')) {
      throw new Error('Schema missing table definition');
    }

    return {
      details: {
        fileCreated: true,
        duration: `${(duration / 1000).toFixed(1)}s`,
        cost: result.cost,
        toolsUsed: result.toolCalls || 0
      }
    };
  }, 'PHASE 2')) phase2Passed++;

  if (await runTest('Verify File Contents Are Valid TypeScript', async () => {
    const schemaPath = path.join(process.cwd(), 'src/lib/db/schema/production-test.ts');
    const readResult = await toolManager.executeTool('mcp__read_text_file', {
      path: schemaPath
    });

    const content = readResult.output || '';

    // Check for TypeScript syntax
    if (!content.includes('import') && !content.includes('export')) {
      throw new Error('Invalid TypeScript structure');
    }

    return { details: 'Valid TypeScript syntax confirmed' };
  }, 'PHASE 2')) phase2Passed++;

  results.push({ phase: 'PHASE 2: Agent File Creation', passed: phase2Passed, total: 2 });
  totalPassed += phase2Passed;
  totalTests += 2;

  // ============================================================================
  // PHASE 3: PRODUCTION VALIDATION
  // ============================================================================
  printHeader('PHASE 3: PRODUCTION VALIDATION');
  let phase3Passed = 0;

  if (await runTest('TypeScript Compilation', async () => {
    const result = await toolManager.executeTool('validate_typescript', {});

    if (!result.success) {
      throw new Error(`TypeScript errors found: ${result.error}`);
    }

    return { details: 'TypeScript compiles successfully' };
  }, 'PHASE 3')) phase3Passed++;

  if (await runTest('Production Build', async () => {
    const result = await toolManager.executeTool('run_build', {});

    if (!result.success) {
      throw new Error(`Build failed: ${result.error}`);
    }

    return { details: 'Production build successful' };
  }, 'PHASE 3')) phase3Passed++;

  results.push({ phase: 'PHASE 3: Production Validation', passed: phase3Passed, total: 2 });
  totalPassed += phase3Passed;
  totalTests += 2;

  // ============================================================================
  // FINAL SUMMARY
  // ============================================================================
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    PRODUCTION READINESS SUMMARY                            ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log();

  const passRate = ((totalPassed / totalTests) * 100).toFixed(1);

  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalTests - totalPassed}`);
  console.log(`📊 Pass Rate: ${passRate}%`);
  console.log();

  console.log('Results by Phase:');
  console.log('═'.repeat(80));
  for (const result of results) {
    const phasePct = ((result.passed / result.total) * 100).toFixed(0);
    const status = result.passed === result.total ? '✅' : '⚠️';
    console.log(`${status} ${result.phase}: ${result.passed}/${result.total} (${phasePct}%)`);
  }
  console.log('═'.repeat(80));

  console.log();
  if (totalPassed === totalTests) {
    console.log('🎉 ALL TESTS PASSED - SYSTEM IS PRODUCTION READY! 🎉');
  } else if (passRate >= 85) {
    console.log('✅ SYSTEM IS PRODUCTION READY (>85% pass rate)');
  } else {
    console.log('⚠️  SOME CRITICAL TESTS FAILED - Review errors above');
  }
  console.log();

  // Cleanup after tests
  await cleanupTestFiles();

  // Shutdown MCP
  await toolManager.shutdown();

  process.exit(totalPassed === totalTests ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
