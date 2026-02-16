#!/usr/bin/env python3
"""
Guidewire Unified RAG Knowledge Base Builder
=============================================
Ingests ALL extracted content sources into a single, unified, embedded knowledge base
optimized for semantic retrieval in the Guidewire Guru chatbot.

Sources:
  1. Video transcriptions (276 videos, ~157K words)
  2. PDF guide extractions (35 PDFs, ~6.15M words)
  3. Slide image OCR (3,145 slides, ~140K words)
  4. PPT content JSON (10 chapters, existing extracts)
  5. Interview prep Q&A (1,015 pairs)

Pipeline:
  1. Load & normalize all sources
  2. Smart-chunk with overlap (512 tokens target, 64 token overlap)
  3. Enrich chunks with metadata (source, chapter, topic, type)
  4. Generate embeddings via Gemini text-embedding-004 (768 dims)
  5. Save as indexed JSON for retrieval

Usage:
  python3 scripts/build-rag-knowledge-base.py
  python3 scripts/build-rag-knowledge-base.py --skip-embeddings
  python3 scripts/build-rag-knowledge-base.py --source videos
  python3 scripts/build-rag-knowledge-base.py --source guides
"""

import argparse
import hashlib
import json
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path

# =============================================================================
# Configuration
# =============================================================================

BASE_DIR = Path("public/academy/guidewire")
OUTPUT_DIR = Path("data/rag-knowledge-base")

# Source directories
TRANSCRIPTS_DIR = BASE_DIR / "transcripts"
GUIDE_EXTRACTS_DIR = BASE_DIR / "guide-extracts"
SLIDE_OCR_DIR = BASE_DIR / "slide-ocr"
PPT_CONTENT_DIR = BASE_DIR / "content"

# Chunking config
CHUNK_TARGET_WORDS = 400       # ~512 tokens
CHUNK_MAX_WORDS = 600          # Hard limit
CHUNK_OVERLAP_WORDS = 50       # Overlap between chunks
EMBEDDING_BATCH_SIZE = 500     # Adaptive batching handles token limits
EMBEDDING_TEXT_LIMIT = 8000    # Max chars per embedding input (text-embedding-3-small supports 8191 tokens)
EMBEDDING_MODEL = "text-embedding-3-small"  # 1536 dims, fast & cheap
EMBEDDING_DIMENSIONS = 1536

# Chapter metadata for tagging
CHAPTER_META = {
    "ch01": {"title": "Guidewire Cloud Overview", "topics": ["cloud", "architecture", "deployment"], "product": "platform"},
    "ch02": {"title": "Surepath Overview", "topics": ["surepath", "studio", "development"], "product": "platform"},
    "ch03": {"title": "Implementation Tools", "topics": ["methodology", "story-cards", "planning"], "product": "platform"},
    "ch04": {"title": "PolicyCenter Introduction", "topics": ["policycenter", "policy", "accounts", "underwriting", "product-model"], "product": "policycenter"},
    "ch05": {"title": "ClaimCenter Introduction", "topics": ["claimcenter", "claims", "fnol", "financials", "exposures"], "product": "claimcenter"},
    "ch06": {"title": "BillingCenter Introduction", "topics": ["billingcenter", "billing", "invoicing", "payments"], "product": "billingcenter"},
    "ch07": {"title": "Developer Fundamentals", "topics": ["gosu", "data-model", "pcf", "entities", "typelists"], "product": "platform"},
    "ch08": {"title": "Product Model Configuration", "topics": ["product-model", "coverages", "clauses", "rating"], "product": "policycenter"},
    "ch09": {"title": "ClaimCenter Configuration", "topics": ["claimcenter", "configuration", "rules", "workflows"], "product": "claimcenter"},
    "ch10": {"title": "BillingCenter Configuration", "topics": ["billingcenter", "configuration"], "product": "billingcenter"},
    "ch11": {"title": "Integration", "topics": ["integration", "rest-api", "messaging", "plugins", "cloud-api"], "product": "platform"},
    "ch12": {"title": "Advanced Product Designer", "topics": ["apd", "product-designer", "product-model"], "product": "policycenter"},
    "ch13": {"title": "Rating Introduction", "topics": ["rating", "rate-routines", "rate-tables", "premium"], "product": "policycenter"},
    "ch14": {"title": "Rating Configuration", "topics": ["rating", "configuration", "rate-books"], "product": "policycenter"},
}

# Guide category to topics mapping
GUIDE_TOPICS = {
    "PolicyCenter": ["policycenter", "policy", "accounts", "underwriting"],
    "ClaimCenter": ["claimcenter", "claims", "fnol", "financials"],
    "BillingCenter": ["billingcenter", "billing", "invoicing", "payments"],
    "Integration": ["integration", "rest-api", "cloud-api", "messaging", "webhooks"],
    "Customization": ["gosu", "configuration", "data-model", "rules", "pcf"],
    "General": ["guidewire", "platform"],
}


# =============================================================================
# Chunking Utilities
# =============================================================================

def make_chunk_id(source: str, text: str) -> str:
    """Generate deterministic chunk ID."""
    content = f"{source}:{text[:200]}"
    return hashlib.md5(content.encode()).hexdigest()[:12]


def split_into_chunks(text: str, metadata: dict) -> list:
    """Split text into overlapping chunks with metadata."""
    if not text or not text.strip():
        return []

    words = text.split()
    if len(words) <= CHUNK_MAX_WORDS:
        # Remove chunk_index from metadata to avoid conflicts
        clean_meta = {k: v for k, v in metadata.items() if k != "chunk_index"}
        return [{
            "id": make_chunk_id(metadata.get("source_id", ""), text),
            "text": text.strip(),
            "word_count": len(words),
            "chunk_index": 0,
            **clean_meta,
        }]

    chunks = []
    start = 0
    prev_start = -1

    while start < len(words):
        # Infinite loop guard: start must always advance
        if start <= prev_start:
            start = prev_start + CHUNK_TARGET_WORDS
            if start >= len(words):
                break
        prev_start = start

        end = min(start + CHUNK_TARGET_WORDS, len(words))

        # Try to break at sentence boundary
        chunk_words = words[start:end]
        chunk_text = " ".join(chunk_words)

        # Look for sentence boundary near the end
        if end < len(words):
            last_period = chunk_text.rfind('. ')
            if last_period > len(chunk_text) * 0.6:
                chunk_text = chunk_text[:last_period + 1]
                actual_words = len(chunk_text.split())
                if actual_words > CHUNK_OVERLAP_WORDS:
                    end = start + actual_words

        clean_meta = {k: v for k, v in metadata.items() if k != "chunk_index"}
        chunk_data = {
            "id": make_chunk_id(metadata.get("source_id", ""), chunk_text),
            "text": chunk_text.strip(),
            "word_count": len(chunk_text.split()),
            "chunk_index": len(chunks),
            **clean_meta,
        }
        chunks.append(chunk_data)

        # Move forward with overlap
        next_start = end - CHUNK_OVERLAP_WORDS
        # Ensure we always advance past the current start
        start = max(next_start, start + 1)

    return chunks


def split_by_paragraphs(text: str, metadata: dict) -> list:
    """Split by paragraphs first, then chunk large paragraphs."""
    paragraphs = re.split(r'\n\s*\n', text)
    chunks = []
    current_text = ""
    current_words = 0

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        para_words = len(para.split())

        if current_words + para_words > CHUNK_TARGET_WORDS and current_text:
            # Flush current chunk
            chunk_meta = {**metadata, "chunk_index": len(chunks)}
            chunks.extend(split_into_chunks(current_text.strip(), chunk_meta))
            # Overlap: keep last sentence
            sentences = current_text.strip().split('. ')
            current_text = sentences[-1] + " " if len(sentences) > 1 else ""
            current_words = len(current_text.split())

        current_text += para + "\n\n"
        current_words += para_words

    # Flush remaining
    if current_text.strip():
        chunk_meta = {**metadata, "chunk_index": len(chunks)}
        chunks.extend(split_into_chunks(current_text.strip(), chunk_meta))

    return chunks


# =============================================================================
# Source Ingestors
# =============================================================================

def ingest_video_transcripts() -> list:
    """Ingest all video transcription JSONs."""
    print("  Loading video transcriptions...", flush=True)
    chunks = []

    if not TRANSCRIPTS_DIR.exists():
        print("    SKIP: transcripts directory not found", flush=True)
        return chunks

    file_count = 0
    for chapter_dir in sorted(TRANSCRIPTS_DIR.iterdir()):
        if not chapter_dir.is_dir():
            continue
        ch_slug = chapter_dir.name
        ch_meta = CHAPTER_META.get(ch_slug, {})

        for json_file in sorted(chapter_dir.glob("*.json")):
            if json_file.name.startswith("_"):
                continue

            data = json.loads(json_file.read_text())
            full_text = data.get("full_text", "")
            if not full_text.strip():
                continue

            video_stem = data.get("metadata", {}).get("video_stem", json_file.stem)
            duration = data.get("metadata", {}).get("duration_formatted", "")

            metadata = {
                "source_type": "video_transcript",
                "source_id": f"video:{ch_slug}/{video_stem}",
                "chapter": ch_slug,
                "chapter_title": ch_meta.get("title", ""),
                "video": video_stem,
                "duration": duration,
                "topics": ch_meta.get("topics", []),
                "product": ch_meta.get("product", ""),
                "priority": 3,  # Training content = high relevance
            }

            chunks.extend(split_by_paragraphs(full_text, metadata))
            file_count += 1

    print(f"    {len(chunks)} chunks from {file_count} video transcripts", flush=True)
    return chunks


def ingest_guide_extracts() -> list:
    """Ingest all PDF guide extraction JSONs."""
    print("  Loading PDF guide extractions...", flush=True)
    chunks = []

    if not GUIDE_EXTRACTS_DIR.exists():
        print("    SKIP: guide-extracts directory not found", flush=True)
        return chunks

    json_files = sorted(GUIDE_EXTRACTS_DIR.rglob("*.json"))
    json_files = [f for f in json_files if not f.name.startswith("_")]
    print(f"    Processing {len(json_files)} guide files...", flush=True)

    for idx, json_file in enumerate(json_files):
        file_size_mb = json_file.stat().st_size / 1024 / 1024
        data = json.loads(json_file.read_text())
        meta = data.get("metadata", {})
        category = meta.get("category", "General")
        filename = meta.get("filename", json_file.stem)
        before = len(chunks)

        # Prefer sections over raw pages for better chunking
        sections = data.get("sections", [])
        if sections:
            for section in sections:
                section_text = section.get("text", "")
                if not section_text.strip() or len(section_text.split()) < 20:
                    continue

                metadata = {
                    "source_type": "official_guide",
                    "source_id": f"guide:{filename}:{section.get('title', '')}",
                    "guide_name": filename,
                    "guide_category": category,
                    "section_title": section.get("title", ""),
                    "section_level": section.get("level", 1),
                    "page_range": f"{section.get('start_page', '')}-{section.get('end_page', '')}",
                    "topics": GUIDE_TOPICS.get(category, ["guidewire"]),
                    "product": category.lower() if category in ["PolicyCenter", "ClaimCenter", "BillingCenter"] else "platform",
                    "priority": 5,  # Official docs = highest relevance
                }

                chunks.extend(split_by_paragraphs(section_text, metadata))
        else:
            # Fall back to page-based chunking for books without TOC
            pages = data.get("pages", [])
            for page in pages:
                page_text = page.get("text", "")
                if not page_text.strip() or len(page_text.split()) < 20:
                    continue

                metadata = {
                    "source_type": "official_guide",
                    "source_id": f"guide:{filename}:page-{page.get('page', 0)}",
                    "guide_name": filename,
                    "guide_category": category,
                    "page": page.get("page", 0),
                    "topics": GUIDE_TOPICS.get(category, ["guidewire"]),
                    "product": category.lower() if category in ["PolicyCenter", "ClaimCenter", "BillingCenter"] else "platform",
                    "priority": 5,
                }

                chunks.extend(split_by_paragraphs(page_text, metadata))

        new_chunks = len(chunks) - before
        print(f"    [{idx+1}/{len(json_files)}] {filename}: {new_chunks} chunks ({file_size_mb:.1f}MB)", flush=True)

        # Free memory for large files
        del data

    print(f"    {len(chunks)} chunks from PDF guides", flush=True)
    return chunks


def ingest_slide_ocr() -> list:
    """Ingest all slide image OCR JSONs."""
    print("  Loading slide image OCR...", flush=True)
    chunks = []

    if not SLIDE_OCR_DIR.exists():
        print("    SKIP: slide-ocr directory not found", flush=True)
        return chunks

    for chapter_dir in sorted(SLIDE_OCR_DIR.iterdir()):
        if not chapter_dir.is_dir():
            continue
        ch_slug = chapter_dir.name
        ch_meta = CHAPTER_META.get(ch_slug, {})

        for json_file in sorted(chapter_dir.glob("*.json")):
            if json_file.name.startswith("_"):
                continue

            data = json.loads(json_file.read_text())
            lesson_name = data.get("metadata", {}).get("lesson", json_file.stem)

            slide_texts = []
            for slide in data.get("slides", []):
                text = slide.get("text", "").strip()
                if text and len(text.split()) >= 5:
                    slide_texts.append(text)

            if not slide_texts:
                continue

            combined = "\n\n".join(slide_texts)

            metadata = {
                "source_type": "slide_ocr",
                "source_id": f"slide:{ch_slug}/{lesson_name}",
                "chapter": ch_slug,
                "chapter_title": ch_meta.get("title", ""),
                "lesson": lesson_name,
                "topics": ch_meta.get("topics", []),
                "product": ch_meta.get("product", ""),
                "priority": 2,
            }

            chunks.extend(split_by_paragraphs(combined, metadata))

    print(f"    {len(chunks)} chunks from slide OCR", flush=True)
    return chunks


def ingest_ppt_content() -> list:
    """Ingest existing PPT content JSON extracts."""
    print("  Loading PPT content JSON...", flush=True)
    chunks = []

    if not PPT_CONTENT_DIR.exists():
        print("    SKIP: content directory not found", flush=True)
        return chunks

    for chapter_dir in sorted(PPT_CONTENT_DIR.iterdir()):
        if not chapter_dir.is_dir():
            continue
        ch_slug = chapter_dir.name
        ch_meta = CHAPTER_META.get(ch_slug, {})

        for json_file in sorted(chapter_dir.glob("lesson-*.json")):
            data = json.loads(json_file.read_text())

            # Extract notes from slides
            notes_parts = []
            for slide in data.get("slides", []):
                notes = slide.get("notes", "").strip()
                title = slide.get("title", "").strip()
                if notes:
                    notes_parts.append(f"{title}\n{notes}" if title else notes)
                elif title and slide.get("content"):
                    content = slide["content"]
                    if isinstance(content, list):
                        content = "\n".join(str(c) for c in content)
                    if isinstance(content, str) and content.strip():
                        notes_parts.append(f"{title}\n{content}")

            if not notes_parts:
                continue

            combined = "\n\n".join(notes_parts)
            lesson_num = json_file.stem.replace("lesson-", "")

            metadata = {
                "source_type": "ppt_content",
                "source_id": f"ppt:{ch_slug}/lesson-{lesson_num}",
                "chapter": ch_slug,
                "chapter_title": ch_meta.get("title", ""),
                "lesson_number": lesson_num,
                "topics": ch_meta.get("topics", []),
                "product": ch_meta.get("product", ""),
                "priority": 4,  # Training slides = high relevance
            }

            chunks.extend(split_by_paragraphs(combined, metadata))

    print(f"    {len(chunks)} chunks from PPT content", flush=True)
    return chunks


def ingest_interview_prep() -> list:
    """Ingest interview prep Q&A pairs."""
    print("  Loading interview prep Q&A...", flush=True)
    chunks = []

    interview_file = PPT_CONTENT_DIR / "interview-prep.json"
    if not interview_file.exists():
        print("    SKIP: interview-prep.json not found", flush=True)
        return chunks

    data = json.loads(interview_file.read_text())

    # Handle the nested documents structure: {documents: [{title, qaPairs: [{question, answer, topic}]}]}
    items = []
    if isinstance(data, dict) and "documents" in data:
        for doc in data["documents"]:
            doc_title = doc.get("title", "")
            for qa in doc.get("qaPairs", []):
                qa["_doc_title"] = doc_title
                items.append(qa)
    elif isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        items = data.get("questions", data.get("items", []))

    for item in items:
        question = item.get("question", item.get("q", "")).strip()
        answer = item.get("answer", item.get("a", "")).strip()
        topic = item.get("topic", item.get("_doc_title", item.get("category", "general")))

        if not question or not answer:
            continue

        # Clean bullet points
        question = re.sub(r'^[∙•·\-\s]+', '', question).strip()
        answer = re.sub(r'^[∙•·\-\s]+', '', answer).strip()

        if len(question) < 5 or len(answer) < 10:
            continue

        text = f"Interview Question: {question}\n\nAnswer: {answer}"

        # Determine product from topic
        product = "platform"
        topics = ["interview-prep"]
        topic_lower = (topic or "").lower()
        if "policy" in topic_lower or "pc" in topic_lower:
            product = "policycenter"
            topics.append("policycenter")
        elif "claim" in topic_lower or "cc" in topic_lower:
            product = "claimcenter"
            topics.append("claimcenter")
        elif "billing" in topic_lower or "bc" in topic_lower:
            product = "billingcenter"
            topics.append("billingcenter")
        elif "gosu" in topic_lower or "data" in topic_lower:
            topics.append("gosu")
        elif "integr" in topic_lower:
            topics.append("integration")

        metadata = {
            "source_type": "interview_prep",
            "source_id": f"interview:{hashlib.md5(question.encode()).hexdigest()[:8]}",
            "topic": topic,
            "topics": topics,
            "product": product,
            "priority": 4,  # Interview prep = high relevance
        }

        chunks.append({
            "id": make_chunk_id("interview", text),
            "text": text,
            "word_count": len(text.split()),
            **metadata,
        })

    print(f"    {len(chunks)} chunks from interview prep", flush=True)
    return chunks


# =============================================================================
# Deduplication
# =============================================================================

def deduplicate_chunks(chunks: list) -> list:
    """Remove near-duplicate chunks based on content hash."""
    seen = set()
    unique = []

    for chunk in chunks:
        # Normalize text for comparison
        normalized = re.sub(r'\s+', ' ', chunk["text"].lower().strip())
        text_hash = hashlib.md5(normalized[:500].encode()).hexdigest()

        if text_hash not in seen:
            seen.add(text_hash)
            unique.append(chunk)

    removed = len(chunks) - len(unique)
    if removed > 0:
        print(f"  Deduplicated: removed {removed} near-duplicates")

    return unique


# =============================================================================
# Embedding Generation
# =============================================================================

def embed_batch(client, texts: list) -> list:
    """Embed a batch of texts, splitting into sub-batches if too large."""
    try:
        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=texts,
        )
        return [e.embedding for e in response.data]
    except Exception as e:
        error_msg = str(e)
        if "max_tokens_per_request" in error_msg and len(texts) > 50:
            # Split in half and retry
            mid = len(texts) // 2
            left = embed_batch(client, texts[:mid])
            right = embed_batch(client, texts[mid:])
            if left is not None and right is not None:
                return left + right
        # If splitting didn't help or non-token error
        raise


def generate_embeddings(chunks: list, api_key: str) -> list:
    """Generate embeddings using OpenAI text-embedding-3-small with adaptive batching."""
    from openai import OpenAI

    client = OpenAI(api_key=api_key)
    total = len(chunks)
    failed = 0

    print(f"  Generating embeddings for {total} chunks...", flush=True)
    print(f"  Model: {EMBEDDING_MODEL} ({EMBEDDING_DIMENSIONS} dimensions)", flush=True)
    print(f"  Batch size: {EMBEDDING_BATCH_SIZE} (adaptive)", flush=True)

    start_time = time.time()

    for i in range(0, total, EMBEDDING_BATCH_SIZE):
        batch = chunks[i:i + EMBEDDING_BATCH_SIZE]
        texts = [c["text"][:EMBEDDING_TEXT_LIMIT] for c in batch]

        try:
            embeddings = embed_batch(client, texts)

            for j, embedding in enumerate(embeddings):
                chunks[i + j]["embedding"] = embedding

        except Exception as e:
            print(f"\n  Batch {i // EMBEDDING_BATCH_SIZE + 1} failed: {e}", flush=True)
            failed += len(batch)
            for j in range(len(batch)):
                if "embedding" not in chunks[i + j]:
                    chunks[i + j]["embedding"] = None

            # Rate limit backoff
            time.sleep(5)

        # Progress
        done = min(i + EMBEDDING_BATCH_SIZE, total)
        elapsed = time.time() - start_time
        rate = done / elapsed if elapsed > 0 else 0
        eta = (total - done) / rate if rate > 0 else 0
        sys.stdout.write(f"\r  [{done}/{total}] {rate:.0f} chunks/s, ETA: {eta:.0f}s    ")
        sys.stdout.flush()

    elapsed = time.time() - start_time
    embedded = sum(1 for c in chunks if c.get("embedding") is not None)
    print(f"\n  Done: {embedded}/{total} embedded in {elapsed:.1f}s ({failed} failed)", flush=True)

    return chunks


# =============================================================================
# Output & Indexing
# =============================================================================

def save_knowledge_base(chunks: list, stats: dict):
    """Save the knowledge base in an optimized format for retrieval."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Split chunks into embeddings and content for efficient loading
    # The retrieval service loads embeddings into memory, content on-demand

    # 1. Embeddings file (compact: id + embedding vector only)
    embeddings_data = []
    for chunk in chunks:
        if chunk.get("embedding"):
            embeddings_data.append({
                "id": chunk["id"],
                "embedding": chunk["embedding"],
            })

    embeddings_file = OUTPUT_DIR / "embeddings.json"
    embeddings_file.write_text(json.dumps(embeddings_data, ensure_ascii=False))
    print(f"  Saved {len(embeddings_data)} embeddings ({embeddings_file.stat().st_size / 1024 / 1024:.1f}MB)")

    # 2. Chunks file (all content + metadata, no embeddings)
    chunks_content = []
    for chunk in chunks:
        chunk_copy = {k: v for k, v in chunk.items() if k != "embedding"}
        chunks_content.append(chunk_copy)

    chunks_file = OUTPUT_DIR / "chunks.json"
    chunks_file.write_text(json.dumps(chunks_content, indent=1, ensure_ascii=False))
    print(f"  Saved {len(chunks_content)} chunks ({chunks_file.stat().st_size / 1024 / 1024:.1f}MB)")

    # 3. Index file (metadata, stats, lookup tables)
    # Build topic index for filtered retrieval
    topic_index = {}
    for chunk in chunks_content:
        for topic in chunk.get("topics", []):
            if topic not in topic_index:
                topic_index[topic] = []
            topic_index[topic].append(chunk["id"])

    # Build source type index
    source_index = {}
    for chunk in chunks_content:
        st = chunk.get("source_type", "unknown")
        if st not in source_index:
            source_index[st] = 0
        source_index[st] += 1

    # Build chapter index
    chapter_index = {}
    for chunk in chunks_content:
        ch = chunk.get("chapter", "")
        if ch:
            if ch not in chapter_index:
                chapter_index[ch] = []
            chapter_index[ch].append(chunk["id"])

    index = {
        "version": 2,
        "title": "Guidewire Unified RAG Knowledge Base",
        "description": "Comprehensive knowledge base from videos, guides, slides, PPTs, and interview prep",
        "generated_at": datetime.now().isoformat(),
        "stats": stats,
        "embedding_model": EMBEDDING_MODEL,
        "embedding_dimensions": EMBEDDING_DIMENSIONS,
        "source_types": source_index,
        "topic_index": {k: len(v) for k, v in topic_index.items()},
        "chapter_index": {k: len(v) for k, v in chapter_index.items()},
    }

    index_file = OUTPUT_DIR / "index.json"
    index_file.write_text(json.dumps(index, indent=2, ensure_ascii=False))
    print(f"  Saved index ({index_file})")

    # 4. Topic lookup file (for filtered search)
    topic_file = OUTPUT_DIR / "topic-index.json"
    topic_file.write_text(json.dumps(topic_index, ensure_ascii=False))

    # 5. Chapter lookup file
    chapter_file = OUTPUT_DIR / "chapter-index.json"
    chapter_file.write_text(json.dumps(chapter_index, ensure_ascii=False))


# =============================================================================
# Main Pipeline
# =============================================================================

def main():
    parser = argparse.ArgumentParser(description="Build unified Guidewire RAG knowledge base")
    parser.add_argument("--skip-embeddings", action="store_true", help="Skip embedding generation")
    parser.add_argument("--source", choices=["videos", "guides", "slides", "ppt", "interview", "all"],
                       default="all", help="Process specific source only")
    args = parser.parse_args()

    print("=" * 70, flush=True)
    print("GUIDEWIRE UNIFIED RAG KNOWLEDGE BASE BUILDER", flush=True)
    print("=" * 70, flush=True)
    print(flush=True)

    # Ingest all sources
    print("Phase 1: Ingesting sources...", flush=True)
    all_chunks = []

    sources_to_run = {
        "videos": ingest_video_transcripts,
        "guides": ingest_guide_extracts,
        "slides": ingest_slide_ocr,
        "ppt": ingest_ppt_content,
        "interview": ingest_interview_prep,
    }

    if args.source != "all":
        sources_to_run = {args.source: sources_to_run[args.source]}

    source_stats = {}
    for name, ingestor in sources_to_run.items():
        chunks = ingestor()
        source_stats[name] = {
            "chunks": len(chunks),
            "words": sum(c.get("word_count", 0) for c in chunks),
        }
        all_chunks.extend(chunks)

    print(f"\n  Total raw chunks: {len(all_chunks)}")
    print(f"  Total words: {sum(c.get('word_count', 0) for c in all_chunks):,}")
    print()

    # Deduplicate
    print("Phase 2: Deduplication...")
    all_chunks = deduplicate_chunks(all_chunks)
    print(f"  Final chunk count: {len(all_chunks)}")
    print()

    # Generate embeddings
    if not args.skip_embeddings:
        print("Phase 3: Generating embeddings (OpenAI text-embedding-3-small)...")
        api_key = os.environ.get("OPENAI_API_KEY")

        if not api_key:
            # Try .env.local
            env_file = Path(".env.local")
            if env_file.exists():
                for line in env_file.read_text().splitlines():
                    line = line.strip()
                    if line.startswith("OPENAI_API_KEY="):
                        api_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                        break

        if not api_key:
            print("  ERROR: No OpenAI API key found. Set OPENAI_API_KEY env var or add to .env.local")
            print("  Run with --skip-embeddings to save chunks without embeddings.")
            sys.exit(1)

        all_chunks = generate_embeddings(all_chunks, api_key)
        print()
    else:
        print("Phase 3: SKIPPED (--skip-embeddings)")
        print()

    # Build stats
    stats = {
        "total_chunks": len(all_chunks),
        "total_words": sum(c.get("word_count", 0) for c in all_chunks),
        "embedded_chunks": sum(1 for c in all_chunks if c.get("embedding")),
        "sources": source_stats,
    }

    # Save
    print("Phase 4: Saving knowledge base...")
    save_knowledge_base(all_chunks, stats)
    print()

    # Final report
    print("=" * 70)
    print("RAG KNOWLEDGE BASE COMPLETE")
    print("=" * 70)
    print(f"  Total chunks: {stats['total_chunks']:,}")
    print(f"  Total words: {stats['total_words']:,}")
    print(f"  Embedded: {stats['embedded_chunks']:,}")
    print(f"  Output: {OUTPUT_DIR}/")
    print()
    print("  Source breakdown:")
    for src, data in source_stats.items():
        print(f"    {src:15s}: {data['chunks']:6,} chunks, {data['words']:10,} words")
    print()
    print("  Files:")
    print(f"    index.json          - Metadata & stats")
    print(f"    chunks.json         - All chunk text + metadata")
    print(f"    embeddings.json     - Embedding vectors (768-dim)")
    print(f"    topic-index.json    - Topic -> chunk ID lookup")
    print(f"    chapter-index.json  - Chapter -> chunk ID lookup")


if __name__ == "__main__":
    main()
