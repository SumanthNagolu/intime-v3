/**
 * Tool Manager - Manages MCP integration and custom tool execution
 *
 * Hybrid approach:
 * - MCP tools: Filesystem, GitHub, PostgreSQL (infrastructure)
 * - Custom tools: Validation, testing, build operations (business logic)
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger';

// ============================================
// Types
// ============================================

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
}

export interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

// ============================================
// Tool Manager Class
// ============================================

export class ToolManager {
  private mcpClients: Map<string, Client> = new Map();
  private mcpTools: Map<string, ToolDefinition> = new Map();
  private initialized: boolean = false;

  /**
   * Initialize MCP servers and load tools
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.info('[ToolManager] Initializing MCP connections...');

    try {
      // Connect to filesystem MCP server (most critical for file creation)
      await this.connectFilesystemMCP();

      // TODO: Connect to other MCP servers as needed
      // await this.connectPostgresMCP();
      // await this.connectGitHubMCP();

      this.initialized = true;
      logger.success(
        `[ToolManager] Initialized with ${this.mcpTools.size} MCP tools`
      );
    } catch (error) {
      logger.error(
        `[ToolManager] Failed to initialize: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Connect to filesystem MCP server
   */
  private async connectFilesystemMCP(): Promise<void> {
    try {
      const transport = new StdioClientTransport({
        command: 'npx',
        args: [
          '-y',
          '@modelcontextprotocol/server-filesystem',
          process.cwd(),
        ],
      });

      const client = new Client(
        {
          name: 'intime-agent-runner',
          version: '1.0.0',
        },
        {
          capabilities: {},
        }
      );

      await client.connect(transport);

      // List available tools from filesystem server
      const { tools } = await client.listTools();

      // Store client
      this.mcpClients.set('filesystem', client);

      // Register tools with mcp__ prefix
      for (const tool of tools) {
        const toolDef: ToolDefinition = {
          name: `mcp__${tool.name}`,
          description: tool.description || '',
          input_schema: tool.inputSchema as any,
        };
        this.mcpTools.set(toolDef.name, toolDef);
      }

      logger.debug(
        `[ToolManager] Connected to filesystem MCP (${tools.length} tools)`
      );
    } catch (error) {
      logger.warn(
        `[ToolManager] Filesystem MCP not available: ${error instanceof Error ? error.message : String(error)}`
      );
      // Don't fail initialization if MCP is not available
      // Fall back to custom tools only
    }
  }

  /**
   * Get all available tools for an agent
   */
  async getTools(agentName?: string): Promise<ToolDefinition[]> {
    const tools: ToolDefinition[] = [];

    // Add MCP tools
    tools.push(...Array.from(this.mcpTools.values()));

    // Add custom tools
    tools.push(...this.getCustomTools(agentName));

    return tools;
  }

  /**
   * Get custom tools (non-MCP)
   */
  private getCustomTools(agentName?: string): ToolDefinition[] {
    const customTools: ToolDefinition[] = [
      {
        name: 'validate_typescript',
        description: 'Run TypeScript compiler to check for errors',
        input_schema: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'File paths to check (optional, checks all if not provided)',
            },
          },
        },
      },
      {
        name: 'run_tests',
        description: 'Run test suite with Vitest',
        input_schema: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Test file pattern (optional)',
            },
          },
        },
      },
      {
        name: 'run_build',
        description: 'Run production build',
        input_schema: {
          type: 'object',
          properties: {
            check_only: {
              type: 'boolean',
              description: 'Only check if build would succeed, do not create dist',
            },
          },
        },
      },
    ];

    // Agent-specific tools
    if (agentName === 'database-architect') {
      customTools.push({
        name: 'validate_drizzle_schema',
        description: 'Validate Drizzle schema syntax',
        input_schema: {
          type: 'object',
          properties: {
            schema_path: {
              type: 'string',
              description: 'Path to schema file',
            },
          },
          required: ['schema_path'],
        },
      });
    }

    if (agentName === 'frontend-developer') {
      customTools.push({
        name: 'check_accessibility',
        description: 'Check React component for accessibility issues',
        input_schema: {
          type: 'object',
          properties: {
            component_path: {
              type: 'string',
              description: 'Path to component file',
            },
          },
          required: ['component_path'],
        },
      });
    }

    return customTools;
  }

  /**
   * Execute a tool (MCP or custom)
   */
  async executeTool(
    toolName: string,
    input: Record<string, any>
  ): Promise<ToolExecutionResult> {
    logger.info(`[ToolManager] Executing tool: ${toolName}`);

    try {
      // Check if it's an MCP tool
      if (toolName.startsWith('mcp__')) {
        return await this.executeMCPTool(toolName, input);
      }

      // Execute custom tool
      return await this.executeCustomTool(toolName, input);
    } catch (error) {
      logger.error(
        `[ToolManager] Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute MCP tool via connected client
   */
  private async executeMCPTool(
    toolName: string,
    input: Record<string, any>
  ): Promise<ToolExecutionResult> {
    // Remove mcp__ prefix and determine server
    const actualToolName = toolName.replace('mcp__', '');

    // For now, assume filesystem server (can be extended)
    const client = this.mcpClients.get('filesystem');

    if (!client) {
      return {
        success: false,
        error: 'Filesystem MCP server not connected',
      };
    }

    try {
      const result = await client.callTool({
        name: actualToolName,
        arguments: input,
      });

      return {
        success: true,
        output: JSON.stringify(result.content, null, 2),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute custom tool (non-MCP)
   */
  private async executeCustomTool(
    toolName: string,
    input: Record<string, any>
  ): Promise<ToolExecutionResult> {
    switch (toolName) {
      case 'validate_typescript':
        return await this.validateTypeScript(input);

      case 'run_tests':
        return await this.runTests(input);

      case 'run_build':
        return await this.runBuild(input);

      case 'validate_drizzle_schema':
        return await this.validateDrizzleSchema(input);

      case 'check_accessibility':
        return await this.checkAccessibility(input);

      default:
        return {
          success: false,
          error: `Unknown tool: ${toolName}`,
        };
    }
  }

  // ============================================
  // Custom Tool Implementations
  // ============================================

  private async validateTypeScript(input: Record<string, any>): Promise<ToolExecutionResult> {
    try {
      const { stdout, stderr } = await this.runCommand('pnpm', [
        'tsc',
        '--noEmit',
        ...(input.files || []),
      ]);

      const hasErrors = stderr.includes('error TS');

      return {
        success: !hasErrors,
        output: hasErrors ? stderr : 'TypeScript validation passed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async runTests(input: Record<string, any>): Promise<ToolExecutionResult> {
    try {
      const args = ['test'];
      if (input.pattern) {
        args.push(input.pattern);
      }

      const { stdout } = await this.runCommand('pnpm', args);

      return {
        success: true,
        output: stdout,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async runBuild(input: Record<string, any>): Promise<ToolExecutionResult> {
    try {
      const { stdout } = await this.runCommand('pnpm', ['build']);

      return {
        success: true,
        output: stdout,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async validateDrizzleSchema(input: Record<string, any>): Promise<ToolExecutionResult> {
    try {
      const schemaPath = path.join(process.cwd(), input.schema_path);
      const content = await fs.readFile(schemaPath, 'utf-8');

      // Basic validation: check for Drizzle imports and table definitions
      const hasImports = content.includes('drizzle-orm');
      const hasTable = content.includes('pgTable') || content.includes('mysqlTable');

      if (!hasImports || !hasTable) {
        return {
          success: false,
          error: 'Schema file does not appear to be a valid Drizzle schema',
        };
      }

      return {
        success: true,
        output: 'Drizzle schema validation passed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async checkAccessibility(input: Record<string, any>): Promise<ToolExecutionResult> {
    try {
      const componentPath = path.join(process.cwd(), input.component_path);
      const content = await fs.readFile(componentPath, 'utf-8');

      // Basic accessibility checks
      const issues: string[] = [];

      // Check for button without accessible text
      if (content.includes('<button') && !content.includes('aria-label') && !content.includes('children')) {
        issues.push('Button elements should have accessible text or aria-label');
      }

      // Check for img without alt
      if (content.includes('<img') && !content.includes('alt=')) {
        issues.push('Image elements must have alt attribute');
      }

      // Check for input without label
      if (content.includes('<input') && !content.includes('aria-label') && !content.includes('<label')) {
        issues.push('Input elements should have associated labels or aria-label');
      }

      if (issues.length > 0) {
        return {
          success: false,
          output: `Accessibility issues found:\n${issues.join('\n')}`,
        };
      }

      return {
        success: true,
        output: 'Accessibility check passed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Run shell command and return output
   */
  private runCommand(
    command: string,
    args: string[]
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, {
        cwd: process.cwd(),
        env: process.env,
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });

      proc.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Shutdown all MCP connections
   */
  async shutdown(): Promise<void> {
    logger.info('[ToolManager] Shutting down MCP connections...');

    for (const [name, client] of this.mcpClients.entries()) {
      try {
        await client.close();
        logger.debug(`[ToolManager] Closed ${name} MCP connection`);
      } catch (error) {
        logger.warn(
          `[ToolManager] Error closing ${name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    this.mcpClients.clear();
    this.mcpTools.clear();
    this.initialized = false;
  }
}

// ============================================
// Singleton Instance
// ============================================

let toolManager: ToolManager | null = null;

export function getToolManager(): ToolManager {
  if (!toolManager) {
    toolManager = new ToolManager();
  }
  return toolManager;
}
