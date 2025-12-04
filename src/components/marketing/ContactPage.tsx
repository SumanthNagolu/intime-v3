'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Clock,
  MessageSquare,
  Building2,
  Users,
  Briefcase,
  Send,
  CheckCircle2,
  Globe,
  Calendar,
  Headphones,
  Sparkles
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/marketing/templates';

const CONTACT_OPTIONS = [
  {
    icon: Users,
    title: 'Hire Talent',
    description: 'Looking to build your technology team? Tell us about your staffing needs and timeline.',
    cta: 'Start Hiring',
    href: '/contact/hire',
    accent: 'gold'
  },
  {
    icon: Building2,
    title: 'Enterprise Solutions',
    description: 'Custom staffing programs, training academies, or consulting partnerships for your organization.',
    cta: 'Enterprise Inquiry',
    href: '/contact/enterprise',
    accent: 'forest'
  },
  {
    icon: MessageSquare,
    title: 'General Inquiry',
    description: 'Questions about our services, partnerships, career opportunities, or other topics.',
    cta: 'Get in Touch',
    href: '/contact/general',
    accent: 'amber'
  }
];

const GLOBAL_OFFICES = [
  {
    country: 'United States',
    flag: 'US',
    city: 'Dallas, TX',
    phone: '+1 307-650-2850',
    timezone: 'CST (UTC-6)'
  },
  {
    country: 'Canada',
    flag: 'CA',
    city: 'Toronto, ON',
    phone: '+1 289-236-9000',
    timezone: 'EST (UTC-5)'
  },
  {
    country: 'India',
    flag: 'IN',
    city: 'Hyderabad',
    phone: '+91 798-166-6144',
    timezone: 'IST (UTC+5:30)'
  }
];

const RESPONSE_TIMES = [
  { label: 'General Inquiries', time: '24 hours', icon: MessageSquare },
  { label: 'Hiring Requests', time: '4 hours', icon: Briefcase },
  { label: 'Enterprise', time: '2 hours', icon: Building2 },
  { label: 'Urgent Support', time: 'Immediate', icon: Headphones }
];

export const ContactPage: React.FC = () => {
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
        {/* Sophisticated Background - Warm Gold Emphasis */}
        <div className="absolute inset-0">
          {/* Base gradient - deep, rich tones */}
          <div className="absolute inset-0 bg-[#0B1A14]" />
          
          {/* Warm gold radial - hero emphasis */}
          <div 
            className="absolute top-[10%] right-[15%] w-[60%] h-[70%]"
            style={{
              background: 'radial-gradient(ellipse at 60% 40%, rgba(201, 169, 97, 0.15) 0%, transparent 55%)',
            }}
          />
          
          {/* Secondary forest accent */}
          <div 
            className="absolute bottom-0 left-0 w-[50%] h-[60%] rounded-tr-[50%]"
            style={{
              background: 'radial-gradient(ellipse at 20% 80%, rgba(13, 76, 59, 0.25) 0%, transparent 50%)',
            }}
          />
          
          {/* Tertiary amber warmth */}
          <div 
            className="absolute top-[40%] left-[30%] w-[400px] h-[400px]"
            style={{
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 60%)',
            }}
          />
          
          {/* Subtle geometric accents */}
          <div 
            className="absolute top-[15%] right-[8%] w-[280px] h-[280px] border border-gold-500/15"
            style={{ transform: 'rotate(15deg)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }}
          />
          <div 
            className="absolute bottom-[20%] left-[10%] w-[180px] h-[180px] border border-amber-500/10 rounded-full"
          />
          
          {/* Film grain texture for authenticity */}
          <div 
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            
            {/* Trust indicator */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gold-500/10 border border-gold-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-gold-400 text-xs font-bold uppercase tracking-widest">
                  Available Now
                </span>
              </div>
              <div className="h-5 w-px bg-white/20" />
              <span className="text-charcoal-400 text-sm">
                <span className="text-gold-400 font-semibold">4hr</span> average response time
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="mb-8">
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black text-white leading-[0.95] tracking-tight">
                Let&apos;s Build
              </span>
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black leading-[0.95] tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-amber-400 to-gold-500">
                  Something Great
                </span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-charcoal-300/90 font-light max-w-2xl mb-12 leading-relaxed">
              Whether you need world-class talent, enterprise solutions, or career guidance—we&apos;re here.
              Real people, real conversations, real results.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-8 mb-12">
              {[
                { value: '2,500+', label: 'Professionals Connected' },
                { value: '98%', label: 'Client Satisfaction' },
                { value: '18', label: 'Countries Served' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-heading font-black text-white">{stat.value}</div>
                  <div className="text-xs text-charcoal-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="#contact-options"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToContent();
                }}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold text-sm uppercase tracking-wider transition-all duration-300"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
              >
                <Send size={18} />
                Choose Your Path
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="mailto:info@intimeesolutions.com"
                className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 hover:border-gold-500/40 text-white hover:text-gold-400 font-medium text-sm uppercase tracking-wider transition-all duration-300"
              >
                <Mail size={18} />
                Direct Email
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-charcoal-500 hover:text-gold-400 transition-colors cursor-pointer group"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Explore Options</span>
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
        id="contact-options"
        className="relative"
        style={{
          transform: `translateY(${Math.max(0, (1 - scrollProgress) * -50)}px)`,
          opacity: 0.3 + (scrollProgress * 0.7),
        }}
      >
        
        {/* ============================================
            RESPONSE TIME BAR
            ============================================ */}
        <section className="py-10 bg-charcoal-900 border-y border-white/5">
          <div className="container mx-auto px-6 lg:px-12">
            <p className="text-center text-charcoal-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
              Average Response Times
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
              {RESPONSE_TIMES.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <Icon size={16} className="text-gold-500" />
                    <span className="text-charcoal-400 text-sm">
                      {item.label}: <span className="text-gold-400 font-semibold">{item.time}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================
            CONTACT OPTIONS - Main CTA Cards
            ============================================ */}
        <section className="py-24 lg:py-32 bg-ivory relative overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(201,169,97,0.04)_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.03)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                  How Can We Help?
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6 leading-tight">
                Start the{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-amber-500">
                  Conversation
                </span>
              </h2>
              <p className="text-lg text-charcoal-500 leading-relaxed">
                Select the option that best describes your needs. Each pathway leads to specialists who can help immediately.
              </p>
            </div>

            {/* Contact Option Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl">
              {CONTACT_OPTIONS.map((option, i) => {
                const Icon = option.icon;
                const accentColors = {
                  gold: {
                    bar: 'bg-gold-500',
                    icon: 'bg-gold-50 text-gold-600',
                    badge: 'bg-gold-50 text-gold-700',
                    cta: 'bg-gold-500 hover:bg-gold-400 text-charcoal-900'
                  },
                  forest: {
                    bar: 'bg-forest-500',
                    icon: 'bg-forest-50 text-forest-600',
                    badge: 'bg-forest-50 text-forest-700',
                    cta: 'bg-forest-600 hover:bg-forest-500 text-white'
                  },
                  amber: {
                    bar: 'bg-amber-500',
                    icon: 'bg-amber-50 text-amber-600',
                    badge: 'bg-amber-50 text-amber-700',
                    cta: 'bg-amber-500 hover:bg-amber-400 text-charcoal-900'
                  }
                };
                const colors = accentColors[option.accent as keyof typeof accentColors];
                
                return (
                  <div
                    key={i}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500"
                  >
                    {/* Left accent bar */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${colors.bar}`} />
                    
                    <div className="p-8 pl-10">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-xl ${colors.icon} flex items-center justify-center mb-6`}>
                        <Icon size={28} />
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-heading font-bold text-charcoal-900 mb-4 group-hover:text-charcoal-700 transition-colors">
                        {option.title}
                      </h3>

                      {/* Description */}
                      <p className="text-charcoal-500 mb-8 leading-relaxed">
                        {option.description}
                      </p>

                      {/* CTA */}
                      <Link
                        href={option.href}
                        className={`inline-flex items-center gap-2 px-6 py-3 ${colors.cta} font-bold uppercase tracking-widest text-xs transition-all duration-300`}
                        style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                      >
                        {option.cta}
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================
            GLOBAL PRESENCE
            ============================================ */}
        <section className="py-24 lg:py-32 bg-charcoal-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-900/15 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-forest-900/20 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              
              {/* Left - Global Offices */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-px bg-gold-500" />
                  <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em]">
                    Global Presence
                  </span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6 leading-tight">
                  Wherever You Are,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-400">
                    We&apos;re There
                  </span>
                </h2>
                
                <p className="text-lg text-charcoal-300 mb-10 leading-relaxed">
                  With offices across three continents, we provide local expertise with global reach. 
                  Connect with the team nearest to you.
                </p>

                {/* Office Cards */}
                <div className="space-y-4">
                  {GLOBAL_OFFICES.map((office, i) => (
                    <div 
                      key={i}
                      className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-gold-500/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                            <Globe size={20} className="text-gold-400" />
                          </div>
                          <div>
                            <div className="font-bold text-white">{office.country}</div>
                            <div className="text-sm text-charcoal-400">{office.city}</div>
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest">
                          {office.timezone}
                        </div>
                      </div>
                      
                      <a 
                        href={`tel:${office.phone}`}
                        className="flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors"
                      >
                        <Phone size={14} />
                        <span className="font-medium">{office.phone}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Direct Contact Card */}
              <div className="lg:sticky lg:top-32">
                <div className="bg-gradient-to-br from-charcoal-800 to-forest-900/50 rounded-2xl p-8 lg:p-10 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles size={20} className="text-gold-400" />
                    <span className="text-gold-400 text-xs font-bold uppercase tracking-widest">
                      Quick Connect
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-heading font-bold text-white mb-6">
                    Direct Contact Information
                  </h3>

                  <div className="space-y-6 mb-8">
                    {/* Email */}
                    <a 
                      href="mailto:info@intimeesolutions.com" 
                      className="group flex items-center gap-4 text-charcoal-300 hover:text-gold-400 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center group-hover:bg-gold-500/20 transition-colors">
                        <Mail size={20} className="text-gold-400" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest mb-1">
                          General Email
                        </div>
                        <div className="font-medium">info@intimeesolutions.com</div>
                      </div>
                    </a>

                    {/* Phone */}
                    <a 
                      href="tel:+1-307-650-2850" 
                      className="group flex items-center gap-4 text-charcoal-300 hover:text-gold-400 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center group-hover:bg-gold-500/20 transition-colors">
                        <Phone size={20} className="text-gold-400" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest mb-1">
                          Main Line
                        </div>
                        <div className="font-medium">+1 307-650-2850</div>
                      </div>
                    </a>

                    {/* Address */}
                    <div className="flex items-center gap-4 text-charcoal-300">
                      <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
                        <MapPin size={20} className="text-gold-400" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest mb-1">
                          Headquarters
                        </div>
                        <div className="font-medium">Dallas, Texas, USA</div>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="flex items-center gap-4 text-charcoal-300">
                      <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
                        <Clock size={20} className="text-gold-400" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest mb-1">
                          Business Hours
                        </div>
                        <div className="font-medium">Mon-Fri, 9AM-6PM CT</div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 animate-pulse" />
                      <div>
                        <div className="text-sm text-charcoal-400 mb-1">
                          For urgent staffing needs or time-sensitive matters:
                        </div>
                        <a 
                          href="mailto:urgent@intimeesolutions.com"
                          className="text-gold-400 font-bold hover:text-gold-300 transition-colors"
                        >
                          urgent@intimeesolutions.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            WHY CONTACT US - Trust Signals
            ============================================ */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                  What to Expect
                </span>
                <div className="w-12 h-px bg-gold-500" />
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6">
                When You{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-amber-500">
                  Reach Out
                </span>
              </h2>
              <p className="text-lg text-charcoal-500">
                We believe in real connections. Here&apos;s what happens when you contact InTime.
              </p>
            </div>

            {/* Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: '01',
                  title: 'Quick Response',
                  description: 'A real team member responds within 4 hours—not a bot, not next week.',
                  icon: Clock
                },
                {
                  step: '02',
                  title: 'Discovery Call',
                  description: 'We schedule a brief call to understand your unique needs and goals.',
                  icon: Calendar
                },
                {
                  step: '03',
                  title: 'Custom Solution',
                  description: 'Our specialists craft a tailored approach based on your requirements.',
                  icon: Sparkles
                },
                {
                  step: '04',
                  title: 'Ongoing Support',
                  description: 'Long after the initial engagement, we remain your partner in success.',
                  icon: CheckCircle2
                }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="relative">
                    {/* Connector line */}
                    {i < 3 && (
                      <div className="hidden md:block absolute top-8 left-[60%] w-full h-px bg-gradient-to-r from-gold-200 to-transparent" />
                    )}
                    
                    <div className="text-center">
                      {/* Step number */}
                      <div className="text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-4">
                        Step {item.step}
                      </div>
                      
                      {/* Icon */}
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold-50 to-amber-50 flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Icon size={28} className="text-gold-600" />
                      </div>
                      
                      {/* Content */}
                      <h3 className="text-lg font-heading font-bold text-charcoal-900 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-sm text-charcoal-500 leading-relaxed">
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
            FINAL CTA
            ============================================ */}
        <section className="py-24 lg:py-32 bg-gradient-to-br from-gold-600 via-amber-500 to-gold-500 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-600/30 rounded-full blur-[80px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-charcoal-900 mb-8 leading-tight">
                Ready When You Are
              </h2>
              <p className="text-xl text-charcoal-800 font-light max-w-2xl mx-auto mb-12">
                No pressure, no hard sell. Just a conversation about how we can help you achieve your goals.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/contact/general"
                  className="group px-10 py-5 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                >
                  <Send size={18} />
                  Start a Conversation
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="tel:+1-307-650-2850"
                  className="px-10 py-5 border-2 border-charcoal-900/30 hover:border-charcoal-900 text-charcoal-900 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                >
                  <Phone size={18} />
                  Call Us Direct
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default ContactPage;
