'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  Heart,
  ArrowRight,
  CheckCircle2,
  Clock,
  Rocket,
  Trophy,
  Target,
  Sparkles,
  GraduationCap,
  TrendingUp,
  Globe,
  UserPlus,
  Lightbulb,
  Shield
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/marketing/templates';

const CAREER_SECTIONS = [
  {
    icon: UserPlus,
    title: 'Join Our Team',
    description: "Be part of a company that's redefining technology staffing. Remote-first culture with unlimited growth potential.",
    href: '/careers/join-our-team',
    features: ['Remote-First Culture', 'Equity Options', 'Health Benefits', 'Career Growth'],
    accent: 'emerald',
    stat: { value: '4.8', label: 'Glassdoor' }
  },
  {
    icon: Briefcase,
    title: 'Open Positions',
    description: 'Browse current openings across recruiting, sales, engineering, and operations. Find your next chapter.',
    href: '/careers/open-positions',
    features: ['Recruiter Roles', 'Sales Positions', 'Engineering', 'Operations'],
    accent: 'forest',
    stat: { value: '12', label: 'Open Roles' }
  },
  {
    icon: Target,
    title: 'Available Talent',
    description: 'Access our pool of pre-vetted, deployment-ready professionals. Enterprise-grade talent available immediately.',
    href: '/careers/available-talent',
    features: ['Guidewire Experts', 'Cloud Architects', 'Data Engineers', 'Full-Stack Devs'],
    accent: 'gold',
    stat: { value: '500+', label: 'Consultants' }
  }
];

const VALUES = [
  { 
    icon: Trophy, 
    title: 'Excellence', 
    description: 'We never settle. Best, only the best, nothing but the best.',
    color: 'emerald'
  },
  { 
    icon: Users, 
    title: 'Collaboration', 
    description: 'Pods over silos. Great outcomes emerge from collective effort.',
    color: 'forest'
  },
  { 
    icon: Lightbulb, 
    title: 'Innovation', 
    description: 'We challenge convention and build what doesn&apos;t exist yet.',
    color: 'gold'
  },
  { 
    icon: Shield, 
    title: 'Integrity', 
    description: 'Honesty guides every decision. Trust is non-negotiable.',
    color: 'slate'
  }
];

const BENEFITS = [
  { icon: Globe, title: 'Remote-First', description: 'Work from anywhere in the world' },
  { icon: TrendingUp, title: 'Growth Path', description: 'Clear progression with mentorship' },
  { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive coverage for you and family' },
  { icon: GraduationCap, title: 'Learning Budget', description: '$2,500 annual professional development' },
  { icon: Clock, title: 'Flexible Hours', description: 'Results matter, not clock-watching' },
  { icon: Rocket, title: 'Equity Options', description: 'Own a piece of what you build' }
];

export const CareersHub: React.FC = () => {
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
        {/* Sophisticated Background - Emerald accent for Careers */}
        <div className="absolute inset-0">
          {/* Base gradient - deep, rich tones */}
          <div className="absolute inset-0 bg-[#0B1A14]" />
          
          {/* Organic gradient shapes - Emerald tints */}
          <div 
            className="absolute top-0 right-0 w-[70%] h-[80%] rounded-bl-[40%]"
            style={{
              background: 'radial-gradient(ellipse at 70% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)',
            }}
          />
          <div 
            className="absolute bottom-0 left-0 w-[60%] h-[70%] rounded-tr-[50%]"
            style={{
              background: 'radial-gradient(ellipse at 20% 80%, rgba(52, 211, 153, 0.08) 0%, transparent 50%)',
            }}
          />
          <div 
            className="absolute top-[40%] left-[30%] w-[40%] h-[50%] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(201, 169, 97, 0.05) 0%, transparent 60%)',
            }}
          />
          
          {/* Subtle geometric accents */}
          <div 
            className="absolute top-[20%] right-[10%] w-[300px] h-[300px] border border-emerald-500/10 rounded-full"
            style={{ transform: 'rotate(-15deg)' }}
          />
          <div 
            className="absolute bottom-[15%] left-[5%] w-[200px] h-[200px] border border-gold-500/10 rounded-full"
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
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
                <Rocket size={16} className="text-emerald-400" />
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                  Now Hiring
                </span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-charcoal-400 text-sm tracking-wide">
                <span className="text-emerald-400 font-semibold">12</span> open positions across 3 departments
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="mb-8">
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black text-white leading-[0.95] tracking-tight">
                Build Something
              </span>
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black leading-[0.95] tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500">
                  Extraordinary
                </span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-charcoal-300/90 font-light max-w-2xl mb-12 leading-relaxed">
              Join the team transforming how technology talent finds opportunity.
              Whether you&apos;re building our platform or building your career through us—this is where it starts.
            </p>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-16">
              <Link
                href="/careers/open-positions"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-charcoal-900 font-bold text-sm uppercase tracking-wider transition-all duration-300"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
              >
                <Briefcase size={18} />
                View Open Positions
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/careers/available-talent"
                className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 hover:border-emerald-500/40 text-white hover:text-emerald-400 font-medium text-sm uppercase tracking-wider transition-all duration-300"
              >
                <Target size={18} />
                Browse Available Talent
              </Link>
            </div>

            {/* Key benefits quick scan */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-charcoal-400">
              {[
                'Remote-First Culture',
                'Equity Participation',
                'Unlimited Growth'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-charcoal-500 hover:text-emerald-400 transition-colors cursor-pointer group"
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
            CAREER PATHS SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-ivory relative overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.03)_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(201,169,97,0.03)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Career Paths
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6 leading-tight">
                Your Next Chapter{' '}
                <span className="text-emerald-600">Starts Here</span>
              </h2>
              <p className="text-lg text-charcoal-500 leading-relaxed">
                Three distinct pathways to opportunity. Whether you&apos;re joining our mission or finding placement through us.
              </p>
            </div>

            {/* Career Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl">
              {CAREER_SECTIONS.map((section, i) => {
                const Icon = section.icon;
                const accentColors = {
                  emerald: {
                    bar: 'bg-emerald-500',
                    icon: 'bg-emerald-50 text-emerald-600',
                    hover: 'group-hover:text-emerald-700',
                    cta: 'text-emerald-600',
                    stat: 'bg-emerald-50 text-emerald-700'
                  },
                  forest: {
                    bar: 'bg-forest-500',
                    icon: 'bg-forest-50 text-forest-600',
                    hover: 'group-hover:text-forest-700',
                    cta: 'text-forest-600',
                    stat: 'bg-forest-50 text-forest-700'
                  },
                  gold: {
                    bar: 'bg-gold-500',
                    icon: 'bg-gold-50 text-gold-600',
                    hover: 'group-hover:text-gold-700',
                    cta: 'text-gold-600',
                    stat: 'bg-gold-50 text-gold-700'
                  }
                };
                const colors = accentColors[section.accent as keyof typeof accentColors];
                
                return (
                  <Link
                    key={i}
                    href={section.href}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500"
                  >
                    {/* Accent bar */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${colors.bar}`} />
                    
                    <div className="p-8">
                      {/* Header with icon and stat */}
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colors.icon}`}>
                          <Icon size={28} />
                        </div>
                        <div className={`text-center px-3 py-1.5 rounded-lg ${colors.stat}`}>
                          <div className="text-lg font-heading font-bold">{section.stat.value}</div>
                          <div className="text-[9px] font-bold uppercase tracking-wider opacity-70">{section.stat.label}</div>
                        </div>
                      </div>

                      <h3 className={`text-2xl font-heading font-bold text-charcoal-900 mb-3 ${colors.hover} transition-colors`}>
                        {section.title}
                      </h3>

                      <p className="text-charcoal-500 mb-6 leading-relaxed text-[15px]">
                        {section.description}
                      </p>

                      <ul className="space-y-2 mb-6">
                        {section.features.map((feature, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-charcoal-600">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <div className={`flex items-center gap-2 ${colors.cta} font-bold uppercase tracking-wider text-xs`}>
                        Explore
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
            BENEFITS SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
              
              {/* Left - Content */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-px bg-gold-500" />
                  <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                    Why InTime
                  </span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6 leading-tight">
                  More Than a{' '}
                  <span className="text-emerald-600">Paycheck</span>
                </h2>
                
                <p className="text-lg text-charcoal-500 mb-10 leading-relaxed">
                  We&apos;re building a company where ambitious people can do the best work of their careers.
                  The perks are nice—but the real benefit is being part of something meaningful.
                </p>

                <Link
                  href="/careers/join-our-team"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold text-sm uppercase tracking-wider transition-all duration-300"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                >
                  <Users size={18} />
                  Learn About Our Culture
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Right - Benefits Grid */}
              <div className="grid grid-cols-2 gap-4">
                {BENEFITS.map((benefit, i) => (
                  <div 
                    key={i}
                    className="group p-6 bg-ivory rounded-xl border border-charcoal-100 hover:shadow-elevation-md transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                      <benefit.icon size={20} className="text-emerald-600" />
                    </div>
                    <h4 className="font-bold text-charcoal-900 mb-1">{benefit.title}</h4>
                    <p className="text-sm text-charcoal-500">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            VALUES SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-charcoal-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/30 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-900/20 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em]">
                  Our Foundation
                </span>
                <div className="w-12 h-px bg-gold-500" />
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6">
                Values That{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">
                  Guide Us
                </span>
              </h2>
              <p className="text-lg text-charcoal-300">
                These aren&apos;t wall decorations. They&apos;re the filter for every hire, every decision, every action.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {VALUES.map((value, i) => {
                const colorMap = {
                  emerald: 'border-emerald-500/30 bg-emerald-500/10',
                  forest: 'border-forest-500/30 bg-forest-500/10',
                  gold: 'border-gold-500/30 bg-gold-500/10',
                  slate: 'border-slate-400/30 bg-slate-500/10'
                };
                const iconColorMap = {
                  emerald: 'text-emerald-400',
                  forest: 'text-forest-400',
                  gold: 'text-gold-400',
                  slate: 'text-slate-400'
                };
                
                return (
                  <div 
                    key={i} 
                    className={`bg-white/5 backdrop-blur-sm rounded-2xl p-8 border ${colorMap[value.color as keyof typeof colorMap]} text-center hover:bg-white/10 transition-all duration-300`}
                  >
                    <div className={`w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-6`}>
                      <value.icon size={28} className={iconColorMap[value.color as keyof typeof iconColorMap]} />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-white mb-3">
                      {value.title}
                    </h3>
                    <p className="text-charcoal-400 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================
            TESTIMONIAL SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-ivory relative overflow-hidden">
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.03)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-12">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Team Voices
                </span>
              </div>

              {/* Large Quote */}
              <div className="relative">
                <Sparkles size={32} className="text-emerald-200 mb-6" />
                
                <blockquote className="text-3xl md:text-4xl font-heading font-bold text-charcoal-900 leading-tight mb-8">
                  &quot;I joined InTime because I wanted to build, not just execute. Two years later, I&apos;ve helped shape our
                  entire recruiting process and grown a team of 8. This is what a meritocracy actually looks like.&quot;
                </blockquote>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                    AK
                  </div>
                  <div>
                    <div className="font-bold text-charcoal-900">Ananya Kumar</div>
                    <div className="text-charcoal-500">Director of Recruiting, 2 years at InTime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            CTA SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-gradient-to-br from-emerald-900 via-charcoal-900 to-charcoal-950 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-8 leading-tight">
                Ready to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">
                  Make Your Move
                </span>
                ?
              </h2>
              <p className="text-xl text-emerald-200/80 font-light max-w-2xl mx-auto mb-12">
                Whether you&apos;re looking to join our team or find your next opportunity through our network—the time is now.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/careers/open-positions"
                  className="group px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-charcoal-900 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                >
                  <Briefcase size={18} />
                  View Open Positions
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/careers/available-talent"
                  className="px-10 py-5 border border-white/20 hover:border-emerald-500/40 text-white hover:text-emerald-400 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                >
                  <Target size={18} />
                  Explore Available Talent
                </Link>
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap justify-center gap-8 mt-16 pt-12 border-t border-white/10">
                {[
                  { value: '4.8', label: 'Glassdoor Rating' },
                  { value: '92%', label: 'Employee Retention' },
                  { value: '18', label: 'Countries' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-heading font-black text-white">{stat.value}</div>
                    <div className="text-xs text-charcoal-500 uppercase tracking-wider">{stat.label}</div>
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

export default CareersHub;
