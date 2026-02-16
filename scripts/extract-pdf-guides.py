#!/usr/bin/env python3
"""
Guidewire PDF Guide Extraction Script
======================================
Extracts text content from all Guidewire reference PDFs using PyMuPDF.
Outputs structured JSON optimized for RAG ingestion with chapter/section metadata.

Usage:
    python3 scripts/extract-pdf-guides.py
"""

import json
import sys
import time
from pathlib import Path
from datetime import datetime

import fitz  # PyMuPDF

# =============================================================================
# Configuration
# =============================================================================

GUIDES_DIR = Path("public/academy/guidewire/guides")
OUTPUT_DIR = Path("public/academy/guidewire/guide-extracts")

# Map guide files to categories for better RAG organization
GUIDE_CATEGORIES = {
    "PC": {
        "category": "PolicyCenter",
        "description": "PolicyCenter application and configuration guides"
    },
    "CC": {
        "category": "ClaimCenter",
        "description": "ClaimCenter application and configuration guides"
    },
    "BC": {
        "category": "BillingCenter",
        "description": "BillingCenter application and configuration guides"
    },
    "Integ": {
        "category": "Integration",
        "description": "Integration, Cloud API, REST, and messaging guides"
    },
    "Customization": {
        "category": "Customization",
        "description": "Gosu, configuration, globalization, and rules guides"
    },
}


def extract_pdf(pdf_path: Path) -> dict:
    """Extract text and metadata from a single PDF file."""
    doc = fitz.open(str(pdf_path))
    total_page_count = len(doc)

    pages = []
    full_text_parts = []

    for page_num in range(total_page_count):
        page = doc[page_num]
        text = page.get_text("text")

        if text.strip():
            pages.append({
                "page": page_num + 1,
                "text": text.strip(),
                "word_count": len(text.split()),
            })
            full_text_parts.append(f"--- Page {page_num + 1} ---\n{text.strip()}")

    # Extract TOC (table of contents) if available
    toc = doc.get_toc()
    toc_entries = [
        {"level": level, "title": title, "page": page_num}
        for level, title, page_num in toc
    ] if toc else []

    total_words = sum(p["word_count"] for p in pages)
    full_text = "\n\n".join(full_text_parts)

    # Build sections from TOC for better chunking
    sections = []
    if toc_entries:
        for i, entry in enumerate(toc_entries):
            start_page = entry["page"]
            end_page = toc_entries[i + 1]["page"] - 1 if i + 1 < len(toc_entries) else total_page_count

            section_text_parts = []
            for p in pages:
                if start_page <= p["page"] <= end_page:
                    section_text_parts.append(p["text"])

            if section_text_parts:
                section_text = "\n".join(section_text_parts)
                sections.append({
                    "title": entry["title"],
                    "level": entry["level"],
                    "start_page": start_page,
                    "end_page": end_page,
                    "text": section_text,
                    "word_count": len(section_text.split()),
                })

    doc.close()

    return {
        "metadata": {
            "filename": pdf_path.name,
            "path": str(pdf_path),
            "total_pages": total_page_count,
            "pages_with_text": len(pages),
            "total_words": total_words,
            "toc_entries": len(toc_entries),
            "sections_extracted": len(sections),
            "extracted_at": datetime.now().isoformat(),
        },
        "toc": toc_entries,
        "sections": sections,
        "pages": pages,
        "full_text": full_text,
    }


def main():
    print("=" * 70)
    print("GUIDEWIRE PDF GUIDE EXTRACTION")
    print("=" * 70)

    if not GUIDES_DIR.exists():
        print(f"Guides directory not found: {GUIDES_DIR}")
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Find all PDFs
    pdf_files = sorted(GUIDES_DIR.rglob("*.pdf"))
    print(f"Found {len(pdf_files)} PDF files")
    print()

    results = []
    errors = []
    overall_start = time.time()

    for i, pdf_path in enumerate(pdf_files):
        relative = pdf_path.relative_to(GUIDES_DIR)
        print(f"  [{i+1}/{len(pdf_files)}] Extracting: {relative}")

        try:
            start = time.time()
            result = extract_pdf(pdf_path)
            elapsed = time.time() - start

            # Determine category
            category = "General"
            parent = pdf_path.parent.name
            if parent in GUIDE_CATEGORIES:
                category = GUIDE_CATEGORIES[parent]["category"]

            result["metadata"]["category"] = category
            result["metadata"]["extraction_time_seconds"] = round(elapsed, 2)

            # Create output file path mirroring source structure
            output_subdir = OUTPUT_DIR / relative.parent
            output_subdir.mkdir(parents=True, exist_ok=True)
            output_file = output_subdir / f"{pdf_path.stem}.json"
            output_file.write_text(json.dumps(result, indent=2, ensure_ascii=False))

            words = result["metadata"]["total_words"]
            pages = result["metadata"]["pages_with_text"]
            sections = result["metadata"]["sections_extracted"]
            print(f"           Done: {pages} pages, {words} words, {sections} sections, {elapsed:.1f}s")

            results.append({
                "filename": pdf_path.name,
                "relative_path": str(relative),
                "category": category,
                "pages": pages,
                "words": words,
                "sections": sections,
            })

        except Exception as e:
            print(f"           ERROR: {e}")
            errors.append({"file": str(relative), "error": str(e)})

    # Build category summaries for RAG
    categories = {}
    for r in results:
        cat = r["category"]
        if cat not in categories:
            categories[cat] = {"files": [], "total_words": 0, "total_pages": 0}
        categories[cat]["files"].append(r["filename"])
        categories[cat]["total_words"] += r["words"]
        categories[cat]["total_pages"] += r["pages"]

    # Build master index
    total_elapsed = time.time() - overall_start
    master_index = {
        "title": "Guidewire Official Reference Guide Extractions",
        "purpose": "RAG knowledge base - authoritative Guidewire documentation",
        "total_pdfs": len(pdf_files),
        "total_extracted": len(results),
        "total_errors": len(errors),
        "total_words": sum(r["words"] for r in results),
        "total_pages": sum(r["pages"] for r in results),
        "processing_time_seconds": round(total_elapsed, 2),
        "generated_at": datetime.now().isoformat(),
        "categories": categories,
        "files": results,
        "errors": errors,
    }

    index_file = OUTPUT_DIR / "_index.json"
    index_file.write_text(json.dumps(master_index, indent=2, ensure_ascii=False))

    # Final report
    print()
    print("=" * 70)
    print("EXTRACTION COMPLETE")
    print("=" * 70)
    print(f"  PDFs processed: {len(results)}/{len(pdf_files)}")
    print(f"  Total words: {sum(r['words'] for r in results):,}")
    print(f"  Total pages: {sum(r['pages'] for r in results):,}")
    print(f"  Errors: {len(errors)}")
    print(f"  Time: {total_elapsed:.1f}s")
    print(f"  Output: {OUTPUT_DIR}/")
    print()

    for cat, data in sorted(categories.items()):
        print(f"  {cat}: {len(data['files'])} docs, {data['total_words']:,} words")

    if errors:
        print("\nERRORS:")
        for err in errors:
            print(f"  - {err['file']}: {err['error']}")


if __name__ == "__main__":
    main()
