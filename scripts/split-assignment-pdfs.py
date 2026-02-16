#!/usr/bin/env python3
"""
Split assignment PDFs into questions + solutions files.

For each PDF in public/academy/guidewire/assignments/{ch04..ch11}/:
  - Extract text from each page
  - Look for "Solution" in the first 80 characters (after page 1)
  - Split into assignment-XX-questions.pdf and assignment-XX-solutions.pdf
  - Skip single/two-page PDFs or those without a solutions header
  - Output a JSON manifest at public/academy/guidewire/assignments/split-manifest.json

Requires: pip install PyPDF2
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, Optional

try:
    from PyPDF2 import PdfReader, PdfWriter
except ImportError:
    print("PyPDF2 not installed. Install with: pip install PyPDF2")
    sys.exit(1)

ASSIGNMENTS_DIR = Path(__file__).parent.parent / "public" / "academy" / "guidewire" / "assignments"
CHAPTERS = ["ch04", "ch05", "ch06", "ch07", "ch08", "ch09", "ch10", "ch11"]


def find_solution_page(reader: PdfReader) -> Optional[int]:
    """Find the first page (after page 1) where 'Solution' appears in the first 80 chars."""
    for page_idx in range(1, len(reader.pages)):
        text = reader.pages[page_idx].extract_text() or ""
        first_80 = text[:80].strip()
        if "Solution" in first_80 or "SOLUTION" in first_80:
            return page_idx
    return None


def split_pdf(input_path: Path, solution_page: int, questions_path: Path, solutions_path: Path):
    """Split a PDF at the solution_page boundary."""
    reader = PdfReader(str(input_path))

    # Questions: pages 0 .. solution_page-1
    questions_writer = PdfWriter()
    for i in range(solution_page):
        questions_writer.add_page(reader.pages[i])
    with open(questions_path, "wb") as f:
        questions_writer.write(f)

    # Solutions: pages solution_page .. end
    solutions_writer = PdfWriter()
    for i in range(solution_page, len(reader.pages)):
        solutions_writer.add_page(reader.pages[i])
    with open(solutions_path, "wb") as f:
        solutions_writer.write(f)


def main():
    manifest: Dict[str, dict] = {}
    split_count = 0
    skip_count = 0

    for chapter in CHAPTERS:
        chapter_dir = ASSIGNMENTS_DIR / chapter
        if not chapter_dir.exists():
            print(f"  Skipping {chapter} (directory not found)")
            continue

        pdfs = sorted(chapter_dir.glob("assignment-[0-9][0-9].pdf"))
        print(f"\n{chapter}: {len(pdfs)} assignment PDFs")

        for pdf_path in pdfs:
            stem = pdf_path.stem  # e.g. "assignment-01"
            key = f"{chapter}/{stem}"

            try:
                reader = PdfReader(str(pdf_path))
                num_pages = len(reader.pages)

                if num_pages <= 2:
                    manifest[key] = {"split": False, "reason": "too_short", "pages": num_pages}
                    skip_count += 1
                    print(f"  {stem}: {num_pages} pages - skipped (too short)")
                    continue

                solution_page = find_solution_page(reader)
                if solution_page is None:
                    manifest[key] = {"split": False, "reason": "no_solution_header", "pages": num_pages}
                    skip_count += 1
                    print(f"  {stem}: {num_pages} pages - skipped (no solution header)")
                    continue

                # Split the PDF
                questions_path = chapter_dir / f"{stem}-questions.pdf"
                solutions_path = chapter_dir / f"{stem}-solutions.pdf"
                split_pdf(pdf_path, solution_page, questions_path, solutions_path)

                manifest[key] = {
                    "split": True,
                    "pages": num_pages,
                    "solutionPage": solution_page + 1,  # 1-indexed for readability
                    "questionPages": solution_page,
                    "solutionPages": num_pages - solution_page,
                }
                split_count += 1
                print(f"  {stem}: {num_pages} pages - SPLIT at page {solution_page + 1} ({solution_page} questions, {num_pages - solution_page} solutions)")

            except Exception as e:
                manifest[key] = {"split": False, "reason": f"error: {str(e)}", "pages": 0}
                skip_count += 1
                print(f"  {stem}: ERROR - {e}")

    # Write manifest
    manifest_path = ASSIGNMENTS_DIR / "split-manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2, sort_keys=True)

    print(f"\n{'='*50}")
    print(f"Done! Split: {split_count}, Skipped: {skip_count}")
    print(f"Manifest written to: {manifest_path}")


if __name__ == "__main__":
    main()
