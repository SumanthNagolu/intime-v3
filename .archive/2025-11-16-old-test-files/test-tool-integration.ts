#!/usr/bin/env node
/**
 * Test Script - Verify Tool Integration
 *
 * This script tests that agents can actually create files using MCP tools
 */

// Load environment variables from .env.local
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { runAgent } from './core/agent-runner';
import { getToolManager } from './core/tool-manager';
import fs from 'fs/promises';

async function testToolIntegration() {
  console.log('\n🧪 Testing Tool Integration...\n');

  try {
    // Test 1: Initialize Tool Manager
    console.log('1. Initializing Tool Manager...');
    const toolManager = getToolManager();
    await toolManager.initialize();
    console.log('✓ Tool Manager initialized\n');

    // Test 2: List Available Tools
    console.log('2. Loading available tools...');
    const tools = await toolManager.getTools('database-architect');
    console.log(`✓ Loaded ${tools.length} tools`);
    tools.forEach((tool) => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
    console.log('');

    // Test 3: Test MCP write_file Tool Directly
    console.log('3. Testing MCP write_file tool directly...');
    const testFilePath = path.join(process.cwd(), 'test-output.txt');
    const writeResult = await toolManager.executeTool('mcp__write_file', {
      path: testFilePath,
      content: 'Hello from MCP tools! This file was created by the Tool Manager.',
    });

    if (writeResult.success) {
      console.log('✓ MCP write_file executed successfully');
      const fileExists = await fs
        .access(testFilePath)
        .then(() => true)
        .catch(() => false);
      if (fileExists) {
        console.log(`✓ File created at: ${testFilePath}`);
        const content = await fs.readFile(testFilePath, 'utf-8');
        console.log(`✓ File content: "${content}"`);

        // Cleanup
        await fs.unlink(testFilePath);
        console.log('✓ Cleaned up test file\n');
      } else {
        console.log('✗ File not found after creation\n');
      }
    } else {
      console.log(`✗ MCP write_file failed: ${writeResult.error}\n`);
    }

    // Test 4: Test Custom Tool (validate_typescript)
    console.log('4. Testing custom tool (validate_typescript)...');
    const tsResult = await toolManager.executeTool('validate_typescript', {});
    console.log(`${tsResult.success ? '✓' : '✗'} TypeScript validation: ${tsResult.success ? 'passed' : tsResult.error}`);
    console.log('');

    // Test 5: Run Database Architect Agent with File Creation
    console.log('5. Testing Database Architect agent with file creation...');
    console.log('   Request: "Create a simple users table schema"');
    console.log('   Expected: Agent should create actual schema file in src/');
    console.log('');

    const result = await runAgent({
      agent: 'database-architect',
      input: `
Create a simple Drizzle schema file for a "users" table with these fields:
- id (UUID, primary key)
- email (text, unique, not null)
- name (text, not null)
- created_at (timestamp, default now)

Create the file at: src/lib/db/schema/test-users.ts

Use the mcp__write_file tool to create the actual file.
      `.trim(),
      outputFile: '.claude/state/artifacts/db-architect-test.md',
    });

    console.log('\n📊 Agent Execution Result:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Cost: $${result.cost.toFixed(4)}`);
    console.log(`   Tokens: ${result.tokensUsed.input} in / ${result.tokensUsed.output} out`);
    console.log(`   Output file: ${result.outputFile}`);
    console.log('');

    // Check if actual schema file was created
    const schemaPath = path.join(process.cwd(), 'src/lib/db/schema/test-users.ts');
    const schemaExists = await fs
      .access(schemaPath)
      .then(() => true)
      .catch(() => false);

    if (schemaExists) {
      console.log('🎉 SUCCESS! Agent created actual file:');
      console.log(`   ${schemaPath}`);
      const schemaContent = await fs.readFile(schemaPath, 'utf-8');
      console.log('\n   Preview (first 200 chars):');
      console.log(`   ${schemaContent.substring(0, 200)}...`);

      // Cleanup
      await fs.unlink(schemaPath);
      console.log('\n✓ Cleaned up test schema file');
    } else {
      console.log('⚠️  Agent did not create actual file');
      console.log('   Checking artifact for explanation...');
      if (result.outputFile) {
        const artifactContent = await fs.readFile(result.outputFile, 'utf-8');
        console.log('\n   Agent output (first 500 chars):');
        console.log(`   ${artifactContent.substring(0, 500)}...`);
      }
    }

    console.log('\n✅ Tool Integration Test Complete!\n');

    // Shutdown
    await toolManager.shutdown();
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('');
    process.exit(1);
  }
}

// Run test
testToolIntegration();
