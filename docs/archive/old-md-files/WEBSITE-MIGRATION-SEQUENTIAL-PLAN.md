# Website Migration - Sequential Execution Plan
**Detailed Page-by-Page Migration Strategy**

**Project:** InTime E-Solutions → Academy Design System
**Execution Mode:** Sequential, one page at a time
**Quality Gate:** Each page must be 100% complete before moving to next

---

## 🎯 Execution Principles

1. **One page at a time** - Complete fully before moving on
2. **Content preservation** - Never lose information
3. **Design system compliance** - 100% adherence
4. **Test immediately** - Verify after each page
5. **Git commit** - Save progress continuously

---

## PHASE 1: FOUNDATION SETUP

### Task 1.1: Design System Setup
**Time: 2 hours**

```bash
# In intime-esolutions repo:
cd /Users/sumanthrajkumarnagolu/Projects/intime-esolutions

# 1. Copy design system documentation
cp /Users/sumanthrajkumarnagolu/Projects/intime-v3/docs/design/INTIME-DESIGN-SYSTEM-V3.md ./docs/design/

# 2. Copy tailwind configuration
cp /Users/sumanthrajkumarnagolu/Projects/intime-v3/tailwind.config.ts ./

# 3. Update globals.css with bg-noise
# Add the bg-noise class from v3

# 4. Copy component library
mkdir -p components/shared
cp -r /Users/sumanthrajkumarnagolu/Projects/intime-v3/src/components/academy/* ./components/shared/

# 5. Copy utility functions
cp /Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/utils/cn.ts ./lib/utils/
cp /Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/store/academy-store.ts ./lib/store/
```

**Verification:**
- [ ] Design system doc readable
- [ ] Tailwind colors showing correctly
- [ ] bg-noise class working
- [ ] Build succeeds

---

## PHASE 2: HOMEPAGE MIGRATION

### Task 2.1: Homepage Header/Hero
**Current:** Blue gradient hero with animation
**Target:** Ivory background, serif italic title, rust accents

**File:** `app/(marketing)/page.tsx`

#### Steps:
1. **Backup current content**
   - Copy all text to migration notes
   - Save all image references
   - Document all CTAs and links

2. **Replace Hero Section**
```tsx
// OLD (lines 30-60)
<section className="relative bg-gradient-to-br from-trust-blue...">

// NEW
<section className="relative overflow-hidden pt-16 pb-20 lg:pt-32 lg:pb-28 bg-ivory">
  <div className="relative container mx-auto px-4 text-center">
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rust/10 text-rust text-xs font-bold uppercase tracking-widest mb-8 border border-rust/20">
      <span className="w-2 h-2 rounded-full bg-rust animate-pulse"></span>
      Transforming Careers Since 2020
    </div>

    <h1 className="text-6xl md:text-7xl font-serif font-bold text-charcoal mb-8 leading-tight">
      Transform Your Career.<br/>
      Power Your Business.<br/>
      <span className="italic text-rust">Do It InTime.</span>
    </h1>

    <p className="max-w-2xl mx-auto text-xl text-stone-500 mb-12 leading-relaxed font-light">
      [PRESERVE ORIGINAL DESCRIPTION]
    </p>

    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <button className="px-12 py-5 bg-charcoal text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-xl hover:shadow-rust/30 flex items-center gap-2">
        Get Started
        <ChevronRight size={16} />
      </button>
      <button className="px-10 py-5 bg-white text-charcoal border border-stone-200 rounded-full text-sm font-bold uppercase tracking-widest hover:border-rust hover:text-rust transition-all">
        Learn More
      </button>
    </div>
  </div>
</section>
```

3. **Test:**
   - [ ] Title displays correctly
   - [ ] Buttons work
   - [ ] Responsive on mobile
   - [ ] No content lost

### Task 2.2: Homepage Stats Section
**Current:** CountUp stats with blue background
**Target:** Dark card with rust accents

#### Steps:
1. **Replace Stats Section**
```tsx
// NEW
<div className="bg-charcoal py-16 overflow-hidden relative">
  <div className="absolute inset-0 bg-noise opacity-10"></div>
  <div className="container mx-auto px-4 relative z-10">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {[
        { value: "500+", label: "Candidates Placed", icon: Users },
        { value: "50+", label: "Enterprise Clients", icon: Briefcase },
        { value: "95%", label: "Success Rate", icon: TrendingUp },
        { value: "20+", label: "Countries", icon: Globe }
      ].map((stat, i) => (
        <div key={i} className="text-ivory">
          <stat.icon className="w-8 h-8 mx-auto mb-4 text-rust" />
          <div className="text-5xl font-serif font-bold text-forest mb-2">
            {statsInView && <CountUp end={parseInt(stat.value)} />}
          </div>
          <div className="text-sm uppercase tracking-widest text-stone-400">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

2. **Test:**
   - [ ] Stats animate correctly
   - [ ] Dark background shows
   - [ ] Icons display

### Task 2.3: Homepage Services Grid
**Current:** Card grid with various colors
**Target:** White cards with 2.5rem rounded corners, bg-noise

#### Steps:
1. **Replace Services Section**
```tsx
<div className="py-24 bg-ivory">
  <div className="container mx-auto px-4">
    <div className="text-center mb-12">
      <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-4 italic">
        What We Do
      </h2>
      <p className="text-xl text-stone-500 max-w-2xl mx-auto">
        [PRESERVE ORIGINAL DESCRIPTION]
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {services.map((service, i) => (
        <div key={i} className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-stone-200/50 border border-stone-100 bg-noise hover:border-rust/30 transition-all group">
          <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-charcoal mb-6 group-hover:bg-rust group-hover:text-white transition-colors">
            <service.icon size={28} />
          </div>
          <h3 className="text-xl font-serif font-bold text-charcoal mb-4">
            {service.title}
          </h3>
          <p className="text-stone-500 leading-relaxed mb-6">
            {service.description}
          </p>
          <Link
            href={service.link}
            className="text-rust font-bold uppercase text-xs tracking-widest hover:text-charcoal transition-colors inline-flex items-center gap-2"
          >
            Learn More
            <ArrowRight size={14} />
          </Link>
        </div>
      ))}
    </div>
  </div>
</div>
```

2. **Test:**
   - [ ] Cards render correctly
   - [ ] Hover states work
   - [ ] Links navigate properly

### Task 2.4: Homepage CTA Section
**Current:** Blue background CTA
**Target:** Charcoal card with rust button

#### Steps:
1. **Replace CTA**
```tsx
<div className="py-24 bg-ivory">
  <div className="container mx-auto px-4">
    <div className="bg-charcoal text-ivory rounded-[2.5rem] p-12 md:p-16 shadow-2xl relative overflow-hidden bg-noise max-w-4xl mx-auto text-center">
      <div className="absolute top-0 right-0 w-64 h-64 bg-rust/20 rounded-full blur-3xl -mr-10 -mt-10"></div>

      <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 relative z-10 italic">
        Ready to Transform Your Future?
      </h2>
      <p className="text-xl text-stone-300 mb-8 relative z-10 max-w-2xl mx-auto">
        [PRESERVE ORIGINAL TEXT]
      </p>
      <button className="px-12 py-5 bg-rust text-white rounded-full font-bold uppercase tracking-widest hover:bg-[#B8421E] transition-all shadow-xl relative z-10">
        Get Started Today
      </button>
    </div>
  </div>
</div>
```

### Task 2.5: Homepage Footer
**Current:** Standard footer
**Target:** Consistent with new design

**Verification Checklist for Homepage:**
- [ ] All sections migrated
- [ ] All content preserved
- [ ] All links work
- [ ] Mobile responsive
- [ ] Images optimized
- [ ] No console errors
- [ ] Performance good
- [ ] Commit to git

---

## PHASE 3: INDUSTRIES PAGES (15 pages)

### Task 3.1: Industries Landing Page
**File:** `app/(marketing)/industries/page.tsx`

#### Steps:
1. **Hero Section**
   - Title: "Industries We Serve" (font-serif italic)
   - Subtitle: Preserve original description
   - Background: bg-ivory

2. **Industry Grid**
   - 15 industry cards
   - Each card: rounded-[2.5rem], bg-noise, hover effect
   - Icons: Keep existing, style consistently
   - Links: To individual industry pages

3. **Content Structure:**
```tsx
<div className="min-h-screen bg-ivory">
  {/* Hero */}
  <section className="pt-32 pb-16 text-center">
    <h1 className="text-6xl font-serif font-bold italic text-charcoal mb-6">
      Industries We Serve
    </h1>
    <p className="text-xl text-stone-500 max-w-3xl mx-auto">
      [ORIGINAL DESCRIPTION]
    </p>
  </section>

  {/* Grid */}
  <section className="pb-24">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {industries.map(industry => (
          <Link
            href={`/industries/${industry.slug}`}
            className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-stone-200/50 border border-stone-100 bg-noise hover:-translate-y-1 hover:border-rust/30 transition-all group"
          >
            <industry.icon className="w-10 h-10 text-charcoal mb-4 group-hover:text-rust transition-colors" />
            <h3 className="font-serif font-bold text-lg text-charcoal">
              {industry.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  </section>
</div>
```

**Verification:**
- [ ] All 15 industries listed
- [ ] All links work
- [ ] Cards styled correctly
- [ ] Mobile responsive

### Task 3.2-3.16: Individual Industry Pages

**Template for Each Industry Page:**
(Healthcare, IT, Financial, Legal, Manufacturing, Retail, etc.)

#### Standard Structure:
1. **Hero with industry name**
2. **Overview section**
3. **Services we provide**
4. **Success stories/case studies**
5. **Key statistics**
6. **CTA section**

#### Example: Healthcare Industry Page
**File:** `app/(marketing)/industries/healthcare/page.tsx`

```tsx
export default function HealthcarePage() {
  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-charcoal to-stone-800 text-ivory relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rust/20 text-rust border border-rust/30 text-xs font-bold uppercase tracking-widest mb-6">
            Industry Focus
          </div>
          <h1 className="text-6xl font-serif font-bold italic mb-6">
            Healthcare Staffing Solutions
          </h1>
          <p className="text-xl text-stone-300 max-w-3xl mx-auto">
            [PRESERVE ORIGINAL DESCRIPTION]
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold italic text-charcoal text-center mb-12">
            Our Healthcare Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map(service => (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/50 border border-stone-100 bg-noise">
                {/* Service content */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-charcoal text-ivory relative">
        <div className="absolute inset-0 bg-noise opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(stat => (
              <div>
                <div className="text-5xl font-serif font-bold text-forest mb-2">
                  {stat.value}
                </div>
                <div className="text-sm uppercase tracking-widest text-stone-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        {/* CTA Card */}
      </section>
    </div>
  );
}
```

**Repeat for all 15 industries:**
1. [ ] Healthcare
2. [ ] Information Technology
3. [ ] Financial & Accounting
4. [ ] Legal
5. [ ] Manufacturing
6. [ ] Retail
7. [ ] Hospitality
8. [ ] Logistics
9. [ ] Government/Public Sector
10. [ ] Human Resources
11. [ ] Engineering
12. [ ] Automobile
13. [ ] AI/ML/Data
14. [ ] Telecom/Technology
15. [ ] Warehouse/Distribution

---

## PHASE 4: CONSULTING & SERVICES PAGES (9 pages)

### Task 4.1: Consulting Landing
**File:** `app/(marketing)/consulting/page.tsx`

Similar structure to industries landing:
- Hero with "Consulting Services"
- Service cards grid (8 services)
- Process timeline
- CTA

### Task 4.2-4.9: Individual Service Pages
1. [ ] Consulting
2. [ ] Custom Software Development
3. [ ] HR Outsourcing
4. [ ] Quality Assurance
5. [ ] RPO
6. [ ] Staff Augmentation
7. [ ] System Integration
8. [ ] Competencies

---

## PHASE 5: SOLUTIONS PAGES (4 pages)

### Task 5.1: Solutions Landing
### Task 5.2: Cross-Border Solutions
### Task 5.3: IT Staffing Solutions
### Task 5.4: Training Solutions

---

## PHASE 6: CAREERS PAGES (7 pages)

### Task 6.1: Careers Landing
### Task 6.2: Open Positions
### Task 6.3: Join Our Team
### Task 6.4: Available Talent
### Task 6.5: Job Details [id]
### Task 6.6: Talent Profile [id]

---

## PHASE 7: COMPANY PAGES

### Task 7.1: About Page
### Task 7.2: Contact Page

---

## PHASE 8: RESOURCES & BLOG

### Task 8.1: Resources Landing
### Task 8.2: Individual Article [slug]

---

## PHASE 9: ACADEMY INTEGRATION

### Task 9.1: Complete Academy Replacement
**Goal:** Replace old academy with new v3 implementation

#### Steps:
1. **Backup old academy**
```bash
cd /Users/sumanthrajkumarnagolu/Projects/intime-esolutions
mv app/(academy) app/(academy).backup
```

2. **Copy new academy**
```bash
cp -r /Users/sumanthrajkumarnagolu/Projects/intime-v3/src/app/students app/(academy)/academy
```

3. **Update routes:**
   - Old: `/academy/*`
   - New: Keep `/academy/*` but use new components

4. **Integration points:**
   - [ ] Link from homepage
   - [ ] Link from navbar
   - [ ] Link from careers page
   - [ ] Academy info page updated

5. **Database connection:**
   - [ ] Connect to Supabase
   - [ ] Test all CRUD operations
   - [ ] Verify authentication

**Verification:**
- [ ] All academy pages work
- [ ] Navigation consistent
- [ ] Data persists
- [ ] AI mentor works
- [ ] Progress tracking works

---

## PHASE 10: AUTH SYSTEM (12 pages)

### Task 10.1: Login Selector
### Task 10.2: Student Login
### Task 10.3: Candidate Login
### Task 10.4: Client Login
### Task 10.5: Signup Selector
### Task 10.6: Student Signup
### Task 10.7: Candidate Signup
### Task 10.8: Client Signup
### Task 10.9: Email Verification
### Task 10.10: Profile Setup
### Task 10.11: Profile Check
### Task 10.12: Student Profile Setup

---

## PHASE 11: PLATFORM & DASHBOARDS (8 pages)

### Task 11.1: Unified Dashboard
### Task 11.2: CEO Dashboard
### Task 11.3: HR Timesheets
### Task 11.4: Enterprise Members
### Task 11.5: Gamification
### Task 11.6: Sourcing
### Task 11.7: Workflows
### Task 11.8: Pods [id]

---

## PHASE 12: COMPANIONS/TOOLS (5 pages)

### Task 12.1: Guidewire Guru Landing
### Task 12.2: Interview Bot
### Task 12.3: Debugging Studio
### Task 12.4: Project Generator
### Task 12.5: Resume Builder

---

## PHASE 13: TESTING & DEPLOYMENT

### Task 13.1: Comprehensive Testing
- [ ] All pages load
- [ ] All links work
- [ ] All forms submit
- [ ] All images load
- [ ] Mobile responsive
- [ ] Cross-browser
- [ ] Performance testing
- [ ] SEO audit

### Task 13.2: Content Audit
- [ ] All text preserved
- [ ] All data accurate
- [ ] All CTAs clear
- [ ] All metadata present

### Task 13.3: Deployment
- [ ] Build succeeds
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production
- [ ] Monitor errors

---

## 📊 Progress Tracking

Use this checklist to track overall progress:

**Phase 1: Foundation** ⬜ 0/1
**Phase 2: Homepage** ⬜ 0/5
**Phase 3: Industries** ⬜ 0/16
**Phase 4: Consulting** ⬜ 0/9
**Phase 5: Solutions** ⬜ 0/4
**Phase 6: Careers** ⬜ 0/7
**Phase 7: Company** ⬜ 0/2
**Phase 8: Resources** ⬜ 0/2
**Phase 9: Academy** ⬜ 0/1
**Phase 10: Auth** ⬜ 0/12
**Phase 11: Platform** ⬜ 0/8
**Phase 12: Companions** ⬜ 0/5
**Phase 13: Testing** ⬜ 0/3

**Total Progress:** 0/75 tasks complete

---

## 🚀 How to Execute

1. **Start with Phase 1**
2. **Complete each task fully** before moving to next
3. **Test immediately** after each task
4. **Commit to git** after each successful task
5. **Update progress** in this document
6. **Review and approve** before moving to next phase

---

**Ready to begin? Start with Phase 1: Foundation Setup.**
