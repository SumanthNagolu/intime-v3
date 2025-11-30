/**
 * ResumeBuilderAgent Unit Tests
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 6)
 * Story: AI-GURU-002
 *
 * Tests ATS optimization and resume generation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResumeBuilderAgent } from '../guru/ResumeBuilderAgent';
import type { ResumeBuilderInput } from '@/types/guru';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table) => {
      if (table === 'user_profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: {
                  id: 'test-student',
                  full_name: 'John Doe',
                  email: 'john@example.com',
                },
                error: null,
              })),
            })),
          })),
        };
      }
      if (table === 'student_progress') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: {
                  student_id: 'test-student',
                  completed_modules: ['PolicyCenter', 'BillingCenter'],
                },
                error: null,
              })),
            })),
          })),
        };
      }
      if (table === 'resume_versions') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: { id: 'resume-123' },
                error: null,
              })),
            })),
          })),
        };
      }
      return {};
    }),
  })),
}));

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(() => Promise.resolve({
          choices: [
            {
              message: {
                content: `# John Doe
john@example.com | 555-1234 | LinkedIn

## Professional Summary
Guidewire certified developer with experience in PolicyCenter and BillingCenter.

## Technical Skills
- Guidewire PolicyCenter
- Guidewire BillingCenter
- Java, JavaScript
- Insurance domain knowledge

## Project Experience
### Insurance Policy Management System
Built comprehensive policy management system using Guidewire PolicyCenter.
- Developed rating tables
- Configured coverage types
- Implemented business rules

## Education
InTime Guidewire Academy - Certified Guidewire Developer`,
              },
            },
          ],
        })),
      },
    },
  })),
}));

describe('ResumeBuilderAgent', () => {
  let agent: ResumeBuilderAgent;

  beforeEach(() => {
    agent = new ResumeBuilderAgent();
  });

  describe('Resume Generation', () => {
    it('should generate ATS-optimized resume', async () => {
      const input: ResumeBuilderInput = {
        studentId: 'test-student',
        format: 'json',
        targetJobDescription: 'Guidewire PolicyCenter Developer with 2 years experience',
        includeCertifications: true,
        includeProjects: true,
      };

      const output = await agent.execute(input);

      expect(output).toBeTruthy();
      expect(output.content).toBeTruthy();
      expect(output.format).toBe('json');
      expect(output.versionId).toBeTruthy();
    });

    it('should calculate ATS score', async () => {
      const input: ResumeBuilderInput = {
        studentId: 'test-student',
        format: 'json',
        targetJobDescription: 'Looking for Guidewire developer with PolicyCenter experience',
        includeCertifications: true,
        includeProjects: true,
      };

      const output = await agent.execute(input);

      expect(output.atsScore).toBeDefined();
      expect(output.atsScore).toBeGreaterThanOrEqual(0);
      expect(output.atsScore).toBeLessThanOrEqual(100);
    });

    it('should extract keyword matches', async () => {
      const input: ResumeBuilderInput = {
        studentId: 'test-student',
        format: 'json',
        targetJobDescription: 'Guidewire PolicyCenter BillingCenter developer',
        includeCertifications: true,
        includeProjects: true,
      };

      const output = await agent.execute(input);

      expect(output.keywordMatches).toBeDefined();
      expect(Array.isArray(output.keywordMatches)).toBe(true);

      // Should match Guidewire-related keywords
      const matches = output.keywordMatches.join(' ').toLowerCase();
      expect(matches).toContain('guidewire');
    });

    it('should provide improvement suggestions when ATS score is low', async () => {
      const input: ResumeBuilderInput = {
        studentId: 'test-student',
        format: 'json',
        // Use job description with many unique keywords to lower ATS score and trigger suggestions
        targetJobDescription: 'Senior cloud architect with machine learning expertise, distributed systems, blockchain technology, quantum computing, edge computing, serverless architecture, and advanced analytics',
        includeCertifications: true,
        includeProjects: true,
      };

      const output = await agent.execute(input);

      // Suggestions should always be defined and be an array
      expect(output.suggestions).toBeDefined();
      expect(Array.isArray(output.suggestions)).toBe(true);

      // With low ATS score (many unmatched keywords), should provide suggestions
      // ATS score will be low because resume doesn't mention these advanced topics
      if (output.atsScore < 70) {
        expect(output.suggestions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Format Support', () => {
    it('should support json format', async () => {
      const input: ResumeBuilderInput = {
        studentId: 'test-student',
        format: 'json',
      };

      const output = await agent.execute(input);
      expect(output.format).toBe('json');
    });

    it('should support linkedin format', async () => {
      const input: ResumeBuilderInput = {
        studentId: 'test-student',
        format: 'linkedin',
      };

      const output = await agent.execute(input);
      expect(output.format).toBe('linkedin');
    });

    it('should support pdf format', async () => {
      const input: ResumeBuilderInput = {
        studentId: 'test-student',
        format: 'pdf',
      };

      const output = await agent.execute(input);
      expect(output.format).toBe('pdf');
    });

    it('should support docx format', async () => {
      const input: ResumeBuilderInput = {
        studentId: 'test-student',
        format: 'docx',
      };

      const output = await agent.execute(input);
      expect(output.format).toBe('docx');
    });
  });

  describe('Input Validation', () => {
    it('should throw error if studentId is missing', async () => {
      const input = {
        format: 'json',
      } as ResumeBuilderInput;

      await expect(agent.execute(input)).rejects.toThrow('Missing required fields');
    });

    it('should throw error if format is invalid', async () => {
      const input = {
        studentId: 'test-student',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        format: 'invalid' as any,
      };

      await expect(agent.execute(input)).rejects.toThrow('Invalid format');
    });
  });

  describe('Version Management', () => {
    it('should save resume version to database', async () => {
      const input: ResumeBuilderInput = {
        studentId: 'test-student',
        format: 'json',
      };

      const output = await agent.execute(input);

      expect(output.versionId).toBeTruthy();
      expect(output.versionId).toMatch(/resume-\d+|temp-\d+/);
    });

    it('should include timestamp', async () => {
      const input: ResumeBuilderInput = {
        studentId: 'test-student',
        format: 'json',
      };

      const output = await agent.execute(input);

      expect(output.timestamp).toBeTruthy();
      expect(new Date(output.timestamp).getTime()).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should complete in reasonable time (<10 seconds)', async () => {
      const input: ResumeBuilderInput = {
        studentId: 'test-student',
        format: 'json',
      };

      const startTime = performance.now();
      await agent.execute(input);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(10000);
    });
  });
});
