# AI-GURU-002: Resume Builder Agent

**Story Points:** 5
**Sprint:** Sprint 3 (Week 9-10)
**Priority:** HIGH (Job Placement Support)

---

## User Story

As a **Student**,
I want **an AI agent that builds ATS-optimized resumes**,
So that **my resume passes automated screening and highlights my Guidewire skills**.

---

## Acceptance Criteria

- [ ] Generate ATS-optimized resume (no tables, simple formatting)
- [ ] Use GPT-4o for high-quality writing
- [ ] Pull completed modules and skills from student profile
- [ ] Highlight Guidewire-specific experience
- [ ] Include measurable achievements
- [ ] Support multiple formats (PDF, DOCX, LinkedIn text)
- [ ] Customize for job description matching
- [ ] 1-page maximum length
- [ ] Professional tone and formatting
- [ ] Version tracking (save multiple resume versions)

---

## Technical Implementation

### Resume Builder Agent

Create file: `src/lib/ai/agents/ResumeBuilderAgent.ts`

```typescript
// /src/lib/ai/agents/ResumeBuilderAgent.ts
import { BaseAgent, AgentConfig, AgentContext, AgentResponse } from './BaseAgent';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export type ResumeData = {
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    achievements: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  certifications?: string[];
};

export class ResumeBuilderAgent extends BaseAgent {
  constructor() {
    super({
      name: 'resume_builder',
      useCase: 'resume_builder',
      defaultModel: 'gpt-4o', // High-quality writing
      systemPrompt: `You are an expert resume writer specializing in ATS-optimized resumes for insurance technology roles.

RULES:
1. ATS-FRIENDLY: No tables, no columns, simple formatting
2. QUANTIFY: Use numbers and metrics for achievements
3. ACTION VERBS: Start bullets with strong verbs (Developed, Implemented, Optimized)
4. KEYWORDS: Include Guidewire product names (PolicyCenter, BillingCenter, ClaimCenter)
5. CONCISE: 1 page maximum, bullet points only
6. PROFESSIONAL: No first-person pronouns

FORMAT:
- Name and Contact Info (centered)
- Professional Summary (2-3 sentences)
- Technical Skills (bullet list)
- Professional Experience (reverse chronological)
- Education
- Projects (Guidewire-specific)
- Certifications (if any)`,
      requiresWriting: true,
    });
  }

  /**
   * Generate resume from student profile
   */
  async generateResume(
    userId: string,
    jobDescription?: string
  ): Promise<string> {
    // 1. Fetch student profile data
    const resumeData = await this.fetchStudentData(userId);

    // 2. Build resume prompt
    const prompt = this.buildResumePrompt(resumeData, jobDescription);

    // 3. Generate resume
    const response = await this.query(
      prompt,
      {
        conversationId: `resume-${userId}-${Date.now()}`,
        userId,
        userType: 'student',
        metadata: {
          action: 'generate_resume',
          has_job_description: !!jobDescription,
        },
      },
      {
        temperature: 0.7,
        maxTokens: 2048,
      }
    );

    // 4. Save resume version
    await this.saveResumeVersion(userId, response.content, resumeData);

    return response.content;
  }

  /**
   * Fetch student data from database
   */
  private async fetchStudentData(userId: string): Promise<ResumeData> {
    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Get completed modules
    const { data: completedModules } = await supabase
      .from('student_progress')
      .select('module_name, completed_at, grade')
      .eq('student_id', userId)
      .eq('status', 'completed');

    // Get capstone projects
    const { data: projects } = await supabase
      .from('student_projects')
      .select('*')
      .eq('student_id', userId);

    // Build resume data
    const skills = [
      ...new Set(
        completedModules?.map((m: any) => m.module_name.split(' - ')[0]) || []
      ),
    ];

    return {
      name: profile?.full_name || 'Student Name',
      email: profile?.email || '',
      phone: profile?.phone,
      linkedin: profile?.linkedin_url,
      github: profile?.github_url,
      skills,
      experience: [
        {
          title: 'Guidewire Developer (Training)',
          company: 'IntimeESolutions Training Academy',
          duration: `${completedModules?.[0]?.completed_at?.split('T')[0]} - Present`,
          achievements: [
            `Completed ${completedModules?.length || 0} Guidewire modules with ${this.calculateAvgGrade(completedModules)}% average`,
            'Developed hands-on projects using PolicyCenter, BillingCenter, and ClaimCenter',
            'Implemented insurance workflows using Gosu and PCML',
          ],
        },
      ],
      education: [
        {
          degree: profile?.education_degree || 'Bachelor of Science in Computer Science',
          school: profile?.education_school || 'University Name',
          year: profile?.education_year || new Date().getFullYear().toString(),
        },
      ],
      projects:
        projects?.map((p: any) => ({
          name: p.name,
          description: p.description,
          technologies: p.technologies || [],
        })) || [],
      certifications: profile?.certifications || [],
    };
  }

  /**
   * Calculate average grade
   */
  private calculateAvgGrade(modules: any[] | null): number {
    if (!modules || modules.length === 0) return 0;

    const total = modules.reduce((sum, m) => sum + (m.grade || 0), 0);
    return Math.round(total / modules.length);
  }

  /**
   * Build resume generation prompt
   */
  private buildResumePrompt(data: ResumeData, jobDescription?: string): string {
    let prompt = `Generate an ATS-optimized resume for:

NAME: ${data.name}
EMAIL: ${data.email}
${data.phone ? `PHONE: ${data.phone}` : ''}
${data.linkedin ? `LINKEDIN: ${data.linkedin}` : ''}
${data.github ? `GITHUB: ${data.github}` : ''}

SKILLS:
${data.skills.map((s) => `- ${s}`).join('\n')}

EXPERIENCE:
${data.experience
  .map(
    (e) => `
**${e.title}** | ${e.company} | ${e.duration}
${e.achievements.map((a) => `- ${a}`).join('\n')}
`
  )
  .join('\n')}

EDUCATION:
${data.education.map((e) => `- ${e.degree}, ${e.school} (${e.year})`).join('\n')}

PROJECTS:
${data.projects
  .map(
    (p) => `
**${p.name}**
${p.description}
Technologies: ${p.technologies.join(', ')}
`
  )
  .join('\n')}

${data.certifications ? `CERTIFICATIONS:\n${data.certifications.join('\n')}` : ''}
`;

    if (jobDescription) {
      prompt += `\n\nJOB DESCRIPTION (tailor resume to match):\n${jobDescription}\n`;
    }

    prompt += `\nGenerate a professional, ATS-optimized resume (plain text format, 1 page max):`;

    return prompt;
  }

  /**
   * Save resume version
   */
  private async saveResumeVersion(
    userId: string,
    content: string,
    data: ResumeData
  ): Promise<void> {
    await supabase.from('student_resumes').insert({
      student_id: userId,
      content,
      version: new Date().toISOString(),
      metadata: {
        skills_count: data.skills.length,
        projects_count: data.projects.length,
        generated_at: new Date().toISOString(),
      },
    });
  }

  /**
   * Export resume to different formats
   */
  async exportResume(
    resumeContent: string,
    format: 'pdf' | 'docx' | 'txt' | 'linkedin'
  ): Promise<string> {
    switch (format) {
      case 'txt':
        return resumeContent;

      case 'linkedin':
        // Generate LinkedIn-friendly version (shorter, more casual)
        return this.convertToLinkedIn(resumeContent);

      case 'pdf':
      case 'docx':
        // TODO: Implement PDF/DOCX conversion
        // Can use libraries like pdfkit or docx
        throw new Error(`${format} export not yet implemented`);

      default:
        return resumeContent;
    }
  }

  /**
   * Convert resume to LinkedIn About section
   */
  private convertToLinkedIn(resumeContent: string): string {
    // Extract summary and key skills
    const lines = resumeContent.split('\n');
    const summary = lines.find((l) => l.includes('Professional Summary'));
    const skills = lines.filter((l) => l.trim().startsWith('-'));

    return `${summary}\n\nKey Skills:\n${skills.slice(0, 10).join('\n')}`;
  }
}
```

### Database Migration

```sql
-- Student resumes table
CREATE TABLE student_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES user_profiles(id),

  content TEXT NOT NULL,
  version TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_student_resumes_student_id ON student_resumes(student_id);
CREATE INDEX idx_student_resumes_created_at ON student_resumes(created_at DESC);

-- RLS
ALTER TABLE student_resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY resumes_user_own ON student_resumes
  FOR ALL
  USING (student_id = auth.uid());
```

---

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { ResumeBuilderAgent } from '../ResumeBuilderAgent';

describe('Resume Builder Agent', () => {
  let agent: ResumeBuilderAgent;

  beforeEach(() => {
    agent = new ResumeBuilderAgent();
  });

  it('generates ATS-optimized resume', async () => {
    const resume = await agent.generateResume('test-student-id');

    expect(resume).toBeTruthy();
    expect(resume).toContain('PolicyCenter');
    expect(resume).not.toContain('I '); // No first-person
    expect(resume.split('\n').length).toBeLessThan(60); // ~1 page
  });

  it('tailors resume to job description', async () => {
    const jobDesc = 'Looking for PolicyCenter developer with rating experience';

    const resume = await agent.generateResume('test-student-id', jobDesc);

    expect(resume).toContain('PolicyCenter');
    expect(resume).toContain('rating');
  });

  it('exports to LinkedIn format', async () => {
    const resume = 'Full resume content...';
    const linkedin = await agent.exportResume(resume, 'linkedin');

    expect(linkedin.length).toBeLessThan(resume.length);
    expect(linkedin).toContain('Key Skills');
  });
});
```

---

## Verification

### Manual Testing

- [ ] Resume generated for student profile
- [ ] ATS-friendly (no tables)
- [ ] Highlights Guidewire skills
- [ ] Includes completed modules
- [ ] Uses action verbs and metrics
- [ ] 1 page length
- [ ] Professional tone
- [ ] Saved to database

---

## Dependencies

**Requires:**
- AI-INF-005 (Base Agent Framework)
- Student profile schema
- Completed modules data

**Blocks:**
- Job placement features
- Student portfolio

---

**Status:** ✅ Ready for Implementation
**Next Story:** AI-GURU-003 (Project Planner Agent)
