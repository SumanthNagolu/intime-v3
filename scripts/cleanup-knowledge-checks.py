#!/usr/bin/env python3
"""
Clean up corrupted knowledge check questions in both:
  - Synthesized content (knowledge_check blocks)
  - Extracted content (questionData fields + ocrText on question/answer slides)

Fixes OCR artifacts, missing spaces, corrupted starts, and junk tails.
"""

import json
import glob
import os
import re
import sys

CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'academy', 'guidewire', 'content')
SYNTH_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'academy', 'guidewire', 'synthesized')

# =============================================================================
# OCR junk patterns - entire lines that are pure noise
# =============================================================================
OCR_JUNK_LINE_PATTERNS = [
    r'^Sooo\s+oooe?\s+sooo\s+oOo.*$',
    r'^ee\s+ee\s+a$',
    r'^SS\s+eee\s+eee.*$',
    r'^SSeS\s+ee\s+ee.*$',
    r'^sSesoe.*$',
    r'^Se\s+Sess\s+e\s+ese.*$',
    r'^~-\s+SSS\s+\d+.*$',
    r'^oOo+\w*$',
    r'^[oO]+[oO\w]*[MmSs]+$',    # oOooooMoS variants
    r'^Sooo\s+ooD\b.*$',          # Sooo ooD Oooo junk
    r'^L$',                        # standalone L
    r'^[Cc]ommi\s*n\s+plan$',
    r'^en$',                          # standalone "en"
    r'^ih$',                          # standalone "ih"
    r'^[¢\s]+$',                      # lines of only ¢ and whitespace
    r'^\d$',                          # single digit lines (4, 7, etc.)
    r'^[xy]$',                        # single x or y
    r'^[:\s]+$',                      # just colons/whitespace
    r'^ra$',
    r'^ow$',
    r'^oo$',
    r'^r$',
    r'^kL\.\s*$',                     # "kL."
    r'^Gt\s+F\s+Search.*$',          # OCR of UI screenshot
    r'^"\s*\d+$',                     # '" 1', '" 2' etc.
    r'^do\s+to\s+have\b',            # garbled line continuation
]

# Compile all junk patterns
JUNK_REGEXES = [re.compile(p, re.IGNORECASE) for p in OCR_JUNK_LINE_PATTERNS]

# =============================================================================
# Lines that start with OCR noise prefixes - strip the prefix, keep rest
# The prefix pattern → replacement mapping
# =============================================================================
LINE_PREFIX_STRIP = [
    (r"^,\s*7\s*~?\s*—?\s*", ''),  # ", 7 —" or ",7~ —" prefix
    (r"^,~\s*—?\s*", ''),        # ",~ —" prefix
    (r"^,-\s*—?\s*", ''),        # ",- —" prefix
    (r"^~~\s*—?\s*", ''),        # "~~ —" prefix
    (r"^___?\s+", ''),            # "___ " prefix
    (r"^__\s+", ''),              # "__ " prefix
    (r"^_~\s*—?\s*", ''),        # "_~ —" prefix
    (r"^_—\s*—?\s*", ''),        # "_— —" prefix
    (r"^,—\s*—?\s*", ''),        # ",— —" prefix
    (r"^_'\s+_\s+", ''),         # "_' _ " prefix
    (r"^_\s+_\s+", ''),          # "_ _ " prefix
    (r"^7~\s*~?\s*", ''),        # "7~ ~" prefix
    (r"^~\s+~?\s*Of\b", 'Of'),   # "~ ~ Of" → "Of"
    (r"^~\s+~?\s*", ''),         # "~ ~" prefix
    (r"^—\s+(?=[A-Z])", ''),     # "— Of" → "Of"
    (r"^ae\s+", ''),             # "ae " prefix (OCR noise)
    (r"^e\s+(?=[A-Z])", ''),     # "e " followed by capital (OCR noise, not a word)
    (r"^_\s+What\b", 'What'),    # "_ What" → "What"
    (r"^_\s+", ''),              # "_ " prefix
    (r"^;\s+", ''),              # "; " prefix (OCR noise)
]

LINE_PREFIX_COMPILED = [(re.compile(p), r) for p, r in LINE_PREFIX_STRIP]

# =============================================================================
# Full-line junk that appears as continuation (Yo, yn, Pa, etc.)
# These lines contain useful text AFTER the noise prefix
# =============================================================================
LINE_CONTINUATION_NOISE = [
    (r'^yn\s+', ''),             # "yn " prefix
    (r'^Pa\s+', ''),             # "Pa " prefix
    (r'^aan\s+', ''),            # "aan " prefix
    (r'^Oo"\s+', ''),            # 'Oo" ' prefix
    (r'^v7\s+', ''),             # "v7 " prefix
    (r"^7'\s+", ''),             # "7' " prefix
    (r'^ie\s+', ''),             # "ie " prefix
    (r'^Yo\s+', ''),             # "Yo " prefix
    (r'^ra\s+', ''),             # "ra " prefix
    (r'^ow\s+', ''),             # "ow " prefix
    (r"^,'\s+", ''),             # ",'" prefix on continuation lines
    (r"^,\s+__\s+", ''),         # ", __" prefix
]

LINE_CONT_COMPILED = [(re.compile(p), r) for p, r in LINE_CONTINUATION_NOISE]

# =============================================================================
# Corrupted word starts (at beginning of entire text)
# More specific patterns first!
# =============================================================================
CORRUPTED_STARTS = [
    (r"^'satransaction\b", "Is a transaction"),
    (r"^'sa\b", "Is a "),
    (r"^'sitcommon\b", "Is it common"),
    (r"^'si\b", "Is i"),
    (r"^'fno\b", "If no"),
    (r"^'fan\b", "If an"),
    (r"^'fyou\b", "If you"),
    (r"^'fthere\b", "If there"),
    (r"^'f", "If "),
    (r"^fahold\b", "If a hold"),
    (r"^fa\b", "If a"),
]

# =============================================================================
# Missing spaces - common OCR run-together words
# =============================================================================
MISSING_SPACE_FIXES = {
    # A/An patterns
    'Acustomer': 'A customer',
    'Acheck': 'A check',
    'ADetail': 'A Detail',
    'Aset': 'A set',
    'Astakeholder': 'A stakeholder',
    'Anauthority': 'An authority',
    'Aninternal': 'An internal',
    'Aninvoice': 'An invoice',
    'Anentity': 'An entity',
    'Anenhancement': 'An enhancement',
    'Anintemal': 'An internal',  # OCR typo: "intemal" → "internal"
    'AGuidewire': 'A Guidewire',
    # How patterns
    'Howdo ': 'How do ',
    'Howdoyou': 'How do you',
    'Howwould': 'How would',
    'Howdoes': 'How does',
    'Howare': 'How are',
    'Howmany': 'How many',
    'Howmuch': 'How much',
    # What patterns
    'Whatare': 'What are',
    'Whatis': 'What is',
    'Whatdoes': 'What does',
    'Whathappens': 'What happens',
    'Whatdetermines': 'What determines',
    'Whatproperty': 'What property',
    'Whatmust': 'What must',
    # In patterns
    'Inwhat': 'In what',
    'Inthe': 'In the',
    'Inwhich': 'In which',
    'Inorder': 'In order',
    # Do/Can patterns
    'Doyou': 'Do you',
    'Cana': 'Can a',
    'Canyou': 'Can you',
    'Canone': 'Can one',
    'Canthe': 'Can the',
    # For patterns
    'Foran': 'For an',
    'Fora': 'For a',
    'Foreach': 'For each',
    'Forwhich': 'For which',
    'Forthe': 'For the',
    # When/Where/Why/Which patterns
    'Whendoes': 'When does',
    'Whendo ': 'When do ',
    'Whenyou': 'When you',
    'Whena': 'When a',
    'Wherea': 'Where a',
    'Wherecan': 'Where can',
    'Whydoes': 'Why does',
    'Whyis': 'Why is',
    'Whyput': 'Why put',
    'Whymust': 'Why must',
    # Other patterns
    'Itcan': 'It can',
    'Nametwo': 'Name two',
    'Namethe': 'Name the',
    'Describea': 'Describe a',
    'Describethe': 'Describe the',
    'Describebriefly': 'Describe briefly',
    'Statea': 'State a',
    'Statetrue': 'State true',
    'InaList': 'In a List',
    # OCR character errors
    'Yim': 'Jim',             # OCR: Y→J
    'Iwo': 'Two',             # OCR: I→T
    'intemal': 'internal',    # OCR typo
    'underrriting': 'underwriting',
}

# Mid-text regex fixes
MID_TEXT_FIXES = [
    (r'\bif itis\b', 'if it is'),
    (r'\bthat itis\b', 'that it is'),
    (r'\blfabusiness\b', 'If a business'),
    (r'\bpattens\b', 'patterns'),
    (r'\bretum\b', 'return'),
    (r'\bboine\b', 'both'),
    (r'"\s*¢?\s*TIF\s*\?', 'True or False?'),
    (r'\bTIF\s*\?', 'True or False?'),
    (r'\bTIF\b', 'True or False'),
    # Mid-line OCR noise prefixes (after newline)
    (r"\n,'\s+", '\n'),            # ",' " prefix on continuation lines
    (r"\n,\s+__\s+", '\n'),        # ", __" prefix on continuation lines
    (r'\n7\s+(?=[a-z])', '\n'),    # "\n7 " followed by lowercase
    (r'\n"\s+(?=[a-z])', '\n'),    # '\n" ' followed by lowercase
    (r'\nx\s+(?=[a-z])', '\n'),    # "\nx " followed by lowercase
    (r'\n:\s+(?=[a-z])', '\n'),    # "\n: " followed by lowercase
    (r'\ny\s+(?=[a-z])', '\n'),    # "\ny " followed by lowercase
    (r'\n—\s+', '\n'),             # "\n— " prefix
    # Stray characters before options
    (r'\no\s+(?=[A-Z]\))', '\n'),  # "\no A)" → "\nA)"
    (r'\n£\s+', '\n'),            # "\n£ " prefix
    (r'\n"\s+¢?\s*', '\n'),        # '\n" ¢ ' combo noise
    (r"\.\.\.\s*'\s*Locations?\n", '...\n'),  # "... ' Locations" OCR junk
    (r"\.\.\.\s*Locations?\n", '...\n'),    # "... Locations" header junk
    (r'\bAnew\b', 'A new'),        # "Anew" → "A new"
]

MID_TEXT_COMPILED = [(re.compile(p), r) for p, r in MID_TEXT_FIXES]


def is_junk_line(line: str) -> bool:
    """Check if a line is pure OCR junk."""
    stripped = line.strip()
    if not stripped:
        return False
    for regex in JUNK_REGEXES:
        if regex.match(stripped):
            return True
    return False


def clean_line(line: str) -> str:
    """Clean a single line: strip prefixes, fix ¢ chars, etc."""
    # Strip OCR prefix noise
    for regex, replacement in LINE_PREFIX_COMPILED:
        line = regex.sub(replacement, line)

    # Strip continuation noise prefixes (keep the text after)
    for regex, replacement in LINE_CONT_COMPILED:
        new_line = regex.sub(replacement, line)
        if new_line != line and new_line.strip():
            line = new_line

    # Handle ¢ character - it's OCR noise, not a word substitute
    # ¢ at start of line followed by text → just remove it
    line = re.sub(r'^¢\s+', '', line)
    # ¢ in middle of line → remove it
    line = re.sub(r'\s+¢\s+', ' ', line)
    # Standalone ¢ at end or by itself
    line = re.sub(r'\s*¢\s*$', '', line)
    line = re.sub(r'^¢\s*$', '', line)

    # Strip leading/trailing stray quotes
    line = re.sub(r'^"\s+(?=[A-Z])', '', line)  # '" What' → 'What'

    return line


def clean_question_text(text: str) -> str:
    """Clean up a knowledge check question or answer text."""
    if not text or not text.strip():
        return text

    # Step 1: Split into lines, process each
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        # Skip pure junk lines
        if is_junk_line(line):
            continue
        # Clean the line
        cleaned = clean_line(line)
        # Only keep non-empty lines
        if cleaned.strip():
            cleaned_lines.append(cleaned)

    text = '\n'.join(cleaned_lines)

    # Step 2: Fix corrupted starts (most specific first)
    for pattern, replacement in CORRUPTED_STARTS:
        if re.match(pattern, text):
            text = re.sub(pattern, replacement, text, count=1)
            break

    # Step 3: Fix missing spaces
    for wrong, right in MISSING_SPACE_FIXES.items():
        if wrong in text:
            text = text.replace(wrong, right)

    # Step 4: Apply mid-text regex fixes
    for regex, replacement in MID_TEXT_COMPILED:
        text = regex.sub(replacement, text)

    # Step 5: Final cleanup
    # Remove multiple consecutive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Remove trailing whitespace on lines
    text = '\n'.join(line.rstrip() for line in text.split('\n'))
    # Strip leading/trailing whitespace
    text = text.strip()

    # Step 6: Capitalize first character
    if text and text[0].islower():
        text = text[0].upper() + text[1:]

    return text


def fix_synthesized_file(filepath: str, dry_run: bool = False, verbose: bool = False) -> int:
    """Fix knowledge_check blocks in a synthesized lesson file."""
    with open(filepath) as f:
        data = json.load(f)

    changes = 0
    for block in data.get('blocks', []):
        if block.get('type') != 'knowledge_check':
            continue

        for field in ['question', 'answer']:
            original = block.get(field, '')
            if not original:
                continue
            cleaned = clean_question_text(original)
            if cleaned != original:
                changes += 1
                if verbose:
                    rel = os.path.relpath(filepath, SYNTH_DIR)
                    print(f'  {rel} [{field}]:')
                    print(f'    BEFORE: {repr(original[:150])}')
                    print(f'    AFTER:  {repr(cleaned[:150])}')
                if not dry_run:
                    block[field] = cleaned

    if changes > 0 and not dry_run:
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write('\n')

    return changes


def fix_content_file(filepath: str, dry_run: bool = False, verbose: bool = False) -> int:
    """Fix questionData and ocrText in extracted content files."""
    with open(filepath) as f:
        data = json.load(f)

    changes = 0
    for slide in data.get('slides', []):
        slide_type = slide.get('slideType', '')

        # Fix questionData
        qd = slide.get('questionData')
        if qd:
            for field in ['question', 'answer']:
                original = qd.get(field, '')
                if not original:
                    continue
                cleaned = clean_question_text(original)
                if cleaned != original:
                    changes += 1
                    if verbose:
                        rel = os.path.relpath(filepath, CONTENT_DIR)
                        sn = slide.get('slideNumber', '?')
                        print(f'  {rel} slide {sn} questionData.{field}:')
                        print(f'    BEFORE: {repr(original[:150])}')
                        print(f'    AFTER:  {repr(cleaned[:150])}')
                    if not dry_run:
                        qd[field] = cleaned

        # Fix ocrText on question/answer slides
        if slide_type in ('question', 'answer'):
            ocr = slide.get('ocrText', '')
            if ocr:
                cleaned = clean_question_text(ocr)
                if cleaned != ocr:
                    changes += 1
                    if not dry_run:
                        slide['ocrText'] = cleaned

    if changes > 0 and not dry_run:
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write('\n')

    return changes


def main():
    dry_run = '--dry-run' in sys.argv
    verbose = '--verbose' in sys.argv or '-v' in sys.argv

    total_changes = 0

    # Fix synthesized content
    print('=== Synthesized Content (knowledge_check blocks) ===')
    synth_files = sorted(glob.glob(os.path.join(SYNTH_DIR, '**/lesson-*.json'), recursive=True))
    synth_changes = 0
    synth_files_changed = 0
    for f in synth_files:
        c = fix_synthesized_file(f, dry_run=dry_run, verbose=verbose)
        if c > 0:
            synth_files_changed += 1
            synth_changes += c
    print(f'  {"Would fix" if dry_run else "Fixed"} {synth_changes} questions in {synth_files_changed} files')
    total_changes += synth_changes

    # Fix extracted content
    print('\n=== Extracted Content (questionData + ocrText) ===')
    content_files = sorted(glob.glob(os.path.join(CONTENT_DIR, '**/lesson-*.json'), recursive=True))
    content_changes = 0
    content_files_changed = 0
    for f in content_files:
        c = fix_content_file(f, dry_run=dry_run, verbose=verbose)
        if c > 0:
            content_files_changed += 1
            content_changes += c
    print(f'  {"Would fix" if dry_run else "Fixed"} {content_changes} questions in {content_files_changed} files')
    total_changes += content_changes

    print(f'\nTotal: {"Would fix" if dry_run else "Fixed"} {total_changes} changes')


if __name__ == '__main__':
    main()
