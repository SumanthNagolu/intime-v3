# InTime Design System V3
**Official Design Standard for ALL Modules**

Last Updated: 2025-11-23
Status: **ACTIVE - Use this for all new development**

---

## 🎨 Design Philosophy

> "Sophisticated, trustworthy, and timeless. This is Harvard, not a bootcamp."

### Core Principles
1. **Serif Typography** - Conveys authority and professionalism
2. **Generous Spacing** - Premium feel, nothing feels cramped
3. **Subtle Textures** - Noise and gradients add depth without distraction
4. **Rounded Corners** - 2.5rem border radius creates warmth
5. **Muted Color Palette** - Earth tones that don't fatigue the eye

---

## 🎯 Color System

### Primary Colors
```css
--ivory: #fafaf9;        /* Main background */
--charcoal: #1c1917;     /* Primary text */
--rust: #ea580c;         /* Primary accent/CTA */
--forest: #4d7c0f;       /* Success/completion */
--clay: #78350f;         /* Secondary accent */
```

### Stone Scale (Neutrals)
```css
--stone-50: #fafaf9;
--stone-100: #f5f5f4;
--stone-200: #e7e5e4;
--stone-300: #d6d3d1;
--stone-400: #a8a29e;
--stone-500: #78716c;
--stone-600: #57534e;
--stone-700: #44403c;
--stone-800: #292524;
--stone-900: #1c1917;
```

### Usage Guidelines
| Element | Color | Example |
|---------|-------|---------|
| Page Background | `bg-ivory` | All pages |
| Card Background | `bg-white` | Cards, modals |
| Primary Text | `text-charcoal` | Headings, body |
| Secondary Text | `text-stone-500` | Descriptions |
| Primary Button | `bg-charcoal hover:bg-rust` | CTAs |
| Success State | `bg-forest` | Completed lessons |
| Active/Current | `bg-rust` | Current lesson |
| Locked/Disabled | `bg-stone-50 text-stone-400` | Locked content |

---

## 📝 Typography

### Font Families
```css
font-sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
font-serif: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
font-mono: ['JetBrains Mono', 'monospace']
```

**Note:** We use Inter for both serif and sans because we apply `italic` and `font-bold` to create the "serif" effect.

### Type Scale
```css
/* Hero Headings */
.text-hero: text-6xl md:text-7xl font-serif font-bold italic

/* Page Titles */
.text-title: text-4xl md:text-5xl font-serif font-bold italic

/* Section Headings */
.text-heading: text-2xl md:text-3xl font-serif font-bold

/* Card Titles */
.text-card-title: text-xl font-serif font-bold

/* Body Text */
.text-body: text-base font-light leading-relaxed

/* Small Text */
.text-small: text-xs font-bold uppercase tracking-widest
```

### Typography Rules
1. **ALL page titles** must use `font-serif italic`
2. **Body text** uses `font-sans font-light` for readability
3. **Labels/badges** use `text-xs font-bold uppercase tracking-[0.2em]`
4. **Line height** is generous: `leading-relaxed` (1.625) for body

---

## 🎭 Component Patterns

### Card Design
```tsx
<div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-stone-200/50 border border-stone-100 bg-noise">
  {/* Content */}
</div>
```

**Key Features:**
- `rounded-[2.5rem]` - Large, friendly corners
- `shadow-2xl shadow-stone-200/50` - Soft, elevated shadow
- `bg-noise` - Subtle texture overlay
- `border border-stone-100` - Barely visible border

### Button Styles

**Primary CTA:**
```tsx
<button className="px-12 py-5 bg-charcoal text-white rounded-full font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-xl hover:shadow-rust/30">
  Call to Action
</button>
```

**Secondary Button:**
```tsx
<button className="px-8 py-4 bg-white text-charcoal border border-stone-200 rounded-full font-bold uppercase tracking-widest hover:border-rust hover:text-rust transition-all">
  Secondary
</button>
```

**Pill Badge:**
```tsx
<div className="px-4 py-2 rounded-full bg-rust/5 border border-rust/10 text-rust text-xs font-bold uppercase tracking-widest">
  <span className="w-1.5 h-1.5 bg-rust rounded-full animate-pulse" />
  Active
</div>
```

### Navigation
```tsx
<nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
  <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-stone-900/5 rounded-3xl lg:rounded-full px-6 lg:px-8 py-4 pointer-events-auto">
    {/* Nav content */}
  </div>
</nav>
```

**Key Features:**
- Fixed at `top-6` with generous spacing
- Glass morphism: `bg-white/90 backdrop-blur-xl`
- Rounded full on desktop, rounded-3xl on mobile
- Pointer events managed carefully

---

## 📐 Spacing System

Use Tailwind's default scale but favor generous spacing:

```css
/* Page padding */
container mx-auto px-4 py-8

/* Section gaps */
space-y-12  /* Between major sections */
space-y-8   /* Between subsections */
space-y-4   /* Between related items */

/* Card padding */
p-8  md:p-12  /* Standard card */
p-6  md:p-8   /* Compact card */

/* Margins */
mb-12  /* After page title */
mb-8   /* After section title */
mb-6   /* After subsection title */
```

---

## ✨ Effects & Animations

### Background Noise
```css
.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
}
```

### Animations
```css
animate-fade-in      /* 0.7s ease-out fade and slide up */
animate-pulse-slow   /* 3s pulsing glow */
animate-slide-up     /* 0.7s slide from bottom */
```

### Hover States
- Cards: `hover:-translate-y-1` (subtle lift)
- Buttons: `hover:shadow-rust/30` (glowing shadow)
- Links: `hover:text-rust` (color transition)

---

## 🧩 Layout Patterns

### Two-Column Content
```tsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
  <div className="lg:col-span-8">
    {/* Main content */}
  </div>
  <div className="lg:col-span-4">
    {/* Sidebar */}
  </div>
</div>
```

### Hero Section
```tsx
<div className="relative overflow-hidden pt-16 pb-20 lg:pt-32 lg:pb-28">
  <div className="relative container mx-auto px-4 text-center">
    <h1 className="text-6xl md:text-7xl font-serif font-bold text-charcoal mb-8 leading-tight">
      The <span className="italic text-rust">Title</span>
    </h1>
    <p className="max-w-2xl mx-auto text-xl text-stone-500 mb-12 leading-relaxed font-light">
      Description text
    </p>
  </div>
</div>
```

### Dashboard Grid
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {items.map(item => (
    <div className="p-4 rounded-xl border bg-white hover:shadow-md transition-all">
      {/* Item */}
    </div>
  ))}
</div>
```

---

## 🎯 Module-Specific Guidelines

### Academy Module ✅ (Reference Implementation)
- **Primary Color:** Rust for active states
- **Layout:** Dashboard with employability matrix
- **Navigation:** Dropdown menus grouped by purpose
- **Cards:** 2.5rem rounded with noise texture

### HR Portal (To Be Built)
- **Primary Color:** Use Forest for "approved" states
- **Layout:** Follow same dashboard pattern
- **Navigation:** Same navbar structure
- **Cards:** Identical card styling to Academy

### Recruiting (To Be Built)
- **Primary Color:** Mix of Rust (active) and Forest (placed)
- **Layout:** Kanban + Dashboard hybrid
- **Navigation:** Same navbar structure
- **Cards:** Identical card styling to Academy

### Bench Sales (To Be Built)
- **Primary Color:** Clay for "bench" states, Rust for "active search"
- **Layout:** Same dashboard pattern
- **Navigation:** Same navbar structure
- **Cards:** Identical card styling to Academy

---

## 🛠️ Implementation Checklist

When building ANY new module, ensure:

- [ ] Page background is `bg-ivory`
- [ ] All cards use `rounded-[2.5rem]`
- [ ] Page titles use `font-serif italic`
- [ ] Navigation follows fixed top-6 glass morphism pattern
- [ ] Primary buttons are `bg-charcoal hover:bg-rust`
- [ ] All cards have `bg-noise` texture
- [ ] Spacing is generous (min `space-y-8`)
- [ ] Shadows use `shadow-stone-200/50`
- [ ] Text colors follow the hierarchy (charcoal → stone-500 → stone-400)
- [ ] Badges use `uppercase tracking-widest text-xs font-bold`

---

## 📋 Code Snippets Library

### Status Badge
```tsx
<span className={cn(
  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
  status === 'active' ? 'bg-rust/10 text-rust border border-rust/20' :
  status === 'completed' ? 'bg-forest/10 text-forest border border-forest/20' :
  'bg-stone-100 text-stone-400 border border-stone-200'
)}>
  {status}
</span>
```

### Progress Bar
```tsx
<div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-rust to-orange-400 rounded-full"
    style={{ width: `${progress}%` }}
  />
</div>
```

### Stat Card
```tsx
<div className="bg-charcoal text-ivory rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden bg-noise">
  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rust/20 to-transparent rounded-full -mr-10 -mt-10 blur-3xl" />
  <h3 className="font-serif text-2xl mb-4 relative z-10 italic">Stat Title</h3>
  <div className="text-7xl font-serif text-forest relative z-10">92%</div>
</div>
```

---

## 🚫 Don'ts (Anti-Patterns)

❌ **Never use these:**
- Bright neon colors (too aggressive)
- Small border radius (`rounded-md` - use `rounded-xl` minimum)
- Cramped spacing (`space-y-2` - use `space-y-4` minimum)
- Multiple competing CTAs (one primary per section)
- Sharp borders without shadows (always add soft shadow)
- Default sans-serif for titles (always use `font-serif italic`)

---

## 📦 Reusable Components

Create these as shared components in `/src/components/shared/`:

1. **StatCard** - For metrics/KPIs
2. **StatusBadge** - For status indicators
3. **NavbarDropdown** - Consistent navigation
4. **HeroSection** - Page headers
5. **ProgressBar** - Progress indicators
6. **CardContainer** - Standard card wrapper

---

## 🎓 Example: HR Portal Card

```tsx
// Following the design system exactly:
<div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-stone-200/50 border border-stone-100 bg-noise">
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 bg-forest/10 rounded-full flex items-center justify-center">
      <CheckCircle className="text-forest" size={20} />
    </div>
    <div>
      <div className="text-xs font-bold uppercase tracking-widest text-stone-400">
        Employee Status
      </div>
      <h3 className="text-xl font-serif font-bold text-charcoal">
        Active - Full Time
      </h3>
    </div>
  </div>

  <div className="space-y-4">
    <div className="flex justify-between text-sm">
      <span className="text-stone-500">Start Date</span>
      <span className="text-charcoal font-medium">Jan 15, 2025</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-stone-500">Department</span>
      <span className="text-charcoal font-medium">Engineering</span>
    </div>
  </div>
</div>
```

**Notice:**
- Exact same rounded corners, shadows, padding
- Same color usage (forest for status, stone for secondary)
- Same typography hierarchy
- Same spacing patterns

---

## ✅ Approval Process

**Before deploying ANY new UI:**

1. Compare against Academy implementation
2. Run through checklist above
3. Verify all colors are from the approved palette
4. Check that rounded-[2.5rem] is used on cards
5. Ensure page title is font-serif italic
6. Confirm bg-noise is present

---

## 📞 Questions?

If unsure about a design decision:
1. Check the Academy module implementation first (it's the reference)
2. Refer to this document
3. When in doubt, match Academy exactly

**This is a living document.** Any changes to the design system must be updated here and applied consistently across ALL modules.

---

**Last Review:** 2025-11-23
**Next Review:** When building next major module (HR Portal)
