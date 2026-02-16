/**
 * AI Service
 * Phase 4: Intelligence
 *
 * Core AI functionality including chat, suggestions, and matching.
 */

// ============================================
// Types
// ============================================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatContext {
  entityType?: string
  entityId?: string
  entityData?: Record<string, unknown>
  recentActivity?: Array<{ type: string; description: string; timestamp: string }>
  userRole?: string
  userName?: string
}

export interface ChatResponse {
  content: string
  interactionType: 'question' | 'suggestion' | 'action' | 'analysis' | 'summary'
  referencedEntities?: Array<{ type: string; id: string; name: string }>
  suggestedActions?: Array<{
    type: string
    label: string
    payload: Record<string, unknown>
  }>
  inputTokens: number
  outputTokens: number
}

export interface AISuggestion {
  type: string
  title: string
  description: string
  reasoning: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  score: number
  entityType?: string
  entityId?: string
  actionType?: string
  actionPayload?: Record<string, unknown>
  expiresAt?: string
}

export interface MatchScore {
  candidateId: string
  jobId: string
  overallScore: number
  componentScores: {
    skills: number
    experience: number
    location: number
    salary: number
    culture?: number
  }
  matchReasons: string[]
  concernReasons: string[]
}

// ============================================
// System Prompts
// ============================================

const SYSTEM_PROMPTS = {
  assistant: `You are an AI assistant for InTime, a staffing and recruiting platform. Your role is to help recruiters and staffing professionals be more efficient and effective.

You have access to information about:
- Jobs and job requirements
- Candidates and their profiles
- Accounts (client companies)
- Submissions and placements
- Activities and communications

When helping users:
1. Be concise and actionable
2. Provide specific recommendations when possible
3. Reference relevant entities by name when available
4. Suggest next steps or follow-up actions
5. Ask clarifying questions if the request is ambiguous

Always maintain a professional, helpful tone. Focus on helping users achieve their recruiting goals.`,

  suggestion: `You are an AI that generates proactive suggestions for recruiters. Analyze the provided context and generate helpful, actionable suggestions.

For each suggestion, provide:
1. A clear, specific title
2. A brief description of what to do
3. The reasoning behind the suggestion
4. Priority level (critical, high, medium, low)
5. A confidence score (0-1)

Focus on:
- Follow-up actions that are overdue or due soon
- Candidate-job matches that look promising
- Risks or issues that need attention
- Opportunities to improve metrics
- Time-sensitive actions`,

  matching: `You are an AI that evaluates candidate-job fit. Analyze the candidate profile and job requirements to provide a detailed match assessment.

Consider these factors:
1. Skills match (technical and soft skills)
2. Experience level and relevance
3. Location/remote work compatibility
4. Salary/rate alignment
5. Cultural fit indicators

Provide:
- Overall match score (0-1)
- Component scores for each factor
- Top 3 reasons this is a good match
- Top 3 potential concerns
- Recommendation (strong match, good match, possible match, poor match)`,
}

// ============================================
// AI Service Class
// ============================================

export class AIService {
  private apiKey: string
  private baseUrl: string
  private model: string

  constructor(options?: { apiKey?: string; baseUrl?: string; model?: string }) {
    this.apiKey = options?.apiKey ?? process.env.OPENAI_API_KEY ?? ''
    this.baseUrl = options?.baseUrl ?? 'https://api.openai.com/v1'
    this.model = options?.model ?? 'gpt-4-turbo-preview'
  }

  /**
   * Chat with the AI assistant
   */
  async chat(
    messages: ChatMessage[],
    context?: ChatContext
  ): Promise<ChatResponse> {
    // Build system message with context
    let systemContent = SYSTEM_PROMPTS.assistant

    if (context) {
      systemContent += '\n\nCurrent context:'
      if (context.entityType && context.entityId) {
        systemContent += `\n- Viewing: ${context.entityType} (ID: ${context.entityId})`
      }
      if (context.entityData) {
        systemContent += `\n- Entity data: ${JSON.stringify(context.entityData, null, 2)}`
      }
      if (context.recentActivity?.length) {
        systemContent += `\n- Recent activity: ${context.recentActivity.map(a => `${a.type}: ${a.description}`).join('; ')}`
      }
      if (context.userName) {
        systemContent += `\n- User: ${context.userName}`
      }
      if (context.userRole) {
        systemContent += `\n- Role: ${context.userRole}`
      }
    }

    const fullMessages = [
      { role: 'system' as const, content: systemContent },
      ...messages,
    ]

    const response = await this.callAPI({
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 2000,
    })

    // Parse response for interaction type and entities
    const interactionType = this.detectInteractionType(response.content)
    const referencedEntities = this.extractEntities(response.content)
    const suggestedActions = this.extractActions(response.content)

    return {
      content: response.content,
      interactionType,
      referencedEntities,
      suggestedActions,
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
    }
  }

  /**
   * Generate proactive suggestions
   */
  async generateSuggestions(
    userId: string,
    context: {
      pendingActivities: Array<{ id: string; type: string; dueAt: string; entityType: string; entityId: string }>
      recentSubmissions: Array<{ id: string; candidateName: string; jobTitle: string; status: string }>
      openJobs: Array<{ id: string; title: string; daysOpen: number; submissionCount: number }>
      userMetrics: Record<string, number>
    }
  ): Promise<AISuggestion[]> {
    const systemContent = SYSTEM_PROMPTS.suggestion

    const userContent = `Generate suggestions based on this context:

Pending Activities (${context.pendingActivities.length}):
${context.pendingActivities.slice(0, 10).map(a =>
  `- ${a.type} for ${a.entityType}:${a.entityId}, due: ${a.dueAt}`
).join('\n')}

Recent Submissions (${context.recentSubmissions.length}):
${context.recentSubmissions.slice(0, 10).map(s =>
  `- ${s.candidateName} → ${s.jobTitle} (${s.status})`
).join('\n')}

Open Jobs (${context.openJobs.length}):
${context.openJobs.slice(0, 10).map(j =>
  `- ${j.title}: ${j.daysOpen} days open, ${j.submissionCount} submissions`
).join('\n')}

User Metrics:
${Object.entries(context.userMetrics).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Generate 3-5 actionable suggestions. Respond in JSON format:
{
  "suggestions": [
    {
      "type": "follow_up|candidate_match|risk_alert|opportunity|metric_improvement",
      "title": "Short actionable title",
      "description": "What to do",
      "reasoning": "Why this matters",
      "priority": "critical|high|medium|low",
      "score": 0.0-1.0,
      "entityType": "job|candidate|submission|account",
      "entityId": "uuid",
      "actionType": "navigate|create|call|email",
      "actionPayload": {}
    }
  ]
}`

    const response = await this.callAPI({
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent },
      ],
      temperature: 0.5,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    try {
      const parsed = JSON.parse(response.content)
      return parsed.suggestions ?? []
    } catch {
      console.error('Failed to parse suggestions:', response.content)
      return []
    }
  }

  /**
   * Calculate candidate-job match score
   */
  async calculateMatchScore(
    candidate: {
      id: string
      name: string
      title: string
      skills: string[]
      experience: string
      location: string
      desiredSalary?: number
    },
    job: {
      id: string
      title: string
      description: string
      requirements: string[]
      location: string
      salaryMin?: number
      salaryMax?: number
      accountName: string
    }
  ): Promise<MatchScore> {
    const systemContent = SYSTEM_PROMPTS.matching

    const userContent = `Evaluate this candidate-job match:

CANDIDATE:
Name: ${candidate.name}
Current Title: ${candidate.title}
Skills: ${candidate.skills.join(', ')}
Experience: ${candidate.experience}
Location: ${candidate.location}
${candidate.desiredSalary ? `Desired Salary: $${candidate.desiredSalary}` : ''}

JOB:
Title: ${job.title}
Company: ${job.accountName}
Location: ${job.location}
${job.salaryMin && job.salaryMax ? `Salary Range: $${job.salaryMin} - $${job.salaryMax}` : ''}
Requirements: ${job.requirements.join('; ')}
Description: ${job.description.slice(0, 500)}

Respond in JSON format:
{
  "overallScore": 0.0-1.0,
  "componentScores": {
    "skills": 0.0-1.0,
    "experience": 0.0-1.0,
    "location": 0.0-1.0,
    "salary": 0.0-1.0
  },
  "matchReasons": ["reason1", "reason2", "reason3"],
  "concernReasons": ["concern1", "concern2"]
}`

    const response = await this.callAPI({
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    })

    try {
      const parsed = JSON.parse(response.content)
      return {
        candidateId: candidate.id,
        jobId: job.id,
        overallScore: parsed.overallScore ?? 0.5,
        componentScores: {
          skills: parsed.componentScores?.skills ?? 0.5,
          experience: parsed.componentScores?.experience ?? 0.5,
          location: parsed.componentScores?.location ?? 0.5,
          salary: parsed.componentScores?.salary ?? 0.5,
        },
        matchReasons: parsed.matchReasons ?? [],
        concernReasons: parsed.concernReasons ?? [],
      }
    } catch {
      console.error('Failed to parse match score:', response.content)
      return {
        candidateId: candidate.id,
        jobId: job.id,
        overallScore: 0.5,
        componentScores: { skills: 0.5, experience: 0.5, location: 0.5, salary: 0.5 },
        matchReasons: [],
        concernReasons: ['Unable to calculate match score'],
      }
    }
  }

  /**
   * Summarize content (email, notes, documents)
   */
  async summarize(
    content: string,
    type: 'email' | 'note' | 'document' | 'conversation',
    maxLength: number = 150
  ): Promise<{ summary: string; keyPoints: string[] }> {
    const response = await this.callAPI({
      messages: [
        {
          role: 'system',
          content: `Summarize the following ${type}. Be concise and extract key points.
          Respond in JSON: {"summary": "brief summary", "keyPoints": ["point1", "point2"]}`,
        },
        { role: 'user', content: content.slice(0, 4000) },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    try {
      const parsed = JSON.parse(response.content)
      return {
        summary: parsed.summary?.slice(0, maxLength) ?? 'Unable to summarize',
        keyPoints: parsed.keyPoints ?? [],
      }
    } catch {
      return { summary: 'Unable to summarize', keyPoints: [] }
    }
  }

  /**
   * Extract skills from text
   */
  async extractSkills(
    text: string
  ): Promise<Array<{
    name: string
    category: 'technical' | 'soft' | 'certification' | 'tool'
    confidence: number
  }>> {
    const response = await this.callAPI({
      messages: [
        {
          role: 'system',
          content: `Extract skills from the text. Categorize as technical, soft, certification, or tool.
          Respond in JSON: {"skills": [{"name": "skill", "category": "technical|soft|certification|tool", "confidence": 0.0-1.0}]}`,
        },
        { role: 'user', content: text.slice(0, 4000) },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    })

    try {
      const parsed = JSON.parse(response.content)
      return parsed.skills ?? []
    } catch {
      return []
    }
  }

  // ============================================
  // Private Methods
  // ============================================

  private async callAPI(options: {
    messages: Array<{ role: string; content: string }>
    temperature?: number
    max_tokens?: number
    response_format?: { type: 'json_object' | 'text' }
  }): Promise<{ content: string; usage?: { prompt_tokens: number; completion_tokens: number } }> {
    if (!this.apiKey) {
      throw new Error('AI API key not configured')
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1000,
        ...(options.response_format && { response_format: options.response_format }),
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`AI API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return {
      content: data.choices?.[0]?.message?.content ?? '',
      usage: data.usage,
    }
  }

  private detectInteractionType(
    content: string
  ): 'question' | 'suggestion' | 'action' | 'analysis' | 'summary' {
    const lowerContent = content.toLowerCase()

    if (lowerContent.includes('i suggest') || lowerContent.includes('you should') || lowerContent.includes('recommend')) {
      return 'suggestion'
    }
    if (lowerContent.includes('to summarize') || lowerContent.includes('in summary') || lowerContent.includes('here\'s a summary')) {
      return 'summary'
    }
    if (lowerContent.includes('based on my analysis') || lowerContent.includes('looking at the data')) {
      return 'analysis'
    }
    if (lowerContent.includes('i\'ve') || lowerContent.includes('i\'ll') || lowerContent.includes('done')) {
      return 'action'
    }
    return 'question'
  }

  private extractEntities(
    content: string
  ): Array<{ type: string; id: string; name: string }> {
    // Simple entity extraction - in production, use NER or structured output
    const entities: Array<{ type: string; id: string; name: string }> = []

    // Look for patterns like "candidate John Smith" or "job Software Engineer"
    const patterns = [
      { type: 'candidate', regex: /candidate\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/gi },
      { type: 'job', regex: /job\s+"([^"]+)"/gi },
      { type: 'account', regex: /(?:account|company)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi },
    ]

    for (const { type, regex } of patterns) {
      let match
      while ((match = regex.exec(content)) !== null) {
        entities.push({ type, id: '', name: match[1] })
      }
    }

    return entities
  }

  private extractActions(
    content: string
  ): Array<{ type: string; label: string; payload: Record<string, unknown> }> {
    const actions: Array<{ type: string; label: string; payload: Record<string, unknown> }> = []

    // Look for action suggestions in the content
    if (content.toLowerCase().includes('schedule')) {
      actions.push({ type: 'schedule', label: 'Schedule Meeting', payload: {} })
    }
    if (content.toLowerCase().includes('send email') || content.toLowerCase().includes('email them')) {
      actions.push({ type: 'email', label: 'Send Email', payload: {} })
    }
    if (content.toLowerCase().includes('call')) {
      actions.push({ type: 'call', label: 'Make Call', payload: {} })
    }

    return actions
  }
}

// ============================================
// Singleton Instance
// ============================================

let aiServiceInstance: AIService | null = null

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService()
  }
  return aiServiceInstance
}

export default AIService
