#!/usr/bin/env node
/**
 * Final Proof Test - Creates a real file and shows it to the user
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { runAgent } from './core/agent-runner';
import { getToolManager } from './core/tool-manager';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

console.log('\n🚀 FINAL PROOF TEST - Agent File Creation\n');
console.log('This test will:\n');
console.log('  1. ✅ Initialize MCP tools');
console.log('  2. ✅ Ask database-architect agent to create a schema file');
console.log('  3. ✅ Verify the file was created');
console.log('  4. ✅ Show you the actual file contents');
console.log('\n' + '='.repeat(80) + '\n');

async function main() {
  const startTime = Date.now();

  // Initialize
  const toolManager = getToolManager();
  await toolManager.initialize();
  console.log('✅ MCP tools initialized\n');

  // Run agent
  console.log('🤖 Executing database-architect agent...\n');
  const result = await runAgent({
    agent: 'database-architect',
    input: `Create a database schema file at src/lib/db/schema/final-proof.ts

Create a simple "posts" table with:
- id (UUID primary key)
- title (text, not null)
- content (text)
- author_id (UUID)
- created_at (timestamp)
- updated_at (timestamp)

Use Drizzle ORM with PostgreSQL (import from 'drizzle-orm/pg-core').

Keep it simple and focused. Just create this one file.`,
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  if (!result.success) {
    console.error('❌ Agent failed:', result.error);
    process.exit(1);
  }

  console.log(`✅ Agent completed in ${duration}s`);
  console.log(`💰 Cost: $${result.cost.toFixed(4)}`);
  console.log(`📊 Tokens: ${result.tokensUsed.input} input, ${result.tokensUsed.output} output, ${result.tokensUsed.cached} cached\n`);

  // Verify file exists
  const filePath = path.join(process.cwd(), 'src/lib/db/schema/final-proof.ts');
  if (!existsSync(filePath)) {
    console.error('❌ File was not created at expected path');
    console.error('Expected:', filePath);
    process.exit(1);
  }

  console.log('✅ File created successfully!\n');
  console.log('📄 File location:', filePath);
  console.log('\n' + '='.repeat(80));
  console.log('FILE CONTENTS:');
  console.log('='.repeat(80) + '\n');

  const fileContents = await readFile(filePath, 'utf-8');
  console.log(fileContents);

  console.log('\n' + '='.repeat(80));
  console.log('\n🎉 SUCCESS! The agent created a real file using MCP tools! 🎉\n');

  // Shutdown
  await toolManager.shutdown();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
