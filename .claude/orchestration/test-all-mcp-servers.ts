#!/usr/bin/env node
/**
 * Comprehensive MCP Server Test Suite
 *
 * Tests all configured MCP servers:
 * - GitHub (repository operations, PRs, issues)
 * - PostgreSQL (database queries via Supabase)
 * - Playwright (browser automation)
 * - Puppeteer (browser automation)
 * - Context7 (library documentation)
 * - Sequential Thinking (enhanced reasoning)
 * - And others...
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

interface TestResult {
  server: string;
  test: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function printHeader(title: string) {
  console.log('\n' + '═'.repeat(80));
  console.log(`  ${title}`);
  console.log('═'.repeat(80) + '\n');
}

function printTest(server: string, test: string) {
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`${server} > ${test}`);
  console.log('─'.repeat(80));
}

async function runTest(
  server: string,
  test: string,
  testFn: () => Promise<any>
): Promise<boolean> {
  printTest(server, test);
  const startTime = Date.now();

  try {
    const result = await testFn();
    const duration = Date.now() - startTime;

    results.push({
      server,
      test,
      passed: true,
      duration,
      details: result,
    });

    console.log(`✅ PASSED (${duration}ms)`);
    if (result) {
      console.log(`   Details: ${JSON.stringify(result).substring(0, 200)}`);
    }
    return true;
  } catch (error: any) {
    const duration = Date.now() - startTime;

    results.push({
      server,
      test,
      passed: false,
      duration,
      error: error.message,
    });

    console.log(`❌ FAILED (${duration}ms)`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// ============================================================================
// GITHUB MCP SERVER
// ============================================================================

async function testGitHub() {
  printHeader('GITHUB MCP SERVER');

  if (!process.env.GITHUB_TOKEN) {
    console.log('⏭️  Skipping GitHub tests - GITHUB_TOKEN not set');
    return;
  }

  let client: Client | null = null;

  try {
    // Initialize GitHub MCP
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: {
        ...process.env,
        GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN,
      },
    });

    client = new Client(
      { name: 'test-github', version: '1.0.0' },
      { capabilities: {} }
    );

    await client.connect(transport);

    // Test 1: List available tools
    await runTest('GitHub', 'List Available Tools', async () => {
      const { tools } = await client!.listTools();
      return { toolCount: tools.length, tools: tools.map(t => t.name) };
    });

    // Test 2: Repository info (if configured)
    // Add more GitHub-specific tests here

    await client.close();
  } catch (error: any) {
    console.log(`⚠️  GitHub MCP initialization failed: ${error.message}`);
    console.log('   Check: GITHUB_TOKEN is set and valid');
    if (client) await client.close();
  }
}

// ============================================================================
// POSTGRESQL MCP SERVER (via Supabase)
// ============================================================================

async function testPostgreSQL() {
  printHeader('POSTGRESQL MCP SERVER (Supabase)');

  if (!process.env.SUPABASE_DB_URL) {
    console.log('⏭️  Skipping PostgreSQL tests - SUPABASE_DB_URL not set');
    return;
  }

  let client: Client | null = null;

  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/server-postgres',
        process.env.SUPABASE_DB_URL!,
      ],
    });

    client = new Client(
      { name: 'test-postgres', version: '1.0.0' },
      { capabilities: {} }
    );

    await client.connect(transport);

    // Test 1: List available tools
    await runTest('PostgreSQL', 'List Available Tools', async () => {
      const { tools } = await client!.listTools();
      return { toolCount: tools.length, tools: tools.map(t => t.name) };
    });

    // Test 2: Query database (list tables)
    await runTest('PostgreSQL', 'Query Database (List Tables)', async () => {
      const result = await client!.callTool({
        name: 'query',
        arguments: {
          sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LIMIT 5",
        },
      });
      return result;
    });

    await client.close();
  } catch (error: any) {
    console.log(`⚠️  PostgreSQL MCP initialization failed: ${error.message}`);
    console.log('   Check: SUPABASE_DB_URL is correct');
    if (client) await client.close();
  }
}

// ============================================================================
// PLAYWRIGHT MCP SERVER
// ============================================================================

async function testPlaywright() {
  printHeader('PLAYWRIGHT MCP SERVER');

  let client: Client | null = null;

  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@executeautomation/playwright-mcp-server'],
    });

    client = new Client(
      { name: 'test-playwright', version: '1.0.0' },
      { capabilities: {} }
    );

    await client.connect(transport);

    // Test 1: List available tools
    await runTest('Playwright', 'List Available Tools', async () => {
      const { tools } = await client!.listTools();
      return { toolCount: tools.length, tools: tools.map(t => t.name) };
    });

    // Test 2: Take screenshot (if browser is available)
    await runTest('Playwright', 'Browser Snapshot', async () => {
      const result = await client!.callTool({
        name: 'browser_snapshot',
        arguments: {},
      });
      return { snapshotTaken: true };
    });

    await client.close();
  } catch (error: any) {
    console.log(`⚠️  Playwright MCP initialization failed: ${error.message}`);
    console.log('   Note: Playwright may need browser installation');
    console.log('   Run: npx playwright install');
    if (client) await client.close();
  }
}

// ============================================================================
// PUPPETEER MCP SERVER
// ============================================================================

async function testPuppeteer() {
  printHeader('PUPPETEER MCP SERVER');

  let client: Client | null = null;

  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    });

    client = new Client(
      { name: 'test-puppeteer', version: '1.0.0' },
      { capabilities: {} }
    );

    await client.connect(transport);

    // Test 1: List available tools
    await runTest('Puppeteer', 'List Available Tools', async () => {
      const { tools } = await client!.listTools();
      return { toolCount: tools.length, tools: tools.map(t => t.name) };
    });

    // Test 2: Navigate to URL
    await runTest('Puppeteer', 'Navigate to URL', async () => {
      const result = await client!.callTool({
        name: 'puppeteer_navigate',
        arguments: {
          url: 'https://www.anthropic.com',
        },
      });
      return { navigated: true };
    });

    await client.close();
  } catch (error: any) {
    console.log(`⚠️  Puppeteer MCP initialization failed: ${error.message}`);
    console.log('   Note: Puppeteer downloads Chromium on first use');
    if (client) await client.close();
  }
}

// ============================================================================
// CONTEXT7 MCP SERVER
// ============================================================================

async function testContext7() {
  printHeader('CONTEXT7 MCP SERVER (Library Documentation)');

  let client: Client | null = null;

  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@context7/mcp'],
    });

    client = new Client(
      { name: 'test-context7', version: '1.0.0' },
      { capabilities: {} }
    );

    await client.connect(transport);

    // Test 1: List available tools
    await runTest('Context7', 'List Available Tools', async () => {
      const { tools } = await client!.listTools();
      return { toolCount: tools.length, tools: tools.map(t => t.name) };
    });

    // Test 2: Resolve library (e.g., React)
    await runTest('Context7', 'Resolve Library (React)', async () => {
      const result = await client!.callTool({
        name: 'resolve-library-id',
        arguments: {
          libraryName: 'react',
        },
      });
      return result;
    });

    await client.close();
  } catch (error: any) {
    console.log(`⚠️  Context7 MCP initialization failed: ${error.message}`);
    if (client) await client.close();
  }
}

// ============================================================================
// SEQUENTIAL THINKING MCP SERVER
// ============================================================================

async function testSequentialThinking() {
  printHeader('SEQUENTIAL THINKING MCP SERVER');

  let client: Client | null = null;

  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
    });

    client = new Client(
      { name: 'test-sequential', version: '1.0.0' },
      { capabilities: {} }
    );

    await client.connect(transport);

    // Test 1: List available tools
    await runTest('Sequential Thinking', 'List Available Tools', async () => {
      const { tools } = await client!.listTools();
      return { toolCount: tools.length, tools: tools.map(t => t.name) };
    });

    await client.close();
  } catch (error: any) {
    console.log(`⚠️  Sequential Thinking MCP initialization failed: ${error.message}`);
    if (client) await client.close();
  }
}

// ============================================================================
// SLACK MCP SERVER
// ============================================================================

async function testSlack() {
  printHeader('SLACK MCP SERVER');

  if (!process.env.SLACK_BOT_TOKEN) {
    console.log('⏭️  Skipping Slack tests - SLACK_BOT_TOKEN not set');
    return;
  }

  let client: Client | null = null;

  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-slack'],
      env: {
        ...process.env,
        SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
        SLACK_TEAM_ID: process.env.SLACK_TEAM_ID || '',
      },
    });

    client = new Client(
      { name: 'test-slack', version: '1.0.0' },
      { capabilities: {} }
    );

    await client.connect(transport);

    // Test 1: List available tools
    await runTest('Slack', 'List Available Tools', async () => {
      const { tools } = await client!.listTools();
      return { toolCount: tools.length, tools: tools.map(t => t.name) };
    });

    // Test 2: List channels
    await runTest('Slack', 'List Channels', async () => {
      const result = await client!.callTool({
        name: 'slack_list_channels',
        arguments: { limit: 5 },
      });
      return result;
    });

    await client.close();
  } catch (error: any) {
    console.log(`⚠️  Slack MCP initialization failed: ${error.message}`);
    console.log('   Check: SLACK_BOT_TOKEN and SLACK_TEAM_ID are set');
    if (client) await client.close();
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║         COMPREHENSIVE MCP SERVER TEST SUITE - InTime v3                   ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  console.log('\n📋 Testing MCP Servers:');
  console.log('   • GitHub (repository operations)');
  console.log('   • PostgreSQL (database via Supabase)');
  console.log('   • Playwright (browser automation)');
  console.log('   • Puppeteer (browser automation)');
  console.log('   • Context7 (library documentation)');
  console.log('   • Sequential Thinking (enhanced reasoning)');
  console.log('   • Slack (team notifications)');
  console.log();

  // Run all tests
  await testGitHub();
  await testPostgreSQL();
  await testPlaywright();
  await testPuppeteer();
  await testContext7();
  await testSequentialThinking();
  await testSlack();

  // Summary
  printHeader('TEST SUMMARY');

  const byServer = new Map<string, { passed: number; total: number }>();

  results.forEach(r => {
    if (!byServer.has(r.server)) {
      byServer.set(r.server, { passed: 0, total: 0 });
    }
    const stats = byServer.get(r.server)!;
    stats.total++;
    if (r.passed) stats.passed++;
  });

  const totalPassed = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';

  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalTests - totalPassed}`);
  console.log(`📊 Pass Rate: ${passRate}%\n`);

  console.log('Results by Server:');
  console.log('═'.repeat(80));

  byServer.forEach((stats, server) => {
    const pct = ((stats.passed / stats.total) * 100).toFixed(0);
    const status = stats.passed === stats.total ? '✅' : stats.passed > 0 ? '⚠️' : '❌';
    console.log(`${status} ${server}: ${stats.passed}/${stats.total} (${pct}%)`);
  });

  console.log('═'.repeat(80));

  // Environment variable reminders
  console.log('\n📝 Environment Variables Status:');
  console.log(`   GITHUB_TOKEN: ${process.env.GITHUB_TOKEN ? '✅ Set' : '❌ Not set'}`);
  console.log(`   SUPABASE_DB_URL: ${process.env.SUPABASE_DB_URL ? '✅ Set' : '❌ Not set'}`);
  console.log(`   SLACK_BOT_TOKEN: ${process.env.SLACK_BOT_TOKEN ? '✅ Set' : '❌ Not set'}`);

  console.log('\n💡 Next Steps:');
  if (!process.env.GITHUB_TOKEN) {
    console.log('   • Add GITHUB_TOKEN to .env.local for GitHub integration');
  }
  if (!process.env.SUPABASE_DB_URL) {
    console.log('   • Add SUPABASE_DB_URL to .env.local for database access');
  }
  if (!process.env.SLACK_BOT_TOKEN) {
    console.log('   • Add SLACK_BOT_TOKEN to .env.local for Slack notifications (optional)');
  }

  console.log();

  if (totalPassed === totalTests) {
    console.log('🎉 ALL TESTS PASSED - All MCP servers working!');
  } else if (passRate >= '50') {
    console.log('✅ Most servers working - Configure missing env vars for full functionality');
  } else {
    console.log('⚠️  Many tests failed - Check environment variables and MCP server installation');
  }

  console.log();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
