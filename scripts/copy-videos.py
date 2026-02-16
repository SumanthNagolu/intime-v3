#!/usr/bin/env python3
"""
Copy all demo videos from OneDrive training material to public/academy/guidewire/videos/
Organized by chapter slug.
"""

import os
import shutil

MATERIAL_DIR = "/Users/sumanthrajkumarnagolu/Documents/Material"
OUTPUT_DIR = "/Users/sumanthrajkumarnagolu/Projects/intime-v3/public/academy/guidewire/videos"

CHAPTER_MAP = {
    "Chapter 1 - Guidewire Cloud Overview": "ch01",
    "Chapter 2 - Surepath Overview": "ch02",
    "Chapter 3 - InsuranceSuite Implementation Tools": "ch03",
    "Chapter 4 - PolicyCenter Introduction": "ch04",
    "Chapter 5 - Claim Center Introduction": "ch05",
    "Chapter 6 - Billing Center Introduction": "ch06",
    "Chapter 7 - InsuranceSuite Developer Fundamentals": "ch07",
    "Chapter 8 - policy center configuration": "ch08",
    "Chapter 9 - ClaimCenter Configuration": "ch09",
    "Chapter 10 - BillingCenter Configuration": "ch10",
    "Chapter 11 - Introduction to Integration": "ch11",
    "Chapter 12 - Advanced product Designer": "ch12",
    "Chapter 13 - Rating Introduction": "ch13",
    "Chapter 14 - Rating Configuration": "ch14",
}

VIDEO_EXTENSIONS = {'.mp4', '.mkv', '.avi', '.mov', '.wmv'}


def main():
    total_copied = 0
    total_size_mb = 0

    for chapter_name, slug in CHAPTER_MAP.items():
        chapter_dir = os.path.join(MATERIAL_DIR, chapter_name)
        if not os.path.isdir(chapter_dir):
            print(f"  SKIP: {chapter_name} (not found)")
            continue

        out_dir = os.path.join(OUTPUT_DIR, slug)
        os.makedirs(out_dir, exist_ok=True)

        # Find all video files recursively
        videos = []
        for root, dirs, files in os.walk(chapter_dir):
            for f in files:
                ext = os.path.splitext(f)[1].lower()
                if ext in VIDEO_EXTENSIONS and not f.startswith('.'):
                    videos.append(os.path.join(root, f))

        if not videos:
            continue

        print(f"\n=== {chapter_name} ({slug}) - {len(videos)} videos ===")

        for vpath in sorted(videos):
            fname = os.path.basename(vpath)
            dest = os.path.join(out_dir, fname)

            if os.path.exists(dest):
                print(f"  EXISTS: {fname}")
                continue

            size_mb = os.path.getsize(vpath) / (1024 * 1024)
            print(f"  COPY: {fname} ({size_mb:.1f} MB)")

            try:
                shutil.copy2(vpath, dest)
                total_copied += 1
                total_size_mb += size_mb
            except Exception as e:
                print(f"  ERROR: {e}")

    print(f"\n{'=' * 60}")
    print(f"Copied {total_copied} videos ({total_size_mb:.0f} MB total)")
    print(f"Output: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
