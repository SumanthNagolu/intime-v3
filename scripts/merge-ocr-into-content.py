#!/usr/bin/env python3
"""
Merge slide-ocr data into content lesson JSONs for full centralization.

For each lesson JSON in content/, this script:
1. Loads the matching OCR data from slide-ocr/
2. Adds `ocrText`, `ocrWordCount`, `ocrConfidence` to each slide object
3. Ensures slide count matches actual slide images on disk
4. Adds missing slides (OCR may have more slides than PPT extraction)
5. Updates index.json with accurate totalSlides counts

The result is a single centralized content JSON per lesson containing:
- Original PPT notes (from speaker notes)
- OCR text (from slide image OCR)
- Narration (where available, from AI generation)
- Slide metadata (hasTable, hasChart, hasImage, etc.)
"""

import json
import os
from pathlib import Path

CONTENT_DIR = Path("public/academy/guidewire/content")
OCR_DIR = Path("public/academy/guidewire/slide-ocr")
SLIDES_DIR = Path("public/academy/guidewire/slides")

# All chapters that have PPT-based slides
CHAPTERS = ["ch04", "ch05", "ch06", "ch07", "ch08", "ch09", "ch11", "ch13", "ch14"]


def count_slide_images(ch_slug: str, lesson_name: str) -> int:
    """Count actual PNG slide images on disk."""
    lesson_dir = SLIDES_DIR / ch_slug / lesson_name
    if not lesson_dir.exists():
        return 0
    return len([f for f in lesson_dir.iterdir() if f.suffix.lower() == '.png'])


def main():
    print("=" * 70)
    print("MERGE OCR DATA INTO CONTENT JSONs")
    print("=" * 70)

    total_lessons = 0
    total_merged = 0
    total_slides_added = 0
    total_ocr_enriched = 0
    issues = []

    for ch_slug in CHAPTERS:
        content_ch_dir = CONTENT_DIR / ch_slug
        ocr_ch_dir = OCR_DIR / ch_slug
        index_path = content_ch_dir / "index.json"

        if not content_ch_dir.exists():
            print(f"\n  WARNING: No content dir for {ch_slug}")
            continue

        print(f"\n{'='*60}")
        print(f"Chapter: {ch_slug}")
        print(f"{'='*60}")

        # Load index
        if not index_path.exists():
            print(f"  WARNING: No index.json")
            continue

        with open(index_path) as f:
            index_data = json.load(f)

        index_updated = False

        for lesson_info in index_data.get("lessons", []):
            lesson_num = lesson_info["lessonId"].split("-l")[1]
            lesson_name = f"lesson-{lesson_num}"
            lesson_path = content_ch_dir / f"{lesson_name}.json"

            if not lesson_path.exists():
                continue

            total_lessons += 1

            with open(lesson_path) as f:
                content = json.load(f)

            # Load OCR data if available
            ocr_data = None
            ocr_path = ocr_ch_dir / f"{lesson_name}.json"
            if ocr_path.exists():
                try:
                    with open(ocr_path) as f:
                        ocr_data = json.load(f)
                except Exception as e:
                    issues.append(f"{ch_slug}/{lesson_name}: Error loading OCR: {e}")

            # Count actual slide images
            actual_slide_count = count_slide_images(ch_slug, lesson_name)

            # Build OCR lookup by slide number
            ocr_by_slide = {}
            if ocr_data and "slides" in ocr_data:
                for s in ocr_data["slides"]:
                    snum = s.get("slide_number")
                    if snum:
                        ocr_by_slide[snum] = s

            # Build existing content slides lookup
            content_slides = content.get("slides", [])
            content_by_slide = {}
            for s in content_slides:
                snum = s.get("slideNumber")
                if snum:
                    content_by_slide[snum] = s

            # Merge: ensure we have entries for all actual slides
            merged_slides = []
            max_slide = max(actual_slide_count, len(content_slides), len(ocr_by_slide))

            slides_enriched = 0
            slides_added = 0

            for snum in range(1, max_slide + 1):
                content_slide = content_by_slide.get(snum)
                ocr_slide = ocr_by_slide.get(snum)

                if content_slide:
                    # Existing content slide - enrich with OCR
                    slide = dict(content_slide)
                    if ocr_slide and not ocr_slide.get("error"):
                        slide["ocrText"] = ocr_slide.get("text", "")
                        slide["ocrWordCount"] = ocr_slide.get("word_count", 0)
                        slide["ocrConfidence"] = ocr_slide.get("avg_confidence", 0)
                        if ocr_slide.get("text"):
                            slides_enriched += 1
                    else:
                        # No OCR data - set empty
                        slide.setdefault("ocrText", "")
                        slide.setdefault("ocrWordCount", 0)
                        slide.setdefault("ocrConfidence", 0)
                    merged_slides.append(slide)
                elif ocr_slide:
                    # OCR-only slide (no content entry) - create new entry
                    slide = {
                        "slideNumber": snum,
                        "title": "",
                        "bodyParagraphs": [],
                        "notes": "",
                        "hasTable": False,
                        "hasChart": False,
                        "hasImage": True,
                        "tableData": None,
                        "mediaReferences": [],
                        "ocrText": ocr_slide.get("text", "") if not ocr_slide.get("error") else "",
                        "ocrWordCount": ocr_slide.get("word_count", 0) if not ocr_slide.get("error") else 0,
                        "ocrConfidence": ocr_slide.get("avg_confidence", 0) if not ocr_slide.get("error") else 0,
                    }
                    merged_slides.append(slide)
                    slides_added += 1
                else:
                    # Slide exists on disk but no content or OCR
                    slide = {
                        "slideNumber": snum,
                        "title": "",
                        "bodyParagraphs": [],
                        "notes": "",
                        "hasTable": False,
                        "hasChart": False,
                        "hasImage": True,
                        "tableData": None,
                        "mediaReferences": [],
                        "ocrText": "",
                        "ocrWordCount": 0,
                        "ocrConfidence": 0,
                    }
                    merged_slides.append(slide)
                    slides_added += 1

            # Update content
            content["slides"] = merged_slides
            content["totalSlides"] = len(merged_slides)

            # Add OCR metadata
            if ocr_data and "metadata" in ocr_data:
                content["ocrMetadata"] = {
                    "totalWords": ocr_data["metadata"].get("total_words", 0),
                    "avgConfidence": ocr_data["metadata"].get("avg_confidence", 0),
                    "extractedAt": ocr_data["metadata"].get("extracted_at", ""),
                }

            # Write updated content
            with open(lesson_path, 'w') as f:
                json.dump(content, f, indent=2, ensure_ascii=False)

            total_merged += 1
            total_slides_added += slides_added
            total_ocr_enriched += slides_enriched

            # Update index lesson entry
            for idx_lesson in index_data["lessons"]:
                if idx_lesson["lessonId"] == lesson_info["lessonId"]:
                    idx_lesson["totalSlides"] = len(merged_slides)
                    idx_lesson["hasOcr"] = bool(ocr_data)
                    index_updated = True
                    break

            status_parts = []
            if slides_enriched:
                status_parts.append(f"{slides_enriched} OCR enriched")
            if slides_added:
                status_parts.append(f"{slides_added} slides added")
            status = ", ".join(status_parts) if status_parts else "no changes needed"

            print(f"  {lesson_name}: {len(merged_slides)} slides ({status})")

        # Update index totals
        if index_updated:
            total_slides_in_ch = sum(l.get("totalSlides", 0) for l in index_data["lessons"])
            index_data["totalSlides"] = total_slides_in_ch

            with open(index_path, 'w') as f:
                json.dump(index_data, f, indent=2, ensure_ascii=False)
            print(f"\n  Updated index.json: {total_slides_in_ch} total slides")

    # Update curriculum-index.json if it exists
    curriculum_path = CONTENT_DIR / "curriculum-index.json"
    if curriculum_path.exists():
        try:
            with open(curriculum_path) as f:
                curriculum = json.load(f)
            # Update chapter entries
            for ch_entry in curriculum.get("chapters", []):
                ch_slug = ch_entry.get("slug", "")
                if ch_slug in CHAPTERS:
                    idx_path = CONTENT_DIR / ch_slug / "index.json"
                    if idx_path.exists():
                        with open(idx_path) as f:
                            idx = json.load(f)
                        ch_entry["totalSlides"] = idx.get("totalSlides", 0)
                        ch_entry["totalLessons"] = idx.get("totalLessons", len(idx.get("lessons", [])))
            with open(curriculum_path, 'w') as f:
                json.dump(curriculum, f, indent=2, ensure_ascii=False)
            print(f"\n  Updated curriculum-index.json")
        except Exception as e:
            issues.append(f"Error updating curriculum-index.json: {e}")

    print()
    print("=" * 70)
    print("MERGE COMPLETE")
    print("=" * 70)
    print(f"  Lessons processed: {total_lessons}")
    print(f"  Lessons merged: {total_merged}")
    print(f"  Slides OCR-enriched: {total_ocr_enriched}")
    print(f"  New slides added: {total_slides_added}")

    if issues:
        print(f"\n  Issues ({len(issues)}):")
        for issue in issues:
            print(f"    - {issue}")


if __name__ == "__main__":
    main()
