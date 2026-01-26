import Anthropic from '@anthropic-ai/sdk'
import { extractText } from 'unpdf'
import mammoth from 'mammoth'

// ============================================
// RESUME PARSER SERVICE - Claude Integration
// Supports PDF and DOCX files
// ============================================

/**
 * Work history entry extracted from resume
 */
export interface ParsedWorkHistoryEntry {
  companyName: string
  companyIndustry?: string // Inferred industry (e.g., "Insurance", "Banking", "Healthcare")
  jobTitle: string
  department?: string
  employmentType?: 'full_time' | 'contract' | 'freelance' | 'internship' | 'part_time'
  startDate: string // YYYY-MM format
  endDate?: string // YYYY-MM format, undefined if current
  isCurrent: boolean
  location?: string
  locationCity?: string
  locationState?: string
  locationCountry?: string
  isRemote?: boolean
  description?: string
  responsibilities?: string[] // Key responsibilities
  achievements?: string[] // Quantifiable achievements
  skillsUsed?: string[] // Skills used in this role
  toolsUsed?: string[] // Tools/technologies used
  projects?: string[] // Notable projects
}

/**
 * Education entry extracted from resume
 */
export interface ParsedEducationEntry {
  institutionName: string
  degreeType?: 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd' | 'other'
  degreeName?: string
  fieldOfStudy?: string
  startDate?: string // YYYY-MM format
  endDate?: string // YYYY-MM format
  gpa?: number
  honors?: string
}

/**
 * Certification entry extracted from resume
 */
export interface ParsedCertificationEntry {
  name: string
  issuingOrganization?: string
  issueDate?: string // YYYY-MM format
  expiryDate?: string // YYYY-MM format
  credentialId?: string
}

/**
 * Parsed resume data structure matching CandidateIntakeFormData
 */
export interface ParsedResumeData {
  // Basic Info
  firstName: string
  lastName: string
  email: string
  phone?: string
  mobile?: string // Secondary phone
  linkedinProfile?: string
  githubProfile?: string
  portfolioUrl?: string

  // Professional Info
  professionalHeadline?: string // Current title or tagline
  professionalSummary?: string // Generated summary
  currentCompany?: string // Most recent employer
  currentTitle?: string // Current job title
  skills: string[]
  primarySkills?: string[] // Top/primary skills
  experienceYears: number
  totalExperienceMonths?: number // More precise

  // Location
  location?: string
  locationCity?: string
  locationState?: string
  locationCountry?: string
  timezone?: string

  // Work Authorization (inferred if mentioned)
  visaStatus?: 'us_citizen' | 'green_card' | 'h1b' | 'l1' | 'tn' | 'opt' | 'cpt' | 'ead' | 'other'
  requiresSponsorship?: boolean
  workAuthorizationDetails?: string

  // Availability & Preferences (if mentioned)
  noticePeriod?: string // "2 weeks", "immediate", "1 month"
  noticePeriodDays?: number
  availableFrom?: string // Date when available
  willingToRelocate?: boolean
  relocationPreferences?: string[]
  isRemoteOk?: boolean
  preferredWorkModes?: ('remote' | 'hybrid' | 'on_site')[]

  // Compensation (if mentioned)
  desiredSalary?: number
  desiredRate?: number
  rateType?: 'hourly' | 'annual'
  salaryCurrency?: string
  salaryExpectation?: string // Raw text if mentioned

  // Employment Preferences
  preferredEmploymentTypes?: ('full_time' | 'contract' | 'c2c' | 'w2' | 'part_time')[]

  // Work History
  workHistory: ParsedWorkHistoryEntry[]

  // Education
  education: ParsedEducationEntry[]

  // Certifications
  certifications: ParsedCertificationEntry[]

  // Languages (spoken/written)
  languages?: { language: string; proficiency?: string }[]

  // Additional extracted info
  publications?: string[]
  patents?: string[]
  awards?: string[]
  volunteerWork?: string[]
  professionalMemberships?: string[]

  // Confidence scores for each field
  confidence: {
    overall: number
    fields: Record<string, number>
    workHistory: number
    education: number
    certifications: number
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

// Claude extraction prompt template - Comprehensive staffing/recruiting focused
const EXTRACTION_PROMPT = `You are an expert ATS (Applicant Tracking System) resume parser for a staffing and recruiting platform. Extract MAXIMUM structured information from resumes for candidate profiles.

RESUME TEXT:
---
{resumeText}
---

Extract ALL available information and return it as valid JSON. Be thorough - staffing agencies need comprehensive candidate profiles. For any field you cannot find or are unsure about, omit it or use null.

COMPREHENSIVE JSON SCHEMA:
{
  // === BASIC CONTACT INFO ===
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required)",
  "phone": "string or null (primary phone with country code)",
  "mobile": "string or null (secondary/mobile number if different)",
  "linkedinProfile": "string or null (LinkedIn URL)",
  "githubProfile": "string or null (GitHub URL)",
  "portfolioUrl": "string or null (personal website/portfolio)",

  // === PROFESSIONAL IDENTITY ===
  "professionalHeadline": "string (current title + years exp, e.g., 'Senior Guidewire Developer with 8+ years experience')",
  "professionalSummary": "string (comprehensive 3-4 sentence summary of background, expertise, and value proposition)",
  "currentCompany": "string or null (most recent/current employer name)",
  "currentTitle": "string or null (current job title)",

  // === SKILLS (Be comprehensive!) ===
  "skills": ["ALL technical skills, tools, technologies, methodologies - be exhaustive"],
  "primarySkills": ["top 5-8 primary/core skills that define this candidate"],
  "experienceYears": "number (total professional years)",
  "totalExperienceMonths": "number (more precise calculation in months)",

  // === LOCATION ===
  "location": "string (city, state/province format)",
  "locationCity": "string",
  "locationState": "string (2-letter code for US/CA)",
  "locationCountry": "string (2-letter country code: US, CA, IN, etc.)",
  "timezone": "string or null (infer from location, e.g., 'EST', 'PST', 'IST')",

  // === WORK AUTHORIZATION (critical for staffing) ===
  "visaStatus": "string or null (us_citizen, green_card, h1b, l1, tn, opt, cpt, ead, canadian_citizen, work_permit, other)",
  "requiresSponsorship": "boolean (infer: true if H1B/OPT/CPT, false if citizen/green card)",
  "workAuthorizationDetails": "string or null (any additional visa details mentioned)",

  // === AVAILABILITY & PREFERENCES (if mentioned anywhere) ===
  "noticePeriod": "string or null (e.g., '2 weeks', 'immediate', '30 days')",
  "noticePeriodDays": "number or null",
  "availableFrom": "string or null (YYYY-MM-DD if mentioned)",
  "willingToRelocate": "boolean or null",
  "relocationPreferences": ["array of cities/states willing to relocate to"],
  "isRemoteOk": "boolean or null",
  "preferredWorkModes": ["array: 'remote', 'hybrid', 'on_site'"],

  // === COMPENSATION (if mentioned) ===
  "desiredSalary": "number or null (annual)",
  "desiredRate": "number or null (hourly rate)",
  "rateType": "string or null ('hourly' or 'annual')",
  "salaryCurrency": "string (USD, CAD, INR, etc.)",
  "salaryExpectation": "string or null (raw text if mentioned)",

  // === EMPLOYMENT PREFERENCES ===
  "preferredEmploymentTypes": ["array: 'full_time', 'contract', 'c2c', 'w2', 'part_time'"],

  // === WORK HISTORY (Extract ALL positions with maximum detail) ===
  "workHistory": [
    {
      "companyName": "string (required)",
      "companyIndustry": "string (infer: Insurance, Banking, Healthcare, Tech, Consulting, etc.)",
      "jobTitle": "string (required)",
      "department": "string or null",
      "employmentType": "string or null (full_time, contract, freelance, internship, part_time)",
      "startDate": "string (YYYY-MM format)",
      "endDate": "string or null (YYYY-MM, null if current)",
      "isCurrent": "boolean",
      "location": "string (city, state)",
      "locationCity": "string or null",
      "locationState": "string or null",
      "locationCountry": "string or null",
      "isRemote": "boolean or null",
      "description": "string (comprehensive role summary, max 800 chars)",
      "responsibilities": ["key job responsibilities as bullet points"],
      "achievements": ["quantifiable achievements and accomplishments"],
      "skillsUsed": ["specific skills used in this role"],
      "toolsUsed": ["specific tools/technologies used"],
      "projects": ["notable projects worked on"]
    }
  ],

  // === EDUCATION ===
  "education": [
    {
      "institutionName": "string (required)",
      "degreeType": "string (high_school, associate, bachelor, master, phd, diploma, certificate, other)",
      "degreeName": "string (e.g., 'Bachelor of Technology', 'MBA')",
      "fieldOfStudy": "string (major/specialization)",
      "startDate": "string or null (YYYY-MM)",
      "endDate": "string or null (YYYY-MM)",
      "gpa": "number or null (converted to 4.0 scale)",
      "honors": "string or null"
    }
  ],

  // === CERTIFICATIONS (Very important for IT staffing) ===
  "certifications": [
    {
      "name": "string (required - full certification name)",
      "acronym": "string or null (e.g., 'PMP', 'AWS SAA', 'CISSP')",
      "issuingOrganization": "string (Guidewire, AWS, Microsoft, Google, PMI, etc.)",
      "issueDate": "string or null (YYYY-MM)",
      "expiryDate": "string or null (YYYY-MM)",
      "credentialId": "string or null",
      "isActive": "boolean (true if no expiry or not expired)"
    }
  ],

  // === ADDITIONAL VALUABLE INFO ===
  "languages": [
    {
      "language": "string",
      "proficiency": "string (native, fluent, professional, basic)"
    }
  ],
  "publications": ["array of publication titles if any"],
  "patents": ["array of patents if any"],
  "awards": ["array of awards/recognition"],
  "professionalMemberships": ["professional associations/memberships"],

  // === AI CONFIDENCE SCORES ===
  "confidence": {
    "overall": "number 0-100",
    "fields": {
      "name": "number 0-100",
      "email": "number 0-100",
      "phone": "number 0-100",
      "skills": "number 0-100",
      "experience": "number 0-100",
      "location": "number 0-100",
      "workAuthorization": "number 0-100"
    },
    "workHistory": "number 0-100",
    "education": "number 0-100",
    "certifications": "number 0-100"
  }
}

EXTRACTION RULES (BE THOROUGH!):

1. SKILLS EXTRACTION (Critical for matching):
   - Extract EVERY technical skill, programming language, framework, tool, platform, methodology
   - Include domain-specific skills (e.g., Guidewire, Salesforce, SAP, Oracle)
   - Include soft skills only if explicitly mentioned and relevant (Agile, Scrum, Leadership)
   - For primarySkills, identify the 5-8 skills that best define this candidate's expertise

2. WORK HISTORY (Most important section):
   - Extract ALL positions, even short ones or internships
   - Order by most recent first
   - For companyIndustry, infer from context (Insurance companies = "Insurance", Banks = "Banking/Finance")
   - Extract specific tools and skills used in EACH role (skillsUsed, toolsUsed)
   - Capture quantifiable achievements with numbers when possible
   - If "Till date", "Present", "Current" - mark isCurrent: true, endDate: null

3. CERTIFICATIONS (High value for staffing):
   - Extract ALL certifications, licenses, credentials
   - For IT certifications, include common acronyms (AWS SAA, GCP ACE, CKAD, etc.)
   - Guidewire certifications are especially valuable - extract full names

4. LOCATION & WORK AUTHORIZATION:
   - Infer country from location context (Mississauga, ON = Canada, Hyderabad = India)
   - For locationCountry use: US, CA, IN, UK, etc.
   - Infer visa/work auth from context clues

5. EXPERIENCE CALCULATION:
   - Calculate from earliest job start to present
   - Be precise - if 8 years 6 months, use experienceYears: 8, totalExperienceMonths: 102

6. PROFESSIONAL IDENTITY:
   - Create a compelling professionalHeadline that summarizes their value
   - Write a professionalSummary that a recruiter would use to pitch this candidate

Return ONLY the JSON object, no additional text or markdown code blocks.`

/**
 * Supported file types for resume parsing
 */
export type ResumeFileType = 'pdf' | 'docx'

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
 * Extract text content from DOCX buffer
 */
export async function extractTextFromDocx(docxBuffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer: docxBuffer })
    return result.value
  } catch (error) {
    console.error('[ResumeParser] DOCX extraction error:', error)
    throw new Error('Failed to extract text from DOCX. Please ensure the file is a valid Word document.')
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
 * Validate DOCX file
 */
export function validateDocxFile(buffer: Buffer, maxSizeMB: number = 10): void {
  // Check file size
  const fileSizeMB = buffer.length / (1024 * 1024)
  if (fileSizeMB > maxSizeMB) {
    throw new Error(`File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`)
  }

  // Check DOCX magic bytes (ZIP/PK header for docx files)
  const zipMagicBytes = Buffer.from([0x50, 0x4b, 0x03, 0x04])
  if (!buffer.subarray(0, 4).equals(zipMagicBytes)) {
    throw new Error('Invalid DOCX file. Please upload a valid Word document.')
  }
}

/**
 * Validate resume file based on type
 */
export function validateResumeFile(buffer: Buffer, fileType: ResumeFileType, maxSizeMB: number = 10): void {
  if (fileType === 'pdf') {
    validatePdfFile(buffer, maxSizeMB)
  } else {
    validateDocxFile(buffer, maxSizeMB)
  }
}

/**
 * Parse resume using Claude AI
 * Supports both PDF and DOCX files
 */
export async function parseResumeWithClaude(
  fileBuffer: Buffer,
  options?: {
    maxRetries?: number
    timeoutMs?: number
    fileType?: ResumeFileType
  }
): Promise<ResumeParseResult> {
  const startTime = Date.now()
  const maxRetries = options?.maxRetries ?? 1
  const timeoutMs = options?.timeoutMs ?? 30000
  const fileType = options?.fileType ?? 'pdf'

  try {
    // Validate file
    validateResumeFile(fileBuffer, fileType)

    // Extract text based on file type
    const resumeText = fileType === 'pdf'
      ? await extractTextFromPdf(fileBuffer)
      : await extractTextFromDocx(fileBuffer)

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
            max_tokens: 4096, // Increased for comprehensive extraction
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

    // Parse work history entries with enhanced fields
    const workHistory: ParsedWorkHistoryEntry[] = Array.isArray(parsed.workHistory)
      ? parsed.workHistory
          .filter((w: unknown) => w && typeof w === 'object')
          .map((w: Record<string, unknown>) => ({
            companyName: String(w.companyName || '').trim(),
            companyIndustry: w.companyIndustry ? String(w.companyIndustry).trim() : undefined,
            jobTitle: String(w.jobTitle || '').trim(),
            department: w.department ? String(w.department).trim() : undefined,
            employmentType: normalizeEmploymentType(w.employmentType),
            startDate: normalizeDate(w.startDate),
            endDate: w.endDate ? normalizeDate(w.endDate) : undefined,
            isCurrent: Boolean(w.isCurrent),
            location: w.location ? String(w.location).trim() : undefined,
            locationCity: w.locationCity ? String(w.locationCity).trim() : undefined,
            locationState: w.locationState ? String(w.locationState).trim() : undefined,
            locationCountry: w.locationCountry ? String(w.locationCountry).trim() : undefined,
            isRemote: typeof w.isRemote === 'boolean' ? w.isRemote : undefined,
            description: w.description ? String(w.description).trim().substring(0, 1500) : undefined,
            responsibilities: Array.isArray(w.responsibilities)
              ? w.responsibilities.map((r: unknown) => String(r).trim()).filter(Boolean)
              : undefined,
            achievements: Array.isArray(w.achievements)
              ? w.achievements.map((a: unknown) => String(a).trim()).filter(Boolean)
              : [],
            skillsUsed: Array.isArray(w.skillsUsed)
              ? w.skillsUsed.map((s: unknown) => String(s).trim()).filter(Boolean)
              : undefined,
            toolsUsed: Array.isArray(w.toolsUsed)
              ? w.toolsUsed.map((t: unknown) => String(t).trim()).filter(Boolean)
              : undefined,
            projects: Array.isArray(w.projects)
              ? w.projects.map((p: unknown) => String(p).trim()).filter(Boolean)
              : undefined,
          }))
          .filter((w: ParsedWorkHistoryEntry) => w.companyName && w.jobTitle)
      : []

    // Parse education entries
    const education: ParsedEducationEntry[] = Array.isArray(parsed.education)
      ? parsed.education
          .filter((e: unknown) => e && typeof e === 'object')
          .map((e: Record<string, unknown>) => ({
            institutionName: String(e.institutionName || '').trim(),
            degreeType: normalizeDegreeType(e.degreeType),
            degreeName: e.degreeName ? String(e.degreeName).trim() : undefined,
            fieldOfStudy: e.fieldOfStudy ? String(e.fieldOfStudy).trim() : undefined,
            startDate: e.startDate ? normalizeDate(e.startDate) : undefined,
            endDate: e.endDate ? normalizeDate(e.endDate) : undefined,
            gpa: typeof e.gpa === 'number' ? Math.max(0, Math.min(4, e.gpa)) : undefined,
            honors: e.honors ? String(e.honors).trim() : undefined,
          }))
          .filter((e: ParsedEducationEntry) => e.institutionName)
      : []

    // Parse certifications
    const certifications: ParsedCertificationEntry[] = Array.isArray(parsed.certifications)
      ? parsed.certifications
          .filter((c: unknown) => c && typeof c === 'object')
          .map((c: Record<string, unknown>) => ({
            name: String(c.name || '').trim(),
            issuingOrganization: c.issuingOrganization ? String(c.issuingOrganization).trim() : undefined,
            issueDate: c.issueDate ? normalizeDate(c.issueDate) : undefined,
            expiryDate: c.expiryDate ? normalizeDate(c.expiryDate) : undefined,
            credentialId: c.credentialId ? String(c.credentialId).trim() : undefined,
          }))
          .filter((c: ParsedCertificationEntry) => c.name)
      : []

    // Parse languages if present
    const languages = Array.isArray(parsed.languages)
      ? parsed.languages
          .filter((l: unknown) => l && typeof l === 'object')
          .map((l: Record<string, unknown>) => ({
            language: String(l.language || '').trim(),
            proficiency: l.proficiency ? String(l.proficiency).trim() : undefined,
          }))
          .filter((l: { language: string }) => l.language)
      : undefined

    // Normalize and validate the parsed data with all enhanced fields
    return {
      // Basic contact info
      firstName: String(parsed.firstName || '').trim(),
      lastName: String(parsed.lastName || '').trim(),
      email: String(parsed.email || '').trim().toLowerCase(),
      phone: parsed.phone ? String(parsed.phone).trim() : undefined,
      mobile: parsed.mobile ? String(parsed.mobile).trim() : undefined,
      linkedinProfile: parsed.linkedinProfile ? String(parsed.linkedinProfile).trim() : undefined,
      githubProfile: parsed.githubProfile ? String(parsed.githubProfile).trim() : undefined,
      portfolioUrl: parsed.portfolioUrl ? String(parsed.portfolioUrl).trim() : undefined,

      // Professional identity
      professionalHeadline: parsed.professionalHeadline
        ? String(parsed.professionalHeadline).trim().substring(0, 200)
        : undefined,
      professionalSummary: parsed.professionalSummary
        ? String(parsed.professionalSummary).trim().substring(0, 2000)
        : undefined,
      currentCompany: parsed.currentCompany ? String(parsed.currentCompany).trim() : undefined,
      currentTitle: parsed.currentTitle ? String(parsed.currentTitle).trim() : undefined,

      // Skills
      skills: Array.isArray(parsed.skills)
        ? parsed.skills.map((s: unknown) => String(s).trim()).filter(Boolean)
        : [],
      primarySkills: Array.isArray(parsed.primarySkills)
        ? parsed.primarySkills.map((s: unknown) => String(s).trim()).filter(Boolean)
        : undefined,
      experienceYears: typeof parsed.experienceYears === 'number' ? Math.max(0, Math.min(50, parsed.experienceYears)) : 0,
      totalExperienceMonths: typeof parsed.totalExperienceMonths === 'number' ? parsed.totalExperienceMonths : undefined,

      // Location
      location: parsed.location ? String(parsed.location).trim() : undefined,
      locationCity: parsed.locationCity ? String(parsed.locationCity).trim() : undefined,
      locationState: parsed.locationState ? String(parsed.locationState).trim().toUpperCase() : undefined,
      locationCountry: parsed.locationCountry ? String(parsed.locationCountry).trim().toUpperCase() : undefined,
      timezone: parsed.timezone ? String(parsed.timezone).trim() : undefined,

      // Work authorization
      visaStatus: normalizeVisaStatus(parsed.visaStatus),
      requiresSponsorship: typeof parsed.requiresSponsorship === 'boolean' ? parsed.requiresSponsorship : undefined,
      workAuthorizationDetails: parsed.workAuthorizationDetails ? String(parsed.workAuthorizationDetails).trim() : undefined,

      // Availability & preferences
      noticePeriod: parsed.noticePeriod ? String(parsed.noticePeriod).trim() : undefined,
      noticePeriodDays: typeof parsed.noticePeriodDays === 'number' ? parsed.noticePeriodDays : undefined,
      availableFrom: parsed.availableFrom ? String(parsed.availableFrom).trim() : undefined,
      willingToRelocate: typeof parsed.willingToRelocate === 'boolean' ? parsed.willingToRelocate : undefined,
      relocationPreferences: Array.isArray(parsed.relocationPreferences)
        ? parsed.relocationPreferences.map((r: unknown) => String(r).trim()).filter(Boolean)
        : undefined,
      isRemoteOk: typeof parsed.isRemoteOk === 'boolean' ? parsed.isRemoteOk : undefined,
      preferredWorkModes: Array.isArray(parsed.preferredWorkModes)
        ? parsed.preferredWorkModes.filter((m: unknown) => ['remote', 'hybrid', 'on_site'].includes(String(m)))
        : undefined,

      // Compensation
      desiredSalary: typeof parsed.desiredSalary === 'number' ? parsed.desiredSalary : undefined,
      desiredRate: typeof parsed.desiredRate === 'number' ? parsed.desiredRate : undefined,
      rateType: parsed.rateType === 'hourly' || parsed.rateType === 'annual' ? parsed.rateType : undefined,
      salaryCurrency: parsed.salaryCurrency ? String(parsed.salaryCurrency).trim().toUpperCase() : undefined,
      salaryExpectation: parsed.salaryExpectation ? String(parsed.salaryExpectation).trim() : undefined,

      // Employment preferences
      preferredEmploymentTypes: Array.isArray(parsed.preferredEmploymentTypes)
        ? parsed.preferredEmploymentTypes.filter((t: unknown) =>
            ['full_time', 'contract', 'c2c', 'w2', 'part_time'].includes(String(t))
          )
        : undefined,

      // Structured data
      workHistory,
      education,
      certifications,

      // Additional info
      languages,
      publications: Array.isArray(parsed.publications)
        ? parsed.publications.map((p: unknown) => String(p).trim()).filter(Boolean)
        : undefined,
      patents: Array.isArray(parsed.patents)
        ? parsed.patents.map((p: unknown) => String(p).trim()).filter(Boolean)
        : undefined,
      awards: Array.isArray(parsed.awards)
        ? parsed.awards.map((a: unknown) => String(a).trim()).filter(Boolean)
        : undefined,
      professionalMemberships: Array.isArray(parsed.professionalMemberships)
        ? parsed.professionalMemberships.map((m: unknown) => String(m).trim()).filter(Boolean)
        : undefined,

      // Confidence scores
      confidence: {
        overall: typeof parsed.confidence?.overall === 'number' ? parsed.confidence.overall : 70,
        fields: parsed.confidence?.fields || {},
        workHistory: typeof parsed.confidence?.workHistory === 'number' ? parsed.confidence.workHistory : 70,
        education: typeof parsed.confidence?.education === 'number' ? parsed.confidence.education : 70,
        certifications: typeof parsed.confidence?.certifications === 'number' ? parsed.confidence.certifications : 70,
      },
    }
  } catch (error) {
    console.error('[ResumeParser] JSON parse error:', error)
    return null
  }
}

/**
 * Normalize date to YYYY-MM format
 */
function normalizeDate(dateValue: unknown): string {
  if (!dateValue) return ''
  const dateStr = String(dateValue).trim()

  // Already in YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    return dateStr
  }

  // YYYY-MM-DD format - extract YYYY-MM
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr.substring(0, 7)
  }

  // Try to parse various formats
  const match = dateStr.match(/(\d{4})[-/]?(\d{1,2})?/)
  if (match) {
    const year = match[1]
    const month = match[2] ? match[2].padStart(2, '0') : '01'
    return `${year}-${month}`
  }

  return ''
}

/**
 * Normalize degree type to valid enum value
 */
function normalizeDegreeType(
  degreeType: unknown
): ParsedEducationEntry['degreeType'] | undefined {
  if (!degreeType) return undefined

  const normalized = String(degreeType).toLowerCase().trim()

  const validTypes: ParsedEducationEntry['degreeType'][] = [
    'high_school',
    'associate',
    'bachelor',
    'master',
    'phd',
    'other',
  ]

  if (validTypes.includes(normalized as ParsedEducationEntry['degreeType'])) {
    return normalized as ParsedEducationEntry['degreeType']
  }

  // Common mappings
  const mappings: Record<string, ParsedEducationEntry['degreeType']> = {
    'bs': 'bachelor',
    'ba': 'bachelor',
    'bsc': 'bachelor',
    'bachelors': 'bachelor',
    "bachelor's": 'bachelor',
    'undergraduate': 'bachelor',
    'ms': 'master',
    'ma': 'master',
    'msc': 'master',
    'mba': 'master',
    'masters': 'master',
    "master's": 'master',
    'graduate': 'master',
    'phd': 'phd',
    'doctorate': 'phd',
    'doctoral': 'phd',
    'doctor': 'phd',
    'high school': 'high_school',
    'hs': 'high_school',
    'ged': 'high_school',
    'aa': 'associate',
    'as': 'associate',
    'associates': 'associate',
    "associate's": 'associate',
  }

  return mappings[normalized] || 'other'
}

/**
 * Normalize employment type to valid enum value
 */
function normalizeEmploymentType(
  employmentType: unknown
): ParsedWorkHistoryEntry['employmentType'] | undefined {
  if (!employmentType) return undefined

  const normalized = String(employmentType).toLowerCase().trim().replace(/[^a-z_]/g, '_')

  const validTypes: ParsedWorkHistoryEntry['employmentType'][] = [
    'full_time',
    'contract',
    'freelance',
    'internship',
    'part_time',
  ]

  if (validTypes.includes(normalized as ParsedWorkHistoryEntry['employmentType'])) {
    return normalized as ParsedWorkHistoryEntry['employmentType']
  }

  // Common mappings
  const mappings: Record<string, ParsedWorkHistoryEntry['employmentType']> = {
    'fulltime': 'full_time',
    'full': 'full_time',
    'permanent': 'full_time',
    'fte': 'full_time',
    'contractor': 'contract',
    'consulting': 'contract',
    'consultant': 'contract',
    'c2c': 'contract',
    'w2': 'full_time',
    'w2_contract': 'contract',
    'corp_to_corp': 'contract',
    'freelancer': 'freelance',
    'self_employed': 'freelance',
    'intern': 'internship',
    'parttime': 'part_time',
    'part': 'part_time',
  }

  return mappings[normalized] || undefined
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

  // Common variations including international work permits
  const mappings: Record<string, ParsedResumeData['visaStatus']> = {
    // US Citizens
    citizen: 'us_citizen',
    us_citizen: 'us_citizen',
    american_citizen: 'us_citizen',
    usc: 'us_citizen',
    // Green Card / Permanent Resident
    green_card: 'green_card',
    permanent_resident: 'green_card',
    gc: 'green_card',
    pr: 'green_card',
    lpr: 'green_card',
    // H1B
    h1b: 'h1b',
    h_1b: 'h1b',
    h1_b: 'h1b',
    h1b_visa: 'h1b',
    // L1
    l1: 'l1',
    l_1: 'l1',
    l1a: 'l1',
    l1b: 'l1',
    l1_visa: 'l1',
    // TN (US-Canada-Mexico)
    tn: 'tn',
    tn_visa: 'tn',
    tn_1: 'tn',
    nafta: 'tn',
    // OPT/CPT (Student)
    opt: 'opt',
    f1_opt: 'opt',
    opt_stem: 'opt',
    stem_opt: 'opt',
    cpt: 'cpt',
    f1_cpt: 'cpt',
    // EAD
    ead: 'ead',
    employment_authorization: 'ead',
    // Canadian
    canadian_citizen: 'other', // Will be stored but mapped to 'other' for now
    canada_citizen: 'other',
    canadian_pr: 'other',
    work_permit: 'other',
    open_work_permit: 'other',
    lmia: 'other',
    // Indian
    indian_citizen: 'other',
    // Generic
    authorized: 'other',
    authorized_to_work: 'other',
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

