/**
 * ProjectPlannerAgent
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 3)
 * Story: AI-GURU-003 - Project Planner Agent
 *
 * Generates capstone project plans with milestones and Guidewire-specific requirements.
 *
 * @module lib/ai/agents/guru/ProjectPlannerAgent
 */

import { BaseAgent, type AgentConfig } from '../BaseAgent';
import type {
  ProjectPlannerInput,
  ProjectPlannerOutput,
  ProjectMilestone,
  GuruError,
} from '@/types/guru';
import { GuruErrorCodes } from '@/types/guru';
import { loadPromptTemplate } from '../../prompts';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * Project Planner Agent
 *
 * Features:
 * - Capstone project breakdown with realistic timelines
 * - Milestone tracking with estimated hours
 * - Guidewire-specific requirements
 * - Progress monitoring
 * - Skill-level adapted planning
 */
export class ProjectPlannerAgent extends BaseAgent<
  ProjectPlannerInput,
  ProjectPlannerOutput
> {
  constructor(config?: Partial<AgentConfig>) {
    super({
      agentName: 'ProjectPlannerAgent',
      enableCostTracking: true,
      enableMemory: false,
      enableRAG: false,
      ...config,
    });
  }

  /**
   * Execute project planning
   *
   * @param input - Project type and student skill level
   * @returns Detailed project plan with milestones
   */
  async execute(input: ProjectPlannerInput): Promise<ProjectPlannerOutput> {
    const startTime = performance.now();

    try {
      // Validate input
      this.validateInput(input);

      // Route to optimal model
      const model = await this.routeModel('Project planning for Guidewire capstone');

      // Load prompt template
      const promptTemplate = loadPromptTemplate('project_planner');

      // Generate project plan
      const plan = await this.generateProjectPlan(input, promptTemplate, model.model);

      // Track cost
      const latencyMs = performance.now() - startTime;
      await this.trackCost(1200, 0.004, model.model, latencyMs);

      return plan;
    } catch (error) {
      throw this.createGuruError(
        `Failed to generate project plan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'AGENT_FAILED',
        { input, error }
      );
    }
  }

  /**
   * Validate input
   */
  private validateInput(input: ProjectPlannerInput): void {
    if (!input.studentId || !input.projectType || !input.guidewireModule) {
      throw this.createGuruError(
        'Missing required fields: studentId, projectType, guidewireModule',
        'VALIDATION_FAILED',
        { input }
      );
    }
  }

  /**
   * Generate project plan using GPT-4o-mini
   */
  private async generateProjectPlan(
    input: ProjectPlannerInput,
    promptTemplate: string,
    model: string
  ): Promise<ProjectPlannerOutput> {
    const skillLevel = input.skillLevel || 3; // Default: intermediate

    const prompt = `${promptTemplate}

PROJECT DETAILS:
- Type: ${input.projectType}
- Guidewire Module: ${input.guidewireModule}
- Student Skill Level: ${skillLevel}/5 (1=beginner, 5=expert)

Generate a detailed project plan with 4-6 milestones. Each milestone should have:
1. Clear title and description
2. Estimated hours (realistic for skill level ${skillLevel})
3. 3-5 specific tasks
4. Guidewire-specific requirements

Return JSON format:
{
  "title": "Project Title",
  "description": "Project description",
  "milestones": [
    {
      "title": "Milestone 1",
      "description": "What to achieve",
      "estimatedHours": 8,
      "tasks": [
        { "description": "Task 1", "estimatedMinutes": 120 },
        { "description": "Task 2", "estimatedMinutes": 180 }
      ]
    }
  ],
  "guidewireRequirements": ["Requirement 1", "Requirement 2"],
  "successCriteria": ["Criteria 1", "Criteria 2"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: promptTemplate,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(content);

    // Calculate total estimated hours
    const totalHours = parsed.milestones.reduce(
      (sum: number, m: any) => sum + (m.estimatedHours || 0),
      0
    );

    // Format milestones
    const milestones: ProjectMilestone[] = parsed.milestones.map((m: any, i: number) => ({
      id: `milestone-${i + 1}`,
      title: m.title,
      description: m.description,
      estimatedHours: m.estimatedHours,
      status: 'pending' as const,
      tasks: m.tasks.map((t: any, j: number) => ({
        id: `task-${i + 1}-${j + 1}`,
        description: t.description,
        estimatedMinutes: t.estimatedMinutes,
        completed: false,
      })),
    }));

    // Determine next action
    const nextAction = milestones[0]?.tasks[0]?.description || 'Start planning';

    const projectId = input.projectId || `project-${Date.now()}`;

    return {
      projectId,
      title: parsed.title,
      description: parsed.description,
      milestones,
      estimatedHours: totalHours,
      guidewireRequirements: parsed.guidewireRequirements || [],
      successCriteria: parsed.successCriteria || [],
      nextAction,
    };
  }

  /**
   * Create GuruError
   */
  private createGuruError(
    message: string,
    code: keyof typeof GuruErrorCodes,
    details?: any
  ): GuruError {
    const error = new Error(message) as GuruError;
    error.name = 'GuruError';
    error.code = code;
    error.details = details;
    return error;
  }
}
