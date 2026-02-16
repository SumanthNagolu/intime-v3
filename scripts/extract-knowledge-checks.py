#!/usr/bin/env python3
"""
Extract knowledge check Q&A pairs from lesson slide JSONs into a centralized file.

Reads all lesson JSON files in public/academy/guidewire/content/,
finds question/answer slide pairs, cleans the OCR text, and outputs
a centralized knowledge-checks.json organized by chapter and lesson.

Usage:
    python3 scripts/extract-knowledge-checks.py
"""

import json
import os
import re
import glob
from pathlib import Path

CONTENT_DIR = Path("public/academy/guidewire/content")
OUTPUT_FILE = Path("public/academy/guidewire/knowledge-checks.json")

# Known OCR footer/watermark noise patterns
NOISE_PATTERNS = [
    r'SoS\s+oD\s+DD\s+DDS\s+De\s+Say',
    r'Sop\s+DD\s+DD\s+SDSS\s+oe',
    r'-S\s+SS\s+55\s+555',
    r'-SS\s+SS\s+e\s+e\s+e',
    r'~\s*SSS\s+SS\s+S?HH',
    r'SS\s+oe\s+ee\s+oe',
    r'SS\s+Se\s+ee\s+eee',
    r'SS\s+Se\s+SS\s+Se',
    r'SS\s+Se\s+SSS\s+Se',
    r'-S\s+e\s+S\s+e\s+e\s+H',
    r'-SS\s+SS\s+e\s+e',
    r'ee\s*$',  # trailing "ee" on its own line
]
NOISE_RE = re.compile('|'.join(NOISE_PATTERNS))


def is_noise_line(line: str) -> bool:
    """Check if a line is OCR noise (footer/watermark artifacts)."""
    stripped = line.strip()
    if not stripped:
        return False

    # Explicit noise pattern match
    if NOISE_RE.search(stripped):
        return True

    # Lines that are just short combos of known OCR noise chars
    if len(stripped) >= 3:
        noise_chars = set('SsHhoeDBbDdOo-~=_.¢0123456789 ')
        if all(c in noise_chars for c in stripped):
            return True

    # Detect lines that are mostly uppercase S/O/D/B combos (watermark OCR)
    # e.g., "SOOO ODDDSDoOODDODOoOoS", "BoD DD DD DS SSS oe", "sooo oOo oOo"
    if len(stripped) >= 6:
        sodb_chars = sum(1 for c in stripped if c in 'SODBsodbOo')
        alpha_chars = sum(1 for c in stripped if c.isalpha())
        if alpha_chars > 0 and sodb_chars / alpha_chars > 0.7:
            # Most alpha chars are S/O/D/B - likely watermark
            return True

    # Single char/token noise
    if stripped in ('Gi', 'G', 'G&G', 'a', '¢', '4', '7', 'x', 'o', '?', '!', 'I', '1'):
        return True

    return False


def clean_ocr_text(text: str) -> str:
    """Full OCR text cleaning pipeline."""
    # 1. Remove Question/Answer header
    text = re.sub(r'^(Question|Answer)\s*(G(&G)?i?|Gi?|a)?\s*\n*', '', text, flags=re.IGNORECASE)

    # 2. Remove noise lines
    lines = text.split('\n')
    cleaned_lines = [line for line in lines if not is_noise_line(line)]
    text = '\n'.join(cleaned_lines)

    # 3. Remove leading OCR bullet artifacts: ,— —, _- —, ,~ —, etc.
    text = re.sub(r'^[,_]\s*[—~\-]+\s*[—\-]*\s*', '', text, flags=re.MULTILINE)
    # Also: ,— —  or  _~ —  at line start
    text = re.sub(r'^[,_.]\s*—\s*—?\s*', '', text, flags=re.MULTILINE)

    # 4. Remove continuation artifacts at start of lines: Fa, Pa, Ka, Ra, ie, oo
    text = re.sub(r'^\s*(Fa|Pa|Ka|Ra|ie|oo)\s+', '', text, flags=re.MULTILINE)

    # 5. Remove isolated single-char noise lines
    text = re.sub(r'^\s*[¢47ox"?:]\s*$', '', text, flags=re.MULTILINE)

    # 6. Remove isolated "of" on its own line (OCR wrapping artifact)
    text = re.sub(r'^\s*of\s*$', '', text, flags=re.MULTILINE)

    # 7. Remove inline trailing noise (watermark at end of real lines)
    # Patterns like "...text.\nSOOO ODDDSDoOODDODOoOoS" or "...text\nBoD DD DD DS SSS oe"
    text = re.sub(r'\n[SODBsodbOo\s\-~=_.¢0-9]{6,}$', '', text, flags=re.MULTILINE)
    # Also remove trailing watermark fragments on lines with real text
    text = re.sub(r'[SODBsodbOo\s]{8,}$', '', text, flags=re.MULTILINE)

    # 8. Clean up excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)

    # 9. Strip each line
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join(lines)

    return text.strip()


def extract_question_text(ocr_text: str) -> str:
    """Extract the question from a question slide's OCR text."""
    text = clean_ocr_text(ocr_text)
    # Remove trailing isolated noise chars
    text = re.sub(r'\s*[¢47]+\s*$', '', text)
    return text.strip()


def extract_answer_from_answer_slide(ocr_text: str, question_text: str) -> str:
    """Extract the answer from an answer slide's OCR text.

    The answer slide typically repeats the question, then has the answer below.
    We need to find where the actual answer begins after the repeated question.
    """
    text = clean_ocr_text(ocr_text)
    lines = [l for l in text.split('\n') if l.strip()]

    if not question_text or not lines:
        return text.strip()

    # Build a set of significant words from the question (3+ char words)
    q_words = set(w.lower() for w in re.findall(r'\w{3,}', question_text))

    if len(q_words) < 2:
        return text.strip()

    # Find the last line that's part of the question repeat
    # A line is "part of the question" if it shares significant words with the question
    last_q_line = -1
    for i, line in enumerate(lines):
        line_words = set(w.lower() for w in re.findall(r'\w{3,}', line))
        overlap = line_words & q_words
        # If at least 2 significant words match AND we're still in the first half-ish
        if len(overlap) >= 2:
            last_q_line = i

    if last_q_line >= 0 and last_q_line < len(lines) - 1:
        answer_lines = lines[last_q_line + 1:]
        answer = '\n'.join(answer_lines).strip()
        if len(answer) > 3:
            return answer

    # Fallback: return full cleaned text
    return text.strip()


def process_lesson(filepath: str) -> list:
    """Process a single lesson JSON file and extract Q&A pairs."""
    with open(filepath, 'r') as f:
        data = json.load(f)

    slides = data.get('slides', [])
    qa_pairs = []

    i = 0
    while i < len(slides):
        slide = slides[i]
        if slide.get('slideType') == 'question':
            # Check if already has questionData (like ch04/lesson-01)
            if slide.get('questionData'):
                qa_pairs.append({
                    'questionSlide': slide['slideNumber'],
                    'answerSlide': slides[i + 1]['slideNumber'] if i + 1 < len(slides) and slides[i + 1].get('slideType') == 'answer' else None,
                    'question': slide['questionData']['question'],
                    'answer': slide['questionData']['answer'],
                    'source': 'questionData',
                })
                if i + 1 < len(slides) and slides[i + 1].get('slideType') == 'answer':
                    i += 2
                else:
                    i += 1
                continue

            # Extract from OCR
            ocr_q = slide.get('ocrText', '')
            question_text = extract_question_text(ocr_q)

            answer_text = ''
            answer_slide_num = None

            if i + 1 < len(slides) and slides[i + 1].get('slideType') == 'answer':
                answer_slide = slides[i + 1]
                answer_slide_num = answer_slide['slideNumber']
                ocr_a = answer_slide.get('ocrText', '')
                answer_text = extract_answer_from_answer_slide(ocr_a, question_text)

            if question_text and answer_text:
                qa_pairs.append({
                    'questionSlide': slide['slideNumber'],
                    'answerSlide': answer_slide_num,
                    'question': question_text,
                    'answer': answer_text,
                    'source': 'ocr',
                })

            # Skip answer slide
            if i + 1 < len(slides) and slides[i + 1].get('slideType') == 'answer':
                i += 2
            else:
                i += 1
        else:
            i += 1

    return qa_pairs


def get_lesson_id(chapter_slug: str, lesson_filename: str) -> str:
    """Generate lesson ID: ch04/lesson-01.json -> ch04-l01"""
    match = re.match(r'lesson-(\d+)\.json', lesson_filename)
    if match:
        num = int(match.group(1))
        return f"{chapter_slug}-l{num:02d}"
    return f"{chapter_slug}-{lesson_filename.replace('.json', '')}"


def main():
    print("Extracting knowledge checks from lesson slides...")
    print(f"Content directory: {CONTENT_DIR}")
    print()

    knowledge_checks = {}
    total_questions = 0
    total_lessons_with_kc = 0
    quality_issues = []

    chapter_dirs = sorted(glob.glob(str(CONTENT_DIR / "ch*")))

    for chapter_dir in chapter_dirs:
        chapter_slug = os.path.basename(chapter_dir)
        lesson_files = sorted(glob.glob(os.path.join(chapter_dir, "lesson-*.json")))

        chapter_questions = 0

        for lesson_file in lesson_files:
            lesson_filename = os.path.basename(lesson_file)
            lesson_id = get_lesson_id(chapter_slug, lesson_filename)

            qa_pairs = process_lesson(lesson_file)

            if qa_pairs:
                knowledge_checks[lesson_id] = []
                for idx, pair in enumerate(qa_pairs):
                    qid = f"{lesson_id}-q{idx + 1:02d}"
                    entry = {
                        'id': qid,
                        'question': pair['question'],
                        'answer': pair['answer'],
                        'questionSlide': pair['questionSlide'],
                        'answerSlide': pair['answerSlide'],
                        'source': pair['source'],
                    }
                    knowledge_checks[lesson_id].append(entry)

                    # Flag quality issues
                    if len(pair['answer']) < 10:
                        quality_issues.append(f"  {qid}: Short answer ({len(pair['answer'])} chars): {repr(pair['answer'][:60])}")
                    if any(p in pair['question'] for p in ['SoS', 'Sop', 'SSS', 'DDS']):
                        quality_issues.append(f"  {qid}: Noise in question: {repr(pair['question'][:60])}")
                    if any(p in pair['answer'] for p in ['SoS', 'Sop', 'SSS', 'DDS']):
                        quality_issues.append(f"  {qid}: Noise in answer: {repr(pair['answer'][:60])}")

                chapter_questions += len(qa_pairs)
                total_lessons_with_kc += 1

        if chapter_questions > 0:
            lesson_count = sum(1 for lid in knowledge_checks if lid.startswith(chapter_slug))
            print(f"  {chapter_slug}: {chapter_questions} questions from {lesson_count} lessons")
            total_questions += chapter_questions

    # Build output
    output = {
        '_meta': {
            'description': 'Centralized knowledge check questions extracted from Guidewire academy slides',
            'generatedAt': __import__('datetime').datetime.now().isoformat(),
            'totalQuestions': total_questions,
            'totalLessons': total_lessons_with_kc,
            'source': 'scripts/extract-knowledge-checks.py',
        },
        'lessons': knowledge_checks,
    }

    os.makedirs(OUTPUT_FILE.parent, exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print()
    print(f"Total: {total_questions} questions from {total_lessons_with_kc} lessons")
    print(f"Written to: {OUTPUT_FILE}")

    if quality_issues:
        print(f"\n--- Quality issues ({len(quality_issues)}) ---")
        for issue in quality_issues[:20]:
            print(issue)
        if len(quality_issues) > 20:
            print(f"  ... and {len(quality_issues) - 20} more")

    # Print samples
    print("\n--- Sample Q&A pairs ---")
    sample_count = 0
    for lesson_id, questions in knowledge_checks.items():
        for q in questions[:1]:
            if sample_count >= 8:
                break
            print(f"\n[{q['id']}] (slide {q['questionSlide']})")
            print(f"  Q: {q['question'][:150]}")
            print(f"  A: {q['answer'][:150]}")
            sample_count += 1
        if sample_count >= 8:
            break


if __name__ == '__main__':
    main()
