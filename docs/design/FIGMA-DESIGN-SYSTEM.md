# Figma Design System Guide
## InTime v3 - Professional Staffing Platform Design

**Version:** 1.0
**Last Updated:** 2025-11-17
**Figma Link:** [To be created]

---

## Brand Colors (Extracted from intimeesolutions.com)

### Primary Palette
```css
--success-green: #10B981    /* Primary CTA, success states */
--trust-blue: #3B82F6       /* Secondary actions, links */
--wisdom-gray-700: #374151  /* Dark backgrounds, text */
--wisdom-gray-600: #4B5563  /* Secondary backgrounds */
--wisdom-gray-400: #9CA3AF  /* Tertiary text, borders */
--wisdom-gray-300: #D1D5DB  /* Light borders, dividers */
--white: #FFFFFF            /* Primary backgrounds, text on dark */
--black: #111827            /* Darkest text, backgrounds */
```

### Semantic Colors
```css
--success: #10B981
--error: #EF4444
--warning: #F59E0B
--info: #3B82F6
```

---

## Typography

### Font Stack
- **Primary:** Inter (Headings, UI)
- **Secondary:** System fonts (Body text)
- **Monospace:** JetBrains Mono (Code, data)

### Type Scale

| Name | Size | Weight | Line Height | Use Case |
|------|------|--------|-------------|----------|
| **Display** | 48px | Bold | 1.2 | Hero titles |
| **H1** | 36px | Bold | 1.3 | Page titles |
| **H2** | 30px | Bold | 1.4 | Section headers |
| **H3** | 24px | Semibold | 1.4 | Subsection headers |
| **H4** | 20px | Semibold | 1.5 | Card titles |
| **Body Large** | 18px | Regular | 1.6 | Lead paragraphs |
| **Body** | 16px | Regular | 1.6 | Primary text |
| **Body Small** | 14px | Regular | 1.5 | Secondary text |
| **Caption** | 12px | Regular | 1.4 | Labels, metadata |

---

## Spacing System

**Base Unit:** 4px

```
4px   → xs    (tight spacing)
8px   → sm    (compact elements)
12px  → md    (default spacing)
16px  → lg    (comfortable spacing)
24px  → xl    (generous spacing)
32px  → 2xl   (section spacing)
48px  → 3xl   (major sections)
64px  → 4xl   (page sections)
```

---

## Component Library

### Atoms

#### Buttons
```
Primary Button
- Background: --success-green
- Text: White
- Hover: Darken 10%
- Sizes: sm (32px), md (40px), lg (48px)

Secondary Button
- Background: Transparent
- Border: 2px solid --success-green
- Text: --success-green
- Hover: Background --success-green, Text white

Ghost Button
- Background: Transparent
- Text: --wisdom-gray-600
- Hover: Background --wisdom-gray-300
```

#### Input Fields
```
Default State
- Border: 1px solid --wisdom-gray-400
- Background: White
- Height: 40px
- Padding: 12px
- Border radius: 6px

Focus State
- Border: 2px solid --trust-blue
- Box shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)

Error State
- Border: 2px solid --error
- Helper text: --error
```

### Molecules

#### Card
```
- Background: White
- Border: 1px solid --wisdom-gray-300
- Border radius: 8px
- Padding: 24px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Hover: Shadow 0 4px 6px rgba(0,0,0,0.1)
```

#### Form Group
```
Structure:
- Label (14px, Semibold, --wisdom-gray-700)
- Input field
- Helper text (12px, Regular, --wisdom-gray-600)
- Error text (12px, Regular, --error)

Spacing:
- Label to Input: 8px
- Input to Helper: 4px
```

### Organisms

#### Navigation (Desktop)
```
Height: 64px
Background: White
Border bottom: 1px solid --wisdom-gray-300

Logo: Left aligned, 32px height
Primary Nav: Center
CTA Buttons: Right aligned
```

#### Dashboard Card
```
Components:
- Header (Title + Action button)
- Content area
- Footer (Metadata)

States:
- Default
- Loading (skeleton)
- Empty (illustration + CTA)
- Error (message + retry)
```

---

## Layout Grids

### Desktop (1440px design width)
- **Columns:** 12
- **Gutter:** 24px
- **Margin:** 48px

### Tablet (768px)
- **Columns:** 8
- **Gutter:** 16px
- **Margin:** 24px

### Mobile (375px)
- **Columns:** 4
- **Gutter:** 16px
- **Margin:** 16px

---

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px)

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px)

/* Desktop */
@media (min-width: 1025px)

/* Large Desktop */
@media (min-width: 1440px)
```

---

## Design Tokens (for developers)

```typescript
// src/styles/tokens.ts
export const tokens = {
  colors: {
    primary: '#10B981',
    secondary: '#3B82F6',
    // ... rest
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    // ... rest
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    // ... rest
  },
}
```

---

## Accessibility Guidelines

### Color Contrast
- **Text on background:** 4.5:1 minimum (WCAG AA)
- **Large text:** 3:1 minimum
- **UI components:** 3:1 minimum

### Focus States
- **Visible outline:** 2px solid --trust-blue
- **Offset:** 2px from element
- **Never remove focus indicators**

### Touch Targets
- **Minimum size:** 44×44px
- **Spacing between:** 8px minimum

---

**Last Updated:** 2025-11-17
**Owner:** Design Team
