# Layout Shell Specification

## Overview

The Layout Shell is the application's main container that wraps all workspace screens. It provides:
- Top header with branding, search, and user actions
- Left sidebar for navigation
- Main content area
- Global command bar (Cmd+K)

---

## Wireframe (ASCII)

```
+------------------------------------------------------------------+
|  [IT] InTime    [Home]         [Search...        ] [🔔] [Avatar▼]|
+------------------------------------------------------------------+
|        │                                                          |
|Workspace│                                                          |
|─────────│                                                          |
|📊 Today │           MAIN CONTENT AREA                              |
|✅ Tasks │                                                          |
|─────────│           (Split-pane or full-width                     |
|Core     │            depending on screen)                          |
|─────────│                                                          |
|💼 Jobs  │                                                          |
|👤 Cands │                                                          |
|🏢 Accts │                                                          |
|📋 Leads │                                                          |
|💰 Deals │                                                          |
|📝 Subms │                                                          |
|📑 JOs   │                                                          |
|✅ Placed│                                                          |
|📧 Camps │                                                          |
|👥 Conts │                                                          |
|─────────│                                                          |
|Manage   │                                                          |
|─────────│                                                          |
|🏘 Pods  │                                                          |
|📈 Anlys │                                                          |
|─────────│                                                          |
|📌 Pinned│                                                          |
|  Job 1  │                                                          |
|  Cand 2 │                                                          |
|─────────│                                                          |
|⏰ Recent│                                                          |
|  Job 3  │                                                          |
|  Subm 1 │                                                          |
+------------------------------------------------------------------+
|          [Collapse ←]                                              |
+------------------------------------------------------------------+
```

---

## Component Structure

```
WorkspaceLayout
├── Header
│   ├── Logo & Brand
│   ├── Home Link
│   ├── Search Bar (opens Command Bar)
│   ├── Notifications Bell
│   └── User Menu
│
├── Sidebar
│   ├── Sidebar Header ("Workspace")
│   ├── Navigation Section: My Workspace
│   │   ├── Today (Dashboard)
│   │   └── Tasks
│   │
│   ├── Navigation Section: Core Objects
│   │   ├── Jobs
│   │   ├── Candidates
│   │   ├── Contacts
│   │   ├── Leads
│   │   ├── Deals
│   │   ├── Accounts
│   │   ├── Submissions
│   │   ├── Job Orders
│   │   ├── Placements
│   │   └── Campaigns
│   │
│   ├── Navigation Section: Management (permission-gated)
│   │   ├── Pods
│   │   └── Analytics
│   │
│   ├── Pinned Items Section
│   │
│   ├── Recent Items Section
│   │
│   └── Collapse Button
│
├── Main Content Area
│   └── {children} - Page content
│
└── Command Bar (Modal - triggered by Cmd+K)
```

---

## Header Specification

### Dimensions
| Property | Value |
|----------|-------|
| Height | 56px (h-14) |
| Background | White |
| Border | Bottom border, 1px, border-border |
| Z-Index | 50 (sticky) |
| Position | Fixed top |

### Left Section - Logo & Navigation

#### Logo
| Element | Specification |
|---------|---------------|
| Container | 32x32px, bg-forest, rounded-lg |
| Text | "IT", white, bold, 14px |
| Click Action | Navigate to `/employee/workspace` |

#### Brand Text
| Element | Specification |
|---------|---------------|
| Text | "InTime" |
| Font | font-heading, bold, 18px |
| Color | text-charcoal |
| Click Action | Navigate to `/employee/workspace` |

#### Divider
| Element | Specification |
|---------|---------------|
| Width | 1px |
| Height | 24px |
| Color | border-border |
| Margin | 0 16px |

#### Home Link
| Element | Specification |
|---------|---------------|
| Icon | Home (16x16px) |
| Text | "Home" |
| Color | text-muted-foreground |
| Hover | text-charcoal |
| Click Action | Navigate to `/employee/portal` |

### Center Section - Search

#### Search Input
| Property | Value |
|----------|-------|
| Width | max-width 448px (max-w-md), flex-1 |
| Height | 36px (h-9) |
| Background | bg-stone-50 |
| Border | 1px, border-border |
| Border Radius | 8px (rounded-lg) |
| Padding Left | 36px (for icon) |
| Placeholder | "Search jobs, talent, accounts..." |
| Font Size | 14px |
| Focus Ring | ring-2, ring-forest/20, border-forest |

#### Search Icon
| Property | Value |
|----------|-------|
| Icon | Search |
| Size | 16x16px |
| Position | Absolute, left 12px, centered vertically |
| Color | text-muted-foreground |

#### Click Behavior
- Clicking search input opens Command Bar (same as Cmd+K)

### Right Section - Actions

#### Notifications Button
| Property | Value |
|----------|-------|
| Type | Ghost Button, icon only |
| Icon | Bell (20x20px) |
| Color | text-muted-foreground |
| Badge | Red dot (8x8px) if unread notifications |
| Badge Position | top-right (top-1, right-1) |
| Click Action | Opens notification dropdown |

#### User Menu
| Property | Value |
|----------|-------|
| Type | Dropdown Trigger (Ghost Button) |
| Avatar | 28x28px, bg-forest, white initials |
| Chevron | ChevronDown, 16x16px, rotated 90° |
| Click Action | Opens user dropdown menu |

#### User Dropdown Items
1. **My Account** (label)
2. ---
3. **Employee Portal** → `/employee/portal`
4. **Workspace** → `/employee/workspace`
5. ---
6. **Sign Out** (text-rust) → Sign out action

---

## Sidebar Specification

### Dimensions
| Property | Value |
|----------|-------|
| Width | 224px (w-56) |
| Width Collapsed | 64px (w-16) |
| Background | bg-stone-50/50 |
| Border | Right border, 1px, border-border |
| Position | Fixed left, below header |
| Height | Calc(100vh - 56px) |

### Sidebar Header
| Property | Value |
|----------|-------|
| Height | 48px (h-12) |
| Border | Bottom border, border-border |
| Padding | 0 16px |
| Text | "Workspace" |
| Font | font-semibold, 14px |
| Color | text-charcoal |

### Navigation Structure

#### Section: My Workspace
| Item | Icon | Label | Route | Badge |
|------|------|-------|-------|-------|
| Dashboard | LayoutDashboard | "Today" | `/employee/workspace` | - |
| Tasks | CheckSquare | "Tasks" | `/employee/workspace/tasks` | Count of open tasks |

#### Section: Core Objects (10 entities)
| Item | Icon | Label | Route | Badge |
|------|------|-------|-------|-------|
| Jobs | Briefcase | "Jobs" | `/employee/workspace/jobs` | Active count |
| Candidates | Users | "Candidates" | `/employee/workspace/candidates` | - |
| Contacts | Contact | "Contacts" | `/employee/workspace/contacts` | - |
| Leads | Target | "Leads" | `/employee/workspace/leads` | New count |
| Deals | DollarSign | "Deals" | `/employee/workspace/deals` | Pipeline value |
| Accounts | Building2 | "Accounts" | `/employee/workspace/accounts` | - |
| Submissions | Send | "Submissions" | `/employee/workspace/submissions` | Pending count |
| Job Orders | FileText | "Job Orders" | `/employee/workspace/job-orders` | - |
| Placements | Award | "Placements" | `/employee/workspace/placements` | MTD count |
| Campaigns | Mail | "Campaigns" | `/employee/workspace/campaigns` | Active count |

#### Section: Management (Permission-Gated)
| Item | Icon | Label | Route | Required Role |
|------|------|-------|-------|---------------|
| Pods | Users2 | "Pods" | `/employee/workspace/pods` | manager, admin |
| Analytics | BarChart3 | "Analytics" | `/employee/workspace/analytics` | manager, admin |

### Navigation Item Specification

```
+-----------------------------------------------+
| [Icon]  Label                        [Badge]  |
+-----------------------------------------------+
```

| State | Background | Text Color | Icon Color |
|-------|------------|------------|------------|
| Default | transparent | text-muted-foreground | text-muted-foreground |
| Hover | bg-muted | text-foreground | text-foreground |
| Active | bg-rust/10 | text-rust | text-rust |

| Property | Value |
|----------|-------|
| Height | 40px |
| Padding | 12px horizontal, 8px vertical |
| Border Radius | 8px |
| Gap (icon to text) | 12px |
| Icon Size | 16x16px |
| Font Size | 14px |
| Font Weight | 500 (medium) |

### Badge Specification
| Property | Value |
|----------|-------|
| Height | 20px (h-5) |
| Padding | 6px horizontal |
| Background | bg-secondary |
| Text | text-xs |
| Border Radius | Full (rounded) |

### Pinned Items Section

#### Header
| Property | Value |
|----------|-------|
| Icon | Pin (12x12px) |
| Text | "Pinned" |
| Font | 12px, text-muted-foreground |
| Gap | 8px |

#### Pinned Item
| Property | Value |
|----------|-------|
| Height | 32px |
| Padding | 8px horizontal, 6px vertical |
| Icon | Entity-specific icon (14x14px) |
| Text | Truncated title, max 1 line |
| Click | Navigate to entity detail |

### Recent Items Section

#### Header
| Property | Value |
|----------|-------|
| Icon | Clock (12x12px) |
| Text | "Recent" |
| Font | 12px, text-muted-foreground |

#### Recent Item
Same as Pinned Item specification.

### Collapse Button
| Property | Value |
|----------|-------|
| Position | Bottom of sidebar, fixed |
| Height | 48px |
| Border | Top border, border-border |
| Padding | 12px |
| Button Style | Outline, sm size |
| Text | "Collapse" (or icon only when collapsed) |
| Icon | ChevronRight (or ChevronLeft when collapsed) |

---

## Main Content Area

| Property | Value |
|----------|-------|
| Position | Right of sidebar |
| Width | Calc(100% - 224px) |
| Height | Calc(100vh - 56px) |
| Overflow | auto (scrollable) |
| Background | bg-background |

---

## Command Bar Specification

### Trigger
| Method | Action |
|--------|--------|
| Keyboard | `Cmd+K` (Mac) or `Ctrl+K` (Windows) |
| Click | Click search input in header |

### Modal Dimensions
| Property | Value |
|----------|-------|
| Width | 640px |
| Max Height | 480px |
| Position | Centered, 20% from top |
| Background | bg-background |
| Border | 1px, border-border |
| Border Radius | 12px |
| Shadow | shadow-2xl |
| Backdrop | bg-black/50, blur-sm |

### Search Input (in Command Bar)
| Property | Value |
|----------|-------|
| Height | 56px |
| Border | Bottom border only |
| Padding | 16px |
| Icon | Search (20x20px) |
| Placeholder | "Type a command or search..." |
| Font Size | 16px |
| Auto Focus | Yes |

### Results Section
| Property | Value |
|----------|-------|
| Max Height | 400px |
| Overflow | auto (scrollable) |
| Padding | 8px |

### Result Groups
| Element | Specification |
|---------|---------------|
| Group Label | text-xs, text-muted-foreground, uppercase, padding 8px 12px |
| Group Items | Vertical list |

### Result Item
```
+-----------------------------------------------+
| [EntityIcon]  Title                   [Type]  |
|              Subtitle/Description             |
+-----------------------------------------------+
```

| State | Background | Text Color |
|-------|------------|------------|
| Default | transparent | text-foreground |
| Selected | bg-accent | text-accent-foreground |

| Property | Value |
|----------|-------|
| Height | Auto (min 48px) |
| Padding | 8px 12px |
| Border Radius | 8px |
| Gap | 12px |

### Commands (Action Mode)

When input starts with `>`, show commands:

| Command | Description |
|---------|-------------|
| `> jobs` | Go to Jobs list |
| `> candidates` | Go to Candidates list |
| `> new job` | Create new job |
| `> new candidate` | Create new candidate |
| `> submit [name] to [job]` | Submit candidate to job |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑` | Previous result |
| `↓` | Next result |
| `Enter` | Select/Execute |
| `Esc` | Close command bar |
| `Tab` | Cycle through sections |

---

## Responsive Behavior

### Breakpoints
| Breakpoint | Sidebar | Header |
|------------|---------|--------|
| Desktop (≥1024px) | Full width (224px) | Full |
| Tablet (768-1023px) | Collapsed (64px, icons only) | Full |
| Mobile (<768px) | Hidden (slide-out on menu) | Compact |

### Mobile Header
- Hide "Home" text (icon only)
- Hamburger menu replaces sidebar
- Search input becomes icon that opens modal

---

## Accessibility

### Keyboard Navigation
| Key | Action |
|-----|--------|
| `Tab` | Move through interactive elements |
| `Enter` | Activate buttons/links |
| `Esc` | Close modals/dropdowns |

### ARIA Labels
| Element | Label |
|---------|-------|
| Sidebar | `aria-label="Main navigation"` |
| Search | `aria-label="Search"` |
| Notifications | `aria-label="Notifications"` |
| User Menu | `aria-label="User menu"` |

### Focus States
- All interactive elements have visible focus ring
- Focus ring color: ring-forest
- Focus ring width: 2px
- Focus ring offset: 2px

---

## Theme Tokens Used

| Token | Value | Usage |
|-------|-------|-------|
| `forest` | #2D5A47 | Logo background, active states |
| `rust` | #B54834 | Active nav items, notifications |
| `charcoal` | #2C2C2C | Primary text |
| `stone-50` | #FAFAF9 | Sidebar background |
| `border` | #E7E5E4 | All borders |
| `muted-foreground` | #78716C | Secondary text |

---

## Animation Specifications

### Sidebar Collapse
| Property | Value |
|----------|-------|
| Duration | 200ms |
| Easing | ease-in-out |
| Properties | width, padding |

### Command Bar Open/Close
| Property | Value |
|----------|-------|
| Duration | 150ms |
| Easing | ease-out |
| Entry | Scale from 0.95, fade in |
| Exit | Scale to 0.95, fade out |

### Navigation Hover
| Property | Value |
|----------|-------|
| Duration | 150ms |
| Easing | ease |
| Properties | background-color, color |

---

*Last Updated: 2024-11-30*



