# Design System V2: Premium Forest

**Theme Name:** Premium Forest (Ivory/Forest/Rust)
**Status:** Implementation Phase
**Source:** Based on `prototype.html`

## 1. Core Color Palette

The V2 system moves away from the strict "Beige & Black" to a warmer, more organic palette inspired by premium editorial design.

### Primary Colors
- **Ivory (Backgrounds):** `#FDFDF8` (Main background, warm white)
- **Charcoal (Text/Headings):** `#0A0A0B` (Primary text, near black)
- **Forest (Primary Brand):** `#1B4332` (Primary buttons, active states, badges)
- **Rust (Accent):** `#D4572A` (Call to action, highlights, gradients)

### Neutrals
- **White:** `#FFFFFF` (Card backgrounds)
- **Gray-100:** `#F5F5F5` (Subtle backgrounds)
- **Gray-200:** `#E5E5E5` (Borders)
- **Gray-300:** `#D4D4D4` (Disabled states)
- **Gray-400:** `#A3A3A3` (Secondary text)
- **Gray-500:** `#737373` (Metadata)

## 2. Typography

**Font Stack:**
`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`

**Scale:**
- **Headings:** Bold, Charcoal
- **Body:** Regular/Medium, Charcoal or Gray-500
- **Line Height:** 1.6 (Relaxed)

## 3. Shape & Spacing

**Border Radius:**
- **Cards/Modals:** `12px` (`rounded-xl`)
- **Buttons/Inputs:** `8px` (`rounded-lg`)
- **Badges:** `20px` (`rounded-full`)

**Shadows:**
- **Cards:** `0 2px 8px rgba(0,0,0,0.1)`
- **Hover:** `0 4px 12px rgba(0,0,0,0.15)`

## 4. UI Components

### Buttons
- **Primary:** Forest (`#1B4332`) background, White text, `rounded-lg`. Hover: Darker Forest.
- **Secondary:** Rust (`#D4572A`) background, White text. Hover: Darker Rust.
- **Ghost/Outline:** Transparent or White bg, Gray border.

### Cards
- Background: White
- Border: None or subtle Gray-200
- Shadow: Soft (`0 2px 8px`)
- Radius: `12px`

### Progress Bars
- Background: Gray-200
- Fill: Gradient (Forest to Rust)

## 5. Usage Guidelines
- **Gradients:** Use sparingly, mainly for progress bars or subtle accents.
- **Whitespace:** Generous padding (min `1.5rem` in cards).
- **Contrast:** Ensure Forest text on Ivory meets WCAG AA.


