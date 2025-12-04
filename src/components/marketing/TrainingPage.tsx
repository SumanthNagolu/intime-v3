'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Building2,
  ArrowRight,
  CheckCircle2,
  Target,
  Award,
  Brain,
  Users,
  TrendingUp,
  Star,
  Lightbulb,
  Code2,
  Rocket
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/marketing/templates';

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

const PROGRAMS = [
  {
    icon: GraduationCap,
    title: 'Technical Bootcamps',
    description: 'Intensive 8-12 week programs that transform career changers into deployment-ready professionals.',
    features: ['Guidewire Development', 'Salesforce Administration', 'Cloud Architecture', 'Data Engineering'],
    duration: '8-12 weeks',
    format: 'Full-time Intensive',
    href: '/academy',
    accent: 'gold'
  },
  {
    icon: Award,
    title: 'Certification Programs',
    description: 'Industry-recognized certifications with guaranteed exam prep and pass rates above 95%.',
    features: ['AWS Certifications', 'Azure Certifications', 'Guidewire Certifications', 'Scrum/Agile'],
    duration: '4-8 weeks',
    format: 'Self-Paced + Live Sessions',
    accent: 'amber'
  },
  {
    icon: Building2,
    title: 'Corporate Training',
    description: 'Custom training programs for enterprise teams. Upskill your workforce with tailored curriculum.',
    features: ['Custom Curriculum', 'On-site or Virtual', 'Progress Tracking', 'ROI Metrics'],
    duration: 'Custom',
    format: 'Enterprise Program',
    accent: 'forest'
  },
  {
    icon: Brain,
    title: 'Upskilling Programs',
    description: 'Targeted skill development for working professionals. Learn in-demand skills part-time.',
    features: ['AI/ML Fundamentals', 'DevOps Practices', 'Cloud Migration', 'Leadership Skills'],
    duration: '4-6 weeks',
    format: 'Part-time Evening',
    accent: 'gold'
  }
];

const LEARNING_APPROACH = [
  {
    icon: Code2,
    title: 'Project-Based Learning',
    description: 'Build real-world applications, not toy projects. Every program culminates in production-grade portfolio pieces.'
  },
  {
    icon: Users,
    title: 'Expert Instructors',
    description: 'Learn from senior engineers with 10+ years of enterprise experience. No junior TAs reading scripts.'
  },
  {
    icon: Lightbulb,
    title: 'AI-Powered Support',
    description: '24/7 AI mentor access for immediate help with code reviews, debugging, and concept explanations.'
  },
  {
    icon: Rocket,
    title: 'Career Integration',
    description: 'Resume reviews, mock interviews, and direct employer introductions built into every program.'
  }
];

export const TrainingPage: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const stats = {
    salary: useCounter(145, 2000),
    passRate: useCounter(95, 1800),
    placement: useCounter(80, 2200),
    rating: useCounter(49, 1600) // 4.9 displayed as 49/10
  };

  const statsSection = useInView();

  useEffect(() => {
    if (statsSection.inView) {
      stats.salary.start();
      stats.passRate.start();
      stats.placement.start();
      stats.rating.start();
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

  const getAccentClasses = (accent: string) => {
    switch (accent) {
      case 'gold':
        return {
          bar: 'bg-gold-500',
          iconBg: 'bg-gold-50',
          iconColor: 'text-gold-600',
          linkColor: 'text-gold-600 hover:text-gold-700',
          check: 'text-gold-500'
        };
      case 'amber':
        return {
          bar: 'bg-amber-500',
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-600',
          linkColor: 'text-amber-600 hover:text-amber-700',
          check: 'text-amber-500'
        };
      case 'forest':
        return {
          bar: 'bg-forest-500',
          iconBg: 'bg-forest-50',
          iconColor: 'text-forest-600',
          linkColor: 'text-forest-600 hover:text-forest-700',
          check: 'text-forest-500'
        };
      default:
        return {
          bar: 'bg-gold-500',
          iconBg: 'bg-gold-50',
          iconColor: 'text-gold-600',
          linkColor: 'text-gold-600 hover:text-gold-700',
          check: 'text-gold-500'
        };
    }
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
        {/* Sophisticated Background - Gold/Amber warmth for Academy */}
        <div className="absolute inset-0">
          {/* Base gradient - deep charcoal */}
          <div className="absolute inset-0 bg-[#0B1A14]" />
          
          {/* Organic gradient shapes - Gold/Amber warmth */}
          <div 
            className="absolute top-0 right-0 w-[70%] h-[80%] rounded-bl-[40%]"
            style={{
              background: 'radial-gradient(ellipse at 70% 30%, rgba(201, 169, 97, 0.15) 0%, transparent 60%)',
            }}
          />
          <div 
            className="absolute bottom-0 left-0 w-[60%] h-[70%] rounded-tr-[50%]"
            style={{
              background: 'radial-gradient(ellipse at 20% 80%, rgba(212, 175, 55, 0.08) 0%, transparent 50%)',
            }}
          />
          <div 
            className="absolute top-[40%] left-[30%] w-[50%] h-[60%] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(184, 150, 78, 0.05) 0%, transparent 60%)',
            }}
          />
          
          {/* Subtle geometric accent - warm tones */}
          <div 
            className="absolute top-[15%] right-[8%] w-[280px] h-[280px] border border-gold-500/10"
            style={{ transform: 'rotate(-20deg)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }}
          />
          <div 
            className="absolute bottom-[20%] left-[8%] w-[180px] h-[180px] border border-amber-500/10"
            style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
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
            
            {/* Trust indicator */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-8 h-8 border-2 border-[#0B1A14] bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center"
                    style={{ 
                      zIndex: 4 - i,
                      borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%'
                    }}
                  >
                    <span className="text-[10px] font-bold text-charcoal-900">
                      {['PS', 'MC', 'RP', 'AL'][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-charcoal-400 text-sm tracking-wide">
                <span className="text-gold-400 font-semibold">500+</span> graduates placed at top firms
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="mb-8">
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black text-white leading-[0.95] tracking-tight">
                Transform Careers
              </span>
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black leading-[0.95] tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-amber-400">
                  Build Expertise
                </span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-charcoal-300/90 font-light max-w-2xl mb-12 leading-relaxed">
              From bootcamps to certifications, our training programs produce professionals 
              who perform from day one. Results-focused learning that employers trust.
            </p>

            {/* CTA Section - Angled clip-path, NOT rounded */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-16">
              <Link
                href="/academy"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold text-sm uppercase tracking-wider transition-all duration-300"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
              >
                <GraduationCap size={18} />
                Explore Academy
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 hover:border-gold-500/40 text-white hover:text-gold-400 font-medium text-sm uppercase tracking-wider transition-all duration-300"
              >
                <Building2 size={18} />
                Corporate Inquiry
              </Link>
            </div>

            {/* Key differentiators */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-charcoal-400">
              {[
                '8-Week Intensive Programs',
                '95% Certification Pass Rate',
                '$145K Avg Starting Salary'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gold-500" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                  <span>{item}</span>
                </div>
              ))}
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
            OUTCOMES STATS - Animated Counters
            ============================================ */}
        <section 
          ref={statsSection.ref}
          className="py-16 bg-charcoal-900 border-y border-white/5"
        >
          <div className="container mx-auto px-6 lg:px-12">
            <p className="text-center text-charcoal-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-10">
              Proven Training Outcomes
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                { value: `$${stats.salary.count}K`, label: 'Avg Starting Salary', description: 'For bootcamp graduates', icon: TrendingUp },
                { value: `${stats.passRate.count}%`, label: 'Certification Pass Rate', description: 'First attempt success', icon: Award },
                { value: `${stats.placement.count}%`, label: 'Placement Rate', description: 'Within 90 days', icon: Target },
                { value: `${(stats.rating.count / 10).toFixed(1)}/5`, label: 'Student Rating', description: '500+ reviews', icon: Star }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <stat.icon size={20} className="text-gold-400 mx-auto mb-3" />
                  <div className="text-3xl md:text-4xl font-heading font-black text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold text-charcoal-400 uppercase tracking-wider mb-1">
                    {stat.label}
                  </div>
                  <div className="text-[10px] text-charcoal-600">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            PROGRAMS SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-ivory relative overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(201,169,97,0.04)_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(184,150,78,0.03)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Our Programs
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6 leading-tight">
                Programs for Every{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-amber-500">
                  Career Stage
                </span>
              </h2>
              <p className="text-lg text-charcoal-500 leading-relaxed">
                Whether you&apos;re starting out, leveling up, or leading teams—we have a program designed for your goals.
              </p>
            </div>

            {/* Program Cards - Asymmetric Grid */}
            <div className="grid md:grid-cols-2 gap-6 max-w-6xl">
              {PROGRAMS.map((program, i) => {
                const Icon = program.icon;
                const accent = getAccentClasses(program.accent);
                return (
                  <div
                    key={i}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500"
                  >
                    {/* Left accent bar */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${accent.bar}`} />
                    
                    <div className="p-8 lg:p-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-14 h-14 rounded-xl ${accent.iconBg} flex items-center justify-center`}>
                          <Icon size={28} className={accent.iconColor} />
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest">
                            {program.format}
                          </div>
                          <div className="text-sm text-charcoal-600">{program.duration}</div>
                        </div>
                      </div>

                      <h3 className="text-xl lg:text-2xl font-heading font-bold text-charcoal-900 mb-4 group-hover:text-gold-700 transition-colors">
                        {program.title}
                      </h3>

                      <p className="text-charcoal-500 mb-6 leading-relaxed">
                        {program.description}
                      </p>

                      <ul className="grid grid-cols-2 gap-2 mb-6">
                        {program.features.map((feature, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-charcoal-600">
                            <CheckCircle2 size={14} className={accent.check} />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Link
                        href={program.href || '/contact'}
                        className={`inline-flex items-center gap-2 ${accent.linkColor} font-bold text-xs uppercase tracking-wider`}
                      >
                        Explore Program
                        <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================
            LEARNING APPROACH
            ============================================ */}
        <section className="py-24 lg:py-32 bg-charcoal-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-900/20 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-900/10 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Left - Content */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-px bg-gold-500" />
                  <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em]">
                    Our Approach
                  </span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6 leading-tight">
                  Learning That{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-400">
                    Actually Works
                  </span>
                </h2>
                
                <p className="text-lg text-charcoal-300 mb-10 leading-relaxed">
                  We&apos;ve refined our methodology over 500+ graduates and thousands of hours of instruction.
                  No fluff, no filler—just results.
                </p>

                <Link
                  href="/academy"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold text-sm uppercase tracking-wider transition-all duration-300"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                >
                  <GraduationCap size={18} />
                  See Full Curriculum
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Right - Approach Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {LEARNING_APPROACH.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={i} 
                      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-gold-500/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4">
                        <Icon size={20} className="text-gold-400" />
                      </div>
                      <h3 className="text-base font-heading font-bold text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-charcoal-400 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            CORPORATE TRAINING
            ============================================ */}
        <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
          {/* Background texture */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_90%_10%,rgba(13,76,59,0.05)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-px bg-forest-500" />
                    <span className="text-forest-600 text-xs font-bold uppercase tracking-[0.2em]">
                      Enterprise Solutions
                    </span>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6 leading-tight">
                    Custom Training for{' '}
                    <span className="text-forest-600">Your Organization</span>
                  </h2>

                  <p className="text-lg text-charcoal-500 mb-10 leading-relaxed">
                    Upskill your entire workforce with tailored programs designed around your
                    technology stack, business goals, and team schedules. On-site or virtual delivery available.
                  </p>

                  <ul className="space-y-4 mb-10">
                    {[
                      'Custom curriculum design',
                      'Dedicated success manager',
                      'Progress tracking dashboard',
                      'ROI measurement & reporting'
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-charcoal-700">
                        <div className="w-5 h-5 rounded bg-forest-100 flex items-center justify-center">
                          <CheckCircle2 size={12} className="text-forest-600" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm uppercase tracking-wider transition-all duration-300"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                  >
                    <Building2 size={18} />
                    Request Proposal
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* Enterprise Stats Card */}
                <div className="relative">
                  {/* Background decoration */}
                  <div 
                    className="absolute -top-4 -right-4 w-full h-full bg-forest-100/50 rounded-2xl"
                    style={{ transform: 'rotate(3deg)' }}
                  />
                  
                  <div className="relative bg-gradient-to-br from-forest-50 to-ivory rounded-2xl p-10 border border-forest-100">
                    <div className="text-center mb-10">
                      <div className="text-6xl font-heading font-black text-forest-600 mb-2">500+</div>
                      <div className="text-sm text-charcoal-500 uppercase tracking-widest">Enterprise Learners Trained</div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { company: 'Fortune 500 Insurance', team: '150 Developers', program: 'Guidewire Certification' },
                        { company: 'Global Consulting Firm', team: '80 Consultants', program: 'Cloud Architecture' },
                        { company: 'Healthcare Technology', team: '60 Engineers', program: 'DevOps Transformation' }
                      ].map((item, i) => (
                        <div 
                          key={i} 
                          className="relative bg-white rounded-xl p-5 shadow-elevation-xs border border-forest-100/50 overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-forest-500" />
                          <div className="font-bold text-charcoal-900">{item.company}</div>
                          <div className="text-sm text-charcoal-500">{item.team} • {item.program}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            FINAL CTA SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-forest-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-forest-500/20 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em]">
                  Start Today
                </span>
                <div className="w-12 h-px bg-gold-500" />
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-8 leading-tight">
                Ready to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-400">
                  Transform
                </span>
                {' '}Your Future?
              </h2>
              <p className="text-xl text-forest-200 font-light max-w-2xl mx-auto mb-12">
                Join 500+ professionals who&apos;ve accelerated their careers through our programs.
                Your transformation starts with a single step.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/academy"
                  className="group px-10 py-5 bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                >
                  <GraduationCap size={18} />
                  View Programs
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/contact"
                  className="px-10 py-5 border border-white/20 hover:border-gold-500/40 text-white hover:text-gold-400 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                >
                  <Building2 size={18} />
                  Enterprise Inquiry
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer
          columns={[
            {
              title: 'Programs',
              links: [
                { label: 'Technical Bootcamps', href: '/academy' },
                { label: 'Certifications', href: '/solutions/training#certifications' },
                { label: 'Corporate Training', href: '/solutions/training#corporate' },
                { label: 'Upskilling', href: '/solutions/training#upskilling' },
              ],
            },
            {
              title: 'Academy',
              links: [
                { label: 'Guidewire Program', href: '/academy' },
                { label: 'Curriculum', href: '/academy#curriculum' },
                { label: 'Success Stories', href: '/academy#testimonials' },
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

export default TrainingPage;
