#!/usr/bin/env python3
"""
Extract interview preparation documents into structured JSON.
"""

import json
import os
import re
from docx import Document

INTERVIEW_DIR = "/Users/sumanthrajkumarnagolu/Library/CloudStorage/OneDrive-IntimeeSolutions/Intime E-Solutions/Trainings/Guidewire/Material/Interview Preparation"
OUTPUT_FILE = "/Users/sumanthrajkumarnagolu/Projects/intime-v3/public/academy/guidewire/content/interview-prep.json"


def extract_docx_content(filepath):
    """Extract structured content from a DOCX file."""
    filename = os.path.basename(filepath)
    print(f"  Processing: {filename}")

    try:
        doc = Document(filepath)
    except Exception as e:
        print(f"  ERROR: {e}")
        return None

    sections = []
    current_section = {"heading": "", "content": []}

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue

        # Check if heading
        is_heading = False
        if para.style and para.style.name:
            if 'Heading' in para.style.name:
                is_heading = True

        # Also detect Q&A patterns
        is_question = bool(re.match(r'^(Q\d*[\.:)]|Question\s*\d*[\.:)]|\d+[\.:)]\s)', text, re.IGNORECASE))
        is_answer = bool(re.match(r'^(A\d*[\.:)]|Answer[\.:)]|Ans[\.:)])', text, re.IGNORECASE))

        if is_heading:
            if current_section["content"] or current_section["heading"]:
                sections.append(current_section)
            current_section = {"heading": text, "content": []}
        else:
            is_bold = any(run.bold for run in para.runs) if para.runs else False
            current_section["content"].append({
                "text": text,
                "bold": is_bold,
                "isQuestion": is_question,
                "isAnswer": is_answer,
            })

    if current_section["content"] or current_section["heading"]:
        sections.append(current_section)

    # Try to extract Q&A pairs
    qa_pairs = []
    current_q = None

    for section in sections:
        for item in section["content"]:
            if item["isQuestion"] or (item["bold"] and "?" in item["text"]):
                if current_q:
                    qa_pairs.append(current_q)
                current_q = {"question": item["text"], "answer": "", "topic": section["heading"]}
            elif item["isAnswer"] and current_q:
                current_q["answer"] = item["text"]
            elif current_q and not item["isQuestion"]:
                # Continuation of answer
                if current_q["answer"]:
                    current_q["answer"] += "\n" + item["text"]
                else:
                    current_q["answer"] = item["text"]

    if current_q:
        qa_pairs.append(current_q)

    title = os.path.splitext(filename)[0]
    # Clean numbered files
    if re.match(r'^\d+$', title):
        title = f"Interview Questions Set {title}"

    return {
        "title": title,
        "sourceFile": filename,
        "sections": sections,
        "qaPairs": qa_pairs,
        "totalQuestions": len(qa_pairs),
    }


def main():
    print("=" * 60)
    print("INTERVIEW PREP EXTRACTION")
    print("=" * 60)

    all_docs = []
    total_questions = 0

    for f in sorted(os.listdir(INTERVIEW_DIR)):
        if f.startswith('.') or f.startswith('~$'):
            continue

        filepath = os.path.join(INTERVIEW_DIR, f)
        if not os.path.isfile(filepath):
            continue

        if f.endswith('.docx'):
            result = extract_docx_content(filepath)
            if result:
                all_docs.append(result)
                total_questions += result["totalQuestions"]

        elif f.endswith('.pdf'):
            # Just reference the PDF
            all_docs.append({
                "title": os.path.splitext(f)[0],
                "sourceFile": f,
                "sections": [],
                "qaPairs": [],
                "totalQuestions": 0,
                "isPdf": True,
            })

    output = {
        "totalDocuments": len(all_docs),
        "totalQuestions": total_questions,
        "documents": all_docs,
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\nExtracted {len(all_docs)} documents, {total_questions} Q&A pairs")
    print(f"Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
