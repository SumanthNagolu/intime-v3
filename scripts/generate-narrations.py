#!/usr/bin/env python3
"""
Generate slide-by-slide narrations for Guidewire Academy lessons.

Uses OpenAI GPT-4o to convert instructor notes into developer-focused
narrations with continuity across slides.

Usage:
    python scripts/generate-narrations.py                              # All chapters
    python scripts/generate-narrations.py --chapter ch04               # One chapter
    python scripts/generate-narrations.py --chapter ch04 --lesson lesson-02  # One lesson
    python scripts/generate-narrations.py --dry-run                    # Preview only

Requirements:
    pip install openai
"""

import json
import os
import sys
import time
import argparse
from pathlib import Path
from typing import Optional

try:
    import openai
except ImportError:
    print("ERROR: openai package not installed. Run: pip install openai")
    sys.exit(1)

# --- Configuration ---

CONTENT_DIR = Path(__file__).parent.parent / "public" / "academy" / "guidewire" / "content"
CHAPTERS_WITH_CONTENT = ["ch04", "ch05", "ch06", "ch07", "ch08", "ch09", "ch11", "ch13", "ch14"]
API_DELAY = 1.5  # seconds between calls
MODEL = "gpt-4o"
MAX_TOKENS = 16384

# --- Chapter context ---

CHAPTER_CONTEXT = {
    "ch04": {
        "title": "PolicyCenter Introduction",
        "phase": "Specialization",
        "persona": "As a Guidewire PolicyCenter developer, explain concepts with practical implementation context. Reference the data model, entity relationships, and UI patterns.",
        "next_chapter": "ClaimCenter Introduction",
    },
    "ch05": {
        "title": "ClaimCenter Introduction",
        "phase": "Specialization",
        "persona": "As a Guidewire ClaimCenter developer, explain claims processing with emphasis on the claim lifecycle, exposure management, and financial transactions.",
        "next_chapter": "BillingCenter Introduction",
    },
    "ch06": {
        "title": "BillingCenter Introduction",
        "phase": "Specialization",
        "persona": "As a Guidewire BillingCenter developer, explain billing concepts with focus on charge patterns, payment processing, and delinquency workflows.",
        "next_chapter": "InsuranceSuite Developer Fundamentals",
    },
    "ch07": {
        "title": "InsuranceSuite Developer Fundamentals",
        "phase": "Developer Core",
        "persona": "As a senior Guidewire developer, teach coding concepts with practical examples. Emphasize Gosu patterns, PCF configuration, and the entity framework.",
        "next_chapter": "PolicyCenter Configuration",
    },
    "ch08": {
        "title": "PolicyCenter Configuration",
        "phase": "Configuration",
        "persona": "As an experienced PolicyCenter configurator, explain advanced configuration techniques with emphasis on the revisioning model, underwriting rules, and job lifecycle.",
        "next_chapter": "ClaimCenter Configuration",
    },
    "ch09": {
        "title": "ClaimCenter Configuration",
        "phase": "Configuration",
        "persona": "As an experienced ClaimCenter configurator, explain configuration patterns for claims processing, rule authoring, and financial controls.",
        "next_chapter": "BillingCenter Configuration",
    },
    "ch11": {
        "title": "Introduction to Integration",
        "phase": "Advanced",
        "persona": "As a Guidewire integration architect, explain integration patterns with emphasis on messaging, web services, plugins, and the bundle architecture.",
        "next_chapter": "Advanced Product Designer",
    },
    "ch13": {
        "title": "Rating Introduction",
        "phase": "Advanced",
        "persona": "As a Guidewire rating specialist, explain rating concepts with focus on rate tables, cost calculation, and the rating engine pipeline.",
        "next_chapter": "Rating Configuration",
    },
    "ch14": {
        "title": "Rating Configuration",
        "phase": "Advanced",
        "persona": "As a Guidewire rating configuration expert, explain configuration techniques for the rating engine, cost data objects, and rate routine development.",
        "next_chapter": "Exam Preparation",
    },
}

LESSON_TITLES = {}


def load_lesson_titles():
    """Load all lesson titles from index files for next-lesson references."""
    for chapter_dir in sorted(CONTENT_DIR.iterdir()):
        if not chapter_dir.is_dir() or not chapter_dir.name.startswith("ch"):
            continue
        index_file = chapter_dir / "index.json"
        if index_file.exists():
            with open(index_file) as f:
                idx = json.load(f)
            slug = idx.get("slug", chapter_dir.name)
            LESSON_TITLES[slug] = [
                l.get("title", f"Lesson {l.get('lessonNumber', '?')}")
                for l in idx.get("lessons", [])
            ]


# --- Prompts ---

SYSTEM_PROMPT = """You are an ACE-certified Guidewire developer and instructor creating narrations for a video-based training course. You have deep expertise in PolicyCenter, ClaimCenter, BillingCenter, the InsuranceSuite data model, Gosu programming, PCF configuration, integration patterns, and rating.

Your narrations should:
1. Sound natural and conversational - like an experienced developer teaching a colleague
2. Flow continuously from slide to slide with smooth transitions
3. Add developer perspective - mention data model entities, configuration points, common customizations
4. Explain WHY things work the way they do, not just WHAT they are
5. Reference practical implementation scenarios
6. Be concise but thorough - aim for 3-6 sentences per slide
7. Use technical terms correctly (entity, PCF, Gosu, bundle, exposure, etc.)
8. For demo/exercise slides, guide the viewer through what they should observe or do
9. For title/intro slides, set context and create engagement
10. For summary/closing slides, reinforce key takeaways and preview what's next

IMPORTANT:
- Do NOT start with "This slide" or "On this slide"
- Avoid excessive "Let's take a look at" filler
- USE transitions like "Now," "Building on that," "Here's where it gets interesting"
- Reference specific Guidewire concepts, entities, and patterns
- Keep tone professional but approachable - developer to developer
- Convert instructor cues ("Show learners...") into actual narration
- Plain text only, no markdown formatting in narrations

You MUST respond with a JSON object containing a "slides" array."""

LESSON_PROMPT = """Generate narrations for ALL {total_slides} slides in this Guidewire training lesson.

CHAPTER: {chapter_title} (Phase: {phase})
LESSON: {lesson_title} (Lesson {lesson_number})
CONTEXT: {persona}
{next_lesson_context}

Slides:
{slides_content}

---

For EACH of the {total_slides} slides provide:
- title: descriptive title (fill if empty)
- notes: enhanced notes (keep existing good notes, fill gaps for empty ones)
- narration: 3-6 sentence narration script (developer perspective, continuous flow)

Rules:
- First slide: introduce topic with energy
- Last slide: summarize and preview next lesson
- Slides with notes: base narration on notes, add developer context
- Slides without notes: infer from lesson topic, position, and surrounding slides
- Demo slides: narrate what viewer should observe/do

Respond with JSON: {{"slides": [{{"slideNumber": N, "title": "...", "notes": "...", "narration": "..."}}]}}"""


def get_api_key() -> str:
    """Get the OpenAI API key."""
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        env_file = Path(__file__).parent.parent / ".env.local"
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                line = line.strip()
                if line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                if k.strip() == "OPENAI_API_KEY":
                    key = v.strip()
                    break
    if not key:
        print("ERROR: No OPENAI_API_KEY found. Set env var or add to .env.local")
        sys.exit(1)
    return key


def load_lesson(chapter_slug: str, lesson_file: str) -> dict:
    path = CONTENT_DIR / chapter_slug / lesson_file
    with open(path) as f:
        return json.load(f)


def save_lesson(chapter_slug: str, lesson_file: str, data: dict):
    path = CONTENT_DIR / chapter_slug / lesson_file
    with open(path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"    Saved: {path.name}")


def has_narrations(lesson: dict) -> bool:
    slides = lesson.get("slides", [])
    if not slides:
        return False
    narrated = sum(1 for s in slides if s.get("narration", "").strip())
    return narrated >= len(slides) * 0.8


def format_slides(lesson: dict) -> str:
    lines = []
    for s in lesson.get("slides", []):
        lines.append(f"--- Slide {s['slideNumber']} ---")
        title = s.get("title", "") or "(no title)"
        notes = s.get("notes", "") or "(no notes)"
        lines.append(f"Title: {title}")
        lines.append(f"Image: {'yes' if s.get('hasImage') else 'no'}")
        lines.append(f"Notes: {notes}")
        lines.append("")
    return "\n".join(lines)


def generate_narrations(client: openai.OpenAI, lesson: dict, chapter_slug: str,
                        retries: int = 2) -> Optional[list]:
    """Call GPT-4o to generate narrations for a lesson."""
    ctx = CHAPTER_CONTEXT.get(chapter_slug, {
        "title": chapter_slug, "phase": "Unknown",
        "persona": "As a Guidewire developer, explain concepts clearly.",
        "next_chapter": "",
    })

    # Next lesson context
    lesson_num = lesson.get("lessonNumber", 1)
    titles = LESSON_TITLES.get(chapter_slug, [])
    if lesson_num < len(titles):
        next_ctx = f"NEXT LESSON: {titles[lesson_num]}"
    else:
        nc = ctx.get("next_chapter", "")
        next_ctx = f"Last lesson in chapter. Next chapter: {nc}" if nc else ""

    prompt = LESSON_PROMPT.format(
        chapter_title=ctx["title"],
        phase=ctx["phase"],
        lesson_title=lesson.get("title", "Unknown"),
        lesson_number=lesson.get("lessonNumber", "?"),
        persona=ctx["persona"],
        total_slides=len(lesson.get("slides", [])),
        slides_content=format_slides(lesson),
        next_lesson_context=next_ctx,
    )

    for attempt in range(retries + 1):
        try:
            resp = client.chat.completions.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                temperature=0.7,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                timeout=120,
            )

            text = resp.choices[0].message.content
            parsed = json.loads(text)

            # Handle both {"slides": [...]} and direct [...]
            if isinstance(parsed, dict) and "slides" in parsed:
                return parsed["slides"]
            elif isinstance(parsed, list):
                return parsed
            else:
                print(f"    WARNING: Unexpected JSON structure: {list(parsed.keys()) if isinstance(parsed, dict) else type(parsed)}")
                return None

        except openai.RateLimitError:
            wait = 30 * (attempt + 1)
            print(f"    Rate limited. Waiting {wait}s... (attempt {attempt + 1})")
            time.sleep(wait)
        except json.JSONDecodeError as e:
            print(f"    JSON parse error: {e}")
            if attempt < retries:
                print(f"    Retrying... (attempt {attempt + 2})")
                time.sleep(5)
            else:
                return None
        except Exception as e:
            print(f"    ERROR: {type(e).__name__}: {e}")
            if attempt < retries:
                print(f"    Retrying... (attempt {attempt + 2})")
                time.sleep(5)
            else:
                return None

    return None


def apply_narrations(lesson: dict, narrations: list) -> dict:
    """Apply generated narrations to the lesson data."""
    narr_map = {n["slideNumber"]: n for n in narrations}

    for slide in lesson["slides"]:
        num = slide["slideNumber"]
        if num in narr_map:
            n = narr_map[num]
            slide["narration"] = n.get("narration", "")
            if not slide.get("title", "").strip() and n.get("title", "").strip():
                slide["title"] = n["title"]
            if not slide.get("notes", "").strip() and n.get("notes", "").strip():
                slide["notes"] = n["notes"]

    return lesson


def process_lesson(client: openai.OpenAI, chapter_slug: str, lesson_file: str,
                   dry_run: bool = False, force: bool = False) -> str:
    """Process one lesson. Returns 'done', 'skip', or 'fail'."""
    lesson = load_lesson(chapter_slug, lesson_file)
    lesson_id = lesson.get("lessonId", lesson_file)
    title = lesson.get("title", "Unknown")

    if has_narrations(lesson) and not force:
        print(f"  SKIP {lesson_id}: {title}")
        return "skip"

    total = len(lesson.get("slides", []))
    with_notes = sum(1 for s in lesson.get("slides", []) if s.get("notes", "").strip())
    print(f"  >> {lesson_id}: {title} ({total} slides, {with_notes} with notes)")

    narrations = generate_narrations(client, lesson, chapter_slug)
    if not narrations:
        print(f"    FAILED")
        return "fail"

    got = len(narrations)
    if got < total:
        print(f"    WARNING: {got}/{total} slides narrated")

    lesson = apply_narrations(lesson, narrations)

    if dry_run:
        sample = next((s.get("narration", "") for s in lesson["slides"] if s.get("narration")), "")
        print(f"    Sample: {sample[:120]}...")
    else:
        save_lesson(chapter_slug, lesson_file, lesson)

    print(f"    OK ({got} narrations)")
    return "done"


def process_chapter(client: openai.OpenAI, chapter_slug: str, dry_run: bool = False,
                    force: bool = False, specific_lesson: Optional[str] = None, delay: float = API_DELAY):
    """Process all lessons in a chapter."""
    chapter_dir = CONTENT_DIR / chapter_slug
    if not chapter_dir.exists():
        print(f"WARNING: {chapter_dir} not found")
        return

    index_file = chapter_dir / "index.json"
    if index_file.exists():
        with open(index_file) as f:
            idx = json.load(f)
        print(f"\n{'='*60}")
        print(f"Chapter {idx.get('chapterId', '?')}: {idx.get('title', chapter_slug)}")
        print(f"  {idx.get('totalLessons', '?')} lessons | {idx.get('totalSlides', '?')} slides")
        print(f"{'='*60}")

    if specific_lesson:
        files = [specific_lesson if specific_lesson.endswith(".json") else f"{specific_lesson}.json"]
    else:
        files = sorted(f.name for f in chapter_dir.glob("lesson-*.json"))

    counts = {"done": 0, "skip": 0, "fail": 0}

    for i, lf in enumerate(files):
        if not (chapter_dir / lf).exists():
            print(f"  NOT FOUND: {lf}")
            continue

        result = process_lesson(client, chapter_slug, lf, dry_run, force)
        counts[result] += 1

        if result == "done" and i < len(files) - 1:
            time.sleep(delay)

    print(f"\n  {counts['done']} done | {counts['skip']} skipped | {counts['fail']} failed")


def main():
    parser = argparse.ArgumentParser(description="Generate Guidewire Academy narrations")
    parser.add_argument("--chapter", help="Chapter (e.g., ch04)")
    parser.add_argument("--lesson", help="Lesson (e.g., lesson-02)")
    parser.add_argument("--dry-run", action="store_true", help="Preview only")
    parser.add_argument("--force", action="store_true", help="Regenerate existing")
    parser.add_argument("--delay", type=float, default=API_DELAY, help="Delay between calls (s)")
    args = parser.parse_args()

    load_lesson_titles()

    api_key = get_api_key()
    client = openai.OpenAI(api_key=api_key)

    print(f"Guidewire Academy Narration Generator")
    print(f"  Model: {MODEL} | Mode: {'DRY RUN' if args.dry_run else 'LIVE'}")
    if args.force:
        print(f"  Force: regenerating existing")
    print()

    chapters = [args.chapter] if args.chapter else CHAPTERS_WITH_CONTENT

    for ch in chapters:
        process_chapter(client, ch, args.dry_run, args.force, args.lesson, args.delay)

    print("\nDone!")


if __name__ == "__main__":
    main()
