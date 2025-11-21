/**
 * Interview Coach API Route
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 6)
 * Story: AI-GURU-004
 *
 * Conducts mock interviews with STAR method training.
 * POST /api/students/interview-coach - Get question or evaluate answer
 * GET /api/students/interview-coach?sessionId=xxx - Get session history
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { InterviewCoachAgent } from '@/lib/ai/agents/guru/InterviewCoachAgent';
import type { InterviewCoachInput } from '@/types/guru';

/**
 * POST /api/students/interview-coach
 *
 * Generate interview question OR evaluate answer
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
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can use Interview Coach' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const {
      interviewType,
      guidewireModule,
      sessionId,
      answer,
      questionId,
    } = body;

    if (!interviewType) {
      return NextResponse.json(
        { error: 'interviewType is required (behavioral, technical, or guidewire)' },
        { status: 400 }
      );
    }

    // Validate interview type
    const validTypes = ['behavioral', 'technical', 'guidewire'];
    if (!validTypes.includes(interviewType)) {
      return NextResponse.json(
        { error: `Invalid interviewType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Build input for agent
    const input: InterviewCoachInput = {
      studentId: user.id,
      interviewType: interviewType as 'behavioral' | 'technical' | 'guidewire',
      guidewireModule,
      sessionId,
      answer,
      questionId,
    };

    // Execute agent
    const agent = new InterviewCoachAgent();
    const output = await agent.execute(input);

    return NextResponse.json({
      success: true,
      data: {
        sessionId: output.sessionId,
        question: output.question,
        questionId: output.questionId,
        starComponents: output.starComponents,
        score: output.score,
        feedback: output.feedback,
        suggestions: output.suggestions,
      },
    });
  } catch (error) {
    console.error('[InterviewCoach API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process interview coaching',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/students/interview-coach?sessionId=xxx
 *
 * Get interview session history (future: from database)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get session ID from query params
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // TODO: Implement session history storage and retrieval
    // For now, return placeholder
    return NextResponse.json({
      success: true,
      data: {
        message: 'Interview session history not yet implemented',
        sessionId,
      },
    });
  } catch (error) {
    console.error('[InterviewCoach API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve interview session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
