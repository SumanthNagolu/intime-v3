#!/usr/bin/env python3
"""
Generate AI-narrated video from SRT transcript + enhanced video.
Uses OpenAI TTS to re-narrate, synced to original timestamps.
"""

import os
import re
import sys
import json
import subprocess
import tempfile
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
VOICE = "onyx"  # Deep, professional male voice. Options: alloy, echo, fable, onyx, nova, shimmer
MODEL = "tts-1-hd"  # High quality model
OUTPUT_FORMAT = "mp3"

# ── Paths ─────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
SRT_FILE = BASE_DIR / "output" / "ch01" / "01 - Guidewire Cloud Overview.srt"
ENHANCED_VIDEO = BASE_DIR / "output" / "ch01" / "01 - Guidewire Cloud Overview - Enhanced.mp4"
OUTPUT_VIDEO = BASE_DIR / "output" / "ch01" / "01 - Guidewire Cloud Overview - AI Narrated.mp4"
TEMP_DIR = BASE_DIR / "output" / "ch01" / "tts_segments"


def parse_srt(srt_path):
    """Parse SRT file into list of {index, start_ms, end_ms, text}."""
    with open(srt_path, "r") as f:
        content = f.read()

    segments = []
    blocks = re.split(r"\n\n+", content.strip())

    for block in blocks:
        lines = block.strip().split("\n")
        if len(lines) < 3:
            continue

        index = int(lines[0])
        time_match = re.match(
            r"(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})",
            lines[1],
        )
        if not time_match:
            continue

        g = time_match.groups()
        start_ms = (
            int(g[0]) * 3600000 + int(g[1]) * 60000 + int(g[2]) * 1000 + int(g[3])
        )
        end_ms = (
            int(g[4]) * 3600000 + int(g[5]) * 60000 + int(g[6]) * 1000 + int(g[7])
        )

        text = " ".join(lines[2:]).strip()
        segments.append(
            {"index": index, "start_ms": start_ms, "end_ms": end_ms, "text": text}
        )

    return segments


def merge_segments_into_chunks(segments, max_chars=4000):
    """Merge consecutive SRT segments into chunks under max_chars for TTS API."""
    chunks = []
    current_chunk = {
        "start_ms": segments[0]["start_ms"],
        "end_ms": segments[0]["end_ms"],
        "text": segments[0]["text"],
        "segment_indices": [0],
    }

    for i in range(1, len(segments)):
        seg = segments[i]
        gap_ms = seg["start_ms"] - current_chunk["end_ms"]
        combined_text = current_chunk["text"] + " " + seg["text"]

        # Merge if: text fits AND gap is small (< 3 seconds)
        if len(combined_text) < max_chars and gap_ms < 3000:
            current_chunk["text"] = combined_text
            current_chunk["end_ms"] = seg["end_ms"]
            current_chunk["segment_indices"].append(i)
        else:
            chunks.append(current_chunk)
            current_chunk = {
                "start_ms": seg["start_ms"],
                "end_ms": seg["end_ms"],
                "text": seg["text"],
                "segment_indices": [i],
            }

    chunks.append(current_chunk)
    return chunks


def generate_tts(text, output_path, api_key):
    """Generate TTS audio using OpenAI API."""
    from openai import OpenAI

    client = OpenAI(api_key=api_key)

    response = client.audio.speech.create(
        model=MODEL,
        voice=VOICE,
        input=text,
        response_format=OUTPUT_FORMAT,
        speed=1.0,
    )

    response.stream_to_file(str(output_path))
    return output_path


def get_audio_duration_ms(audio_path):
    """Get duration of audio file in milliseconds."""
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_format",
            str(audio_path),
        ],
        capture_output=True,
        text=True,
    )
    data = json.loads(result.stdout)
    return int(float(data["format"]["duration"]) * 1000)


def adjust_audio_tempo(input_path, output_path, target_duration_ms, actual_duration_ms):
    """Adjust audio speed to match target duration using ffmpeg atempo."""
    if actual_duration_ms == 0:
        return

    ratio = actual_duration_ms / target_duration_ms

    # atempo filter only supports 0.5 to 100.0
    # For extreme ratios, chain multiple atempo filters
    if ratio < 0.5:
        ratio = 0.5
    elif ratio > 2.0:
        # Chain atempo filters for ratios > 2.0
        filters = []
        remaining = ratio
        while remaining > 2.0:
            filters.append("atempo=2.0")
            remaining /= 2.0
        filters.append(f"atempo={remaining:.4f}")
        filter_str = ",".join(filters)
    else:
        filter_str = f"atempo={ratio:.4f}"

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(input_path),
            "-af",
            filter_str,
            "-acodec",
            "libmp3lame",
            "-q:a",
            "2",
            str(output_path),
        ],
        capture_output=True,
        check=True,
    )


def create_silence(duration_ms, output_path):
    """Create a silent audio segment of specified duration."""
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            f"anullsrc=r=44100:cl=stereo",
            "-t",
            f"{duration_ms / 1000:.3f}",
            "-acodec",
            "libmp3lame",
            "-q:a",
            "2",
            str(output_path),
        ],
        capture_output=True,
        check=True,
    )


def main():
    if not OPENAI_API_KEY:
        print("Error: OPENAI_API_KEY not set")
        sys.exit(1)

    print("=" * 60)
    print("AI NARRATION GENERATOR")
    print("=" * 60)

    # Step 1: Parse SRT
    print("\n[1/5] Parsing SRT transcript...")
    segments = parse_srt(SRT_FILE)
    print(f"  Found {len(segments)} subtitle segments")

    # Step 2: Merge into chunks
    print("\n[2/5] Merging into TTS-friendly chunks...")
    chunks = merge_segments_into_chunks(segments)
    print(f"  Created {len(chunks)} chunks for TTS generation")
    total_chars = sum(len(c["text"]) for c in chunks)
    print(f"  Total characters: {total_chars:,}")
    estimated_cost = (total_chars / 1_000_000) * 15.0  # $15 per 1M chars for tts-1-hd
    print(f"  Estimated cost: ${estimated_cost:.2f}")

    # Step 3: Generate TTS for each chunk
    print("\n[3/5] Generating AI narration with OpenAI TTS...")
    TEMP_DIR.mkdir(parents=True, exist_ok=True)

    tts_files = []
    for i, chunk in enumerate(chunks):
        tts_path = TEMP_DIR / f"tts_{i:04d}.mp3"
        adjusted_path = TEMP_DIR / f"adjusted_{i:04d}.mp3"

        target_duration_ms = chunk["end_ms"] - chunk["start_ms"]

        if tts_path.exists():
            print(f"  [{i+1}/{len(chunks)}] Using cached TTS segment")
        else:
            print(
                f"  [{i+1}/{len(chunks)}] Generating TTS ({len(chunk['text'])} chars, "
                f"target: {target_duration_ms/1000:.1f}s)..."
            )
            generate_tts(chunk["text"], tts_path, OPENAI_API_KEY)

        # Get actual duration
        actual_duration_ms = get_audio_duration_ms(tts_path)

        # Adjust tempo to match target timing
        if abs(actual_duration_ms - target_duration_ms) > 500:  # More than 0.5s off
            print(
                f"    Adjusting tempo: {actual_duration_ms/1000:.1f}s → {target_duration_ms/1000:.1f}s "
                f"(ratio: {actual_duration_ms/target_duration_ms:.2f}x)"
            )
            adjust_audio_tempo(
                tts_path, adjusted_path, target_duration_ms, actual_duration_ms
            )
            tts_files.append(
                {"path": adjusted_path, "start_ms": chunk["start_ms"], "end_ms": chunk["end_ms"]}
            )
        else:
            tts_files.append(
                {"path": tts_path, "start_ms": chunk["start_ms"], "end_ms": chunk["end_ms"]}
            )

    # Step 4: Concatenate with proper timing (silence gaps)
    print("\n[4/5] Assembling final audio track with timing...")
    concat_list = TEMP_DIR / "concat.txt"
    audio_parts = []

    for i, tts_file in enumerate(tts_files):
        # Add silence before first segment or between segments
        if i == 0 and tts_file["start_ms"] > 0:
            silence_path = TEMP_DIR / f"silence_start.mp3"
            create_silence(tts_file["start_ms"], silence_path)
            audio_parts.append(silence_path)
        elif i > 0:
            gap_ms = tts_file["start_ms"] - tts_files[i - 1]["end_ms"]
            if gap_ms > 100:  # Only add silence for gaps > 100ms
                silence_path = TEMP_DIR / f"silence_{i:04d}.mp3"
                create_silence(gap_ms, silence_path)
                audio_parts.append(silence_path)

        audio_parts.append(tts_file["path"])

    # Write concat list
    with open(concat_list, "w") as f:
        for part in audio_parts:
            f.write(f"file '{part}'\n")

    # Concatenate all parts
    final_audio = TEMP_DIR / "final_narration.mp3"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_list),
            "-acodec",
            "libmp3lame",
            "-q:a",
            "2",
            str(final_audio),
        ],
        capture_output=True,
        check=True,
    )
    print(f"  Final audio: {final_audio}")

    # Step 5: Merge with enhanced video
    print("\n[5/5] Merging AI narration with enhanced video...")
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(ENHANCED_VIDEO),
            "-i",
            str(final_audio),
            "-c:v",
            "copy",  # Keep video as-is
            "-map",
            "0:v:0",  # Video from first input
            "-map",
            "1:a:0",  # Audio from second input (new narration)
            "-shortest",  # End when shortest stream ends
            "-movflags",
            "+faststart",
            str(OUTPUT_VIDEO),
        ],
        capture_output=True,
        check=True,
    )

    # Summary
    output_size = OUTPUT_VIDEO.stat().st_size / (1024 * 1024)
    print("\n" + "=" * 60)
    print("COMPLETE!")
    print("=" * 60)
    print(f"  Output: {OUTPUT_VIDEO}")
    print(f"  Size: {output_size:.1f}MB")
    print(f"  Voice: {VOICE} ({MODEL})")
    print(f"  Cost: ~${estimated_cost:.2f}")
    print("=" * 60)


if __name__ == "__main__":
    main()
