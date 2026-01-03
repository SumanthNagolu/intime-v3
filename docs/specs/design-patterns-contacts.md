# InTime v3 - Design Patterns from Contacts Section

This document captures the design patterns established in the Account Contacts section. Apply these consistently across all entity workspaces.

---

## 1. List View Pattern

### Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ [🔍 Search...]                              X contacts          │
├───────────────────────────────────────────────────────────────-─┤
│ NAME        │ TITLE    │ AUTHORITY    │ EMAIL      │ PHONE │ ⋮ │
├─────────────┼──────────┼──────────────┼────────────┼───────┼───┤
│ John Doe ⭐ │ Director │ [Decision]   │ j@co.com   │ +1... │ ⋮ │
│ Jane Smith  │ Manager  │ [Influencer] │ jane@co.co │ +1... │ ⋮ │
├─────────────────────────────────────────────────────────────────┤
│ ◀ Prev                  Page 1 of 3                    Next ▶   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Elements

| Element | Specification |
|---------|---------------|
| **Header** | `bg-charcoal-50`, uppercase labels, `text-xs font-semibold text-charcoal-600` |
| **Search** | Left-aligned, `max-w-sm`, icon inside input |
| **Count** | Right of search: `{n} contacts` |
| **Grid** | Use CSS Grid: `grid-cols-[1fr_120px_120px_150px_100px_80px]` |
| **Row Hover** | `hover:bg-charcoal-50` |
| **Selected Row** | `bg-gold-50` |
| **Primary Indicator** | Gold star icon next to name |
| **Avatar** | 32x32 rounded-full with initials |
| **Pagination** | Centered, 10 items per page default |

### Authority Badges (Status Badges Pattern)

```tsx
const AUTHORITY_COLORS = {
  decision_maker: "bg-green-100 text-green-700",
  influencer: "bg-blue-100 text-blue-700",
  gatekeeper: "bg-orange-100 text-orange-700",
  champion: "bg-purple-100 text-purple-700",
  end_user: "bg-charcoal-100 text-charcoal-600",
}
```

### Row Actions Menu (⋮)

```tsx
<DropdownMenu>
  <DropdownMenuItem><Mail /> Email</DropdownMenuItem>
  <DropdownMenuItem><Phone /> Call</DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem><Pencil /> Edit</DropdownMenuItem>
  <DropdownMenuItem className="text-red-600"><Trash2 /> Delete</DropdownMenuItem>
</DropdownMenu>
```

---

## 2. Detail Panel Pattern (Bottom Panel)

When a row is clicked, show detail panel below the list (Guidewire-style).

### Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ [Avatar] John Doe                                [✏ EDIT] [✕]   │
│          Director                                               │
├───────────────┬───────────────┬─────────────────────────────────┤
│ PERSON        │ ADDRESS       │ NOTES                           │
├───────────────┼───────────────┼─────────────────────────────────┤
│ Name    Value │ Street  Value │ Notes content here...           │
│ Title   Value │ City    Value │                                 │
│ Dept    Value │ State   Value │                                 │
│               │ ZIP     Value │                                 │
│ CONTACT       │ Country Value │                                 │
│ Email   Value │               │                                 │
│ Phone   Value │ ACCOUNT ROLE  │                                 │
│ Mobile  Value │ Authority Val │                                 │
│ LinkedIn Val  │ Pref Method V │                                 │
├───────────────────────────────────────────────────────────────-─┤
│ View complete profile...                    [Go to Contact →]   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Rules

1. **Three-Column Layout**: PERSON | ADDRESS + ACCOUNT ROLE | NOTES
2. **Section Headers**: Uppercase, `text-xs font-semibold text-charcoal-400`
3. **Label/Value Pairs**: Label left (`text-charcoal-500`), Value right (`text-charcoal-900`)
4. **Empty Values**: Show "—" (em-dash)
5. **Icons with Values**: Small icon (h-4 w-4) before clickable values (email, phone, LinkedIn)

### View Mode vs Edit Mode

**View Mode:**
- Edit button in header
- Values displayed as text
- Links for email/phone/LinkedIn

**Edit Mode:**
- Save/Cancel buttons replace Edit button
- Values become inputs
- Validation on blur

```tsx
// Header buttons
{isEditing ? (
  <>
    <Button variant="ghost" size="sm" onClick={handleCancel}>
      <X className="h-4 w-4 mr-1" /> Cancel
    </Button>
    <Button size="sm" onClick={handleSave} disabled={saving}>
      <Check className="h-4 w-4 mr-1" /> Save
    </Button>
  </>
) : (
  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
    <Pencil className="h-4 w-4 mr-1" /> Edit
  </Button>
)}
```

---

## 3. Actions Consolidation Pattern

### Three Levels of Actions

| Level | Location | Purpose | Examples |
|-------|----------|---------|----------|
| **Workspace** | Sidebar Quick Actions | Primary create/do actions | Add Contact, New Job, Log Activity |
| **Entity-Admin** | Header Actions dropdown | Administrative operations | Edit, Add to Campaign, Export, Status changes |
| **Row** | Row menu (⋮) | Per-item quick actions | Email, Call, Edit, Delete |

### Sidebar Quick Actions (Always Visible)
```
⚡ Actions ▼
├── 👤 Add Contact      (dialog)
├── 💼 New Job          (navigate to intake)
├── 📞 Log Activity     (dialog)
└── ✏️ Edit Account     (navigate)
```

### Header Actions Dropdown (Administrative)
```
Actions ▼
├── ✏️ Edit Account
├── ─────────────────
├── 📢 Add to Campaign
├── ⬇️ Export Data
├── ─────────────────
├── ⏸️ Put On Hold      (status change)
└── 🗑️ Archive          (destructive)
```

### DO NOT Duplicate
- If action is in sidebar, don't repeat in header
- Keep section headers clean (no "+ Add" buttons)
- Sidebar is the primary action point

---

## 4. Address Input Pattern

### Inline Address Section (Not Separate Tab)
```
ADDRESS
├── Street      [________________]
├── City        [________________]
├── State       [▼ Select State  ]  ← Dropdown based on country
├── ZIP Code    [_____]              ← PostalCodeInput component
└── Country     [▼ United States ]
```

### Country-Specific Validation

```tsx
import { PostalCodeInput } from '@/components/ui/postal-code-input'
import { getStatesByCountry, OPERATING_COUNTRIES } from '@/components/addresses'

// Use PostalCodeInput for ZIP/PIN validation
<PostalCodeInput
  value={addressForm.zip}
  onChange={(value) => setAddressForm(prev => ({ ...prev, zip: value }))}
  country={addressForm.country}
  error={addressErrors.zip}
/>

// Dynamic state dropdown
const states = getStatesByCountry(addressForm.country)
```

### Supported Countries
- US (5-digit ZIP)
- CA (A1A 1A1 format)
- IN (6-digit PIN)

---

## 5. Form Layout Pattern

### Grouped Fields

```
┌─ PERSON ──────────────────────┐
│ Name *        [John Doe     ] │
│ Title         [Director     ] │
│ Department    [Engineering  ] │
└───────────────────────────────┘

┌─ CONTACT ─────────────────────┐
│ Email         [john@co.com  ] │
│ Phone         [+1 555 123   ] │
│ Mobile        [+1 555 456   ] │
│ LinkedIn      [linkedin.com/] │
└───────────────────────────────┘

┌─ ADDRESS ─────────────────────┐
│ Street        [123 Main St  ] │
│ City          [San Francisco] │
│ State         [▼ California ] │
│ ZIP Code      [94102        ] │
│ Country       [▼ USA        ] │
└───────────────────────────────┘

┌─ ACCOUNT ROLE ────────────────┐
│ Authority     [▼ Influencer ] │
│ Pref. Method  [▼ Email      ] │
│ ☐ Primary Contact            │
└───────────────────────────────┘

┌─ NOTES ───────────────────────┐
│ [                           ] │
│ [   Resizable textarea      ] │
│ [                           ] │
│ ═══════════════════════════   │ ← Drag handle indicator
└───────────────────────────────┘
```

### Field Styling

```tsx
// Label
<Label className="text-sm font-medium text-charcoal-700">
  Name <span className="text-red-500">*</span>
</Label>

// Input
<Input className="h-9" placeholder="Enter name..." />

// Textarea with resize
<Textarea 
  className="resize-y min-h-[100px]" 
  rows={4}
/>

// Required field indicator
const required = <span className="text-red-500">*</span>
```

---

## 6. Dialog Pattern

### Wide Dialog for Complex Forms

```tsx
<DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col min-h-0">
  <DialogHeader>
    <DialogTitle>Add Contact</DialogTitle>
    <DialogDescription>Add a new contact to this account</DialogDescription>
  </DialogHeader>
  
  <div className="flex-1 overflow-y-auto px-1 py-4">
    {/* Form content */}
  </div>
  
  <DialogFooter>
    <Button variant="outline" onClick={onClose}>Cancel</Button>
    <Button onClick={handleSubmit}>Add Contact</Button>
  </DialogFooter>
</DialogContent>
```

### Key Rules
1. `max-w-[800px]` for complex forms (default is 500px)
2. `flex flex-col min-h-0` for proper scroll behavior
3. Content wrapper: `flex-1 overflow-y-auto`
4. Group fields in 2-3 columns using grid

---

## 7. Empty States

### No Data
```tsx
<div className="py-12 text-center">
  <MapPin className="h-8 w-8 text-charcoal-300 mx-auto mb-3" />
  <p className="text-sm text-charcoal-500">No address on file</p>
</div>
```

### No Results (Search)
```tsx
<div className="py-12 text-center">
  <Search className="h-8 w-8 text-charcoal-300 mx-auto mb-3" />
  <p className="text-sm text-charcoal-500">No contacts match your search</p>
</div>
```

---

## 8. Loading States

```tsx
// Button loading
<Button disabled={isLoading}>
  {isLoading ? (
    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
  ) : (
    <Check className="h-4 w-4 mr-2" />
  )}
  Save
</Button>

// Section loading
<div className="flex items-center justify-center py-12">
  <Loader2 className="h-6 w-6 animate-spin text-charcoal-400" />
</div>
```

---

## 9. Validation Pattern

### Real-time Validation

```tsx
const [errors, setErrors] = useState<Record<string, string>>({})

const validate = (): boolean => {
  const newErrors: Record<string, string> = {}
  
  // Required
  if (!form.name.trim()) {
    newErrors.name = 'Name is required'
  }
  
  // Email format
  if (form.email && !isValidEmail(form.email)) {
    newErrors.email = 'Invalid email format'
  }
  
  // Phone format
  if (form.phone && !isValidPhone(form.phone)) {
    newErrors.phone = 'Invalid phone format'
  }
  
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

### Error Display

```tsx
<div className="space-y-1">
  <Input 
    className={cn(errors.email && "border-red-500")} 
    value={form.email}
    onChange={...}
  />
  {errors.email && (
    <p className="text-xs text-red-500">{errors.email}</p>
  )}
</div>
```

---

## 10. Toast Notifications

```tsx
import { useToast } from '@/components/ui/use-toast'

const { toast } = useToast()

// Success
toast({ title: 'Contact updated successfully' })

// Error
toast({ 
  title: 'Error updating contact', 
  description: error.message,
  variant: 'error' 
})
```

---

## Quick Reference: CSS Classes

```css
/* Backgrounds */
.bg-cream          /* Page background */
.bg-white          /* Cards */
.bg-charcoal-25    /* Section headers */
.bg-charcoal-50    /* Table headers, hover states */
.bg-gold-50        /* Selected/active states */

/* Text */
.text-charcoal-900 /* Primary text */
.text-charcoal-600 /* Secondary text */
.text-charcoal-500 /* Labels */
.text-charcoal-400 /* Placeholders, subtle text */

/* Borders */
.border-charcoal-100 /* Light dividers */
.border-charcoal-200 /* Card borders */

/* Interactive */
.hover:bg-charcoal-50   /* Row hover */
.hover:bg-gold-50       /* Action hover */
.text-gold-700          /* Active state text */
```

---

## Checklist for New Sections

- [ ] List view with search & pagination
- [ ] Table headers (uppercase, charcoal-600)
- [ ] Row selection → bottom detail panel
- [ ] Three-column detail layout
- [ ] Edit mode with inline inputs
- [ ] Proper empty states
- [ ] Loading states for async actions
- [ ] Actions in sidebar (not in section header)
- [ ] Row-level action menu
- [ ] Form validation with error display
- [ ] Toast notifications for feedback




