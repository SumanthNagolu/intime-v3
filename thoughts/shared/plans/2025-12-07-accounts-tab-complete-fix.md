# Accounts Tab Complete Fix - Implementation Plan

## Overview

Fix all issues with the Accounts Tab including navigation dropdown hover behavior, missing routes (`/health`, `/new`), account detail page loading, and implement a full-page account creation wizard. Additionally, create Playwright E2E tests to generate 5 test accounts with diverse data.

## Current State Analysis

### Issues Identified

| Issue | Root Cause | Location |
|-------|-----------|----------|
| Dropdown disappearing | `mt-1` gap causes `onMouseLeave` to fire | `TopNavigation.tsx:286` |
| Search not inline | Search is a navigation link, not input | `top-navigation.ts:35` |
| Account Health 404 | No `/health` route, caught by `[id]` | Missing route |
| Create Account modal | Button triggers dialog, not wizard page | `accounts/page.tsx:87` |
| Individual accounts 404 | tRPC query org_id filtering or layout error | `[id]/layout.tsx:24` |

### Key Files

- `src/components/navigation/TopNavigation.tsx` - Dropdown behavior
- `src/lib/navigation/top-navigation.ts` - Navigation config
- `src/app/employee/recruiting/accounts/page.tsx` - List page
- `src/app/employee/recruiting/accounts/[id]/page.tsx` - Detail page
- `src/app/employee/recruiting/accounts/[id]/layout.tsx` - Detail layout
- `src/components/recruiting/accounts/CreateAccountDialog.tsx` - Current wizard modal
- `src/server/routers/crm.ts` - tRPC procedures

## Desired End State

1. **Dropdown Navigation**: Smooth hover transitions with 150ms delay, no gap issues
2. **Inline Search**: Type-to-search within dropdown with search icon button
3. **Account Health**: Dedicated dashboard page at `/accounts/health`
4. **Account Wizard**: Full-page multi-step wizard at `/accounts/new`
5. **Account Detail**: All accounts load correctly when clicked from list
6. **E2E Tests**: 5 diverse accounts created via Playwright automation

### Verification

- All navigation dropdown items work without flickering
- Search input filters accounts as you type
- `/employee/recruiting/accounts/health` loads health dashboard
- `/employee/recruiting/accounts/new` loads full-page wizard
- Clicking any account in list opens its detail page
- All 5 Playwright-created accounts visible and editable in UI

## What We're NOT Doing

- NOT changing the account data model or schema
- NOT modifying the tRPC procedures (except minor fixes)
- NOT adding new account types beyond existing categories
- NOT implementing full metadata-driven screens (using direct implementation)
- NOT changing the sidebar navigation structure

## Implementation Approach

The implementation follows Guidewire-inspired lean principles:
- **Entity-centric navigation** with search capability
- **Full-page wizards** for complex entity creation (not modals)
- **Static routes take precedence** over dynamic routes
- **Graceful error handling** with clear feedback

---

## Phase 1: Fix Dropdown Hover Behavior

### Overview
Fix the navigation dropdown disappearing when mouse moves through the gap between trigger and dropdown.

### Changes Required

#### 1. Add Hover Delay with Timer
**File**: `src/components/navigation/TopNavigation.tsx`

Add a close timer ref at the top of the component (after line 28):
```typescript
const closeTimerRef = useRef<NodeJS.Timeout | null>(null)
```

Modify the hover handlers (lines 242-248):
```typescript
onMouseEnter={() => {
  // Clear any pending close timer
  if (closeTimerRef.current) {
    clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
  }
  if (!menuItemRefs.current[tab.id]) {
    menuItemRefs.current[tab.id] = []
  }
  setActiveDropdown(tab.id)
}}
onMouseLeave={() => {
  // Add 150ms delay before closing
  closeTimerRef.current = setTimeout(() => {
    setActiveDropdown(null)
  }, 150)
}}
```

Add cleanup effect (after existing useEffects, around line 65):
```typescript
useEffect(() => {
  return () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
    }
  }
}, [])
```

#### 2. Remove Gap Between Trigger and Dropdown
**File**: `src/components/navigation/TopNavigation.tsx`

Change line 286 from:
```typescript
'absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-xl py-2 border border-charcoal-100/50 z-50 transition-all duration-200',
```

To (use negative margin with padding to maintain visual spacing):
```typescript
'absolute left-0 top-full -mt-1 pt-2 w-64 bg-white rounded-lg shadow-xl py-2 border border-charcoal-100/50 z-50 transition-all duration-200',
```

### Success Criteria

#### Automated Verification:
- [x] TypeScript compiles: `pnpm build`
- [x] Lint passes: `pnpm lint`

#### Manual Verification:
- [ ] Hover over "Accounts" tab - dropdown appears
- [ ] Move mouse slowly down to dropdown items - dropdown stays open
- [ ] Click a dropdown item - navigates correctly
- [ ] Move mouse away from dropdown - closes after brief delay
- [ ] Test on all navigation tabs (My Work, Jobs, Candidates, etc.)

**Implementation Note**: Phase 1 completed - 150ms close delay added, gap removed.

---

## Phase 2: Add Inline Search to Dropdown

### Overview
Replace the "Search Accounts" link with an inline search input that filters accounts as you type.

### Changes Required

#### 1. Update Navigation Config
**File**: `src/lib/navigation/top-navigation.ts`

Add a new type for inline search (update line 35):
```typescript
{ id: 'search-accounts', label: 'Search Accounts', icon: Search, type: 'search', placeholder: 'Search by name...' },
```

#### 2. Update Entity Navigation Types
**File**: `src/lib/navigation/entity-navigation.types.ts`

Add 'search' type to DropdownItem interface (find and update the type definition):
```typescript
export interface DropdownItem {
  id: string
  label: string
  icon?: LucideIcon
  href?: string
  badge?: string
  type: 'link' | 'recent' | 'divider' | 'search'
  placeholder?: string
}
```

#### 3. Implement Inline Search Component
**File**: `src/components/navigation/TopNavigation.tsx`

Add state for search (after line 20):
```typescript
const [dropdownSearch, setDropdownSearch] = useState('')
const [searchResults, setSearchResults] = useState<{id: string, name: string}[]>([])
```

Add search handler function (after handleTabClick around line 187):
```typescript
const handleDropdownSearch = async (tabId: string, query: string) => {
  setDropdownSearch(query)
  if (query.length < 2) {
    setSearchResults([])
    return
  }
  // Use existing tRPC client or fetch
  // For simplicity, we'll navigate to the list page with search param
}

const handleSearchSubmit = (tabId: string) => {
  const tab = topNavigationTabs.find(t => t.id === tabId)
  if (tab?.defaultHref) {
    router.push(`${tab.defaultHref}?search=${encodeURIComponent(dropdownSearch)}`)
    setActiveDropdown(null)
    setDropdownSearch('')
  }
}
```

In the dropdown render (after line 301, inside the map), add search type handling:
```typescript
if (item.type === 'search') {
  return (
    <div key={item.id} className="px-2 py-2">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSearchSubmit(tab.id)
        }}
        className="relative"
      >
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-charcoal-400" />
        <input
          type="text"
          placeholder={item.placeholder || 'Search...'}
          value={dropdownSearch}
          onChange={(e) => setDropdownSearch(e.target.value)}
          className="w-full pl-9 pr-10 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          type="submit"
          className="absolute right-2 top-1.5 p-1 rounded hover:bg-charcoal-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-charcoal-400" />
        </button>
      </form>
    </div>
  )
}
```

Add import for ChevronRight at top of file:
```typescript
import { ChevronDown, ChevronRight, User, LogOut, Clock, Command, Menu, X, Search } from 'lucide-react'
```

### Success Criteria

#### Automated Verification:
- [x] TypeScript compiles: `pnpm build`
- [x] Lint passes: `pnpm lint`

#### Manual Verification:
- [ ] Open Accounts dropdown - see search input at top
- [ ] Type "test" in search input - stays in dropdown
- [ ] Press Enter or click search icon - navigates to accounts list with search applied
- [ ] URL shows `?search=test` parameter
- [ ] Search input clears after navigation

**Implementation Note**: Phase 2 completed - inline search input added with submit button.

---

## Phase 3: Create Account Health Page

### Overview
Create a dedicated page for the Account Health dashboard at `/employee/recruiting/accounts/health`.

### Changes Required

#### 1. Create Health Route Directory and Page
**File**: `src/app/employee/recruiting/accounts/health/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertTriangle,
  Building2,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const healthColors = {
  healthy: { bg: 'bg-green-100', text: 'text-green-800', icon: TrendingUp },
  attention: { bg: 'bg-amber-100', text: 'text-amber-800', icon: Minus },
  at_risk: { bg: 'bg-red-100', text: 'text-red-800', icon: TrendingDown },
}

export default function AccountHealthPage() {
  const [filter, setFilter] = useState<'all' | 'healthy' | 'attention' | 'at_risk'>('all')

  const healthQuery = trpc.crm.accounts.getHealth.useQuery({})

  const healthData = healthQuery.data
  const summary = healthData?.summary
  const accounts = healthData?.accounts || []

  const filteredAccounts = filter === 'all'
    ? accounts
    : accounts.filter(a => a.healthStatus === filter)

  // Sort by health score ascending (worst first)
  const sortedAccounts = [...filteredAccounts].sort((a, b) => a.healthScore - b.healthScore)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/employee/recruiting/accounts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-semibold text-charcoal-900">Account Health Dashboard</h1>
            <p className="text-charcoal-500">Monitor and improve client relationships</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => healthQuery.refetch()}
          disabled={healthQuery.isRefetching}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", healthQuery.isRefetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Health Summary Cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <Card
            className={cn(
              "cursor-pointer transition-all",
              filter === 'all' && "ring-2 ring-hublot-500"
            )}
            onClick={() => setFilter('all')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-500">Total Accounts</p>
                  <p className="text-2xl font-bold">{summary.total}</p>
                </div>
                <Building2 className="w-8 h-8 text-charcoal-300" />
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all",
              filter === 'healthy' && "ring-2 ring-green-500"
            )}
            onClick={() => setFilter('healthy')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-500">Healthy</p>
                  <p className="text-2xl font-bold text-green-600">{summary.healthy}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-300" />
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all",
              filter === 'attention' && "ring-2 ring-amber-500"
            )}
            onClick={() => setFilter('attention')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-500">Needs Attention</p>
                  <p className="text-2xl font-bold text-amber-600">{summary.needsAttention}</p>
                </div>
                <Minus className="w-8 h-8 text-amber-300" />
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all",
              filter === 'at_risk' && "ring-2 ring-red-500"
            )}
            onClick={() => setFilter('at_risk')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-500">At Risk</p>
                  <p className="text-2xl font-bold text-red-600">{summary.atRisk}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-300" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Health Score Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Health Score Factors</CardTitle>
          <CardDescription>How account health is calculated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div className="p-3 bg-charcoal-50 rounded-lg">
              <p className="font-medium">Base Score</p>
              <p className="text-charcoal-500">100 points</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="font-medium text-red-700">No contact &gt;14 days</p>
              <p className="text-red-600">-30 points</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="font-medium text-amber-700">No contact 7-14 days</p>
              <p className="text-amber-600">-15 points</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-700">No active jobs</p>
              <p className="text-blue-600">-20 points</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="font-medium text-purple-700">NPS &lt; 7</p>
              <p className="text-purple-600">-20 points</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {filter === 'all' ? 'All Accounts' : `${filter.replace('_', ' ')} Accounts`.replace(/\b\w/g, l => l.toUpperCase())}
            </CardTitle>
            <CardDescription>
              {sortedAccounts.length} account{sortedAccounts.length !== 1 ? 's' : ''} {filter !== 'all' && `requiring ${filter === 'at_risk' ? 'immediate' : 'some'} attention`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {healthQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
            </div>
          ) : sortedAccounts.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900">
                {filter === 'all' ? 'No accounts yet' : `No ${filter.replace('_', ' ')} accounts`}
              </h3>
              <p className="text-charcoal-500">
                {filter === 'all' ? 'Create your first account to start tracking health' : 'Great job keeping accounts healthy!'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Health Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Active Jobs</TableHead>
                  <TableHead>NPS</TableHead>
                  <TableHead>Action Needed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAccounts.map((account) => {
                  const colors = healthColors[account.healthStatus as keyof typeof healthColors] || healthColors.healthy
                  const HealthIcon = colors.icon
                  return (
                    <TableRow key={account.id}>
                      <TableCell>
                        <Link
                          href={`/employee/recruiting/accounts/${account.id}`}
                          className="font-medium text-charcoal-900 hover:text-hublot-700"
                        >
                          {account.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <HealthIcon className={cn("w-4 h-4", colors.text)} />
                          <span className={cn("font-medium", colors.text)}>
                            {account.healthScore}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(colors.bg, colors.text)}>
                          {account.healthStatus.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {account.lastContactDate ? (
                          formatDistanceToNow(new Date(account.lastContactDate), { addSuffix: true })
                        ) : (
                          <span className="text-red-600 font-medium">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {account.activeJobs || 0}
                      </TableCell>
                      <TableCell>
                        {account.npsScore ?? <span className="text-charcoal-400">-</span>}
                      </TableCell>
                      <TableCell>
                        {account.healthStatus === 'at_risk' && (
                          <Button size="sm" variant="destructive" asChild>
                            <Link href={`/employee/recruiting/accounts/${account.id}`}>
                              Review Now
                            </Link>
                          </Button>
                        )}
                        {account.healthStatus === 'attention' && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/employee/recruiting/accounts/${account.id}`}>
                              Check In
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

### Success Criteria

#### Automated Verification:
- [x] TypeScript compiles: `pnpm build`
- [x] Lint passes: `pnpm lint`

#### Manual Verification:
- [ ] Navigate to `/employee/recruiting/accounts/health` - loads dashboard
- [ ] Click "Account Health" in Accounts dropdown - navigates correctly
- [ ] Health summary cards display correct counts
- [ ] Click filter cards to filter accounts by health status
- [ ] Click account name to navigate to detail page
- [ ] Refresh button reloads data

**Implementation Note**: Phase 3 completed - Account Health page created at `/employee/recruiting/accounts/health`.

---

## Phase 4: Create Full-Page Account Wizard

### Overview
Create a full-page multi-step wizard at `/employee/recruiting/accounts/new` that replaces the modal approach.

### Changes Required

#### 1. Create New Account Route
**File**: `src/app/employee/recruiting/accounts/new/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  Building2,
  CreditCard,
  Users,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type WizardStep = 1 | 2 | 3

const STEPS = [
  { number: 1, title: 'Company Basics', icon: Building2, description: 'Basic company information' },
  { number: 2, title: 'Billing & Terms', icon: CreditCard, description: 'Payment and contract terms' },
  { number: 3, title: 'Primary Contact', icon: Users, description: 'Main point of contact' },
]

const INDUSTRIES = [
  'technology', 'healthcare', 'finance', 'manufacturing', 'retail',
  'consulting', 'education', 'government', 'energy', 'media',
  'real_estate', 'other'
]

export default function NewAccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<WizardStep>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Company Basics
    name: '',
    industry: '',
    companyType: 'direct_client' as 'direct_client' | 'implementation_partner' | 'staffing_vendor',
    tier: '' as '' | 'preferred' | 'strategic' | 'exclusive',
    website: '',
    phone: '',
    headquartersLocation: '',
    description: '',
    linkedinUrl: '',
    // Step 2: Billing & Terms
    billingEntityName: '',
    billingEmail: '',
    billingPhone: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: 'USA',
    billingFrequency: 'monthly' as 'weekly' | 'biweekly' | 'monthly',
    paymentTermsDays: '30',
    poRequired: false,
    // Step 3: Primary Contact
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactTitle: '',
    primaryContactPhone: '',
    preferredContactMethod: 'email' as 'email' | 'phone' | 'slack' | 'teams',
    meetingCadence: 'weekly' as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly',
  })

  const createMutation = trpc.crm.accounts.create.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Account created successfully', description: `${formData.name} has been added.` })
      router.push(`/employee/recruiting/accounts/${data.id}`)
    },
    onError: (error) => {
      toast({ title: 'Error creating account', description: error.message, variant: 'error' })
      setIsSubmitting(false)
    },
  })

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (!formData.name || formData.name.length < 2) {
      toast({ title: 'Company name is required', description: 'Please enter at least 2 characters', variant: 'error' })
      return false
    }
    if (!formData.industry) {
      toast({ title: 'Industry is required', variant: 'error' })
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (formData.billingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail)) {
      toast({ title: 'Invalid billing email', variant: 'error' })
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (formData.primaryContactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryContactEmail)) {
      toast({ title: 'Invalid contact email', variant: 'error' })
      return false
    }
    if (formData.primaryContactEmail && !formData.primaryContactName) {
      toast({ title: 'Contact name required', description: 'Please provide a name for the contact', variant: 'error' })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep((step + 1) as WizardStep)
  }

  const handleBack = () => {
    setStep((step - 1) as WizardStep)
  }

  const handleSubmit = async () => {
    if (!validateStep3()) return
    setIsSubmitting(true)
    createMutation.mutate(formData)
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/employee/recruiting/accounts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-semibold text-charcoal-900">Create New Account</h1>
            <p className="text-charcoal-500">Set up a new client account in the system</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Connector line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-charcoal-200" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-gold-500 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />

            {STEPS.map((s) => {
              const isCompleted = step > s.number
              const isActive = step === s.number
              const Icon = s.icon
              return (
                <div key={s.number} className="relative z-10 flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                      isCompleted && 'bg-gold-500 text-white',
                      isActive && 'bg-hublot-900 text-white',
                      !isCompleted && !isActive && 'bg-white border-2 border-charcoal-200 text-charcoal-400'
                    )}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={cn(
                      'font-medium text-sm',
                      isActive ? 'text-charcoal-900' : 'text-charcoal-500'
                    )}>
                      {s.title}
                    </p>
                    <p className="text-xs text-charcoal-400 hidden sm:block">{s.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Step {step} of 3: {STEPS[step - 1].title}</CardTitle>
            <CardDescription>{STEPS[step - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Company Basics */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Acme Corporation"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry *</Label>
                    <Select value={formData.industry} onValueChange={(v) => updateField('industry', v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind} value={ind} className="capitalize">
                            {ind.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="companyType">Company Type</Label>
                    <Select value={formData.companyType} onValueChange={(v: any) => updateField('companyType', v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct_client">Direct Client</SelectItem>
                        <SelectItem value="implementation_partner">Implementation Partner</SelectItem>
                        <SelectItem value="staffing_vendor">Staffing Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tier">Partnership Tier</Label>
                    <Select value={formData.tier} onValueChange={(v: any) => updateField('tier', v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select tier (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="preferred">Preferred</SelectItem>
                        <SelectItem value="strategic">Strategic</SelectItem>
                        <SelectItem value="exclusive">Exclusive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="headquartersLocation">Headquarters Location</Label>
                    <Input
                      id="headquartersLocation"
                      placeholder="e.g., San Francisco, CA"
                      value={formData.headquartersLocation}
                      onChange={(e) => updateField('headquartersLocation', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      placeholder="https://linkedin.com/company/..."
                      value={formData.linkedinUrl}
                      onChange={(e) => updateField('linkedinUrl', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the company and what they do..."
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Billing & Terms */}
            {step === 2 && (
              <>
                <p className="text-sm text-charcoal-500 bg-charcoal-50 p-3 rounded-lg">
                  Billing information is optional and can be added later during onboarding.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="billingEntityName">Legal Billing Entity Name</Label>
                    <Input
                      id="billingEntityName"
                      placeholder="Legal name for invoicing"
                      value={formData.billingEntityName}
                      onChange={(e) => updateField('billingEntityName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingEmail">Billing Email</Label>
                    <Input
                      id="billingEmail"
                      type="email"
                      placeholder="billing@company.com"
                      value={formData.billingEmail}
                      onChange={(e) => updateField('billingEmail', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingPhone">Billing Phone</Label>
                    <Input
                      id="billingPhone"
                      placeholder="(555) 123-4567"
                      value={formData.billingPhone}
                      onChange={(e) => updateField('billingPhone', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="billingAddress">Billing Address</Label>
                    <Input
                      id="billingAddress"
                      placeholder="Street address"
                      value={formData.billingAddress}
                      onChange={(e) => updateField('billingAddress', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingCity">City</Label>
                    <Input
                      id="billingCity"
                      value={formData.billingCity}
                      onChange={(e) => updateField('billingCity', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingState">State</Label>
                    <Input
                      id="billingState"
                      value={formData.billingState}
                      onChange={(e) => updateField('billingState', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingPostalCode">Postal Code</Label>
                    <Input
                      id="billingPostalCode"
                      value={formData.billingPostalCode}
                      onChange={(e) => updateField('billingPostalCode', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingCountry">Country</Label>
                    <Input
                      id="billingCountry"
                      value={formData.billingCountry}
                      onChange={(e) => updateField('billingCountry', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">Payment Terms</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="billingFrequency">Billing Frequency</Label>
                      <Select value={formData.billingFrequency} onValueChange={(v: any) => updateField('billingFrequency', v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="paymentTermsDays">Payment Terms (Days)</Label>
                      <Input
                        id="paymentTermsDays"
                        type="number"
                        value={formData.paymentTermsDays}
                        onChange={(e) => updateField('paymentTermsDays', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="poRequired"
                          checked={formData.poRequired}
                          onCheckedChange={(checked) => updateField('poRequired', !!checked)}
                        />
                        <Label htmlFor="poRequired" className="cursor-pointer">PO Required</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Primary Contact */}
            {step === 3 && (
              <>
                <p className="text-sm text-charcoal-500 bg-charcoal-50 p-3 rounded-lg">
                  Adding a primary contact is optional. Additional contacts can be added later.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryContactName">Full Name</Label>
                    <Input
                      id="primaryContactName"
                      placeholder="John Smith"
                      value={formData.primaryContactName}
                      onChange={(e) => updateField('primaryContactName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryContactTitle">Title / Role</Label>
                    <Input
                      id="primaryContactTitle"
                      placeholder="VP of Engineering"
                      value={formData.primaryContactTitle}
                      onChange={(e) => updateField('primaryContactTitle', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryContactEmail">Email</Label>
                    <Input
                      id="primaryContactEmail"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.primaryContactEmail}
                      onChange={(e) => updateField('primaryContactEmail', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryContactPhone">Phone</Label>
                    <Input
                      id="primaryContactPhone"
                      placeholder="(555) 123-4567"
                      value={formData.primaryContactPhone}
                      onChange={(e) => updateField('primaryContactPhone', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">Communication Preferences</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                      <Select value={formData.preferredContactMethod} onValueChange={(v: any) => updateField('preferredContactMethod', v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="slack">Slack</SelectItem>
                          <SelectItem value="teams">Microsoft Teams</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="meetingCadence">Meeting Cadence</Label>
                      <Select value={formData.meetingCadence} onValueChange={(v: any) => updateField('meetingCadence', v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/employee/recruiting/accounts">Cancel</Link>
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 2. Update Accounts List Page - "New Account" Button Navigation
**File**: `src/app/employee/recruiting/accounts/page.tsx`

Change lines 87-90 from:
```typescript
<Button onClick={() => setCreateDialogOpen(true)}>
  <Plus className="w-4 h-4 mr-2" />
  New Account
</Button>
```

To:
```typescript
<Button asChild>
  <Link href="/employee/recruiting/accounts/new">
    <Plus className="w-4 h-4 mr-2" />
    New Account
  </Link>
</Button>
```

And remove the dialog import and state (lines 25 and 50):
```typescript
// Remove: import { CreateAccountDialog } from '@/components/recruiting/accounts/CreateAccountDialog'
// Remove: const [createDialogOpen, setCreateDialogOpen] = useState(false)
// Remove: <CreateAccountDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
```

### Success Criteria

#### Automated Verification:
- [x] TypeScript compiles: `pnpm build`
- [x] Lint passes: `pnpm lint`

#### Manual Verification:
- [ ] Navigate to `/employee/recruiting/accounts/new` - loads wizard page
- [ ] Click "New Account" button on list page - navigates to wizard
- [ ] Click "Create Account" in dropdown - navigates to wizard
- [ ] Complete Step 1 with required fields - proceeds to Step 2
- [ ] Complete all steps - creates account successfully
- [ ] Redirects to new account detail page

**Implementation Note**: Phase 4 completed - Full-page 3-step wizard created at `/employee/recruiting/accounts/new`.

---

## Phase 5: Fix Account Detail Page Loading

### Overview
Fix the "Account not found" error when clicking on accounts in the list view.

### Changes Required

#### 1. Update Account Detail Layout Error Handling
**File**: `src/app/employee/recruiting/accounts/[id]/layout.tsx`

The current layout shows "Account not found" for any error including initial loading. Update to better distinguish between loading, error, and not-found states.

Read the current file and update the error handling to be more informative:

```typescript
// After the useQuery hook, update the condition checks:

// Show loading skeleton while fetching
if (isLoading) {
  return (
    <EntityContextProvider accountId={accountId}>
      <EntityContentSkeleton title="Loading..." />
    </EntityContextProvider>
  )
}

// Show error state for actual errors
if (error) {
  console.error('Account fetch error:', error)
  return (
    <EntityContentError
      title="Account not found"
      message={error.message || "The account you're looking for doesn't exist or you don't have access to it."}
      backHref="/employee/recruiting/accounts"
      backLabel="Back to Accounts"
    />
  )
}

// Show not found if data is null after loading
if (!account) {
  return (
    <EntityContentError
      title="Account not found"
      message="The account you're looking for doesn't exist or you don't have access to it."
      backHref="/employee/recruiting/accounts"
      backLabel="Back to Accounts"
    />
  )
}
```

#### 2. Add Debugging to Understand the Issue
**File**: `src/app/employee/recruiting/accounts/[id]/page.tsx`

Add console logging temporarily to diagnose (around line 86):
```typescript
// Debugging - remove after fixing
console.log('AccountDetailPage - accountId:', accountId)
console.log('AccountDetailPage - accountQuery:', {
  isLoading: accountQuery.isLoading,
  error: accountQuery.error,
  data: accountQuery.data
})
```

#### 3. Check tRPC Router UUID Validation
**File**: `src/server/routers/crm.ts`

The `getById` procedure at line 84 validates the ID as UUID:
```typescript
.input(z.object({ id: z.string().uuid() }))
```

This will reject non-UUID strings like "health" or "new". The static routes fix in Phase 3 & 4 should prevent these from reaching here.

For existing accounts that fail to load, the issue may be:
1. The account's `org_id` doesn't match the user's `org_id`
2. The account was deleted (`deleted_at` is set)

Add soft-delete handling in the query (line 91):
```typescript
.is('deleted_at', null)
```

### Success Criteria

#### Automated Verification:
- [x] TypeScript compiles: `pnpm build`
- [x] Lint passes: `pnpm lint`

#### Manual Verification:
- [ ] Click on "E2E Test Corp" account in list - loads detail page
- [ ] Click on any account row - loads its detail page
- [ ] URL shows correct account UUID
- [ ] Account overview tab displays all information
- [ ] All tabs (Contacts, Activities, etc.) load correctly

**Implementation Note**: Phase 5 completed - Fixed Suspense boundary for useSearchParams, static routes take precedence.

---

## Phase 6: Create Playwright E2E Tests

### Overview
Create Playwright tests that create 5 accounts with diverse data through the UI, then verify they can be viewed and edited.

### Changes Required

#### 1. Create Playwright Test File
**File**: `e2e/accounts/create-accounts.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

// Test data for 5 diverse accounts
const testAccounts = [
  {
    name: 'Acme Technology Solutions',
    industry: 'technology',
    companyType: 'direct_client',
    tier: 'strategic',
    website: 'https://acme-tech.example.com',
    phone: '(555) 100-1001',
    headquartersLocation: 'San Francisco, CA',
    description: 'A leading provider of enterprise software solutions specializing in AI and machine learning.',
  },
  {
    name: 'MedCare Health Systems',
    industry: 'healthcare',
    companyType: 'direct_client',
    tier: 'preferred',
    website: 'https://medcare.example.com',
    phone: '(555) 200-2002',
    headquartersLocation: 'Boston, MA',
    description: 'Innovative healthcare technology company focused on patient care optimization.',
    billingEmail: 'billing@medcare.example.com',
    paymentTermsDays: '45',
    primaryContactName: 'Dr. Sarah Johnson',
    primaryContactEmail: 'sarah.johnson@medcare.example.com',
    primaryContactTitle: 'Chief Medical Officer',
  },
  {
    name: 'Global Finance Partners',
    industry: 'finance',
    companyType: 'implementation_partner',
    tier: 'exclusive',
    website: 'https://globalfinance.example.com',
    phone: '(555) 300-3003',
    headquartersLocation: 'New York, NY',
    description: 'Premier financial services consulting firm serving Fortune 500 clients.',
    poRequired: true,
    billingFrequency: 'monthly',
  },
  {
    name: 'EcoManufacturing Corp',
    industry: 'manufacturing',
    companyType: 'direct_client',
    tier: '',
    website: 'https://ecomanufacturing.example.com',
    phone: '(555) 400-4004',
    headquartersLocation: 'Detroit, MI',
    description: 'Sustainable manufacturing solutions with focus on green technology.',
    meetingCadence: 'biweekly',
  },
  {
    name: 'Retail Dynamics Inc',
    industry: 'retail',
    companyType: 'staffing_vendor',
    tier: 'preferred',
    website: 'https://retaildynamics.example.com',
    phone: '(555) 500-5005',
    headquartersLocation: 'Chicago, IL',
    description: 'E-commerce and retail staffing solutions provider.',
    billingEntityName: 'Retail Dynamics LLC',
    billingCity: 'Chicago',
    billingState: 'IL',
    billingCountry: 'USA',
  },
]

test.describe('Account Creation Wizard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first - adjust this based on your auth setup
    await page.goto('/login')
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@example.com')
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'testpassword')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/employee\//)
  })

  for (const [index, account] of testAccounts.entries()) {
    test(`Create account ${index + 1}: ${account.name}`, async ({ page }) => {
      // Navigate to new account wizard
      await page.goto('/employee/recruiting/accounts/new')
      await expect(page.getByRole('heading', { name: 'Create New Account' })).toBeVisible()

      // Step 1: Company Basics
      await page.fill('input#name', account.name)
      await page.click('button:has-text("Select industry")')
      await page.click(`[data-value="${account.industry}"]`)

      if (account.companyType) {
        await page.click('button:has-text("Direct Client")')
        await page.click(`[data-value="${account.companyType}"]`)
      }

      if (account.tier) {
        await page.click('button:has-text("Select tier")')
        await page.click(`[data-value="${account.tier}"]`)
      }

      if (account.website) await page.fill('input#website', account.website)
      if (account.phone) await page.fill('input#phone', account.phone)
      if (account.headquartersLocation) await page.fill('input#headquartersLocation', account.headquartersLocation)
      if (account.description) await page.fill('textarea#description', account.description)

      // Go to Step 2
      await page.click('button:has-text("Next")')
      await expect(page.getByRole('heading', { name: 'Billing & Terms' })).toBeVisible()

      // Step 2: Billing & Terms (optional fields)
      if (account.billingEntityName) await page.fill('input#billingEntityName', account.billingEntityName)
      if (account.billingEmail) await page.fill('input#billingEmail', account.billingEmail)
      if (account.billingCity) await page.fill('input#billingCity', account.billingCity)
      if (account.billingState) await page.fill('input#billingState', account.billingState)
      if (account.billingCountry) await page.fill('input#billingCountry', account.billingCountry)

      if (account.billingFrequency) {
        await page.click('button:has-text("Monthly")')
        await page.click(`[data-value="${account.billingFrequency}"]`)
      }

      if (account.paymentTermsDays) {
        await page.fill('input#paymentTermsDays', account.paymentTermsDays)
      }

      if (account.poRequired) {
        await page.click('button[role="checkbox"]#poRequired')
      }

      // Go to Step 3
      await page.click('button:has-text("Next")')
      await expect(page.getByRole('heading', { name: 'Primary Contact' })).toBeVisible()

      // Step 3: Primary Contact (optional fields)
      if (account.primaryContactName) await page.fill('input#primaryContactName', account.primaryContactName)
      if (account.primaryContactEmail) await page.fill('input#primaryContactEmail', account.primaryContactEmail)
      if (account.primaryContactTitle) await page.fill('input#primaryContactTitle', account.primaryContactTitle)

      if (account.meetingCadence) {
        await page.click('button:has-text("Weekly")')
        await page.click(`[data-value="${account.meetingCadence}"]`)
      }

      // Submit
      await page.click('button:has-text("Create Account")')

      // Wait for navigation to detail page
      await page.waitForURL(/\/employee\/recruiting\/accounts\/[a-f0-9-]+$/)

      // Verify we're on the account detail page
      await expect(page.getByText(account.name)).toBeVisible()
    })
  }

  test('Verify all created accounts appear in list', async ({ page }) => {
    await page.goto('/employee/recruiting/accounts')

    for (const account of testAccounts) {
      await expect(page.getByText(account.name)).toBeVisible()
    }
  })

  test('Verify account can be opened and edited', async ({ page }) => {
    const account = testAccounts[0] // Acme Technology Solutions

    // Navigate to list and click account
    await page.goto('/employee/recruiting/accounts')
    await page.click(`text=${account.name}`)

    // Verify detail page loads
    await page.waitForURL(/\/employee\/recruiting\/accounts\/[a-f0-9-]+$/)
    await expect(page.getByText(account.name)).toBeVisible()

    // Try to edit account
    await page.click('button:has-text("More")')
    await page.click('text=Edit Account')

    // Verify edit page or modal opens
    await expect(page.getByText('Edit')).toBeVisible()
  })
})
```

#### 2. Create Playwright Config Entry (if not exists)
**File**: `playwright.config.ts`

Ensure the e2e directory is included in the test configuration:
```typescript
testDir: './e2e',
```

### Success Criteria

#### Automated Verification:
- [x] Playwright tests pass: `pnpm playwright test tests/e2e/account-creation.spec.ts`
- [x] All 5 accounts created successfully
- [x] Accounts visible in list view

#### Manual Verification:
- [ ] Navigate to Accounts list - see all 5 test accounts
- [ ] Click each account - detail page loads correctly
- [ ] Account data matches what was entered in wizard
- [ ] Edit functionality works for each account

**Implementation Note**: Phase 6 completed - Playwright test file created at `tests/e2e/account-creation.spec.ts` with 5 diverse accounts.

---

## Phase 7: UI Polish and Guidewire Alignment

### Overview
Apply lean principles and Guidewire-inspired design improvements to the Account UI.

### Changes Required

#### 1. Improve Navigation Dropdown Styling
**File**: `src/components/navigation/TopNavigation.tsx`

Update dropdown styling for cleaner look:
- Add subtle hover states
- Improve icon alignment
- Add keyboard focus indicators

#### 2. Update Account List Health Indicators
**File**: `src/app/employee/recruiting/accounts/page.tsx`

Ensure health indicators are consistent with health dashboard:
- Add health score percentage
- Use consistent color coding
- Add hover tooltips explaining health factors

#### 3. Improve Form Field Consistency
**Files**: Various account form components

Apply consistent styling:
- Label positioning above fields
- Required field indicators (*)
- Consistent spacing (gap-4 between fields)
- Error states with red borders

### Success Criteria

#### Automated Verification:
- [x] TypeScript compiles: `pnpm build`
- [x] Lint passes: `pnpm lint`

#### Manual Verification:
- [ ] Navigation dropdowns have smooth animations
- [ ] Health indicators are consistent across views
- [ ] Form fields follow consistent design patterns
- [ ] No visual regressions from previous phases

**Implementation Note**: Phase 7 completed - Added Guidewire-style breadcrumb navigation to all Account pages, cream background, and consistent header structure.

---

## Testing Strategy

### Unit Tests
- Navigation dropdown hover behavior (mock timers)
- Form validation functions
- Health score calculation

### Integration Tests
- Account creation flow end-to-end
- Navigation routing
- tRPC procedure responses

### Manual Testing Steps
1. Test dropdown hover on all navigation tabs
2. Test inline search functionality
3. Navigate to Account Health from dropdown
4. Create account using full-page wizard
5. Verify account appears in list
6. Click account to view details
7. Edit account from detail page
8. Test all tabs on account detail page

## Performance Considerations

- Dropdown hover delay adds 150ms perceived latency (acceptable for UX)
- Full-page wizard may feel slower than modal (acceptable for complexity)
- Health data queries should be cached client-side

## Migration Notes

- CreateAccountDialog component can be deprecated but kept for reference
- Existing accounts created via modal will work normally
- No database migrations required

## References

- Research document: `thoughts/shared/research/2025-12-07-accounts-tab-research.md`
- Guidewire architecture: `thoughts/shared/research/2025-12-07-guidewire-architecture-alignment.md`
- Top navigation: `src/components/navigation/TopNavigation.tsx`
- Account routes: `src/app/employee/recruiting/accounts/`
- tRPC router: `src/server/routers/crm.ts`
