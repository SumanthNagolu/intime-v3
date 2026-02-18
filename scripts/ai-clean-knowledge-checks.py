#!/usr/bin/env python3
"""
AI-powered cleanup of knowledge check Q&A pairs using Gemini.

Reads all 513 Q&A pairs from knowledge-checks.json, gathers context from the
source content slides (ocrText, questionData, notes, bodyParagraphs), sends
batches to Gemini for intelligent cleanup, and patches:
  - knowledge-checks.json  (question + answer fields)
  - synthesized/ch*/lesson-*.json  (knowledge_check blocks)

Usage:
    python3 scripts/ai-clean-knowledge-checks.py                    # All chapters
    python3 scripts/ai-clean-knowledge-checks.py --chapter ch04     # One chapter
    python3 scripts/ai-clean-knowledge-checks.py --dry-run          # Preview only
    python3 scripts/ai-clean-knowledge-checks.py --dry-run --verbose  # Full diff
"""

from __future__ import annotations

import argparse
import copy
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# --- Paths ---

BASE_DIR = Path(__file__).resolve().parent.parent
ACADEMY_DIR = BASE_DIR / "public" / "academy" / "guidewire"
CONTENT_DIR = ACADEMY_DIR / "content"
SYNTH_DIR = ACADEMY_DIR / "synthesized"
KC_FILE = ACADEMY_DIR / "knowledge-checks.json"
BACKUP_SUFFIX = ".bak"

# --- Gemini setup ---

RATE_LIMIT_DELAY = 1.5  # seconds between API calls
BATCH_SIZE = 10  # Q&A pairs per Gemini call
MAX_RETRIES = 3


def init_gemini():
    """Initialize Gemini client."""
    # Load .env.local
    env_path = BASE_DIR / ".env.local"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip())

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("ERROR: No GEMINI_API_KEY found. Set it in .env.local")
        sys.exit(1)

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        print(f"  Using Gemini 2.5 Flash")
        return client
    except ImportError:
        print("ERROR: google-genai not installed. Run: pip install google-genai")
        sys.exit(1)


# --- Context gathering ---

def load_content_file(chapter: str, lesson_num: int) -> dict | None:
    """Load extracted content file for a lesson."""
    lesson_str = f"lesson-{lesson_num:02d}"
    path = CONTENT_DIR / chapter / f"{lesson_str}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text())


def get_slide_context(content_data: dict, slide_num: int) -> dict:
    """Get all available context from a specific slide."""
    if not content_data:
        return {}
    for slide in content_data.get("slides", []):
        if slide.get("slideNumber") == slide_num:
            ctx = {}
            if slide.get("ocrText"):
                ctx["ocrText"] = slide["ocrText"]
            if slide.get("questionData"):
                ctx["questionData"] = slide["questionData"]
            if slide.get("notes"):
                ctx["notes"] = slide["notes"]
            if slide.get("bodyParagraphs"):
                ctx["bodyParagraphs"] = slide["bodyParagraphs"]
            return ctx
    return {}


def gather_qa_context(lesson_id: str, qa: dict) -> dict:
    """Gather all available context for a Q&A pair."""
    # Parse lesson ID: ch04-l02 → chapter=ch04, lesson_num=2
    parts = lesson_id.split("-")
    chapter = parts[0]
    lesson_num = int(parts[1].replace("l", ""))

    content_data = load_content_file(chapter, lesson_num)

    q_slide = qa.get("questionSlide")
    a_slide = qa.get("answerSlide")

    q_context = get_slide_context(content_data, q_slide) if q_slide else {}
    a_context = get_slide_context(content_data, a_slide) if a_slide else {}

    return {
        "id": qa["id"],
        "original_question": qa["question"],
        "original_answer": qa["answer"],
        "source": qa.get("source", "ocr"),
        "question_slide_context": q_context,
        "answer_slide_context": a_context,
    }


# --- Gemini prompting ---

CLEANUP_PROMPT = """You are cleaning up OCR-extracted knowledge check Q&A pairs from Guidewire PolicyCenter training slides.

For each Q&A pair below, return a cleaned version following these rules:

## Question cleanup rules:
1. Remove OCR artifacts: ¢, ~, Sop DD, oY", SoS oD, stray punctuation prefixes
2. Fix missing spaces: "Acustomer" → "A customer", "Howdoyou" → "How do you"
3. Fix corrupted starts: "'satransaction" → "Is a transaction", "'fno" → "If no"
4. Remove line-prefix noise: "x ", "_ _", ",7 —", "~~ —" etc.
5. Remove junk lines that are pure OCR noise (random letters/symbols)
6. If question is cut off mid-sentence, reconstruct it from the slide context provided
7. Preserve the educational content and question intent exactly

## Answer cleanup rules:
1. The answer must NOT start with a copy/repeat of the question text. Remove any question text from the start of the answer.
2. Remove OCR artifacts same as questions
3. Remove noise prefixes like "Sop DD DD SDSS oe", "oY"", "i ", "' " from line starts
4. If the answer is truncated/fragment (very short or ends mid-sentence), reconstruct it from the answer slide OCR text or other context
5. Fix "X transaction" → just "transaction" (stray X prefix)
6. Clean up bullet markers: "i A." → "A.", "' B." → "B.", "I c." → "C."
7. Preserve ALL educational content — do not summarize or shorten good answers

## Context provided for each Q&A:
- `original_question` / `original_answer`: Current text (may have issues)
- `question_slide_context.ocrText`: Raw OCR from question slide
- `answer_slide_context.ocrText`: Raw OCR from answer slide (often has the full answer)
- `question_slide_context.questionData`: Structured extraction (if available)
- `question_slide_context.notes` / `answer_slide_context.notes`: Slide notes (may help with context)

## Output format:
Return a JSON array with one object per input Q&A, in the same order:
```json
[
  {
    "id": "ch04-l01-q01",
    "question": "cleaned question text",
    "answer": "cleaned answer text"
  }
]
```

## Important:
- If a Q&A pair is already clean, return it unchanged
- Do NOT add information that isn't in the source material
- Keep multi-line answers as multi-line where appropriate
- Output ONLY the JSON array, no markdown fences or commentary

---

Here are the Q&A pairs to clean:

"""


def build_batch_prompt(batch: list[dict]) -> str:
    """Build prompt for a batch of Q&A pairs."""
    prompt = CLEANUP_PROMPT

    for i, item in enumerate(batch):
        prompt += f"\n### Q&A #{i + 1} (ID: {item['id']})\n"
        prompt += f"**Original question:** {json.dumps(item['original_question'])}\n"
        prompt += f"**Original answer:** {json.dumps(item['original_answer'])}\n"
        prompt += f"**Source:** {item['source']}\n"

        q_ctx = item.get("question_slide_context", {})
        a_ctx = item.get("answer_slide_context", {})

        if q_ctx.get("ocrText"):
            prompt += f"**Question slide OCR:** {json.dumps(q_ctx['ocrText'][:500])}\n"
        if q_ctx.get("questionData"):
            prompt += f"**Question slide questionData:** {json.dumps(q_ctx['questionData'])}\n"
        if a_ctx.get("ocrText"):
            prompt += f"**Answer slide OCR:** {json.dumps(a_ctx['ocrText'][:800])}\n"
        if q_ctx.get("notes"):
            prompt += f"**Question slide notes:** {json.dumps(q_ctx['notes'][:200])}\n"
        if a_ctx.get("notes"):
            prompt += f"**Answer slide notes:** {json.dumps(a_ctx['notes'][:200])}\n"

    return prompt


def call_gemini(client, prompt: str) -> str:
    """Call Gemini API with retries."""
    for attempt in range(MAX_RETRIES):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={
                    "temperature": 0.1,
                    "max_output_tokens": 16384,
                    "response_mime_type": "application/json",
                },
            )
            return response.text.strip()
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                wait = (attempt + 1) * 5
                print(f"    Retry {attempt + 1}/{MAX_RETRIES} after error: {e}")
                time.sleep(wait)
            else:
                raise


def parse_gemini_response(text: str) -> list[dict]:
    """Parse Gemini JSON response, handling markdown fences."""
    # Strip markdown code fences if present
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*\n?", "", text)
        text = re.sub(r"\n?```\s*$", "", text)
        text = text.strip()
    return json.loads(text)


# --- Patching ---

def patch_knowledge_checks(kc_data: dict, cleaned_map: dict[str, dict]) -> int:
    """Patch knowledge-checks.json with cleaned data. Returns count of changes."""
    changes = 0
    for lesson_id, questions in kc_data["lessons"].items():
        for q in questions:
            qid = q["id"]
            if qid not in cleaned_map:
                continue
            cleaned = cleaned_map[qid]
            if q["question"] != cleaned["question"]:
                q["question"] = cleaned["question"]
                changes += 1
            if q["answer"] != cleaned["answer"]:
                q["answer"] = cleaned["answer"]
                changes += 1
    return changes


def patch_synthesized_files(cleaned_map: dict[str, dict], kc_data: dict, dry_run: bool) -> int:
    """Patch synthesized lesson files. Returns count of changes."""
    # Build a lookup: lesson_id → {slide_num → cleaned_data}
    lesson_slide_map: dict[str, dict[int, dict]] = {}
    for lesson_id, questions in kc_data["lessons"].items():
        for q in questions:
            qid = q["id"]
            if qid not in cleaned_map:
                continue
            slide_num = q.get("questionSlide")
            if slide_num is None:
                continue
            if lesson_id not in lesson_slide_map:
                lesson_slide_map[lesson_id] = {}
            lesson_slide_map[lesson_id][slide_num] = cleaned_map[qid]

    total_changes = 0

    for synth_path in sorted(SYNTH_DIR.rglob("lesson-*.json")):
        data = json.loads(synth_path.read_text())
        lesson_id = data.get("lessonId", "")
        if lesson_id not in lesson_slide_map:
            continue

        slide_lookup = lesson_slide_map[lesson_id]
        changed = False

        for block in data.get("blocks", []):
            if block.get("type") != "knowledge_check":
                continue

            # Parse slide number from questionKey: "slide-28" → 28
            qkey = block.get("questionKey", "")
            match = re.match(r"slide-(\d+)", qkey)
            if not match:
                continue
            slide_num = int(match.group(1))

            if slide_num not in slide_lookup:
                continue

            cleaned = slide_lookup[slide_num]

            if block.get("question") != cleaned["question"]:
                block["question"] = cleaned["question"]
                changed = True
                total_changes += 1

            # Synthesized files use "referenceAnswer" not "answer"
            if block.get("referenceAnswer") != cleaned["answer"]:
                block["referenceAnswer"] = cleaned["answer"]
                changed = True
                total_changes += 1

        if changed and not dry_run:
            synth_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")

    return total_changes


def patch_content_files(cleaned_map: dict[str, dict], kc_data: dict, dry_run: bool) -> int:
    """Patch content lesson files (questionData fields). Returns count of changes."""
    # Build lookup: chapter/lesson → {slide_num → cleaned_data}
    lesson_slide_map: dict[str, dict[int, dict]] = {}
    for lesson_id, questions in kc_data["lessons"].items():
        for q in questions:
            qid = q["id"]
            if qid not in cleaned_map:
                continue
            slide_num = q.get("questionSlide")
            if slide_num is None:
                continue
            if lesson_id not in lesson_slide_map:
                lesson_slide_map[lesson_id] = {}
            lesson_slide_map[lesson_id][slide_num] = cleaned_map[qid]

    total_changes = 0

    for content_path in sorted(CONTENT_DIR.rglob("lesson-*.json")):
        # Parse lesson_id from path: content/ch04/lesson-02.json → ch04-l02
        chapter = content_path.parent.name
        lesson_num = int(content_path.stem.replace("lesson-", ""))
        lesson_id = f"{chapter}-l{lesson_num:02d}"

        if lesson_id not in lesson_slide_map:
            continue

        slide_lookup = lesson_slide_map[lesson_id]
        data = json.loads(content_path.read_text())
        changed = False

        for slide in data.get("slides", []):
            slide_num = slide.get("slideNumber")
            if slide_num not in slide_lookup:
                continue
            qd = slide.get("questionData")
            if not qd:
                continue

            cleaned = slide_lookup[slide_num]
            if qd.get("question") != cleaned["question"]:
                qd["question"] = cleaned["question"]
                changed = True
                total_changes += 1
            if qd.get("answer") != cleaned["answer"]:
                qd["answer"] = cleaned["answer"]
                changed = True
                total_changes += 1

        if changed and not dry_run:
            content_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")

    return total_changes


# --- Main ---

def main():
    parser = argparse.ArgumentParser(description="AI-powered knowledge check cleanup")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show detailed diffs")
    parser.add_argument("--chapter", type=str, help="Process only one chapter (e.g. ch04)")
    parser.add_argument("--no-backup", action="store_true", help="Skip backup of original files")
    args = parser.parse_args()

    print("=" * 60)
    print("AI Knowledge Check Cleanup (Gemini 2.5 Flash)")
    print("=" * 60)

    # Load knowledge checks
    kc_data = json.loads(KC_FILE.read_text())
    total_questions = sum(len(qs) for qs in kc_data["lessons"].values())
    print(f"\nLoaded {total_questions} Q&A pairs from knowledge-checks.json")

    # Filter by chapter if specified
    lesson_ids = sorted(kc_data["lessons"].keys())
    if args.chapter:
        lesson_ids = [lid for lid in lesson_ids if lid.startswith(args.chapter)]
        filtered_count = sum(len(kc_data["lessons"][lid]) for lid in lesson_ids)
        print(f"Filtered to {args.chapter}: {filtered_count} Q&A pairs in {len(lesson_ids)} lessons")

    if not lesson_ids:
        print("No lessons to process.")
        return

    # Gather context for all Q&A pairs
    print("\nGathering slide context...")
    all_items: list[dict] = []
    for lesson_id in lesson_ids:
        questions = kc_data["lessons"][lesson_id]
        for qa in questions:
            item = gather_qa_context(lesson_id, qa)
            all_items.append(item)

    print(f"  Gathered context for {len(all_items)} Q&A pairs")

    # Initialize Gemini
    print("\nInitializing Gemini...")
    client = init_gemini()

    # Process in batches
    cleaned_map: dict[str, dict] = {}
    total_batches = (len(all_items) + BATCH_SIZE - 1) // BATCH_SIZE
    print(f"\nProcessing {len(all_items)} Q&A pairs in {total_batches} batches of {BATCH_SIZE}...")

    for batch_idx in range(0, len(all_items), BATCH_SIZE):
        batch = all_items[batch_idx : batch_idx + BATCH_SIZE]
        batch_num = batch_idx // BATCH_SIZE + 1
        batch_ids = [item["id"] for item in batch]
        print(f"\n  Batch {batch_num}/{total_batches}: {batch_ids[0]} ... {batch_ids[-1]}")

        prompt = build_batch_prompt(batch)

        try:
            raw_response = call_gemini(client, prompt)
            results = parse_gemini_response(raw_response)

            if not isinstance(results, list) or len(results) != len(batch):
                print(f"    WARNING: Expected {len(batch)} results, got {len(results) if isinstance(results, list) else 'non-list'}. Skipping batch.")
                continue

            for item, result in zip(batch, results):
                qid = result.get("id", item["id"])
                cleaned_map[qid] = {
                    "question": result["question"],
                    "answer": result["answer"],
                }

                # Show changes in verbose mode
                if args.verbose:
                    q_changed = item["original_question"] != result["question"]
                    a_changed = item["original_answer"] != result["answer"]
                    if q_changed or a_changed:
                        print(f"\n    [{qid}]")
                        if q_changed:
                            print(f"      Q BEFORE: {item['original_question'][:120]}")
                            print(f"      Q AFTER:  {result['question'][:120]}")
                        if a_changed:
                            print(f"      A BEFORE: {item['original_answer'][:120]}")
                            print(f"      A AFTER:  {result['answer'][:120]}")

            print(f"    Cleaned {len(results)} Q&A pairs")

        except Exception as e:
            print(f"    ERROR processing batch: {e}")
            continue

        # Rate limiting
        if batch_idx + BATCH_SIZE < len(all_items):
            time.sleep(RATE_LIMIT_DELAY)

    print(f"\n{'=' * 60}")
    print(f"Gemini cleaned {len(cleaned_map)} / {len(all_items)} Q&A pairs")

    if not cleaned_map:
        print("No changes to apply.")
        return

    # Count actual changes
    changed_questions = 0
    changed_answers = 0
    for lesson_id in lesson_ids:
        for qa in kc_data["lessons"][lesson_id]:
            qid = qa["id"]
            if qid in cleaned_map:
                if qa["question"] != cleaned_map[qid]["question"]:
                    changed_questions += 1
                if qa["answer"] != cleaned_map[qid]["answer"]:
                    changed_answers += 1

    print(f"  Questions changed: {changed_questions}")
    print(f"  Answers changed: {changed_answers}")
    print(f"  Total fields changed: {changed_questions + changed_answers}")

    if args.dry_run:
        print(f"\n[DRY RUN] No files modified.")
        if args.verbose:
            print("\nSample changes:")
            shown = 0
            for lesson_id in lesson_ids:
                for qa in kc_data["lessons"][lesson_id]:
                    qid = qa["id"]
                    if qid in cleaned_map:
                        c = cleaned_map[qid]
                        if qa["question"] != c["question"] or qa["answer"] != c["answer"]:
                            print(f"\n  [{qid}]")
                            if qa["question"] != c["question"]:
                                print(f"    Q: {qa['question'][:100]}")
                                print(f"    →  {c['question'][:100]}")
                            if qa["answer"] != c["answer"]:
                                print(f"    A: {qa['answer'][:100]}")
                                print(f"    →  {c['answer'][:100]}")
                            shown += 1
                            if shown >= 20:
                                print(f"\n  ... and more (showing first 20)")
                                break
                if shown >= 20:
                    break
        return

    # Backup original files
    if not args.no_backup:
        backup_time = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
        backup_path = KC_FILE.with_suffix(f".{backup_time}.bak.json")
        backup_path.write_text(KC_FILE.read_text())
        print(f"\n  Backed up knowledge-checks.json → {backup_path.name}")

    # Patch knowledge-checks.json
    print("\nPatching knowledge-checks.json...")
    kc_changes = patch_knowledge_checks(kc_data, cleaned_map)
    KC_FILE.write_text(json.dumps(kc_data, indent=2, ensure_ascii=False) + "\n")
    print(f"  {kc_changes} fields updated")

    # Patch synthesized files
    print("\nPatching synthesized lesson files...")
    synth_changes = patch_synthesized_files(cleaned_map, kc_data, dry_run=False)
    print(f"  {synth_changes} fields updated")

    # Patch content files (questionData)
    print("\nPatching content lesson files (questionData)...")
    content_changes = patch_content_files(cleaned_map, kc_data, dry_run=False)
    print(f"  {content_changes} fields updated")

    print(f"\n{'=' * 60}")
    print(f"DONE: {kc_changes + synth_changes + content_changes} total fields updated across all files")


if __name__ == "__main__":
    main()
