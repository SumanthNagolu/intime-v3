#!/usr/bin/env python3
"""
Comprehensive cleanup script for Guidewire academy lesson content.
Fixes typos, formatting, video references, and empty fields from PPT extraction.

Run: python3 scripts/cleanup-lesson-content.py
     python3 scripts/cleanup-lesson-content.py --dry-run   (preview changes)
"""

import json
import os
import sys
import re
import glob
from copy import deepcopy
from collections import defaultdict

CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'academy', 'guidewire', 'content')

# ============================================================
# 1. TYPO CORRECTIONS
# Common OCR/extraction typos found in notes and originalNotes
# ============================================================

TYPO_FIXES = {
    # Missing spaces (from OCR line-joining)
    'toillegally': 'to illegally',
    'applicatiom': 'application',
    'Consideratiom': 'Consideration',
    'configuratiom': 'configuration',
    'notin stalled': 'not installed',
    'forwhich': 'for which',
    'thedatabase': 'the database',
    'aninstance': 'an instance',
    'Gosuresources': 'Gosu resources',
    'applicationsare': 'applications are',
    'data modelentity': 'data model entity',
    'cover ables': 'coverables',
    'applicatio m': 'application',
    # OCR question mark misreads
    'injuredQ': 'injured?',
    'badlyQ': 'badly?',
    # OCR comma/character errors
    'ClaimFon,vard': 'ClaimForward',
    # Hyphenation errors
    'pre- existing': 'pre-existing',
    'pre- qualify': 'pre-qualify',
    'pre- built': 'pre-built',
    'out- of': 'out-of',
    'client- side': 'client-side',
    'double- click': 'double-click',
    # Missing spaces around punctuation
    'server-': 'server.',
    'configured-': 'configured.',
    'user-\n': 'user.\n',
    # Encoding artifacts
    '\u000b': '\n',  # Vertical tab → newline
    '\u00a0': ' ',  # Non-breaking space → regular space
    # Extra spaces
    '  ': ' ',  # Double space (will be applied repeatedly)
    # Common extraction errors in notes
    'PolicyCenter is utilizes': 'PolicyCenter utilizes',
    'forthe': 'for the',
    'ofthe': 'of the',
    'tothe': 'to the',
    'inthe': 'in the',
    'isthe': 'is the',
    'onthe': 'on the',
    'withthe': 'with the',
    'fromthe': 'from the',
    'atthe': 'at the',
    'asthe': 'as the',
    'bythe': 'by the',
    'andthe': 'and the',
    'ofan': 'of an',
    'thatmust': 'that must',
    'aset of': 'a set of',
    'arow': 'a row',
    # Common Guidewire-specific fixes
    'ClaimsCenter': 'ClaimCenter',
    'Billing Center': 'BillingCenter',
    'Claim Center': 'ClaimCenter',
    'Policy Center': 'PolicyCenter',
    'ContactManager': 'Contact Manager',
}

# Regex-based fixes for patterns that need context
REGEX_FIXES = [
    # Fix periods at end followed by run-on (e.g., "word-\nNext" → "word.\nNext")
    (r'(\w)-\s*\n\s*([A-Z])', r'\1.\n\2'),
    # Fix "word.Word" without space
    (r'(\w)\.([A-Z][a-z])', r'\1. \2'),
    # Fix multiple consecutive newlines
    (r'\n{3,}', '\n\n'),
    # Fix leading/trailing whitespace on lines
    (r'[ \t]+\n', '\n'),
    # Fix "  " double spaces (iterative)
    (r'  +', ' '),
]

# ============================================================
# 2. OCR TEXT CLEANUP
# Clean common OCR artifacts from ocrText field
# ============================================================

OCR_JUNK_PATTERNS = [
    r'-S\s*SS\s*55\s*555-555?\s*-?=?5?-?-?—?',  # Common border artifact
    r'-SS\s*SS\s*e\s*e\s*e\s*e\s*H',  # Common border artifact
    r'BoD\s*DD\s*DD\s*DS\s*SSS\s*oe',  # Common border artifact
    r'Se\s*see\s*aS\s*SSeS',  # Common border artifact
    r'\ben\b(?=\s*$)',  # Trailing "en" artifact
    r'\bee\b(?=\s*$)',  # Trailing "ee" artifact
    r'¢',  # Cent sign used as bullet point → bullet
]

# ============================================================
# 3. TITLE INFERENCE
# Infer slide titles from ocrText when title is empty
# ============================================================

def infer_title_from_ocr(slide):
    """Try to extract a meaningful title from ocrText."""
    ocr = slide.get('ocrText', '').strip()
    if not ocr:
        return None

    stype = slide.get('slideType', '')

    # For known types, use standard titles
    if stype == 'title':
        # First line of OCR is usually the title
        first_line = ocr.split('\n')[0].strip()
        if first_line and len(first_line) < 100:
            return clean_ocr_title(first_line)

    if stype == 'objectives':
        return 'Learning Objectives'

    if stype == 'objectives_review':
        return 'Key Takeaways'

    if stype in ('question',):
        # Extract question text
        match = re.search(r'(?:Question|—)\s*(.+?)(?:\n|$)', ocr)
        if match:
            q = match.group(1).strip()
            if len(q) > 10:
                return f'Knowledge Check'

    if stype == 'answer':
        return 'Answer'

    if stype == 'exercise':
        return 'Student Exercise'

    if stype == 'demo_instruction':
        return 'Demonstration'

    if stype == 'demo_video':
        return 'Demo Video'

    if stype == 'vm_instructions':
        return 'Lab Environment Setup'

    # For content slides, try to extract from first line patterns
    # Pattern: "| Title G" or "| Title" (common Guidewire PPT format)
    match = re.match(r'\|?\s*(.+?)(?:\s+[Gg](?:[ia&])?|\s*$)', ocr.split('\n')[0])
    if match:
        title = match.group(1).strip()
        if 5 < len(title) < 80 and not title.startswith(('¢', '*', '+', '-')):
            return clean_ocr_title(title)

    # Try first line if it's short enough to be a title
    first_line = ocr.split('\n')[0].strip()
    # Remove common prefix patterns
    first_line = re.sub(r'^\|\s*', '', first_line).strip()
    first_line = re.sub(r'\s+[Gg][ia&]?\s*$', '', first_line).strip()

    if 3 < len(first_line) < 80 and not first_line.startswith(('¢', '*', '+', '-', '(')):
        return clean_ocr_title(first_line)

    return None


def clean_ocr_title(title):
    """Clean up an OCR-extracted title."""
    # Remove common artifacts
    title = re.sub(r'\s+[Gg][ia&]?\s*$', '', title)
    title = re.sub(r'^\|\s*', '', title)
    title = re.sub(r'\s+i$', '', title)
    title = title.strip()

    # Remove if it's just noise
    if len(title) < 3:
        return None
    if all(c in '|¢-=_.*+' for c in title):
        return None

    return title


# ============================================================
# 4. VIDEO INDEX FIXER
# Add demoVideoIndex to demo_instruction slides
# ============================================================

def fix_demo_video_indices(slides):
    """Add demoVideoIndex to demo_instruction slides that lack them."""
    changes = 0
    demo_counter = 0

    for i, slide in enumerate(slides):
        stype = slide.get('slideType', '')

        if stype == 'demo_instruction':
            if 'demoVideoIndex' not in slide:
                slide['demoVideoIndex'] = demo_counter
                changes += 1
            else:
                demo_counter = slide['demoVideoIndex']
            demo_counter += 1
        elif stype == 'demo_video':
            # demo_video follows demo_instruction, don't increment again
            pass

    return changes


# ============================================================
# 5. VIDEO COUNT VALIDATION
# Ensure video array matches demo slides
# ============================================================

def validate_videos(data):
    """Validate video references and fix inconsistencies."""
    issues = []
    slides = data.get('slides', [])
    videos = data.get('videos', [])

    demo_video_count = sum(1 for s in slides if s.get('slideType') == 'demo_video')
    demo_instruction_count = sum(1 for s in slides if s.get('slideType') == 'demo_instruction')

    if len(videos) != demo_video_count and demo_video_count > 0:
        issues.append(f'Video array has {len(videos)} entries but {demo_video_count} demo_video slides')

    return issues


# ============================================================
# 6. QUESTION DATA EXTRACTION
# Extract Q&A from question/answer slide pairs
# ============================================================

def extract_question_data(slides):
    """Find question slides without questionData and extract from ocrText."""
    changes = 0

    for i, slide in enumerate(slides):
        if slide.get('slideType') != 'question':
            continue
        if slide.get('questionData'):
            continue

        # Try to extract question from ocrText
        ocr = slide.get('ocrText', '')
        q_match = re.search(r'(?:—|—\s*)(.+?)(?:\n|$)', ocr)
        if not q_match:
            # Try "Question" followed by text
            q_match = re.search(r'Question\s*[Gg]?\s*\n\s*[,._~—]*\s*(?:—\s*)?(.+?)(?:\n|$)', ocr)

        if q_match:
            question = q_match.group(1).strip()
            question = re.sub(r'^[,._~—\s]+', '', question)

            # Look for answer in next slide
            answer = ''
            if i + 1 < len(slides) and slides[i + 1].get('slideType') == 'answer':
                answer_ocr = slides[i + 1].get('ocrText', '')
                # Extract answer text (usually after the question repeat)
                # Look for lines that aren't the question text
                answer_lines = []
                for line in answer_ocr.split('\n'):
                    line = line.strip()
                    if not line or line.startswith(('Answer', 'Question', '-S', 'BoD', 'Se see')):
                        continue
                    if line in ('¢', '¢4', '7', 'oY"', 'Fa', '7a', 'Ka'):
                        continue
                    # Skip repeated question
                    if question[:20] in line:
                        continue
                    # Skip OCR noise
                    if all(c in '|-=_.¢*+oe SsHDdBe' for c in line):
                        continue
                    if len(line) > 5:
                        answer_lines.append(line)

                answer = ' '.join(answer_lines)
                # Clean up common artifacts
                answer = re.sub(r'^(The correct (?:answer|response) is\s*)', '', answer)
                answer = answer.strip()

            if question and len(question) > 10:
                slide['questionData'] = {
                    'question': question,
                    'answer': answer if answer else 'See instructor notes for the answer.',
                }
                changes += 1

    return changes


# ============================================================
# 7. NOTES CLEANUP FROM originalNotes
# Copy enriched originalNotes to notes when notes is empty
# ============================================================

def fill_empty_notes_from_original(slides):
    """If notes is empty but originalNotes has content, copy it."""
    changes = 0
    for slide in slides:
        if not slide.get('notes') and slide.get('originalNotes', '').strip():
            slide['notes'] = slide['originalNotes'].strip()
            changes += 1
    return changes


# ============================================================
# MAIN CLEANUP
# ============================================================

def apply_text_fixes(text):
    """Apply all typo and formatting fixes to a text string."""
    if not text:
        return text

    original = text

    # Apply direct replacements
    for old, new in TYPO_FIXES.items():
        text = text.replace(old, new)

    # Apply regex fixes
    for pattern, replacement in REGEX_FIXES:
        text = re.sub(pattern, replacement, text)

    # Trim
    text = text.strip()

    return text


def clean_ocr_text(text):
    """Clean OCR artifacts from ocrText field."""
    if not text:
        return text

    original = text

    for pattern in OCR_JUNK_PATTERNS:
        if pattern == '¢':
            # Replace ¢ bullet with proper bullet
            text = text.replace('¢', '\u2022')
        else:
            text = re.sub(pattern, '', text)

    # Clean up resulting whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()

    return text


def cleanup_lesson(filepath, dry_run=False):
    """Clean up a single lesson JSON file."""
    with open(filepath) as f:
        data = json.load(f)

    original = json.dumps(data)
    changes = defaultdict(int)
    details = []

    lesson_id = data.get('lessonId', os.path.basename(filepath))

    for slide in data.get('slides', []):
        slide_num = slide.get('slideNumber', '?')

        # 1. Fix typos in text fields
        for field in ['notes', 'originalNotes', 'narration']:
            old_val = slide.get(field, '')
            if old_val:
                new_val = apply_text_fixes(old_val)
                if new_val != old_val:
                    slide[field] = new_val
                    changes[f'typo_fix_{field}'] += 1

        # 2. Clean OCR text
        old_ocr = slide.get('ocrText', '')
        if old_ocr:
            new_ocr = clean_ocr_text(old_ocr)
            if new_ocr != old_ocr:
                slide['ocrText'] = new_ocr
                changes['ocr_cleaned'] += 1

        # 3. Fill empty titles
        if not slide.get('title'):
            inferred = infer_title_from_ocr(slide)
            if inferred:
                slide['title'] = inferred
                changes['title_inferred'] += 1

        # 4. Clean up existing titles
        if slide.get('title'):
            old_title = slide['title']
            new_title = apply_text_fixes(old_title)
            if new_title != old_title:
                slide['title'] = new_title
                changes['title_cleaned'] += 1

    # 5. Fill empty notes from originalNotes
    notes_filled = fill_empty_notes_from_original(data.get('slides', []))
    changes['notes_from_original'] = notes_filled

    # 6. Fix demo video indices
    video_idx_fixes = fix_demo_video_indices(data.get('slides', []))
    changes['video_index_fixed'] = video_idx_fixes

    # 7. Extract question data
    q_extracted = extract_question_data(data.get('slides', []))
    changes['questions_extracted'] = q_extracted

    # 8. Validate videos
    video_issues = validate_videos(data)
    if video_issues:
        changes['video_issues'] = len(video_issues)
        for issue in video_issues:
            details.append(f'  VIDEO: {issue}')

    # Check if anything changed
    new_json = json.dumps(data)
    if new_json == original:
        return None, {}

    total_changes = sum(changes.values())

    if not dry_run:
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write('\n')

    return total_changes, changes, details


def main():
    dry_run = '--dry-run' in sys.argv
    verbose = '--verbose' in sys.argv or '-v' in sys.argv

    if dry_run:
        print('=== DRY RUN MODE (no files will be modified) ===\n')

    all_files = sorted(glob.glob(os.path.join(CONTENT_DIR, '**/lesson-*.json'), recursive=True))

    print(f'Found {len(all_files)} lesson files to process\n')

    total_stats = defaultdict(int)
    files_changed = 0
    all_details = []

    for filepath in all_files:
        rel_path = os.path.relpath(filepath, CONTENT_DIR)
        result = cleanup_lesson(filepath, dry_run=dry_run)

        if result is None or result[0] is None:
            continue

        total_changes, changes, details = result
        if total_changes > 0:
            files_changed += 1

            if verbose:
                print(f'  {rel_path}: {total_changes} changes')
                for k, v in sorted(changes.items()):
                    if v > 0:
                        print(f'    {k}: {v}')
                for d in details:
                    print(d)

            for k, v in changes.items():
                total_stats[k] += v
            all_details.extend(details)

    print(f'\n{"="*50}')
    print(f'CLEANUP {"PREVIEW" if dry_run else "COMPLETE"}')
    print(f'{"="*50}')
    print(f'Files processed: {len(all_files)}')
    print(f'Files {"would be " if dry_run else ""}changed: {files_changed}')
    print(f'\nChanges by type:')
    for k, v in sorted(total_stats.items(), key=lambda x: -x[1]):
        if v > 0:
            print(f'  {k}: {v}')

    total = sum(total_stats.values())
    print(f'\nTotal changes: {total}')

    if all_details:
        print(f'\nIssues to review:')
        for d in all_details[:20]:
            print(d)
        if len(all_details) > 20:
            print(f'  ... and {len(all_details) - 20} more')

    if dry_run:
        print(f'\nRun without --dry-run to apply changes.')


if __name__ == '__main__':
    main()
