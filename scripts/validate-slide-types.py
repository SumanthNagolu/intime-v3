#!/usr/bin/env python3
"""
Comprehensive validation of slideType classification across all lessons.

Checks:
1. Every slide has slideType field
2. Slide 1 is always "title"
3. Question/answer slides are balanced (per lesson)
4. demo_video follows demo_instruction (never orphaned)
5. objectives_review is not misclassified as objectives
6. OCR text containing "review" near "objectives" should be objectives_review
7. No orphaned demo_video (without preceding demo_instruction)
8. Slide type distribution per chapter
"""

import json
import re
from pathlib import Path

CONTENT_DIR = Path("public/academy/guidewire/content")
CHAPTERS = ["ch04", "ch05", "ch06", "ch07", "ch08", "ch09", "ch11", "ch13", "ch14"]


def check_review_misclassification(slide):
    """Check if an 'objectives' slide should actually be 'objectives_review'."""
    ocr = slide.get("ocrText", "").lower()
    title = slide.get("title", "").lower()
    snum = slide.get("slideNumber", 0)
    stype = slide.get("slideType", "")

    if stype != "objectives":
        return False

    # If slide number > 5 and classified as objectives, likely a review
    if snum > 5:
        # Check for any form of "review" in OCR (handles OCR mangling)
        if re.search(r'revi\s*e?w', ocr) or "review" in ocr:
            return True

    return False


def check_question_misclassification(slide):
    """Check if a 'content' slide might be a question or answer."""
    ocr = slide.get("ocrText", "").strip().lower()
    stype = slide.get("slideType", "")

    if stype != "content":
        return None

    # Check first line of OCR
    first_line = ocr.split('\n')[0].strip() if ocr else ""

    if first_line.startswith("question") and len(first_line) < 15:
        return "question"
    if first_line.startswith("answer") and len(first_line) < 12:
        return "answer"
    return None


def main():
    print("=" * 80)
    print("COMPREHENSIVE SLIDE TYPE VALIDATION")
    print("=" * 80)

    total_slides = 0
    total_lessons = 0
    issues = []
    chapter_stats = {}

    for ch_slug in CHAPTERS:
        content_dir = CONTENT_DIR / ch_slug
        index_path = content_dir / "index.json"

        if not index_path.exists():
            continue

        with open(index_path) as f:
            index_data = json.load(f)

        ch_type_counts = {}
        ch_issues = []

        for lesson_info in index_data.get("lessons", []):
            lnum = lesson_info["lessonId"].split("-l")[1]
            lname = f"lesson-{lnum}"
            lpath = content_dir / f"{lname}.json"

            if not lpath.exists():
                continue

            with open(lpath) as f:
                content = json.load(f)

            slides = content.get("slides", [])
            total_lessons += 1
            total_slides += len(slides)

            # Track types per lesson
            lesson_types = {}
            question_count = 0
            answer_count = 0
            prev_type = None
            has_objectives_review = False

            for slide in slides:
                snum = slide.get("slideNumber", 0)
                stype = slide.get("slideType", "")

                # CHECK 1: slideType exists
                if not stype:
                    ch_issues.append(f"  {lname}/slide-{snum:02d}: MISSING slideType")

                lesson_types[stype] = lesson_types.get(stype, 0) + 1
                ch_type_counts[stype] = ch_type_counts.get(stype, 0) + 1

                # CHECK 2: Slide 1 should be title
                if snum == 1 and stype != "title":
                    ch_issues.append(f"  {lname}/slide-01: Expected 'title', got '{stype}'")

                # CHECK 3: Question/answer balance
                if stype == "question":
                    question_count += 1
                elif stype == "answer":
                    answer_count += 1

                # CHECK 4: Orphaned demo_video
                if stype == "demo_video" and prev_type not in ("demo_instruction", "demo_video"):
                    ch_issues.append(f"  {lname}/slide-{snum:02d}: Orphaned demo_video (prev was '{prev_type}')")

                # CHECK 5: Objectives review misclassification
                if check_review_misclassification(slide):
                    ch_issues.append(f"  {lname}/slide-{snum:02d}: 'objectives' likely should be 'objectives_review' (OCR has review-like text, slide #{snum})")

                # CHECK 6: Content might be question/answer
                possible_type = check_question_misclassification(slide)
                if possible_type:
                    ocr_preview = slide.get("ocrText", "")[:60].replace("\n", " ")
                    ch_issues.append(f"  {lname}/slide-{snum:02d}: 'content' might be '{possible_type}' (OCR: '{ocr_preview}')")

                if stype == "objectives_review":
                    has_objectives_review = True

                prev_type = stype

            # CHECK 3 continued: Balance check
            if question_count != answer_count and abs(question_count - answer_count) > 1:
                ch_issues.append(f"  {lname}: Q/A imbalance - {question_count} questions, {answer_count} answers")

        chapter_stats[ch_slug] = ch_type_counts

        print(f"\n{'='*60}")
        print(f"Chapter: {ch_slug}")
        print(f"{'='*60}")

        # Print type distribution
        for stype in ["title", "objectives", "content", "demo_instruction", "demo_video",
                       "question", "answer", "objectives_review", "vm_instructions", "exercise"]:
            count = ch_type_counts.get(stype, 0)
            print(f"  {stype:<20} {count}")

        if ch_issues:
            print(f"\n  Issues ({len(ch_issues)}):")
            for issue in ch_issues:
                print(f"    {issue}")
            issues.extend([f"{ch_slug}/{i.strip()}" for i in ch_issues])
        else:
            print(f"\n  No issues found!")

    # Global summary
    print()
    print("=" * 80)
    print("GLOBAL SUMMARY")
    print("=" * 80)
    print(f"  Total lessons: {total_lessons}")
    print(f"  Total slides:  {total_slides}")
    print()

    # Global type distribution
    global_types = {}
    for ch_types in chapter_stats.values():
        for stype, count in ch_types.items():
            global_types[stype] = global_types.get(stype, 0) + count

    print(f"  {'Type':<20} {'Count':<8} {'%':<8}")
    print(f"  {'-'*36}")
    for stype in ["title", "objectives", "content", "demo_instruction", "demo_video",
                   "question", "answer", "objectives_review", "vm_instructions", "exercise"]:
        count = global_types.get(stype, 0)
        pct = count / total_slides * 100 if total_slides else 0
        print(f"  {stype:<20} {count:<8} {pct:.1f}%")

    print()
    if issues:
        print(f"  TOTAL ISSUES: {len(issues)}")
        for issue in issues:
            print(f"    - {issue}")
    else:
        print("  NO ISSUES FOUND - All classifications validated!")

    # Additional checks
    print()
    print("=" * 80)
    print("PATTERN CHECKS")
    print("=" * 80)

    q_total = global_types.get("question", 0)
    a_total = global_types.get("answer", 0)
    print(f"  Question/Answer global balance: {q_total} questions, {a_total} answers (diff: {abs(q_total - a_total)})")

    di_total = global_types.get("demo_instruction", 0)
    dv_total = global_types.get("demo_video", 0)
    print(f"  Demo instruction/video ratio: {di_total} instructions, {dv_total} videos ({dv_total/di_total:.1f}x)" if di_total else "  No demo instructions found")

    print(f"  Title slides: {global_types.get('title', 0)} (expected: {total_lessons})")


if __name__ == "__main__":
    main()
