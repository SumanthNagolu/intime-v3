/**
 * Prompt Library
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 2)
 * Story: AI-INF-006 - Prompt Library
 *
 * Centralized prompt template management with variable substitution and versioning.
 *
 * @module lib/ai/prompts/library
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Prompt template metadata
 */
export interface PromptTemplate {
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Version number */
  version: number;
  /** Required variables */
  variables: string[];
  /** Template category */
  category: string;
}

/**
 * Available prompt templates
 */
export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  code_mentor: {
    name: 'code_mentor',
    description: 'Socratic method teaching for code mentorship',
    version: 1,
    variables: ['studentName', 'currentModule', 'completedModules', 'struggleArea'],
    category: 'training',
  },
  resume_builder: {
    name: 'resume_builder',
    description: 'ATS-optimized resume builder for Guidewire consultants',
    version: 1,
    variables: [
      'consultantName',
      'guidewireProducts',
      'yearsExperience',
      'certifications',
      'targetRole',
      'targetCompany',
    ],
    category: 'recruiting',
  },
  project_planner: {
    name: 'project_planner',
    description: 'Project milestone breakdown and sprint planning',
    version: 1,
    variables: [
      'projectName',
      'guidewireProduct',
      'timelineWeeks',
      'teamSize',
      'complexity',
      'clientRequirements',
    ],
    category: 'project_management',
  },
  interview_coach: {
    name: 'interview_coach',
    description: 'STAR method interview preparation and coaching',
    version: 1,
    variables: [
      'candidateName',
      'targetRole',
      'interviewType',
      'guidewireProducts',
      'preparationStage',
    ],
    category: 'recruiting',
  },
  employee_twin_recruiter: {
    name: 'employee_twin_recruiter',
    description: 'AI twin for technical recruiters',
    version: 1,
    variables: [
      'employeeName',
      'activeCandidates',
      'openRequisitions',
      'weeklyPlacements',
      'pipelineStatus',
    ],
    category: 'employee_twin',
  },
  employee_twin_trainer: {
    name: 'employee_twin_trainer',
    description: 'AI twin for Guidewire trainers',
    version: 1,
    variables: [
      'employeeName',
      'cohortName',
      'studentCount',
      'currentModule',
      'completionRate',
      'atRiskCount',
    ],
    category: 'employee_twin',
  },
  employee_twin_bench_sales: {
    name: 'employee_twin_bench_sales',
    description: 'AI twin for bench sales consultants',
    version: 1,
    variables: [
      'employeeName',
      'benchCount',
      'activeClients',
      'monthlyPlacements',
      'avgBenchDays',
      'market',
    ],
    category: 'employee_twin',
  },
  employee_twin_admin: {
    name: 'employee_twin_admin',
    description: 'AI twin for platform administrators',
    version: 1,
    variables: [
      'employeeName',
      'activeUsers',
      'systemLoad',
      'databaseSize',
      'apiRequests',
      'errorRate',
      'uptime',
    ],
    category: 'employee_twin',
  },
  employee_twin_ceo: {
    name: 'employee_twin_ceo',
    description: 'AI twin for CEO - strategic oversight and cross-pillar coordination',
    version: 1,
    variables: [
      'employeeName',
      'organizationName',
      'recruitingHealth',
      'recruitingMetrics',
      'benchHealth',
      'benchMetrics',
      'taHealth',
      'taMetrics',
      'hrHealth',
      'hrMetrics',
      'academyHealth',
      'academyMetrics',
    ],
    category: 'employee_twin',
  },
  employee_twin_ta: {
    name: 'employee_twin_ta',
    description: 'AI twin for Talent Acquisition / Business Development',
    version: 1,
    variables: [
      'employeeName',
      'activeProspects',
      'openOpportunities',
      'monthlyRevenue',
      'pipelineValue',
      'activeCampaigns',
    ],
    category: 'employee_twin',
  },
  employee_twin_hr: {
    name: 'employee_twin_hr',
    description: 'AI twin for HR professionals - people operations and compliance',
    version: 1,
    variables: [
      'employeeName',
      'totalEmployees',
      'activeOnboardings',
      'pendingReviews',
      'openHRTickets',
      'complianceItems',
    ],
    category: 'employee_twin',
  },
  employee_twin_immigration: {
    name: 'employee_twin_immigration',
    description: 'AI twin for Immigration Specialists - visa tracking and compliance',
    version: 1,
    variables: [
      'employeeName',
      'activeCases',
      'pendingFilings',
      'expiringAuths',
      'rfeCount',
      'complianceAlerts',
    ],
    category: 'employee_twin',
  },
  activity_classification: {
    name: 'activity_classification',
    description: 'Screenshot activity classification for productivity tracking',
    version: 1,
    variables: [],
    category: 'productivity',
  },
  daily_timeline: {
    name: 'daily_timeline',
    description: 'Daily productivity report generation with personalized insights',
    version: 1,
    variables: [
      'employeeName',
      'date',
      'totalScreenshots',
      'productiveHours',
      'activityBreakdown',
    ],
    category: 'productivity',
  },
};

/**
 * Prompt Library
 *
 * Manages prompt templates with variable substitution, versioning, and caching.
 */
export class PromptLibrary {
  private templateCache: Map<string, string>;
  private templatesDir: string;

  constructor(templatesDir?: string) {
    this.templateCache = new Map();
    this.templatesDir = templatesDir || join(process.cwd(), 'src/lib/ai/prompts/templates');
  }

  /**
   * Get prompt template with variable substitution
   *
   * @param templateName - Name of the template
   * @param variables - Variables to substitute
   * @returns Rendered prompt with variables substituted
   *
   * @example
   * ```typescript
   * const library = new PromptLibrary();
   * const prompt = await library.get('code_mentor', {
   *   studentName: 'John Doe',
   *   currentModule: 'PolicyCenter Rating',
   *   completedModules: '5',
   *   struggleArea: 'Rate tables',
   * });
   * ```
   */
  async get(templateName: string, variables?: Record<string, string>): Promise<string> {
    // Validate template exists
    const metadata = PROMPT_TEMPLATES[templateName];
    if (!metadata) {
      throw new Error(`Template not found: ${templateName}`);
    }

    // Load template (with caching)
    let template = this.templateCache.get(templateName);

    if (!template) {
      const templatePath = join(this.templatesDir, `${templateName}.txt`);
      try {
        template = await readFile(templatePath, 'utf-8');
        this.templateCache.set(templateName, template);
      } catch (error) {
        throw new Error(
          `Failed to load template ${templateName}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Variable substitution
    if (variables) {
      let rendered = template;
      Object.entries(variables).forEach(([key, value]) => {
        const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        rendered = rendered.replace(pattern, value);
      });

      // Warn about missing variables
      const missingVars = metadata.variables.filter(
        (varName) => !variables[varName] && rendered.includes(`{{${varName}}}`)
      );

      if (missingVars.length > 0) {
        console.warn(
          `[PromptLibrary] Template ${templateName} has missing variables: ${missingVars.join(', ')}`
        );
      }

      return rendered;
    }

    return template;
  }

  /**
   * List all available templates
   *
   * @param category - Optional category filter
   * @returns Array of template metadata
   *
   * @example
   * ```typescript
   * const library = new PromptLibrary();
   * const templates = await library.list('employee_twin');
   * console.log(templates.length); // 4 (recruiter, trainer, bench_sales, admin)
   * ```
   */
  async list(category?: string): Promise<PromptTemplate[]> {
    const templates = Object.values(PROMPT_TEMPLATES);

    if (category) {
      return templates.filter((t) => t.category === category);
    }

    return templates;
  }

  /**
   * Get template version
   *
   * @param templateName - Template name
   * @returns Version number
   *
   * @example
   * ```typescript
   * const library = new PromptLibrary();
   * const version = await library.version('code_mentor');
   * console.log(version); // 1
   * ```
   */
  async version(templateName: string): Promise<number> {
    const metadata = PROMPT_TEMPLATES[templateName];
    if (!metadata) {
      throw new Error(`Template not found: ${templateName}`);
    }
    return metadata.version;
  }

  /**
   * Validate template variables
   *
   * Checks if all required variables are provided.
   *
   * @param templateName - Template name
   * @param variables - Variables to validate
   * @returns True if valid, throws error otherwise
   *
   * @example
   * ```typescript
   * const library = new PromptLibrary();
   * const isValid = library.validate('code_mentor', {
   *   studentName: 'John',
   *   currentModule: 'PC Rating',
   *   completedModules: '5',
   *   struggleArea: 'Rate tables',
   * });
   * ```
   */
  validate(templateName: string, variables: Record<string, string>): boolean {
    const metadata = PROMPT_TEMPLATES[templateName];
    if (!metadata) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const missingVars = metadata.variables.filter((varName) => !variables[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required variables for ${templateName}: ${missingVars.join(', ')}`
      );
    }

    return true;
  }

  /**
   * Get template metadata
   *
   * @param templateName - Template name
   * @returns Template metadata
   */
  getMetadata(templateName: string): PromptTemplate {
    const metadata = PROMPT_TEMPLATES[templateName];
    if (!metadata) {
      throw new Error(`Template not found: ${templateName}`);
    }
    return metadata;
  }

  /**
   * Clear template cache
   *
   * Useful for development/testing when templates are updated.
   */
  clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Get cache statistics
   *
   * @returns Cache stats
   */
  getCacheStats(): { size: number; templates: string[] } {
    return {
      size: this.templateCache.size,
      templates: Array.from(this.templateCache.keys()),
    };
  }
}

/**
 * Default prompt library instance (singleton)
 */
let defaultPromptLibrary: PromptLibrary | null = null;

/**
 * Get the default prompt library instance
 *
 * @returns Default PromptLibrary instance
 */
export function getDefaultPromptLibrary(): PromptLibrary {
  if (!defaultPromptLibrary) {
    defaultPromptLibrary = new PromptLibrary();
  }
  return defaultPromptLibrary;
}

/**
 * Reset the default prompt library (useful for testing)
 */
export function resetDefaultPromptLibrary(): void {
  defaultPromptLibrary = null;
}
