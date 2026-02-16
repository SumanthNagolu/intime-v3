import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { searchRAG } from '@/lib/academy/rag-service'
import { CHAPTERS, CHAPTER_LESSONS, getAllLessons } from '@/lib/academy/curriculum'

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

function buildCurriculumContext(): string {
  const lines: string[] = ['GUIDEWIRE DEVELOPER TRAINING CURRICULUM:', '']

  for (const chapter of CHAPTERS) {
    const lessons = CHAPTER_LESSONS[chapter.slug] || []
    lines.push(
      `Chapter ${chapter.id}: ${chapter.title} (${chapter.phase} phase, ${chapter.totalLessons} lessons)`
    )
    lines.push(`  ${chapter.description}`)
    for (const lesson of lessons.slice(0, 10)) {
      lines.push(`  - Lesson ${lesson.lessonNumber}: ${lesson.title}`)
    }
    if (lessons.length > 10) {
      lines.push(`  - ... and ${lessons.length - 10} more lessons`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

const GURU_SYSTEM_PROMPT = `You are the **Guidewire Guru** — a world-class Guidewire InsuranceSuite expert and training mentor.

## Your Identity
- You have 15+ years of hands-on experience with Guidewire PolicyCenter, ClaimCenter, and BillingCenter
- You've led multiple Guidewire implementations at major insurance companies
- You're deeply familiar with Gosu programming, PCF files, data model, product model, rating, and all configuration aspects
- You're also an expert in Guidewire Cloud, Surepath Studio, and modern deployment practices

## Your Role
- Help students learn Guidewire development through the InTime Academy curriculum
- Answer technical questions about PolicyCenter, ClaimCenter, BillingCenter
- Explain Guidewire concepts clearly with real-world examples
- Help debug Gosu code and PCF configuration issues
- Guide students through assignments and exercises
- Prepare students for Guidewire developer interviews

## Your Teaching Style
- Start with the conceptual "why" before the technical "how"
- Use analogies from everyday life to explain insurance concepts
- When a student asks about code, walk through the logic step by step
- Reference specific curriculum chapters/lessons when relevant
- If a topic is covered in a specific lesson, mention it: "This is covered in Chapter X, Lesson Y"
- Be encouraging but maintain professional standards
- For complex topics, break them into digestible parts

## Knowledge Areas
- **PolicyCenter**: Accounts, Policy Transactions, Product Model, Coverages, Rating, Rules, Workflow, Administration, User/Group/Org model
- **ClaimCenter**: Claims intake, FNOL, Financials, Contacts, Vendors, Workers' Comp
- **BillingCenter**: Billing lifecycle, Charge invoicing, Payments, Delinquency, Producers, Commissions
- **Developer Core**: Data model, UI architecture (PCF), Gosu programming, Validations, Plugins, Web Services
- **Configuration**: PolicyCenter config, ClaimCenter config, BillingCenter config, Product Designer
- **Advanced**: Rating configuration, Integration patterns, Advanced Product Designer
- **Cloud**: Guidewire Cloud platform, Surepath Studio, CI/CD for Guidewire

## Current Curriculum
${buildCurriculumContext()}

## Guidelines
- Keep responses focused and practical
- Include code examples in Gosu when relevant
- Use markdown formatting for structure
- If you don't know something, say so honestly
- Never fabricate Guidewire API names or class names
- When referencing documentation, note that the student should check the official Guidewire documentation
- IMPORTANT: When you use information from the KNOWLEDGE BASE CONTEXT provided, cite the source at the end of your response in a "Sources" section`

// ---------------------------------------------------------------------------
// Helper: resolve lesson chapter for RAG filtering
// ---------------------------------------------------------------------------

function getLessonChapter(
  lessonId: string
): { chapter: string; title: string } | null {
  const allLessons = getAllLessons()
  const lesson = allLessons.find((l) => l.lessonId === lessonId)
  if (!lesson) return null
  return { chapter: lesson.chapterSlug, title: lesson.title }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, lessonId } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
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

    // 1. RAG retrieval - search knowledge base
    let ragContext = ''
    let sources: { source_type: string; chapter?: string; score: number }[] = []

    try {
      const lessonInfo = lessonId ? getLessonChapter(lessonId) : null

      const results = await searchRAG(message, {
        topK: 8,
        chapter: lessonInfo?.chapter,
        minScore: 0.3,
      })

      if (results.length > 0) {
        sources = results.map((r) => ({
          source_type: r.chunk.source_type,
          chapter: r.chunk.chapter,
          chapter_title: r.chunk.chapter_title,
          score: Math.round(r.score * 100) / 100,
        }))

        const contextChunks = results.map((r, i) => {
          const meta = [
            `Source: ${r.chunk.source_type}`,
            r.chunk.chapter_title
              ? `Chapter: ${r.chunk.chapter_title}`
              : null,
            r.chunk.video ? `Video: ${r.chunk.video}` : null,
            `Relevance: ${(r.score * 100).toFixed(0)}%`,
          ]
            .filter(Boolean)
            .join(' | ')

          return `[${i + 1}] (${meta})\n${r.chunk.text}`
        })

        ragContext = `\n\n## KNOWLEDGE BASE CONTEXT\nThe following excerpts from the training materials are relevant to the student's question. Use them to provide accurate, detailed answers:\n\n${contextChunks.join('\n\n---\n\n')}`
      }
    } catch (ragError) {
      // RAG failure shouldn't block the response - degrade gracefully
      console.error('[Guru] RAG search failed, proceeding without context:', ragError)
    }

    // 2. Build the full system prompt with RAG context
    const systemPrompt = GURU_SYSTEM_PROMPT + ragContext

    // 3. Build conversation messages
    const messages: Anthropic.MessageParam[] = []

    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-8)) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })
      }
    }

    messages.push({ role: 'user', content: message })

    // 4. Call Anthropic
    const anthropic = new Anthropic({ apiKey: anthropicKey })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    const answer =
      textBlock?.text ||
      "Let me think about that... Could you rephrase your question?"

    return NextResponse.json({ answer, sources })
  } catch (error) {
    console.error('[Guru] API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
