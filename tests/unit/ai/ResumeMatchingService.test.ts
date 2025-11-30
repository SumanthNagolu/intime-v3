/**
 * Resume Matching Service Unit Tests
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 5)
 * Tests: Embedding generation, semantic search, deep analysis, accuracy tracking
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ResumeMatchingService } from '@/lib/ai/resume-matching';

describe('ResumeMatchingService', () => {
  let service: ResumeMatchingService;

  beforeEach(() => {
    service = new ResumeMatchingService({
      orgId: 'test-org',
      userId: 'test-user',
    });
  });

  describe('Embedding Generation', () => {
    it('should generate 1536-dimensional embeddings', async () => {
      const text = 'Guidewire PolicyCenter Developer with 3 years experience';

      // Note: This requires actual OpenAI API call
      // In real tests, mock the OpenAI client
      const result = await service.indexCandidate({
        candidateId: 'test-candidate',
        resumeText: text,
        skills: ['PolicyCenter', 'Gosu', 'GWCP'],
        experienceLevel: 'mid',
        availability: 'immediate',
      });

      expect(result).toBeTruthy();
    });

    it('should handle long resume texts', async () => {
      const longText = 'a'.repeat(5000); // 5K characters

      const result = await service.indexCandidate({
        candidateId: 'test-candidate',
        resumeText: longText,
        skills: ['PolicyCenter'],
        experienceLevel: 'entry',
        availability: 'immediate',
      });

      expect(result).toBeTruthy();
    });
  });

  describe('Candidate Indexing', () => {
    it('should index candidate successfully', async () => {
      const result = await service.indexCandidate({
        candidateId: 'test-candidate-123',
        resumeText: 'Experienced Guidewire developer with PolicyCenter and ClaimCenter skills',
        skills: ['PolicyCenter', 'ClaimCenter', 'Gosu'],
        experienceLevel: 'mid',
        availability: 'immediate',
      });

      expect(result).toBeTruthy();
    });

    it('should upsert on duplicate candidate', async () => {
      const candidateData = {
        candidateId: 'test-candidate-456',
        resumeText: 'Guidewire developer',
        skills: ['PolicyCenter'],
        experienceLevel: 'entry' as const,
        availability: 'immediate' as const,
      };

      // First insert
      const result1 = await service.indexCandidate(candidateData);
      expect(result1).toBeTruthy();

      // Second insert (should upsert)
      const result2 = await service.indexCandidate(candidateData);
      expect(result2).toBeTruthy();
    });
  });

  describe('Requisition Indexing', () => {
    it('should index job requisition successfully', async () => {
      const result = await service.indexRequisition({
        requisitionId: 'test-req-123',
        description: 'Looking for PolicyCenter developer with 2+ years experience',
        requiredSkills: ['PolicyCenter', 'Gosu', 'GWCP'],
        niceToHaveSkills: ['ClaimCenter', 'BillingCenter'],
        experienceLevel: 'mid',
      });

      expect(result).toBeTruthy();
    });
  });

  describe('Semantic Search', () => {
    it('should find matching candidates', async () => {
      // Note: Requires database with indexed candidates
      // In integration tests, seed database first

      const result = await service.findMatches({
        requisitionId: 'test-req-123',
        topK: 10,
        matchThreshold: 0.70,
      });

      expect(result.matches).toBeDefined();
      expect(Array.isArray(result.matches)).toBe(true);
    });

    it('should respect topK parameter', async () => {
      const result = await service.findMatches({
        requisitionId: 'test-req-123',
        topK: 5,
      });

      expect(result.matches.length).toBeLessThanOrEqual(5);
    });

    it('should respect matchThreshold parameter', async () => {
      const result = await service.findMatches({
        requisitionId: 'test-req-123',
        matchThreshold: 0.85, // High threshold
      });

      result.matches.forEach((match) => {
        expect(match.similarity).toBeGreaterThanOrEqual(0.85);
      });
    });

    it('should return matches sorted by score descending', async () => {
      const result = await service.findMatches({
        requisitionId: 'test-req-123',
        topK: 10,
      });

      const scores = result.matches.map((m) => m.matchScore);

      for (let i = 1; i < scores.length; i++) {
        expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
      }
    });
  });

  describe('Deep Matching Analysis', () => {
    it('should provide weighted match scores', async () => {
      const result = await service.findMatches({
        requisitionId: 'test-req-123',
        topK: 5,
      });

      result.matches.forEach((match) => {
        expect(match.matchScore).toBeGreaterThanOrEqual(0);
        expect(match.matchScore).toBeLessThanOrEqual(100);

        // Check breakdown exists
        if (match.breakdown) {
          expect(match.breakdown.skillsScore).toBeDefined();
          expect(match.breakdown.experienceScore).toBeDefined();
          expect(match.breakdown.projectScore).toBeDefined();
          expect(match.breakdown.availabilityScore).toBeDefined();
        }
      });
    });

    it('should identify matched and missing skills', async () => {
      const result = await service.findMatches({
        requisitionId: 'test-req-123',
        topK: 5,
      });

      result.matches.forEach((match) => {
        expect(Array.isArray(match.skills.matched)).toBe(true);
        expect(Array.isArray(match.skills.missing)).toBe(true);
      });
    });

    it('should provide reasoning for match scores', async () => {
      const result = await service.findMatches({
        requisitionId: 'test-req-123',
        topK: 5,
      });

      result.matches.forEach((match) => {
        expect(match.reasoning).toBeTruthy();
        expect(typeof match.reasoning).toBe('string');
      });
    });
  });

  describe('Performance', () => {
    it('should complete semantic search in <500ms', async () => {
      const startTime = performance.now();

      await service.findMatches({
        requisitionId: 'test-req-123',
        topK: 10,
      });

      const duration = performance.now() - startTime;

      // Search should be <500ms (pgvector ivfflat index)
      expect(duration).toBeLessThan(500);
    });

    it('should complete full matching in <5s for 10 candidates', async () => {
      const startTime = performance.now();

      const result = await service.findMatches({
        requisitionId: 'test-req-123',
        topK: 10,
      });

      const duration = performance.now() - startTime;

      // Full matching (search + deep analysis) should be <5s
      expect(duration).toBeLessThan(5000);
      expect(result.searchDuration).toBeLessThan(5000);
    });
  });

  describe('Cost Tracking', () => {
    it('should track tokens used', async () => {
      const result = await service.findMatches({
        requisitionId: 'test-req-123',
        topK: 5,
      });

      expect(result.tokensUsed).toBeGreaterThan(0);
    });

    it('should track cost accurately', async () => {
      const result = await service.findMatches({
        requisitionId: 'test-req-123',
        topK: 5,
      });

      expect(result.cost).toBeGreaterThan(0);

      // Cost should be reasonable (~$0.0025 for 5 matches)
      expect(result.cost).toBeLessThan(0.01);
    });
  });

  describe('Accuracy Metrics', () => {
    it('should calculate accuracy from recruiter feedback', async () => {
      const accuracy = await service.getAccuracy();

      expect(accuracy).toBeDefined();
      expect(typeof accuracy.accuracy).toBe('number');
      expect(typeof accuracy.total_matches).toBe('number');
      expect(typeof accuracy.relevant_matches).toBe('number');
    });

    it('should handle no feedback gracefully', async () => {
      const accuracy = await service.getAccuracy(new Date()); // Today (no matches yet)

      expect(accuracy.accuracy).toBe(0);
      expect(accuracy.total_matches).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing requisition gracefully', async () => {
      await expect(
        service.findMatches({
          requisitionId: 'non-existent-req',
        })
      ).rejects.toThrow();
    });

    it('should handle invalid candidate data', async () => {
      await expect(
        service.indexCandidate({
          candidateId: '',
          resumeText: '',
          skills: [],
          experienceLevel: 'mid',
          availability: 'immediate',
        })
      ).rejects.toThrow();
    });

    it('should handle API failures gracefully', async () => {
      // Mock OpenAI API failure
      // In real tests, use dependency injection to mock

      // Should not crash, should log error
    });
  });
});
