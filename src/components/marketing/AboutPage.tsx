'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Users,
  ArrowRight,
  Award,
  Globe,
  Lightbulb,
  Shield,
  Zap,
  Building2,
  MapPin,
  Linkedin,
  Quote,
  TrendingUp
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/templates';

const LEADERSHIP_TEAM = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Founder',
    initials: 'SC',
    bio: 'Former Guidewire executive with 15+ years in insurance technology.',
    linkedin: '#'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Chief Technology Officer',
    initials: 'MR',
    bio: 'Ex-Google engineer specializing in AI and cloud architecture.',
    linkedin: '#'
  },
  {
    name: 'Jennifer Williams',
    role: 'Chief Operating Officer',
    initials: 'JW',
    bio: 'Operations leader with experience scaling staffing firms.',
    linkedin: '#'
  },
  {
    name: 'David Park',
    role: 'VP of Training',
    initials: 'DP',
    bio: 'Certified Guidewire instructor with 500+ trained professionals.',
    linkedin: '#'
  }
];

const VALUES = [
  { 
    icon: Shield, 
    title: 'Integrity', 
    description: 'We operate with transparency and honesty in every interaction.',
    accent: 'forest'
  },
  { 
    icon: Zap, 
    title: 'Excellence', 
    description: 'Best, only the best, nothing but the best.',
    accent: 'gold'
  },
  { 
    icon: Users, 
    title: 'People First', 
    description: 'Our success is measured by the success of our people.',
    accent: 'forest'
  },
  { 
    icon: Lightbulb, 
    title: 'Innovation', 
    description: 'We continuously seek better ways to serve our clients and talent.',
    accent: 'gold'
  }
];

const MILESTONES = [
  { year: '2018', title: 'Founded', description: 'InTime Solutions launched with a vision to transform tech staffing.' },
  { year: '2019', title: 'Academy Launch', description: 'Created our flagship 8-week training program for Guidewire talent.' },
  { year: '2021', title: 'National Expansion', description: 'Expanded operations to serve clients across all 50 states.' },
  { year: '2023', title: 'AI Integration', description: 'Deployed AI-powered talent matching and cross-pollination engine.' },
  { year: '2024', title: '500+ Placements', description: 'Reached milestone of 500+ successful career transformations.' }
];

const IMPACT_STATS = [
  { value: '500+', label: 'Careers Transformed', icon: Users },
  { value: '95%', label: 'Placement Rate', icon: TrendingUp },
  { value: '50', label: 'States Covered', icon: Globe },
  { value: '98%', label: 'Client Satisfaction', icon: Award }
];

export const AboutPage: React.FC = () => {
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
        {/* Sophisticated Background - Forest + Gold balanced for About */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-[#0B1A14]" />
          
          {/* Organic gradient shapes - Forest + Gold balance */}
          <div 
            className="absolute top-0 right-0 w-[70%] h-[80%] rounded-bl-[40%]"
            style={{
              background: 'radial-gradient(ellipse at 70% 30%, rgba(13, 76, 59, 0.35) 0%, transparent 60%)',
            }}
          />
          <div 
            className="absolute bottom-0 left-0 w-[60%] h-[70%] rounded-tr-[50%]"
            style={{
              background: 'radial-gradient(ellipse at 20% 80%, rgba(201, 169, 97, 0.12) 0%, transparent 50%)',
            }}
          />
          <div 
            className="absolute top-[30%] left-[40%] w-[50%] h-[60%] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(13, 76, 59, 0.15) 0%, transparent 60%)',
            }}
          />
          
          {/* Subtle geometric accents */}
          <div 
            className="absolute top-[20%] right-[10%] w-[300px] h-[300px] border border-gold-500/10 rounded-full"
            style={{ transform: 'rotate(-15deg)' }}
          />
          <div 
            className="absolute bottom-[15%] left-[5%] w-[200px] h-[200px] border border-forest-500/10 rounded-full"
          />
          
          {/* Film grain texture */}
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
            
            {/* Badge */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex items-center gap-2 px-4 py-2 bg-forest-500/10 border border-forest-500/20 rounded-sm">
                <Building2 size={16} className="text-forest-400" />
                <span className="text-forest-400 text-xs font-bold uppercase tracking-widest">
                  Our Story
                </span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-charcoal-400 text-sm tracking-wide">
                Since <span className="text-gold-400 font-semibold">2018</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="mb-8">
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black text-white leading-[0.95] tracking-tight">
                Transforming Careers
              </span>
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black leading-[0.95] tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500">
                  Building Futures
                </span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-charcoal-300/90 font-light max-w-2xl mb-12 leading-relaxed">
              We&apos;re on a mission to bridge the gap between exceptional talent and transformative
              opportunities. Technology careers shouldn&apos;t be limited by circumstance—only ability.
            </p>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-16">
              <Link
                href="/careers"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold text-sm uppercase tracking-wider transition-all duration-300"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
              >
                <Users size={18} />
                Join Our Team
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 hover:border-gold-500/40 text-white hover:text-gold-400 font-medium text-sm uppercase tracking-wider transition-all duration-300"
              >
                <Building2 size={18} />
                Partner With Us
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-charcoal-400">
              {[
                '500+ Careers Transformed',
                '50 States Coverage',
                '95% Placement Rate'
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
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Our Story</span>
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
            MISSION SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-ivory relative overflow-hidden">
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(13,76,59,0.03)_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(201,169,97,0.03)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-px bg-gold-500" />
                    <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                      Our Mission
                    </span>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-8 leading-tight">
                    Empowering Talent,{' '}
                    <span className="text-forest-600">Enabling Success</span>
                  </h2>

                  <p className="text-lg text-charcoal-500 leading-relaxed mb-6">
                    Our mission is to transform the technology staffing industry by providing exceptional
                    training, placement, and support services that empower professionals to achieve their
                    career goals while helping organizations build world-class teams.
                  </p>

                  <p className="text-lg text-charcoal-500 leading-relaxed mb-8">
                    We believe that with the right training, mentorship, and opportunities, anyone can
                    build a rewarding career in technology. That&apos;s why we&apos;ve invested heavily in our
                    Academy program and our talent development initiatives.
                  </p>

                  <Link
                    href="/academy"
                    className="group inline-flex items-center gap-2 text-forest-600 font-bold uppercase tracking-wider text-xs"
                  >
                    Explore Our Academy
                    <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>

                {/* Stats Card */}
                <div className="relative">
                  <div className="bg-white rounded-2xl p-10 shadow-elevation-lg border border-charcoal-100/50 relative overflow-hidden">
                    {/* Accent bar */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gold-500 to-forest-500" />
                    
                    <div className="relative pl-4">
                      <div className="text-7xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-forest-600 to-gold-600 mb-4">
                        500+
                      </div>
                      <div className="text-xl font-medium text-charcoal-700 mb-8">Careers Transformed</div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center">
                            <Award size={24} className="text-gold-600" />
                          </div>
                          <div>
                            <div className="font-bold text-charcoal-900">95% Success Rate</div>
                            <div className="text-sm text-charcoal-500">Job placement within 90 days</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-forest-50 flex items-center justify-center">
                            <Globe size={24} className="text-forest-600" />
                          </div>
                          <div>
                            <div className="font-bold text-charcoal-900">50 States</div>
                            <div className="text-sm text-charcoal-500">Nationwide coverage</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center">
                            <TrendingUp size={24} className="text-gold-600" />
                          </div>
                          <div>
                            <div className="font-bold text-charcoal-900">$120K Average</div>
                            <div className="text-sm text-charcoal-500">First-year salary for graduates</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            VISION SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-charcoal-900 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-forest-600/15 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold-600/10 rounded-full blur-[80px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Section Header */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em]">
                  Our Vision
                </span>
                <div className="w-12 h-px bg-gold-500" />
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-8 leading-tight">
                The Future of{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                  Tech Talent
                </span>
              </h2>

              <p className="text-xl text-charcoal-300 leading-relaxed mb-12">
                We envision a world where geographic boundaries don&apos;t limit career opportunities,
                where talent is recognized for its potential, and where continuous learning is the
                pathway to success. By 2030, we aim to have transformed 10,000 careers and become
                the most trusted name in technology staffing and training.
              </p>

              {/* Vision Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { value: '10K', label: 'Careers to Transform' },
                  { value: '100+', label: 'Enterprise Partners' },
                  { value: 'Global', label: 'Reach by 2030' }
                ].map((stat, i) => (
                  <div 
                    key={i}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="text-4xl font-heading font-black text-gold-400 mb-2">{stat.value}</div>
                    <div className="text-charcoal-400 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            VALUES SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="max-w-3xl mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-px bg-gold-500" />
                  <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                    Our Values
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6">
                  What We <span className="text-forest-600">Stand For</span>
                </h2>
                <p className="text-lg text-charcoal-500 leading-relaxed">
                  These aren&apos;t just words on a wall. They&apos;re the principles that guide every decision, every hire, every partnership.
                </p>
              </div>

              {/* Values Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {VALUES.map((value, i) => {
                  const accentColors = {
                    forest: {
                      bar: 'bg-forest-500',
                      icon: 'bg-forest-50 text-forest-600',
                    },
                    gold: {
                      bar: 'bg-gold-500',
                      icon: 'bg-gold-50 text-gold-600',
                    }
                  };
                  const colors = accentColors[value.accent as keyof typeof accentColors];
                  
                  return (
                    <div 
                      key={i} 
                      className="group relative bg-ivory rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300"
                    >
                      {/* Accent bar */}
                      <div className={`absolute top-0 left-0 w-1 h-full ${colors.bar}`} />
                      
                      <div className="p-8">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${colors.icon}`}>
                          <value.icon size={28} />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-charcoal-900 mb-3">
                          {value.title}
                        </h3>
                        <p className="text-charcoal-500 leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            FOUNDER SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-ivory relative overflow-hidden">
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(13,76,59,0.03)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-charcoal-900 to-forest-950 rounded-2xl p-12 md:p-16 relative overflow-hidden">
                {/* Background accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-forest-500/10 rounded-full blur-3xl" />

                <div className="relative">
                  {/* Section indicator */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-px bg-gold-500" />
                    <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em]">
                      From Our Founder
                    </span>
                  </div>

                  <Quote size={40} className="text-gold-500/30 mb-6" />

                  <blockquote className="text-2xl md:text-3xl text-white font-light leading-relaxed mb-10">
                    &quot;When I started InTime, I had a simple belief: that everyone deserves access to
                    quality training and meaningful career opportunities. Too many talented individuals
                    are held back by circumstances, not ability. We&apos;re here to change that equation.&quot;
                  </blockquote>

                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-2xl font-heading font-bold text-charcoal-900">
                      SC
                    </div>
                    <div>
                      <div className="text-xl font-heading font-bold text-white">Sarah Chen</div>
                      <div className="text-charcoal-400">Founder & CEO, InTime Solutions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            LEADERSHIP TEAM
            ============================================ */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-12 h-px bg-gold-500" />
                  <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                    Leadership
                  </span>
                  <div className="w-12 h-px bg-gold-500" />
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6">
                  Meet the <span className="text-gold-500">Team</span>
                </h2>
                <p className="text-lg text-charcoal-500 max-w-2xl mx-auto">
                  The people driving InTime&apos;s mission forward.
                </p>
              </div>

              {/* Team Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {LEADERSHIP_TEAM.map((member, i) => (
                  <div 
                    key={i} 
                    className="group relative bg-ivory rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300"
                  >
                    {/* Accent bar */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${i % 2 === 0 ? 'bg-forest-500' : 'bg-gold-500'}`} />
                    
                    <div className="p-8 text-center">
                      <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-forest-100 to-gold-50 flex items-center justify-center mx-auto mb-6 text-3xl font-heading font-bold text-forest-600 group-hover:from-forest-200 group-hover:to-gold-100 transition-colors">
                        {member.initials}
                      </div>
                      <h3 className="text-lg font-heading font-bold text-charcoal-900 mb-1">
                        {member.name}
                      </h3>
                      <div className="text-sm text-forest-600 font-medium mb-4">
                        {member.role}
                      </div>
                      <p className="text-sm text-charcoal-500 mb-4">
                        {member.bio}
                      </p>
                      <a 
                        href={member.linkedin} 
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-charcoal-100 text-charcoal-600 hover:bg-forest-100 hover:text-forest-600 transition-colors"
                      >
                        <Linkedin size={18} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            TIMELINE / JOURNEY
            ============================================ */}
        <section className="py-24 lg:py-32 bg-ivory">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-12 h-px bg-gold-500" />
                  <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                    Our Journey
                  </span>
                  <div className="w-12 h-px bg-gold-500" />
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900">
                  Building <span className="text-forest-600">Momentum</span>
                </h2>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold-500 via-forest-500 to-gold-500" />

                {MILESTONES.map((milestone, i) => (
                  <div 
                    key={i} 
                    className={`relative flex items-start gap-8 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'} pl-20 md:pl-0`}>
                      <div className="group relative bg-white rounded-xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300 inline-block">
                        {/* Accent bar */}
                        <div className={`absolute top-0 ${i % 2 === 0 ? 'right-0' : 'left-0'} w-1 h-full ${i % 2 === 0 ? 'bg-gold-500' : 'bg-forest-500'}`} />
                        
                        <div className="p-6">
                          <div className={`text-sm font-bold uppercase tracking-widest mb-2 ${i % 2 === 0 ? 'text-gold-600' : 'text-forest-600'}`}>
                            {milestone.year}
                          </div>
                          <h3 className="text-lg font-heading font-bold text-charcoal-900 mb-2">
                            {milestone.title}
                          </h3>
                          <p className="text-charcoal-500 text-sm">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Timeline dot */}
                    <div className={`absolute left-8 md:left-1/2 w-4 h-4 rounded-full border-4 border-white shadow-md transform -translate-x-1/2 ${i % 2 === 0 ? 'bg-gold-500' : 'bg-forest-500'}`} />
                    
                    <div className="hidden md:block flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            LOCATIONS
            ============================================ */}
        <section className="py-24 lg:py-32 bg-charcoal-900 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-forest-600/15 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold-600/10 rounded-full blur-[80px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-5xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-12 h-px bg-gold-500" />
                  <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em]">
                    Our Presence
                  </span>
                  <div className="w-12 h-px bg-gold-500" />
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                    Nationwide
                  </span>{' '}
                  Coverage
                </h2>
              </div>

              {/* Locations Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { name: 'Headquarters', location: 'Dallas, TX' },
                  { name: 'East Coast', location: 'New York, NY' },
                  { name: 'West Coast', location: 'San Francisco, CA' }
                ].map((office, i) => (
                  <div 
                    key={i}
                    className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gold-500/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-gold-500/30 transition-colors">
                      <MapPin size={24} className="text-gold-400" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-white mb-2">{office.name}</h3>
                    <p className="text-charcoal-400">{office.location}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            CTA SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-gradient-to-br from-forest-900 via-charcoal-900 to-charcoal-950 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-forest-500/15 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-8 leading-tight">
                Ready to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                  Join Our Story
                </span>
                ?
              </h2>
              <p className="text-xl text-forest-200/80 font-light max-w-2xl mx-auto mb-12">
                Whether you&apos;re looking to transform your career or partner with us, we&apos;d love to hear from you.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/careers"
                  className="group px-10 py-5 bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                >
                  <Users size={18} />
                  View Careers
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/contact"
                  className="px-10 py-5 border border-white/20 hover:border-gold-500/40 text-white hover:text-gold-400 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                >
                  <Building2 size={18} />
                  Contact Us
                </Link>
              </div>

              {/* Impact stats */}
              <div className="flex flex-wrap justify-center gap-8 mt-16 pt-12 border-t border-white/10">
                {IMPACT_STATS.map((stat, i) => (
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

export default AboutPage;
