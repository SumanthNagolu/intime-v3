# UI Design Architecture Implementation Plan

## Overview

Implement the Premium Minimalist Design System documented in `thoughts/shared/research/2025-12-04-ui-design-architecture-hublot-inspired.md`. This plan transforms the existing UI into a Hublot-inspired luxury aesthetic with HumanLayer documentation clarity, featuring glassmorphism, premium typography, and refined form interactions.

## Current State Analysis

### What Already Exists
- **Design Tokens**: `tailwind.config.ts` has comprehensive color palette (forest, gold, rust, charcoal), typography scale, spacing (8px grid), and elevation system
- **CSS Utilities**: `globals.css` includes glassmorphism (`.glass`, `.glass-strong`), gradient text, premium card styles, and animation utilities
- **Button Component**: Has premium variants (gold, premium, glass) with micro-interactions
- **Navbar**: Glass morphism styling with role-based navigation
- **Command Palette**: Basic implementation in `GlobalCommand.tsx`
- **Fonts**: Google Fonts configured (Cormorant Garamond, Plus Jakarta Sans, JetBrains Mono)

### Key Gaps
1. `AppLayout.tsx:17` uses `bg-gray-50` instead of `bg-cream`
2. Input/Textarea components lack premium styling and variants
3. No Sidebar navigation component
4. No Breadcrumb component (only schema exists)
5. Missing form validation styling
6. No Switch, Combobox components
7. Dashboards not leveraging premium design system

## Desired End State

After implementation:
1. All pages use cream background with premium card styling
2. Forms have floating labels, validation states, and premium focus rings
3. Navigation includes breadcrumbs, enhanced sidebar, and full command palette
4. All dashboards follow role-specific premium patterns
5. Dark mode works consistently across all components
6. Accessibility standards met (WCAG AA)

### Verification
- Run `pnpm build` with no type errors
- Visual inspection of all dashboard pages
- Form validation flows work correctly
- Dark mode toggle works across all components
- Lighthouse accessibility score > 90

## What We're NOT Doing

- Complete rewrite of existing dashboard pages (incremental enhancement)
- Custom icon library (continue using Lucide React)
- Design token documentation/Storybook (future phase)
- Mobile app specific patterns
- Performance profiling/optimization beyond basic checks

## Implementation Approach

Incremental enhancement starting with foundation, then navigation, forms, dashboards, and polish. Each phase builds on the previous and can be tested independently.

---

## Phase 1: Foundation Alignment

### Overview
Fix base styling inconsistencies and ensure design tokens are correctly applied across the application shell.

### Changes Required:

#### 1. Fix AppLayout Background
**File**: `src/components/AppLayout.tsx`
**Line**: 17
**Changes**: Replace `bg-gray-50` with `bg-cream`

```tsx
// Before (line 17)
<body className="min-h-screen bg-gray-50 overflow-y-auto">

// After
<body className="min-h-screen bg-cream overflow-y-auto">
```

#### 2. Verify Root Layout Background
**File**: `src/app/layout.tsx`
**Changes**: Ensure body uses design system background

```tsx
// Verify/update body className
<body className={cn("min-h-screen bg-cream antialiased font-body")}>
```

#### 3. Add Missing CSS Utility: Focus Ring Premium
**File**: `src/app/globals.css`
**Location**: After line 171 (after `.focus-ring-premium`)
**Changes**: Add additional focus utilities

```css
/* Enhanced focus utilities */
.focus-ring-gold {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream;
}

.focus-ring-forest {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream;
}
```

#### 4. Add Container Utilities
**File**: `src/app/globals.css`
**Location**: After container-premium class
**Changes**: Add responsive container variants

```css
/* Responsive containers */
.container-narrow {
  @apply max-w-3xl mx-auto px-6 lg:px-8;
}

.container-wide {
  @apply max-w-7xl mx-auto px-6 lg:px-12;
}
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript build passes: `pnpm build`
- [x] Linting passes: `pnpm lint`
- [x] No console errors on page load

#### Manual Verification:
- [ ] All pages show cream (#FDFBF7) background
- [ ] Cards have white background with proper contrast
- [ ] Focus states show gold ring on interactive elements

**Implementation Note**: After completing this phase and all automated verification passes, pause for manual confirmation before proceeding to Phase 2.

---

## Phase 2: Navigation Enhancement

### Overview
Add missing navigation components: Breadcrumb, Sidebar, and enhanced Command Palette.

### Changes Required:

#### 1. Create Breadcrumb Component
**File**: `src/components/ui/breadcrumb.tsx` (new file)
**Changes**: Create accessible breadcrumb component

```tsx
import * as React from "react"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-1 text-sm", className)}>
      <Link
        href="/"
        className="text-charcoal-500 hover:text-forest-600 transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-charcoal-300" aria-hidden="true" />
          {item.href && !item.active ? (
            <Link
              href={item.href}
              className="text-charcoal-500 hover:text-forest-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                item.active ? "text-charcoal-900 font-medium" : "text-charcoal-500"
              )}
              aria-current={item.active ? "page" : undefined}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
```

#### 2. Create Sidebar Navigation Component
**File**: `src/components/navigation/Sidebar.tsx` (new file)
**Changes**: Create collapsible sidebar for admin/documentation contexts

```tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SidebarItem {
  label: string
  href?: string
  icon?: LucideIcon
  items?: SidebarItem[]
  badge?: string | number
}

export interface SidebarSection {
  title?: string
  items: SidebarItem[]
}

interface SidebarProps {
  sections: SidebarSection[]
  className?: string
}

export function Sidebar({ sections, className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn("w-64 flex-shrink-0", className)}>
      <nav className="sticky top-24 space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && (
              <h3 className="px-3 text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <SidebarNavItem
                  key={itemIndex}
                  item={item}
                  pathname={pathname}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

function SidebarNavItem({ item, pathname, depth = 0 }: {
  item: SidebarItem
  pathname: string
  depth?: number
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasChildren = item.items && item.items.length > 0
  const isActive = item.href === pathname
  const Icon = item.icon

  // Auto-expand if a child is active
  React.useEffect(() => {
    if (hasChildren && item.items?.some(child => child.href === pathname)) {
      setIsOpen(true)
    }
  }, [pathname, hasChildren, item.items])

  const content = (
    <span className="flex items-center gap-2 flex-1">
      {Icon && <Icon className="h-4 w-4" />}
      <span>{item.label}</span>
      {item.badge && (
        <span className="ml-auto text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </span>
  )

  const baseClasses = cn(
    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200",
    "hover:bg-charcoal-50",
    isActive && "bg-forest-50 text-forest-700 font-medium border-l-2 border-forest-600",
    !isActive && "text-charcoal-700",
    depth > 0 && "ml-4"
  )

  if (hasChildren) {
    return (
      <li>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(baseClasses, "w-full justify-between")}
        >
          {content}
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-charcoal-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-charcoal-400" />
          )}
        </button>
        {isOpen && (
          <ul className="mt-1 space-y-1">
            {item.items!.map((child, childIndex) => (
              <SidebarNavItem
                key={childIndex}
                item={child}
                pathname={pathname}
                depth={depth + 1}
              />
            ))}
          </ul>
        )}
      </li>
    )
  }

  if (item.href) {
    return (
      <li>
        <Link href={item.href} className={baseClasses}>
          {content}
        </Link>
      </li>
    )
  }

  return (
    <li>
      <span className={baseClasses}>{content}</span>
    </li>
  )
}
```

#### 3. Create Sidebar Layout Wrapper
**File**: `src/components/layouts/SidebarLayout.tsx` (new file)
**Changes**: Layout component combining sidebar with main content

```tsx
import * as React from "react"
import { Sidebar, SidebarSection } from "@/components/navigation/Sidebar"
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

interface SidebarLayoutProps {
  children: React.ReactNode
  sections: SidebarSection[]
  breadcrumbs?: BreadcrumbItem[]
  title?: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function SidebarLayout({
  children,
  sections,
  breadcrumbs,
  title,
  description,
  actions,
  className,
}: SidebarLayoutProps) {
  return (
    <div className={cn("flex min-h-screen", className)}>
      <Sidebar sections={sections} className="hidden lg:block border-r border-charcoal-100 bg-white/50" />

      <main className="flex-1 min-w-0">
        <div className="container-premium py-8">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumb items={breadcrumbs} className="mb-6" />
          )}

          {(title || actions) && (
            <div className="flex items-center justify-between mb-8">
              <div>
                {title && <h1 className="text-h2 text-charcoal-900">{title}</h1>}
                {description && <p className="text-body text-charcoal-600 mt-1">{description}</p>}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  )
}
```

#### 4. Enhance Command Palette
**File**: `src/components/GlobalCommand.tsx`
**Changes**: Add more search categories, keyboard navigation, recent items

```tsx
// Add to existing GlobalCommand.tsx - enhance the search functionality

// Add these imports at the top
import {
  Search, Building2, Users, Briefcase, FileText,
  Clock, Star, ArrowRight
} from "lucide-react"

// Add recent searches state (after line ~15)
const [recentSearches, setRecentSearches] = React.useState<string[]>([])

// Add search categories (replace existing filtered arrays around line 29-40)
const searchCategories = [
  {
    title: "Candidates",
    icon: Users,
    items: candidates.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3),
    action: (item: any) => router.push(`/employee/recruiting/talent/${item.id}`)
  },
  {
    title: "Jobs",
    icon: Briefcase,
    items: jobs.filter(j =>
      j.title.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3),
    action: (item: any) => router.push(`/employee/recruiting/jobs/${item.id}`)
  },
  {
    title: "Accounts",
    icon: Building2,
    items: [], // Add accounts from store
    action: (item: any) => router.push(`/employee/recruiting/accounts/${item.id}`)
  }
]

// Add keyboard navigation
const [selectedIndex, setSelectedIndex] = React.useState(0)

React.useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => prev + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(0, prev - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // Execute selected action
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [isOpen, selectedIndex])
```

#### 5. Export Navigation Components
**File**: `src/components/navigation/index.ts` (new file)

```tsx
export { Sidebar } from './Sidebar'
export type { SidebarItem, SidebarSection } from './Sidebar'
```

**File**: `src/components/ui/index.ts` (update if exists, or create)
Add breadcrumb export:

```tsx
export { Breadcrumb } from './breadcrumb'
export type { BreadcrumbItem } from './breadcrumb'
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript build passes: `pnpm build`
- [x] Linting passes: `pnpm lint`
- [x] New components have proper TypeScript types

#### Manual Verification:
- [ ] Breadcrumb renders correctly with home icon and separators
- [ ] Sidebar collapses/expands nested items
- [ ] Active sidebar item shows left border accent
- [ ] Command palette opens with Cmd+K
- [ ] Keyboard navigation works in command palette

**Implementation Note**: After completing this phase and all automated verification passes, pause for manual confirmation before proceeding to Phase 3.

---

## Phase 3: Form System Overhaul

### Overview
Transform basic form components into premium-styled inputs with floating labels, validation states, and proper variants.

### Changes Required:

#### 1. Enhanced Input Component
**File**: `src/components/ui/input.tsx`
**Changes**: Complete rewrite with variants, sizes, validation states

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border bg-transparent text-charcoal-900 transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-charcoal-400 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-charcoal-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20",
        premium: "border-charcoal-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 shadow-elevation-xs",
        ghost: "border-transparent bg-charcoal-50 focus:bg-white focus:border-charcoal-200",
        error: "border-error-500 focus:border-error-500 focus:ring-2 focus:ring-error-500/20 text-error-700",
        success: "border-success-500 focus:border-success-500 focus:ring-2 focus:ring-success-500/20",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        default: "h-11 px-4 text-base",
        lg: "h-13 px-5 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: boolean
  success?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, error, success, leftIcon, rightIcon, ...props }, ref) => {
    // Auto-select variant based on state
    const computedVariant = error ? "error" : success ? "success" : variant

    if (leftIcon || rightIcon) {
      return (
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">
              {leftIcon}
            </div>
          )}
          <input
            className={cn(
              inputVariants({ variant: computedVariant, size }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400">
              {rightIcon}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        className={cn(inputVariants({ variant: computedVariant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
```

#### 2. Create Floating Label Input
**File**: `src/components/ui/floating-input.tsx` (new file)
**Changes**: Input with animated floating label

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { inputVariants } from "./input"
import { type VariantProps } from "class-variance-authority"

interface FloatingInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'placeholder'>,
    VariantProps<typeof inputVariants> {
  label: string
  error?: string
  hint?: string
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, variant, size, label, error, hint, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(!!props.defaultValue || !!props.value)
    const inputId = id || React.useId()

    const isFloating = isFocused || hasValue

    return (
      <div className="relative">
        <input
          id={inputId}
          className={cn(
            inputVariants({ variant: error ? "error" : variant, size }),
            "peer pt-6 pb-2",
            className
          )}
          ref={ref}
          placeholder=" "
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            setHasValue(!!e.target.value)
            props.onBlur?.(e)
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value)
            props.onChange?.(e)
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "absolute left-4 transition-all duration-200 pointer-events-none",
            "text-charcoal-500 peer-focus:text-forest-600",
            isFloating
              ? "top-2 text-xs font-medium"
              : "top-1/2 -translate-y-1/2 text-base",
            error && "text-error-600 peer-focus:text-error-600"
          )}
        >
          {label}
        </label>

        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-error-600">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-charcoal-500">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
FloatingInput.displayName = "FloatingInput"

export { FloatingInput }
```

#### 3. Create Form Field Wrapper
**File**: `src/components/ui/form-field.tsx` (new file)
**Changes**: Composable form field with label, input, and messages

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"

interface FormFieldProps {
  children: React.ReactNode
  label?: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
}

export function FormField({
  children,
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
}: FormFieldProps) {
  const id = htmlFor || React.useId()

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className="text-charcoal-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </Label>
      )}

      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            id,
            "aria-invalid": !!error,
            "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
          })
        : children}

      {error && (
        <p id={`${id}-error`} className="text-sm text-error-600 flex items-center gap-1.5">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-charcoal-500">
          {hint}
        </p>
      )}
    </div>
  )
}
```

#### 4. Enhanced Textarea Component
**File**: `src/components/ui/textarea.tsx`
**Changes**: Add variants and character count

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex min-h-[120px] w-full rounded-md border bg-transparent px-4 py-3 text-base text-charcoal-900 transition-all duration-200 placeholder:text-charcoal-400 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
  {
    variants: {
      variant: {
        default: "border-charcoal-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20",
        premium: "border-charcoal-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 shadow-elevation-xs",
        error: "border-error-500 focus:border-error-500 focus:ring-2 focus:ring-error-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: boolean
  showCount?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, error, showCount, maxLength, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(
      (props.defaultValue?.toString() || props.value?.toString() || "").length
    )

    return (
      <div className="relative">
        <textarea
          className={cn(
            textareaVariants({ variant: error ? "error" : variant }),
            showCount && "pb-8",
            className
          )}
          ref={ref}
          maxLength={maxLength}
          onChange={(e) => {
            setCharCount(e.target.value.length)
            props.onChange?.(e)
          }}
          {...props}
        />
        {showCount && maxLength && (
          <span className={cn(
            "absolute bottom-2 right-3 text-xs",
            charCount > maxLength * 0.9 ? "text-warning-600" : "text-charcoal-400"
          )}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
```

#### 5. Create Switch Component
**File**: `src/components/ui/switch.tsx` (new file)
**Changes**: Toggle switch component

```tsx
"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/20 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-forest-600 data-[state=unchecked]:bg-charcoal-200",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
        "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
```

#### 6. Enhanced Select with Premium Styling
**File**: `src/components/ui/select.tsx`
**Changes**: Update styling to match premium design system

```tsx
// Update SelectTrigger (around line 21-23) to use premium styling:

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-11 w-full items-center justify-between rounded-md border border-charcoal-200 bg-transparent px-4 py-2 text-base",
      "placeholder:text-charcoal-400",
      "focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-all duration-200",
      "[&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 text-charcoal-400" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))

// Update SelectContent (around line 77-79) styling:
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-charcoal-100 bg-white shadow-elevation-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      ...
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))

// Update SelectItem (around line 120-122) styling:
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 pl-10 pr-4 text-sm",
      "outline-none transition-colors",
      "focus:bg-forest-50 focus:text-forest-900",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-forest-600" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript build passes: `pnpm build`
- [x] Linting passes: `pnpm lint`
- [x] New components export correctly

#### Manual Verification:
- [ ] Input shows gold/forest focus ring
- [ ] Floating label animates smoothly on focus
- [ ] Error state shows red border and error message
- [ ] Switch toggles with smooth animation
- [ ] Select dropdown has premium styling with checkmark

**Implementation Note**: After completing this phase and all automated verification passes, pause for manual confirmation before proceeding to Phase 4.

---

## Phase 4: Dashboard Widget Enhancements

### Overview
Create shared dashboard widget components and enhance existing dashboards to use the premium design system.

### Changes Required:

#### 1. Create Stats Card Component
**File**: `src/components/dashboard/StatsCard.tsx` (new file)
**Changes**: Premium stat card with trend indicator

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: LucideIcon
  variant?: "default" | "success" | "warning" | "error"
  className?: string
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  variant = "default",
  className,
}: StatsCardProps) {
  const TrendIcon = change
    ? change > 0
      ? TrendingUp
      : change < 0
        ? TrendingDown
        : Minus
    : null

  const trendColor = change
    ? change > 0
      ? "text-success-600"
      : change < 0
        ? "text-error-600"
        : "text-charcoal-500"
    : ""

  const variantStyles = {
    default: "border-charcoal-100",
    success: "border-l-4 border-l-success-500 border-charcoal-100",
    warning: "border-l-4 border-l-warning-500 border-charcoal-100",
    error: "border-l-4 border-l-error-500 border-charcoal-100",
  }

  return (
    <div className={cn(
      "bg-white rounded-xl border p-6 shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-caption text-charcoal-500 mb-1">{title}</p>
          <p className="text-h2 text-charcoal-900">{value}</p>

          {change !== undefined && (
            <div className={cn("flex items-center gap-1 mt-2", trendColor)}>
              {TrendIcon && <TrendIcon className="h-4 w-4" />}
              <span className="text-sm font-medium">
                {change > 0 ? "+" : ""}{change}%
              </span>
              {changeLabel && (
                <span className="text-charcoal-500 text-sm">{changeLabel}</span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className="p-3 bg-forest-50 rounded-lg">
            <Icon className="h-6 w-6 text-forest-600" />
          </div>
        )}
      </div>
    </div>
  )
}
```

#### 2. Create Activity Feed Widget
**File**: `src/components/dashboard/ActivityFeedWidget.tsx` (new file)
**Changes**: Premium activity feed with timestamps

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { LucideIcon } from "lucide-react"

interface ActivityItem {
  id: string
  icon: LucideIcon
  iconColor?: string
  title: string
  description?: string
  timestamp: Date
  link?: string
}

interface ActivityFeedWidgetProps {
  title?: string
  activities: ActivityItem[]
  maxItems?: number
  showViewAll?: boolean
  onViewAll?: () => void
  className?: string
}

export function ActivityFeedWidget({
  title = "Recent Activity",
  activities,
  maxItems = 5,
  showViewAll = true,
  onViewAll,
  className,
}: ActivityFeedWidgetProps) {
  const displayActivities = activities.slice(0, maxItems)

  return (
    <div className={cn(
      "bg-white rounded-xl border border-charcoal-100 shadow-elevation-sm",
      className
    )}>
      <div className="flex items-center justify-between p-6 border-b border-charcoal-100">
        <h3 className="text-h4 text-charcoal-900">{title}</h3>
        {showViewAll && activities.length > maxItems && (
          <button
            onClick={onViewAll}
            className="text-sm text-forest-600 hover:text-forest-700 font-medium transition-colors"
          >
            View all
          </button>
        )}
      </div>

      <div className="divide-y divide-charcoal-50">
        {displayActivities.map((activity) => (
          <div
            key={activity.id}
            className="p-4 hover:bg-charcoal-50/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg flex-shrink-0",
                activity.iconColor || "bg-forest-50"
              )}>
                <activity.icon className={cn(
                  "h-4 w-4",
                  activity.iconColor ? "text-white" : "text-forest-600"
                )} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal-900 truncate">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-sm text-charcoal-500 truncate mt-0.5">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-charcoal-400 mt-1">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-charcoal-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

#### 3. Create Quick Actions Widget
**File**: `src/components/dashboard/QuickActionsWidget.tsx` (new file)
**Changes**: Premium quick action buttons

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon, ArrowRight } from "lucide-react"
import Link from "next/link"

interface QuickAction {
  id: string
  label: string
  description?: string
  icon: LucideIcon
  href?: string
  onClick?: () => void
  variant?: "default" | "primary" | "premium"
}

interface QuickActionsWidgetProps {
  title?: string
  actions: QuickAction[]
  columns?: 2 | 3 | 4
  className?: string
}

export function QuickActionsWidget({
  title = "Quick Actions",
  actions,
  columns = 3,
  className,
}: QuickActionsWidgetProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }

  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <h3 className="text-h4 text-charcoal-900">{title}</h3>
      )}

      <div className={cn("grid gap-4", gridCols[columns])}>
        {actions.map((action) => {
          const ActionIcon = action.icon
          const variantStyles = {
            default: "bg-white border-charcoal-100 hover:border-forest-200 hover:bg-forest-50/30",
            primary: "bg-forest-600 border-forest-600 text-white hover:bg-forest-700",
            premium: "bg-gradient-to-br from-gold-500 to-gold-600 border-gold-500 text-white hover:from-gold-600 hover:to-gold-700",
          }

          const content = (
            <>
              <div className={cn(
                "p-2.5 rounded-lg mb-3",
                action.variant === "default" || !action.variant
                  ? "bg-forest-50"
                  : "bg-white/20"
              )}>
                <ActionIcon className={cn(
                  "h-5 w-5",
                  action.variant === "default" || !action.variant
                    ? "text-forest-600"
                    : "text-current"
                )} />
              </div>
              <p className="font-medium mb-0.5">{action.label}</p>
              {action.description && (
                <p className={cn(
                  "text-xs",
                  action.variant === "default" || !action.variant
                    ? "text-charcoal-500"
                    : "text-white/80"
                )}>
                  {action.description}
                </p>
              )}
              <ArrowRight className={cn(
                "h-4 w-4 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity",
                action.variant === "default" || !action.variant
                  ? "text-forest-600"
                  : "text-current"
              )} />
            </>
          )

          const baseClasses = cn(
            "relative group p-4 rounded-xl border text-left transition-all duration-200 shadow-elevation-xs hover:shadow-elevation-sm",
            variantStyles[action.variant || "default"]
          )

          if (action.href) {
            return (
              <Link key={action.id} href={action.href} className={baseClasses}>
                {content}
              </Link>
            )
          }

          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={baseClasses}
            >
              {content}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

#### 4. Create Dashboard Shell Component
**File**: `src/components/dashboard/DashboardShell.tsx` (new file)
**Changes**: Consistent dashboard layout wrapper

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb"

interface DashboardShellProps {
  children: React.ReactNode
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  className?: string
}

export function DashboardShell({
  children,
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: DashboardShellProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb items={breadcrumbs} className="mb-4" />
        )}

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-h1 text-charcoal-900">{title}</h1>
            {description && (
              <p className="text-body-lg text-charcoal-600 mt-2">{description}</p>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-3">{actions}</div>
          )}
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  )
}

// Grid helpers for dashboard layouts
export function DashboardGrid({
  children,
  columns = 4,
  className
}: {
  children: React.ReactNode
  columns?: 2 | 3 | 4
  className?: string
}) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-6", gridCols[columns], className)}>
      {children}
    </div>
  )
}

export function DashboardSection({
  children,
  title,
  action,
  className,
}: {
  children: React.ReactNode
  title?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between">
          {title && <h2 className="text-h3 text-charcoal-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
```

#### 5. Export Dashboard Components
**File**: `src/components/dashboard/index.ts` (new file)

```tsx
export { StatsCard } from './StatsCard'
export { ActivityFeedWidget } from './ActivityFeedWidget'
export { QuickActionsWidget } from './QuickActionsWidget'
export { DashboardShell, DashboardGrid, DashboardSection } from './DashboardShell'
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript build passes: `pnpm build`
- [x] Linting passes: `pnpm lint`
- [x] Dashboard components export correctly

#### Manual Verification:
- [ ] StatsCard shows trend indicators correctly
- [ ] ActivityFeedWidget displays timestamps properly
- [ ] QuickActionsWidget hover effects work
- [ ] DashboardShell provides consistent layout

**Implementation Note**: After completing this phase and all automated verification passes, pause for manual confirmation before proceeding to Phase 5.

---

## Phase 5: Polish & Accessibility

### Overview
Add animation refinements, verify dark mode, and ensure accessibility compliance.

### Changes Required:

#### 1. Add Reduced Motion Support
**File**: `src/app/globals.css`
**Location**: After animation utilities
**Changes**: Respect user motion preferences

```css
/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Skip link for keyboard navigation */
.skip-link {
  @apply absolute -top-10 left-4 z-[100] bg-forest-600 text-white px-4 py-2 rounded-md;
  @apply focus:top-4 transition-all duration-200;
}
```

#### 2. Add Skip Link to Layout
**File**: `src/components/AppLayout.tsx`
**Changes**: Add skip to main content link

```tsx
// Add at the beginning of the component return, before SystemBar
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

// Add id to main content area
<main id="main-content" className="...">
```

#### 3. Dark Mode CSS Variables Verification
**File**: `src/app/globals.css`
**Location**: Lines 70-95 (dark mode section)
**Changes**: Verify and enhance dark mode contrast

```css
.dark {
  /* Verified dark mode variables */
  --background: 0 0% 7%;          /* #121212 - slightly lighter for better contrast */
  --foreground: 42 43% 97%;       /* cream */

  --card: 0 0% 10%;               /* #1A1A1A */
  --card-foreground: 42 43% 97%;

  --primary: 160 70% 28%;         /* Lighter forest for dark bg */
  --primary-foreground: 42 43% 97%;

  --secondary: 0 0% 15%;
  --secondary-foreground: 42 43% 90%;

  --accent: 42 50% 58%;           /* Brighter gold */
  --accent-foreground: 0 0% 7%;

  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 65%;

  --destructive: 0 70% 55%;       /* Lighter red for dark bg */
  --destructive-foreground: 0 0% 98%;

  --border: 0 0% 20%;
  --input: 0 0% 20%;
  --ring: 42 50% 50%;             /* Gold ring */
}
```

#### 4. Add Focus Visible Polyfill Support
**File**: `src/app/globals.css`
**Changes**: Enhanced focus-visible styling

```css
/* Focus visible enhancement */
.focus-visible-enhanced:focus {
  outline: none;
}

.focus-visible-enhanced:focus-visible {
  @apply ring-2 ring-gold-500/40 ring-offset-2 ring-offset-cream;
}

.dark .focus-visible-enhanced:focus-visible {
  @apply ring-offset-charcoal-900;
}
```

#### 5. Component Accessibility Enhancements
**File**: `src/components/ui/button.tsx`
**Changes**: Add aria-busy for loading state

```tsx
// Add to Button component props
interface ButtonProps ... {
  loading?: boolean
}

// In the component
const Button = React.forwardRef<...>(
  ({ loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
```

#### 6. Add Toast/Notification System
**File**: `src/components/ui/toast.tsx` (new file)
**Changes**: Create accessible toast notifications

```tsx
"use client"

import * as React from "react"
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cn(
            "group flex items-start gap-3 w-full p-4 rounded-lg border shadow-elevation-lg",
            "bg-white border-charcoal-100",
            "dark:bg-charcoal-800 dark:border-charcoal-700"
          ),
          title: "text-sm font-medium text-charcoal-900 dark:text-white",
          description: "text-sm text-charcoal-600 dark:text-charcoal-300",
          actionButton: "bg-forest-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-forest-700",
          cancelButton: "bg-charcoal-100 text-charcoal-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-charcoal-200",
          closeButton: cn(
            "absolute top-2 right-2 p-1 rounded-md",
            "text-charcoal-400 hover:text-charcoal-600",
            "dark:text-charcoal-500 dark:hover:text-charcoal-300"
          ),
        },
      }}
    />
  )
}

// Helper functions for common toast types
export const toast = {
  success: (title: string, description?: string) => {
    sonnerToast.success(title, {
      description,
      icon: <CheckCircle className="h-5 w-5 text-success-600" />,
    })
  },
  error: (title: string, description?: string) => {
    sonnerToast.error(title, {
      description,
      icon: <XCircle className="h-5 w-5 text-error-600" />,
    })
  },
  warning: (title: string, description?: string) => {
    sonnerToast.warning(title, {
      description,
      icon: <AlertCircle className="h-5 w-5 text-warning-600" />,
    })
  },
  info: (title: string, description?: string) => {
    sonnerToast.info(title, {
      description,
      icon: <Info className="h-5 w-5 text-info-600" />,
    })
  },
}
```

#### 7. Add Toaster to Root Layout
**File**: `src/app/layout.tsx`
**Changes**: Include Toaster component

```tsx
import { Toaster } from "@/components/ui/toast"

// In the layout return, add before closing body tag:
<Toaster />
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript build passes: `pnpm build`
- [x] Linting passes: `pnpm lint`
- [x] All new components have proper TypeScript types

#### Manual Verification:
- [ ] Skip link appears on Tab key press and navigates to main content
- [ ] Animations respect reduced motion preference (check in System Preferences)
- [ ] Dark mode toggle works across all new components
- [ ] Toast notifications appear with correct styling
- [ ] Focus states are visible on all interactive elements
- [ ] Color contrast passes WCAG AA (use browser dev tools)

**Implementation Note**: This phase completes the UI architecture implementation. Perform comprehensive manual testing across all dashboards and form flows.

---

## Testing Strategy

### Unit Tests
- Test form validation logic in Input, FloatingInput components
- Test Sidebar collapse/expand functionality
- Test Breadcrumb rendering with various item counts

### Integration Tests
- Test form submission flows with validation states
- Test navigation between dashboard pages
- Test command palette search functionality

### Manual Testing Steps
1. Navigate through all role dashboards (Admin, Recruiter, Bench, HR, TA)
2. Test form submission on talent create, job create pages
3. Toggle dark mode and verify all components
4. Test with keyboard-only navigation
5. Run Lighthouse accessibility audit
6. Test on mobile viewport (responsive behavior)

## Performance Considerations

- **Font Loading**: Google Fonts use `display=swap` to prevent FOIT
- **CSS**: Tailwind purges unused styles in production
- **Animations**: Use `will-change` sparingly, only in globals.css animation utilities
- **Components**: All components use React.forwardRef for proper ref handling

## Migration Notes

### Breaking Changes
- Input component API changes (new `variant`, `size` props)
- Textarea component API changes (new `variant`, `showCount` props)
- AppLayout background color change (gray-50 → cream)

### Backwards Compatibility
- Existing Input/Textarea usage without variant/size props will use defaults
- No changes to data structures or API contracts

## References

- Original research: `thoughts/shared/research/2025-12-04-ui-design-architecture-hublot-inspired.md`
- Tailwind config: `tailwind.config.ts`
- Global CSS: `src/app/globals.css`
- Button component: `src/components/ui/button.tsx`
- Existing Navbar: `src/components/Navbar.tsx`
