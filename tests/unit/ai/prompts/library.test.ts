/**
 * Prompt Library Tests
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 2)
 * Story: AI-INF-006 - Prompt Library
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PromptLibrary, PROMPT_TEMPLATES } from '@/lib/ai/prompts/library';

describe('PromptLibrary', () => {
  let library: PromptLibrary;

  beforeEach(() => {
    library = new PromptLibrary();
  });

  describe('template metadata', () => {
    it('should have 10 templates defined', () => {
      const templates = Object.keys(PROMPT_TEMPLATES);
      expect(templates).toHaveLength(10);
    });

    it('should have correct template structure', () => {
      const template = PROMPT_TEMPLATES.code_mentor;

      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('version');
      expect(template).toHaveProperty('variables');
      expect(template).toHaveProperty('category');

      expect(template.version).toBeGreaterThan(0);
      expect(Array.isArray(template.variables)).toBe(true);
    });
  });

  describe('list', () => {
    it('should list all templates', async () => {
      const templates = await library.list();
      expect(templates).toHaveLength(10);
    });

    it('should filter by category', async () => {
      const employeeTwins = await library.list('employee_twin');
      expect(employeeTwins).toHaveLength(4);

      const names = employeeTwins.map((t) => t.name);
      expect(names).toContain('employee_twin_recruiter');
      expect(names).toContain('employee_twin_trainer');
      expect(names).toContain('employee_twin_bench_sales');
      expect(names).toContain('employee_twin_admin');
    });
  });

  describe('version', () => {
    it('should return template version', async () => {
      const version = await library.version('code_mentor');
      expect(version).toBe(1);
    });

    it('should throw for unknown template', async () => {
      await expect(library.version('unknown_template')).rejects.toThrow(
        'Template not found'
      );
    });
  });

  describe('validate', () => {
    it('should validate correct variables', () => {
      const variables = {
        studentName: 'John Doe',
        currentModule: 'PolicyCenter Rating',
        completedModules: '5',
        struggleArea: 'Rate tables',
      };

      expect(() => library.validate('code_mentor', variables)).not.toThrow();
    });

    it('should throw for missing variables', () => {
      const variables = {
        studentName: 'John Doe',
        // Missing other required variables
      };

      expect(() => library.validate('code_mentor', variables)).toThrow(
        'Missing required variables'
      );
    });
  });

  describe('getMetadata', () => {
    it('should return metadata', () => {
      const metadata = library.getMetadata('code_mentor');

      expect(metadata.name).toBe('code_mentor');
      expect(metadata.category).toBe('training');
      expect(metadata.variables).toContain('studentName');
    });
  });

  describe('cache management', () => {
    it('should track cache stats', () => {
      const stats = library.getCacheStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('templates');
      expect(stats.size).toBe(0); // Empty initially
    });

    it('should clear cache', () => {
      library.clearCache();
      const stats = library.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });
});
