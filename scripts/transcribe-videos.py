#!/usr/bin/env python3
"""
Guidewire Academy Video Transcription Script
=============================================
Transcribes all training videos using MLX Whisper (Apple Silicon GPU accelerated).
Outputs structured JSON transcripts optimized for RAG ingestion.

Usage:
    python3 scripts/transcribe-videos.py                    # Transcribe all videos
    python3 scripts/transcribe-videos.py --chapter ch04     # Transcribe single chapter
    python3 scripts/transcribe-videos.py --resume           # Resume from last checkpoint
    python3 scripts/transcribe-videos.py --dry-run          # List videos without transcribing
"""

import argparse
import json
import sys
import time
from pathlib import Path
from datetime import datetime

import mlx_whisper

# =============================================================================
# Configuration
# =============================================================================

VIDEOS_DIR = Path("public/academy/guidewire/videos")
OUTPUT_DIR = Path("public/academy/guidewire/transcripts")
CHECKPOINT_FILE = OUTPUT_DIR / "_checkpoint.json"

# MLX Whisper model - large-v3-turbo optimized for Apple Silicon
MLX_MODEL = "mlx-community/whisper-large-v3-turbo"

# Chapter metadata for context-aware transcription
CHAPTER_META = {
    "ch01": {
        "title": "Guidewire Cloud Overview",
        "domain": "cloud platform architecture",
        "terms": "Guidewire Cloud, InsuranceSuite, PolicyCenter, ClaimCenter, BillingCenter, SaaS, cloud-native, deployment"
    },
    "ch02": {
        "title": "Surepath Overview",
        "domain": "development environment",
        "terms": "Surepath Studio, cloud development, Guidewire tooling, IDE, configuration"
    },
    "ch03": {
        "title": "InsuranceSuite Implementation Tools",
        "domain": "implementation methodology",
        "terms": "user story cards, UI story cards, implementation planning, Guidewire methodology"
    },
    "ch04": {
        "title": "PolicyCenter Introduction",
        "domain": "policy administration",
        "terms": "PolicyCenter, policy transaction, submission, quote, bind, issuance, renewal, endorsement, cancellation, reinstatement, audit, rewrite, account, producer, underwriting, product model, coverage, exposure, risk object, rating, rate routine, rate table, policy period, job, workflow, activity, UW rule, pre-emption, premium, Gosu"
    },
    "ch05": {
        "title": "ClaimCenter Introduction",
        "domain": "claims management",
        "terms": "ClaimCenter, claim, FNOL, first notice of loss, exposure, incident, coverage verification, reserve, payment, recovery, subrogation, litigation, adjuster, claim handler, catastrophe, workers compensation, vendor management, settlement, deductible, claim contacts, special handling"
    },
    "ch06": {
        "title": "BillingCenter Introduction",
        "domain": "billing operations",
        "terms": "BillingCenter, billing, charge, invoice, payment, disbursement, delinquency, write-off, producer, commission, payment plan, direct bill, agency bill, installment, account receivable, collateral, trouble ticket, billing instruction"
    },
    "ch07": {
        "title": "InsuranceSuite Developer Fundamentals",
        "domain": "developer core skills",
        "terms": "Gosu, data model, entity, typelist, typekey, PCF, page configuration file, widget, ListView, DetailView, EditableListView, DVLayout, InputSet, ButtonInput, validation, business rule, plugin, messaging, integration, batch process, web service, REST API, enhancement, delegation, foreign key, array, effdated, Guidewire Studio"
    },
    "ch08": {
        "title": "PolicyCenter Product Model",
        "domain": "product configuration",
        "terms": "product model, product definition, line of business, coverage, coverage term, clause, schedule, risk object, exposure, policy line, offering, modifier, rate factor, eligibility, existence, product model editor, Guidewire Studio, APD, Advanced Product Designer"
    },
    "ch09": {
        "title": "ClaimCenter Configuration",
        "domain": "claims configuration",
        "terms": "ClaimCenter configuration, loss type, exposure type, coverage type, claim segment, business rules, workflow, activity pattern, assignment, permissions, role, authority profile, claim validation, financials configuration, reserve, payment, recovery"
    },
    "ch10": {
        "title": "BillingCenter Configuration",
        "domain": "billing configuration",
        "terms": "BillingCenter configuration"
    },
    "ch11": {
        "title": "InsuranceSuite Integration",
        "domain": "system integration",
        "terms": "integration, REST API, SOAP, web service, messaging, plugin, startable, batch process, integration point, cloud API, event, notification, document management, external system, authentication, pre-update, pre-commit, event-fired"
    },
    "ch12": {
        "title": "Advanced Product Designer",
        "domain": "advanced product modeling",
        "terms": "Advanced Product Designer, APD, product model, edition, pricing, clause, clause term, risk object, exposure, attribute, schedule, product line, general information, metadata, short name, validation, generation, drop-down, property"
    },
    "ch13": {
        "title": "Rating Introduction",
        "domain": "insurance rating",
        "terms": "rating, rate routine, rate table, rate factor, rate book, rating engine, premium, base rate, modifier, discount, surcharge, rate algorithm, table lookup, interpolation, rating worksheet, loss cost, expense, tax, fee"
    },
    "ch14": {
        "title": "Rating Configuration",
        "domain": "rating system configuration",
        "terms": "rating configuration, rate table definition, rate routine, parameterized rate routine, rating integration, rate book, rate flow, rate step, calculation, variable, operator, conditional, loop, rate table import, rate override"
    },
}

# Base Guidewire vocabulary prompt for all chapters
BASE_PROMPT = (
    "This is a Guidewire InsuranceSuite training video for insurance software developers. "
    "Key terminology includes: Guidewire, InsuranceSuite, PolicyCenter, ClaimCenter, BillingCenter, "
    "Gosu programming language, PCF files, data model, entities, typelists, typekeys, "
    "product model, coverage, exposure, risk object, workflow, activity, "
    "underwriting, claims, billing, rating, integration. "
)


def get_chapter_prompt(chapter_slug: str) -> str:
    """Build a context-aware initial prompt for better transcription accuracy."""
    meta = CHAPTER_META.get(chapter_slug, {})
    if not meta:
        return BASE_PROMPT

    return (
        f"{BASE_PROMPT}"
        f"This video is from Chapter: {meta.get('title', '')}. "
        f"Domain: {meta.get('domain', '')}. "
        f"Expected terms: {meta.get('terms', '')}."
    )


def get_video_files(videos_dir: Path, chapter_filter: str = None) -> list:
    """Discover all video files, organized by chapter."""
    video_extensions = {".mp4", ".mkv", ".webm", ".avi", ".mov"}
    videos = []

    chapters = sorted(videos_dir.iterdir()) if videos_dir.exists() else []
    for chapter_dir in chapters:
        if not chapter_dir.is_dir():
            continue
        chapter_slug = chapter_dir.name
        if chapter_filter and chapter_slug != chapter_filter:
            continue

        chapter_videos = []
        for f in sorted(chapter_dir.iterdir()):
            if f.suffix.lower() in video_extensions:
                chapter_videos.append(f)

        for video_path in chapter_videos:
            videos.append({
                "chapter": chapter_slug,
                "filename": video_path.name,
                "path": video_path,
                "stem": video_path.stem.strip(),
            })

    return videos


def load_checkpoint() -> set:
    """Load set of already-transcribed video paths."""
    if CHECKPOINT_FILE.exists():
        data = json.loads(CHECKPOINT_FILE.read_text())
        return set(data.get("completed", []))
    return set()


def save_checkpoint(completed: set):
    """Save transcription progress."""
    CHECKPOINT_FILE.parent.mkdir(parents=True, exist_ok=True)
    CHECKPOINT_FILE.write_text(json.dumps({
        "completed": sorted(completed),
        "last_updated": datetime.now().isoformat(),
    }, indent=2))


def format_timestamp(seconds: float) -> str:
    """Convert seconds to HH:MM:SS.mmm format."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:06.3f}"


def transcribe_video(video_info: dict, model_path: str, verbose: bool = False) -> dict:
    """Transcribe a single video file using MLX Whisper and return structured result."""
    video_path = video_info["path"]
    chapter = video_info["chapter"]

    initial_prompt = get_chapter_prompt(chapter)

    if verbose:
        print(f"  Transcribing: {video_path.name}")

    start_time = time.time()

    result = mlx_whisper.transcribe(
        str(video_path),
        path_or_hf_repo=model_path,
        language="en",
        initial_prompt=initial_prompt,
        word_timestamps=True,
        condition_on_previous_text=True,
        verbose=False,
    )

    elapsed = time.time() - start_time

    # Build structured transcript
    segments = []
    for seg in result.get("segments", []):
        segment_data = {
            "id": seg["id"],
            "start": round(seg["start"], 3),
            "end": round(seg["end"], 3),
            "start_formatted": format_timestamp(seg["start"]),
            "end_formatted": format_timestamp(seg["end"]),
            "text": seg["text"].strip(),
        }

        # Include word-level timestamps if available
        if "words" in seg:
            segment_data["words"] = [
                {
                    "word": w["word"].strip(),
                    "start": round(w["start"], 3),
                    "end": round(w["end"], 3),
                    "probability": round(w.get("probability", 0), 4),
                }
                for w in seg["words"]
            ]

        segments.append(segment_data)

    # Full plain text transcript
    full_text = " ".join(seg["text"] for seg in segments)

    # Calculate average confidence
    all_probs = []
    for seg in segments:
        for w in seg.get("words", []):
            all_probs.append(w["probability"])
    avg_confidence = round(sum(all_probs) / len(all_probs), 4) if all_probs else 0

    transcript = {
        "metadata": {
            "chapter": chapter,
            "chapter_title": CHAPTER_META.get(chapter, {}).get("title", ""),
            "filename": video_info["filename"],
            "video_stem": video_info["stem"],
            "duration_seconds": round(segments[-1]["end"], 3) if segments else 0,
            "duration_formatted": format_timestamp(segments[-1]["end"]) if segments else "00:00:00.000",
            "segment_count": len(segments),
            "word_count": len(full_text.split()),
            "avg_confidence": avg_confidence,
            "transcription_time_seconds": round(elapsed, 2),
            "model_used": model_path,
            "transcribed_at": datetime.now().isoformat(),
        },
        "full_text": full_text,
        "segments": segments,
    }

    return transcript


def build_chapter_summary(chapter_slug: str, transcripts: list) -> dict:
    """Build a chapter-level summary document for RAG."""
    chapter_meta = CHAPTER_META.get(chapter_slug, {})

    total_duration = sum(t["metadata"]["duration_seconds"] for t in transcripts)
    total_words = sum(t["metadata"]["word_count"] for t in transcripts)
    avg_conf = (
        sum(t["metadata"]["avg_confidence"] * t["metadata"]["word_count"] for t in transcripts)
        / total_words if total_words > 0 else 0
    )

    # Concatenate all text for chapter-level RAG
    all_text_parts = []
    for t in transcripts:
        video_label = t["metadata"]["video_stem"]
        all_text_parts.append(f"--- {video_label} ---\n{t['full_text']}")

    return {
        "chapter": chapter_slug,
        "chapter_title": chapter_meta.get("title", ""),
        "domain": chapter_meta.get("domain", ""),
        "video_count": len(transcripts),
        "total_duration_seconds": round(total_duration, 2),
        "total_duration_formatted": format_timestamp(total_duration),
        "total_words": total_words,
        "avg_confidence": round(avg_conf, 4),
        "videos": [
            {
                "filename": t["metadata"]["filename"],
                "stem": t["metadata"]["video_stem"],
                "duration": t["metadata"]["duration_formatted"],
                "words": t["metadata"]["word_count"],
                "confidence": t["metadata"]["avg_confidence"],
            }
            for t in transcripts
        ],
        "full_text": "\n\n".join(all_text_parts),
        "generated_at": datetime.now().isoformat(),
    }


def main():
    parser = argparse.ArgumentParser(description="Transcribe Guidewire training videos for RAG")
    parser.add_argument("--model", default=MLX_MODEL, help="MLX Whisper model repo")
    parser.add_argument("--chapter", default=None, help="Transcribe single chapter (e.g., ch04)")
    parser.add_argument("--resume", action="store_true", help="Resume from checkpoint")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    parser.add_argument("--dry-run", action="store_true", help="List videos without transcribing")
    args = parser.parse_args()

    # Discover videos
    videos = get_video_files(VIDEOS_DIR, chapter_filter=args.chapter)
    if not videos:
        print("No videos found.")
        sys.exit(1)

    # Group by chapter for reporting
    chapters = {}
    for v in videos:
        chapters.setdefault(v["chapter"], []).append(v)

    print("=" * 70)
    print("GUIDEWIRE ACADEMY VIDEO TRANSCRIPTION (MLX - Apple Silicon GPU)")
    print("=" * 70)
    print(f"Model: {args.model}")
    print(f"Videos: {len(videos)} across {len(chapters)} chapters")
    print(f"Output: {OUTPUT_DIR}/")
    print()

    for ch in sorted(chapters.keys()):
        ch_videos = chapters[ch]
        ch_title = CHAPTER_META.get(ch, {}).get("title", "Unknown")
        print(f"  {ch}: {ch_title} ({len(ch_videos)} videos)")
    print()

    if args.dry_run:
        print("Dry run - listing all videos:")
        for v in videos:
            print(f"  {v['chapter']}/{v['filename']}")
        return

    # Load checkpoint for resume
    completed = load_checkpoint() if args.resume else set()
    if completed:
        print(f"Resuming: {len(completed)} already transcribed, skipping them.")
        print()

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Warm up MLX model by transcribing nothing - model downloads on first use
    print(f"Loading MLX Whisper model '{args.model}' (Apple Silicon GPU)...")
    print("(First run downloads the model, subsequent runs are instant)")
    print()

    # Transcribe
    total = len(videos)
    done = 0
    skipped = 0
    errors = []
    overall_start = time.time()

    for ch_slug in sorted(chapters.keys()):
        ch_videos = chapters[ch_slug]
        ch_title = CHAPTER_META.get(ch_slug, {}).get("title", "Unknown")

        # Create chapter output dir
        ch_output_dir = OUTPUT_DIR / ch_slug
        ch_output_dir.mkdir(parents=True, exist_ok=True)

        print(f"{'='*60}")
        print(f"Chapter: {ch_slug} - {ch_title} ({len(ch_videos)} videos)")
        print(f"{'='*60}")

        ch_transcripts = []

        for i, video_info in enumerate(ch_videos):
            video_key = str(video_info["path"])
            output_file = ch_output_dir / f"{video_info['stem']}.json"

            # Skip if already done
            if video_key in completed:
                # Load existing transcript for chapter summary
                if output_file.exists():
                    ch_transcripts.append(json.loads(output_file.read_text()))
                skipped += 1
                done += 1
                print(f"  [{done}/{total}] SKIP (already done): {video_info['filename']}")
                continue

            done += 1
            elapsed_total = time.time() - overall_start
            # Calculate ETA based on actual processing time (exclude skipped)
            processed = done - skipped
            if processed > 1 and elapsed_total > 0:
                avg_per_video = elapsed_total / (processed - 1)  # -1 because current not done yet
                remaining = total - done
                eta = remaining * avg_per_video
                eta_str = f"  ~{format_timestamp(eta)} remaining"
            else:
                eta_str = ""

            print(f"  [{done}/{total}] Transcribing: {video_info['filename']}{eta_str}")

            try:
                transcript = transcribe_video(video_info, args.model, verbose=args.verbose)

                # Save individual transcript
                output_file.write_text(json.dumps(transcript, indent=2, ensure_ascii=False))

                ch_transcripts.append(transcript)
                completed.add(video_key)

                # Save checkpoint after each video
                save_checkpoint(completed)

                duration = transcript["metadata"]["duration_formatted"]
                words = transcript["metadata"]["word_count"]
                conf = transcript["metadata"]["avg_confidence"]
                t_time = transcript["metadata"]["transcription_time_seconds"]
                print(f"           Done: {duration} duration, {words} words, "
                      f"{conf:.1%} confidence, {t_time:.1f}s processing")

            except Exception as e:
                print(f"           ERROR: {e}")
                errors.append({"file": str(video_info["path"]), "error": str(e)})

        # Build chapter summary
        if ch_transcripts:
            summary = build_chapter_summary(ch_slug, ch_transcripts)
            summary_file = ch_output_dir / "_chapter_summary.json"
            summary_file.write_text(json.dumps(summary, indent=2, ensure_ascii=False))
            print(f"\n  Chapter summary: {summary['total_words']} total words, "
                  f"{summary['total_duration_formatted']} duration\n")

    # Build master index
    total_elapsed = time.time() - overall_start
    master_index = {
        "title": "Guidewire Academy Video Transcriptions",
        "purpose": "RAG knowledge base for Guidewire InsuranceSuite developer training",
        "total_videos": len(videos),
        "total_transcribed": len(completed),
        "total_errors": len(errors),
        "total_skipped": skipped,
        "processing_time_seconds": round(total_elapsed, 2),
        "processing_time_formatted": format_timestamp(total_elapsed),
        "model_used": args.model,
        "generated_at": datetime.now().isoformat(),
        "chapters": {},
        "errors": errors,
    }

    for ch_slug in sorted(chapters.keys()):
        summary_file = OUTPUT_DIR / ch_slug / "_chapter_summary.json"
        if summary_file.exists():
            summary = json.loads(summary_file.read_text())
            master_index["chapters"][ch_slug] = {
                "title": summary["chapter_title"],
                "video_count": summary["video_count"],
                "total_words": summary["total_words"],
                "total_duration": summary["total_duration_formatted"],
                "avg_confidence": summary["avg_confidence"],
            }

    index_file = OUTPUT_DIR / "_index.json"
    index_file.write_text(json.dumps(master_index, indent=2, ensure_ascii=False))

    # Final report
    print()
    print("=" * 70)
    print("TRANSCRIPTION COMPLETE")
    print("=" * 70)
    print(f"  Videos processed: {len(completed)}/{total}")
    print(f"  Errors: {len(errors)}")
    print(f"  Total time: {format_timestamp(total_elapsed)}")
    print(f"  Output: {OUTPUT_DIR}/")
    print(f"  Index: {index_file}")
    print()

    if errors:
        print("ERRORS:")
        for err in errors:
            print(f"  - {err['file']}: {err['error']}")


if __name__ == "__main__":
    main()
