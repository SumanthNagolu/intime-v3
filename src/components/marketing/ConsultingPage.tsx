'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  TrendingUp,
  Shield,
  Users,
  BarChart3,
  Network,
  CheckCircle2,
  Layers,
  Sparkles,
  Building2,
  Briefcase,
  GraduationCap,
  ShoppingCart,
  Settings,
  Globe,
  Zap,
  Target,
  DollarSign,
  Award
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/templates';

const ENTERPRISE_SERVICES = [
  {
    icon: TrendingUp,
    title: 'Strategy & Transformation',
    description: 'Corporate strategy, M&A advisory, market entry, and digital transformation planning.',
    features: ['Digital transformation', 'M&A due diligence', 'Market entry strategy', 'Business model innovation'],
    href: '/consulting/services#strategy',
    accent: 'forest'
  },
  {
    icon: Brain,
    title: 'Technology & Innovation',
    description: 'Cloud migration, enterprise architecture, legacy modernization, and IT strategy.',
    features: ['Cloud transformation', 'Enterprise architecture', 'Legacy modernization', 'IT strategy'],
    href: '/consulting/services#technology',
    accent: 'forest'
  },
  {
    icon: Shield,
    title: 'Risk & Compliance',
    description: 'Regulatory compliance, cybersecurity, internal audit, and risk assessment.',
    features: ['Cybersecurity assessment', 'Compliance (GDPR, SOX)', 'Risk management', 'Internal audit'],
    href: '/consulting/services#risk',
    accent: 'slate'
  },
  {
    icon: Users,
    title: 'Workforce Transformation',
    description: 'Talent strategy, organizational design, leadership development, and HR technology.',
    features: ['Organizational design', 'Talent acquisition strategy', 'Leadership development', 'HR technology'],
    href: '/consulting/services#workforce',
    accent: 'forest'
  },
  {
    icon: BarChart3,
    title: 'Process Optimization',
    description: 'Lean Six Sigma, process mining, RPA, and operational efficiency.',
    features: ['Process improvement', 'Robotic Process Automation', 'Supply chain optimization', 'Cost reduction'],
    href: '/consulting/services#process',
    accent: 'slate'
  },
  {
    icon: Network,
    title: 'Data & AI Strategy',
    description: 'Data strategy, AI/ML implementation, business intelligence, and predictive analytics.',
    features: ['Data strategy & governance', 'AI/ML model development', 'Business intelligence', 'Predictive analytics'],
    href: '/consulting/services#data',
    accent: 'forest'
  }
];

const AI_SOLUTIONS = [
  { 
    icon: GraduationCap, 
    title: 'Education Platforms', 
    description: 'Custom LMS, AI tutors, student tracking, assessment automation.',
    accent: 'gold'
  },
  { 
    icon: ShoppingCart, 
    title: 'Retail & Hospitality', 
    description: 'POS systems, inventory management, loyalty programs, staff scheduling.',
    accent: 'forest'
  },
  { 
    icon: Briefcase, 
    title: 'Professional Services', 
    description: 'Practice management, client portals, billing automation, compliance tools.',
    accent: 'slate'
  },
  { 
    icon: Settings, 
    title: 'Manager Tools', 
    description: 'Leadership dashboards, OKR tracking, team collaboration, performance reviews.',
    accent: 'forest'
  }
];

const DIFFERENTIATORS = [
  { 
    icon: Zap, 
    title: '3x Faster Delivery', 
    description: 'Enterprise projects delivered in 4 months, not 12. Same quality. Less process bloat.' 
  },
  { 
    icon: DollarSign, 
    title: '40-60% Lower Cost', 
    description: 'Enterprise-quality consulting at $150-250/hr. No $500/hr partner rates.' 
  },
  { 
    icon: Target, 
    title: 'SMB to Enterprise', 
    description: 'We serve everyone—from $500K startups to Fortune 500. No minimums. No gatekeeping.' 
  }
];

const INDUSTRIES = [
  'Financial Services', 'Healthcare', 'Manufacturing', 'Retail', 
  'Technology', 'Education', 'Legal', 'Real Estate', 
  'Hospitality', 'Energy', 'Transportation', 'Government'
];

export const ConsultingPage: React.FC = () => {
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
        {/* Sophisticated Background */}
        <div className="absolute inset-0">
          {/* Base gradient - deep forest tones for consulting */}
          <div className="absolute inset-0 bg-[#0B1A14]" />
          
          {/* Organic gradient shapes - forest emphasis */}
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
            className="absolute top-[40%] left-[60%] w-[40%] h-[50%]"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(201, 169, 97, 0.06) 0%, transparent 50%)',
            }}
          />
          
          {/* Subtle geometric accents */}
          <div 
            className="absolute top-[15%] right-[8%] w-[350px] h-[350px] border border-forest-500/10 rounded-full"
            style={{ transform: 'rotate(-15deg)' }}
          />
          <div 
            className="absolute bottom-[20%] left-[5%] w-[250px] h-[250px] border border-forest-500/8"
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
          <div className="max-w-5xl">
            
            {/* Trust indicator */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex items-center gap-2 px-4 py-2 rounded-sm bg-white/5 backdrop-blur-sm border border-white/10">
                <Layers size={14} className="text-forest-400" />
                <span className="text-forest-300/90 text-[10px] font-bold tracking-[0.2em] uppercase">
                  Enterprise + AI + Custom Solutions
                </span>
              </div>
            </div>

            {/* Main Headline - Distinctive typography */}
            <h1 className="mb-8">
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black text-white leading-[0.95] tracking-tight">
                Consulting That Moves
              </span>
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black leading-[0.95] tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-300 via-forest-400 to-forest-500">
                  Boardrooms
                </span>
                <span className="text-charcoal-400 mx-4">&</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                  Main Streets
                </span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-charcoal-300/90 font-light max-w-3xl mb-12 leading-relaxed">
              From Fortune 500 strategy to corner-store POS systems. Enterprise consulting
              excellence <span className="text-white font-medium">plus</span> custom AI solutions for businesses of all sizes.
              No project too big. No business too small.
            </p>

            {/* CTA Section - Angled clip-path, NOT rounded */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-16">
              <Link
                href="/contact"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-forest-500 hover:bg-forest-400 text-white font-bold text-sm uppercase tracking-wider transition-all duration-300"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
              >
                <Building2 size={18} />
                Schedule Strategy Session
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/consulting/competencies"
                className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 hover:border-forest-500/40 text-white hover:text-forest-400 font-medium text-sm uppercase tracking-wider transition-all duration-300"
              >
                <Award size={18} />
                View Our Competencies
              </Link>
            </div>

            {/* Key differentiators - quick scan */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-charcoal-400">
              {[
                '3x Faster Delivery',
                '40-60% Lower Cost',
                'SMB to Fortune 500'
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
            SOCIAL PROOF BAR - Trust Indicators
            ============================================ */}
        <section className="py-12 bg-charcoal-900 border-y border-white/5">
          <div className="container mx-auto px-6 lg:px-12">
            <p className="text-center text-charcoal-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
              Trusted By Industry Leaders
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-6">
              {['McKinsey Alumni', 'Deloitte Partners', 'Accenture Experts', 'BCG Advisors', 'PwC Consultants', 'IBM Veterans'].map((brand) => (
                <span
                  key={brand}
                  className="text-lg md:text-xl font-heading font-bold text-charcoal-600 hover:text-forest-500/80 transition-colors duration-500 cursor-default"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            ENTERPRISE CONSULTING SERVICES
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
                  Enterprise Consulting
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6 leading-tight">
                Strategy. Technology.{' '}
                <span className="text-forest-600">Transformation.</span>
              </h2>
              <p className="text-lg text-charcoal-500 leading-relaxed">
                We deliver the full spectrum of enterprise consulting—from C-suite strategy to
                hands-on implementation. Faster delivery. Better rates. Same expertise.
              </p>
            </div>

            {/* Service Cards - Asymmetric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ENTERPRISE_SERVICES.map((service, i) => {
                const accentColors = {
                  forest: { bar: 'bg-forest-500', icon: 'bg-forest-50 text-forest-600 group-hover:bg-forest-600 group-hover:text-white', link: 'text-forest-600' },
                  slate: { bar: 'bg-slate-500', icon: 'bg-slate-100 text-slate-600 group-hover:bg-slate-600 group-hover:text-white', link: 'text-slate-600' },
                };
                const colors = accentColors[service.accent as keyof typeof accentColors];
                
                return (
                  <Link
                    key={i}
                    href={service.href}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500"
                  >
                    {/* Left accent bar */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${colors.bar}`} />
                    
                    <div className="p-8">
                      <div className={`w-14 h-14 rounded-xl ${colors.icon} flex items-center justify-center mb-6 transition-all duration-300`}>
                        <service.icon size={26} />
                      </div>

                      <h3 className="text-xl font-heading font-bold text-charcoal-900 mb-3 group-hover:text-forest-700 transition-colors">
                        {service.title}
                      </h3>

                      <p className="text-charcoal-500 text-sm leading-relaxed mb-5">
                        {service.description}
                      </p>

                      <ul className="space-y-2 mb-6">
                        {service.features.map((feature, j) => (
                          <li key={j} className="flex items-center gap-2 text-xs text-charcoal-600">
                            <CheckCircle2 size={12} className="text-forest-500 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <div className={`flex items-center gap-2 ${colors.link} font-bold uppercase tracking-wider text-xs`}>
                        Explore Service
                        <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-14">
              <Link
                href="/consulting/services"
                className="inline-flex items-center gap-3 px-8 py-4 bg-forest-600 hover:bg-forest-700 text-white font-bold uppercase tracking-wider text-sm transition-all"
                style={{ clipPath: 'polygon(0 0, 100% 0, 97% 100%, 0% 100%)' }}
              >
                View All Enterprise Services
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================
            AI CUSTOM SOLUTIONS
            ============================================ */}
        <section className="py-24 lg:py-32 bg-charcoal-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-900/20 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-forest-900/30 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em]">
                  Our Unique Edge
                </span>
                <div className="w-12 h-px bg-gold-500" />
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6 leading-tight">
                AI Solutions for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                  Every Business
                </span>
              </h2>
              <p className="text-lg text-charcoal-300 leading-relaxed">
                While others chase billion-dollar deals, we also build custom AI-powered tools
                for small businesses. Big impact. Small budgets. Real solutions.
              </p>
            </div>

            {/* Solution Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {AI_SOLUTIONS.map((solution, i) => {
                const accentColors = {
                  gold: { bar: 'bg-gold-500', icon: 'bg-gold-500/10 text-gold-400' },
                  forest: { bar: 'bg-forest-500', icon: 'bg-forest-500/10 text-forest-400' },
                  slate: { bar: 'bg-slate-400', icon: 'bg-slate-500/10 text-slate-400' },
                };
                const colors = accentColors[solution.accent as keyof typeof accentColors];
                
                return (
                  <div
                    key={i}
                    className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-gold-500/30 transition-all duration-500"
                  >
                    {/* Top accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${colors.bar}`} />
                    
                    <div className="p-8 text-center">
                      <div className={`w-16 h-16 rounded-xl ${colors.icon} flex items-center justify-center mx-auto mb-6`}>
                        <solution.icon size={32} />
                      </div>
                      <h3 className="text-lg font-heading font-bold text-white mb-3">
                        {solution.title}
                      </h3>
                      <p className="text-charcoal-400 text-sm leading-relaxed">
                        {solution.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-14">
              <Link
                href="/consulting/services"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold uppercase tracking-wider text-sm transition-all"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
              >
                <Sparkles size={18} />
                Explore Custom Solutions
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================
            WHY CHOOSE US - Differentiators
            ============================================ */}
        <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(13,76,59,0.02)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-px bg-forest-500" />
                <span className="text-forest-600 text-xs font-bold uppercase tracking-[0.2em]">
                  The InTime Advantage
                </span>
                <div className="w-12 h-px bg-forest-500" />
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6">
                Why Choose InTime{' '}
                <span className="text-forest-600">Consulting?</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {DIFFERENTIATORS.map((item, i) => (
                <div 
                  key={i} 
                  className="group relative bg-ivory rounded-2xl p-8 border border-charcoal-100 hover:shadow-elevation-lg transition-all duration-500"
                >
                  {/* Left accent bar */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-forest-500 rounded-l-2xl" />
                  
                  <div className="w-14 h-14 rounded-xl bg-forest-50 flex items-center justify-center mb-6 group-hover:bg-forest-600 transition-all duration-300">
                    <item.icon size={28} className="text-forest-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-charcoal-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-charcoal-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            INDUSTRIES WE TRANSFORM
            ============================================ */}
        <section className="py-20 bg-charcoal-50 relative">
          <div className="container mx-auto px-6 lg:px-12">
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-px bg-slate-400" />
                <span className="text-slate-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Industry Expertise
                </span>
                <div className="w-12 h-px bg-slate-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-charcoal-900 mb-4">
                Industries We Transform
              </h2>
              <p className="text-lg text-charcoal-500">
                From Wall Street to Main Street—we bring enterprise expertise to every industry.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {INDUSTRIES.map((industry, i) => (
                <div
                  key={i}
                  className="group relative bg-white px-5 py-3 text-sm font-medium text-charcoal-700 shadow-sm hover:shadow-elevation-sm transition-all duration-300 overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)' }}
                >
                  <span className="relative z-10">{industry}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            CTA SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-forest-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-forest-500/20 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-8 leading-tight">
                Ready to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                  Transform
                </span>
                {' '}Your Business?
              </h2>
              <p className="text-xl text-forest-200 font-light max-w-2xl mx-auto mb-12">
                Whether you need enterprise strategy or a custom POS for your coffee shop—let&apos;s talk.
                Free 30-minute strategy session. No sales pitch. Just honest advice.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
                <Link
                  href="/contact"
                  className="group px-10 py-5 bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                >
                  <Building2 size={18} />
                  Book Free Strategy Session
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/careers/open-positions"
                  className="px-10 py-5 border border-white/20 hover:border-gold-500/40 text-white hover:text-gold-400 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                >
                  <Briefcase size={18} />
                  View Consulting Roles
                </Link>
              </div>

              {/* Contact Locations - Using icons instead of emojis */}
              <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                {[
                  { region: 'USA', phone: '+1 307-650-2850', href: 'tel:+13076502850' },
                  { region: 'Canada', phone: '+1 289-236-9000', href: 'tel:+12892369000' },
                  { region: 'India', phone: '+91 798-166-6144', href: 'tel:+917981666144' },
                ].map((location, i) => (
                  <div key={i} className="text-center">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-3">
                      <Globe size={20} className="text-gold-400" />
                    </div>
                    <div className="text-charcoal-400 text-sm mb-1">{location.region}</div>
                    <a href={location.href} className="text-white font-medium hover:text-gold-400 transition-colors">
                      {location.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default ConsultingPage;
