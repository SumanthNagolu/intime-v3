/**
 * Server-side RAG service for Guidewire Academy.
 *
 * Lazy singleton that loads binary embeddings + chunks into memory once,
 * then provides semantic search via cosine similarity against the
 * 66,908-chunk knowledge base.
 *
 * DO NOT import from 'use client' files - this is server-only.
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import OpenAI from 'openai'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RAGChunk {
  id: string
  text: string
  word_count: number
  chunk_index: number
  source_type: string
  source_id: string
  chapter?: string
  chapter_title?: string
  video?: string
  duration?: string
  topics: string[]
  product?: string
  priority: number
}

export interface RAGSearchResult {
  chunk: RAGChunk
  score: number
}

export interface RAGSearchOptions {
  topK?: number
  chapter?: string
  topics?: string[]
  sourceTypes?: string[]
  minScore?: number
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

const DATA_DIR = join(process.cwd(), 'data', 'rag-knowledge-base')
const DIMS = 1536

let instance: RAGService | null = null

export class RAGService {
  private embeddings: Float32Array | null = null
  private chunkIds: string[] = []
  private chunksMap: Map<string, RAGChunk> = new Map()
  private topicIndex: Record<string, string[]> = {}
  private chapterIndex: Record<string, string[]> = {}
  private openai: OpenAI | null = null
  private initialized = false
  private initPromise: Promise<void> | null = null

  static getInstance(): RAGService {
    if (!instance) {
      instance = new RAGService()
    }
    return instance
  }

  /** Lazy init - loads data on first use */
  async ensureInitialized(): Promise<void> {
    if (this.initialized) return
    if (this.initPromise) return this.initPromise

    this.initPromise = this._initialize()
    await this.initPromise
  }

  private async _initialize(): Promise<void> {
    const t0 = Date.now()

    // 1. Load binary embeddings
    const binPath = join(DATA_DIR, 'embeddings.bin')
    const idsPath = join(DATA_DIR, 'embeddings-ids.json')
    const chunksPath = join(DATA_DIR, 'chunks.json')

    if (!existsSync(binPath)) {
      throw new Error(
        `embeddings.bin not found at ${binPath}. Run: python3 scripts/convert-embeddings-to-binary.py`
      )
    }

    console.log('[RAG] Loading binary embeddings...')
    const binBuffer = readFileSync(binPath)
    this.embeddings = new Float32Array(
      binBuffer.buffer,
      binBuffer.byteOffset,
      binBuffer.byteLength / 4
    )
    const numEmbeddings = this.embeddings.length / DIMS
    console.log(`[RAG] Loaded ${numEmbeddings} embeddings (${(binBuffer.byteLength / 1e6).toFixed(0)} MB)`)

    // 2. Load chunk IDs mapping
    if (!existsSync(idsPath)) {
      throw new Error(`embeddings-ids.json not found at ${idsPath}`)
    }
    this.chunkIds = JSON.parse(readFileSync(idsPath, 'utf-8'))

    // 3. Load chunks
    if (!existsSync(chunksPath)) {
      throw new Error(`chunks.json not found at ${chunksPath}`)
    }
    console.log('[RAG] Loading chunks...')
    const chunks: RAGChunk[] = JSON.parse(readFileSync(chunksPath, 'utf-8'))
    for (const chunk of chunks) {
      this.chunksMap.set(chunk.id, chunk)
    }
    console.log(`[RAG] Loaded ${this.chunksMap.size} chunks`)

    // 4. Load indices
    const topicPath = join(DATA_DIR, 'topic-index.json')
    const chapterPath = join(DATA_DIR, 'chapter-index.json')
    if (existsSync(topicPath)) {
      this.topicIndex = JSON.parse(readFileSync(topicPath, 'utf-8'))
    }
    if (existsSync(chapterPath)) {
      this.chapterIndex = JSON.parse(readFileSync(chapterPath, 'utf-8'))
    }

    // 5. Init OpenAI client for embedding queries
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      this.openai = new OpenAI({ apiKey })
    }

    this.initialized = true
    console.log(`[RAG] Initialized in ${Date.now() - t0}ms`)
  }

  /** Embed a query string using OpenAI text-embedding-3-small */
  private async embedQuery(query: string): Promise<Float32Array> {
    if (!this.openai) {
      throw new Error('OPENAI_API_KEY not configured for RAG embeddings')
    }

    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    })

    return new Float32Array(response.data[0].embedding)
  }

  /** Cosine similarity between a query vector and the i-th stored embedding */
  private cosineSimilarity(query: Float32Array, index: number): number {
    if (!this.embeddings) return 0

    const offset = index * DIMS
    let dot = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < DIMS; i++) {
      const a = query[i]
      const b = this.embeddings[offset + i]
      dot += a * b
      normA += a * a
      normB += b * b
    }

    const denom = Math.sqrt(normA) * Math.sqrt(normB)
    return denom === 0 ? 0 : dot / denom
  }

  /**
   * Search the knowledge base for chunks relevant to the query.
   */
  async search(
    query: string,
    options: RAGSearchOptions = {}
  ): Promise<RAGSearchResult[]> {
    await this.ensureInitialized()

    const {
      topK = 10,
      chapter,
      topics,
      sourceTypes,
      minScore = 0.25,
    } = options

    // Embed the query
    const queryVec = await this.embedQuery(query)

    // Determine candidate set - use indices to narrow search if filters provided
    let candidateIndices: number[] | null = null

    if (chapter && this.chapterIndex[chapter]) {
      const chapterIds = new Set(this.chapterIndex[chapter])
      candidateIndices = this.chunkIds
        .map((id, idx) => (chapterIds.has(id) ? idx : -1))
        .filter((idx) => idx >= 0)
    }

    if (topics && topics.length > 0) {
      const topicIds = new Set<string>()
      for (const topic of topics) {
        const ids = this.topicIndex[topic]
        if (ids) ids.forEach((id) => topicIds.add(id))
      }
      if (topicIds.size > 0) {
        const topicIndices = this.chunkIds
          .map((id, idx) => (topicIds.has(id) ? idx : -1))
          .filter((idx) => idx >= 0)

        if (candidateIndices) {
          // Intersect with chapter candidates
          const candidateSet = new Set(candidateIndices)
          candidateIndices = topicIndices.filter((idx) => candidateSet.has(idx))
        } else {
          candidateIndices = topicIndices
        }
      }
    }

    // If we still have no filter, or the filter is too broad, search all
    const searchIndices =
      candidateIndices && candidateIndices.length < 50000
        ? candidateIndices
        : Array.from({ length: this.chunkIds.length }, (_, i) => i)

    // Compute similarities
    const scored: { index: number; score: number }[] = []
    for (const idx of searchIndices) {
      const score = this.cosineSimilarity(queryVec, idx)
      if (score >= minScore) {
        scored.push({ index: idx, score })
      }
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score)

    // Apply source type filter and collect top-K
    const results: RAGSearchResult[] = []
    for (const { index, score } of scored) {
      if (results.length >= topK) break

      const chunkId = this.chunkIds[index]
      const chunk = this.chunksMap.get(chunkId)
      if (!chunk) continue

      if (sourceTypes && sourceTypes.length > 0) {
        if (!sourceTypes.includes(chunk.source_type)) continue
      }

      results.push({ chunk, score })
    }

    return results
  }

  /** Get service status for debugging */
  getStatus(): {
    initialized: boolean
    totalChunks: number
    totalEmbeddings: number
    topics: string[]
    chapters: string[]
  } {
    return {
      initialized: this.initialized,
      totalChunks: this.chunksMap.size,
      totalEmbeddings: this.chunkIds.length,
      topics: Object.keys(this.topicIndex),
      chapters: Object.keys(this.chapterIndex),
    }
  }
}

/** Convenience function for quick searches */
export async function searchRAG(
  query: string,
  options?: RAGSearchOptions
): Promise<RAGSearchResult[]> {
  return RAGService.getInstance().search(query, options)
}
