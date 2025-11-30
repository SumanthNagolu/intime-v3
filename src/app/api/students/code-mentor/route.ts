/**
 * Code Mentor API Route
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 6)
 * Story: AI-GURU-001
 *
 * Provides Socratic method code mentoring for students.
 * POST /api/students/code-mentor - Ask a question
 * GET /api/students/code-mentor?conversationId=xxx - Get conversation history
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CodeMentorAgent } from '@/lib/ai/agents/guru/CodeMentorAgent';
import type { CodeMentorInput } from '@/types/guru';

/**
 * POST /api/students/code-mentor
 *
 * Ask the Code Mentor agent a question using Socratic method
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
        { error: 'Only students can access Code Mentor' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { question, conversationId, currentModule, codeContext } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Build input for agent
    const input: CodeMentorInput = {
      studentId: user.id,
      question,
      conversationId: conversationId || `conv-${Date.now()}`,
      currentModule: currentModule || 'General',
      codeContext,
    };

    // Execute agent
    const agent = new CodeMentorAgent();
    const output = await agent.execute(input);

    return NextResponse.json({
      success: true,
      data: {
        response: output.response,
        conversationId: output.conversationId,
        documentationHints: output.documentationHints,
        nextSteps: output.nextSteps,
      },
    });
  } catch (error) {
    console.error('[CodeMentor API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process question',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/students/code-mentor?conversationId=xxx
 *
 * Get conversation history
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

    // Get conversation ID from query params
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID required' },
        { status: 400 }
      );
    }

    // Get conversation history from database
    const { data: interactions, error } = await supabase
      .from('guru_interactions')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('student_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        conversationId,
        messages: interactions?.map((i) => {
          const output = i.output;
          let content: string;
          if (typeof output === 'string') {
            content = output;
          } else if (output && typeof output === 'object' && 'response' in output && typeof output.response === 'string') {
            content = output.response;
          } else {
            content = JSON.stringify(output);
          }
          return {
            role: 'assistant',
            content,
            timestamp: i.created_at,
            helpful: i.was_helpful,
          };
        }) || [],
      },
    });
  } catch (error) {
    console.error('[CodeMentor API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve conversation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
