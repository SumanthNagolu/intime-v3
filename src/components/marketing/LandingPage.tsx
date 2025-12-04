'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Award,
  CheckCircle2,
  Star,
  Quote,
  Building2,
  TrendingUp,
  Clock,
  Sparkles,
  Globe,
  GraduationCap,
  UserCheck,
  HandshakeIcon,
  Users,
  Briefcase,
  ChevronRight
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

export const LandingPage: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const stats = {
    professionals: useCounter(2500, 2500),
    satisfaction: useCounter(98, 2000),
    placements: useCounter(1200, 2200),
    countries: useCounter(18, 1800)
  };

  const statsSection = useInView();

  useEffect(() => {
    if (statsSection.inView) {
      stats.professionals.start();
      stats.satisfaction.start();
      stats.placements.start();
      stats.countries.start();
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
        {/* Sophisticated Background */}
        <div className="absolute inset-0">
          {/* Base gradient - deep, rich tones */}
          <div className="absolute inset-0 bg-[#0B1A14]" />
          
          {/* Organic gradient shapes */}
          <div 
            className="absolute top-0 right-0 w-[70%] h-[80%] rounded-bl-[40%]"
            style={{
              background: 'radial-gradient(ellipse at 70% 30%, rgba(13, 76, 59, 0.4) 0%, transparent 60%)',
            }}
          />
          <div 
            className="absolute bottom-0 left-0 w-[60%] h-[70%] rounded-tr-[50%]"
            style={{
              background: 'radial-gradient(ellipse at 20% 80%, rgba(201, 169, 97, 0.08) 0%, transparent 50%)',
            }}
          />
          
          {/* Subtle geometric accent */}
          <div 
            className="absolute top-[20%] right-[10%] w-[300px] h-[300px] border border-gold-500/10 rounded-full"
            style={{ transform: 'rotate(-15deg)' }}
          />
          <div 
            className="absolute bottom-[15%] left-[5%] w-[200px] h-[200px] border border-forest-500/10 rounded-full"
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
                    className="w-8 h-8 rounded-full border-2 border-[#0B1A14] bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center"
                    style={{ zIndex: 4 - i }}
                  >
                    <span className="text-[10px] font-bold text-charcoal-900">
                      {['JC', 'MP', 'SK', 'AL'][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-charcoal-400 text-sm tracking-wide">
                Trusted by <span className="text-gold-400 font-semibold">2,500+</span> professionals
              </span>
            </div>

            {/* Main Headline - Distinctive typography */}
            <h1 className="mb-8">
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black text-white leading-[0.95] tracking-tight">
                Building Careers
              </span>
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black leading-[0.95] tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500">
                  That Matter
                </span>
              </span>
            </h1>

            {/* Subheadline - Refined, purposeful */}
            <p className="text-lg md:text-xl text-charcoal-300/90 font-light max-w-2xl mb-12 leading-relaxed">
              The premier staffing ecosystem for technology professionals. 
              World-class training. Executive placements. Global reach.
            </p>

            {/* CTA Section */}
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
                Enterprise Solutions
              </Link>
            </div>

            {/* Key differentiators - quick scan */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-charcoal-400">
              {[
                '8-Week Training Programs',
                '48-Hour Placement',
                'Global Visa Support'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
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
            SOCIAL PROOF BAR - Client Logos
            ============================================ */}
        <section className="py-12 bg-charcoal-900 border-y border-white/5">
          <div className="container mx-auto px-6 lg:px-12">
            <p className="text-center text-charcoal-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
              Our Professionals Work At
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-6">
              {['Deloitte', 'Capgemini', 'PwC', 'Accenture', 'Cognizant', 'Wipro', 'Infosys'].map((brand) => (
                <span
                  key={brand}
                  className="text-lg md:text-xl font-heading font-bold text-charcoal-600 hover:text-gold-500/80 transition-colors duration-500 cursor-default"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            VALUE PROPOSITION - Five Pillars
            ============================================ */}
        <section className="py-24 lg:py-32 bg-ivory relative overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(13,76,59,0.03)_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(201,169,97,0.03)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Our Pillars
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6 leading-tight">
                A Complete Ecosystem for{' '}
                <span className="text-forest-600">Technology Talent</span>
              </h2>
              <p className="text-lg text-charcoal-500 leading-relaxed">
                Five interconnected services designed to serve every stakeholder in the technology staffing industry.
              </p>
            </div>

            {/* Pillar Cards - Asymmetric Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Training Academy - Featured */}
              <Link
                href="/academy"
                className="lg:col-span-7 group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gold-500" />
                <div className="p-8 lg:p-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-xl bg-gold-50 flex items-center justify-center">
                      <GraduationCap size={28} className="text-gold-600" />
                    </div>
                    <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest bg-gold-50 px-3 py-1.5 rounded-full">
                      Premium Training
                    </span>
                  </div>
                  
                  <h3 className="text-2xl lg:text-3xl font-heading font-bold text-charcoal-900 mb-4 group-hover:text-gold-700 transition-colors">
                    Training Academy
                  </h3>
                  
                  <p className="text-charcoal-500 mb-6 leading-relaxed">
                    Transform your career in 8 weeks. Our intensive programs create industry-ready professionals who command premium salaries from Day 1.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { value: '8', label: 'Week Program' },
                      { value: '95%', label: 'Placement Rate' },
                      { value: '$120K', label: 'Avg. Salary' },
                    ].map((stat, i) => (
                      <div key={i} className="text-center p-3 bg-charcoal-50 rounded-lg">
                        <div className="text-xl font-heading font-bold text-charcoal-900">{stat.value}</div>
                        <div className="text-[10px] text-charcoal-500 uppercase tracking-wider">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 text-gold-600 font-bold uppercase tracking-wider text-xs">
                    Explore Programs
                    <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Recruiting Services */}
              <Link
                href="/solutions/staffing"
                className="lg:col-span-5 group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-forest-500" />
                <div className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-forest-50 flex items-center justify-center mb-5">
                    <Briefcase size={24} className="text-forest-600" />
                  </div>
                  
                  <h3 className="text-xl font-heading font-bold text-charcoal-900 mb-3 group-hover:text-forest-700 transition-colors">
                    Recruiting Services
                  </h3>
                  
                  <p className="text-charcoal-500 text-sm mb-4">
                    Access pre-vetted, deployment-ready professionals with verified credentials.
                  </p>
                  
                  <ul className="space-y-2 mb-4">
                    {['48-hour time to fill', '100% satisfaction guarantee'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-charcoal-600">
                        <CheckCircle2 size={12} className="text-forest-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center gap-2 text-forest-600 font-bold uppercase tracking-wider text-xs">
                    Find Talent <ChevronRight size={14} />
                  </div>
                </div>
              </Link>

              {/* Bench Sales */}
              <Link
                href="/careers/available-talent"
                className="lg:col-span-4 group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-500" />
                <div className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-5">
                    <UserCheck size={24} className="text-slate-600" />
                  </div>
                  
                  <h3 className="text-xl font-heading font-bold text-charcoal-900 mb-3 group-hover:text-slate-700 transition-colors">
                    Bench Sales
                  </h3>
                  
                  <p className="text-charcoal-500 text-sm mb-4">
                    Immediate access to available consultants. Project-ready with verified credentials.
                  </p>
                  
                  <div className="flex items-center gap-2 text-slate-600 font-bold uppercase tracking-wider text-xs">
                    View Bench <ChevronRight size={14} />
                  </div>
                </div>
              </Link>

              {/* Talent Acquisition */}
              <div className="lg:col-span-4 group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500 cursor-pointer">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                <div className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-5">
                    <Users size={24} className="text-emerald-600" />
                  </div>
                  
                  <h3 className="text-xl font-heading font-bold text-charcoal-900 mb-3 group-hover:text-emerald-700 transition-colors">
                    Talent Acquisition
                  </h3>
                  
                  <p className="text-charcoal-500 text-sm mb-4">
                    Proactive talent sourcing and pipeline management before you have openings.
                  </p>
                  
                  <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-wider text-xs">
                    Learn More <ChevronRight size={14} />
                  </div>
                </div>
              </div>

              {/* Cross-Border */}
              <Link
                href="/solutions/cross-border"
                className="lg:col-span-4 group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                <div className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-5">
                    <Globe size={24} className="text-purple-600" />
                  </div>
                  
                  <h3 className="text-xl font-heading font-bold text-charcoal-900 mb-3 group-hover:text-purple-700 transition-colors">
                    Cross-Border Solutions
                  </h3>
                  
                  <p className="text-charcoal-500 text-sm mb-4">
                    Visa sponsorship, relocation support, and global employment compliance.
                  </p>
                  
                  <div className="flex items-center gap-2 text-purple-600 font-bold uppercase tracking-wider text-xs">
                    Explore Services <ChevronRight size={14} />
                  </div>
                </div>
              </Link>

            </div>
          </div>
        </section>

        {/* ============================================
            WHY CHOOSE US - Differentiators
            ============================================ */}
        <section className="py-24 lg:py-32 bg-charcoal-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-forest-900/30 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-900/20 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Left - Content */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-px bg-gold-500" />
                  <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em]">
                    Why InTime
                  </span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6 leading-tight">
                  Built on{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                    Trust & Results
                  </span>
                </h2>
                
                <p className="text-lg text-charcoal-300 mb-10 leading-relaxed">
                  We don&apos;t just fill positions. We build careers, transform organizations, and create lasting partnerships.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      icon: ShieldCheck,
                      title: 'Quality First',
                      description: 'Rigorous 7-step vetting process. Only the top 3% reach our clients.'
                    },
                    {
                      icon: Clock,
                      title: 'Speed to Value',
                      description: '48-hour average time to present qualified candidates.'
                    },
                    {
                      icon: HandshakeIcon,
                      title: 'Partnership Model',
                      description: 'Long-term relationships over transactional deals.'
                    },
                    {
                      icon: Award,
                      title: 'Proven Results',
                      description: '98% client satisfaction. 1,200+ successful placements.'
                    }
                  ].map((item, i) => (
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
                  { value: stats.professionals.count, suffix: '+', label: 'Professionals Placed', icon: Users },
                  { value: stats.satisfaction.count, suffix: '%', label: 'Client Satisfaction', icon: Star },
                  { value: stats.placements.count, suffix: '+', label: 'Successful Placements', icon: TrendingUp },
                  { value: stats.countries.count, suffix: '', label: 'Countries Served', icon: Globe }
                ].map((stat, i) => (
                  <div 
                    key={i} 
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center"
                  >
                    <stat.icon size={24} className="text-gold-400 mx-auto mb-3" />
                    <div className="text-3xl md:text-4xl font-heading font-black text-white mb-1">
                      {stat.value.toLocaleString()}{stat.suffix}
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
            TESTIMONIALS
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
                Transformations That{' '}
                <span className="text-forest-600">Speak Volumes</span>
              </h2>
            </div>

            {/* Testimonial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  quote: "InTime&apos;s Academy transformed my career trajectory. From a career changer with no tech background to a Senior Developer at Deloitte in 10 weeks. The ROI was immediate.",
                  author: "Priya Sharma",
                  role: "Sr. Developer, Deloitte",
                  highlight: "$145K first-year salary",
                  type: "Graduate"
                },
                {
                  quote: "We&apos;ve hired 12 InTime professionals this year. Unlike other agencies, every candidate arrives with a verified portfolio we can inspect. The quality is unmatched.",
                  author: "Michael Chen",
                  role: "VP Engineering, Capgemini",
                  highlight: "48hr avg fill time",
                  type: "Enterprise Client"
                },
                {
                  quote: "The cross-border team handled my H1B transfer seamlessly. From India to a senior role in California in 90 days. They managed every detail of the process.",
                  author: "Raj Patel",
                  role: "Lead Developer, Oracle",
                  highlight: "Visa approved in 60 days",
                  type: "International Hire"
                }
              ].map((testimonial, i) => (
                <div
                  key={i}
                  className="group relative bg-ivory rounded-2xl p-8 border border-charcoal-100 hover:shadow-elevation-lg transition-all duration-500"
                >
                  {/* Type Badge */}
                  <div className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mb-4">
                    {testimonial.type}
                  </div>

                  {/* Quote Icon */}
                  <Quote size={28} className="text-gold-200 mb-4" />

                  {/* Quote Text */}
                  <p className="text-charcoal-700 leading-relaxed mb-6 text-[15px]">
                    {testimonial.quote}
                  </p>

                  {/* Highlight Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-50 text-forest-700 text-[10px] font-bold uppercase tracking-widest mb-6">
                    <Sparkles size={10} />
                    {testimonial.highlight}
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-6 border-t border-charcoal-100">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-bold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-charcoal-900">{testimonial.author}</div>
                      <div className="text-sm text-charcoal-500">{testimonial.role}</div>
                    </div>
                  </div>
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
                {' '}Your Future?
              </h2>
              <p className="text-xl text-forest-200 font-light max-w-2xl mx-auto mb-12">
                Whether you&apos;re launching your career, building your team, or scaling globally—we&apos;re your partner in excellence.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/academy"
                  className="group px-10 py-5 bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                >
                  <GraduationCap size={18} />
                  Start Your Journey
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

        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
