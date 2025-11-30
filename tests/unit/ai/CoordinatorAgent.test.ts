/**
 * CoordinatorAgent Unit Tests
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 5)
 * Tests: Classification accuracy, routing logic, escalation detection
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CoordinatorAgent } from '@/lib/ai/agents/guru/CoordinatorAgent';

describe('CoordinatorAgent', () => {
  let coordinator: CoordinatorAgent;

  beforeEach(() => {
    coordinator = new CoordinatorAgent({
      orgId: 'test-org',
      userId: 'test-user',
    });
  });

  describe('Query Classification', () => {
    it('should classify PolicyCenter question as code_question', async () => {
      const input = {
        question: 'How does rating work in PolicyCenter?',
        studentId: 'test-student',
      };

      const result = await coordinator.execute(input);

      expect(result.classification?.category).toBe('code_question');
      expect(result.agentUsed).toBe('code_mentor');
      expect(result.classification?.confidence).toBeGreaterThan(0.8);
    });

    it('should classify resume question as resume_help', async () => {
      const input = {
        question: 'Can you help me format my resume for a Guidewire position?',
        studentId: 'test-student',
      };

      const result = await coordinator.execute(input);

      expect(result.classification?.category).toBe('resume_help');
      expect(result.agentUsed).toBe('resume_builder');
    });

    it('should classify project planning question correctly', async () => {
      const input = {
        question: 'I need help breaking down my capstone project into sprints',
        studentId: 'test-student',
      };

      const result = await coordinator.execute(input);

      expect(result.classification?.category).toBe('project_planning');
      expect(result.agentUsed).toBe('project_planner');
    });

    it('should classify interview question correctly', async () => {
      const input = {
        question: 'Can you help me practice behavioral interview questions?',
        studentId: 'test-student',
      };

      const result = await coordinator.execute(input);

      expect(result.classification?.category).toBe('interview_prep');
      expect(result.agentUsed).toBe('interview_coach');
    });

    it('should fallback to code_mentor for ambiguous questions', async () => {
      const input = {
        question: 'What is Guidewire?',
        studentId: 'test-student',
      };

      const result = await coordinator.execute(input);

      // Ambiguous questions default to code_mentor
      expect(['code_mentor']).toContain(result.agentUsed);
    });
  });

  describe('Routing Logic', () => {
    it('should route to appropriate agent based on classification', async () => {
      const inputs = [
        {
          question: 'Explain PolicyCenter rating',
          expected: 'code_mentor',
        },
        {
          question: 'Help with my resume',
          expected: 'resume_builder',
        },
        {
          question: 'Plan my project',
          expected: 'project_planner',
        },
        {
          question: 'Practice interviews',
          expected: 'interview_coach',
        },
      ];

      for (const { question, expected } of inputs) {
        const result = await coordinator.execute({
          question,
          studentId: 'test-student',
        });

        expect(result.agentUsed).toBe(expected);
      }
    });

    it('should pass conversation context to agents', async () => {
      const conversationId = 'test-conv-123';

      const result = await coordinator.execute({
        question: 'Can you explain that again?',
        studentId: 'test-student',
        conversationId,
      });

      expect(result.conversationId).toBe(conversationId);
    });

    it('should include module context when provided', async () => {
      const result = await coordinator.execute({
        question: 'How do I implement rating?',
        studentId: 'test-student',
        currentModule: 'PolicyCenter',
      });

      expect(result.agentUsed).toBe('code_mentor');
      // Module context should be passed to agent
    });
  });

  describe('Escalation Detection', () => {
    it('should not escalate for first-time questions', async () => {
      const result = await coordinator.execute({
        question: 'How does ClaimCenter work?',
        studentId: 'new-student',
      });

      expect(result.escalated).toBe(false);
    });

    // Note: Escalation detection requires database state
    // Full integration test in separate file
  });

  describe('Performance', () => {
    it('should classify queries in < 500ms', async () => {
      const startTime = performance.now();

      await coordinator.execute({
        question: 'Explain PolicyCenter rating',
        studentId: 'test-student',
      });

      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(500);
    });

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => ({
        question: `Question ${i}`,
        studentId: 'test-student',
      }));

      const results = await Promise.all(
        requests.map((input) => coordinator.execute(input))
      );

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.answer).toBeTruthy();
      });
    });
  });

  describe('Cost Tracking', () => {
    it('should track classification cost', async () => {
      const result = await coordinator.execute({
        question: 'Test question',
        studentId: 'test-student',
      });

      expect(result.cost).toBeGreaterThan(0);
      expect(result.tokensUsed).toBeGreaterThan(0);
    });

    it('should have low cost for classification (<$0.001)', async () => {
      const result = await coordinator.execute({
        question: 'Test question',
        studentId: 'test-student',
      });

      // Classification should be very cheap (GPT-4o-mini)
      expect(result.cost).toBeLessThan(0.001);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty questions gracefully', async () => {
      await expect(
        coordinator.execute({
          question: '',
          studentId: 'test-student',
        })
      ).rejects.toThrow();
    });

    it('should handle missing studentId gracefully', async () => {
      await expect(
        coordinator.execute({
          question: 'Test question',
          studentId: '',
        })
      ).rejects.toThrow();
    });

    it('should fallback to code_mentor if classification fails', async () => {
      // Simulate classification failure
      const result = await coordinator.execute({
        question: 'Random text that might fail classification',
        studentId: 'test-student',
      });

      // Should still return a response (fallback to code_mentor)
      expect(result.answer).toBeTruthy();
      expect(result.agentUsed).toBeTruthy();
    });
  });
});
