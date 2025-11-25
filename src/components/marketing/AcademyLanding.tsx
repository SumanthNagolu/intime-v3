'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Code2,
  Brain,
  Trophy,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Star,
  Play,
  Calendar,
  DollarSign,
  Users,
  Target,
  Award,
  Sparkles,
  Quote,
  Clock,
  Briefcase,
  ChevronRight
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

// Intersection observer hook
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

const CURRICULUM = [
  {
    week: 'Week 1-2',
    title: 'Foundation & Architecture',
    icon: BookOpen,
    topics: ['Data Model Fundamentals', 'Configuration Hierarchy', 'Business Rules Engine', 'Integration Patterns'],
    accent: 'gold'
  },
  {
    week: 'Week 3-4',
    title: 'Advanced Development',
    icon: Code2,
    topics: ['Gosu Programming Deep Dive', 'Custom UI Development', 'PCF Configuration', 'API Development'],
    accent: 'amber'
  },
  {
    week: 'Week 5-6',
    title: 'Enterprise Patterns',
    icon: Brain,
    topics: ['Multi-tenant Architecture', 'Performance Optimization', 'Security Implementation', 'Testing Strategies'],
    accent: 'gold'
  },
  {
    week: 'Week 7-8',
    title: 'Capstone & Certification',
    icon: Trophy,
    topics: ['Real-world Project', 'Production Deployment', 'Certification Prep', 'Interview Coaching'],
    accent: 'amber'
  }
];

const TESTIMONIALS = [
  {
    quote: "I went from $65K in retail management to $145K as a Guidewire Developer in 10 weeks. The ROI was immediate and life-changing.",
    name: "Sarah Chen",
    role: "Senior Developer, Deloitte",
    before: "$65K Retail Manager",
    after: "$145K Senior Dev",
    highlight: "123% salary increase"
  },
  {
    quote: "The capstone project alone was worth the investment. I had a production-ready portfolio that impressed every interviewer.",
    name: "Marcus Johnson",
    role: "Lead Developer, Capgemini",
    before: "Junior Java Dev",
    after: "$130K Lead Developer",
    highlight: "Hired in 3 weeks"
  },
  {
    quote: "Other bootcamps teach theory. InTime had me building real insurance systems from day one. The hands-on approach made all the difference.",
    name: "Priya Patel",
    role: "Tech Lead, PwC",
    before: "Recent Graduate",
    after: "$125K Tech Lead",
    highlight: "Zero to Tech Lead"
  }
];

const DIFFERENTIATORS = [
  {
    icon: Target,
    title: 'Industry-First Curriculum',
    description: 'Built by architects who deployed at Fortune 100 insurers. Every lesson maps to real production scenarios.'
  },
  {
    icon: Users,
    title: 'Cohort-Based Learning',
    description: 'Learn alongside 20 peers. Group projects, code reviews, and networking that extends beyond graduation.'
  },
  {
    icon: Briefcase,
    title: 'Placement Partnership',
    description: 'Direct pipeline to 50+ enterprise clients. Our graduates skip the resume pile.'
  },
  {
    icon: Award,
    title: 'Job Guarantee',
    description: 'Secure a role within 90 days of graduation or receive a full tuition refund. We stand behind our promise.'
  }
];

export const AcademyLanding: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolledPastHero, setHasScrolledPastHero] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const stats = {
    graduates: useCounter(500, 2500),
    salary: useCounter(145, 2000),
    placement: useCounter(95, 2200),
    rating: useCounter(49, 1800) // 4.9 * 10
  };

  const statsSection = useInView();

  useEffect(() => {
    if (statsSection.inView) {
      stats.graduates.start();
      stats.salary.start();
      stats.placement.start();
      stats.rating.start();
    }
  }, [statsSection.inView]);

  // Scroll-based page flip effect
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      
      const heroHeight = heroRef.current.offsetHeight;
      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / (heroHeight * 0.5), 1);
      
      setScrollProgress(progress);
      setHasScrolledPastHero(scrollY > heroHeight * 0.3);
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
        {/* Sophisticated Background - Warm Gold/Amber tones for education */}
        <div className="absolute inset-0">
          {/* Base gradient - deep, rich tones */}
          <div className="absolute inset-0 bg-[#0B1A14]" />
          
          {/* Organic gradient shapes - warm educational tones */}
          <div 
            className="absolute top-0 right-0 w-[70%] h-[80%] rounded-bl-[40%]"
            style={{
              background: 'radial-gradient(ellipse at 70% 30%, rgba(201, 169, 97, 0.25) 0%, transparent 60%)',
            }}
          />
          <div 
            className="absolute bottom-0 left-0 w-[60%] h-[70%] rounded-tr-[50%]"
            style={{
              background: 'radial-gradient(ellipse at 20% 80%, rgba(212, 175, 55, 0.12) 0%, transparent 50%)',
            }}
          />
          <div 
            className="absolute top-[40%] left-[30%] w-[40%] h-[40%]"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(13, 76, 59, 0.2) 0%, transparent 60%)',
            }}
          />
          
          {/* Subtle geometric accents */}
          <div 
            className="absolute top-[15%] right-[8%] w-[350px] h-[350px] border border-gold-500/15 rounded-full"
            style={{ transform: 'rotate(-15deg)' }}
          />
          <div 
            className="absolute bottom-[20%] left-[5%] w-[180px] h-[180px] border border-amber-400/10 rounded-full"
          />
          <div 
            className="absolute top-[60%] right-[25%] w-[120px] h-[120px] border border-gold-400/8"
            style={{ transform: 'rotate(45deg)' }}
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
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              {/* Left - Main Content */}
              <div className="lg:col-span-7">
                {/* Trust indicator */}
                <div className="flex items-center gap-4 mb-10">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div 
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-[#0B1A14] bg-gradient-to-br from-gold-400 to-amber-500 flex items-center justify-center"
                        style={{ zIndex: 4 - i }}
                      >
                        <span className="text-[10px] font-bold text-charcoal-900">
                          {['SC', 'MJ', 'PP', 'AK'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="h-6 w-px bg-white/20" />
                  <span className="text-charcoal-400 text-sm tracking-wide">
                    Join <span className="text-gold-400 font-semibold">500+</span> successful graduates
                  </span>
                </div>

                {/* Main Headline */}
                <h1 className="mb-8">
                  <span className="block text-[clamp(2.5rem,5.5vw,4.5rem)] font-heading font-black text-white leading-[0.95] tracking-tight">
                    The Premier
                  </span>
                  <span className="block text-[clamp(2.5rem,5.5vw,4.5rem)] font-heading font-black leading-[0.95] tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-amber-400 to-gold-500">
                      Guidewire Academy
                    </span>
                  </span>
                </h1>

                {/* Subheadline */}
                <p className="text-lg md:text-xl text-charcoal-300/90 font-light max-w-xl mb-12 leading-relaxed">
                  8-week intensive that transforms career changers into{' '}
                  <span className="text-white font-medium">$150K+ Senior Developers</span>.
                  Real projects. Industry certification. Job guarantee.
                </p>

                {/* CTA Section */}
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-16">
                  <Link
                    href="/academy/dashboard"
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold text-sm uppercase tracking-wider transition-all duration-300"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                  >
                    <Play size={18} />
                    Start Learning
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <button
                    className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 hover:border-gold-500/40 text-white hover:text-gold-400 font-medium text-sm uppercase tracking-wider transition-all duration-300"
                  >
                    <Calendar size={18} />
                    Schedule Discovery Call
                  </button>
                </div>

                {/* Key differentiators */}
                <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-charcoal-400">
                  {[
                    '95% Placement Rate',
                    '$3,000 Investment',
                    'Money-Back Guarantee'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Stats Card */}
              <div className="lg:col-span-5">
                <div className="relative">
                  {/* Card glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-gold-500/20 to-amber-500/10 blur-xl rounded-3xl" />
                  
                  <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                    {/* Featured stat */}
                    <div className="text-center mb-8 pb-8 border-b border-white/10">
                      <div className="text-5xl md:text-6xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-400 mb-2">
                        $145K
                      </div>
                      <div className="text-charcoal-400 text-xs font-bold uppercase tracking-[0.2em]">
                        Average Starting Salary
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {[
                        { value: '8', label: 'Week Program' },
                        { value: '95%', label: 'Job Rate' },
                        { value: '500+', label: 'Graduates' },
                        { value: '4.9', label: 'Student Rating' }
                      ].map((stat, i) => (
                        <div key={i} className="text-center p-4 rounded-xl bg-white/5 border border-white/5">
                          <div className="text-2xl font-heading font-bold text-white mb-1">{stat.value}</div>
                          <div className="text-charcoal-500 text-[10px] uppercase tracking-widest">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Features list */}
                    <div className="space-y-3">
                      {['AI-Powered Learning Path', 'Live Portfolio Projects', '1:1 Career Coaching'].map((feature) => (
                        <div key={feature} className="flex items-center gap-3 text-charcoal-300 text-sm">
                          <div className="w-5 h-5 rounded-md bg-gold-500/20 flex items-center justify-center">
                            <CheckCircle2 size={12} className="text-gold-400" />
                          </div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-charcoal-500 hover:text-gold-400 transition-colors cursor-pointer group"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Discover</span>
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
            PROBLEM SECTION - The $150K Problem
            ============================================ */}
        <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
          {/* Subtle background */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(201,169,97,0.04)_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(212,175,55,0.03)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                  The Opportunity
                </span>
                <div className="w-12 h-px bg-gold-500" />
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6 leading-tight">
                The{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-amber-500">
                  $150K Problem
                </span>
              </h2>
              <p className="text-lg text-charcoal-500 leading-relaxed">
                There are 50,000+ Guidewire jobs open right now. But hiring managers cannot find qualified candidates.
              </p>
            </div>

            {/* Problem Stats */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { stat: '50,000+', label: 'Open Positions', description: 'Enterprise insurance companies are desperate for Guidewire talent.' },
                { stat: '$150-250K', label: 'Salary Range', description: 'Senior developers command premium compensation due to scarcity.' },
                { stat: '< 1,000', label: 'Certified Annually', description: 'Traditional certification programs produce too few qualified developers.' }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="group relative bg-ivory rounded-2xl p-8 border border-charcoal-100 hover:shadow-elevation-lg transition-all duration-500"
                >
                  {/* Left accent bar */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-gold-500 rounded-l-2xl" />
                  
                  <div className="text-4xl font-heading font-black text-charcoal-900 mb-2">{item.stat}</div>
                  <div className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.15em] mb-4">{item.label}</div>
                  <p className="text-charcoal-500 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            DIFFERENTIATORS - Why InTime Academy
            ============================================ */}
        <section className="py-24 lg:py-32 bg-charcoal-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-900/20 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-900/15 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Left - Content */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-px bg-gold-500" />
                  <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em]">
                    Why InTime Academy
                  </span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6 leading-tight">
                  Built for{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-400">
                    Career Transformation
                  </span>
                </h2>
                
                <p className="text-lg text-charcoal-300 mb-10 leading-relaxed">
                  We do not just teach Guidewire. We transform career trajectories. Our curriculum is designed by architects who have deployed at Fortune 100 insurers.
                </p>

                <div className="space-y-6">
                  {DIFFERENTIATORS.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center shrink-0">
                        <item.icon size={20} className="text-gold-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold mb-1">{item.title}</h4>
                        <p className="text-charcoal-400 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Stats */}
              <div 
                ref={statsSection.ref}
                className="grid grid-cols-2 gap-6"
              >
                {[
                  { value: stats.graduates.count, suffix: '+', label: 'Graduates Placed', icon: Users },
                  { value: stats.placement.count, suffix: '%', label: 'Placement Rate', icon: Target },
                  { value: `$${stats.salary.count}K`, suffix: '', label: 'Avg Starting Salary', icon: DollarSign },
                  { value: (stats.rating.count / 10).toFixed(1), suffix: '', label: 'Student Rating', icon: Star }
                ].map((stat, i) => (
                  <div 
                    key={i} 
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center"
                  >
                    <stat.icon size={24} className="text-gold-400 mx-auto mb-3" />
                    <div className="text-3xl md:text-4xl font-heading font-black text-white mb-1">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}{stat.suffix}
                    </div>
                    <div className="text-charcoal-500 text-xs font-bold uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            CURRICULUM SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-ivory relative overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(201,169,97,0.04)_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(212,175,55,0.03)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                  8-Week Intensive
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6 leading-tight">
                Battle-Tested{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-amber-500">
                  Curriculum
                </span>
              </h2>
              <p className="text-lg text-charcoal-500 leading-relaxed">
                Every module is designed by senior architects with 10+ years of enterprise Guidewire experience.
              </p>
            </div>

            {/* Curriculum Grid - Asymmetric */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {CURRICULUM.map((module, i) => {
                const Icon = module.icon;
                const isWide = i === 0 || i === 3;
                const accentColors: Record<string, { bg: string; text: string; border: string }> = {
                  gold: { bg: 'bg-gold-50', text: 'text-gold-600', border: 'bg-gold-500' },
                  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'bg-amber-500' }
                };
                const colors = accentColors[module.accent];
                
                return (
                  <div 
                    key={i} 
                    className={`group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500 ${
                      isWide ? 'lg:col-span-7' : 'lg:col-span-5'
                    }`}
                  >
                    {/* Left accent bar */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${colors.border}`} />
                    
                    <div className="p-8 lg:p-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center`}>
                          <Icon size={28} className={colors.text} />
                        </div>
                        <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest">
                          {module.week}
                        </span>
                      </div>
                      
                      <h3 className="text-xl lg:text-2xl font-heading font-bold text-charcoal-900 mb-4 group-hover:text-gold-700 transition-colors">
                        {module.title}
                      </h3>
                      
                      <ul className="space-y-2">
                        {module.topics.map((topic, j) => (
                          <li key={j} className="flex items-center gap-3 text-sm text-charcoal-600">
                            <CheckCircle2 size={14} className={colors.text} />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================
            TESTIMONIALS SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Success Stories
                </span>
                <div className="w-12 h-px bg-gold-500" />
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6">
                From Zero to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-amber-500">$150K</span>
              </h2>
            </div>

            {/* Testimonial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {TESTIMONIALS.map((testimonial, i) => (
                <div
                  key={i}
                  className="group relative bg-ivory rounded-2xl p-8 border border-charcoal-100 hover:shadow-elevation-lg transition-all duration-500"
                >
                  {/* Quote Icon */}
                  <Quote size={28} className="text-gold-200 mb-4" />

                  {/* Quote Text */}
                  <p className="text-charcoal-700 leading-relaxed mb-6 text-[15px]">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  {/* Highlight Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-50 text-gold-700 text-[10px] font-bold uppercase tracking-widest mb-6">
                    <Sparkles size={10} />
                    {testimonial.highlight}
                  </div>

                  {/* Before/After */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 p-3 bg-charcoal-100 text-center">
                      <div className="text-[9px] font-bold text-charcoal-500 uppercase tracking-wider mb-1">Before</div>
                      <div className="text-xs text-charcoal-700 font-medium">{testimonial.before}</div>
                    </div>
                    <ArrowRight size={14} className="text-gold-500 shrink-0" />
                    <div className="flex-1 p-3 bg-gold-50 text-center">
                      <div className="text-[9px] font-bold text-gold-600 uppercase tracking-wider mb-1">After</div>
                      <div className="text-xs text-charcoal-900 font-medium">{testimonial.after}</div>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-6 border-t border-charcoal-100">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-amber-500 flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-charcoal-900">{testimonial.name}</div>
                      <div className="text-sm text-charcoal-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            CTA SECTION - Pricing
            ============================================ */}
        <section className="py-24 lg:py-32 bg-forest-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Section Label */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-px bg-gold-500/50" />
                <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em]">
                  Investment
                </span>
                <div className="w-12 h-px bg-gold-500/50" />
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-4 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-400">
                  $3,000
                </span>
                {' '}Total Investment
              </h2>
              <p className="text-xl text-forest-200 font-light max-w-2xl mx-auto mb-10">
                Average ROI: 48x in first year. We are so confident in our program, we offer a complete money-back guarantee.
              </p>

              {/* Features Grid */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {['8-Week Program', 'AI Mentor Access', 'Career Coaching', 'Job Guarantee', 'Lifetime Updates'].map((feature) => (
                  <span 
                    key={feature} 
                    className="px-4 py-2 bg-white/10 text-forest-100 text-sm font-medium border border-white/10"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/academy/dashboard"
                  className="group px-10 py-5 bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                >
                  <GraduationCap size={18} />
                  Enroll Now
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  className="px-10 py-5 border border-white/20 hover:border-gold-500/40 text-white hover:text-gold-400 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                >
                  <BookOpen size={18} />
                  Download Syllabus
                </button>
              </div>
            </div>
          </div>
        </section>

        <Footer
          columns={[
            {
              title: 'Academy',
              links: [
                { label: 'Curriculum', href: '/academy#curriculum' },
                { label: 'Success Stories', href: '/academy#testimonials' },
                { label: 'Pricing', href: '/academy#pricing' },
                { label: 'FAQ', href: '/academy#faq' },
              ],
            },
            {
              title: 'Resources',
              links: [
                { label: 'Free Guide', href: '/resources/guidewire-guide' },
                { label: 'Blog', href: '/resources' },
                { label: 'Webinars', href: '/resources/webinars' },
                { label: 'Careers', href: '/careers' },
              ],
            },
            {
              title: 'Support',
              links: [
                { label: 'Contact Us', href: '/contact' },
                { label: 'Student Portal', href: '/academy/dashboard' },
                { label: 'Terms', href: '/terms' },
                { label: 'Privacy', href: '/privacy' },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
};

export default AcademyLanding;
