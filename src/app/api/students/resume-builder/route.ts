/**
 * Resume Builder API Route
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 6)
 * Story: AI-GURU-002
 *
 * Generates ATS-optimized resumes for students.
 * POST /api/students/resume-builder - Generate resume
 * GET /api/students/resume-builder/versions - List resume versions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ResumeBuilderAgent } from '@/lib/ai/agents/guru/ResumeBuilderAgent';
import type { ResumeBuilderInput, ResumeFormat } from '@/types/guru';

/**
 * POST /api/students/resume-builder
 *
 * Generate ATS-optimized resume
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a student
    const { data: isStudent } = await supabase
      .rpc('user_has_role', { role_name: 'student' });

    if (!isStudent) {
      return NextResponse.json(
        { error: 'Only students can generate resumes' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const {
      format = 'json',
      targetJobDescription,
      includeCertifications = true,
      includeProjects = true,
    } = body;

    // Validate format
    const validFormats: ResumeFormat[] = ['pdf', 'docx', 'linkedin', 'json'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: `Invalid format. Must be one of: ${validFormats.join(', ')}` },
        { status: 400 }
      );
    }

    // Build input for agent
    const input: ResumeBuilderInput = {
      studentId: user.id,
      format,
      targetJobDescription,
      includeCertifications,
      includeProjects,
    };

    // Execute agent
    const agent = new ResumeBuilderAgent();
    const output = await agent.execute(input);

    return NextResponse.json({
      success: true,
      data: {
        content: output.content,
        versionId: output.versionId,
        atsScore: output.atsScore,
        keywordMatches: output.keywordMatches,
        suggestions: output.suggestions,
        format: output.format,
        timestamp: output.timestamp,
      },
    });
  } catch (error) {
    console.error('[ResumeBuilder API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate resume',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/students/resume-builder/versions
 *
 * Get all resume versions for current student
 */
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get resume versions
    const { data: versions, error } = await supabase
      .from('resume_versions')
      .select('id, format, ats_score, created_at')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        versions: versions?.map((v) => ({
          id: v.id,
          format: v.format,
          atsScore: v.ats_score,
          createdAt: v.created_at,
        })) || [],
      },
    });
  } catch (error) {
    console.error('[ResumeBuilder API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve resume versions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
