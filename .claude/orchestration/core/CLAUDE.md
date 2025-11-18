# Core Components

⚙️ **Tier:** Operational  
**Last Updated:** 2025-11-18  
**Auto-Generated:** Yes (manual sections preserved)

---

## 📁 Purpose

Core orchestration system components that power the multi-agent workflow engine.

---

## 📋 Contents

### Files in This Directory

- **agent-runner.ts** (423 lines)
  Agent Runner - Executes individual agents with the Claude API

- **CLAUDE.md** - Documentation

- **config.ts** (154 lines)
  Configuration - Agent configurations and settings

- **helpers.ts** (135 lines)
  Helper Utilities - Common functions used across orchestration

- **logger.ts** (53 lines)
  Logger - Simple logging utility

- **state-manager.ts** (238 lines)
  State Manager - Handles workflow state persistence and artifact management

- **tool-manager.ts** (536 lines)
  Tool Manager - Manages MCP integration and custom tool execution

- **types.ts** (228 lines)
  Core types for the multi-agent orchestration system

- **workflow-engine.ts** (405 lines)
  Workflow Engine - Orchestrates multi-agent workflows

---

## 🎯 Key Concepts

- Agent execution and tool calling
- MCP integration (14 filesystem tools)
- Custom validation tools (4 tools)
- Workflow orchestration (sequential & parallel)
- State management and persistence
- Cost tracking and optimization

---

## 🔗 Dependencies

### This Folder Depends On:

- @anthropic-ai/sdk - Claude API
- @modelcontextprotocol/sdk - MCP integration

### Other Folders That Depend On This:

- ../workflows/ - Uses these components
- ../cli/ - CLI interface to core
- Test files - Verify core functionality

---

## 🚀 Quick Start

### For Developers

1. **agent-runner.ts** - Start here to understand agent execution
2. **tool-manager.ts** - See how MCP tools are managed
3. **workflow-engine.ts** - Understand workflow orchestration
4. **types.ts** - Review type definitions for interfaces

### For AI Agents

When working with core components:
- Use tool-manager for file operations (14 MCP tools available)
- Use agent-runner to execute other agents
- Use workflow-engine for multi-step workflows
- Reference types.ts for proper type usage

---

## ⚠️ Important Notes

- ⚠️ Never modify core components without running full test suite
- ⚠️ All core components use strict TypeScript (no any types)
- ⚠️ Tool manager must be initialized before use
- ⚠️ Prompt caching is enabled by default (90%+ savings)

---

## 📝 Change Log

<!-- MANUAL EDIT SECTION - Add your changes below -->

### Recent Changes

- 2025-11-18: Auto-generated CLAUDE.md created

<!-- END MANUAL EDIT SECTION -->

---

## 📚 Related Documentation

- [Project Root CLAUDE.md](/CLAUDE.md)
- [Project Structure](/PROJECT-STRUCTURE.md)
- [Documentation Index](/.claude/DOCUMENTATION-INDEX.md)

- [Parent Folder](../orchestration/CLAUDE.md)

---

*Auto-generated on 2025-11-18 - Tier operational documentation*
