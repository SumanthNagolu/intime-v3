import { NextRequest, NextResponse } from 'next/server'
import { parseResumeWithClaude, ParsedResumeData, ResumeFileType } from '@/lib/services/resume-parser'
import { createClient } from '@/lib/supabase/server'

// ============================================
// RESUME PARSE API ROUTE
// POST /api/resume/parse
// Supports PDF and DOCX files
// ============================================

export const maxDuration = 60 // Allow up to 60 seconds for parsing
export const dynamic = 'force-dynamic'

interface ParseResponse {
  success: boolean
  data?: ParsedResumeData
  error?: string
  processingTimeMs?: number
}

/**
 * POST /api/resume/parse
 * Accepts PDF file upload, parses with Claude, returns structured data
 */
export async function POST(request: NextRequest): Promise<NextResponse<ParseResponse>> {
  try {
    // Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in to parse resumes.' },
        { status: 401 }
      )
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[ResumeParseAPI] ANTHROPIC_API_KEY not configured')
      return NextResponse.json(
        { success: false, error: 'Resume parsing service is not configured. Please contact support.' },
        { status: 503 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided. Please upload a PDF or Word document.' },
        { status: 400 }
      )
    }

    // Determine file type
    const fileName = file.name.toLowerCase()
    const mimeType = file.type.toLowerCase()

    const isPdf = mimeType.includes('pdf') || fileName.endsWith('.pdf')
    const isDocx = mimeType.includes('wordprocessingml') ||
                   mimeType.includes('msword') ||
                   fileName.endsWith('.docx') ||
                   fileName.endsWith('.doc')

    // Validate file type
    if (!isPdf && !isDocx) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload a PDF or Word document (.pdf, .docx, .doc).' },
        { status: 400 }
      )
    }

    const fileType: ResumeFileType = isPdf ? 'pdf' : 'docx'

    // Validate file size (10MB max)
    const maxSizeBytes = 10 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`,
        },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse resume with Claude
    const result = await parseResumeWithClaude(buffer, {
      maxRetries: 1,
      timeoutMs: 45000, // 45 second timeout for Claude
      fileType,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to parse resume',
          processingTimeMs: result.processingTimeMs,
        },
        { status: 422 }
      )
    }

    // Log successful parse (for analytics, no PII)
    console.log('[ResumeParseAPI] Successfully parsed resume', {
      userId: user.id,
      fileSize: file.size,
      processingTimeMs: result.processingTimeMs,
      confidence: result.data?.confidence.overall,
    })

    return NextResponse.json({
      success: true,
      data: result.data,
      processingTimeMs: result.processingTimeMs,
    })
  } catch (error) {
    console.error('[ResumeParseAPI] Unexpected error:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('abort')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Resume parsing timed out. Please try again or enter details manually.',
          },
          { status: 504 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while parsing the resume.',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/resume/parse
 * Health check endpoint
 */
export async function GET(): Promise<NextResponse> {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY

  return NextResponse.json({
    service: 'resume-parser',
    status: hasApiKey ? 'ready' : 'not_configured',
    maxFileSizeMB: 10,
    supportedFormats: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ],
  })
}



