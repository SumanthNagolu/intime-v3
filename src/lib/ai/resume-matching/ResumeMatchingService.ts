/**
 * Resume Matching Service
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 5)
 * Story: AI-MATCH-001 - Resume Matching
 *
 * Semantic candidate-job matching using pgvector embeddings.
 * Combines vector similarity search with deep AI analysis.
 *
 * Performance: <500ms semantic search, <5s deep analysis (10 candidates)
 * Cost: ~$0.00002 per embedding, ~$0.0005 per deep match analysis
 *
 * @module lib/ai/resume-matching/ResumeMatchingService
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * Candidate match result
 */
export interface CandidateMatch {
  candidateId: string;
  candidateName?: string;
  matchScore: number; // 0-100
  reasoning: string;
  skills: {
    matched: string[];
    missing: string[];
  };
  experienceLevel: string;
  availability: string;
  similarity: number; // Cosine similarity (0-1)
  breakdown?: {
    skillsScore: number; // 0-100, 40% weight
    experienceScore: number; // 0-100, 30% weight
    projectScore: number; // 0-100, 20% weight
    availabilityScore: number; // 0-100, 10% weight
  };
}

/**
 * Find matches input
 */
export interface FindMatchesInput {
  requisitionId: string;
  candidateSources?: ('academy' | 'external' | 'bench')[];
  topK?: number;
  matchThreshold?: number;
}

/**
 * Find matches output
 */
export interface FindMatchesOutput {
  matches: CandidateMatch[];
  searchDuration: number;
  totalCandidates: number;
  tokensUsed: number;
  cost: number;
}

/**
 * Index candidate input
 */
export interface IndexCandidateInput {
  candidateId: string;
  resumeText: string;
  skills: string[];
  experienceLevel: 'entry' | 'mid' | 'senior';
  availability: 'immediate' | '2-weeks' | '1-month';
}

/**
 * Index requisition input
 */
export interface IndexRequisitionInput {
  requisitionId: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills?: string[];
  experienceLevel: 'entry' | 'mid' | 'senior';
}

/**
 * Requisition embedding data
 */
interface RequisitionEmbedding {
  requisitionId: string;
  embedding: number[];
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  experienceLevel: string;
}

/**
 * Candidate semantic match
 */
interface CandidateSemanticMatch {
  candidate_id: string;
  resume_text: string;
  skills: string[];
  experience_level: string;
  availability: string;
  similarity: number;
}

/**
 * Matching accuracy result
 */
interface MatchingAccuracy {
  accuracy: number;
  total_matches: number;
  relevant_matches: number;
}

/**
 * Resume Matching Service
 *
 * Features:
 * - Semantic search via pgvector (ivfflat index, lists=100)
 * - Deep AI analysis with GPT-4o-mini
 * - Match scoring with weighted components
 * - Feedback loop for accuracy tracking
 * - Cost-optimized (batch processing where possible)
 */
export class ResumeMatchingService {
  constructor(private config: { orgId: string; userId: string }) {}

  /**
   * Find matching candidates for a job requisition
   *
   * Performance: <500ms search + <5s analysis for 10 candidates
   *
   * @param input - Requisition ID and search parameters
   * @returns Ranked list of candidate matches
   */
  async findMatches(input: FindMatchesInput): Promise<FindMatchesOutput> {
    const startTime = performance.now();
    const topK = input.topK || 10;
    const matchThreshold = input.matchThreshold || 0.70;

    try {
      // Step 1: Get requisition embedding
      const requisition = await this.getRequisitionEmbedding(input.requisitionId);
      if (!requisition) {
        throw new Error(`Requisition ${input.requisitionId} not indexed`);
      }

      // Step 2: Semantic search via pgvector
      const semanticMatches = await this.semanticSearch(
        requisition.embedding,
        topK,
        matchThreshold
      );

      // Step 3: Deep AI analysis for each match
      const matches = await this.analyzeMatches(
        requisition,
        semanticMatches
      );

      // Step 4: Store match history
      await this.storeMatches(input.requisitionId, matches);

      const searchDuration = performance.now() - startTime;
      const tokensUsed = matches.length * 500; // Estimated ~500 tokens per analysis
      const cost = this.calculateCost(tokensUsed);

      return {
        matches,
        searchDuration,
        totalCandidates: semanticMatches.length,
        tokensUsed,
        cost,
      };
    } catch (error) {
      console.error('[ResumeMatchingService] findMatches error:', error);
      throw new Error(
        `Failed to find matches: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Index a candidate for semantic search
   *
   * Generates pgvector embedding and stores in database.
   *
   * @param input - Candidate data
   * @returns Embedding ID
   */
  async indexCandidate(input: IndexCandidateInput): Promise<string> {
    try {
      // Generate embedding
      const embedding = await this.generateEmbedding(
        `${input.resumeText}\n\nSkills: ${input.skills.join(', ')}\nExperience: ${input.experienceLevel}`
      );

      // Store in database
      const { data, error } = await supabase
        .from('candidate_embeddings')
        .upsert(
          {
            org_id: this.config.orgId,
            candidate_id: input.candidateId,
            embedding: JSON.stringify(embedding),
            resume_text: input.resumeText,
            skills: input.skills,
            experience_level: input.experienceLevel,
            availability: input.availability,
          },
          { onConflict: 'org_id,candidate_id' }
        )
        .select('id')
        .single();

      if (error) throw error;

      // Run ANALYZE for query planner after bulk inserts
      await supabase.rpc('analyze_table', { table_name: 'candidate_embeddings' });

      return data.id;
    } catch (error) {
      console.error('[ResumeMatchingService] indexCandidate error:', error);
      throw new Error(
        `Failed to index candidate: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Index a job requisition for semantic search
   *
   * @param input - Requisition data
   * @returns Embedding ID
   */
  async indexRequisition(input: IndexRequisitionInput): Promise<string> {
    try {
      // Generate embedding
      const text = `${input.description}\n\nRequired Skills: ${input.requiredSkills.join(', ')}\nNice-to-Have: ${input.niceToHaveSkills?.join(', ') || 'None'}\nExperience Level: ${input.experienceLevel}`;
      const embedding = await this.generateEmbedding(text);

      // Store in database
      const { data, error } = await supabase
        .from('requisition_embeddings')
        .upsert(
          {
            org_id: this.config.orgId,
            requisition_id: input.requisitionId,
            embedding: JSON.stringify(embedding),
            description: input.description,
            required_skills: input.requiredSkills,
            nice_to_have_skills: input.niceToHaveSkills || [],
            experience_level: input.experienceLevel,
          },
          { onConflict: 'org_id,requisition_id' }
        )
        .select('id')
        .single();

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error('[ResumeMatchingService] indexRequisition error:', error);
      throw new Error(
        `Failed to index requisition: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate embedding using OpenAI text-embedding-3-small
   *
   * Model: text-embedding-3-small (1536 dimensions)
   * Cost: $0.00002 per 1K tokens
   *
   * @param text - Text to embed
   * @returns Embedding vector
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('[ResumeMatchingService] generateEmbedding error:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Get requisition embedding from database
   */
  private async getRequisitionEmbedding(requisitionId: string): Promise<RequisitionEmbedding | null> {
    const { data, error } = await supabase
      .from('requisition_embeddings')
      .select('*')
      .eq('requisition_id', requisitionId)
      .eq('org_id', this.config.orgId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      requisitionId: data.requisition_id,
      embedding: JSON.parse(data.embedding),
      description: data.description,
      requiredSkills: data.required_skills,
      niceToHaveSkills: data.nice_to_have_skills,
      experienceLevel: data.experience_level,
    };
  }

  /**
   * Semantic search using pgvector
   *
   * Uses cosine similarity (ivfflat index with lists=100)
   * Performance: <500ms for 10K embeddings
   *
   * @param queryEmbedding - Query embedding vector
   * @param topK - Number of results
   * @param threshold - Minimum similarity threshold (0-1)
   * @returns Top-K matching candidates
   */
  private async semanticSearch(
    queryEmbedding: number[],
    topK: number,
    threshold: number
  ): Promise<CandidateSemanticMatch[]> {
    try {
      const { data, error } = await supabase.rpc('search_candidates', {
        p_org_id: this.config.orgId,
        p_query_embedding: JSON.stringify(queryEmbedding),
        p_match_threshold: threshold,
        p_match_count: topK,
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[ResumeMatchingService] semanticSearch error:', error);
      return [];
    }
  }

  /**
   * Deep AI analysis of candidate matches
   *
   * Uses GPT-4o-mini for cost optimization
   * Calculates weighted match scores:
   * - Skills match: 40%
   * - Experience level: 30%
   * - Project relevance: 20%
   * - Availability: 10%
   *
   * @param requisition - Job requisition data
   * @param candidates - Candidate semantic matches
   * @returns Analyzed matches with scores
   */
  private async analyzeMatches(
    requisition: RequisitionEmbedding,
    candidates: CandidateSemanticMatch[]
  ): Promise<CandidateMatch[]> {
    const matches: CandidateMatch[] = [];

    for (const candidate of candidates) {
      try {
        const prompt = `Analyze candidate-job match and provide detailed scoring.

JOB REQUISITION:
Description: ${requisition.description}
Required Skills: ${requisition.requiredSkills.join(', ')}
Nice-to-Have Skills: ${requisition.niceToHaveSkills?.join(', ') || 'None'}
Experience Level: ${requisition.experienceLevel}

CANDIDATE:
Resume: ${candidate.resume_text}
Skills: ${candidate.skills.join(', ')}
Experience Level: ${candidate.experience_level}
Availability: ${candidate.availability}

Rate this match (0-100) based on:
1. Skills Match (40% weight): How many required/nice-to-have skills does candidate have?
2. Experience Level (30% weight): Does experience level align with job?
3. Project Relevance (20% weight): Are candidate's projects relevant to job?
4. Availability (10% weight): How soon can candidate start?

Respond with valid JSON:
{
  "overallScore": 85,
  "skillsScore": 90,
  "experienceScore": 85,
  "projectScore": 80,
  "availabilityScore": 75,
  "reasoning": "Candidate has strong Guidewire skills...",
  "skillsMatched": ["PolicyCenter", "Gosu", "GWCP"],
  "skillsMissing": ["BillingCenter"]
}`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert technical recruiter specializing in Guidewire insurance software.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
          response_format: { type: 'json_object' },
        });

        const analysis = JSON.parse(response.choices[0].message.content || '{}');

        matches.push({
          candidateId: candidate.candidate_id,
          matchScore: analysis.overallScore || 0,
          reasoning: analysis.reasoning || 'No reasoning provided',
          skills: {
            matched: analysis.skillsMatched || [],
            missing: analysis.skillsMissing || [],
          },
          experienceLevel: candidate.experience_level,
          availability: candidate.availability,
          similarity: candidate.similarity,
          breakdown: {
            skillsScore: analysis.skillsScore || 0,
            experienceScore: analysis.experienceScore || 0,
            projectScore: analysis.projectScore || 0,
            availabilityScore: analysis.availabilityScore || 0,
          },
        });
      } catch (error) {
        console.warn(
          `[ResumeMatchingService] Failed to analyze candidate ${candidate.candidate_id}:`,
          error
        );
        // Continue with remaining candidates
      }
    }

    // Sort by match score descending
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Store match history in database
   *
   * Used for:
   * - Recruiter feedback collection
   * - Accuracy tracking
   * - Pipeline analytics
   */
  private async storeMatches(
    requisitionId: string,
    matches: CandidateMatch[]
  ): Promise<void> {
    try {
      const records = matches.map((match) => ({
        org_id: this.config.orgId,
        requisition_id: requisitionId,
        candidate_id: match.candidateId,
        match_score: match.matchScore,
        reasoning: match.reasoning,
        skills_matched: match.skills.matched,
        skills_missing: match.skills.missing,
        skills_score: match.breakdown?.skillsScore || 0,
        experience_score: match.breakdown?.experienceScore || 0,
        project_score: match.breakdown?.projectScore || 0,
        availability_score: match.breakdown?.availabilityScore || 0,
        model_used: 'gpt-4o-mini',
        search_latency_ms: 0, // TODO: Track actual latency
      }));

      const { error } = await supabase.from('resume_matches').insert(records);

      if (error) {
        console.error('[ResumeMatchingService] Failed to store matches:', error);
      }
    } catch (error) {
      console.error('[ResumeMatchingService] storeMatches error:', error);
    }
  }

  /**
   * Calculate cost for AI operations
   *
   * GPT-4o-mini pricing:
   * - Input: $0.15/1M tokens
   * - Output: $0.60/1M tokens
   *
   * Average ~500 tokens per match analysis
   */
  private calculateCost(tokensUsed: number): number {
    // Assume 60% input, 40% output
    const inputTokens = tokensUsed * 0.6;
    const outputTokens = tokensUsed * 0.4;

    const inputCost = (inputTokens / 1_000_000) * 0.15;
    const outputCost = (outputTokens / 1_000_000) * 0.6;

    return inputCost + outputCost;
  }

  /**
   * Get matching accuracy metrics
   *
   * Uses recruiter feedback (is_relevant column) to calculate accuracy.
   * Target: 85%+ accuracy
   *
   * @param startDate - Start date for accuracy calculation
   * @returns Accuracy metrics
   */
  async getAccuracy(startDate?: Date): Promise<MatchingAccuracy> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    try {
      const { data, error } = await supabase.rpc('calculate_matching_accuracy', {
        p_org_id: this.config.orgId,
        p_start_date: start.toISOString(),
      });

      if (error) throw error;

      return data[0] || { accuracy: 0, total_matches: 0, relevant_matches: 0 };
    } catch (error) {
      console.error('[ResumeMatchingService] getAccuracy error:', error);
      return { accuracy: 0, total_matches: 0, relevant_matches: 0 };
    }
  }
}
