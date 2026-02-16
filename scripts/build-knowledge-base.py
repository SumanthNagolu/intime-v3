#!/usr/bin/env python3
"""
Guidewire Knowledge Base Builder
=================================
Extracts all Guidewire technical PDFs into a chunked, searchable knowledge base.

Pipeline:
  1. Extract text from all PDFs (preserving structure)
  2. Smart-chunk by sections (not arbitrary word counts)
  3. Generate embeddings via Gemini API
  4. Save as searchable JSON index

Usage:
  python3 scripts/build-knowledge-base.py
  python3 scripts/build-knowledge-base.py --skip-embeddings  # Extract only, add embeddings later
  python3 scripts/build-knowledge-base.py --pdf-dir /path/to/pdfs
"""

import os
import sys
import json
import re
import hashlib
import argparse
from pathlib import Path
from typing import Optional

# --- Configuration ---

DEFAULT_PDF_DIR = os.path.expanduser("~/Documents/Guidewire Guides")
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "academy", "guidewire", "knowledge-base")

# Map folders to curriculum chapters for relevance scoring
FOLDER_TO_CHAPTERS = {
    "PC": ["ch04", "ch08", "ch12", "ch13", "ch14"],    # PolicyCenter + Rating + APD
    "CC": ["ch05", "ch09"],                              # ClaimCenter
    "BC": ["ch06", "ch10"],                              # BillingCenter
    "Customization": ["ch07", "ch08", "ch09", "ch10"],   # Dev fundamentals + all config
    "Integ": ["ch11"],                                    # Integration
}

# Categorize each PDF for topic tagging
PDF_TOPICS = {
    "PolicyCenter Guide.pdf": ["policycenter", "accounts", "policies", "underwriting", "product-model"],
    "PC-AppGuide.pdf": ["policycenter", "application", "ui", "screens"],
    "ProductModelGuide.pdf": ["product-model", "coverages", "coverage-terms", "offerings"],
    "ProductDesignerGuide.pdf": ["apd", "product-designer", "product-model"],
    "SubmissionIntake.pdf": ["submission", "intake", "policycenter"],
    "ClaimCenter and ContactManager Guide.pdf": ["claimcenter", "claims", "contacts", "fnol", "financials"],
    "CC-AppGuide.pdf": ["claimcenter", "application", "ui"],
    "ConfigGuide - ClaimCenter.pdf": ["claimcenter", "configuration", "rules", "assignment"],
    "ContactMgmtGuide.pdf": ["contacts", "contact-manager", "address-book"],
    "BillingCenter Guide.pdf": ["billingcenter", "billing", "invoicing", "payments", "delinquency"],
    "BC-AppGuide.pdf": ["billingcenter", "application", "ui"],
    "ConfigGuide - BillingCenter.pdf": ["billingcenter", "configuration", "workflows", "commissions"],
    "Configuration Guide.pdf": ["configuration", "data-model", "pcf", "typelists", "entities"],
    "GosuRefGuide.pdf": ["gosu", "programming", "language-reference", "syntax"],
    "GosuRules.pdf": ["gosu", "rules", "business-rules", "validation"],
    "GlobalizationGuide.pdf": ["globalization", "localization", "i18n"],
    "AppReader.pdf": ["app-reader", "configuration", "tools"],
    "CloudAPI-Developer.pdf": ["cloud-api", "rest", "integration", "developer"],
    "CloudAPI-Consumer.pdf": ["cloud-api", "rest", "consumer", "external"],
    "Integration Guide.pdf": ["integration", "messaging", "plugins", "web-services"],
    "IntegrationGuide.pdf": ["integration", "messaging", "plugins", "web-services"],
    "RESTAPIFramework.pdf": ["rest-api", "swagger", "api-framework"],
    "RESTAPIClientGuide.pdf": ["rest-api", "client", "http"],
    "Webhooks.pdf": ["webhooks", "events", "integration", "cloud"],
    "AppEventsForDevelopers.pdf": ["app-events", "events", "cloud", "integration"],
    "OverviewCloudIntegration.pdf": ["cloud", "integration", "overview", "architecture"],
    "SettingsVault.pdf": ["settings", "vault", "configuration", "secrets"],
    "IntegrationDataManager.pdf": ["integration", "data-manager", "etl"],
    "CloudAPIGuide-ContactManager.pdf": ["cloud-api", "contacts", "contact-manager"],
}

# --- PDF Extraction ---

def extract_pdf_text(pdf_path: str) -> list[dict]:
    """Extract text from PDF, page by page, preserving structure."""
    import PyPDF2

    pages = []
    try:
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            total_pages = len(reader.pages)

            for i, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                if text.strip():
                    pages.append({
                        "page": i + 1,
                        "total_pages": total_pages,
                        "text": text.strip()
                    })
    except Exception as e:
        print(f"  ERROR extracting {pdf_path}: {e}")

    return pages


def detect_sections(text: str) -> list[dict]:
    """Detect section headers and split text into sections."""
    lines = text.split('\n')
    sections = []
    current_section = {"heading": "", "content": []}

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Detect section headers (heuristics for Guidewire doc format)
        is_header = False

        # Pattern: "Chapter X: Title" or "X.Y Title" or "X.Y.Z Title"
        if re.match(r'^(Chapter\s+\d+|Section\s+\d+|\d+\.\d+(\.\d+)?)\s', stripped):
            is_header = True
        # Pattern: ALL CAPS line (common in PDF headers)
        elif stripped.isupper() and len(stripped) > 5 and len(stripped) < 100:
            is_header = True
        # Pattern: Short line that looks like a title (no period at end, mixed case)
        elif (len(stripped) < 80 and
              not stripped.endswith('.') and
              not stripped.endswith(',') and
              stripped[0].isupper() and
              len(stripped.split()) <= 10 and
              not any(c in stripped for c in ['=', '{', '}', '()', '//'])):
            # Could be a section header - check if it's followed by longer content
            is_header = True

        if is_header and current_section["content"]:
            # Save previous section
            sections.append(current_section)
            current_section = {"heading": stripped, "content": []}
        elif is_header and not current_section["content"]:
            # Update heading for empty section
            current_section["heading"] = stripped
        else:
            current_section["content"].append(stripped)

    # Don't forget last section
    if current_section["content"]:
        sections.append(current_section)

    return sections


# --- Smart Chunking ---

def chunk_document(pages: list[dict], source_file: str, max_chunk_words: int = 800) -> list[dict]:
    """
    Smart chunking: break document into semantic chunks.
    - Respects section boundaries
    - Keeps related content together
    - Target ~500-800 words per chunk (fits well in context window)
    """
    chunks = []

    # Combine all pages into sections
    full_text = "\n\n".join(p["text"] for p in pages)
    sections = detect_sections(full_text)

    current_chunk_parts = []
    current_chunk_heading = ""
    current_word_count = 0

    for section in sections:
        section_text = "\n".join(section["content"])
        section_words = len(section_text.split())

        # If this section alone is too big, split it
        if section_words > max_chunk_words:
            # Save any accumulated chunk first
            if current_chunk_parts:
                chunks.append(_make_chunk(
                    current_chunk_heading,
                    "\n\n".join(current_chunk_parts),
                    source_file,
                    len(chunks)
                ))
                current_chunk_parts = []
                current_word_count = 0

            # Split large section into paragraphs
            paragraphs = section_text.split('\n\n')
            if len(paragraphs) <= 1:
                paragraphs = section_text.split('\n')

            para_buffer = []
            para_word_count = 0

            for para in paragraphs:
                para_words = len(para.split())
                if para_word_count + para_words > max_chunk_words and para_buffer:
                    chunks.append(_make_chunk(
                        section["heading"],
                        "\n\n".join(para_buffer),
                        source_file,
                        len(chunks)
                    ))
                    para_buffer = []
                    para_word_count = 0

                para_buffer.append(para)
                para_word_count += para_words

            if para_buffer:
                chunks.append(_make_chunk(
                    section["heading"],
                    "\n\n".join(para_buffer),
                    source_file,
                    len(chunks)
                ))

        # If adding this section would exceed limit, flush
        elif current_word_count + section_words > max_chunk_words and current_chunk_parts:
            chunks.append(_make_chunk(
                current_chunk_heading,
                "\n\n".join(current_chunk_parts),
                source_file,
                len(chunks)
            ))
            current_chunk_parts = [section_text]
            current_chunk_heading = section["heading"]
            current_word_count = section_words

        # Otherwise accumulate
        else:
            if not current_chunk_heading:
                current_chunk_heading = section["heading"]
            current_chunk_parts.append(section_text)
            current_word_count += section_words

    # Flush remaining
    if current_chunk_parts:
        chunks.append(_make_chunk(
            current_chunk_heading,
            "\n\n".join(current_chunk_parts),
            source_file,
            len(chunks)
        ))

    return chunks


def _make_chunk(heading: str, content: str, source_file: str, index: int) -> dict:
    """Create a chunk object with metadata."""
    text = f"{heading}\n\n{content}" if heading else content
    chunk_id = hashlib.md5(f"{source_file}:{index}:{text[:100]}".encode()).hexdigest()[:12]

    return {
        "id": chunk_id,
        "source": source_file,
        "heading": heading,
        "content": content,
        "text": text,  # Full text for embedding
        "word_count": len(text.split()),
        "index": index,
    }


# --- Embedding Generation ---

def generate_embeddings(chunks: list[dict], api_key: str) -> list[dict]:
    """Generate embeddings for all chunks using Gemini embedding API."""
    try:
        from google import genai

        client = genai.Client(api_key=api_key)

        total = len(chunks)
        batch_size = 20  # Gemini supports batch embedding

        for i in range(0, total, batch_size):
            batch = chunks[i:i + batch_size]
            texts = [c["text"][:2000] for c in batch]  # Truncate for embedding

            try:
                result = client.models.embed_content(
                    model="models/text-embedding-004",
                    contents=texts,
                )

                for j, embedding_obj in enumerate(result.embeddings):
                    chunks[i + j]["embedding"] = embedding_obj.values

            except Exception as e:
                print(f"  Embedding batch {i//batch_size + 1} failed: {e}")
                # Mark failed chunks
                for j in range(len(batch)):
                    if "embedding" not in chunks[i + j]:
                        chunks[i + j]["embedding"] = None

            # Progress
            done = min(i + batch_size, total)
            print(f"  Embedded {done}/{total} chunks", end='\r')

        print(f"  Embedded {total}/{total} chunks - DONE")

    except ImportError:
        print("  WARNING: google-genai not available. Install with: pip install google-genai")
        print("  Skipping embeddings. Run with --skip-embeddings and add later.")
        return chunks

    return chunks


# --- Main Pipeline ---

def process_all_pdfs(pdf_dir: str, skip_embeddings: bool = False) -> dict:
    """Process all PDFs in the Guidewire Guides directory."""

    pdf_dir = Path(pdf_dir)
    if not pdf_dir.exists():
        print(f"ERROR: Directory not found: {pdf_dir}")
        sys.exit(1)

    # Find all PDFs
    pdf_files = sorted(pdf_dir.rglob("*.pdf"))
    print(f"Found {len(pdf_files)} PDFs in {pdf_dir}\n")

    all_chunks = []
    doc_index = []

    for pdf_path in pdf_files:
        relative_path = pdf_path.relative_to(pdf_dir)
        filename = pdf_path.name
        folder = str(relative_path.parent) if str(relative_path.parent) != "." else "root"

        print(f"Processing: {relative_path}")

        # Extract text
        pages = extract_pdf_text(str(pdf_path))
        if not pages:
            print(f"  Skipped (no text extracted)")
            continue

        total_words = sum(len(p["text"].split()) for p in pages)
        print(f"  {len(pages)} pages, ~{total_words:,} words")

        # Chunk
        chunks = chunk_document(pages, filename)
        print(f"  {len(chunks)} chunks created")

        # Add metadata
        topics = PDF_TOPICS.get(filename, [])
        chapters = FOLDER_TO_CHAPTERS.get(folder, [])

        for chunk in chunks:
            chunk["folder"] = folder
            chunk["topics"] = topics
            chunk["related_chapters"] = chapters

        all_chunks.extend(chunks)

        # Document index entry
        doc_index.append({
            "filename": filename,
            "folder": folder,
            "pages": len(pages),
            "words": total_words,
            "chunks": len(chunks),
            "topics": topics,
            "related_chapters": chapters,
        })

        print()

    print(f"\nTotal: {len(all_chunks)} chunks from {len(doc_index)} documents")
    print(f"Total words: ~{sum(d['words'] for d in doc_index):,}")

    # Generate embeddings
    if not skip_embeddings:
        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("NEXT_PUBLIC_GEMINI_API_KEY") or os.environ.get("API_KEY")
        if api_key:
            print(f"\nGenerating embeddings...")
            all_chunks = generate_embeddings(all_chunks, api_key)
        else:
            print("\nWARNING: No GEMINI_API_KEY found. Skipping embeddings.")
            print("Set GEMINI_API_KEY env var or run with --skip-embeddings")

    return {
        "version": 1,
        "total_documents": len(doc_index),
        "total_chunks": len(all_chunks),
        "documents": doc_index,
        "chunks": all_chunks,
    }


def save_knowledge_base(kb: dict, output_dir: str):
    """Save knowledge base to JSON files."""
    os.makedirs(output_dir, exist_ok=True)

    # Save document index (small, for UI)
    index_path = os.path.join(output_dir, "index.json")
    with open(index_path, 'w') as f:
        json.dump({
            "version": kb["version"],
            "total_documents": kb["total_documents"],
            "total_chunks": kb["total_chunks"],
            "documents": kb["documents"],
        }, f, indent=2)
    print(f"Saved index: {index_path}")

    # Save chunks WITHOUT embeddings (for text search fallback)
    chunks_text_path = os.path.join(output_dir, "chunks.json")
    chunks_no_embed = [{k: v for k, v in c.items() if k != "embedding"} for c in kb["chunks"]]
    with open(chunks_text_path, 'w') as f:
        json.dump(chunks_no_embed, f)
    size_mb = os.path.getsize(chunks_text_path) / (1024 * 1024)
    print(f"Saved chunks (text): {chunks_text_path} ({size_mb:.1f} MB)")

    # Save embeddings separately (large, for vector search)
    has_embeddings = any(c.get("embedding") for c in kb["chunks"])
    if has_embeddings:
        embeddings_path = os.path.join(output_dir, "embeddings.json")
        embedding_data = []
        for c in kb["chunks"]:
            if c.get("embedding"):
                embedding_data.append({
                    "id": c["id"],
                    "embedding": c["embedding"],
                })
        with open(embeddings_path, 'w') as f:
            json.dump(embedding_data, f)
        size_mb = os.path.getsize(embeddings_path) / (1024 * 1024)
        print(f"Saved embeddings: {embeddings_path} ({size_mb:.1f} MB)")

    # Save per-topic chunk groups (for fast topic-based retrieval)
    topic_map: dict[str, list[str]] = {}
    for chunk in kb["chunks"]:
        for topic in chunk.get("topics", []):
            if topic not in topic_map:
                topic_map[topic] = []
            topic_map[topic].append(chunk["id"])

    topics_path = os.path.join(output_dir, "topics.json")
    with open(topics_path, 'w') as f:
        json.dump(topic_map, f, indent=2)
    print(f"Saved topic index: {topics_path} ({len(topic_map)} topics)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build Guidewire Knowledge Base from PDFs")
    parser.add_argument("--pdf-dir", default=DEFAULT_PDF_DIR, help="Directory containing Guidewire PDFs")
    parser.add_argument("--output-dir", default=OUTPUT_DIR, help="Output directory for knowledge base")
    parser.add_argument("--skip-embeddings", action="store_true", help="Skip embedding generation")
    args = parser.parse_args()

    print("=" * 60)
    print("GUIDEWIRE KNOWLEDGE BASE BUILDER")
    print("=" * 60)
    print(f"PDF Source:  {args.pdf_dir}")
    print(f"Output:      {args.output_dir}")
    print(f"Embeddings:  {'Skipped' if args.skip_embeddings else 'Enabled'}")
    print("=" * 60 + "\n")

    kb = process_all_pdfs(args.pdf_dir, skip_embeddings=args.skip_embeddings)
    save_knowledge_base(kb, args.output_dir)

    print(f"\nDone! Knowledge base ready at {args.output_dir}")
