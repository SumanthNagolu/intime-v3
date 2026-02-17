#!/usr/bin/env python3
"""
Fix video array mismatches - ensure video entries match demo_video slides.
Videos follow naming conventions per chapter.
"""

import json
import glob
import os
import re
import sys

CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'academy', 'guidewire', 'content')

# Video naming conventions by chapter
# ch04: In_policy_NN_MM.mp4
# ch05: IS_Claim_NN_MM.mp4  (or In_Claim_NN_MM.mp4)
# ch06: BillingCenter_NN_MM.mp4
# ch07: IS_Fund_NN_MM.mp4
# ch08: PC_Config_NN_MM.mp4
# ch09: CC_NN_MM.mp4
# ch11: IS_Int_NN_MM.mp4
# ch12: APD_NN_MM.mp4
# ch13: Rating_NN_MM.mp4
# ch14: RatingConfig_NN_MM.mp4

def get_video_prefix(data):
    """Determine video prefix from existing videos or source file."""
    videos = data.get('videos', [])
    if videos:
        # Extract prefix from first video
        fn = videos[0].get('filename', '')
        # Remove trailing _NN.mp4
        match = re.match(r'(.+)_\d+\.mp4$', fn)
        if match:
            return match.group(1)

    # Fallback: derive from sourceFile
    sf = data.get('sourceFile', '')
    ch = data.get('chapterSlug', '')
    ln = data.get('lessonNumber', 1)
    num = str(ln).zfill(2)

    prefixes = {
        'ch04': f'In_policy_{num}',
        'ch05': f'IS_Claim_{num}',
        'ch06': f'BillingCenter_{num}',
        'ch07': f'IS_Fund_{num}',
        'ch08': f'PC_Config_{num}',
        'ch09': f'CC_{num}',
        'ch11': f'IS_Int_{num}',
        'ch12': f'APD_{num}',
        'ch13': f'Rating_{num}',
        'ch14': f'RatingConfig_{num}',
    }
    return prefixes.get(ch, f'lesson_{num}')


def fix_video_refs(filepath, dry_run=False):
    """Fix video array to match demo_video slide count."""
    with open(filepath) as f:
        data = json.load(f)

    slides = data.get('slides', [])
    videos = data.get('videos', [])
    ch = data.get('chapterSlug', '')

    demo_video_count = sum(1 for s in slides if s.get('slideType') == 'demo_video')

    if len(videos) >= demo_video_count:
        return False  # No fix needed

    prefix = get_video_prefix(data)

    # Add missing video entries
    while len(videos) < demo_video_count:
        idx = len(videos) + 1
        num_str = str(idx).zfill(2)
        filename = f'{prefix}_{num_str}.mp4'
        path = f'/academy/guidewire/videos/{ch}/{filename}'
        videos.append({
            'index': idx,
            'filename': filename,
            'path': path,
        })

    data['videos'] = videos

    if not dry_run:
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write('\n')

    return True


def main():
    dry_run = '--dry-run' in sys.argv

    all_files = sorted(glob.glob(os.path.join(CONTENT_DIR, '**/lesson-*.json'), recursive=True))
    fixed = 0

    for filepath in all_files:
        rel = os.path.relpath(filepath, CONTENT_DIR)
        if fix_video_refs(filepath, dry_run=dry_run):
            fixed += 1
            if '--verbose' in sys.argv:
                print(f'  Fixed: {rel}')

    print(f'{"Would fix" if dry_run else "Fixed"} video refs in {fixed} files')


if __name__ == '__main__':
    main()
