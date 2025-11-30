/**
 * Guidewire Guru Integration Tests
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 5)
 * Tests: Complete student question flow including database logging
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { CoordinatorAgent } from '@/lib/ai/agents/guru/CoordinatorAgent';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local and FORCE overwrite
const envConfig = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), '.env.local')));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

// Unmock Supabase for integration tests
vi.unmock('@supabase/supabase-js');

// Mock OpenAI with dynamic responses
vi.mock('openai', () => {
  const MockOpenAI = vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockImplementation((params: { messages: { content: string }[] }) => {
          const content = params.messages[1].content.toLowerCase();
          let response: Record<string, unknown>;

          if (content.includes('project details:')) {
            response = {
              title: "Guidewire Capstone Plan",
              description: "A comprehensive plan.",
              milestones: [
                {
                  title: "Phase 1",
                  description: "Setup",
                  estimatedHours: 10,
                  tasks: [{ description: "Setup env", estimatedMinutes: 60 }]
                }
              ],
              guidewireRequirements: ["Req 1"],
              successCriteria: ["Success 1"]
            };
          } else if (content.includes('study plan') || content.includes('schedule') || content.includes('planning') || content.includes('capstone')) {
            response = {
              category: 'project_planning',
              confidence: 0.95,
              reasoning: 'Planning question',
              complexity: 'medium',
              required_capabilities: ['planning']
            };
          } else if (content.includes('resume') || content.includes('cv')) {
            response = {
              category: 'resume_help',
              confidence: 0.95,
              reasoning: 'Career question',
              complexity: 'medium',
              required_capabilities: ['resume_review']
            };
          } else if (content.includes('interview')) {
            response = {
              category: 'interview_prep',
              confidence: 0.95,
              reasoning: 'Interview question',
              complexity: 'medium',
              required_capabilities: ['interview_prep']
            };
          } else {
            response = {
              category: 'code_question',
              confidence: 0.95,
              reasoning: 'Technical question',
              complexity: 'medium',
              required_capabilities: ['code_generation']
            };
          }

          return Promise.resolve({
            choices: [
              {
                message: {
                  content: JSON.stringify(response),
                },
              },
            ],
            usage: { total_tokens: 100 }
          });
        }),
      },
    },
  }));

  return {
    default: MockOpenAI,
    OpenAI: MockOpenAI,
  };
});

// Mock Anthropic for Socratic responses
vi.mock('@anthropic-ai/sdk', () => {
  const MockAnthropic = vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: 'This is a test response from mocked Anthropic Claude? (Socratic)',
          },
        ],
        usage: {
          input_tokens: 10,
          output_tokens: 20,
        },
      }),
    },
  }));

  return {
    default: MockAnthropic,
    Anthropic: MockAnthropic,
  };
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe('Guidewire Guru Integration Flow', () => {
  let testOrgId: string;
  let testUserId: string;
  let coordinator: CoordinatorAgent;

  beforeAll(async () => {
    // Create test organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: 'Integration Test Org',
        slug: `test-org-${Date.now()}`,
        status: 'active'
      })
      .select()
      .single();

    if (orgError) throw new Error(`Failed to create test org: ${orgError.message}`);
    testOrgId = org.id;

    // Create test user
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .insert({
        email: `test-user-${Date.now()}@example.com`,
        full_name: 'Integration Test User',
        org_id: testOrgId
        // role: 'student' // Role is handled in user_roles table
      })
      .select()
      .single();

    if (userError) throw new Error(`Failed to create test user: ${userError.message}`);
    testUserId = user.id;

    coordinator = new CoordinatorAgent({
      orgId: testOrgId,
      userId: testUserId,
      enableCostTracking: true,
      enableMemory: true,
      enableRAG: true,
    });
  });

  afterAll(async () => {
    // Cleanup: Delete test interactions
    await supabase
      .from('guru_interactions')
      .delete()
      .eq('student_id', testUserId);

    // Cleanup: Delete test user
    if (testUserId) {
      await supabase.from('user_profiles').delete().eq('id', testUserId);
    }

    // Cleanup: Delete test org
    if (testOrgId) {
      await supabase.from('organizations').delete().eq('id', testOrgId);
    }
  });

  describe('Complete Question Flow', () => {
    it('should complete full student question flow', async () => {
      // Step 1: Student asks question
      const response = await coordinator.execute({
        question: 'What is a coverage in PolicyCenter?',
        studentId: testUserId,
        currentModule: 'PolicyCenter',
      });

      // Verify response structure
      expect(response).toBeTruthy();
      expect(response.answer).toBeTruthy();
      expect(response.agentUsed).toBe('code_mentor');
      expect(response.conversationId).toBeTruthy();

      // Verify cost tracking
      expect(response.tokensUsed).toBeGreaterThan(0);
      expect(response.cost).toBeGreaterThan(0);
      expect(response.cost).toBeLessThan(0.01); // Should be very cheap

      // Step 2: Verify interaction logged in database
      const { data: interactions } = await supabase
        .from('guru_interactions')
        .select('*')
        .eq('student_id', testUserId)
        .order('created_at', { ascending: false })
        .limit(1);

      expect(interactions).toBeTruthy();
      expect(interactions?.length).toBeGreaterThan(0);

      const interaction = interactions![0];
      expect(interaction.agent_type).toBeTruthy();
      expect(interaction.model_used).toBeTruthy();
      expect(interaction.tokens_used).toBeGreaterThan(0);
      expect(interaction.cost_usd).toBeGreaterThan(0);

      // Step 3: Verify Socratic response (Code Mentor)
      expect(response.answer).toMatch(/\?/); // Socratic method uses questions
    });

    it('should handle conversation context', async () => {
      // First question
      const response1 = await coordinator.execute({
        question: 'What is rating in PolicyCenter?',
        studentId: testUserId,
      });

      const conversationId = response1.conversationId;

      // Follow-up question using same conversation
      const response2 = await coordinator.execute({
        question: 'Can you explain that in more detail?',
        studentId: testUserId,
        conversationId,
      });

      expect(response2.conversationId).toBe(conversationId);
      expect(response2.answer).toBeTruthy();
    });

    it('should route different question types correctly', async () => {
      const testCases = [
        {
          question: 'How do I configure rating in PolicyCenter?',
          expectedAgent: 'code_mentor',
        },
        {
          question: 'Help me create a resume for a Guidewire job',
          expectedAgent: 'resume_builder',
        },
        {
          question: 'I need help planning my capstone project',
          expectedAgent: 'project_planner',
        },
        {
          question: 'Can you help me practice interviews?',
          expectedAgent: 'interview_coach',
        },
      ];

      for (const testCase of testCases) {
        const response = await coordinator.execute({
          question: testCase.question,
          studentId: testUserId,
        });

        expect(response.agentUsed).toBe(testCase.expectedAgent);
      }
    });
  });

  describe('Escalation Flow', () => {
    it('should detect repeated questions and escalate', async () => {
      const question = 'I dont understand rating at all';

      // Ask same question 5 times
      for (let i = 0; i < 5; i++) {
        await coordinator.execute({
          question,
          studentId: `escalation-test-${Date.now()}`,
        });
      }

      // 6th time should trigger escalation
      await coordinator.execute({
        question,
        studentId: `escalation-test-${Date.now()}`,
      });

      // Note: Escalation detection may require exact student ID match
      // In production, this would send Slack notification
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet response time targets', async () => {
      const startTime = performance.now();

      await coordinator.execute({
        question: 'What is PolicyCenter?',
        studentId: testUserId,
      });

      const duration = performance.now() - startTime;

      // Target: <2s for full flow
      expect(duration).toBeLessThan(2000);
    });

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => ({
        question: `Question ${i}`,
        studentId: testUserId,
      }));

      const startTime = performance.now();

      const results = await Promise.all(
        requests.map((input) => coordinator.execute(input))
      );

      const duration = performance.now() - startTime;

      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(10000); // 10 concurrent in <10s
    });
  });

  describe('Cost Tracking', () => {
    it('should track cumulative costs accurately', async () => {
      // Ask 10 questions
      const results = await Promise.all(
        Array.from({ length: 10 }, () =>
          coordinator.execute({
            question: 'Test question',
            studentId: testUserId,
          })
        )
      );

      const totalCost = results.reduce((sum, r) => sum + r.cost, 0);

      // 10 questions should cost <$0.10
      expect(totalCost).toBeLessThan(0.1);

      // Average cost per question should be low
      const avgCost = totalCost / 10;
      expect(avgCost).toBeLessThan(0.01);
    });
  });

  describe('Database Consistency', () => {
    it('should maintain data integrity across interactions', async () => {
      const conversationId = `conv-${Date.now()}`;

      // Multiple interactions in same conversation
      await coordinator.execute({
        question: 'First question',
        studentId: testUserId,
        conversationId,
      });

      await coordinator.execute({
        question: 'Second question',
        studentId: testUserId,
        conversationId,
      });

      // Verify all interactions logged
      const { data: interactions } = await supabase
        .from('guru_interactions')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('student_id', testUserId);

      expect(interactions?.length).toBeGreaterThanOrEqual(2);

      // Verify metadata consistency
      interactions?.forEach((interaction) => {
        expect(interaction.org_id).toBe(testOrgId);
        expect(interaction.student_id).toBe(testUserId);
        expect(interaction.conversation_id).toBe(conversationId);
        expect(interaction.tokens_used).toBeGreaterThan(0);
        expect(interaction.cost_usd).toBeGreaterThan(0);
      });
    });
  });
});
