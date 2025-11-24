#!/usr/bin/env node
/**
 * Comprehensive End-to-End Test
 *
 * Tests every component and integration point to ensure the system works correctly.
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import Anthropic from '@anthropic-ai/sdk';
import { getToolManager } from './core/tool-manager';
import { runAgent } from './core/agent-runner';
import fs from 'fs/promises';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  duration?: number;
  details?: any;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<any>): Promise<boolean> {
  const startTime = Date.now();
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST: ${name}`);
  console.log('='.repeat(80));

  try {
    const result = await testFn();
    const duration = Date.now() - startTime;

    results.push({
      name,
      success: true,
      message: 'PASSED',
      duration,
      details: result
    });

    console.log(`✅ PASSED (${duration}ms)`);
    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    const message = error instanceof Error ? error.message : String(error);

    results.push({
      name,
      success: false,
      message: `FAILED: ${message}`,
      duration,
      details: error
    });

    console.log(`❌ FAILED (${duration}ms)`);
    console.log(`Error: ${message}`);
    return false;
  }
}

async function comprehensiveTest() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                  COMPREHENSIVE END-TO-END TEST SUITE                       ║');
  console.log('║                    InTime v3 Tool Integration                              ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  // ==========================================
  // PHASE 1: Environment & Dependencies
  // ==========================================
  console.log('\n📦 PHASE 1: ENVIRONMENT & DEPENDENCIES\n');

  await runTest('1.1 Environment Variables Loaded', async () => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not found');
    if (apiKey.length < 50) throw new Error('API key too short');
    if (!apiKey.startsWith('sk-ant-')) throw new Error('Invalid API key format');
    return { keyLength: apiKey.length, prefix: apiKey.substring(0, 15) };
  });

  await runTest('1.2 Required Packages Installed', async () => {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
    return { anthropic: '✓', mcpSdk: '✓' };
  });

  // ==========================================
  // PHASE 2: API Key Validation
  // ==========================================
  console.log('\n🔑 PHASE 2: ANTHROPIC API KEY VALIDATION\n');

  await runTest('2.1 Direct API Call to Anthropic', async () => {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Reply with just "OK"' }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    if (!text.includes('OK')) throw new Error('Unexpected API response');

    return {
      responseText: text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens
    };
  });

  // ==========================================
  // PHASE 3: MCP Integration
  // ==========================================
  console.log('\n🔌 PHASE 3: MCP INTEGRATION\n');

  let toolManager: any;

  await runTest('3.1 Tool Manager Initialization', async () => {
    toolManager = getToolManager();
    await toolManager.initialize();
    return { initialized: true };
  });

  await runTest('3.2 MCP Tools Loaded', async () => {
    const tools = await toolManager.getTools('database-architect');
    const mcpTools = tools.filter((t: any) => t.name.startsWith('mcp__'));
    const customTools = tools.filter((t: any) => !t.name.startsWith('mcp__'));

    if (mcpTools.length === 0) throw new Error('No MCP tools loaded');
    if (tools.length === 0) throw new Error('No tools loaded at all');

    return {
      totalTools: tools.length,
      mcpTools: mcpTools.length,
      customTools: customTools.length,
      toolNames: tools.map((t: any) => t.name)
    };
  });

  await runTest('3.3 MCP Write File Tool (Direct Test)', async () => {
    const testFile = path.join(process.cwd(), 'test-mcp-direct.txt');
    const testContent = `MCP Direct Test - ${new Date().toISOString()}`;

    const result = await toolManager.executeTool('mcp__write_file', {
      path: testFile,
      content: testContent
    });

    if (!result.success) throw new Error(result.error || 'Tool execution failed');

    // Verify file exists
    const fileExists = await fs.access(testFile).then(() => true).catch(() => false);
    if (!fileExists) throw new Error('File not created');

    const content = await fs.readFile(testFile, 'utf-8');
    if (content !== testContent) throw new Error('File content mismatch');

    // Cleanup
    await fs.unlink(testFile);

    return { fileCreated: true, contentMatches: true };
  });

  await runTest('3.4 MCP Read File Tool', async () => {
    // Create a test file first
    const testFile = path.join(process.cwd(), 'test-mcp-read.txt');
    await fs.writeFile(testFile, 'Test content for reading');

    const result = await toolManager.executeTool('mcp__read_text_file', {
      path: testFile
    });

    if (!result.success) throw new Error(result.error || 'Read failed');

    // Cleanup
    await fs.unlink(testFile);

    return { fileRead: true };
  });

  await runTest('3.5 MCP Create Directory Tool', async () => {
    const testDir = path.join(process.cwd(), 'test-mcp-dir');

    const result = await toolManager.executeTool('mcp__create_directory', {
      path: testDir
    });

    if (!result.success) throw new Error(result.error || 'Directory creation failed');

    // Verify directory exists
    const dirExists = await fs.access(testDir).then(() => true).catch(() => false);
    if (!dirExists) throw new Error('Directory not created');

    // Cleanup
    await fs.rmdir(testDir);

    return { directoryCreated: true };
  });

  // ==========================================
  // PHASE 4: Custom Tools
  // ==========================================
  console.log('\n🛠️  PHASE 4: CUSTOM TOOLS\n');

  await runTest('4.1 TypeScript Validation Tool', async () => {
    const result = await toolManager.executeTool('validate_typescript', {});
    // TypeScript validation might fail due to project errors, but tool should execute
    return {
      executed: true,
      hasErrors: !result.success,
      output: result.output?.substring(0, 100) || result.error?.substring(0, 100)
    };
  });

  // ==========================================
  // PHASE 5: Agent Execution
  // ==========================================
  console.log('\n🤖 PHASE 5: AGENT EXECUTION WITH TOOLS\n');

  await runTest('5.1 Database Architect - Simple Schema Creation', async () => {
    // Ensure directory exists
    await fs.mkdir(path.join(process.cwd(), 'src/lib/db/schema'), { recursive: true });

    const result = await runAgent({
      agent: 'database-architect',
      input: `Create a simple Product schema with these fields:
- id (UUID, primary key)
- name (text, not null)
- price (numeric, not null)
- created_at (timestamp, default now)

Create the file at: src/lib/db/schema/products-test.ts

Use the mcp__write_file tool to create this file with proper Drizzle ORM syntax.`,
      outputFile: '.claude/state/artifacts/e2e-products-schema.md'
    });

    if (!result.success) throw new Error(result.error || 'Agent execution failed');

    // Check if file was created
    const schemaPath = path.join(process.cwd(), 'src/lib/db/schema/products-test.ts');
    const fileExists = await fs.access(schemaPath).then(() => true).catch(() => false);

    let fileContent = '';
    if (fileExists) {
      fileContent = await fs.readFile(schemaPath, 'utf-8');
      // Cleanup
      await fs.unlink(schemaPath);
    }

    return {
      agentSuccess: result.success,
      fileCreated: fileExists,
      duration: result.duration,
      cost: result.cost,
      tokensUsed: result.tokensUsed,
      fileHasContent: fileContent.length > 0,
      hasDrizzleImports: fileContent.includes('drizzle-orm'),
      hasTableDefinition: fileContent.includes('pgTable')
    };
  });

  // ==========================================
  // PHASE 6: File Creation Verification
  // ==========================================
  console.log('\n📁 PHASE 6: FILE CREATION VERIFICATION\n');

  await runTest('6.1 Verify Agent Created Actual Code File', async () => {
    // Run agent to create a test file
    await fs.mkdir(path.join(process.cwd(), 'src/test-e2e'), { recursive: true });

    const result = await runAgent({
      agent: 'database-architect',
      input: `Create a minimal test schema with just an id field.
File location: src/test-e2e/minimal.ts
Use mcp__write_file to create this file.`,
      outputFile: '.claude/state/artifacts/e2e-minimal.md'
    });

    const filePath = path.join(process.cwd(), 'src/test-e2e/minimal.ts');
    const exists = await fs.access(filePath).then(() => true).catch(() => false);

    if (exists) {
      const content = await fs.readFile(filePath, 'utf-8');
      // Cleanup
      await fs.unlink(filePath);
      await fs.rmdir(path.join(process.cwd(), 'src/test-e2e'));

      return {
        fileCreated: true,
        fileSize: content.length,
        hasCode: content.includes('import') || content.includes('export')
      };
    } else {
      throw new Error('Agent did not create the file');
    }
  });

  // ==========================================
  // PHASE 7: Error Handling
  // ==========================================
  console.log('\n⚠️  PHASE 7: ERROR HANDLING\n');

  await runTest('7.1 Handle Invalid Tool Call', async () => {
    const result = await toolManager.executeTool('nonexistent_tool', {});
    if (result.success) throw new Error('Should have failed for nonexistent tool');
    return { errorHandled: true };
  });

  await runTest('7.2 Handle Invalid File Path', async () => {
    const result = await toolManager.executeTool('mcp__read_text_file', {
      path: '/nonexistent/path/file.txt'
    });

    // MCP returns success:true but with error details in content
    const hasError = result.output?.toLowerCase().includes('error') ||
                     result.output?.toLowerCase().includes('access denied') ||
                     result.output?.toLowerCase().includes('not found') ||
                     result.output?.toLowerCase().includes('enoent') ||
                     !result.success;

    if (!hasError) throw new Error('Should have returned error for nonexistent file');
    return { errorHandled: true, errorDetected: hasError };
  });

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                           TEST SUMMARY                                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Pass Rate: ${passRate}%`);
  console.log('');

  if (failed > 0) {
    console.log('Failed Tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  ❌ ${r.name}`);
      console.log(`     ${r.message}`);
    });
    console.log('');
  }

  console.log('Detailed Results:');
  console.log('─'.repeat(80));
  results.forEach((r, i) => {
    const status = r.success ? '✅' : '❌';
    const duration = r.duration ? `${r.duration}ms` : 'N/A';
    console.log(`${i + 1}. ${status} ${r.name} (${duration})`);
    if (!r.success) {
      console.log(`   └─ ${r.message}`);
    }
  });
  console.log('─'.repeat(80));
  console.log('');

  // Cleanup tool manager
  if (toolManager) {
    await toolManager.shutdown();
  }

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! System is fully operational.\n');
    process.exit(0);
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please review the errors above.\n');
    process.exit(1);
  }
}

// Run comprehensive test
comprehensiveTest().catch(error => {
  console.error('\n❌ Test suite crashed:', error);
  process.exit(1);
});
