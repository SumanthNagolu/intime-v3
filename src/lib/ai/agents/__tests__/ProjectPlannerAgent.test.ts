/**
 * ProjectPlannerAgent Unit Tests
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 6)
 * Story: AI-GURU-003
 *
 * Tests capstone project planning and milestone generation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectPlannerAgent } from '../guru/ProjectPlannerAgent';
import type { ProjectPlannerInput } from '@/types/guru';

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(() => Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  title: 'Insurance Quote Management System',
                  description: 'Build a complete quote management system using Guidewire PolicyCenter',
                  milestones: [
                    {
                      title: 'Setup and Configuration',
                      description: 'Configure PolicyCenter environment and basic structures',
                      estimatedHours: 8,
                      tasks: [
                        { description: 'Install and configure PolicyCenter', estimatedMinutes: 120 },
                        { description: 'Set up development environment', estimatedMinutes: 90 },
                        { description: 'Create basic product model', estimatedMinutes: 150 },
                      ],
                    },
                    {
                      title: 'Quote Logic Implementation',
                      description: 'Implement quote calculation and rating logic',
                      estimatedHours: 16,
                      tasks: [
                        { description: 'Design rating tables', estimatedMinutes: 180 },
                        { description: 'Implement rate calculation logic', estimatedMinutes: 240 },
                        { description: 'Add coverage options', estimatedMinutes: 180 },
                        { description: 'Test quote flow', estimatedMinutes: 120 },
                      ],
                    },
                  ],
                  guidewireRequirements: [
                    'PolicyCenter 10.0 or higher',
                    'Understanding of rating tables',
                    'Knowledge of product model configuration',
                  ],
                  successCriteria: [
                    'Quote can be created successfully',
                    'Rates calculate correctly based on inputs',
                    'All coverages are selectable',
                    'System passes integration tests',
                  ],
                }),
              },
            },
          ],
        })),
      },
    },
  })),
}));

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({})),
}));

describe('ProjectPlannerAgent', () => {
  let agent: ProjectPlannerAgent;

  beforeEach(() => {
    agent = new ProjectPlannerAgent();
  });

  describe('Project Plan Generation', () => {
    it('should generate complete project plan', async () => {
      const input: ProjectPlannerInput = {
        studentId: 'test-student',
        projectType: 'Quote Management System',
        guidewireModule: 'PolicyCenter',
        skillLevel: 3,
      };

      const output = await agent.execute(input);

      expect(output).toBeTruthy();
      expect(output.title).toBeTruthy();
      expect(output.description).toBeTruthy();
      expect(output.projectId).toBeTruthy();
    });

    it('should include milestones with tasks', async () => {
      const input: ProjectPlannerInput = {
        studentId: 'test-student',
        projectType: 'Billing System',
        guidewireModule: 'BillingCenter',
        skillLevel: 3,
      };

      const output = await agent.execute(input);

      expect(output.milestones).toBeDefined();
      expect(Array.isArray(output.milestones)).toBe(true);
      expect(output.milestones.length).toBeGreaterThan(0);

      // Check milestone structure
      const firstMilestone = output.milestones[0];
      expect(firstMilestone.id).toBeTruthy();
      expect(firstMilestone.title).toBeTruthy();
      expect(firstMilestone.description).toBeTruthy();
      expect(firstMilestone.estimatedHours).toBeGreaterThan(0);
      expect(firstMilestone.status).toBe('pending');
      expect(Array.isArray(firstMilestone.tasks)).toBe(true);
    });

    it('should include Guidewire-specific requirements', async () => {
      const input: ProjectPlannerInput = {
        studentId: 'test-student',
        projectType: 'Claims Processing',
        guidewireModule: 'ClaimCenter',
        skillLevel: 4,
      };

      const output = await agent.execute(input);

      expect(output.guidewireRequirements).toBeDefined();
      expect(Array.isArray(output.guidewireRequirements)).toBe(true);
      expect(output.guidewireRequirements.length).toBeGreaterThan(0);
    });

    it('should include success criteria', async () => {
      const input: ProjectPlannerInput = {
        studentId: 'test-student',
        projectType: 'Rating Engine',
        guidewireModule: 'PolicyCenter',
        skillLevel: 3,
      };

      const output = await agent.execute(input);

      expect(output.successCriteria).toBeDefined();
      expect(Array.isArray(output.successCriteria)).toBe(true);
      expect(output.successCriteria.length).toBeGreaterThan(0);
    });

    it('should calculate total estimated hours', async () => {
      const input: ProjectPlannerInput = {
        studentId: 'test-student',
        projectType: 'Full Stack Project',
        guidewireModule: 'PolicyCenter',
        skillLevel: 3,
      };

      const output = await agent.execute(input);

      expect(output.estimatedHours).toBeDefined();
      expect(output.estimatedHours).toBeGreaterThan(0);

      // Verify it matches sum of milestone hours
      const calculatedTotal = output.milestones.reduce(
        (sum, m) => sum + m.estimatedHours,
        0
      );
      expect(output.estimatedHours).toBe(calculatedTotal);
    });

    it('should provide next action', async () => {
      const input: ProjectPlannerInput = {
        studentId: 'test-student',
        projectType: 'Test Project',
        guidewireModule: 'PolicyCenter',
        skillLevel: 3,
      };

      const output = await agent.execute(input);

      expect(output.nextAction).toBeTruthy();
      expect(typeof output.nextAction).toBe('string');
    });
  });

  describe('Skill Level Adaptation', () => {
    it('should work with beginner skill level', async () => {
      const input: ProjectPlannerInput = {
        studentId: 'test-student',
        projectType: 'Simple Quote System',
        guidewireModule: 'PolicyCenter',
        skillLevel: 1,
      };

      const output = await agent.execute(input);
      expect(output).toBeTruthy();
    });

    it('should work with expert skill level', async () => {
      const input: ProjectPlannerInput = {
        studentId: 'test-student',
        projectType: 'Advanced Integration',
        guidewireModule: 'PolicyCenter',
        skillLevel: 5,
      };

      const output = await agent.execute(input);
      expect(output).toBeTruthy();
    });

    it('should default to intermediate if skill level not provided', async () => {
      const input: ProjectPlannerInput = {
        studentId: 'test-student',
        projectType: 'Standard Project',
        guidewireModule: 'PolicyCenter',
      };

      const output = await agent.execute(input);
      expect(output).toBeTruthy();
    });
  });

  describe('Input Validation', () => {
    it('should throw error if studentId is missing', async () => {
      const input = {
        projectType: 'Test',
        guidewireModule: 'PolicyCenter',
      } as ProjectPlannerInput;

      await expect(agent.execute(input)).rejects.toThrow('Missing required fields');
    });

    it('should throw error if projectType is missing', async () => {
      const input = {
        studentId: 'test-student',
        guidewireModule: 'PolicyCenter',
      } as ProjectPlannerInput;

      await expect(agent.execute(input)).rejects.toThrow('Missing required fields');
    });

    it('should throw error if guidewireModule is missing', async () => {
      const input = {
        studentId: 'test-student',
        projectType: 'Test',
      } as ProjectPlannerInput;

      await expect(agent.execute(input)).rejects.toThrow('Missing required fields');
    });
  });

  describe('Performance', () => {
    it('should complete in reasonable time (<10 seconds)', async () => {
      const input: ProjectPlannerInput = {
        studentId: 'test-student',
        projectType: 'Test Project',
        guidewireModule: 'PolicyCenter',
        skillLevel: 3,
      };

      const startTime = performance.now();
      await agent.execute(input);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(10000);
    });
  });
});
