#!/usr/bin/env python3
"""
Guidewire Slide Image OCR Script
=================================
OCRs all slide PNG images from the training presentations to extract text
content from diagrams, code screenshots, tables, and visual content.
Outputs structured JSON optimized for RAG ingestion.

Usage:
    python3 scripts/ocr-slide-images.py                 # OCR all slides
    python3 scripts/ocr-slide-images.py --chapter ch04  # OCR single chapter
"""

import argparse
import json
import sys
import time
from pathlib import Path
from datetime import datetime

import pytesseract
from PIL import Image

# =============================================================================
# Configuration
# =============================================================================

SLIDES_DIR = Path("public/academy/guidewire/slides-original")
OUTPUT_DIR = Path("public/academy/guidewire/slide-ocr")

# Chapter metadata
CHAPTER_META = {
    "ch04": "PolicyCenter Introduction",
    "ch05": "ClaimCenter Introduction",
    "ch06": "BillingCenter Introduction",
    "ch07": "InsuranceSuite Developer Fundamentals",
    "ch08": "PolicyCenter Product Model",
    "ch09": "ClaimCenter Configuration",
    "ch11": "InsuranceSuite Integration",
    "ch14": "Rating Configuration",
}


def ocr_image(image_path: Path) -> dict:
    """OCR a single slide image and return structured result."""
    img = Image.open(str(image_path))

    # Get OCR with detailed data
    text = pytesseract.image_to_string(img, lang='eng')

    # Also get confidence data
    data = pytesseract.image_to_data(img, lang='eng', output_type=pytesseract.Output.DICT)
    confidences = [int(c) for c in data['conf'] if int(c) > 0]
    avg_conf = sum(confidences) / len(confidences) if confidences else 0

    return {
        "text": text.strip(),
        "word_count": len(text.split()) if text.strip() else 0,
        "avg_confidence": round(avg_conf, 2),
        "image_size": {"width": img.width, "height": img.height},
    }


def natural_sort_key(path: Path):
    """Sort slide images naturally (slide_1, slide_2, ... slide_10)."""
    import re
    parts = re.split(r'(\d+)', path.stem)
    return [int(p) if p.isdigit() else p.lower() for p in parts]


def main():
    parser = argparse.ArgumentParser(description="OCR Guidewire training slide images for RAG")
    parser.add_argument("--chapter", default=None, help="OCR single chapter (e.g., ch04)")
    parser.add_argument("--dry-run", action="store_true", help="List slides without OCR")
    args = parser.parse_args()

    if not SLIDES_DIR.exists():
        print(f"Slides directory not found: {SLIDES_DIR}")
        sys.exit(1)

    print("=" * 70)
    print("GUIDEWIRE SLIDE IMAGE OCR")
    print("=" * 70)

    # Discover all slide images organized by chapter/lesson
    chapters = {}
    for chapter_dir in sorted(SLIDES_DIR.iterdir()):
        if not chapter_dir.is_dir() or chapter_dir.name.startswith('.'):
            continue
        ch_slug = chapter_dir.name
        if args.chapter and ch_slug != args.chapter:
            continue

        lessons = {}
        for lesson_dir in sorted(chapter_dir.iterdir()):
            if not lesson_dir.is_dir() or lesson_dir.name.startswith('.'):
                continue

            slides = sorted(
                [f for f in lesson_dir.iterdir() if f.suffix.lower() == '.png'],
                key=natural_sort_key
            )
            if slides:
                lessons[lesson_dir.name] = slides

        if lessons:
            chapters[ch_slug] = lessons

    # Count totals
    total_slides = sum(
        len(slides) for lessons in chapters.values() for slides in lessons.values()
    )
    total_lessons = sum(len(lessons) for lessons in chapters.values())

    print(f"Slides: {total_slides} across {total_lessons} lessons in {len(chapters)} chapters")
    print()

    for ch in sorted(chapters.keys()):
        ch_title = CHAPTER_META.get(ch, "Unknown")
        ch_slides = sum(len(s) for s in chapters[ch].values())
        print(f"  {ch}: {ch_title} ({len(chapters[ch])} lessons, {ch_slides} slides)")
    print()

    if args.dry_run:
        for ch in sorted(chapters.keys()):
            for lesson in sorted(chapters[ch].keys()):
                slides = chapters[ch][lesson]
                print(f"  {ch}/{lesson}: {len(slides)} slides")
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Process
    done = 0
    errors = []
    overall_start = time.time()

    for ch_slug in sorted(chapters.keys()):
        ch_title = CHAPTER_META.get(ch_slug, "Unknown")
        ch_lessons = chapters[ch_slug]

        ch_output_dir = OUTPUT_DIR / ch_slug
        ch_output_dir.mkdir(parents=True, exist_ok=True)

        print(f"{'='*60}")
        print(f"Chapter: {ch_slug} - {ch_title}")
        print(f"{'='*60}")

        ch_all_text_parts = []

        for lesson_name in sorted(ch_lessons.keys()):
            slides = ch_lessons[lesson_name]
            lesson_output_dir = ch_output_dir / lesson_name
            lesson_output_dir.mkdir(parents=True, exist_ok=True)

            print(f"  {lesson_name} ({len(slides)} slides)...")

            lesson_slides = []
            lesson_start = time.time()

            for slide_path in slides:
                done += 1
                try:
                    result = ocr_image(slide_path)
                    slide_data = {
                        "filename": slide_path.name,
                        "slide_number": slides.index(slide_path) + 1,
                        **result,
                    }
                    lesson_slides.append(slide_data)

                    if result["text"]:
                        ch_all_text_parts.append(
                            f"--- {ch_slug}/{lesson_name}/{slide_path.name} ---\n{result['text']}"
                        )

                except Exception as e:
                    errors.append({"file": str(slide_path), "error": str(e)})
                    lesson_slides.append({
                        "filename": slide_path.name,
                        "error": str(e),
                    })

            lesson_elapsed = time.time() - lesson_start

            # Build lesson transcript
            lesson_text = "\n\n".join(
                s["text"] for s in lesson_slides if s.get("text")
            )
            total_words = sum(s.get("word_count", 0) for s in lesson_slides)
            avg_conf_values = [s["avg_confidence"] for s in lesson_slides if s.get("avg_confidence", 0) > 0]
            avg_conf = sum(avg_conf_values) / len(avg_conf_values) if avg_conf_values else 0

            lesson_result = {
                "metadata": {
                    "chapter": ch_slug,
                    "chapter_title": ch_title,
                    "lesson": lesson_name,
                    "slide_count": len(slides),
                    "slides_with_text": sum(1 for s in lesson_slides if s.get("word_count", 0) > 0),
                    "total_words": total_words,
                    "avg_confidence": round(avg_conf, 2),
                    "processing_time_seconds": round(lesson_elapsed, 2),
                    "extracted_at": datetime.now().isoformat(),
                },
                "full_text": lesson_text,
                "slides": lesson_slides,
            }

            output_file = ch_output_dir / f"{lesson_name}.json"
            output_file.write_text(json.dumps(lesson_result, indent=2, ensure_ascii=False))

            print(f"    Done: {total_words} words, {avg_conf:.0f}% confidence, {lesson_elapsed:.1f}s")

        # Build chapter summary
        ch_total_words = sum(
            len(part.split()) for part in ch_all_text_parts
        )
        ch_summary = {
            "chapter": ch_slug,
            "chapter_title": ch_title,
            "lesson_count": len(ch_lessons),
            "total_slides": sum(len(s) for s in ch_lessons.values()),
            "total_words": ch_total_words,
            "full_text": "\n\n".join(ch_all_text_parts),
            "generated_at": datetime.now().isoformat(),
        }
        summary_file = ch_output_dir / "_chapter_summary.json"
        summary_file.write_text(json.dumps(ch_summary, indent=2, ensure_ascii=False))
        print(f"\n  Chapter total: {ch_total_words} words from {ch_summary['total_slides']} slides\n")

    # Master index
    total_elapsed = time.time() - overall_start
    master_index = {
        "title": "Guidewire Training Slide OCR Extractions",
        "purpose": "RAG knowledge base - visual content from training presentations",
        "total_slides": total_slides,
        "total_processed": done,
        "total_errors": len(errors),
        "processing_time_seconds": round(total_elapsed, 2),
        "generated_at": datetime.now().isoformat(),
        "chapters": {
            ch: {
                "title": CHAPTER_META.get(ch, ""),
                "lessons": len(chapters[ch]),
                "slides": sum(len(s) for s in chapters[ch].values()),
            }
            for ch in sorted(chapters.keys())
        },
        "errors": errors[:20],  # Cap errors in index
    }
    index_file = OUTPUT_DIR / "_index.json"
    index_file.write_text(json.dumps(master_index, indent=2, ensure_ascii=False))

    print()
    print("=" * 70)
    print("OCR COMPLETE")
    print("=" * 70)
    print(f"  Slides processed: {done}/{total_slides}")
    print(f"  Errors: {len(errors)}")
    print(f"  Time: {total_elapsed:.1f}s")
    print(f"  Output: {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
