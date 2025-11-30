/**
 * InterviewCoachAgent Unit Tests
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 6)
 * Story: AI-GURU-004
 *
 * Tests interview question generation and STAR method evaluation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InterviewCoachAgent } from '../guru/InterviewCoachAgent';
import type { InterviewCoachInput } from '@/types/guru';

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn((params: { messages: Array<{ role: string; content?: string }> }) => {
          const userMessage = params.messages.find((m) => m.role === 'user')?.content || '';

          // Generate question
          if (userMessage.includes('Generate a')) {
            return Promise.resolve({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      question: 'Tell me about a time when you had to troubleshoot a complex rating issue in Guidewire PolicyCenter.',
                      type: 'behavioral',
                      difficulty: 'medium',
                      starComponents: {
                        situation: 'Consider a scenario where rating wasn\'t working as expected',
                        task: 'What was your specific responsibility?',
                        action: 'What steps did you take to diagnose and fix it?',
                        result: 'What was the outcome of your actions?',
                      },
                    }),
                  },
                },
              ],
            });
          }

          // Evaluate answer
          if (userMessage.includes('Evaluate this')) {
            return Promise.resolve({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      score: {
                        overall: 7,
                        technical: 8,
                        communication: 7,
                        confidence: 6,
                      },
                      feedback: [
                        'Good technical explanation of the rating tables',
                        'Clear description of the debugging process',
                        'Could improve on describing the business impact',
                      ],
                      suggestions: [
                        'Add more specific metrics (e.g., "reduced rating errors by 30%")',
                        'Emphasize collaboration with team members',
                      ],
                    }),
                  },
                },
              ],
            });
          }

          return Promise.resolve({ choices: [{ message: { content: '{}' } }] });
        }),
      },
    },
  })),
}));

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({})),
}));

describe('InterviewCoachAgent', () => {
  let agent: InterviewCoachAgent;

  beforeEach(() => {
    agent = new InterviewCoachAgent();
  });

  describe('Question Generation', () => {
    it('should generate behavioral interview question', async () => {
      const input: InterviewCoachInput = {
        studentId: 'test-student',
        interviewType: 'behavioral',
        guidewireModule: 'PolicyCenter',
      };

      const output = await agent.execute(input);

      expect(output).toBeTruthy();
      expect(output.question).toBeTruthy();
      expect(output.questionId).toBeTruthy();
      expect(output.sessionId).toBeTruthy();
    });

    it('should include STAR components for behavioral questions', async () => {
      const input: InterviewCoachInput = {
        studentId: 'test-student',
        interviewType: 'behavioral',
      };

      const output = await agent.execute(input);

      expect(output.starComponents).toBeDefined();
      expect(output.starComponents).toHaveProperty('situation');
      expect(output.starComponents).toHaveProperty('task');
      expect(output.starComponents).toHaveProperty('action');
      expect(output.starComponents).toHaveProperty('result');
    });

    it('should generate technical interview question', async () => {
      const input: InterviewCoachInput = {
        studentId: 'test-student',
        interviewType: 'technical',
        guidewireModule: 'BillingCenter',
      };

      const output = await agent.execute(input);

      expect(output.question).toBeTruthy();
      expect(output.questionId).toBeTruthy();
    });

    it('should generate Guidewire-specific question', async () => {
      const input: InterviewCoachInput = {
        studentId: 'test-student',
        interviewType: 'guidewire',
        guidewireModule: 'ClaimCenter',
      };

      const output = await agent.execute(input);

      expect(output.question).toBeTruthy();
    });

    it('should maintain session across questions', async () => {
      const sessionId = 'test-session-123';

      const input: InterviewCoachInput = {
        studentId: 'test-student',
        interviewType: 'behavioral',
        sessionId,
      };

      const output = await agent.execute(input);

      expect(output.sessionId).toBe(sessionId);
    });

    it('should generate sessionId if not provided', async () => {
      const input: InterviewCoachInput = {
        studentId: 'test-student',
        interviewType: 'behavioral',
      };

      const output = await agent.execute(input);

      expect(output.sessionId).toBeTruthy();
      expect(output.sessionId).toMatch(/^session-/);
    });
  });

  describe('Answer Evaluation', () => {
    it('should evaluate answer with scores', async () => {
      const input: InterviewCoachInput = {
        studentId: 'test-student',
        interviewType: 'behavioral',
        sessionId: 'test-session',
        questionId: 'q-123',
        answer: 'I worked on a project where we had to implement rating tables in PolicyCenter. I analyzed the requirements, designed the tables, and implemented the logic. The result was a 30% reduction in manual rating errors.',
      };

      const output = await agent.execute(input);

      expect(output.score).toBeDefined();
      expect(output.score!.overall).toBeGreaterThanOrEqual(1);
      expect(output.score!.overall).toBeLessThanOrEqual(10);
      expect(output.score!.technical).toBeGreaterThanOrEqual(1);
      expect(output.score!.technical).toBeLessThanOrEqual(10);
      expect(output.score!.communication).toBeGreaterThanOrEqual(1);
      expect(output.score!.communication).toBeLessThanOrEqual(10);
      expect(output.score!.confidence).toBeGreaterThanOrEqual(1);
      expect(output.score!.confidence).toBeLessThanOrEqual(10);
    });

    it('should provide detailed feedback', async () => {
      const input: InterviewCoachInput = {
        studentId: 'test-student',
        interviewType: 'behavioral',
        questionId: 'q-123',
        answer: 'Test answer',
      };

      const output = await agent.execute(input);

      expect(output.feedback).toBeDefined();
      expect(Array.isArray(output.feedback)).toBe(true);
      expect(output.feedback!.length).toBeGreaterThan(0);
    });

    it('should provide improvement suggestions', async () => {
      const input: InterviewCoachInput = {
        studentId: 'test-student',
        interviewType: 'behavioral',
        questionId: 'q-123',
        answer: 'Test answer',
      };

      const output = await agent.execute(input);

      expect(output.suggestions).toBeDefined();
      expect(Array.isArray(output.suggestions)).toBe(true);
      expect(output.suggestions!.length).toBeGreaterThan(0);
    });
  });

  describe('Interview Types', () => {
    it('should handle behavioral interviews', async () => {
      const input: InterviewCoachInput = {
        studentId: 'test-student',
        interviewType: 'behavioral',
      };

      const output = await agent.execute(input);
      expect(output).toBeTruthy();
    });

    it('should handle technical interviews', async () => {
      const input: InterviewCoachInput = {
        studentId: 'test-student',
        interviewType: 'technical',
      };

      const output = await agent.execute(input);
      expect(output).toBeTruthy();
    });

    it('should handle Guidewire-specific interviews', async () => {
      const input: InterviewCoachInput = {
        studentId: 'test-student',
        interviewType: 'guidewire',
      };

      const output = await agent.execute(input);
      expect(output).toBeTruthy();
    });
  });

  describe('Input Validation', () => {
    it('should throw error if studentId is missing', async () => {
      const input = {
        interviewType: 'behavioral',
      } as InterviewCoachInput;

      await expect(agent.execute(input)).rejects.toThrow('Missing required fields');
    });

    it('should throw error if interviewType is missing', async () => {
      const input = {
        studentId: 'test-student',
      } as InterviewCoachInput;

      await expect(agent.execute(input)).rejects.toThrow('Missing required fields');
    });

    it('should require both answer and questionId for evaluation', async () => {
      const inputWithAnswerOnly: InterviewCoachInput = {
        studentId: 'test-student',
        interviewType: 'behavioral',
        answer: 'Test answer',
      };

      // Should generate question instead of evaluating
      const output = await agent.execute(inputWithAnswerOnly);
      expect(output.question).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should complete in reasonable time (<5 seconds)', async () => {
      const input: InterviewCoachInput = {
        studentId: 'test-student',
        interviewType: 'behavioral',
      };

      const startTime = performance.now();
      await agent.execute(input);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(5000);
    });
  });
});
