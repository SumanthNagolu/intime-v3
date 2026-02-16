#!/usr/bin/env python3
"""
Synthesize structured, learning-science-backed lessons from raw academy materials.

Uses Gemini 2.5 Flash (preferred, 65K output) or OpenAI GPT-4o (fallback) to combine:
  - Slide narration, notes, OCR text, body paragraphs, table data
  - Video transcripts
  - Knowledge check Q&A pairs
  - Relevant reference guide pages

Outputs structured JSON following Gagné's 9 Events of Instruction.

Usage:
    python3 scripts/synthesize-lessons.py                            # All chapters
    python3 scripts/synthesize-lessons.py --chapter ch04             # One chapter
    python3 scripts/synthesize-lessons.py --chapter ch04 --lesson 1  # One lesson
    python3 scripts/synthesize-lessons.py --dry-run                  # Preview only
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path
from datetime import datetime, timezone

# --- Configuration ---

CONTENT_DIR = Path("public/academy/guidewire/content")
TRANSCRIPT_DIR = Path("public/academy/guidewire/transcripts")
GUIDE_DIR = Path("public/academy/guidewire/guide-extracts")
KC_FILE = Path("public/academy/guidewire/knowledge-checks.json")
OUTPUT_DIR = Path("public/academy/guidewire/synthesized")
CHECKPOINT_FILE = OUTPUT_DIR / "_checkpoint.json"

# Chapter → guide category mapping
CHAPTER_GUIDE_MAP = {
    "ch04": ["PC"],
    "ch05": ["CC"],
    "ch06": ["BC"],
    "ch07": ["Customization"],
    "ch08": ["PC"],
    "ch09": ["CC"],
    "ch11": ["Integration", "Integ"],
    "ch12": ["PC"],  # Product Designer is part of PC
    "ch13": ["PC"],  # Rating is part of PC
    "ch14": ["PC"],
}

# Chapters with full PPT content
CHAPTERS_WITH_CONTENT = [
    "ch04", "ch05", "ch06", "ch07", "ch08", "ch09",
    "ch11", "ch12", "ch13", "ch14"
]

RATE_LIMIT_DELAY = 2.0  # seconds between API calls
MAX_RETRIES = 3
BACKOFF_BASE = 5.0  # seconds

# --- AI Client ---

def load_env_local():
    """Load variables from .env.local file."""
    env_path = Path(".env.local")
    if not env_path.exists():
        return
    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and value:
                    os.environ.setdefault(key, value)


AI_PROVIDER = None  # Set during init: "gemini" or "openai"


def get_ai_client():
    """Initialize AI client. Prefers Gemini (65K output tokens) over OpenAI (16K)."""
    global AI_PROVIDER
    load_env_local()

    # Try Gemini first (much higher output token limit)
    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if gemini_key:
        try:
            from google import genai
            AI_PROVIDER = "gemini"
            print(f"  Using: Gemini 2.5 Flash (65K output tokens)")
            return genai.Client(api_key=gemini_key)
        except ImportError:
            print("  [WARN] google-genai not installed, trying OpenAI...")

    # Fall back to OpenAI
    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key:
        try:
            from openai import OpenAI
            AI_PROVIDER = "openai"
            print(f"  Using: OpenAI GPT-4o (16K output tokens)")
            return OpenAI(api_key=openai_key)
        except ImportError:
            pass

    print("ERROR: No AI API key found. Set GEMINI_API_KEY or OPENAI_API_KEY in .env.local")
    sys.exit(1)


# --- Data Loading ---

def load_lesson_json(chapter_slug: str, lesson_number: int) -> dict | None:
    """Load a lesson's extracted content JSON."""
    path = CONTENT_DIR / chapter_slug / f"lesson-{lesson_number:02d}.json"
    if not path.exists():
        return None
    with open(path, "r") as f:
        return json.load(f)


def load_knowledge_checks() -> dict:
    """Load centralized knowledge checks."""
    if not KC_FILE.exists():
        return {}
    with open(KC_FILE, "r") as f:
        data = json.load(f)
    return data.get("lessons", {})


def load_transcripts_for_lesson(chapter_slug: str, source_folder: str | None) -> list[dict]:
    """Load video transcripts matching a lesson's source folder."""
    if not source_folder:
        return []
    transcript_dir = TRANSCRIPT_DIR / chapter_slug
    if not transcript_dir.exists():
        return []

    transcripts = []
    for f in sorted(transcript_dir.glob("*.json")):
        if f.name.startswith("_"):
            continue
        # Match by source folder prefix (e.g., "In_policy_01" matches "In_policy_01_01.json")
        stem = f.stem  # e.g., "In_policy_01_01"
        if stem.startswith(source_folder):
            try:
                with open(f, "r") as fh:
                    data = json.load(fh)
                transcripts.append({
                    "filename": f.name.replace(".json", ".mp4"),
                    "full_text": data.get("full_text", ""),
                    "duration": data.get("metadata", {}).get("duration_formatted", ""),
                    "word_count": data.get("metadata", {}).get("word_count", 0),
                })
            except (json.JSONDecodeError, KeyError):
                continue
    return transcripts


def load_guide_pages(chapter_slug: str, lesson_title: str, max_pages: int = 15) -> list[dict]:
    """Load relevant guide pages for a lesson using keyword matching."""
    categories = CHAPTER_GUIDE_MAP.get(chapter_slug, [])
    if not categories:
        return []

    # Extract keywords from lesson title
    stop_words = {"the", "a", "an", "and", "or", "in", "of", "to", "for", "is", "it", "on", "at", "by", "with"}
    keywords = [
        w.lower() for w in re.findall(r'\w+', lesson_title)
        if len(w) > 2 and w.lower() not in stop_words
    ]

    scored_sections = []

    for category in categories:
        cat_dir = GUIDE_DIR / category
        if not cat_dir.exists():
            continue

        for guide_file in cat_dir.glob("*.json"):
            try:
                with open(guide_file, "r") as f:
                    guide = json.load(f)
            except (json.JSONDecodeError, KeyError):
                continue

            for section in guide.get("sections", []):
                title = section.get("title", "").lower()
                # Support both "content" and "text" field names
                content = section.get("content", "") or section.get("text", "")
                if not content or len(content) < 100:
                    continue

                # Score by keyword match in section title
                score = sum(1 for kw in keywords if kw in title)
                # Bonus for exact title word match
                title_words = set(re.findall(r'\w+', title))
                score += sum(2 for kw in keywords if kw in title_words)

                if score > 0:
                    scored_sections.append({
                        "title": section.get("title", ""),
                        "content": content[:3000],  # Limit per section
                        "score": score,
                        "source": guide_file.name,
                    })

    # Sort by score, take top N
    scored_sections.sort(key=lambda x: x["score"], reverse=True)
    return scored_sections[:max_pages]


# --- Prompt Builder ---

def build_slide_context(lesson: dict) -> str:
    """Build concatenated slide content for the prompt."""
    parts = []
    for slide in lesson.get("slides", []):
        sn = slide.get("slideNumber", 0)
        st = slide.get("slideType", "content")
        title = slide.get("title", "")

        # Skip title/objectives/review slides — we handle those structurally
        if st in ("title", "objectives", "objectives_review"):
            continue

        # Tag content slides vs structural slides
        NON_FIGURE_SLIDE_TYPES = {"demo_video", "demo_instruction", "question", "answer", "vm_instructions", "exercise"}
        if st in NON_FIGURE_SLIDE_TYPES:
            lines = [f"--- Slide {sn}: {title} (type: {st}) [use content in demo/KC/assignment blocks, not as figure] ---"]
        else:
            lines = [f"--- Slide {sn}: {title} (type: {st}) [MUST INCLUDE AS FIGURE] ---"]

        # Narration is the richest content
        narration = slide.get("narration", "")
        if narration:
            lines.append(f"NARRATION: {narration}")

        # Notes as supplement
        notes = slide.get("notes", "")
        if notes and notes != narration:
            lines.append(f"NOTES: {notes}")

        # OCR text shows what's visually on the slide
        ocr = slide.get("ocrText", "")
        if ocr and len(ocr) > 20:
            lines.append(f"VISUAL TEXT: {ocr[:500]}")

        # Body paragraphs
        for para in slide.get("bodyParagraphs", []):
            text = para.get("text", "").strip()
            if text:
                indent = "  " * para.get("level", 0)
                bold = "**" if para.get("bold") else ""
                lines.append(f"  {indent}{bold}{text}{bold}")

        # Table data
        if slide.get("hasTable") and slide.get("tableData"):
            lines.append("TABLE:")
            for row in slide["tableData"]:
                lines.append("  | " + " | ".join(str(c) for c in row) + " |")

        # Question data
        qd = slide.get("questionData")
        if qd:
            lines.append(f"QUESTION: {qd.get('question', '')}")
            lines.append(f"ANSWER: {qd.get('answer', '')}")

        parts.append("\n".join(lines))

    return "\n\n".join(parts)


def build_transcript_context(transcripts: list[dict]) -> str:
    """Build transcript context for the prompt."""
    if not transcripts:
        return ""
    parts = ["=== VIDEO TRANSCRIPTS ==="]
    for t in transcripts:
        text = t["full_text"][:2000]  # Limit per transcript
        parts.append(f"\n--- Video: {t['filename']} ({t['duration']}) ---\n{text}")
    return "\n".join(parts)


def build_guide_context(guide_pages: list[dict]) -> str:
    """Build guide context for the prompt."""
    if not guide_pages:
        return ""
    parts = ["=== REFERENCE GUIDE EXCERPTS ==="]
    for p in guide_pages:
        parts.append(f"\n--- {p['title']} (from {p['source']}) ---\n{p['content']}")
    return "\n".join(parts)


def build_kc_context(kc_items: list[dict]) -> str:
    """Build knowledge check context for the prompt."""
    if not kc_items:
        return ""
    parts = ["=== KNOWLEDGE CHECK QUESTIONS (preserve verbatim) ==="]
    for kc in kc_items:
        parts.append(f"\nQ (slide {kc['questionSlide']}): {kc['question']}")
        parts.append(f"A: {kc['answer']}")
    return "\n".join(parts)


def build_synthesis_prompt(
    lesson: dict,
    slide_context: str,
    transcript_context: str,
    guide_context: str,
    kc_context: str,
) -> str:
    """Build the full synthesis prompt for OpenAI."""
    lesson_id = lesson["lessonId"]
    title = lesson["title"]
    chapter_slug = lesson["chapterSlug"]
    total_slides = lesson["totalSlides"]
    videos = lesson.get("videos", [])
    has_assignment = bool(lesson.get("sourceFolder"))

    # Extract objectives from slides
    objectives_text = ""
    for slide in lesson.get("slides", []):
        if slide.get("slideType") == "objectives":
            narr = slide.get("narration", "") or slide.get("notes", "")
            if narr:
                objectives_text = narr
                break

    # Build list of content slide numbers
    # Slides that MUST appear as figures in concept blocks (visual/content slides)
    # Excluded: title, objectives, objectives_review (structural)
    # Excluded: demo_video (handled by demo blocks), question/answer (handled by KC blocks)
    NON_FIGURE_TYPES = {
        "title", "objectives", "objectives_review",
        "demo_video", "demo_instruction", "question", "answer",
        "vm_instructions", "exercise",
    }
    content_slides = []
    all_slide_numbers = []
    for slide in lesson.get("slides", []):
        sn = slide.get("slideNumber", 0)
        st = slide.get("slideType", "content")
        all_slide_numbers.append(sn)
        if st not in NON_FIGURE_TYPES:
            content_slides.append(sn)

    content_slides_str = ", ".join(str(s) for s in content_slides)
    all_slides_str = ", ".join(str(s) for s in all_slide_numbers)

    return f"""You are an expert instructional designer creating a structured lesson from raw training materials.

## LESSON METADATA
- Lesson ID: {lesson_id}
- Title: {title}
- Chapter: {chapter_slug}
- Total slides: {total_slides}
- All slide numbers: {all_slides_str}
- Content slides (MUST ALL be included as figures): {content_slides_str}
- Videos available: {len(videos)}

## LEARNING SCIENCE FRAMEWORK
Structure the lesson following Gagné's 9 Events of Instruction:
1. **Hook** (Gain attention) — Real-world scenario + provocative question
2. **Objectives** (Inform learner of objectives) — Clear learning outcomes
3. **Activate** (Stimulate recall of prior learning) — Connect to previous knowledge
4. **Concept blocks** (Present content) — Rich narrative with ALL slide figures included
5. **Demo blocks** (Provide learning guidance) — Video context + what to watch for
6. **Practice blocks** (Elicit performance) — Scaffolded questions with hints
7. **Knowledge checks** (Assess performance) — Preserve existing Q&A verbatim
8. **Summary** (Enhance retention/transfer) — Key takeaways + real-world connection
9. **Assignment** (if applicable) — Hands-on task

## EXTRACTED OBJECTIVES
{objectives_text}

## SLIDE CONTENT (narration is primary, notes supplement)
{slide_context}

{transcript_context}

{guide_context}

{kc_context}

## OUTPUT FORMAT
Return ONLY valid JSON matching this schema (no markdown fences, no explanation):

{{
  "title": "{title}",
  "subtitle": "A brief tagline for the lesson (10-15 words)",
  "estimatedMinutes": <number>,
  "blocks": [
    {{
      "type": "hook",
      "id": "hook-1",
      "scenario": "A real-world scenario that makes this topic relevant (2-3 sentences)",
      "question": "A thought-provoking question to engage the learner"
    }},
    {{
      "type": "objectives",
      "id": "obj-1",
      "objectives": ["objective 1", "objective 2", ...],
      "estimatedMinutes": <number>
    }},
    {{
      "type": "activate",
      "id": "act-1",
      "priorKnowledge": "Connection to what the learner already knows (1-2 sentences)",
      "warmupQuestion": "A self-reflection question",
      "hint": "Optional hint"
    }},
    // Multiple concept blocks — group 2-4 related slides per concept block.
    // EVERY content slide MUST appear as a figure in exactly one concept block.
    {{
      "type": "concept",
      "id": "concept-1",
      "heading": "Section heading",
      "narrative": "Rich prose in markdown (use **bold**, bullet lists, etc). 200-400 words per concept block. Weave together narration + notes + guide content into a flowing, learner-friendly explanation. Write as if you're a mentor teaching a colleague — warm, clear, thorough. Include ALL important details from the slides.",
      "keyPoints": ["key point 1", "key point 2"],
      "figures": [
        {{"slideNumber": <slide_number>, "caption": "Descriptive caption explaining what this slide shows"}}
      ],
      "tables": [
        {{"headers": ["col1", "col2"], "rows": [["a", "b"]], "caption": "Table description"}}
      ],
      "callouts": [
        {{"type": "tip|warning|best_practice|gotcha|definition", "title": "Short title", "content": "Callout content"}}
      ],
      "codeExamples": [
        {{"language": "gosu|xml|sql|json|text", "title": "Example title", "code": "code here", "explanation": "What this code does"}}
      ]
    }},
    // Demo blocks — one per video (videoIndex 0-based):
    {{
      "type": "demo",
      "id": "demo-1",
      "videoIndex": 0,
      "context": "What to watch for in this demo (1-2 sentences)",
      "transcriptSummary": "Key points covered in the video (2-3 sentences)"
    }},
    // Practice blocks — scaffolded exercises:
    {{
      "type": "practice",
      "id": "practice-1",
      "level": "guided|independent",
      "scenario": "A realistic scenario",
      "question": "What should the learner do/figure out?",
      "hints": ["hint 1", "hint 2"],
      "expectedApproach": "Brief description of the expected approach"
    }},
    // Knowledge check blocks — PRESERVE QUESTIONS AND ANSWERS VERBATIM:
    {{
      "type": "knowledge_check",
      "id": "kc-1",
      "question": "EXACT question from the source material",
      "referenceAnswer": "EXACT answer from the source material",
      "questionKey": "slide-<N>"
    }},
    {{
      "type": "summary",
      "id": "summary-1",
      "keyTakeaways": ["takeaway 1", "takeaway 2", ...],
      "realWorldConnection": "How this applies in real Guidewire projects (2-3 sentences)",
      "nextLessonPreview": "Brief preview of what comes next (optional)"
    }},
    // Assignment block (only if the lesson has hands-on exercises):
    {{
      "type": "assignment",
      "id": "assign-1",
      "description": "What the assignment involves",
      "objectives": ["what learner will practice"]
    }}
  ]
}}

## CRITICAL RULES — READ CAREFULLY

### RULE 1 (HIGHEST PRIORITY): ALL SLIDES MUST BE INCLUDED
Every content slide marked [MUST INCLUDE AS FIGURE] MUST appear as a figure in exactly one concept block.
The required slide numbers are: [{content_slides_str}]
That is {len(content_slides)} slides total. You MUST reference ALL {len(content_slides)} of them.
Create enough concept blocks so that every slide fits naturally. Group 2-3 related slides per concept block.
DO NOT SKIP ANY SLIDE. If you skip even one, your output is INVALID.

### SLIDE CHECKLIST (verify ALL are included before outputting):
""" + "\n".join(f"- Slide {s} — must be in a concept block's figures array" for s in content_slides) + f"""

### OTHER RULES
2. Each concept block's `narrative` should be 200-400 words of rich, flowing prose. Write like a mentor — warm, clear, thorough. Use all detail from narration, notes, and guide content.
3. Knowledge check questions and answers must be PRESERVED VERBATIM from the source
4. Include callouts for tips, warnings, best practices, gotchas, and definitions
5. Place demo blocks near the concept content they relate to (interleave with concepts)
6. Place practice blocks after concept blocks they relate to
7. The `questionKey` for knowledge checks must be "slide-<N>" where N is the question slide number
8. Tables and codeExamples are optional — include only when the source material has them
9. Generate 1-2 practice blocks with scaffolded questions
10. Output ONLY the JSON object — no markdown code fences, no commentary
11. Preserve ALL details from the source — do not summarize away important information"""


# --- Synthesis Engine ---

def _call_gemini(client, prompt: str) -> str:
    """Call Gemini API and return raw text."""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "temperature": 0.3,
            "max_output_tokens": 65536,
            "response_mime_type": "application/json",
        },
    )
    return response.text.strip()


def _call_openai(client, prompt: str) -> str:
    """Call OpenAI API and return raw text."""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You are an expert instructional designer. Output ONLY valid JSON. No markdown fences, no commentary."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
        max_tokens=16384,
        response_format={"type": "json_object"},
    )
    return response.choices[0].message.content.strip()


def synthesize_lesson(
    client,
    lesson: dict,
    kc_items: list[dict],
    transcripts: list[dict],
    guide_pages: list[dict],
    dry_run: bool = False,
) -> dict | None:
    """Synthesize a single lesson using Gemini or OpenAI."""

    slide_context = build_slide_context(lesson)
    transcript_context = build_transcript_context(transcripts)
    guide_context = build_guide_context(guide_pages)
    kc_context = build_kc_context(kc_items)

    prompt = build_synthesis_prompt(
        lesson, slide_context, transcript_context, guide_context, kc_context
    )

    if dry_run:
        print(f"  [DRY RUN] Prompt length: {len(prompt)} chars")
        print(f"  [DRY RUN] Slide context: {len(slide_context)} chars")
        print(f"  [DRY RUN] Transcript context: {len(transcript_context)} chars")
        print(f"  [DRY RUN] Guide context: {len(guide_context)} chars")
        print(f"  [DRY RUN] KC context: {len(kc_context)} chars")
        return None

    call_fn = _call_gemini if AI_PROVIDER == "gemini" else _call_openai

    for attempt in range(MAX_RETRIES):
        try:
            text = call_fn(client, prompt)

            # Clean potential markdown fences
            if text.startswith("```"):
                text = re.sub(r'^```(?:json)?\s*', '', text)
                text = re.sub(r'\s*```$', '', text)

            # Fix invalid JSON escape sequences (e.g. \g, \c from Windows paths)
            # Repeatedly fix until stable — handles cascading escapes
            for _ in range(5):
                fixed = re.sub(r'(?<!\\)\\(?!["\\/bfnrtu\\])', r'\\\\', text)
                if fixed == text:
                    break
                text = fixed

            result = json.loads(text)
            return result

        except json.JSONDecodeError as e:
            print(f"  [WARN] JSON parse error on attempt {attempt + 1}: {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(BACKOFF_BASE * (2 ** attempt))
            else:
                print(f"  [ERROR] Failed to parse response after {MAX_RETRIES} attempts")
                debug_path = OUTPUT_DIR / "_debug" / f"{lesson['lessonId']}_raw.txt"
                debug_path.parent.mkdir(parents=True, exist_ok=True)
                with open(debug_path, "w") as f:
                    f.write(text)
                print(f"  [DEBUG] Raw response saved to {debug_path}")
                return None

        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "rate_limit" in error_str.lower() or "RESOURCE_EXHAUSTED" in error_str:
                wait = BACKOFF_BASE * (2 ** attempt)
                print(f"  [RATE LIMIT] Waiting {wait}s before retry {attempt + 1}...")
                time.sleep(wait)
            else:
                print(f"  [ERROR] API error on attempt {attempt + 1}: {e}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(BACKOFF_BASE)
                else:
                    return None

    return None


def validate_and_fix(result: dict, lesson: dict, kc_items: list[dict]) -> dict:
    """Validate synthesized output and fix common issues."""
    total_slides = lesson.get("totalSlides", 0)
    videos = lesson.get("videos", [])

    # Track which content slides are referenced (only visual/content slides, not demo_video/question/answer)
    NON_FIGURE_TYPES = {
        "title", "objectives", "objectives_review",
        "demo_video", "demo_instruction", "question", "answer",
        "vm_instructions", "exercise",
    }
    content_slide_nums = set()
    for slide in lesson.get("slides", []):
        st = slide.get("slideType", "content")
        if st not in NON_FIGURE_TYPES:
            content_slide_nums.add(slide.get("slideNumber", 0))

    referenced_slides = set()

    blocks = result.get("blocks", [])
    fixed_blocks = []

    for block in blocks:
        btype = block.get("type")

        # Validate figure references
        if btype == "concept":
            figures = block.get("figures", [])
            valid_figures = []
            for fig in figures:
                sn = fig.get("slideNumber", 0)
                if 1 <= sn <= total_slides:
                    valid_figures.append(fig)
                    referenced_slides.add(sn)
            block["figures"] = valid_figures

        # Validate video index
        if btype == "demo":
            vi = block.get("videoIndex", 0)
            if vi < 0 or vi >= len(videos):
                # Skip invalid demo blocks
                continue

        # Validate knowledge check keys
        if btype == "knowledge_check":
            qk = block.get("questionKey", "")
            if not qk.startswith("slide-"):
                # Try to find matching KC by question text
                for kc in kc_items:
                    if kc["question"].strip() == block.get("question", "").strip():
                        block["questionKey"] = f"slide-{kc['questionSlide']}"
                        break

        # Ensure all blocks have IDs
        if not block.get("id"):
            block["id"] = f"{btype}-{len(fixed_blocks) + 1}"

        fixed_blocks.append(block)

    # Check for missing content slides
    missing_slides = content_slide_nums - referenced_slides
    if missing_slides:
        print(f"    [WARN] {len(missing_slides)} content slides NOT referenced: {sorted(missing_slides)}")

    coverage = len(referenced_slides & content_slide_nums)
    total_content = len(content_slide_nums)
    print(f"    Slide coverage: {coverage}/{total_content} content slides referenced")

    result["blocks"] = fixed_blocks
    return result


# --- Checkpoint Management ---

def load_checkpoint() -> dict:
    """Load synthesis checkpoint."""
    if CHECKPOINT_FILE.exists():
        with open(CHECKPOINT_FILE, "r") as f:
            return json.load(f)
    return {"completed": [], "errors": [], "startedAt": datetime.now(timezone.utc).isoformat()}


def save_checkpoint(checkpoint: dict):
    """Save synthesis checkpoint."""
    CHECKPOINT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(CHECKPOINT_FILE, "w") as f:
        json.dump(checkpoint, f, indent=2)


# --- Main ---

def get_lessons_for_chapter(chapter_slug: str) -> list[dict]:
    """Get all lesson files for a chapter."""
    chapter_dir = CONTENT_DIR / chapter_slug
    if not chapter_dir.exists():
        return []

    lessons = []
    for f in sorted(chapter_dir.glob("lesson-*.json")):
        try:
            with open(f, "r") as fh:
                data = json.load(fh)
            lessons.append(data)
        except (json.JSONDecodeError, KeyError):
            continue
    return lessons


def main():
    parser = argparse.ArgumentParser(description="Synthesize structured lessons using OpenAI GPT-4o")
    parser.add_argument("--chapter", type=str, help="Process single chapter (e.g., ch04)")
    parser.add_argument("--lesson", type=int, help="Process single lesson number (requires --chapter)")
    parser.add_argument("--dry-run", action="store_true", help="Preview prompt sizes without calling API")
    parser.add_argument("--force", action="store_true", help="Re-synthesize even if already completed")
    args = parser.parse_args()

    if args.lesson and not args.chapter:
        parser.error("--lesson requires --chapter")

    # Determine chapters to process
    if args.chapter:
        chapters = [args.chapter]
    else:
        chapters = CHAPTERS_WITH_CONTENT

    # Load shared data
    all_kcs = load_knowledge_checks()

    # Initialize AI client (skip for dry run)
    client = None
    if not args.dry_run:
        client = get_ai_client()

    # Load checkpoint
    checkpoint = load_checkpoint()
    completed_set = set(checkpoint.get("completed", []))

    total_processed = 0
    total_errors = 0
    total_skipped = 0

    print(f"\n{'='*60}")
    print(f"  Guidewire Academy Lesson Synthesizer")
    print(f"  Chapters: {', '.join(chapters)}")
    print(f"  Mode: {'DRY RUN' if args.dry_run else 'SYNTHESIS'}")
    print(f"  Already completed: {len(completed_set)} lessons")
    print(f"{'='*60}\n")

    for chapter_slug in chapters:
        lessons = get_lessons_for_chapter(chapter_slug)
        if not lessons:
            print(f"[{chapter_slug}] No lessons found, skipping")
            continue

        # Filter to single lesson if specified
        if args.lesson:
            lessons = [l for l in lessons if l.get("lessonNumber") == args.lesson]
            if not lessons:
                print(f"[{chapter_slug}] Lesson {args.lesson} not found")
                continue

        print(f"\n[{chapter_slug}] Processing {len(lessons)} lessons...")

        # Create output directory
        out_dir = OUTPUT_DIR / chapter_slug
        out_dir.mkdir(parents=True, exist_ok=True)

        for lesson in lessons:
            lesson_id = lesson["lessonId"]
            lesson_num = lesson["lessonNumber"]
            title = lesson["title"]

            # Skip if already completed (unless --force)
            if lesson_id in completed_set and not args.force:
                print(f"  [{lesson_id}] Already synthesized, skipping")
                total_skipped += 1
                continue

            print(f"  [{lesson_id}] {title}")

            # Load raw materials
            kc_items = all_kcs.get(lesson_id, [])
            source_folder = lesson.get("sourceFolder")
            transcripts = load_transcripts_for_lesson(chapter_slug, source_folder)
            guide_pages = load_guide_pages(chapter_slug, title)

            print(f"    Slides: {lesson['totalSlides']}, Videos: {len(lesson.get('videos', []))}, "
                  f"KCs: {len(kc_items)}, Transcripts: {len(transcripts)}, "
                  f"Guide pages: {len(guide_pages)}")

            # Synthesize
            result = synthesize_lesson(
                client, lesson, kc_items, transcripts, guide_pages,
                dry_run=args.dry_run,
            )

            if args.dry_run:
                total_processed += 1
                continue

            if result is None:
                print(f"    [ERROR] Synthesis failed")
                total_errors += 1
                checkpoint.setdefault("errors", []).append(lesson_id)
                save_checkpoint(checkpoint)
                continue

            # Validate and fix
            result = validate_and_fix(result, lesson, kc_items)

            # Build full output
            output = {
                "lessonId": lesson_id,
                "chapterId": lesson["chapterId"],
                "chapterSlug": chapter_slug,
                "lessonNumber": lesson_num,
                "title": result.get("title", title),
                "subtitle": result.get("subtitle", ""),
                "synthesizedAt": datetime.now(timezone.utc).isoformat(),
                "estimatedMinutes": result.get("estimatedMinutes", lesson.get("estimatedMinutes", 30)),
                "blocks": result.get("blocks", []),
                "videos": lesson.get("videos", []),
            }

            # Write output
            out_path = out_dir / f"lesson-{lesson_num:02d}.json"
            with open(out_path, "w") as f:
                json.dump(output, f, indent=2, ensure_ascii=False)

            block_types = [b.get("type") for b in output["blocks"]]
            print(f"    [OK] {len(output['blocks'])} blocks: {', '.join(set(block_types))}")
            print(f"    Written to {out_path}")

            # Update checkpoint
            completed_set.add(lesson_id)
            checkpoint["completed"] = sorted(completed_set)
            checkpoint["lastUpdated"] = datetime.now(timezone.utc).isoformat()
            save_checkpoint(checkpoint)

            total_processed += 1

            # Rate limiting
            time.sleep(RATE_LIMIT_DELAY)

    # Summary
    print(f"\n{'='*60}")
    print(f"  Synthesis Complete")
    print(f"  Processed: {total_processed}")
    print(f"  Skipped: {total_skipped}")
    print(f"  Errors: {total_errors}")
    print(f"  Total completed: {len(completed_set)}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
