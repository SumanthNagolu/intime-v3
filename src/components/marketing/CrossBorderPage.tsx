'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Globe,
  FileText,
  Building2,
  ArrowRight,
  CheckCircle2,
  Shield,
  Clock,
  Plane,
  DollarSign,
  Award,
  Users,
  MapPin,
  Briefcase,
  ChevronRight,
  Star,
  Scale
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/templates';

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

const SERVICES = [
  {
    icon: FileText,
    title: 'Visa & Immigration',
    description: 'Complete H1B, L1, and employment-based visa sponsorship support. From petition to approval, we handle every step.',
    features: ['H1B Sponsorship', 'L1 Transfers', 'Green Card Processing', 'OPT/CPT Support'],
    accent: 'purple'
  },
  {
    icon: DollarSign,
    title: 'Global Payroll',
    description: 'Compliant payroll solutions across 100+ countries. Pay international talent without setting up local entities.',
    features: ['Multi-Currency Payroll', 'Tax Compliance', 'Benefits Administration', 'Contractor Payments'],
    accent: 'violet'
  },
  {
    icon: Building2,
    title: 'Employer of Record',
    description: 'Hire globally without the legal complexity. We become the legal employer while you manage the work.',
    features: ['Legal Employment', 'Compliance Management', 'Contract Handling', 'HR Administration'],
    accent: 'indigo'
  },
  {
    icon: Plane,
    title: 'Relocation Support',
    description: 'End-to-end relocation services for international hires. Housing, banking, settling-in assistance included.',
    features: ['Housing Assistance', 'Cultural Orientation', 'Family Support', 'Settling-In Services'],
    accent: 'fuchsia'
  }
];

const VISA_TYPES = [
  {
    type: 'H1B',
    title: 'H1B Specialty Occupation',
    description: 'For specialized workers in technology, engineering, finance, and other professional fields.',
    timeline: '6-9 months',
    validity: '3-6 years'
  },
  {
    type: 'L1A',
    title: 'L1A Intracompany Transfer',
    description: 'For executives and managers transferring from foreign offices to US operations.',
    timeline: '2-4 months',
    validity: '7 years'
  },
  {
    type: 'L1B',
    title: 'L1B Specialized Knowledge',
    description: 'For employees with specialized knowledge of company products, services, or processes.',
    timeline: '2-4 months',
    validity: '5 years'
  },
  {
    type: 'EB',
    title: 'Employment-Based Green Card',
    description: 'Permanent residence for workers in priority categories including EB-1, EB-2, and EB-3.',
    timeline: '1-5+ years',
    validity: 'Permanent'
  }
];

const REGIONS = [
  { code: 'IN', name: 'India' },
  { code: 'CA', name: 'Canada' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'AU', name: 'Australia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'MX', name: 'Mexico' },
  { code: 'BR', name: 'Brazil' }
];

export const CrossBorderPage: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const stats = {
    countries: useCounter(98, 2000),
    visas: useCounter(1400, 2500),
    success: useCounter(98, 1800),
    hires: useCounter(3200, 2200)
  };

  const statsSection = useInView();

  useEffect(() => {
    if (statsSection.inView) {
      stats.countries.start();
      stats.visas.start();
      stats.success.start();
      stats.hires.start();
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
        className="relative h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden hero-flip-container"
        style={{
          transform: `perspective(1000px) rotateX(${scrollProgress * -8}deg)`,
          transformOrigin: 'center top',
          opacity: 1 - (scrollProgress * 0.3),
        }}
      >
        {/* Sophisticated Background - Purple/Global Theme */}
        <div className="absolute inset-0">
          {/* Base gradient - deep, cosmic tones */}
          <div className="absolute inset-0 bg-[#0B1A14]" />
          
          {/* Organic gradient shapes - Purple accent */}
          <div 
            className="absolute top-0 right-0 w-[70%] h-[80%] rounded-bl-[40%]"
            style={{
              background: 'radial-gradient(ellipse at 70% 30%, rgba(139, 92, 246, 0.25) 0%, transparent 60%)',
            }}
          />
          <div 
            className="absolute bottom-0 left-0 w-[60%] h-[70%] rounded-tr-[50%]"
            style={{
              background: 'radial-gradient(ellipse at 20% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
            }}
          />
          <div 
            className="absolute top-[40%] left-[30%] w-[40%] h-[40%]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(201, 169, 97, 0.06) 0%, transparent 60%)',
            }}
          />
          
          {/* Subtle geometric accents - global/orbit feel */}
          <div 
            className="absolute top-[15%] right-[8%] w-[400px] h-[400px] border border-purple-500/10 rounded-full"
            style={{ transform: 'rotate(-15deg)' }}
          />
          <div 
            className="absolute top-[20%] right-[12%] w-[300px] h-[300px] border border-purple-400/5 rounded-full"
          />
          <div 
            className="absolute bottom-[20%] left-[5%] w-[200px] h-[200px] border border-violet-500/10 rounded-full"
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
            
            {/* Breadcrumb - subtle navigation */}
            <Link
              href="/solutions"
              className="inline-flex items-center gap-2 text-charcoal-500 hover:text-purple-400 text-sm mb-8 transition-colors"
            >
              <ArrowRight size={14} className="rotate-180" />
              Solutions
            </Link>

            {/* Trust indicator - Global reach */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex -space-x-2">
                {REGIONS.slice(0, 4).map((region, i) => (
                  <div 
                    key={region.code}
                    className="w-8 h-8 rounded-full border-2 border-[#0B1A14] bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center"
                    style={{ zIndex: 4 - i }}
                  >
                    <span className="text-[9px] font-bold text-white">
                      {region.code}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-charcoal-400 text-sm tracking-wide">
                Operating in <span className="text-purple-400 font-semibold">98+</span> countries
              </span>
            </div>

            {/* Main Headline - Distinctive typography */}
            <h1 className="mb-8">
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black text-white leading-[0.95] tracking-tight">
                Hire Globally,
              </span>
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black leading-[0.95] tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-violet-400 to-purple-500">
                  Compliantly
                </span>
              </span>
            </h1>

            {/* Subheadline - Refined, purposeful */}
            <p className="text-lg md:text-xl text-charcoal-300/90 font-light max-w-2xl mb-12 leading-relaxed">
              Navigate international hiring complexity with confidence. 
              Visa sponsorship, global payroll, and compliance—all handled seamlessly by our expert team.
            </p>

            {/* CTA Section - Angled buttons, not rounded-full */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-16">
              <Link
                href="/contact"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm uppercase tracking-wider transition-all duration-300"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
              >
                <Globe size={18} />
                Start Global Hiring
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="#services"
                className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 hover:border-purple-500/40 text-white hover:text-purple-400 font-medium text-sm uppercase tracking-wider transition-all duration-300"
              >
                <FileText size={18} />
                Immigration Guide
              </Link>
            </div>

            {/* Key differentiators - quick scan */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-charcoal-400">
              {[
                '98+ Countries',
                'Visa Sponsorship',
                'Compliant Payroll'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-charcoal-500 hover:text-purple-400 transition-colors cursor-pointer group"
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
        className="relative content-reveal"
        style={{
          transform: `translateY(${Math.max(0, (1 - scrollProgress) * -50)}px)`,
          opacity: 0.3 + (scrollProgress * 0.7),
        }}
      >

        {/* ============================================
            SOCIAL PROOF BAR - Global Reach
            ============================================ */}
        <section className="py-12 bg-charcoal-900 border-y border-white/5">
          <div className="container mx-auto px-6 lg:px-12">
            <p className="text-center text-charcoal-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
              Global Presence Across Regions
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
              {REGIONS.map((region) => (
                <div
                  key={region.code}
                  className="flex items-center gap-2 text-charcoal-500 hover:text-purple-400/80 transition-colors duration-500 cursor-default"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-purple-400">{region.code}</span>
                  </div>
                  <span className="text-sm font-medium">{region.name}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-charcoal-500">
                <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-gold-400">+90</span>
                </div>
                <span className="text-sm font-medium">More Countries</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            SERVICES GRID - Four Pillars
            ============================================ */}
        <section id="services" className="py-24 lg:py-32 bg-ivory relative overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.03)_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.03)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-purple-500" />
                <span className="text-purple-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Global Solutions
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6 leading-tight">
                Complete International{' '}
                <span className="text-purple-600">Workforce Solutions</span>
              </h2>
              <p className="text-lg text-charcoal-500 leading-relaxed">
                Everything you need to hire, pay, and manage talent across borders—without the legal complexity.
              </p>
            </div>

            {/* Service Cards - Asymmetric Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Visa & Immigration - Featured */}
              <div className="lg:col-span-7 group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                <div className="p-8 lg:p-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center">
                      <FileText size={28} className="text-purple-600" />
                    </div>
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1.5 rounded-sm">
                      Core Service
                    </span>
                  </div>
                  
                  <h3 className="text-2xl lg:text-3xl font-heading font-bold text-charcoal-900 mb-4 group-hover:text-purple-700 transition-colors">
                    Visa & Immigration
                  </h3>
                  
                  <p className="text-charcoal-500 mb-6 leading-relaxed">
                    Complete H1B, L1, and employment-based visa sponsorship support. From petition to approval, we handle every step of the immigration process.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { value: '98%', label: 'Approval Rate' },
                      { value: '1,400+', label: 'Visas Processed' },
                      { value: '60', label: 'Day Avg. Timeline' },
                    ].map((stat, i) => (
                      <div key={i} className="text-center p-3 bg-charcoal-50 rounded-lg">
                        <div className="text-xl font-heading font-bold text-charcoal-900">{stat.value}</div>
                        <div className="text-[10px] text-charcoal-500 uppercase tracking-wider">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  <ul className="grid grid-cols-2 gap-2 mb-6">
                    {SERVICES[0].features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-charcoal-600">
                        <CheckCircle2 size={14} className="text-purple-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    href="/contact"
                    className="flex items-center gap-2 text-purple-600 font-bold uppercase tracking-wider text-xs"
                  >
                    Start Immigration Process
                    <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Global Payroll */}
              <div className="lg:col-span-5 group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500">
                <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
                <div className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-5">
                    <DollarSign size={24} className="text-violet-600" />
                  </div>
                  
                  <h3 className="text-xl font-heading font-bold text-charcoal-900 mb-3 group-hover:text-violet-700 transition-colors">
                    Global Payroll
                  </h3>
                  
                  <p className="text-charcoal-500 text-sm mb-4">
                    Compliant payroll solutions across 100+ countries. Pay international talent without local entities.
                  </p>
                  
                  <ul className="space-y-2 mb-4">
                    {SERVICES[1].features.slice(0, 2).map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-charcoal-600">
                        <CheckCircle2 size={12} className="text-violet-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center gap-2 text-violet-600 font-bold uppercase tracking-wider text-xs">
                    Explore Payroll <ChevronRight size={14} />
                  </div>
                </div>
              </div>

              {/* Employer of Record */}
              <div className="lg:col-span-6 group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                <div className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                    <Building2 size={24} className="text-indigo-600" />
                  </div>
                  
                  <h3 className="text-xl font-heading font-bold text-charcoal-900 mb-3 group-hover:text-indigo-700 transition-colors">
                    Employer of Record
                  </h3>
                  
                  <p className="text-charcoal-500 text-sm mb-4">
                    Hire globally without the legal complexity. We become the legal employer while you manage the work.
                  </p>
                  
                  <ul className="grid grid-cols-2 gap-2 mb-4">
                    {SERVICES[2].features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-charcoal-600">
                        <CheckCircle2 size={12} className="text-indigo-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs">
                    Learn About EOR <ChevronRight size={14} />
                  </div>
                </div>
              </div>

              {/* Relocation Support */}
              <div className="lg:col-span-6 group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500">
                <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500" />
                <div className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-fuchsia-50 flex items-center justify-center mb-5">
                    <Plane size={24} className="text-fuchsia-600" />
                  </div>
                  
                  <h3 className="text-xl font-heading font-bold text-charcoal-900 mb-3 group-hover:text-fuchsia-700 transition-colors">
                    Relocation Support
                  </h3>
                  
                  <p className="text-charcoal-500 text-sm mb-4">
                    End-to-end relocation services for international hires. Housing, banking, settling-in assistance included.
                  </p>
                  
                  <ul className="grid grid-cols-2 gap-2 mb-4">
                    {SERVICES[3].features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-charcoal-600">
                        <CheckCircle2 size={12} className="text-fuchsia-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center gap-2 text-fuchsia-600 font-bold uppercase tracking-wider text-xs">
                    Relocation Services <ChevronRight size={14} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ============================================
            VISA EXPERTISE - Immigration Categories
            ============================================ */}
        <section className="py-24 lg:py-32 bg-charcoal-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-900/20 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              
              {/* Left - Content */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-px bg-purple-500" />
                  <span className="text-purple-400 text-xs font-bold uppercase tracking-[0.2em]">
                    Visa Categories
                  </span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6 leading-tight">
                  Immigration{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-500">
                    Expertise
                  </span>
                </h2>
                
                <p className="text-lg text-charcoal-300 mb-10 leading-relaxed">
                  Comprehensive support for all major employment-based visa categories. Our immigration specialists have processed over 1,400 successful petitions.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      icon: Shield,
                      title: '98% Approval Rate',
                      description: 'Industry-leading success rate backed by meticulous preparation.'
                    },
                    {
                      icon: Clock,
                      title: 'Premium Processing',
                      description: 'Expedited timelines when speed is critical for your hiring.'
                    },
                    {
                      icon: Scale,
                      title: 'Full Compliance',
                      description: 'Every petition audited for regulatory compliance before submission.'
                    },
                    {
                      icon: Users,
                      title: 'Dedicated Support',
                      description: 'Personal case manager assigned to guide you through every step.'
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        <item.icon size={20} className="text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold mb-1">{item.title}</h4>
                        <p className="text-charcoal-400 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Visa Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {VISA_TYPES.map((visa, i) => (
                  <div 
                    key={i} 
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <span className="text-lg font-heading font-bold text-purple-400">{visa.type}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-base font-heading font-bold text-white mb-2">
                      {visa.title}
                    </h3>

                    <p className="text-charcoal-400 text-xs mb-4 leading-relaxed">
                      {visa.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-white/5">
                        <div className="text-[9px] font-bold text-charcoal-500 uppercase tracking-widest mb-0.5">
                          Timeline
                        </div>
                        <div className="text-white text-sm font-medium">{visa.timeline}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5">
                        <div className="text-[9px] font-bold text-charcoal-500 uppercase tracking-widest mb-0.5">
                          Validity
                        </div>
                        <div className="text-white text-sm font-medium">{visa.validity}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            STATS SECTION - Results
            ============================================ */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-px bg-purple-500" />
                <span className="text-purple-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Proven Results
                </span>
                <div className="w-12 h-px bg-purple-500" />
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6">
                Why Companies{' '}
                <span className="text-purple-600">Trust InTime Global</span>
              </h2>
              <p className="text-lg text-charcoal-500">
                A track record of successful international placements and visa approvals.
              </p>
            </div>

            {/* Stats Grid */}
            <div 
              ref={statsSection.ref}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
            >
              {[
                { value: stats.countries.count, suffix: '+', label: 'Countries', icon: Globe },
                { value: stats.visas.count, suffix: '+', label: 'Visas Processed', icon: FileText },
                { value: stats.success.count, suffix: '%', label: 'Success Rate', icon: Award },
                { value: stats.hires.count, suffix: '+', label: 'Global Hires', icon: Users }
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="relative bg-ivory rounded-2xl p-6 border border-charcoal-100 text-center group hover:shadow-elevation-md transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l-2xl" />
                  <stat.icon size={24} className="text-purple-500 mx-auto mb-3" />
                  <div className="text-3xl md:text-4xl font-heading font-black text-charcoal-900 mb-1">
                    {stat.value.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-charcoal-500 text-xs font-bold uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            TESTIMONIAL - Social Proof
            ============================================ */}
        <section className="py-24 lg:py-32 bg-ivory">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-px bg-purple-500" />
                <span className="text-purple-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Client Success
                </span>
              </div>

              <div className="relative bg-white rounded-2xl p-10 lg:p-12 shadow-elevation-md border border-charcoal-100">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 via-violet-500 to-indigo-500 rounded-l-2xl" />
                
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                    RC
                  </div>
                  <div>
                    <div className="text-lg font-heading font-bold text-charcoal-900">Raj Chandra</div>
                    <div className="text-sm text-charcoal-500">Lead Developer, Oracle</div>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className="text-gold-500 fill-gold-500" />
                      ))}
                    </div>
                  </div>
                </div>

                <blockquote className="text-xl md:text-2xl font-heading text-charcoal-800 leading-relaxed mb-8">
                  &quot;The cross-border team handled my H1B transfer seamlessly. From India to a senior role in California in 90 days. They managed every detail of the process—legal paperwork, relocation support, even helping my family settle in.&quot;
                </blockquote>

                <div className="flex flex-wrap gap-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-widest">
                    <Clock size={12} />
                    Visa Approved in 60 Days
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-widest">
                    <MapPin size={12} />
                    India to California
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest">
                    <Briefcase size={12} />
                    Senior Role
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            CTA SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-charcoal-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-8 leading-tight">
                Ready to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-500">
                  Go Global
                </span>
                ?
              </h2>
              <p className="text-xl text-charcoal-300 font-light max-w-2xl mx-auto mb-12">
                Let our experts guide you through international hiring, compliance, and expansion. First consultation is on us.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/contact"
                  className="group px-10 py-5 bg-purple-500 hover:bg-purple-400 text-white font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                >
                  <Globe size={18} />
                  Schedule Consultation
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/solutions"
                  className="px-10 py-5 border border-white/20 hover:border-purple-500/40 text-white hover:text-purple-400 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                >
                  <ArrowRight size={18} className="rotate-180" />
                  View All Solutions
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer
          columns={[
            {
              title: 'Global Services',
              links: [
                { label: 'Visa & Immigration', href: '/solutions/cross-border#visa' },
                { label: 'Global Payroll', href: '/solutions/cross-border#payroll' },
                { label: 'Employer of Record', href: '/solutions/cross-border#eor' },
                { label: 'Relocation', href: '/solutions/cross-border#relocation' },
              ],
            },
            {
              title: 'Visa Types',
              links: [
                { label: 'H1B Visa', href: '/solutions/cross-border#h1b' },
                { label: 'L1 Visa', href: '/solutions/cross-border#l1' },
                { label: 'Green Card', href: '/solutions/cross-border#greencard' },
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

export default CrossBorderPage;
