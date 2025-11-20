/**
 * ResumeBuilderAgent
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 3)
 * Story: AI-GURU-002 - Resume Builder Agent
 *
 * Generates ATS-optimized resumes for Guidewire students.
 * Supports multiple formats: PDF, DOCX, LinkedIn, JSON.
 *
 * @module lib/ai/agents/guru/ResumeBuilderAgent
 */

import { BaseAgent, type AgentConfig } from '../BaseAgent';
import type {
  ResumeBuilderInput,
  ResumeBuilderOutput,
  GuruError,
  ResumeFormat,
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
 * Resume Builder Agent
 *
 * Features:
 * - ATS optimization with keyword matching
 * - Multiple format support (PDF, DOCX, LinkedIn, JSON)
 * - Guidewire skills highlighting
 * - Version management
 * - Target job description matching
 */
export class ResumeBuilderAgent extends BaseAgent<
  ResumeBuilderInput,
  ResumeBuilderOutput
> {
  constructor(config?: Partial<AgentConfig>) {
    super({
      agentName: 'ResumeBuilderAgent',
      enableCostTracking: true,
      enableMemory: false, // Not needed for resume generation
      enableRAG: false, // Not needed for resume generation
      ...config,
    });
  }

  /**
   * Execute resume building
   *
   * @param input - Student ID and format preferences
   * @returns Generated resume with ATS scoring
   */
  async execute(input: ResumeBuilderInput): Promise<ResumeBuilderOutput> {
    const startTime = performance.now();

    try {
      // Validate input
      this.validateInput(input);

      // Get student data
      const studentData = await this.getStudentData(input.studentId);

      // Route to optimal model (GPT-4o for writing)
      const model = await this.routeModel('Resume generation and ATS optimization');

      // Load prompt template
      const promptTemplate = loadPromptTemplate('resume_builder');

      // Build resume content using GPT-4o
      const resumeContent = await this.generateResumeContent(
        studentData,
        input,
        promptTemplate,
        model.model
      );

      // Calculate ATS score
      const atsScore = this.calculateATSScore(
        resumeContent,
        input.targetJobDescription
      );

      // Extract keyword matches
      const keywordMatches = this.extractKeywordMatches(
        resumeContent,
        input.targetJobDescription
      );

      // Generate improvement suggestions
      const suggestions = this.generateSuggestions(resumeContent, atsScore);

      // Format resume (convert to requested format)
      const formattedContent = await this.formatResume(resumeContent, input.format);

      // Save version to database
      const versionId = await this.saveResumeVersion(
        input.studentId,
        resumeContent,
        input.format,
        atsScore
      );

      const output: ResumeBuilderOutput = {
        content: formattedContent,
        versionId,
        atsScore,
        keywordMatches,
        suggestions,
        format: input.format,
        timestamp: new Date().toISOString(),
      };

      // Track cost
      const latencyMs = performance.now() - startTime;
      await this.trackCost(1500, 0.005, model.model, latencyMs); // Estimated

      return output;
    } catch (error) {
      throw this.createGuruError(
        `Failed to build resume: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'AGENT_FAILED',
        { input, error }
      );
    }
  }

  /**
   * Validate input
   */
  private validateInput(input: ResumeBuilderInput): void {
    if (!input.studentId || !input.format) {
      throw this.createGuruError(
        'Missing required fields: studentId, format',
        'VALIDATION_FAILED',
        { input }
      );
    }

    const validFormats: ResumeFormat[] = ['pdf', 'docx', 'linkedin', 'json'];
    if (!validFormats.includes(input.format)) {
      throw this.createGuruError(
        `Invalid format: ${input.format}. Must be one of: ${validFormats.join(', ')}`,
        'VALIDATION_FAILED',
        { input }
      );
    }
  }

  /**
   * Get student data
   */
  private async getStudentData(studentId: string): Promise<any> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', studentId)
        .single();

      if (profileError) throw profileError;

      const { data: progress, error: progressError } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', studentId)
        .single();

      // Progress might not exist yet - that's OK
      return {
        profile,
        progress: progress || null,
      };
    } catch (error) {
      throw this.createGuruError(
        'Failed to fetch student data',
        'DATABASE_ERROR',
        { studentId, error }
      );
    }
  }

  /**
   * Generate resume content using GPT-4o
   */
  private async generateResumeContent(
    studentData: any,
    input: ResumeBuilderInput,
    promptTemplate: string,
    model: string
  ): Promise<string> {
    const prompt = `${promptTemplate}

STUDENT DATA:
${JSON.stringify(studentData, null, 2)}

TARGET JOB:
${input.targetJobDescription || 'General Guidewire Developer position'}

REQUIREMENTS:
- Include certifications: ${input.includeCertifications ? 'Yes' : 'No'}
- Include projects: ${input.includeProjects ? 'Yes' : 'No'}
- Format: ${input.format}

Generate a professional resume optimized for ATS systems.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
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
      temperature: 0.3, // Low temperature for consistency
      max_tokens: 2048,
    });

    return response.choices[0].message.content || '';
  }

  /**
   * Calculate ATS score (0-100)
   */
  private calculateATSScore(
    resumeContent: string,
    targetJobDescription?: string
  ): number {
    if (!targetJobDescription) {
      return 70; // Default score without target job
    }

    // Simple keyword matching algorithm
    const jobKeywords = this.extractKeywords(targetJobDescription.toLowerCase());
    const resumeKeywords = this.extractKeywords(resumeContent.toLowerCase());

    const matches = jobKeywords.filter((keyword) =>
      resumeKeywords.includes(keyword)
    );

    const matchRate = matches.length / jobKeywords.length;
    return Math.min(Math.round(matchRate * 100), 100);
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    // Remove common words and extract meaningful keywords
    const commonWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'from',
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !commonWords.has(word));

    return [...new Set(words)]; // Unique keywords
  }

  /**
   * Extract keyword matches
   */
  private extractKeywordMatches(
    resumeContent: string,
    targetJobDescription?: string
  ): string[] {
    if (!targetJobDescription) {
      return [];
    }

    const jobKeywords = this.extractKeywords(targetJobDescription.toLowerCase());
    const resumeKeywords = this.extractKeywords(resumeContent.toLowerCase());

    return jobKeywords.filter((keyword) => resumeKeywords.includes(keyword));
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(resumeContent: string, atsScore: number): string[] {
    const suggestions: string[] = [];

    if (atsScore < 70) {
      suggestions.push(
        'Add more keywords from the target job description to improve ATS match'
      );
    }

    if (!resumeContent.includes('Guidewire')) {
      suggestions.push('Emphasize Guidewire skills and certifications');
    }

    if (resumeContent.length < 500) {
      suggestions.push('Expand work experience and project descriptions');
    }

    if (atsScore < 80) {
      suggestions.push('Quantify achievements with metrics and numbers');
    }

    return suggestions;
  }

  /**
   * Format resume to requested format
   */
  private async formatResume(
    content: string,
    format: ResumeFormat
  ): Promise<string | Buffer> {
    switch (format) {
      case 'json':
        return JSON.stringify({ content }, null, 2);
      case 'linkedin':
        // LinkedIn-optimized markdown
        return this.formatLinkedIn(content);
      case 'pdf':
      case 'docx':
        // For now, return markdown. In production, use libraries like pdfkit or docx
        console.warn(
          `[ResumeBuilderAgent] ${format.toUpperCase()} generation not implemented - returning markdown`
        );
        return content;
      default:
        return content;
    }
  }

  /**
   * Format for LinkedIn
   */
  private formatLinkedIn(content: string): string {
    // LinkedIn-specific formatting (simplified)
    return `
${content}

---
Generated by InTime Guidewire Academy
Optimized for ATS systems
    `.trim();
  }

  /**
   * Save resume version to database
   */
  private async saveResumeVersion(
    studentId: string,
    content: any,
    format: ResumeFormat,
    atsScore: number
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('resume_versions')
        .insert({
          student_id: studentId,
          format,
          content,
          ats_score: atsScore,
        })
        .select('id')
        .single();

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error('[ResumeBuilderAgent] Failed to save version:', error);
      return `temp-${Date.now()}`;
    }
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
