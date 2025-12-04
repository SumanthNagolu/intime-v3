'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  GraduationCap,
  Globe,
  Users,
  ArrowRight,
  CheckCircle2,
  Building2,
  Layers,
  Target,
  Clock,
  Shield,
  TrendingUp,
  ChevronRight,
  Zap,
  BarChart3
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/marketing/templates';

const SOLUTIONS = [
  {
    icon: Briefcase,
    title: 'IT Staffing',
    description: 'Access pre-vetted technology professionals across all skill levels. From contract to direct placement, we deliver qualified candidates within 48 hours.',
    features: ['Contract Staffing', 'Contract-to-Hire', 'Direct Placement', 'Executive Search'],
    href: '/solutions/staffing',
    accent: 'forest',
    stats: { value: '48hr', label: 'Avg. Fill Time' }
  },
  {
    icon: Users,
    title: 'Consulting Services',
    description: 'Strategic technology consulting that drives business outcomes. Our expert consultants bring deep domain expertise across enterprise platforms.',
    features: ['Implementation Services', 'System Integration', 'Process Optimization', 'Digital Transformation'],
    href: '/consulting',
    accent: 'forest',
    stats: { value: '150+', label: 'Active Consultants' }
  },
  {
    icon: Globe,
    title: 'Cross-Border Solutions',
    description: 'Navigate global hiring complexity with confidence. Visa sponsorship, international payroll, and compliance—all handled seamlessly.',
    features: ['H1B/L1 Visa Support', 'Global Payroll', 'Immigration Services', 'Relocation Support'],
    href: '/solutions/cross-border',
    accent: 'slate',
    stats: { value: '18', label: 'Countries' }
  },
  {
    icon: GraduationCap,
    title: 'Training Academy',
    description: 'Transform careers through intensive skill development programs. Our academy produces deployment-ready professionals in weeks, not years.',
    features: ['Technical Bootcamps', 'Certification Programs', 'Corporate Training', 'Upskilling Programs'],
    href: '/academy',
    accent: 'forest',
    stats: { value: '95%', label: 'Placement Rate' }
  }
];

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Discover',
    description: 'We analyze your requirements, culture, and timeline to build a precision talent strategy.',
    icon: Target
  },
  {
    number: '02',
    title: 'Source',
    description: 'AI-powered sourcing combined with expert recruiters identifies candidates from our verified talent pool.',
    icon: Zap
  },
  {
    number: '03',
    title: 'Screen',
    description: 'Rigorous 7-step vetting ensures only the top 3% of candidates reach your interview stage.',
    icon: Shield
  },
  {
    number: '04',
    title: 'Deliver',
    description: 'Qualified candidates presented within 48 hours. Average time to fill: 5 business days.',
    icon: CheckCircle2
  }
];

export const SolutionsHub: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
        {/* Sophisticated Background - Forest Green emphasis */}
        <div className="absolute inset-0">
          {/* Base gradient - deep forest tones */}
          <div className="absolute inset-0 bg-[#0B1A14]" />
          
          {/* Organic gradient shapes - forest green emphasis */}
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
          
          {/* Subtle geometric accents */}
          <div 
            className="absolute top-[20%] right-[10%] w-[300px] h-[300px] border border-forest-500/15 rounded-full"
            style={{ transform: 'rotate(-15deg)' }}
          />
          <div 
            className="absolute bottom-[15%] left-[5%] w-[200px] h-[200px] border border-forest-400/10 rounded-full"
          />
          <div 
            className="absolute top-[60%] right-[25%] w-[150px] h-[150px] border border-gold-500/10 rounded-full"
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
              <div className="flex items-center gap-2 px-4 py-2 bg-forest-500/10 border border-forest-500/20">
                <Layers size={14} className="text-forest-400" />
                <span className="text-forest-300 text-xs font-bold uppercase tracking-[0.15em]">
                  Complete Solutions
                </span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-charcoal-400 text-sm tracking-wide">
                Trusted by <span className="text-forest-400 font-semibold">Fortune 500</span> companies
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="mb-8">
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black text-white leading-[0.95] tracking-tight">
                Workforce Solutions
              </span>
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black leading-[0.95] tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-300 via-forest-400 to-emerald-400">
                  That Scale
                </span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-charcoal-300/90 font-light max-w-2xl mb-12 leading-relaxed">
              From staffing to training, from local hires to global teams. Comprehensive 
              workforce solutions engineered for enterprise outcomes.
            </p>

            {/* CTA Section - Angled clip-path, NOT rounded-full */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-16">
              <Link
                href="/contact"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-forest-500 hover:bg-forest-400 text-white font-bold text-sm uppercase tracking-wider transition-all duration-300"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
              >
                <Building2 size={18} />
                Schedule Consultation
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/clients"
                className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 hover:border-forest-500/40 text-white hover:text-forest-400 font-medium text-sm uppercase tracking-wider transition-all duration-300"
              >
                <BarChart3 size={18} />
                View Case Studies
              </Link>
            </div>

            {/* Key metrics - quick scan */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-charcoal-400">
              {[
                '48-Hour Candidate Delivery',
                '98% Client Satisfaction',
                'Global Visa Support'
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
            STATS BAR - Immediate credibility
            ============================================ */}
        <section className="py-12 bg-charcoal-900 border-y border-white/5">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                { value: '48hr', label: 'Time to Present', icon: Clock },
                { value: '98%', label: 'Client Satisfaction', icon: TrendingUp },
                { value: '1,200+', label: 'Placements', icon: Users },
                { value: 'Top 3%', label: 'Talent Quality', icon: Shield }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <stat.icon size={20} className="mx-auto text-forest-400 mb-3" />
                  <div className="text-2xl md:text-3xl font-heading font-black text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-charcoal-500 font-bold uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            SOLUTIONS GRID
            ============================================ */}
        <section className="py-24 lg:py-32 bg-ivory relative overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(13,76,59,0.03)_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(13,76,59,0.02)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-forest-500" />
                <span className="text-forest-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Our Services
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6 leading-tight">
                Comprehensive Solutions for{' '}
                <span className="text-forest-600">Every Need</span>
              </h2>
              <p className="text-lg text-charcoal-500 leading-relaxed">
                Four interconnected services designed to serve every stakeholder in the technology workforce ecosystem.
              </p>
            </div>

            {/* Solutions Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-6xl">
              {SOLUTIONS.map((solution, i) => {
                const Icon = solution.icon;
                const accentClasses = {
                  forest: {
                    bar: 'bg-forest-500',
                    iconBg: 'bg-forest-50',
                    iconColor: 'text-forest-600',
                    hoverText: 'group-hover:text-forest-700',
                    linkColor: 'text-forest-600',
                    statBg: 'bg-forest-50',
                    statText: 'text-forest-700'
                  },
                  slate: {
                    bar: 'bg-slate-500',
                    iconBg: 'bg-slate-100',
                    iconColor: 'text-slate-600',
                    hoverText: 'group-hover:text-slate-700',
                    linkColor: 'text-slate-600',
                    statBg: 'bg-slate-100',
                    statText: 'text-slate-700'
                  }
                };
                const accent = accentClasses[solution.accent as keyof typeof accentClasses] || accentClasses.forest;

                return (
                  <Link
                    key={i}
                    href={solution.href}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500"
                  >
                    {/* Left accent bar */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${accent.bar}`} />
                    
                    <div className="p-8 lg:p-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-14 h-14 rounded-xl ${accent.iconBg} flex items-center justify-center`}>
                          <Icon size={28} className={accent.iconColor} />
                        </div>
                        <div className={`${accent.statBg} px-4 py-2 rounded-lg text-center`}>
                          <div className={`text-lg font-heading font-bold ${accent.statText}`}>
                            {solution.stats.value}
                          </div>
                          <div className="text-[9px] text-charcoal-500 uppercase tracking-wider">
                            {solution.stats.label}
                          </div>
                        </div>
                      </div>

                      <h3 className={`text-2xl font-heading font-bold text-charcoal-900 mb-4 ${accent.hoverText} transition-colors`}>
                        {solution.title}
                      </h3>

                      <p className="text-charcoal-500 mb-6 leading-relaxed">
                        {solution.description}
                      </p>

                      <ul className="grid grid-cols-2 gap-3 mb-6">
                        {solution.features.map((feature, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-charcoal-600">
                            <CheckCircle2 size={14} className="text-forest-500 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <div className={`flex items-center gap-2 ${accent.linkColor} font-bold uppercase tracking-wider text-xs`}>
                        Explore Service
                        <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================
            PROCESS SECTION
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
                <div className="w-12 h-px bg-forest-400" />
                <span className="text-forest-400 text-xs font-bold uppercase tracking-[0.2em]">
                  Our Process
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6 leading-tight">
                A Proven Methodology for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-300 to-emerald-400">
                  Exceptional Results
                </span>
              </h2>
              <p className="text-lg text-charcoal-300 leading-relaxed">
                Refined over thousands of successful placements. Speed without sacrificing quality.
              </p>
            </div>

            {/* Process Steps */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl">
              {PROCESS_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <div key={i} className="relative group">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 h-full hover:border-forest-500/30 transition-all duration-500">
                      {/* Step number */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="text-4xl font-heading font-black text-forest-500/30">
                          {step.number}
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-forest-500/10 flex items-center justify-center">
                          <StepIcon size={20} className="text-forest-400" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-heading font-bold text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-charcoal-400 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                    
                    {/* Arrow connector */}
                    {i < PROCESS_STEPS.length - 1 && (
                      <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                        <ChevronRight size={20} className="text-forest-500/40" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================
            WHY CHOOSE US
            ============================================ */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
              
              {/* Left - Content */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-px bg-forest-500" />
                  <span className="text-forest-600 text-xs font-bold uppercase tracking-[0.2em]">
                    Why InTime
                  </span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6 leading-tight">
                  Built on{' '}
                  <span className="text-forest-600">Trust & Results</span>
                </h2>
                
                <p className="text-lg text-charcoal-500 mb-10 leading-relaxed">
                  We don&apos;t just fill positions. We build careers, transform organizations, and create lasting partnerships.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      icon: Shield,
                      title: 'Quality First',
                      description: 'Rigorous 7-step vetting process. Only the top 3% reach our clients.'
                    },
                    {
                      icon: Clock,
                      title: 'Speed to Value',
                      description: '48-hour average time to present qualified candidates.'
                    },
                    {
                      icon: Users,
                      title: 'Partnership Model',
                      description: 'Long-term relationships over transactional deals.'
                    },
                    {
                      icon: TrendingUp,
                      title: 'Proven Results',
                      description: '98% client satisfaction. 1,200+ successful placements.'
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-forest-50 flex items-center justify-center shrink-0">
                        <item.icon size={20} className="text-forest-600" />
                      </div>
                      <div>
                        <h4 className="text-charcoal-900 font-bold mb-1">{item.title}</h4>
                        <p className="text-charcoal-500 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Visual element */}
              <div className="relative">
                <div className="bg-gradient-to-br from-forest-50 to-ivory rounded-2xl p-8 lg:p-12 border border-forest-100">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { value: '2,500+', label: 'Professionals Trained' },
                      { value: '98%', label: 'Client Retention' },
                      { value: '18', label: 'Countries Served' },
                      { value: '5 Days', label: 'Avg. Time to Fill' }
                    ].map((stat, i) => (
                      <div key={i} className="text-center p-6 bg-white rounded-xl shadow-elevation-sm">
                        <div className="text-2xl md:text-3xl font-heading font-black text-forest-600 mb-1">
                          {stat.value}
                        </div>
                        <div className="text-[10px] text-charcoal-500 font-bold uppercase tracking-wider">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Decorative element */}
                <div className="absolute -top-4 -right-4 w-24 h-24 border border-forest-200 rounded-full" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-forest-100 rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            CTA SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-forest-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-forest-500/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-8 leading-tight">
                Ready to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-300 to-emerald-400">
                  Transform
                </span>
                {' '}Your Workforce Strategy?
              </h2>
              <p className="text-xl text-forest-200 font-light max-w-2xl mx-auto mb-12">
                Let&apos;s discuss how our solutions can drive measurable results for your organization.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/contact"
                  className="group px-10 py-5 bg-white hover:bg-ivory text-forest-900 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                >
                  <Building2 size={18} />
                  Schedule Consultation
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/academy"
                  className="px-10 py-5 border border-white/20 hover:border-forest-400/40 text-white hover:text-forest-300 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                >
                  <GraduationCap size={18} />
                  Explore Academy
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer
          columns={[
            {
              title: 'Solutions',
              links: [
                { label: 'IT Staffing', href: '/solutions/staffing' },
                { label: 'Consulting', href: '/consulting' },
                { label: 'Cross-Border', href: '/solutions/cross-border' },
                { label: 'Training', href: '/academy' },
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
                { label: 'Careers', href: '/careers' },
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

export default SolutionsHub;
