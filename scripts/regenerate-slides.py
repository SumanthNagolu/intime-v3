#!/usr/bin/env python3
"""
Rebrand Guidewire academy slides with InTime template.

Strategy:
  - Title slides (slide 1): Generate InTime branded title card
  - Image slides (hasImage: true): Rebrand original - remove G logo, replace teal
    accent with gold, add InTime header/footer. Preserves ALL visual content.
  - Text-only slides (hasImage: false): Render from scratch using notes content

Usage:
    python3 scripts/regenerate-slides.py [--chapter ch04] [--lesson 01] [--dry-run]
"""

import os
import sys
import json
import re
import argparse
from PIL import Image, ImageDraw, ImageFont

# ── Paths ──────────────────────────────────────────────────────────────────────
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_DIR = os.path.join(PROJECT_DIR, "public", "academy", "guidewire", "content")
SLIDES_DIR = os.path.join(PROJECT_DIR, "public", "academy", "guidewire", "slides")
BACKUP_DIR = os.path.join(PROJECT_DIR, "public", "academy", "guidewire", "slides-original")

# ── InTime Brand Colors ────────────────────────────────────────────────────────
CHARCOAL_900 = (23, 23, 23)
CHARCOAL_800 = (38, 38, 38)
CHARCOAL_700 = (55, 55, 55)
CHARCOAL_600 = (82, 82, 82)
CHARCOAL_500 = (115, 115, 115)
CHARCOAL_400 = (150, 150, 150)
CHARCOAL_300 = (180, 180, 180)
CHARCOAL_200 = (210, 210, 210)
CHARCOAL_100 = (235, 235, 235)
CREAM = (253, 251, 247)
GOLD_500 = (201, 169, 97)
GOLD_400 = (212, 175, 55)
GOLD_300 = (220, 195, 130)
WHITE = (255, 255, 255)

# ── Output Dimensions ──────────────────────────────────────────────────────────
SLIDE_W = 1280
SLIDE_H = 720
HEADER_H = 38
GOLD_STRIPE_H = 2
FOOTER_H = 24
ACCENT_W = 5
CONTENT_TOP = HEADER_H + GOLD_STRIPE_H
CONTENT_BOTTOM = SLIDE_H - FOOTER_H

# ── Fonts ──────────────────────────────────────────────────────────────────────
AVENIR_NEXT = "/System/Library/Fonts/Avenir Next.ttc"
HELVETICA_NEUE = "/System/Library/Fonts/HelveticaNeue.ttc"
FUTURA = "/System/Library/Fonts/Supplemental/Futura.ttc"


def load_fonts():
    fonts = {}
    try:
        # Title slide
        fonts["title_large"] = ImageFont.truetype(AVENIR_NEXT, 42, index=0)     # Bold
        fonts["title_chapter"] = ImageFont.truetype(AVENIR_NEXT, 16, index=5)   # Medium
        fonts["title_sub"] = ImageFont.truetype(HELVETICA_NEUE, 18, index=0)
        fonts["title_brand"] = ImageFont.truetype(FUTURA, 14, index=0)
        fonts["title_medium"] = ImageFont.truetype(AVENIR_NEXT, 26, index=2)    # Demi Bold

        # Header / footer
        fonts["header_brand"] = ImageFont.truetype(FUTURA, 12, index=2)
        fonts["header_info"] = ImageFont.truetype(HELVETICA_NEUE, 11, index=0)
        fonts["footer_text"] = ImageFont.truetype(HELVETICA_NEUE, 10, index=0)

        # Content slides (for text-only fallback)
        fonts["slide_title"] = ImageFont.truetype(AVENIR_NEXT, 26, index=0)     # Bold
        fonts["slide_subtitle"] = ImageFont.truetype(AVENIR_NEXT, 18, index=2)  # Demi Bold
        fonts["body"] = ImageFont.truetype(HELVETICA_NEUE, 16, index=0)
        fonts["body_bold"] = ImageFont.truetype(HELVETICA_NEUE, 16, index=1)
        fonts["body_small"] = ImageFont.truetype(HELVETICA_NEUE, 14, index=0)
        fonts["caption"] = ImageFont.truetype(HELVETICA_NEUE, 12, index=0)
        fonts["label"] = ImageFont.truetype(FUTURA, 11, index=0)
    except Exception as e:
        print(f"  Font error: {e}")
        default = ImageFont.load_default()
        for key in ["title_large", "title_chapter", "title_sub", "title_brand",
                     "title_medium", "header_brand", "header_info", "footer_text",
                     "slide_title", "slide_subtitle", "body", "body_bold",
                     "body_small", "caption", "label"]:
            fonts.setdefault(key, default)
    return fonts


# ── Utility ────────────────────────────────────────────────────────────────────

def wrap_text(draw, text, font, max_width):
    if not text:
        return []
    words = text.split()
    lines, current = [], ""
    for word in words:
        test = f"{current} {word}".strip() if current else word
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] > max_width and current:
            lines.append(current)
            current = word
        else:
            current = test
    if current:
        lines.append(current)
    return lines


def is_text_fallback(img):
    """
    Detect if an image is a text-rendered fallback from the extraction script
    (dark header bar at top, cream body with "Slide N" text).
    """
    w, h = img.size
    pixels = img.load()
    # Check top 5 rows for dark pixels
    dark_count = 0
    total = 0
    for y in range(min(5, h)):
        for x in range(0, w, 8):  # sample every 8th pixel
            r, g, b = pixels[x, y]
            if r < 45 and g < 45 and b < 45:
                dark_count += 1
            total += 1
    return total > 0 and dark_count / total > 0.7


# ── Branding Removal ───────────────────────────────────────────────────────────

def remove_gw_branding(img):
    """
    Remove Guidewire branding from a slide image:
    1. G logo in top-right corner → paint white
    2. Teal accent bar on left side → paint gold
    """
    w, h = img.size
    pixels = img.load()

    # 1. Remove G logo (top-right corner)
    # Pass A: Pixel-level detection for teal/blue pixels in wider region
    for y in range(min(100, h)):
        for x in range(max(0, w - 130), w):
            r, g, b = pixels[x, y]
            # Any pixel where blue dominates red = part of G logo
            if b > r + 30 and b > 60:
                pixels[x, y] = WHITE

    # Pass B: Paint white rectangle over the exact G logo footprint
    # to catch anti-aliased gray remnants that the color detection misses.
    # The G logo is always in a dedicated corner space with no content behind it.
    g_left = max(0, w - 90)
    g_top = 5
    g_right = w - 3
    g_bottom = min(85, h)
    for y in range(g_top, g_bottom):
        for x in range(g_left, g_right):
            r, g, b = pixels[x, y]
            # Only paint non-white pixels (preserve the white background)
            if r < 245 or g < 245 or b < 245:
                pixels[x, y] = WHITE

    # 2. Replace teal accent bar with gold (left edge, ~35x110px region)
    for y in range(min(110, h)):
        for x in range(min(35, w)):
            r, g, b = pixels[x, y]
            # Any blue-dominant pixel in the accent bar region
            if b > r + 30 and b > 60:
                pixels[x, y] = GOLD_500

    return img


# ── Template Elements ──────────────────────────────────────────────────────────

def draw_header(draw, chapter_num, lesson_title, slide_num, total_slides, fonts):
    """Draw the InTime header bar."""
    # Header background
    draw.rectangle([0, 0, SLIDE_W, HEADER_H], fill=CHARCOAL_900)
    # Gold stripe below header
    draw.rectangle([0, HEADER_H, SLIDE_W, HEADER_H + GOLD_STRIPE_H], fill=GOLD_500)

    # Brand name
    draw.text((14, 10), "INTIME", fill=GOLD_500, font=fonts["header_brand"])
    bw = draw.textlength("INTIME", font=fonts["header_brand"])
    dx = 14 + bw + 8
    # Separator dot
    draw.ellipse([dx, 16, dx + 4, 20], fill=CHARCOAL_600)
    # Chapter + lesson info
    info = f"Chapter {chapter_num}  •  {lesson_title}"
    if len(info) > 60:
        info = info[:57] + "..."
    draw.text((dx + 10, 12), info, fill=CHARCOAL_400, font=fonts["header_info"])
    # Slide counter
    counter = f"{slide_num} / {total_slides}"
    cw = draw.textlength(counter, font=fonts["header_info"])
    draw.text((SLIDE_W - cw - 14, 12), counter, fill=CHARCOAL_500, font=fonts["header_info"])


def draw_footer(draw, chapter_num, lesson_num, fonts):
    """Draw the InTime footer."""
    fy = SLIDE_H - FOOTER_H
    # Gold top border
    draw.rectangle([0, fy, SLIDE_W, fy + 1], fill=GOLD_500)
    # Footer background
    draw.rectangle([0, fy + 1, SLIDE_W, SLIDE_H], fill=(250, 248, 244))
    # Left text
    draw.text((14, fy + 7), "InTime Academy  •  Guidewire Training",
              fill=CHARCOAL_400, font=fonts["footer_text"])
    # Right text
    ct = f"Ch.{chapter_num} L{lesson_num}"
    cw = draw.textlength(ct, font=fonts["footer_text"])
    draw.text((SLIDE_W - cw - 14, fy + 7), ct, fill=CHARCOAL_400, font=fonts["footer_text"])


def draw_left_accent(draw):
    """Draw the gold left accent bar in content area."""
    draw.rectangle([0, CONTENT_TOP, ACCENT_W, CONTENT_BOTTOM], fill=GOLD_500)


# ── Slide Renderers ────────────────────────────────────────────────────────────

def render_title_slide(lesson_title, chapter_title, chapter_num, lesson_num,
                       total_slides, fonts):
    """Generate InTime-branded title slide for lesson opening."""
    img = Image.new("RGB", (SLIDE_W, SLIDE_H), CHARCOAL_900)
    draw = ImageDraw.Draw(img)

    # Subtle gradient
    for y in range(SLIDE_H):
        factor = y / SLIDE_H * 0.06
        r = min(255, int(CHARCOAL_900[0] + factor * 30))
        g = min(255, int(CHARCOAL_900[1] + factor * 25))
        b = min(255, int(CHARCOAL_900[2] + factor * 20))
        draw.rectangle([0, y, SLIDE_W, y], fill=(r, g, b))

    # Gold corner accents
    for i in range(100):
        a = max(0, int((1 - i / 100) * 0.12 * 255))
        c = tuple(min(255, int(CHARCOAL_900[j] + (GOLD_500[j] - CHARCOAL_900[j]) * a / 255)) for j in range(3))
        draw.line([(SLIDE_W - 100 + i, 0), (SLIDE_W, 100 - i)], fill=c)
    for i in range(60):
        a = max(0, int((1 - i / 60) * 0.08 * 255))
        c = tuple(min(255, int(CHARCOAL_900[j] + (GOLD_500[j] - CHARCOAL_900[j]) * a / 255)) for j in range(3))
        draw.line([(0, SLIDE_H - 60 + i), (60 - i, SLIDE_H)], fill=c)

    # Left gold bar
    draw.rectangle([0, 0, 4, SLIDE_H], fill=GOLD_500)

    lm = 72
    y = 90

    # Brand
    draw.text((lm, y), "INTIME ACADEMY", fill=GOLD_500, font=fonts["title_brand"])
    y += 28
    draw.rectangle([lm, y, lm + 180, y + 2], fill=GOLD_500)
    y += 36

    # Chapter
    draw.text((lm, y), f"Chapter {chapter_num}", fill=GOLD_300, font=fonts["title_chapter"])
    y += 26
    for line in wrap_text(draw, chapter_title.upper(), fonts["title_medium"], SLIDE_W - lm - 100):
        draw.text((lm, y), line, fill=CHARCOAL_400, font=fonts["title_medium"])
        y += 34
    y += 18

    draw.rectangle([lm, y, lm + 360, y + 2], fill=GOLD_500)
    y += 30

    # Lesson title
    for line in wrap_text(draw, lesson_title, fonts["title_large"], SLIDE_W - lm - 80):
        draw.text((lm, y), line, fill=WHITE, font=fonts["title_large"])
        y += 50
    y += 16

    draw.text((lm, y), f"Lesson {lesson_num}  •  {total_slides} slides",
              fill=CHARCOAL_500, font=fonts["title_sub"])

    # Bottom
    draw.rectangle([lm, SLIDE_H - 72, SLIDE_W - 72, SLIDE_H - 70], fill=GOLD_500)
    draw.text((lm, SLIDE_H - 54), "GUIDEWIRE TRAINING PROGRAM",
              fill=CHARCOAL_500, font=fonts["title_brand"])

    return img


def rebrand_slide(original_path, chapter_num, lesson_title, lesson_num,
                  slide_num, total_slides, fonts):
    """
    Rebrand a Guidewire slide: preserve ALL original visual content
    (diagrams, icons, screenshots, text), only swap branding.
    """
    img = Image.open(original_path).convert("RGB")
    orig_w, orig_h = img.size

    # Remove Guidewire branding from original
    img = remove_gw_branding(img)

    # Create output canvas (white background for content area to match originals)
    canvas = Image.new("RGB", (SLIDE_W, SLIDE_H), WHITE)
    draw = ImageDraw.Draw(canvas)

    # Draw InTime template elements
    draw_header(draw, chapter_num, lesson_title, slide_num, total_slides, fonts)
    draw_footer(draw, chapter_num, lesson_num, fonts)
    draw_left_accent(draw)

    # Calculate content area
    content_h = CONTENT_BOTTOM - CONTENT_TOP
    content_w = SLIDE_W - ACCENT_W

    # Scale original to fit in content area
    scale = min(content_w / orig_w, content_h / orig_h)
    new_w = int(orig_w * scale)
    new_h = int(orig_h * scale)

    img_resized = img.resize((new_w, new_h), Image.LANCZOS)

    # Position: after left accent, vertically centered in content area
    x_off = ACCENT_W + (content_w - new_w) // 2
    y_off = CONTENT_TOP + (content_h - new_h) // 2

    canvas.paste(img_resized, (x_off, y_off))

    return canvas


def render_content_slide(content, chapter_num, lesson_title, lesson_num,
                         slide_num, total_slides, fonts):
    """
    Render a slide from scratch using parsed notes content.
    Used for slides that had no embedded images in the original PPTX.
    """
    img = Image.new("RGB", (SLIDE_W, SLIDE_H), CREAM)
    draw = ImageDraw.Draw(img)

    draw_header(draw, chapter_num, lesson_title, slide_num, total_slides, fonts)
    draw_left_accent(draw)
    draw_footer(draw, chapter_num, lesson_num, fonts)

    lm = 56  # left margin
    rm = 60  # right margin
    max_w = SLIDE_W - lm - rm
    y = CONTENT_TOP + 28

    title = content.get("title", "")
    points = content.get("points", [])
    is_demo = content.get("is_demo", False)
    is_instructions = content.get("is_instructions", False)

    # Demo/Lab badges
    if is_demo:
        draw.rounded_rectangle([lm, y, lm + 120, y + 26], radius=4, fill=GOLD_500)
        draw.text((lm + 12, y + 5), "DEMONSTRATION", fill=WHITE, font=fonts["label"])
        y += 40

    if is_instructions:
        draw.rounded_rectangle([lm, y, lm + 130, y + 26], radius=4, fill=CHARCOAL_700)
        draw.text((lm + 12, y + 5), "LAB INSTRUCTIONS", fill=WHITE, font=fonts["label"])
        y += 40

    # Title
    if title:
        lines = wrap_text(draw, title, fonts["slide_title"], max_w)
        for line in lines:
            draw.text((lm, y), line, fill=CHARCOAL_900, font=fonts["slide_title"])
            y += 34
        y += 6
        title_w = min(draw.textlength(title, font=fonts["slide_title"]), 300)
        draw.rectangle([lm, y, lm + title_w, y + 2], fill=GOLD_500)
        y += 24

    # Body bullet points
    max_y = CONTENT_BOTTOM - 16
    for point in points:
        if y > max_y - 30:
            break
        # Gold bullet
        draw.ellipse([lm, y + 7, lm + 6, y + 13], fill=GOLD_500)
        lines = wrap_text(draw, point, fonts["body"], max_w - 24)
        for line in lines:
            if y > max_y:
                break
            draw.text((lm + 20, y), line, fill=CHARCOAL_700, font=fonts["body"])
            y += 22
        y += 10

    # Empty slide placeholder
    if not title and not points:
        draw.text((SLIDE_W // 2 - 60, SLIDE_H // 2 - 10),
                  f"Slide {slide_num}", fill=CHARCOAL_300, font=fonts["slide_subtitle"])

    return img


# ── Content Parsing ────────────────────────────────────────────────────────────

def parse_notes_to_content(notes, lesson_title):
    """Parse speaker notes into structured slide content."""
    if not notes or not notes.strip():
        return {"title": lesson_title, "points": [], "is_demo": False, "is_instructions": False}

    notes = notes.strip()

    is_demo = any(notes.lower().startswith(p) for p in
                  ["show learners", "demonstrate", "walk through", "show students",
                   "have students", "show the learners", "ask learners"])
    is_instructions = "virtual machine" in notes.lower() or "vm" in notes.lower()

    paragraphs = [p.strip() for p in re.split(r'\n\s*\n|\n', notes) if p.strip()]

    title = ""
    body_paras = paragraphs

    if paragraphs:
        first = paragraphs[0]
        if (len(first) < 80 and not first.endswith('.') and not first.endswith(',')) or \
           re.match(r'^[A-Z][\w\s\-:()]+$', first):
            title = first
            body_paras = paragraphs[1:]

    if not title:
        title = lesson_title

    points = []
    for para in body_paras:
        sentences = re.split(r'(?<=[.!?])\s+', para)
        for sent in sentences:
            sent = sent.strip()
            if len(sent) > 15:
                if len(sent) > 150:
                    sent = sent[:147] + "..."
                points.append(sent)

    return {"title": title, "points": points[:7], "is_demo": is_demo, "is_instructions": is_instructions}


# ── Main Processing ────────────────────────────────────────────────────────────

def process_lesson(chapter_slug, chapter_title, chapter_num, lesson_info, fonts,
                   dry_run=False):
    """Process all slides for a single lesson."""
    lesson_id = lesson_info["lessonId"]
    lesson_num_str = lesson_id.split("-l")[1]
    lesson_num = int(lesson_num_str)
    lesson_title = lesson_info["title"]
    total_slides = lesson_info.get("totalSlides", 0)

    # Load lesson JSON for slide metadata
    lesson_path = os.path.join(CONTENT_DIR, chapter_slug, f"lesson-{lesson_num_str}.json")
    slides_data = []
    if os.path.exists(lesson_path):
        with open(lesson_path) as f:
            lesson_data = json.load(f)
            slides_data = lesson_data.get("slides", [])

    # Directories
    slide_dir = os.path.join(SLIDES_DIR, chapter_slug, f"lesson-{lesson_num_str}")
    backup_dir = os.path.join(BACKUP_DIR, chapter_slug, f"lesson-{lesson_num_str}")

    if not os.path.isdir(slide_dir):
        return 0, {"title": 0, "rebrand": 0, "content": 0}

    stats = {"title": 0, "rebrand": 0, "content": 0}
    count = 0

    existing_files = sorted([f for f in os.listdir(slide_dir)
                             if f.startswith("slide-") and f.endswith(".png")])

    for filename in existing_files:
        slide_num = int(filename.replace("slide-", "").replace(".png", ""))
        out_path = os.path.join(slide_dir, filename)
        bak_path = os.path.join(backup_dir, filename)

        # Find slide metadata from JSON
        slide_data = None
        for sd in slides_data:
            if sd.get("slideNumber") == slide_num:
                slide_data = sd
                break

        has_image = slide_data.get("hasImage", False) if slide_data else False

        # ── Classification ──
        if slide_num == 1:
            mode = "title"
        elif has_image and os.path.exists(bak_path):
            # Verify it's actually a real image slide (not a text fallback from extraction)
            try:
                orig_img = Image.open(bak_path).convert("RGB")
                if is_text_fallback(orig_img):
                    mode = "content"
                else:
                    mode = "rebrand"
            except Exception:
                mode = "content"
        else:
            mode = "content"

        stats[mode] += 1

        if dry_run:
            count += 1
            continue

        # ── Render ──
        if mode == "title":
            new_img = render_title_slide(
                lesson_title, chapter_title, chapter_num,
                lesson_num, total_slides, fonts
            )
        elif mode == "rebrand":
            try:
                new_img = rebrand_slide(
                    bak_path, chapter_num, lesson_title,
                    lesson_num, slide_num, total_slides, fonts
                )
            except Exception as e:
                # Fallback to content render
                notes = slide_data.get("notes", "") if slide_data else ""
                content = parse_notes_to_content(notes, lesson_title)
                new_img = render_content_slide(
                    content, chapter_num, lesson_title, lesson_num,
                    slide_num, total_slides, fonts
                )
        else:  # content
            notes = slide_data.get("notes", "") if slide_data else ""
            content = parse_notes_to_content(notes, lesson_title)
            new_img = render_content_slide(
                content, chapter_num, lesson_title, lesson_num,
                slide_num, total_slides, fonts
            )

        new_img.save(out_path, "PNG", optimize=True)
        count += 1

    return count, stats


def main():
    parser = argparse.ArgumentParser(description="Rebrand slides with InTime template")
    parser.add_argument("--chapter", type=str, help="Process only this chapter (e.g., ch04)")
    parser.add_argument("--lesson", type=str, help="Process only this lesson (e.g., 01)")
    parser.add_argument("--dry-run", action="store_true", help="Classify only, don't render")
    args = parser.parse_args()

    print("=" * 64)
    print("  INTIME ACADEMY - SLIDE REBRANDING")
    print("  Strategy: Rebrand originals, preserve all visual content")
    print("=" * 64)

    fonts = load_fonts()
    print("  Fonts loaded")

    chapter_slugs = sorted([d for d in os.listdir(SLIDES_DIR)
                            if os.path.isdir(os.path.join(SLIDES_DIR, d)) and d.startswith("ch")])
    if args.chapter:
        chapter_slugs = [s for s in chapter_slugs if s == args.chapter]

    grand_total = 0
    grand_stats = {"title": 0, "rebrand": 0, "content": 0}

    for slug in chapter_slugs:
        index_path = os.path.join(CONTENT_DIR, slug, "index.json")
        if not os.path.exists(index_path):
            continue
        with open(index_path) as f:
            chapter_data = json.load(f)

        chapter_title = chapter_data["title"]
        chapter_num = chapter_data["chapterId"]

        print(f"\n{'─' * 64}")
        print(f"  Chapter {chapter_num}: {chapter_title} ({slug})")
        print(f"{'─' * 64}")

        for lesson in chapter_data.get("lessons", []):
            ln = lesson["lessonId"].split("-l")[1]
            if args.lesson and ln != args.lesson:
                continue

            slide_dir = os.path.join(SLIDES_DIR, slug, f"lesson-{ln}")
            if not os.path.isdir(slide_dir):
                continue
            file_count = len([f for f in os.listdir(slide_dir)
                              if f.startswith("slide-") and f.endswith(".png")])
            if file_count == 0:
                continue

            count, stats = process_lesson(
                slug, chapter_title, chapter_num, lesson, fonts,
                dry_run=args.dry_run
            )

            action = "classified" if args.dry_run else "rendered"
            detail = f"T:{stats['title']} R:{stats['rebrand']} C:{stats['content']}"
            print(f"  L{ln}: {lesson['title'][:45]:<45} {count:>3} slides {action}  [{detail}]")

            grand_total += count
            for k in grand_stats:
                grand_stats[k] += stats[k]

    print(f"\n{'=' * 64}")
    action = "Classified" if args.dry_run else "Rendered"
    print(f"  {action}: {grand_total} total slides")
    print(f"  Title cards: {grand_stats['title']}")
    print(f"  Rebranded (visual content preserved): {grand_stats['rebrand']}")
    print(f"  Content from scratch (text-only): {grand_stats['content']}")
    print(f"{'=' * 64}")


if __name__ == "__main__":
    main()
