import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { question, correctAnswer, studentAnswer } = await request.json()

    if (!question || !studentAnswer) {
      return NextResponse.json(
        { error: 'Missing question or studentAnswer' },
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

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 512,
      system: `You are a Guidewire training grader. Grade the student's answer to a knowledge check question.

Rules:
- Compare the student's answer against the correct answer
- The student does NOT need to match word-for-word. Accept answers that demonstrate understanding of the key concept
- Be generous but accurate — partial understanding with the right idea counts as correct
- Return ONLY valid JSON with no markdown fencing, no extra text

Return format:
{"correct": true/false, "feedback": "1-2 sentence explanation of why correct or what was missed"}`,
      messages: [
        {
          role: 'user',
          content: `Question: ${question}\n\nCorrect Answer: ${correctAnswer}\n\nStudent's Answer: ${studentAnswer}`,
        },
      ],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    const raw = textBlock?.text || '{"correct": false, "feedback": "Unable to grade."}'

    // Parse JSON from response (handle potential markdown fencing)
    const jsonStr = raw.replace(/```json\s*|\s*```/g, '').trim()
    const result = JSON.parse(jsonStr)

    return NextResponse.json({
      correct: Boolean(result.correct),
      feedback: String(result.feedback || ''),
    })
  } catch (error) {
    console.error('[GradeAnswer] API error:', error)
    return NextResponse.json(
      { error: 'Failed to grade answer' },
      { status: 500 }
    )
  }
}
