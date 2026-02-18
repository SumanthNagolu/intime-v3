import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { language, prompt, studentCode, referenceSolution, exerciseContext } = await request.json()

    if (!prompt || !studentCode) {
      return NextResponse.json(
        { error: 'Missing prompt or studentCode' },
        { status: 400 }
      )
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      )
    }

    const anthropic = new Anthropic({ apiKey: anthropicKey })

    const solutionSection = referenceSolution
      ? `\n\nReference Solution:\n\`\`\`${language || 'text'}\n${referenceSolution}\n\`\`\``
      : ''

    const contextSection = exerciseContext
      ? `\n\nExercise Context: ${exerciseContext}`
      : ''

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: `You are a senior Guidewire platform code reviewer and training instructor. Review the student's code submission for a hands-on assignment exercise.

Language: ${language || 'text'}

Evaluation criteria:
- Correctness: Does the code solve the stated problem?
- Guidewire best practices: Does it follow platform conventions?
- Code quality: Is it clean, readable, and well-structured?
- Completeness: Does it handle the full requirements?

Scoring:
- 90-100: Excellent solution, meets all requirements with good practices
- 70-89: Good solution, mostly correct with minor issues
- 50-69: Partial solution, has some correct elements but significant gaps
- 30-49: Attempted but largely incorrect or incomplete
- 0-29: Minimal or no meaningful attempt

Be encouraging but honest. If the student's code is close to the reference solution, give credit.
If no reference solution is provided, evaluate based on the prompt requirements and general best practices.

Return ONLY valid JSON with no markdown fencing, no extra text.

Return format:
{"score": 0-100, "correct": true/false, "feedback": "2-3 sentence review", "suggestions": ["improvement suggestion 1", "improvement suggestion 2"]}

Set "correct" to true if score >= 70.`,
      messages: [
        {
          role: 'user',
          content: `Task: ${prompt}${contextSection}${solutionSection}\n\nStudent's Code:\n\`\`\`${language || 'text'}\n${studentCode}\n\`\`\``,
        },
      ],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    const raw = textBlock?.text || '{"score": 0, "correct": false, "feedback": "Unable to review code.", "suggestions": []}'

    // Parse JSON from response (handle potential markdown fencing)
    const jsonStr = raw.replace(/```json\s*|\s*```/g, '').trim()
    const result = JSON.parse(jsonStr)

    return NextResponse.json({
      score: Number(result.score) || 0,
      correct: Boolean(result.correct),
      feedback: String(result.feedback || ''),
      suggestions: Array.isArray(result.suggestions) ? result.suggestions.map(String) : [],
    })
  } catch (error) {
    console.error('[GradeAssignmentCode] API error:', error)
    return NextResponse.json(
      { error: 'Failed to grade code submission' },
      { status: 500 }
    )
  }
}
