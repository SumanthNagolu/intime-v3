#!/usr/bin/env python3
"""
OCR missing slide images for ch09, ch11, ch13, ch14.
Reads from public/academy/guidewire/slides/ and writes to public/academy/guidewire/slide-ocr/.
Skips lessons that already have OCR data.
"""

import json
import re
import sys
import time
from pathlib import Path
from datetime import datetime

try:
    import pytesseract
    from PIL import Image
except ImportError:
    print("ERROR: pytesseract and Pillow required")
    print("  pip3 install pytesseract Pillow")
    sys.exit(1)

SLIDES_DIR = Path("public/academy/guidewire/slides")
OUTPUT_DIR = Path("public/academy/guidewire/slide-ocr")

CHAPTER_META = {
    "ch04": "PolicyCenter Introduction",
    "ch05": "ClaimCenter Introduction",
    "ch06": "BillingCenter Introduction",
    "ch07": "InsuranceSuite Developer Fundamentals",
    "ch08": "PolicyCenter Product Model",
    "ch09": "ClaimCenter Configuration",
    "ch11": "InsuranceSuite Integration",
    "ch13": "Rating Introduction",
    "ch14": "Rating Configuration",
}

# Only process these chapters
TARGET_CHAPTERS = ["ch09", "ch11", "ch13", "ch14"]


def natural_sort_key(path: Path):
    parts = re.split(r'(\d+)', path.stem)
    return [int(p) if p.isdigit() else p.lower() for p in parts]


def ocr_image(image_path: Path) -> dict:
    img = Image.open(str(image_path))
    text = pytesseract.image_to_string(img, lang='eng')
    data = pytesseract.image_to_data(img, lang='eng', output_type=pytesseract.Output.DICT)
    confidences = [int(c) for c in data['conf'] if int(c) > 0]
    avg_conf = sum(confidences) / len(confidences) if confidences else 0

    return {
        "text": text.strip(),
        "word_count": len(text.split()) if text.strip() else 0,
        "avg_confidence": round(avg_conf, 2),
        "image_size": {"width": img.width, "height": img.height},
    }


def main():
    print("=" * 70)
    print("OCR MISSING SLIDES (ch09, ch11, ch13, ch14)")
    print("=" * 70)

    total_done = 0
    total_skipped = 0
    errors = []
    overall_start = time.time()

    for ch_slug in TARGET_CHAPTERS:
        ch_title = CHAPTER_META.get(ch_slug, "Unknown")
        ch_slides_dir = SLIDES_DIR / ch_slug
        ch_output_dir = OUTPUT_DIR / ch_slug
        ch_output_dir.mkdir(parents=True, exist_ok=True)

        if not ch_slides_dir.exists():
            print(f"\n  WARNING: No slides dir for {ch_slug}")
            continue

        print(f"\n{'='*60}")
        print(f"Chapter: {ch_slug} - {ch_title}")
        print(f"{'='*60}")

        # Discover all lesson directories
        lesson_dirs = sorted(
            [d for d in ch_slides_dir.iterdir() if d.is_dir() and d.name.startswith('lesson-')],
            key=lambda d: d.name
        )

        ch_all_text_parts = []
        ch_lesson_count = 0
        ch_slide_count = 0

        for lesson_dir in lesson_dirs:
            lesson_name = lesson_dir.name
            output_file = ch_output_dir / f"{lesson_name}.json"

            # Check if already OCR'd
            if output_file.exists():
                # Load existing data for chapter summary rebuild
                try:
                    existing = json.loads(output_file.read_text())
                    if existing.get("slides") and len(existing["slides"]) > 0:
                        slide_count = len(existing["slides"])
                        print(f"  {lesson_name}: SKIP (already has {slide_count} slides OCR'd)")
                        total_skipped += 1
                        ch_lesson_count += 1
                        ch_slide_count += slide_count
                        # Add to chapter text for summary rebuild
                        if existing.get("full_text"):
                            ch_all_text_parts.append(
                                f"--- {ch_slug}/{lesson_name} ---\n{existing['full_text']}"
                            )
                        continue
                except Exception:
                    pass

            slides = sorted(
                [f for f in lesson_dir.iterdir() if f.suffix.lower() == '.png'],
                key=natural_sort_key
            )

            if not slides:
                print(f"  {lesson_name}: SKIP (no PNG files)")
                continue

            print(f"  {lesson_name} ({len(slides)} slides)...", end="", flush=True)

            lesson_slides = []
            lesson_start = time.time()

            for slide_path in slides:
                total_done += 1
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

            # Build lesson result
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

            output_file.write_text(json.dumps(lesson_result, indent=2, ensure_ascii=False))
            ch_lesson_count += 1
            ch_slide_count += len(slides)

            print(f" {total_words} words, {avg_conf:.0f}% confidence, {lesson_elapsed:.1f}s")

        # Rebuild chapter summary (includes both existing and new)
        ch_total_words = sum(len(part.split()) for part in ch_all_text_parts)
        ch_summary = {
            "chapter": ch_slug,
            "chapter_title": ch_title,
            "lesson_count": ch_lesson_count,
            "total_slides": ch_slide_count,
            "total_words": ch_total_words,
            "full_text": "\n\n".join(ch_all_text_parts),
            "generated_at": datetime.now().isoformat(),
        }
        summary_file = ch_output_dir / "_chapter_summary.json"
        summary_file.write_text(json.dumps(ch_summary, indent=2, ensure_ascii=False))
        print(f"\n  Chapter summary: {ch_lesson_count} lessons, {ch_slide_count} slides, {ch_total_words} words")

    # Update master index with ALL chapters
    total_elapsed = time.time() - overall_start

    all_chapters = {}
    for ch_dir in sorted(OUTPUT_DIR.iterdir()):
        if ch_dir.is_dir() and ch_dir.name.startswith('ch'):
            ch_slug = ch_dir.name
            lesson_files = [f for f in ch_dir.iterdir() if f.name.startswith('lesson-') and f.suffix == '.json']
            slide_total = 0
            for lf in lesson_files:
                try:
                    ld = json.loads(lf.read_text())
                    slide_total += ld.get("metadata", {}).get("slide_count", 0)
                except Exception:
                    pass
            all_chapters[ch_slug] = {
                "title": CHAPTER_META.get(ch_slug, ""),
                "lessons": len(lesson_files),
                "slides": slide_total,
            }

    master_index = {
        "title": "Guidewire Training Slide OCR Extractions",
        "purpose": "RAG knowledge base - visual content from training presentations",
        "total_slides": sum(c["slides"] for c in all_chapters.values()),
        "total_lessons": sum(c["lessons"] for c in all_chapters.values()),
        "total_errors": len(errors),
        "processing_time_seconds": round(total_elapsed, 2),
        "generated_at": datetime.now().isoformat(),
        "chapters": all_chapters,
        "errors": errors[:20],
    }
    index_file = OUTPUT_DIR / "_index.json"
    index_file.write_text(json.dumps(master_index, indent=2, ensure_ascii=False))

    print()
    print("=" * 70)
    print("OCR COMPLETE")
    print("=" * 70)
    print(f"  New slides processed: {total_done}")
    print(f"  Lessons skipped (already done): {total_skipped}")
    print(f"  Errors: {len(errors)}")
    print(f"  Time: {total_elapsed:.1f}s")
    print(f"  Output: {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
