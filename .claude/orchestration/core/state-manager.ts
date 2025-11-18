/**
 * State Manager - Handles workflow state persistence and artifact management
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import {
  WorkflowState,
  ArtifactMetadata,
  AgentName,
  WorkflowName,
  WorkflowContext,
  Result,
} from './types';
import { logger } from './logger';

// ============================================
// State Manager Class
// ============================================

export class StateManager {
  private stateDir: string;
  private artifactsDir: string;

  constructor(stateDir: string = '.claude/state', artifactsDir: string = '.claude/state/artifacts') {
    this.stateDir = path.join(process.cwd(), stateDir);
    this.artifactsDir = path.join(process.cwd(), artifactsDir);
  }

  /**
   * Initialize state directories
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.stateDir, { recursive: true });
    await fs.mkdir(this.artifactsDir, { recursive: true });
    logger.debug('[StateManager] Initialized state directories');
  }

  // ============================================
  // Workflow State Management
  // ============================================

  /**
   * Save workflow state
   */
  async saveWorkflowState(state: WorkflowState): Promise<void> {
    const filePath = path.join(this.stateDir, `workflow-${state.id}.json`);
    const data = JSON.stringify(state, null, 2);

    await fs.writeFile(filePath, data, 'utf-8');
    logger.debug(`[StateManager] Saved workflow state: ${state.id}`);
  }

  /**
   * Load workflow state
   */
  async loadWorkflowState(id: string): Promise<Result<WorkflowState>> {
    try {
      const filePath = path.join(this.stateDir, `workflow-${id}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      const state = JSON.parse(data) as WorkflowState;

      return { success: true, data: state };
    } catch (error) {
      return {
        success: false,
        error: `Workflow state not found: ${id}`,
      };
    }
  }

  /**
   * List all workflow states
   */
  async listWorkflowStates(): Promise<WorkflowState[]> {
    try {
      const files = await fs.readdir(this.stateDir);
      const workflowFiles = files.filter((f) => f.startsWith('workflow-'));

      const states = await Promise.all(
        workflowFiles.map(async (file) => {
          const data = await fs.readFile(path.join(this.stateDir, file), 'utf-8');
          return JSON.parse(data) as WorkflowState;
        })
      );

      return states.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      return [];
    }
  }

  /**
   * Delete workflow state
   */
  async deleteWorkflowState(id: string): Promise<void> {
    const filePath = path.join(this.stateDir, `workflow-${id}.json`);
    await fs.unlink(filePath);
    logger.debug(`[StateManager] Deleted workflow state: ${id}`);
  }

  // ============================================
  // Artifact Management
  // ============================================

  /**
   * Save artifact (with metadata)
   */
  async saveArtifact(
    filename: string,
    content: string,
    createdBy: AgentName
  ): Promise<void> {
    const filePath = path.join(this.artifactsDir, filename);

    // Calculate checksum
    const checksum = crypto.createHash('sha256').update(content).digest('hex');

    // Load existing metadata to get version
    const existingMetadata = await this.loadArtifactMetadata(filename);
    const version = existingMetadata.success ? existingMetadata.data.version + 1 : 1;

    // Save content
    await fs.writeFile(filePath, content, 'utf-8');

    // Save metadata
    const metadata: ArtifactMetadata = {
      filename,
      createdBy,
      createdAt: existingMetadata.success
        ? existingMetadata.data.createdAt
        : new Date(),
      updatedAt: new Date(),
      version,
      checksum,
    };

    const metadataPath = path.join(this.artifactsDir, `${filename}.meta.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');

    logger.debug(`[StateManager] Saved artifact: ${filename} (v${version})`);
  }

  /**
   * Load artifact
   */
  async loadArtifact(filename: string): Promise<Result<string>> {
    try {
      const filePath = path.join(this.artifactsDir, filename);
      const content = await fs.readFile(filePath, 'utf-8');

      return { success: true, data: content };
    } catch (error) {
      return {
        success: false,
        error: `Artifact not found: ${filename}`,
      };
    }
  }

  /**
   * Load artifact metadata
   */
  async loadArtifactMetadata(filename: string): Promise<Result<ArtifactMetadata>> {
    try {
      const metadataPath = path.join(this.artifactsDir, `${filename}.meta.json`);
      const data = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(data) as ArtifactMetadata;

      return { success: true, data: metadata };
    } catch (error) {
      return {
        success: false,
        error: `Artifact metadata not found: ${filename}`,
      };
    }
  }

  /**
   * List all artifacts
   */
  async listArtifacts(): Promise<ArtifactMetadata[]> {
    try {
      const files = await fs.readdir(this.artifactsDir);
      const metadataFiles = files.filter((f) => f.endsWith('.meta.json'));

      const metadata = await Promise.all(
        metadataFiles.map(async (file) => {
          const data = await fs.readFile(path.join(this.artifactsDir, file), 'utf-8');
          return JSON.parse(data) as ArtifactMetadata;
        })
      );

      return metadata.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      return [];
    }
  }

  /**
   * Delete artifact
   */
  async deleteArtifact(filename: string): Promise<void> {
    const filePath = path.join(this.artifactsDir, filename);
    const metadataPath = path.join(this.artifactsDir, `${filename}.meta.json`);

    await Promise.all([fs.unlink(filePath), fs.unlink(metadataPath)]);

    logger.debug(`[StateManager] Deleted artifact: ${filename}`);
  }

  /**
   * Clear all artifacts (useful for testing or fresh start)
   */
  async clearArtifacts(): Promise<void> {
    const files = await fs.readdir(this.artifactsDir);
    await Promise.all(
      files.map((file) => fs.unlink(path.join(this.artifactsDir, file)))
    );

    logger.debug('[StateManager] Cleared all artifacts');
  }
}

// ============================================
// Singleton Instance
// ============================================

let stateManager: StateManager | null = null;

export function getStateManager(): StateManager {
  if (!stateManager) {
    stateManager = new StateManager();
  }
  return stateManager;
}
