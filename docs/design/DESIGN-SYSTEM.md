# InTime v3 Design System

**Last Updated:** 2025-11-18
**Status:** Active
**Design Philosophy:** Minimal, Clean, Professional

---

## Overview

InTime v3 follows a **minimal design aesthetic** inspired by modern SaaS companies like Anthropic/Claude, Linear, and Vercel. The design prioritizes clarity, readability, and conversion over decorative elements.

### Core Principles

1. **Minimalism First** - Less is more. Remove anything that doesn't serve a clear purpose
2. **Content Over Decoration** - Typography and content hierarchy drive the design
3. **One Accent Color** - Use color sparingly for maximum impact
4. **White Space is Design** - Generous spacing creates breathing room
5. **Consistency** - Repeat patterns, don't reinvent

---

## Color Palette

### Primary Colors

```css
/* Background */
--bg-primary: #F5F3EF;     /* Light beige - main background */
--bg-secondary: #FFFFFF;   /* Pure white - cards, forms */
--bg-dark: #000000;        /* Black - footer, callouts */

/* Text */
--text-primary: #000000;   /* Black - headings, body */
--text-secondary: #4B5563; /* Gray-600 - secondary text */
--text-tertiary: #9CA3AF;  /* Gray-400 - metadata, labels */

/* Accent */
--accent-primary: #C87941; /* Coral/Orange - underlines, highlights */
--accent-hover: #B56A34;   /* Darker coral - hover states */

/* Borders */
--border-light: #E5E7EB;   /* Gray-200 - subtle borders */
--border-medium: #D1D5DB;  /* Gray-300 - default borders */
--border-heavy: #000000;   /* Black - emphasis borders */
```

### Usage Rules

- **Backgrounds:** Use beige (#F5F3EF) for main sections, white for cards/forms
- **Text:** Always black for headings, gray-700 for body text
- **Accent:** Use coral (#C87941) ONLY for underlines and critical highlights
- **Borders:** Default to gray-200, use black for emphasis

---

## Typography

### Font Stack

```css
/* Headings */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

/* Body */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

/* Monospace (for code, metrics) */
font-family: "SF Mono", Monaco, "Cascadia Code", "Courier New", monospace;
```

### Type Scale

```css
/* Display (Hero Headlines) */
--text-8xl: 96px;   /* 6rem */
--text-7xl: 72px;   /* 4.5rem */
--text-6xl: 60px;   /* 3.75rem */

/* Headings */
--text-5xl: 48px;   /* 3rem - H1 */
--text-4xl: 36px;   /* 2.25rem - H2 */
--text-3xl: 30px;   /* 1.875rem - H3 */
--text-2xl: 24px;   /* 1.5rem - H4 */
--text-xl: 20px;    /* 1.25rem - H5 */

/* Body */
--text-lg: 18px;    /* 1.125rem - Large body */
--text-base: 16px;  /* 1rem - Default body */
--text-sm: 14px;    /* 0.875rem - Small text */
--text-xs: 12px;    /* 0.75rem - Micro text */
```

### Font Weights

```css
--font-bold: 700;      /* Headings */
--font-semibold: 600;  /* Subheadings */
--font-medium: 500;    /* Emphasis */
--font-normal: 400;    /* Body */
```

### Line Heights

```css
--leading-tight: 1.1;     /* Hero headlines */
--leading-snug: 1.25;     /* Large headings */
--leading-normal: 1.5;    /* Body text */
--leading-relaxed: 1.625; /* Comfortable reading */
```

---

## Spacing System

### Scale (Based on 4px grid)

```css
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-16: 64px;
--spacing-20: 80px;
--spacing-24: 96px;
--spacing-32: 128px;
```

### Usage Guidelines

- **Component padding:** 32px (spacing-8) or 48px (spacing-12)
- **Section spacing:** 128px (spacing-32) vertical
- **Element gaps:** 8px, 16px, or 24px
- **Content max-width:** 1280px (max-w-7xl) or 1152px (max-w-6xl)

---

## Components

### Buttons

```tsx
// Primary Button
className="bg-black text-white px-8 py-4 font-medium hover:bg-gray-800 transition-colors"

// Secondary Button (Text Link)
className="underline font-medium text-black hover:no-underline"

// Disabled State
className="opacity-50 cursor-not-allowed"
```

**Rules:**
- Use black background for primary actions
- Simple hover states (darken slightly)
- No rounded corners (or minimal border-radius if required for accessibility)
- Font-medium weight, not bold

### Forms

```tsx
// Input
className="w-full px-6 py-4 border-2 border-gray-300 focus:border-black focus:outline-none text-gray-900"

// Label
className="block text-sm font-medium text-gray-900 mb-2"

// Error State
className="border-red-500"
```

**Rules:**
- 2px borders (not 1px)
- No rounded corners
- Black focus state (not colored)
- Generous padding (py-4, px-6)

### Cards

```tsx
// Default Card
className="bg-white border-2 border-gray-200 p-8"

// Hover State
className="border-gray-200 hover:border-black transition-colors"

// Dark Card
className="bg-black text-white border-2 border-black p-12"
```

**Rules:**
- 2px borders
- White or black backgrounds only
- Padding: 32px or 48px
- Subtle hover states (border color change)

### Typography Patterns

```tsx
// Hero Headline with Underline
<h1 className="text-6xl lg:text-7xl font-bold text-black leading-tight">
  Turn every conversation into{' '}
  <span className="underline decoration-[#C87941] decoration-4 underline-offset-8">
    5+ opportunities
  </span>
</h1>

// Section Heading
<h2 className="text-5xl lg:text-6xl font-bold text-black mb-6">
  Five pillars. Infinite opportunities.
</h2>

// Body Text
<p className="text-xl text-gray-700 leading-relaxed">
  Content here...
</p>

// Small Text
<p className="text-sm text-gray-600">
  Secondary information
</p>
```

---

## Layout Patterns

### Container

```tsx
<div className="max-w-7xl mx-auto px-6">
  {/* Content */}
</div>
```

### Section Spacing

```tsx
<section className="py-32 bg-white">
  {/* 128px vertical padding */}
</section>
```

### Grid Layouts

```tsx
// Two Column
<div className="grid md:grid-cols-2 gap-8">

// Three Column
<div className="grid lg:grid-cols-3 gap-8">

// Four Column
<div className="grid grid-cols-2 lg:grid-cols-4 gap-8">

// Asymmetric (7/5 split)
<div className="grid lg:grid-cols-12 gap-16">
  <div className="lg:col-span-7">Left</div>
  <div className="lg:col-span-5">Right</div>
</div>
```

---

## What NOT to Do

### ❌ Avoid These Patterns

1. **No Vibrant Gradients** - Avoid `bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500`
2. **No Emojis** - Use text or simple icons instead
3. **No Rounded Corners** - Keep sharp edges (`rounded-none` or minimal radius)
4. **No Heavy Shadows** - Use subtle borders instead of `shadow-2xl`
5. **No Multiple Accent Colors** - One accent color only
6. **No Decorative Elements** - Every element must serve a purpose
7. **No Hover Animations** - Simple color transitions only
8. **No Icon Libraries** - Use simple SVGs or text characters

### ✅ Do These Instead

1. **Clean Borders** - `border-2 border-gray-200`
2. **Subtle Hover States** - `hover:border-black transition-colors`
3. **Underlined Keywords** - `underline decoration-[#C87941] decoration-4`
4. **White Space** - Generous `py-32` spacing
5. **Black & White** - Primary colors
6. **Simple Typography** - Let content speak

---

## Accessibility

### Required Standards

- **Color Contrast:** Minimum 4.5:1 for body text, 3:1 for large text
- **Focus States:** Always visible, use black outline
- **Alt Text:** Required for all images
- **Keyboard Navigation:** All interactive elements accessible
- **ARIA Labels:** Use semantic HTML first, ARIA as supplement

### Implementation

```tsx
// Buttons
<button
  className="..."
  aria-label="Submit form"
>

// Forms
<label htmlFor="email" className="...">
  Work email
</label>
<input id="email" type="email" required />

// Links
<a href="#" className="..." aria-label="Learn more">
  Learn more →
</a>
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile First */
--screen-sm: 640px;   /* Small devices */
--screen-md: 768px;   /* Tablets */
--screen-lg: 1024px;  /* Laptops */
--screen-xl: 1280px;  /* Desktops */
--screen-2xl: 1536px; /* Large screens */
```

### Mobile-First Approach

```tsx
// Start with mobile, add complexity
<div className="text-4xl lg:text-6xl">
  {/* 4xl on mobile, 6xl on large screens */}
</div>

<div className="py-16 lg:py-32">
  {/* Less padding on mobile */}
</div>
```

---

## Animation Guidelines

### Allowed Animations

1. **Color Transitions** - `transition-colors duration-200`
2. **Border Changes** - `hover:border-black transition-colors`
3. **Opacity** - `hover:opacity-80 transition-opacity`

### Forbidden Animations

1. ❌ Transform scales
2. ❌ Slide-ins
3. ❌ Fade-ins
4. ❌ Rotating elements
5. ❌ Parallax effects

---

## Code Examples

### Complete Landing Section

```tsx
export function ExampleSection() {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <h2 className="text-5xl lg:text-6xl font-bold text-black mb-6">
          Section{' '}
          <span className="underline decoration-[#C87941] decoration-4 underline-offset-8">
            headline
          </span>
        </h2>

        {/* Description */}
        <p className="text-xl text-gray-700 mb-16 max-w-3xl">
          Brief description of the section content goes here.
        </p>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="border-2 border-gray-200 p-8 hover:border-black transition-colors"
            >
              <h3 className="text-2xl font-bold text-black mb-3">
                {item.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## Design Checklist

Before shipping any new component, verify:

- [ ] Uses beige (#F5F3EF) or white backgrounds only
- [ ] Black text for headings, gray-700 for body
- [ ] Coral accent (#C87941) used sparingly (underlines only)
- [ ] 2px borders (not 1px or 3px)
- [ ] No emojis or decorative icons
- [ ] Generous white space (py-32 for sections)
- [ ] Simple hover states (color transitions only)
- [ ] Mobile responsive (mobile-first)
- [ ] Accessible (contrast, focus, ARIA)
- [ ] Type scale consistent with system

---

## Related Documentation

- [Component Library](./COMPONENTS.md)
- [Frontend Architecture](../architecture/FRONTEND.md)
- [Accessibility Guidelines](./ACCESSIBILITY.md)

---

**Questions?** This design system is enforced by:
- Frontend Developer Agent (`.claude/agents/implementation/frontend-developer.md`)
- Code Review Agent (`.claude/agents/quality/code-reviewer.md`)
- QA Engineer Agent (`.claude/agents/operations/qa-engineer.md`)
