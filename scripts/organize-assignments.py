#!/usr/bin/env python3
"""
Organize assignment PDFs from the training material into the academy portal structure.
Copies PDFs with consistent naming and generates an assignment manifest.
"""

import json
import os
import re
import shutil

MATERIAL_DIR = "/Users/sumanthrajkumarnagolu/Documents/Material"
ASSIGNMENTS_DIR = os.path.join(MATERIAL_DIR, "Assigments")  # Note: typo in source folder name
OUTPUT_DIR = "/Users/sumanthrajkumarnagolu/Projects/intime-v3/public/academy/guidewire/assignments"
MANIFEST_FILE = "/Users/sumanthrajkumarnagolu/Projects/intime-v3/public/academy/guidewire/assignment-manifest.json"

# Map assignment folder names to chapter slugs
ASSIGNMENT_CHAPTER_MAP = {
    "PolicyCenter Introduction": "ch04",
    "ClaimCenter Introduction": "ch05",
    "BillingCenter Introduction": "ch06",
    "InsuranceSuite Fundamentals": "ch07",
    "PolicyCenter Configuration": "ch08",
    "ClaimCenter Configuration": "ch09",
    "BillingCenter Configuration": "ch10",
    "InsuranceSuite Integration": "ch11",
}

# Folders that don't map to a chapter but should still be organized
EXTRA_FOLDERS = {
    "Resources": "resources",
    "Useful Appendix": "appendix",
}


def extract_assignment_number(filename):
    """Extract the assignment number from a PDF filename like '01 - Configuration Basics.pdf'."""
    match = re.match(r'^(\d+)', filename)
    if match:
        return int(match.group(1))
    return 0


def extract_assignment_title(filename):
    """Extract a clean title from the PDF filename."""
    name = os.path.splitext(filename)[0]
    # Remove leading number and separator
    name = re.sub(r'^\d+\s*[-–]\s*', '', name)
    return name.strip()


def main():
    print("=" * 60)
    print("GUIDEWIRE ACADEMY - ASSIGNMENT ORGANIZER")
    print("=" * 60)

    if not os.path.isdir(ASSIGNMENTS_DIR):
        print(f"ERROR: Assignments directory not found: {ASSIGNMENTS_DIR}")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    manifest = {
        "program": "Guidewire Developer Training",
        "totalAssignments": 0,
        "chapters": {},
    }

    total_copied = 0
    total_skipped = 0

    # Process each assignment folder
    all_folders = {**ASSIGNMENT_CHAPTER_MAP, **EXTRA_FOLDERS}

    for folder_name, slug in sorted(all_folders.items(), key=lambda x: x[1]):
        folder_path = os.path.join(ASSIGNMENTS_DIR, folder_name)

        if not os.path.isdir(folder_path):
            print(f"\n  SKIP: {folder_name} (not found)")
            continue

        # Find all PDFs
        pdfs = sorted(
            [f for f in os.listdir(folder_path) if f.lower().endswith('.pdf') and not f.startswith('.')],
            key=lambda f: extract_assignment_number(f)
        )

        if not pdfs:
            print(f"\n  SKIP: {folder_name} (no PDFs)")
            continue

        out_dir = os.path.join(OUTPUT_DIR, slug)
        os.makedirs(out_dir, exist_ok=True)

        print(f"\n=== {folder_name} ({slug}) - {len(pdfs)} PDFs ===")

        chapter_assignments = []

        for pdf in pdfs:
            src_path = os.path.join(folder_path, pdf)
            num = extract_assignment_number(pdf)
            title = extract_assignment_title(pdf)

            # Consistent naming: assignment-{NN}.pdf
            dest_name = f"assignment-{num:02d}.pdf"
            dest_path = os.path.join(out_dir, dest_name)

            if os.path.exists(dest_path):
                print(f"  EXISTS: {dest_name} ({pdf})")
                total_skipped += 1
            else:
                size_kb = os.path.getsize(src_path) / 1024
                print(f"  COPY: {pdf} -> {dest_name} ({size_kb:.0f} KB)")
                try:
                    shutil.copy2(src_path, dest_path)
                    total_copied += 1
                except Exception as e:
                    print(f"  ERROR: {e}")
                    continue

            chapter_assignments.append({
                "number": num,
                "title": title,
                "filename": dest_name,
                "originalFilename": pdf,
                "path": f"/academy/guidewire/assignments/{slug}/{dest_name}",
            })

        manifest["chapters"][slug] = {
            "slug": slug,
            "folderName": folder_name,
            "totalAssignments": len(chapter_assignments),
            "assignments": chapter_assignments,
        }

    manifest["totalAssignments"] = sum(
        ch["totalAssignments"] for ch in manifest["chapters"].values()
    )

    # Write manifest
    with open(MANIFEST_FILE, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"\n{'=' * 60}")
    print(f"ASSIGNMENT ORGANIZATION COMPLETE")
    print(f"{'=' * 60}")
    print(f"Copied:  {total_copied} PDFs")
    print(f"Skipped: {total_skipped} (already existed)")
    print(f"Total:   {manifest['totalAssignments']} assignments across {len(manifest['chapters'])} chapters")
    print(f"Output:  {OUTPUT_DIR}")
    print(f"Manifest: {MANIFEST_FILE}")


if __name__ == "__main__":
    main()
