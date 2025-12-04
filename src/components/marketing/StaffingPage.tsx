'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  Clock,
  Target,
  ArrowRight,
  CheckCircle2,
  Award,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  Building2,
  Zap,
  Search,
  FileCheck,
  UserCheck,
  Handshake,
  Layers
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/marketing/templates';

// Intersection observer hook for scroll animations
const useInView = (threshold = 0.2) => {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return { ref: setRef, inView };
};

// Animated counter hook
const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return { count, start: () => setHasStarted(true) };
};

const STAFFING_TYPES = [
  {
    id: 'contract',
    icon: Clock,
    title: 'Contract Staffing',
    accent: 'forest',
    description: 'Flexible talent solutions for project-based needs. Scale your team up or down with pre-vetted professionals on demand.',
    features: [
      'Rapid deployment within 48 hours',
      'Pre-screened and verified candidates',
      'Flexible contract terms',
      'Full compliance management'
    ],
    ideal: 'Project-based needs, seasonal demand, specialized skills'
  },
  {
    id: 'contract-to-hire',
    icon: Target,
    title: 'Contract-to-Hire',
    accent: 'emerald',
    description: 'Evaluate talent before committing. Start with a contract and convert to full-time when you find the perfect fit.',
    features: [
      'Risk-free evaluation period',
      'Seamless conversion process',
      'No surprise fees',
      'Culture fit assessment'
    ],
    ideal: 'Building core teams, critical hires, uncertain timelines'
  },
  {
    id: 'direct-placement',
    icon: Award,
    title: 'Direct Placement',
    accent: 'gold',
    description: 'Full-time hiring done right. We find, vet, and deliver permanent employees who drive long-term value.',
    features: [
      'Comprehensive candidate search',
      '90-day placement guarantee',
      'Background verification included',
      'Salary negotiation support'
    ],
    ideal: 'Leadership roles, permanent positions, critical functions'
  }
];

const INDUSTRIES = [
  { name: 'Information Technology', slug: 'information-technology' },
  { name: 'Healthcare', slug: 'healthcare' },
  { name: 'Financial Services', slug: 'financial-accounting' },
  { name: 'Manufacturing', slug: 'manufacturing' },
  { name: 'Engineering', slug: 'engineering' },
  { name: 'AI/ML & Data', slug: 'ai-ml-data' },
  { name: 'Telecom', slug: 'telecom' },
  { name: 'Government', slug: 'government' }
];

const PROCESS = [
  {
    step: '01',
    icon: Search,
    title: 'Requirements Analysis',
    description: 'We dive deep into your technical requirements, team dynamics, and timeline constraints.'
  },
  {
    step: '02',
    icon: Users,
    title: 'Talent Sourcing',
    description: 'AI-powered search + expert recruiters identify candidates from our 50,000+ verified talent pool.'
  },
  {
    step: '03',
    icon: ShieldCheck,
    title: 'Rigorous Screening',
    description: '7-step vetting including technical assessment, background check, and reference verification.'
  },
  {
    step: '04',
    icon: FileCheck,
    title: 'Candidate Presentation',
    description: 'Qualified candidates presented with detailed profiles, portfolios, and interview recommendations.'
  },
  {
    step: '05',
    icon: UserCheck,
    title: 'Interview Coordination',
    description: 'We manage scheduling, prep candidates, and gather feedback to streamline decision-making.'
  },
  {
    step: '06',
    icon: Handshake,
    title: 'Placement & Support',
    description: 'Seamless onboarding, ongoing check-ins, and guarantee period support for lasting success.'
  }
];

export const StaffingPage: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const stats = {
    fillRate: useCounter(98, 2000),
    placements: useCounter(1200, 2200),
    hours: useCounter(48, 1500),
    clients: useCounter(150, 1800)
  };

  const statsSection = useInView();

  useEffect(() => {
    if (statsSection.inView) {
      stats.fillRate.start();
      stats.placements.start();
      stats.hours.start();
      stats.clients.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsSection.inView]);

  // Scroll-based page flip effect
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      
      const heroHeight = heroRef.current.offsetHeight;
      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / (heroHeight * 0.5), 1);
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to content
  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNavbar />

      {/* ============================================
          HERO SECTION - Full Screen with Scroll Flip
          ============================================ */}
      <section 
        ref={heroRef}
        className="relative h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden"
        style={{
          transform: `perspective(1000px) rotateX(${scrollProgress * -8}deg)`,
          transformOrigin: 'center top',
          opacity: 1 - (scrollProgress * 0.3),
        }}
      >
        {/* Sophisticated Background - Forest Green Emphasis */}
        <div className="absolute inset-0">
          {/* Base gradient - deep, rich forest tones */}
          <div className="absolute inset-0 bg-[#0B1A14]" />
          
          {/* Organic gradient shapes - Forest green dominant */}
          <div 
            className="absolute top-0 right-0 w-[70%] h-[80%] rounded-bl-[40%]"
            style={{
              background: 'radial-gradient(ellipse at 70% 30%, rgba(13, 76, 59, 0.5) 0%, transparent 60%)',
            }}
          />
          <div 
            className="absolute bottom-0 left-0 w-[60%] h-[70%] rounded-tr-[50%]"
            style={{
              background: 'radial-gradient(ellipse at 20% 80%, rgba(13, 76, 59, 0.25) 0%, transparent 50%)',
            }}
          />
          <div 
            className="absolute top-[40%] left-[30%] w-[40%] h-[50%] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(201, 169, 97, 0.06) 0%, transparent 50%)',
            }}
          />
          
          {/* Subtle geometric accent */}
          <div 
            className="absolute top-[20%] right-[10%] w-[300px] h-[300px] border border-forest-500/15 rounded-full"
            style={{ transform: 'rotate(-15deg)' }}
          />
          <div 
            className="absolute bottom-[15%] left-[5%] w-[200px] h-[200px] border border-forest-400/10 rounded-full"
          />
          
          {/* Film grain texture for authenticity */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 lg:px-12">
          <div className="max-w-5xl">
            
            {/* Trust indicator - subtle, authentic */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#0B1A14] bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center"
                    style={{ zIndex: 4 - i }}
                  >
                    <span className="text-[10px] font-bold text-white">
                      {['MC', 'TL', 'SR', 'AK'][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-charcoal-400 text-sm tracking-wide">
                Trusted by <span className="text-forest-400 font-semibold">150+</span> enterprise clients
              </span>
            </div>

            {/* Main Headline - Distinctive typography */}
            <h1 className="mb-8">
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black text-white leading-[0.95] tracking-tight">
                Elite Tech Talent
              </span>
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black leading-[0.95] tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-300 via-forest-400 to-forest-500">
                  On Demand
                </span>
              </span>
            </h1>

            {/* Subheadline - Refined, purposeful */}
            <p className="text-lg md:text-xl text-charcoal-300/90 font-light max-w-2xl mb-12 leading-relaxed">
              Access pre-vetted technology professionals within 48 hours. 
              Contract, contract-to-hire, or direct placement—we deliver candidates who perform from day one.
            </p>

            {/* CTA Section - Angled clip-path, NOT rounded-full */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-16">
              <Link
                href="/contact"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-forest-500 hover:bg-forest-400 text-white font-bold text-sm uppercase tracking-wider transition-all duration-300"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
              >
                <Users size={18} />
                Find Talent Now
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/careers/available-talent"
                className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 hover:border-forest-500/40 text-white hover:text-forest-400 font-medium text-sm uppercase tracking-wider transition-all duration-300"
              >
                <Briefcase size={18} />
                View Available Talent
              </Link>
            </div>

            {/* Key differentiators - quick scan */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-charcoal-400">
              {[
                '48-Hour Time to Present',
                '98% Fill Rate',
                '90-Day Guarantee'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-forest-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-charcoal-500 hover:text-forest-400 transition-colors cursor-pointer group"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Explore</span>
          <div className="w-6 h-10 rounded-full border border-current flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-current rounded-full animate-bounce" />
          </div>
        </button>
      </section>

      {/* ============================================
          CONTENT WRAPPER - Starts after hero flip
          ============================================ */}
      <div 
        ref={contentRef}
        className="relative"
        style={{
          transform: `translateY(${Math.max(0, (1 - scrollProgress) * -50)}px)`,
          opacity: 0.3 + (scrollProgress * 0.7),
        }}
      >
        
        {/* ============================================
            STATS BAR - Social Proof
            ============================================ */}
        <section 
          ref={statsSection.ref}
          className="py-12 bg-charcoal-900 border-y border-white/5"
        >
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                { value: stats.hours.count, suffix: 'hr', label: 'Time to Present', icon: Clock },
                { value: stats.fillRate.count, suffix: '%', label: 'Fill Rate', icon: TrendingUp },
                { value: stats.placements.count, suffix: '+', label: 'Placements', icon: Users },
                { value: stats.clients.count, suffix: '+', label: 'Enterprise Clients', icon: Building2 }
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="text-center group"
                >
                  <stat.icon size={20} className="text-forest-400 mx-auto mb-2 opacity-60" />
                  <div className="text-2xl md:text-3xl font-heading font-black text-white mb-1">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-xs text-charcoal-500 uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            STAFFING TYPES - Service Cards
            ============================================ */}
        <section className="py-24 lg:py-32 bg-ivory relative overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(13,76,59,0.04)_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(13,76,59,0.03)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Engagement Models
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6 leading-tight">
                Staffing Solutions for{' '}
                <span className="text-forest-600">Every Need</span>
              </h2>
              <p className="text-lg text-charcoal-500 leading-relaxed">
                Choose the engagement model that fits your timeline, budget, and business objectives.
              </p>
            </div>

            {/* Staffing Cards - Asymmetric with left accent bars */}
            <div className="space-y-6 max-w-5xl">
              {STAFFING_TYPES.map((type, i) => {
                const Icon = type.icon;
                const accentColors = {
                  forest: { bar: 'bg-forest-500', icon: 'bg-forest-50 text-forest-600', link: 'text-forest-600' },
                  emerald: { bar: 'bg-emerald-500', icon: 'bg-emerald-50 text-emerald-600', link: 'text-emerald-600' },
                  gold: { bar: 'bg-gold-500', icon: 'bg-gold-50 text-gold-600', link: 'text-gold-600' }
                };
                const accent = accentColors[type.accent as keyof typeof accentColors];

                return (
                  <div
                    key={i}
                    id={type.id}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500 scroll-mt-32"
                  >
                    {/* Left accent bar */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${accent.bar}`} />
                    
                    <div className="p-8 lg:p-10">
                      <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                          <div className="flex items-center gap-4 mb-6">
                            <div className={`w-14 h-14 rounded-xl ${accent.icon.split(' ')[0]} flex items-center justify-center`}>
                              <Icon size={24} className={accent.icon.split(' ')[1]} />
                            </div>
                            <h3 className="text-2xl font-heading font-bold text-charcoal-900 group-hover:text-forest-700 transition-colors">
                              {type.title}
                            </h3>
                          </div>

                          <p className="text-charcoal-600 mb-6 leading-relaxed">
                            {type.description}
                          </p>

                          <ul className="grid sm:grid-cols-2 gap-3">
                            {type.features.map((feature, j) => (
                              <li key={j} className="flex items-center gap-2 text-sm text-charcoal-600">
                                <CheckCircle2 size={16} className="text-forest-500 shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-charcoal-50 rounded-xl p-6">
                          <div className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mb-3">
                            Ideal For
                          </div>
                          <p className="text-sm text-charcoal-600 mb-6">{type.ideal}</p>
                          <Link
                            href="/contact"
                            className={`inline-flex items-center gap-2 ${accent.link} font-bold text-sm uppercase tracking-wider group-hover:gap-3 transition-all`}
                          >
                            Get Started <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================
            PROCESS SECTION - Timeline
            ============================================ */}
        <section className="py-24 lg:py-32 bg-charcoal-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-forest-900/30 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-forest-800/20 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em]">
                  Our Process
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6 leading-tight">
                A Systematic Approach to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-300 to-forest-400">
                  Perfect Matches
                </span>
              </h2>
              <p className="text-lg text-charcoal-300 leading-relaxed">
                Refined over 1,200+ successful placements. Every step designed to minimize your risk and maximize candidate quality.
              </p>
            </div>

            {/* Process Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
              {PROCESS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={i} 
                    className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-forest-500/30 transition-all duration-500"
                  >
                    {/* Top accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-forest-500 via-forest-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-xl bg-forest-500/10 flex items-center justify-center">
                          <Icon size={22} className="text-forest-400" />
                        </div>
                        <span className="text-3xl font-heading font-black text-white/10 group-hover:text-forest-500/20 transition-colors">
                          {item.step}
                        </span>
                      </div>
                      <h3 className="text-lg font-heading font-bold text-white mb-3 group-hover:text-forest-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-charcoal-400 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================
            INDUSTRIES - Tag Cloud
            ============================================ */}
        <section className="py-20 bg-white relative overflow-hidden">
          {/* Subtle organic background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-forest-50/50 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-gold-50/30 rounded-full blur-[80px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header - Centered */}
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Industries
                </span>
                <div className="w-12 h-px bg-gold-500" />
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-charcoal-900 mb-4">
                Deep Expertise Across{' '}
                <span className="text-forest-600">High-Demand Sectors</span>
              </h2>
              <p className="text-charcoal-500">
                We understand the unique talent requirements of each industry.
              </p>
            </div>

            {/* Industry Tags - NOT rounded-full, using subtle angles */}
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {INDUSTRIES.map((industry, i) => (
                <Link
                  key={i}
                  href={`/industries/${industry.slug}`}
                  className="group relative px-6 py-3 bg-charcoal-50 text-charcoal-700 hover:bg-forest-50 hover:text-forest-700 transition-all duration-300 text-sm font-medium overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)' }}
                >
                  <span className="relative z-10">{industry.name}</span>
                  <div className="absolute inset-0 bg-forest-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>

            {/* View All Link */}
            <div className="text-center mt-8">
              <Link
                href="/industries"
                className="inline-flex items-center gap-2 text-forest-600 font-bold text-sm uppercase tracking-wider hover:gap-3 transition-all"
              >
                View All Industries <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================
            CTA SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-forest-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-forest-600/20 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-8 leading-tight">
                Ready to Build Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-300 to-forest-400">
                  Dream Team
                </span>?
              </h2>
              <p className="text-xl text-forest-200 font-light max-w-2xl mx-auto mb-12">
                Tell us what you need. We&apos;ll have qualified candidates in your inbox within 48 hours.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/contact"
                  className="group px-10 py-5 bg-white hover:bg-gold-50 text-forest-900 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                >
                  <Zap size={18} />
                  Start Hiring Today
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/careers/available-talent"
                  className="px-10 py-5 border border-white/20 hover:border-forest-400/40 text-white hover:text-forest-300 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                >
                  <Layers size={18} />
                  Browse Available Talent
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer
          columns={[
            {
              title: 'Staffing',
              links: [
                { label: 'Contract Staffing', href: '/solutions/staffing#contract' },
                { label: 'Contract-to-Hire', href: '/solutions/staffing#contract-to-hire' },
                { label: 'Direct Placement', href: '/solutions/staffing#direct-placement' },
              ],
            },
            {
              title: 'Industries',
              links: [
                { label: 'Technology', href: '/industries/information-technology' },
                { label: 'Healthcare', href: '/industries/healthcare' },
                { label: 'Financial', href: '/industries/financial-accounting' },
                { label: 'View All', href: '/industries' },
              ],
            },
            {
              title: 'Company',
              links: [
                { label: 'About Us', href: '/company/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'Resources', href: '/resources' },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
};

export default StaffingPage;
