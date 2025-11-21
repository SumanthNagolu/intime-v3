/**
 * Project Planner API Route
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 6)
 * Story: AI-GURU-003
 *
 * Generates capstone project plans with milestones.
 * POST /api/students/project-planner - Create project plan
 * GET /api/students/project-planner?projectId=xxx - Get project plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ProjectPlannerAgent } from '@/lib/ai/agents/guru/ProjectPlannerAgent';
import type { ProjectPlannerInput } from '@/types/guru';

/**
 * POST /api/students/project-planner
 *
 * Generate capstone project plan
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
        { error: 'Only students can create project plans' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { projectType, guidewireModule, skillLevel, projectId } = body;

    if (!projectType || !guidewireModule) {
      return NextResponse.json(
        { error: 'projectType and guidewireModule are required' },
        { status: 400 }
      );
    }

    // Build input for agent
    const input: ProjectPlannerInput = {
      studentId: user.id,
      projectType,
      guidewireModule,
      skillLevel: skillLevel || 3,
      projectId,
    };

    // Execute agent
    const agent = new ProjectPlannerAgent();
    const output = await agent.execute(input);

    return NextResponse.json({
      success: true,
      data: {
        projectId: output.projectId,
        title: output.title,
        description: output.description,
        milestones: output.milestones,
        estimatedHours: output.estimatedHours,
        guidewireRequirements: output.guidewireRequirements,
        successCriteria: output.successCriteria,
        nextAction: output.nextAction,
      },
    });
  } catch (error) {
    console.error('[ProjectPlanner API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate project plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/students/project-planner?projectId=xxx
 *
 * Get existing project plan (future: from database)
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

    // Get project ID from query params
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      );
    }

    // TODO: Implement project plan storage and retrieval
    // For now, return placeholder
    return NextResponse.json({
      success: true,
      data: {
        message: 'Project plan retrieval not yet implemented',
        projectId,
      },
    });
  } catch (error) {
    console.error('[ProjectPlanner API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve project plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
