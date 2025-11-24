# Migration Guide: www.intimeesolutions.com → Frontend Prototype

## Current State

### Source: `/intime-esolutions` (Next.js 16 + App Router)
- **Marketing Pages**: Home, Industries, Resources, Contact, Academy Info
- **Tech Stack**: Next.js, TypeScript, Supabase, Tailwind CSS
- **Routes**: Server components with App Router structure

### Target: `/frontend-prototype` (Vite + React Router)
- **Internal Portal**: HR, Recruiting, Bench Sales, Academy dashboards
- **Tech Stack**: Vite, React, React Router, Tailwind CSS
- **Routes**: Client-side routing with HashRouter

---

## Migration Steps

### Phase 1: Setup Foundation (30 minutes)

#### 1.1 Install Missing Dependencies

```bash
cd /Users/sumanthrajkumarnagolu/Projects/intime-v3/frontend-prototype

# Add React Markdown for content rendering
npm install react-markdown remark-gfm

# Add date formatting
npm install date-fns

# Add animations (if used)
npm install framer-motion

# Add form handling (if contact form exists)
npm install react-hook-form @hookform/resolvers
```

#### 1.2 Create Marketing Page Structure

```bash
mkdir -p components/marketing
mkdir -p components/marketing/sections
mkdir -p components/marketing/industries
mkdir -p components/marketing/resources
mkdir -p pages/marketing
```

---

### Phase 2: Copy Core Marketing Components (1 hour)

#### 2.1 Copy Reusable UI Components

**From:** `/intime-esolutions/components/`
**To:** `/frontend-prototype/components/marketing/`

Priority components to copy:
- `Hero.tsx` → Marketing hero sections
- `FeatureCard.tsx` → Service/feature displays
- `IndustryCard.tsx` → Industry showcases
- `CTASection.tsx` → Call-to-action blocks
- `Footer.tsx` → Website footer
- `ContactForm.tsx` → Contact page form

**Action:**
```bash
# Example copy command (run from /intime-v3/)
cp intime-esolutions/components/Hero.tsx frontend-prototype/components/marketing/
cp intime-esolutions/components/FeatureCard.tsx frontend-prototype/components/marketing/
# ... copy other components
```

#### 2.2 Adapt Components for React Router

**Convert Next.js patterns to React Router:**

**Before (Next.js):**
```tsx
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Hero() {
  const router = useRouter()
  return (
    <Link href="/contact">Contact Us</Link>
  )
}
```

**After (React Router):**
```tsx
import { Link, useNavigate } from 'react-router-dom'

export function Hero() {
  const navigate = useNavigate()
  return (
    <Link to="/contact">Contact Us</Link>
  )
}
```

---

### Phase 3: Create Marketing Pages (2 hours)

#### 3.1 Home Page

**File:** `frontend-prototype/components/marketing/HomePage.tsx`

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Briefcase, GraduationCap } from 'lucide-react';

export function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-navy via-sapphire to-azure">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transform Your Workforce with InTime
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-sky-100">
              5-Pillar Staffing Solutions: Training, Recruiting, Bench Sales,
              Talent Acquisition & Cross-Border
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-white text-navy px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Get Started <ArrowRight className="inline ml-2" />
              </Link>
              <Link
                to="/academy"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Explore Academy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-navy">
            Our 5-Pillar Approach
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              icon={<GraduationCap size={48} />}
              title="Training Academy"
              description="8-week transformation program turning candidates into consultants"
              link="/academy"
            />
            <ServiceCard
              icon={<Users size={48} />}
              title="Recruiting Services"
              description="48-hour turnaround for client placements"
              link="/services/recruiting"
            />
            <ServiceCard
              icon={<Briefcase size={48} />}
              title="Bench Sales"
              description="30-60 day placement for bench consultants"
              link="/services/bench"
            />
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-navy">
            Industries We Serve
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {industries.map(industry => (
              <Link
                key={industry.slug}
                to={`/industries/${industry.slug}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-lg mb-2">{industry.name}</h3>
                <p className="text-gray-600 text-sm">{industry.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-navy text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Team?</h2>
          <p className="text-xl mb-8">Join 500+ companies who trust InTime for their staffing needs</p>
          <Link
            to="/contact"
            className="bg-white text-navy px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition inline-block"
          >
            Schedule a Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ icon, title, description, link }: any) {
  return (
    <Link to={link} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
      <div className="text-sapphire mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-3 text-navy">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <span className="text-sapphire font-semibold">
        Learn More <ArrowRight className="inline ml-1" size={16} />
      </span>
    </Link>
  );
}

const industries = [
  { slug: 'information-technology', name: 'IT & Software', description: 'Tech talent solutions' },
  { slug: 'healthcare', name: 'Healthcare', description: 'Medical staffing experts' },
  { slug: 'financial-accounting', name: 'Finance', description: 'Financial professionals' },
  { slug: 'manufacturing', name: 'Manufacturing', description: 'Industrial workforce' },
  // Add all 13 industries from your site
];
```

#### 3.2 Industries Pages

**File:** `frontend-prototype/components/marketing/industries/IndustryTemplate.tsx`

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface IndustryData {
  name: string;
  hero: {
    title: string;
    subtitle: string;
    image?: string;
  };
  overview: string;
  challenges: string[];
  solutions: string[];
  stats: Array<{ label: string; value: string }>;
  caseStudy?: {
    title: string;
    description: string;
  };
}

export function IndustryTemplate({ data }: { data: IndustryData }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Back Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Link to="/industries" className="text-sapphire hover:text-navy flex items-center gap-2">
          <ArrowLeft size={20} />
          Back to Industries
        </Link>
      </div>

      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-r from-navy to-sapphire text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-4">{data.hero.title}</h1>
          <p className="text-xl">{data.hero.subtitle}</p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-6 text-navy">Industry Overview</h2>
          <p className="text-lg text-gray-700 leading-relaxed">{data.overview}</p>
        </div>
      </section>

      {/* Challenges & Solutions */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-navy">Key Challenges</h3>
              <ul className="space-y-4">
                {data.challenges.map((challenge, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckCircle className="text-red-500 flex-shrink-0 mt-1" size={20} />
                    <span className="text-gray-700">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6 text-navy">Our Solutions</h3>
              <ul className="space-y-4">
                {data.solutions.map((solution, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                    <span className="text-gray-700">{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {data.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-sapphire mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-navy text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Solve Your {data.name} Staffing Challenges?</h2>
          <Link
            to="/contact"
            className="bg-white text-navy px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
}
```

#### 3.3 Contact Page

**File:** `frontend-prototype/components/marketing/ContactPage.tsx`

```tsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with Supabase or email service
    console.log('Form submitted:', formData);
    alert('Thank you! We will contact you shortly.');
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="py-16 px-4 bg-gradient-to-r from-navy to-sapphire text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-xl">Let's discuss how we can help your business grow</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-navy">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Mail className="text-sapphire" size={24} />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-gray-600">info@intimeesolutions.com</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Phone className="text-sapphire" size={24} />
                  <div>
                    <div className="font-semibold">Phone</div>
                    <div className="text-gray-600">+1 (555) 123-4567</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <MapPin className="text-sapphire" size={24} />
                  <div>
                    <div className="font-semibold">Address</div>
                    <div className="text-gray-600">
                      123 Business St<br />
                      City, State 12345
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-navy">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapphire focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapphire focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Company Name"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapphire focus:border-transparent"
                />
                <select
                  required
                  value={formData.service}
                  onChange={e => setFormData({...formData, service: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapphire focus:border-transparent"
                >
                  <option value="">Select a Service</option>
                  <option value="training">Training Academy</option>
                  <option value="recruiting">Recruiting Services</option>
                  <option value="bench">Bench Sales</option>
                  <option value="ta">Talent Acquisition</option>
                  <option value="immigration">Cross-Border Solutions</option>
                </select>
                <textarea
                  placeholder="Your Message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapphire focus:border-transparent"
                />
                <button
                  type="submit"
                  className="w-full bg-navy text-white py-4 rounded-lg font-semibold hover:bg-sapphire transition"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

### Phase 4: Update App.tsx Routing (30 minutes)

**File:** `frontend-prototype/App.tsx`

Add marketing routes BEFORE the login/protected routes:

```tsx
// Add to imports
import { HomePage } from './components/marketing/HomePage';
import { ContactPage } from './components/marketing/ContactPage';
import { IndustryTemplate } from './components/marketing/industries/IndustryTemplate';
// ... import industry data

// In the Routes section, ADD THESE FIRST:
<Routes>
  {/* ===== PUBLIC MARKETING ROUTES (NEW) ===== */}
  <Route path="/" element={<HomePage />} />
  <Route path="/contact" element={<ContactPage />} />
  <Route path="/industries" element={<IndustriesListPage />} />
  <Route path="/industries/:slug" element={<IndustryPage />} />
  <Route path="/resources" element={<ResourcesPage />} />
  <Route path="/services/:service" element={<ServicePage />} />

  {/* ===== EXISTING ROUTES (keep as is) ===== */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/academy" element={<AppLayout showMentor={true} />}>
    {/* ... existing academy routes */}
  </Route>
  {/* ... rest of existing routes */}
</Routes>
```

---

### Phase 5: Update Navbar (30 minutes)

**File:** `frontend-prototype/components/Navbar.tsx`

Add public marketing links when user is NOT logged in:

```tsx
// In Navbar component, add conditional rendering:
const { user } = useAppStore();

return (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-navy">
          InTime
        </Link>

        {/* Public Marketing Nav (when not logged in) */}
        {!user && (
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-navy">Home</Link>
            <Link to="/industries" className="text-gray-700 hover:text-navy">Industries</Link>
            <Link to="/academy" className="text-gray-700 hover:text-navy">Academy</Link>
            <Link to="/resources" className="text-gray-700 hover:text-navy">Resources</Link>
            <Link to="/contact" className="text-gray-700 hover:text-navy">Contact</Link>
            <Link
              to="/login"
              className="bg-navy text-white px-6 py-2 rounded-lg hover:bg-sapphire transition"
            >
              Login
            </Link>
          </div>
        )}

        {/* Internal Portal Nav (when logged in) */}
        {user && (
          <div className="hidden md:flex items-center gap-6">
            {/* Existing internal navigation */}
          </div>
        )}
      </div>
    </div>
  </nav>
);
```

---

### Phase 6: Content Migration (2-3 hours)

#### 6.1 Extract Industry Data

**From:** `/intime-esolutions/app/(marketing)/industries/[slug]/page.tsx`
**To:** `/frontend-prototype/data/industries.ts`

```tsx
export const industries = {
  'information-technology': {
    name: 'Information Technology',
    hero: {
      title: 'IT & Software Staffing Solutions',
      subtitle: 'Connect with top tech talent'
    },
    overview: 'Copy from existing IT page...',
    challenges: [
      'Rapid technology evolution',
      'Skills gap in emerging technologies',
      // ... copy from existing page
    ],
    solutions: [
      'Specialized tech recruitment',
      'Continuous training programs',
      // ... copy from existing page
    ],
    stats: [
      { label: 'IT Placements', value: '500+' },
      { label: 'Average Fill Time', value: '48hrs' },
      { label: 'Client Satisfaction', value: '98%' }
    ]
  },
  // Repeat for all 13 industries
};
```

#### 6.2 Copy Static Assets

```bash
# Copy images, logos, icons
cp -r /Users/sumanthrajkumarnagolu/Projects/intime-esolutions/public/* \
      /Users/sumanthrajkumarnagolu/Projects/intime-v3/frontend-prototype/public/
```

---

### Phase 7: Testing & Polish (1 hour)

1. **Test all marketing routes:**
   ```bash
   cd /Users/sumanthrajkumarnagolu/Projects/intime-v3/frontend-prototype
   npm run dev
   ```

2. **Check navigation:**
   - [ ] Home page loads
   - [ ] All industry pages work
   - [ ] Contact form submits
   - [ ] Navigation between marketing and internal portal

3. **Responsive design:**
   - [ ] Test on mobile (DevTools)
   - [ ] Test on tablet
   - [ ] Test on desktop

4. **Fix any broken links/images**

---

## Final File Structure

```
frontend-prototype/
├── components/
│   ├── marketing/           # NEW
│   │   ├── HomePage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── industries/
│   │   │   ├── IndustryTemplate.tsx
│   │   │   └── IndustriesListPage.tsx
│   │   ├── resources/
│   │   │   └── ResourcesPage.tsx
│   │   └── shared/
│   │       ├── Hero.tsx
│   │       ├── FeatureCard.tsx
│   │       └── CTASection.tsx
│   │
│   ├── hr/                  # EXISTING
│   ├── recruiting/          # EXISTING
│   ├── Dashboard.tsx        # EXISTING
│   └── Navbar.tsx          # UPDATED
│
├── data/
│   └── industries.ts        # NEW - Industry content
│
├── App.tsx                  # UPDATED - Add routes
└── package.json            # UPDATED - Add deps
```

---

## Time Estimate

- **Phase 1**: 30 min (setup)
- **Phase 2**: 1 hour (copy components)
- **Phase 3**: 2 hours (create pages)
- **Phase 4**: 30 min (routing)
- **Phase 5**: 30 min (navbar)
- **Phase 6**: 2-3 hours (content)
- **Phase 7**: 1 hour (testing)

**Total: 7-8 hours**

---

## BETTER ALTERNATIVE: Migrate to Main InTime v3

Instead of this complex migration, I strongly recommend:

1. **Keep frontend-prototype** as your design reference
2. **Migrate marketing pages** from `intime-esolutions` directly into `intime-v3/src/app`
3. **Build internal portal UI** in `intime-v3` based on frontend-prototype designs
4. **Use one codebase** with full backend integration

This gives you:
- ✅ Marketing website (public pages)
- ✅ Internal portal (authenticated pages)
- ✅ Supabase database integration
- ✅ Real authentication
- ✅ Production-ready deployment

Would you like me to create a plan for this better approach instead?
