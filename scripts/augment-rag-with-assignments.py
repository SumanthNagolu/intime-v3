#!/usr/bin/env python3
"""
Augment RAG Knowledge Base with Assignments, Narrations & Knowledge Checks
==========================================================================
Extracts content from:
  1. Assignment PDFs (ch03-ch11) — user stories, step-by-step implementation guides
  2. Lesson narrations — developer-facing explanations from lesson JSONs (not yet indexed)
  3. Knowledge checks — 513 Q&A pairs from slide questions

Then embeds only new chunks and merges them into the existing knowledge base.

Usage:
  python3 scripts/augment-rag-with-assignments.py
  python3 scripts/augment-rag-with-assignments.py --skip-embeddings   # dry run to see chunk counts
  python3 scripts/augment-rag-with-assignments.py --source assignments # only assignments
  python3 scripts/augment-rag-with-assignments.py --source narrations  # only narrations
  python3 scripts/augment-rag-with-assignments.py --source checks      # only knowledge checks
"""

import argparse
import hashlib
import json
import os
import re
import struct
import sys
import time
from datetime import datetime
from pathlib import Path

# =============================================================================
# Configuration
# =============================================================================

BASE_DIR = Path("public/academy/guidewire")
OUTPUT_DIR = Path("data/rag-knowledge-base")
ASSIGNMENTS_DIR = BASE_DIR / "assignments"
CONTENT_DIR = BASE_DIR / "content"
CHECKS_FILE = BASE_DIR / "knowledge-checks.json"

CHUNK_TARGET_WORDS = 400
CHUNK_MAX_WORDS = 600
CHUNK_OVERLAP_WORDS = 50
EMBEDDING_BATCH_SIZE = 500
EMBEDDING_TEXT_LIMIT = 8000
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536

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


# =============================================================================
# Chunking Utilities (identical to build-rag-knowledge-base.py)
# =============================================================================

def make_chunk_id(source: str, text: str) -> str:
    content = f"{source}:{text[:200]}"
    return hashlib.md5(content.encode()).hexdigest()[:12]


def split_into_chunks(text: str, metadata: dict) -> list:
    if not text or not text.strip():
        return []

    words = text.split()
    if len(words) <= CHUNK_MAX_WORDS:
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
        if start <= prev_start:
            start = prev_start + CHUNK_TARGET_WORDS
            if start >= len(words):
                break
        prev_start = start

        end = min(start + CHUNK_TARGET_WORDS, len(words))
        chunk_words = words[start:end]
        chunk_text = " ".join(chunk_words)

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

        next_start = end - CHUNK_OVERLAP_WORDS
        start = max(next_start, start + 1)

    return chunks


def split_by_paragraphs(text: str, metadata: dict) -> list:
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
            chunk_meta = {**metadata, "chunk_index": len(chunks)}
            chunks.extend(split_into_chunks(current_text.strip(), chunk_meta))
            sentences = current_text.strip().split('. ')
            current_text = sentences[-1] + " " if len(sentences) > 1 else ""
            current_words = len(current_text.split())

        current_text += para + "\n\n"
        current_words += para_words

    if current_text.strip():
        chunk_meta = {**metadata, "chunk_index": len(chunks)}
        chunks.extend(split_into_chunks(current_text.strip(), chunk_meta))

    return chunks


# =============================================================================
# Source 1: Assignment PDFs
# =============================================================================

def ingest_assignments() -> list:
    """Extract text from assignment PDFs and chunk them."""
    print("  Loading assignment PDFs...", flush=True)

    try:
        import fitz  # PyMuPDF
    except ImportError:
        print("    ERROR: PyMuPDF not installed. Run: pip install pymupdf", flush=True)
        return []

    if not ASSIGNMENTS_DIR.exists():
        print("    SKIP: assignments directory not found", flush=True)
        return []

    chunks = []
    file_count = 0

    for chapter_dir in sorted(ASSIGNMENTS_DIR.iterdir()):
        if not chapter_dir.is_dir():
            continue

        ch_slug = chapter_dir.name
        ch_meta = CHAPTER_META.get(ch_slug, {})

        # Get only base assignment PDFs (not -questions/-solutions splits to avoid duplication)
        pdf_files = sorted(chapter_dir.glob("*.pdf"))
        base_pdfs = [f for f in pdf_files if "-questions" not in f.stem and "-solutions" not in f.stem]

        for pdf_file in base_pdfs:
            try:
                doc = fitz.open(str(pdf_file))
                pages_text = []

                for page_num in range(len(doc)):
                    page = doc[page_num]
                    text = page.get_text("text").strip()
                    if text and len(text.split()) >= 5:
                        pages_text.append(text)

                doc.close()

                if not pages_text:
                    continue

                full_text = "\n\n".join(pages_text)

                # Clean up common PDF artifacts
                full_text = re.sub(r'\n{3,}', '\n\n', full_text)
                full_text = re.sub(r'[ \t]{2,}', ' ', full_text)

                # Try to detect if this contains questions + solutions
                has_solution = bool(re.search(r'\b(solution|answer key|suggested answer)\b', full_text, re.IGNORECASE))
                assignment_type = "assignment_with_solution" if has_solution else "assignment"

                metadata = {
                    "source_type": "assignment",
                    "source_id": f"assignment:{ch_slug}/{pdf_file.stem}",
                    "chapter": ch_slug,
                    "chapter_title": ch_meta.get("title", ""),
                    "assignment_number": pdf_file.stem.replace("assignment-", "").replace("_", " "),
                    "assignment_type": assignment_type,
                    "topics": ch_meta.get("topics", []) + ["assignment", "hands-on", "implementation"],
                    "product": ch_meta.get("product", ""),
                    "priority": 5,  # Highest — practical implementation experience
                }

                new_chunks = split_by_paragraphs(full_text, metadata)
                chunks.extend(new_chunks)
                file_count += 1

            except Exception as e:
                print(f"    WARN: Failed to read {pdf_file.name}: {e}", flush=True)

    print(f"    {len(chunks)} chunks from {file_count} assignment PDFs", flush=True)
    return chunks


# =============================================================================
# Source 2: Lesson Narrations (developer-facing explanations)
# =============================================================================

def ingest_narrations() -> list:
    """Extract narration fields from lesson JSONs — not currently indexed."""
    print("  Loading lesson narrations...", flush=True)
    chunks = []

    if not CONTENT_DIR.exists():
        print("    SKIP: content directory not found", flush=True)
        return []

    file_count = 0

    for chapter_dir in sorted(CONTENT_DIR.iterdir()):
        if not chapter_dir.is_dir():
            continue

        ch_slug = chapter_dir.name
        ch_meta = CHAPTER_META.get(ch_slug, {})

        for json_file in sorted(chapter_dir.glob("lesson-*.json")):
            data = json.loads(json_file.read_text())
            lesson_title = data.get("title", json_file.stem)
            lesson_num = json_file.stem.replace("lesson-", "")

            # Extract narration from each slide (developer-facing explanation)
            narration_parts = []
            for slide in data.get("slides", []):
                narration = (slide.get("narration") or "").strip()
                slide_title = (slide.get("title") or "").strip()
                slide_type = slide.get("slideType", "content")

                # Skip structural slides
                if slide_type in ("title", "objectives", "review"):
                    continue

                if narration and len(narration.split()) >= 20:
                    header = f"## {slide_title}" if slide_title else ""
                    narration_parts.append(f"{header}\n{narration}" if header else narration)

            if not narration_parts:
                continue

            combined = "\n\n".join(narration_parts)

            metadata = {
                "source_type": "narration",
                "source_id": f"narration:{ch_slug}/lesson-{lesson_num}",
                "chapter": ch_slug,
                "chapter_title": ch_meta.get("title", ""),
                "lesson_number": lesson_num,
                "lesson_title": lesson_title,
                "topics": ch_meta.get("topics", []),
                "product": ch_meta.get("product", ""),
                "priority": 4,  # Developer-facing explanations
            }

            new_chunks = split_by_paragraphs(combined, metadata)
            chunks.extend(new_chunks)
            file_count += 1

    print(f"    {len(chunks)} chunks from {file_count} lesson narrations", flush=True)
    return chunks


# =============================================================================
# Source 3: Knowledge Checks (Q&A from slides)
# =============================================================================

def ingest_knowledge_checks() -> list:
    """Extract knowledge check Q&A pairs."""
    print("  Loading knowledge checks...", flush=True)
    chunks = []

    if not CHECKS_FILE.exists():
        print("    SKIP: knowledge-checks.json not found", flush=True)
        return []

    data = json.loads(CHECKS_FILE.read_text())
    lessons = data.get("lessons", {})

    for lesson_id, questions in lessons.items():
        # Parse chapter from lesson ID (e.g. "ch04-l01" -> "ch04")
        ch_match = re.match(r'(ch\d+)', lesson_id)
        ch_slug = ch_match.group(1) if ch_match else ""
        ch_meta = CHAPTER_META.get(ch_slug, {})

        for q in questions:
            question = (q.get("question") or "").strip()
            answer = (q.get("answer") or "").strip()

            if not question or not answer or len(answer.split()) < 5:
                continue

            text = f"Knowledge Check Question: {question}\n\nAnswer: {answer}"

            metadata = {
                "source_type": "knowledge_check",
                "source_id": f"check:{q.get('id', lesson_id)}",
                "chapter": ch_slug,
                "chapter_title": ch_meta.get("title", ""),
                "lesson_id": lesson_id,
                "topics": ch_meta.get("topics", []) + ["knowledge-check"],
                "product": ch_meta.get("product", ""),
                "priority": 4,
            }

            chunks.append({
                "id": make_chunk_id("check", text),
                "text": text,
                "word_count": len(text.split()),
                **metadata,
            })

    print(f"    {len(chunks)} chunks from knowledge checks", flush=True)
    return chunks


# =============================================================================
# Deduplication
# =============================================================================

def deduplicate_chunks(new_chunks: list, existing_ids: set) -> list:
    """Remove duplicates against existing KB and within new chunks."""
    seen = set(existing_ids)
    unique = []

    for chunk in new_chunks:
        # Check by chunk ID
        if chunk["id"] in seen:
            continue

        # Check by content hash
        normalized = re.sub(r'\s+', ' ', chunk["text"].lower().strip())
        text_hash = hashlib.md5(normalized[:500].encode()).hexdigest()

        if text_hash not in seen:
            seen.add(chunk["id"])
            seen.add(text_hash)
            unique.append(chunk)

    removed = len(new_chunks) - len(unique)
    if removed > 0:
        print(f"  Deduplicated: removed {removed} duplicates (vs existing KB + internal)", flush=True)

    return unique


# =============================================================================
# Embedding Generation
# =============================================================================

def embed_batch(client, texts: list) -> list:
    try:
        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=texts,
        )
        return [e.embedding for e in response.data]
    except Exception as e:
        error_msg = str(e)
        if "max_tokens_per_request" in error_msg and len(texts) > 50:
            mid = len(texts) // 2
            left = embed_batch(client, texts[:mid])
            right = embed_batch(client, texts[mid:])
            if left is not None and right is not None:
                return left + right
        raise


def generate_embeddings(chunks: list, api_key: str) -> list:
    from openai import OpenAI

    client = OpenAI(api_key=api_key)
    total = len(chunks)

    print(f"  Generating embeddings for {total} new chunks...", flush=True)
    start_time = time.time()

    for i in range(0, total, EMBEDDING_BATCH_SIZE):
        batch = chunks[i:i + EMBEDDING_BATCH_SIZE]
        texts = [c["text"][:EMBEDDING_TEXT_LIMIT] for c in batch]

        try:
            embeddings = embed_batch(client, texts)
            for j, embedding in enumerate(embeddings):
                chunks[i + j]["embedding"] = embedding
        except Exception as e:
            print(f"\n  Batch failed: {e}", flush=True)
            for j in range(len(batch)):
                if "embedding" not in chunks[i + j]:
                    chunks[i + j]["embedding"] = None
            time.sleep(5)

        done = min(i + EMBEDDING_BATCH_SIZE, total)
        elapsed = time.time() - start_time
        rate = done / elapsed if elapsed > 0 else 0
        eta = (total - done) / rate if rate > 0 else 0
        sys.stdout.write(f"\r  [{done}/{total}] {rate:.0f} chunks/s, ETA: {eta:.0f}s    ")
        sys.stdout.flush()

    elapsed = time.time() - start_time
    embedded = sum(1 for c in chunks if c.get("embedding") is not None)
    print(f"\n  Done: {embedded}/{total} embedded in {elapsed:.1f}s", flush=True)

    return chunks


# =============================================================================
# Merge with Existing Knowledge Base
# =============================================================================

def merge_into_knowledge_base(new_chunks: list):
    """Merge new embedded chunks into the existing knowledge base."""

    # 1. Load existing chunks
    chunks_file = OUTPUT_DIR / "chunks.json"
    existing_chunks = json.loads(chunks_file.read_text()) if chunks_file.exists() else []
    print(f"  Existing KB: {len(existing_chunks)} chunks", flush=True)

    # 2. Load existing embeddings
    embeddings_file = OUTPUT_DIR / "embeddings.json"
    existing_embeddings = json.loads(embeddings_file.read_text()) if embeddings_file.exists() else []
    print(f"  Existing embeddings: {len(existing_embeddings)}", flush=True)

    # 3. Add new chunks (without embeddings) to chunks.json
    new_chunks_clean = []
    new_embeddings = []
    for chunk in new_chunks:
        embedding = chunk.pop("embedding", None)
        new_chunks_clean.append(chunk)
        if embedding is not None:
            new_embeddings.append({"id": chunk["id"], "embedding": embedding})

    merged_chunks = existing_chunks + new_chunks_clean
    merged_embeddings = existing_embeddings + new_embeddings

    print(f"  Merged KB: {len(merged_chunks)} chunks (+{len(new_chunks_clean)} new)", flush=True)
    print(f"  Merged embeddings: {len(merged_embeddings)} (+{len(new_embeddings)} new)", flush=True)

    # 4. Save updated chunks
    chunks_file.write_text(json.dumps(merged_chunks, indent=1, ensure_ascii=False))
    print(f"  Saved chunks.json ({chunks_file.stat().st_size / 1024 / 1024:.1f}MB)", flush=True)

    # 5. Save updated embeddings
    embeddings_file.write_text(json.dumps(merged_embeddings, ensure_ascii=False))
    print(f"  Saved embeddings.json ({embeddings_file.stat().st_size / 1024 / 1024:.1f}MB)", flush=True)

    # 6. Rebuild indices
    print("  Rebuilding indices...", flush=True)

    topic_index = {}
    chapter_index = {}
    source_index = {}

    for chunk in merged_chunks:
        for topic in chunk.get("topics", []):
            topic_index.setdefault(topic, []).append(chunk["id"])

        ch = chunk.get("chapter", "")
        if ch:
            chapter_index.setdefault(ch, []).append(chunk["id"])

        st = chunk.get("source_type", "unknown")
        source_index[st] = source_index.get(st, 0) + 1

    (OUTPUT_DIR / "topic-index.json").write_text(json.dumps(topic_index, ensure_ascii=False))
    (OUTPUT_DIR / "chapter-index.json").write_text(json.dumps(chapter_index, ensure_ascii=False))

    index = {
        "version": 2,
        "title": "Guidewire Unified RAG Knowledge Base",
        "description": "Comprehensive knowledge base — videos, guides, slides, PPTs, interview prep, assignments, narrations, knowledge checks",
        "generated_at": datetime.now().isoformat(),
        "stats": {
            "total_chunks": len(merged_chunks),
            "total_words": sum(c.get("word_count", 0) for c in merged_chunks),
            "embedded_chunks": len(merged_embeddings),
        },
        "embedding_model": EMBEDDING_MODEL,
        "embedding_dimensions": EMBEDDING_DIMENSIONS,
        "source_types": source_index,
        "topic_index": {k: len(v) for k, v in topic_index.items()},
        "chapter_index": {k: len(v) for k, v in chapter_index.items()},
    }

    (OUTPUT_DIR / "index.json").write_text(json.dumps(index, indent=2, ensure_ascii=False))
    print("  Saved index.json, topic-index.json, chapter-index.json", flush=True)

    return len(merged_embeddings)


def rebuild_binary_embeddings():
    """Convert embeddings.json to binary format for fast loading."""
    print("  Converting embeddings to binary format...", flush=True)

    embeddings_file = OUTPUT_DIR / "embeddings.json"
    if not embeddings_file.exists():
        print("    SKIP: embeddings.json not found", flush=True)
        return

    data = json.loads(embeddings_file.read_text())
    total = len(data)

    ids = []
    bin_path = OUTPUT_DIR / "embeddings.bin"

    with open(bin_path, "wb") as f:
        for item in data:
            ids.append(item["id"])
            vec = item["embedding"]
            # Pad or truncate to DIMS
            if len(vec) < EMBEDDING_DIMENSIONS:
                vec = vec + [0.0] * (EMBEDDING_DIMENSIONS - len(vec))
            elif len(vec) > EMBEDDING_DIMENSIONS:
                vec = vec[:EMBEDDING_DIMENSIONS]
            f.write(struct.pack(f'{EMBEDDING_DIMENSIONS}f', *vec))

    ids_path = OUTPUT_DIR / "embeddings-ids.json"
    ids_path.write_text(json.dumps(ids, ensure_ascii=False))

    bin_size = bin_path.stat().st_size / 1024 / 1024
    print(f"  Saved embeddings.bin ({bin_size:.0f}MB) + embeddings-ids.json ({total} entries)", flush=True)


# =============================================================================
# Main
# =============================================================================

def main():
    parser = argparse.ArgumentParser(description="Augment RAG KB with assignments, narrations & knowledge checks")
    parser.add_argument("--skip-embeddings", action="store_true", help="Skip embedding generation (dry run)")
    parser.add_argument("--source", choices=["assignments", "narrations", "checks", "all"],
                        default="all", help="Process specific source only")
    args = parser.parse_args()

    print("=" * 70, flush=True)
    print("AUGMENT RAG KNOWLEDGE BASE", flush=True)
    print("=" * 70, flush=True)
    print(flush=True)

    # Load existing chunk IDs for dedup
    chunks_file = OUTPUT_DIR / "chunks.json"
    existing_ids = set()
    if chunks_file.exists():
        existing = json.loads(chunks_file.read_text())
        existing_ids = {c["id"] for c in existing}
        print(f"Existing knowledge base: {len(existing_ids)} chunks", flush=True)
    print(flush=True)

    # Phase 1: Ingest new sources
    print("Phase 1: Ingesting new sources...", flush=True)
    all_new_chunks = []

    sources = {
        "assignments": ingest_assignments,
        "narrations": ingest_narrations,
        "checks": ingest_knowledge_checks,
    }

    if args.source != "all":
        sources = {args.source: sources[args.source]}

    source_stats = {}
    for name, ingestor in sources.items():
        chunks = ingestor()
        source_stats[name] = len(chunks)
        all_new_chunks.extend(chunks)

    print(f"\n  Total new raw chunks: {len(all_new_chunks)}", flush=True)
    print(flush=True)

    # Phase 2: Deduplicate against existing KB
    print("Phase 2: Deduplication...", flush=True)
    all_new_chunks = deduplicate_chunks(all_new_chunks, existing_ids)
    print(f"  Final new chunks to add: {len(all_new_chunks)}", flush=True)
    print(flush=True)

    if not all_new_chunks:
        print("No new chunks to add. Done!", flush=True)
        return

    # Phase 3: Generate embeddings
    if not args.skip_embeddings:
        print("Phase 3: Generating embeddings...", flush=True)
        api_key = os.environ.get("OPENAI_API_KEY")

        if not api_key:
            env_file = Path(".env.local")
            if env_file.exists():
                for line in env_file.read_text().splitlines():
                    line = line.strip()
                    if line.startswith("OPENAI_API_KEY="):
                        api_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                        break

        if not api_key:
            print("  ERROR: No OpenAI API key found. Set OPENAI_API_KEY or add to .env.local", flush=True)
            print("  Run with --skip-embeddings to see chunk counts without embedding.", flush=True)
            sys.exit(1)

        all_new_chunks = generate_embeddings(all_new_chunks, api_key)
        print(flush=True)
    else:
        print("Phase 3: SKIPPED (--skip-embeddings)", flush=True)
        print(flush=True)

    if args.skip_embeddings:
        # Dry run — don't save anything to disk
        print("Phase 4: SKIPPED (dry run — no changes saved to disk)", flush=True)
        print("Phase 5: SKIPPED", flush=True)
        print(flush=True)
        total_embeddings = 0
    else:
        # Phase 4: Merge into existing KB
        print("Phase 4: Merging into knowledge base...", flush=True)
        total_embeddings = merge_into_knowledge_base(all_new_chunks)
        print(flush=True)

        # Phase 5: Rebuild binary index
        print("Phase 5: Rebuilding binary index...", flush=True)
        rebuild_binary_embeddings()
        print(flush=True)

    # Final report
    print("=" * 70, flush=True)
    print("AUGMENTATION COMPLETE", flush=True)
    print("=" * 70, flush=True)
    print(f"  New chunks added: {len(all_new_chunks)}", flush=True)
    print(f"  Breakdown:", flush=True)
    for src, count in source_stats.items():
        print(f"    {src:15s}: {count:5d} raw chunks ingested", flush=True)
    print(flush=True)
    print(f"  Total KB size: {total_embeddings} embedded chunks", flush=True)
    print(flush=True)
    print("  IMPORTANT: Restart your dev server to pick up the new knowledge base!", flush=True)


if __name__ == "__main__":
    main()
