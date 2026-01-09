import Anthropic from '@anthropic-ai/sdk'
import { extractText } from 'unpdf'

// ============================================
// RESUME PARSER SERVICE - Claude Integration
// ============================================

/**
 * Parsed resume data structure matching CandidateIntakeFormData
 */
export interface ParsedResumeData {
  // Basic Info
  firstName: string
  lastName: string
  email: string
  phone?: string
  linkedinProfile?: string

  // Professional Info
  professionalHeadline?: string
  professionalSummary?: string
  skills: string[]
  experienceYears: number

  // Location
  location?: string
  locationCity?: string
  locationState?: string
  locationCountry?: string

  // Work Authorization (inferred if mentioned)
  visaStatus?: 'us_citizen' | 'green_card' | 'h1b' | 'l1' | 'tn' | 'opt' | 'cpt' | 'ead' | 'other'

  // Confidence scores for each field
  confidence: {
    overall: number
    fields: Record<string, number>
  }

  // Raw extracted text (for reference)
  rawText?: string
}

/**
 * Resume parsing result
 */
export interface ResumeParseResult {
  success: boolean
  data?: ParsedResumeData
  error?: string
  processingTimeMs: number
}

// Claude extraction prompt template
const EXTRACTION_PROMPT = `You are an expert resume parser for a staffing/recruiting platform. Extract structured information from the following resume text.

RESUME TEXT:
---
{resumeText}
---

Extract the following information and return it as valid JSON. For any field you cannot find or are unsure about, omit it or use null.

Required JSON schema:
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required, extract email address)",
  "phone": "string or null (phone number with country code if available)",
  "linkedinProfile": "string or null (LinkedIn URL if present)",
  "professionalHeadline": "string or null (current job title or professional headline, max 100 chars)",
  "professionalSummary": "string or null (brief professional summary, max 500 chars)",
  "skills": ["array of skill strings - extract technical skills, tools, frameworks, languages"],
  "experienceYears": "number (calculate total years of professional experience from work history)",
  "location": "string or null (city, state format like 'Austin, TX')",
  "locationCity": "string or null",
  "locationState": "string or null (use 2-letter state code for US)",
  "locationCountry": "string or null (use 2-letter country code, default 'US')",
  "visaStatus": "string or null (one of: 'us_citizen', 'green_card', 'h1b', 'l1', 'tn', 'opt', 'cpt', 'ead', 'other' - only if explicitly mentioned)",
  "confidence": {
    "overall": "number 0-100 (your confidence in the overall extraction)",
    "fields": {
      "name": "number 0-100",
      "email": "number 0-100",
      "phone": "number 0-100",
      "skills": "number 0-100",
      "experience": "number 0-100",
      "location": "number 0-100"
    }
  }
}

IMPORTANT RULES:
1. For skills: Extract specific technical skills, programming languages, frameworks, tools. Be comprehensive but avoid generic soft skills.
2. For experienceYears: Calculate from the earliest job start date to present. If unclear, estimate conservatively.
3. For professionalHeadline: Use their most recent job title or create a concise headline from their experience.
4. For professionalSummary: Create a brief 2-3 sentence summary of their background and expertise.
5. For location: Parse city and state separately. Use standard 2-letter state codes for US states.
6. For visaStatus: Only include if explicitly mentioned (e.g., "US Citizen", "H1B", "Green Card holder").
7. Confidence scores should reflect how certain you are about each extraction.

Return ONLY the JSON object, no additional text or markdown.`

/**
 * Extract text content from PDF buffer
 */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    // unpdf requires Uint8Array, convert Buffer to Uint8Array
    const uint8Array = new Uint8Array(pdfBuffer.buffer, pdfBuffer.byteOffset, pdfBuffer.byteLength)
    const result = await extractText(uint8Array, { mergePages: true })
    return result.text
  } catch (error) {
    console.error('[ResumeParser] PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF.')
  }
}

/**
 * Validate PDF file
 */
export function validatePdfFile(buffer: Buffer, maxSizeMB: number = 10): void {
  // Check file size
  const fileSizeMB = buffer.length / (1024 * 1024)
  if (fileSizeMB > maxSizeMB) {
    throw new Error(`File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`)
  }

  // Check PDF magic bytes (%PDF-)
  const pdfMagicBytes = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d])
  if (!buffer.subarray(0, 5).equals(pdfMagicBytes)) {
    throw new Error('Invalid PDF file. Please upload a valid PDF document.')
  }
}

/**
 * Parse resume using Claude AI
 */
export async function parseResumeWithClaude(
  pdfBuffer: Buffer,
  options?: {
    maxRetries?: number
    timeoutMs?: number
  }
): Promise<ResumeParseResult> {
  const startTime = Date.now()
  const maxRetries = options?.maxRetries ?? 1
  const timeoutMs = options?.timeoutMs ?? 30000

  try {
    // Validate PDF
    validatePdfFile(pdfBuffer)

    // Extract text from PDF
    const resumeText = await extractTextFromPdf(pdfBuffer)

    if (!resumeText || resumeText.trim().length < 50) {
      return {
        success: false,
        error: 'Could not extract sufficient text from the PDF. The resume may be image-based or corrupted.',
        processingTimeMs: Date.now() - startTime,
      }
    }

    // Initialize Claude client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // Prepare prompt
    const prompt = EXTRACTION_PROMPT.replace('{resumeText}', resumeText.substring(0, 15000)) // Limit text length

    let lastError: Error | null = null

    // Retry loop
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Create AbortController for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

        try {
          const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2048,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          })

          clearTimeout(timeoutId)

          // Extract JSON from response
          const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

          // Parse JSON response
          const parsedData = parseClaudeResponse(responseText)

          if (!parsedData) {
            throw new Error('Failed to parse Claude response as JSON')
          }

          // Validate required fields
          if (!parsedData.firstName || !parsedData.lastName || !parsedData.email) {
            return {
              success: false,
              error: 'Could not extract required fields (name, email) from the resume. Please verify the PDF contains this information.',
              processingTimeMs: Date.now() - startTime,
            }
          }

          return {
            success: true,
            data: {
              ...parsedData,
              rawText: resumeText.substring(0, 5000), // Store truncated raw text
            },
            processingTimeMs: Date.now() - startTime,
          }
        } finally {
          clearTimeout(timeoutId)
        }
      } catch (error) {
        lastError = error as Error
        console.error(`[ResumeParser] Attempt ${attempt + 1} failed:`, error)

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
        }
      }
    }

    // All retries failed
    return {
      success: false,
      error: lastError?.message || 'Failed to parse resume after multiple attempts',
      processingTimeMs: Date.now() - startTime,
    }
  } catch (error) {
    console.error('[ResumeParser] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      processingTimeMs: Date.now() - startTime,
    }
  }
}

/**
 * Parse Claude's JSON response
 */
function parseClaudeResponse(responseText: string): ParsedResumeData | null {
  try {
    // Try to extract JSON from the response
    let jsonStr = responseText.trim()

    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7)
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3)
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3)
    }
    jsonStr = jsonStr.trim()

    const parsed = JSON.parse(jsonStr)

    // Normalize and validate the parsed data
    return {
      firstName: String(parsed.firstName || '').trim(),
      lastName: String(parsed.lastName || '').trim(),
      email: String(parsed.email || '').trim().toLowerCase(),
      phone: parsed.phone ? String(parsed.phone).trim() : undefined,
      linkedinProfile: parsed.linkedinProfile ? String(parsed.linkedinProfile).trim() : undefined,
      professionalHeadline: parsed.professionalHeadline
        ? String(parsed.professionalHeadline).trim().substring(0, 200)
        : undefined,
      professionalSummary: parsed.professionalSummary
        ? String(parsed.professionalSummary).trim().substring(0, 2000)
        : undefined,
      skills: Array.isArray(parsed.skills)
        ? parsed.skills.map((s: unknown) => String(s).trim()).filter(Boolean)
        : [],
      experienceYears: typeof parsed.experienceYears === 'number' ? Math.max(0, Math.min(50, parsed.experienceYears)) : 0,
      location: parsed.location ? String(parsed.location).trim() : undefined,
      locationCity: parsed.locationCity ? String(parsed.locationCity).trim() : undefined,
      locationState: parsed.locationState ? String(parsed.locationState).trim().toUpperCase() : undefined,
      locationCountry: parsed.locationCountry ? String(parsed.locationCountry).trim().toUpperCase() : 'US',
      visaStatus: normalizeVisaStatus(parsed.visaStatus),
      confidence: {
        overall: typeof parsed.confidence?.overall === 'number' ? parsed.confidence.overall : 70,
        fields: parsed.confidence?.fields || {},
      },
    }
  } catch (error) {
    console.error('[ResumeParser] JSON parse error:', error)
    return null
  }
}

/**
 * Normalize visa status to valid enum value
 */
function normalizeVisaStatus(
  status: string | undefined | null
): ParsedResumeData['visaStatus'] | undefined {
  if (!status) return undefined

  const normalized = String(status).toLowerCase().trim().replace(/[^a-z0-9]/g, '_')

  const validStatuses: ParsedResumeData['visaStatus'][] = [
    'us_citizen',
    'green_card',
    'h1b',
    'l1',
    'tn',
    'opt',
    'cpt',
    'ead',
    'other',
  ]

  // Direct match
  if (validStatuses.includes(normalized as ParsedResumeData['visaStatus'])) {
    return normalized as ParsedResumeData['visaStatus']
  }

  // Common variations
  const mappings: Record<string, ParsedResumeData['visaStatus']> = {
    citizen: 'us_citizen',
    us_citizen: 'us_citizen',
    american_citizen: 'us_citizen',
    green_card: 'green_card',
    permanent_resident: 'green_card',
    gc: 'green_card',
    h1b: 'h1b',
    h_1b: 'h1b',
    h1_b: 'h1b',
    l1: 'l1',
    l_1: 'l1',
    l1a: 'l1',
    l1b: 'l1',
    tn: 'tn',
    tn_visa: 'tn',
    opt: 'opt',
    f1_opt: 'opt',
    cpt: 'cpt',
    ead: 'ead',
  }

  return mappings[normalized] || undefined
}

/**
 * Calculate confidence level description
 */
export function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

