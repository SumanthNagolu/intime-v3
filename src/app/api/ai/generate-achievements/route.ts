import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

/**
 * Check if text appears to be meaningful (not gibberish)
 * Simple heuristic: check for common English words and patterns
 */
function isMeaningfulText(text: string): boolean {
  if (!text || text.length < 3) return false

  // Check if it looks like gibberish (random characters)
  const words = text.toLowerCase().split(/\s+/)
  const meaningfulWordPattern = /^[a-z]{2,}$/
  const meaningfulWords = words.filter(w => meaningfulWordPattern.test(w) && w.length > 2)

  // If less than 30% of words look like real words, consider it gibberish
  if (meaningfulWords.length / words.length < 0.3) return false

  // Check for at least some recognizable patterns
  const hasRealContent = /\b(manage|develop|lead|create|implement|design|build|support|maintain|analyze|improve|team|project|system|data|customer|sales|product|service|process|report)\b/i.test(text)

  return hasRealContent || text.length > 50
}

/**
 * Check if an array of items has meaningful content
 */
function hasMeaningfulItems(items: string[] | undefined): boolean {
  if (!items || items.length === 0) return false
  return items.some(item => isMeaningfulText(item))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyName, jobTitle, employmentType, description, responsibilities } = body

    if (!companyName || !jobTitle) {
      return NextResponse.json(
        { error: 'Company name and job title are required' },
        { status: 400 }
      )
    }

    // Check if we have meaningful data to work with
    const hasDescription = description && isMeaningfulText(description)
    const hasResponsibilities = hasMeaningfulItems(responsibilities)

    // If no meaningful content provided, return error - don't hallucinate
    if (!hasDescription && !hasResponsibilities) {
      return NextResponse.json({
        achievements: [],
        message: 'Please provide a description or responsibilities first. AI can only enhance existing content, not create from scratch.'
      })
    }

    // Build context ONLY from provided data
    const contextParts: string[] = []

    if (hasDescription) {
      contextParts.push(`Role Description: ${description}`)
    }

    if (hasResponsibilities) {
      const validResponsibilities = responsibilities.filter((r: string) => isMeaningfulText(r))
      if (validResponsibilities.length > 0) {
        contextParts.push(`Responsibilities:\n${validResponsibilities.map((r: string) => `- ${r}`).join('\n')}`)
      }
    }

    const prompt = `You are helping convert job responsibilities into achievement statements.

CRITICAL RULES:
1. ONLY use information explicitly provided below - DO NOT invent or hallucinate any details
2. Transform the provided responsibilities into achievement-focused statements
3. If the text doesn't make sense or is gibberish, return an empty array
4. Do NOT add specific metrics or percentages unless they are in the original text
5. Use general impact language like "improved", "enhanced", "streamlined" without inventing numbers
6. Keep achievements directly tied to what was provided

PROVIDED INFORMATION:
${contextParts.join('\n\n')}

Convert the above into 2-4 achievement statements. Each should:
- Start with a past-tense action verb
- Describe the impact or outcome based ONLY on what's provided
- NOT include made-up statistics or metrics

Return ONLY a JSON array of strings. If the input doesn't make sense, return [].
Example: ["Led cross-functional team initiatives to improve project delivery", "Streamlined operational processes to enhance efficiency"]`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract the text content
    const textContent = message.content.find(c => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ achievements: [] })
    }

    // Parse the JSON array from the response
    try {
      const achievements = JSON.parse(textContent.text)
      if (Array.isArray(achievements)) {
        // Filter out any that look like they contain made-up metrics
        const filtered = achievements.filter((a: string) => {
          // Check if it contains specific percentages that weren't in the original
          const hasInventedMetric = /\b\d{1,3}%\b/.test(a) &&
            !description?.includes('%') &&
            !responsibilities?.some((r: string) => r.includes('%'))
          return !hasInventedMetric
        })
        return NextResponse.json({ achievements: filtered })
      }
    } catch {
      // If JSON parsing fails, return empty
      return NextResponse.json({ achievements: [] })
    }

    return NextResponse.json({ achievements: [] })
  } catch (error) {
    console.error('Error generating achievements:', error)
    return NextResponse.json(
      { error: 'Failed to generate achievements' },
      { status: 500 }
    )
  }
}
