'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Video,
  Download,
  ArrowRight,
  ArrowDown,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  Clock,
  Award,
  ChevronRight,
  Play,
  ExternalLink,
  Mail,
  Bookmark
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/templates';

const RESOURCE_CATEGORIES = [
  {
    icon: FileText,
    title: 'Blog & Articles',
    description: 'Industry insights, career advice, and technology trends from our experts.',
    href: '/resources/blog',
    count: '50+ articles',
    accent: 'slate'
  },
  {
    icon: Video,
    title: 'Webinars',
    description: 'On-demand and live webinars covering Guidewire, cloud, and career development.',
    href: '/resources/webinars',
    count: '20+ recordings',
    accent: 'teal'
  },
  {
    icon: Download,
    title: 'Guides & eBooks',
    description: 'Comprehensive guides on Guidewire certification, career transitions, and more.',
    href: '/resources/guides',
    count: '10+ downloads',
    accent: 'gold'
  },
  {
    icon: Calendar,
    title: 'Events',
    description: 'Industry conferences, meetups, and InTime-hosted events.',
    href: '/resources/events',
    count: 'Upcoming events',
    accent: 'forest'
  }
];

const FEATURED_RESOURCES = [
  {
    type: 'Guide',
    title: 'The Complete Guidewire Career Guide 2024',
    description: 'Everything you need to know about starting and growing a Guidewire career. From certification paths to salary expectations.',
    readTime: '15 min read',
    downloads: '2,400+',
    accent: 'slate'
  },
  {
    type: 'Webinar',
    title: 'From Zero to $150K: Career Transformation Stories',
    description: 'Hear from graduates who transformed their careers through InTime Academy. Real stories, real results.',
    duration: '45 min',
    views: '1,800+',
    accent: 'teal'
  },
  {
    type: 'Article',
    title: 'Top 10 Guidewire Interview Questions',
    description: 'Prepare for your next Guidewire interview with these common questions and expert answers.',
    readTime: '8 min read',
    saves: '3,200+',
    accent: 'gold'
  }
];

const LATEST_ARTICLES = [
  {
    category: 'Career',
    title: 'Why 2024 is the Year to Enter Guidewire',
    excerpt: 'Market analysis shows unprecedented demand for certified professionals.',
    date: 'Nov 20, 2024'
  },
  {
    category: 'Technical',
    title: 'Understanding Guidewire Cloud Architecture',
    excerpt: 'A deep dive into the infrastructure powering modern insurance platforms.',
    date: 'Nov 15, 2024'
  },
  {
    category: 'Industry',
    title: 'Digital Transformation in P&C Insurance',
    excerpt: 'How leading carriers are leveraging technology for competitive advantage.',
    date: 'Nov 10, 2024'
  },
  {
    category: 'Training',
    title: 'Maximizing Your Learning: Study Tips for Certification',
    excerpt: 'Proven strategies from successful InTime Academy graduates.',
    date: 'Nov 5, 2024'
  }
];

export const ResourcesHub: React.FC = () => {
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

  const getAccentClasses = (accent: string) => {
    switch (accent) {
      case 'slate':
        return {
          bar: 'bg-slate-500',
          bg: 'bg-slate-100',
          bgHover: 'group-hover:bg-slate-600',
          text: 'text-slate-600',
          textHover: 'group-hover:text-slate-700'
        };
      case 'teal':
        return {
          bar: 'bg-teal-500',
          bg: 'bg-teal-50',
          bgHover: 'group-hover:bg-teal-600',
          text: 'text-teal-600',
          textHover: 'group-hover:text-teal-700'
        };
      case 'gold':
        return {
          bar: 'bg-gold-500',
          bg: 'bg-gold-50',
          bgHover: 'group-hover:bg-gold-600',
          text: 'text-gold-600',
          textHover: 'group-hover:text-gold-700'
        };
      case 'forest':
        return {
          bar: 'bg-forest-500',
          bg: 'bg-forest-50',
          bgHover: 'group-hover:bg-forest-600',
          text: 'text-forest-600',
          textHover: 'group-hover:text-forest-700'
        };
      default:
        return {
          bar: 'bg-slate-500',
          bg: 'bg-slate-100',
          bgHover: 'group-hover:bg-slate-600',
          text: 'text-slate-600',
          textHover: 'group-hover:text-slate-700'
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
        {/* Sophisticated Background - Slate/Teal tones for knowledge/resources */}
        <div className="absolute inset-0">
          {/* Base gradient - deep, professional tones */}
          <div className="absolute inset-0 bg-[#0B1A14]" />
          
          {/* Organic gradient shapes - Slate/Teal emphasis */}
          <div 
            className="absolute top-0 right-0 w-[70%] h-[80%] rounded-bl-[40%]"
            style={{
              background: 'radial-gradient(ellipse at 70% 30%, rgba(45, 62, 80, 0.5) 0%, transparent 60%)',
            }}
          />
          <div 
            className="absolute bottom-0 left-0 w-[60%] h-[70%] rounded-tr-[50%]"
            style={{
              background: 'radial-gradient(ellipse at 20% 80%, rgba(20, 184, 166, 0.12) 0%, transparent 50%)',
            }}
          />
          <div 
            className="absolute top-[40%] left-[30%] w-[40%] h-[50%]"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(201, 169, 97, 0.06) 0%, transparent 60%)',
            }}
          />
          
          {/* Subtle geometric accents */}
          <div 
            className="absolute top-[15%] right-[8%] w-[250px] h-[250px] border border-slate-500/15 rounded-full"
            style={{ transform: 'rotate(-20deg)' }}
          />
          <div 
            className="absolute bottom-[20%] left-[8%] w-[180px] h-[180px] border border-teal-500/10 rounded-full"
          />
          <div 
            className="absolute top-[60%] right-[25%] w-[120px] h-[120px] border border-gold-500/10"
            style={{ transform: 'rotate(15deg)' }}
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
            
            {/* Trust indicator - knowledge stats */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <BookOpen size={14} className="text-teal-400" />
                <span className="text-charcoal-400 text-sm">
                  <span className="text-teal-400 font-semibold">80+</span> Free Resources
                </span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-charcoal-400 text-sm tracking-wide">
                Updated <span className="text-slate-400 font-semibold">Weekly</span>
              </span>
            </div>

            {/* Main Headline - Distinctive typography */}
            <h1 className="mb-8">
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black text-white leading-[0.95] tracking-tight">
                Knowledge That
              </span>
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black leading-[0.95] tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-teal-400 to-slate-400">
                  Accelerates Careers
                </span>
              </span>
            </h1>

            {/* Subheadline - Refined, purposeful */}
            <p className="text-lg md:text-xl text-charcoal-300/90 font-light max-w-2xl mb-12 leading-relaxed">
              Expert-crafted guides, webinars, and insights to help you master 
              Guidewire and advance your technology career. All resources, completely free.
            </p>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-16">
              <Link
                href="/resources/guides"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-charcoal-900 font-bold text-sm uppercase tracking-wider transition-all duration-300"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
              >
                <Download size={18} />
                Browse Guides
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/resources/webinars"
                className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 hover:border-teal-500/40 text-white hover:text-teal-400 font-medium text-sm uppercase tracking-wider transition-all duration-300"
              >
                <Play size={18} />
                Watch Webinars
              </Link>
            </div>

            {/* Quick stats - resource categories */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-charcoal-400">
              {[
                { icon: FileText, label: '50+ Articles' },
                { icon: Video, label: '20+ Webinars' },
                { icon: Download, label: '10+ Guides' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon size={14} className="text-slate-500" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-charcoal-500 hover:text-teal-400 transition-colors cursor-pointer group"
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
            RESOURCE CATEGORIES - Card Grid
            ============================================ */}
        <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(45,62,80,0.03)_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(20,184,166,0.03)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-slate-500" />
                <span className="text-slate-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Resource Library
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6 leading-tight">
                Find What You{' '}
                <span className="text-teal-600">Need</span>
              </h2>
              <p className="text-lg text-charcoal-500 leading-relaxed">
                Curated content across four categories to support every stage of your career journey.
              </p>
            </div>

            {/* Category Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl">
              {RESOURCE_CATEGORIES.map((category, i) => {
                const Icon = category.icon;
                const accent = getAccentClasses(category.accent);
                return (
                  <Link
                    key={i}
                    href={category.href}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500"
                  >
                    {/* Left accent bar */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${accent.bar}`} />
                    
                    <div className="p-8">
                      <div className={`w-14 h-14 rounded-xl ${accent.bg} flex items-center justify-center mb-6 ${accent.bgHover} group-hover:text-white ${accent.text} transition-all duration-300`}>
                        <Icon size={24} />
                      </div>

                      <h3 className={`text-lg font-heading font-bold text-charcoal-900 mb-2 ${accent.textHover} transition-colors`}>
                        {category.title}
                      </h3>

                      <p className="text-charcoal-500 text-sm mb-4 leading-relaxed">
                        {category.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-charcoal-100">
                        <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest">
                          {category.count}
                        </span>
                        <ChevronRight size={16} className={`${accent.text} group-hover:translate-x-1 transition-transform`} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================
            FEATURED RESOURCES - Premium Highlights
            ============================================ */}
        <section className="py-24 lg:py-32 bg-charcoal-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-800/30 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-900/20 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-teal-500" />
                <span className="text-teal-400 text-xs font-bold uppercase tracking-[0.2em]">
                  Most Popular
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6 leading-tight">
                Featured{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-slate-300">
                  Resources
                </span>
              </h2>
              <p className="text-lg text-charcoal-300 leading-relaxed">
                Our highest-rated content, chosen by thousands of learners.
              </p>
            </div>

            {/* Featured Cards - Asymmetric Layout */}
            <div className="grid lg:grid-cols-12 gap-6">
              
              {/* Main Featured - Larger Card */}
              <div className="lg:col-span-7 group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-teal-500/30 transition-all duration-500">
                <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
                
                <div className="p-8 lg:p-10">
                  {/* Type Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                    <Download size={12} />
                    {FEATURED_RESOURCES[0].type}
                  </div>

                  <h3 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-4 group-hover:text-teal-400 transition-colors">
                    {FEATURED_RESOURCES[0].title}
                  </h3>

                  <p className="text-charcoal-300 mb-8 leading-relaxed">
                    {FEATURED_RESOURCES[0].description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="flex items-center gap-2 text-sm text-charcoal-400">
                      <Clock size={14} className="text-teal-500" />
                      {FEATURED_RESOURCES[0].readTime}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-charcoal-400">
                      <Download size={14} className="text-teal-500" />
                      {FEATURED_RESOURCES[0].downloads} downloads
                    </div>
                  </div>

                  <Link
                    href="/resources/guides"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-charcoal-900 font-bold text-sm uppercase tracking-wider transition-all duration-300"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                  >
                    Download Guide
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Secondary Featured Cards */}
              <div className="lg:col-span-5 space-y-6">
                {FEATURED_RESOURCES.slice(1).map((resource, i) => {
                  const accent = getAccentClasses(resource.accent);
                  return (
                    <div 
                      key={i}
                      className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-slate-500/30 transition-all duration-500"
                    >
                      <div className={`absolute top-0 left-0 w-1 h-full ${accent.bar}`} />
                      
                      <div className="p-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ${accent.text} text-[10px] font-bold uppercase tracking-widest mb-4`}>
                          {resource.type === 'Webinar' ? <Play size={12} /> : <FileText size={12} />}
                          {resource.type}
                        </div>

                        <h4 className="text-lg font-heading font-bold text-white mb-2 group-hover:text-slate-300 transition-colors">
                          {resource.title}
                        </h4>

                        <p className="text-charcoal-400 text-sm mb-4">
                          {resource.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-charcoal-500">
                            {resource.type === 'Webinar' ? (
                              <>
                                <Play size={12} className="text-slate-500" />
                                {resource.duration}
                              </>
                            ) : (
                              <>
                                <Clock size={12} className="text-gold-500" />
                                {resource.readTime}
                              </>
                            )}
                          </div>
                          <ChevronRight size={16} className={`${accent.text} group-hover:translate-x-1 transition-transform`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            LATEST ARTICLES - Blog Preview
            ============================================ */}
        <section className="py-24 lg:py-32 bg-ivory relative overflow-hidden">
          {/* Subtle background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(45,62,80,0.02)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid lg:grid-cols-12 gap-16">
              
              {/* Left - Section Info */}
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-px bg-slate-500" />
                    <span className="text-slate-600 text-xs font-bold uppercase tracking-[0.2em]">
                      Latest Insights
                    </span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6 leading-tight">
                    Fresh From{' '}
                    <span className="text-slate-600">The Blog</span>
                  </h2>
                  
                  <p className="text-lg text-charcoal-500 leading-relaxed mb-8">
                    Stay ahead with the latest industry trends, career advice, and technical deep-dives.
                  </p>

                  <Link
                    href="/resources/blog"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold text-sm uppercase tracking-wider transition-all duration-300"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                  >
                    <FileText size={16} />
                    View All Articles
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Right - Article List */}
              <div className="lg:col-span-8">
                <div className="space-y-4">
                  {LATEST_ARTICLES.map((article, i) => (
                    <Link
                      key={i}
                      href="/resources/blog"
                      className="group relative block bg-white rounded-xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500"
                    >
                      {/* Accent bar - alternating colors */}
                      <div className={`absolute top-0 left-0 w-1 h-full ${
                        i % 4 === 0 ? 'bg-slate-500' :
                        i % 4 === 1 ? 'bg-teal-500' :
                        i % 4 === 2 ? 'bg-gold-500' : 'bg-forest-500'
                      }`} />
                      
                      <div className="p-6 flex items-start gap-6">
                        {/* Article Number */}
                        <div className="hidden sm:flex w-12 h-12 rounded-lg bg-charcoal-50 items-center justify-center shrink-0">
                          <span className="text-lg font-heading font-bold text-charcoal-300">
                            0{i + 1}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${
                              article.category === 'Career' ? 'text-slate-600' :
                              article.category === 'Technical' ? 'text-teal-600' :
                              article.category === 'Industry' ? 'text-gold-600' : 'text-forest-600'
                            }`}>
                              {article.category}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-charcoal-300" />
                            <span className="text-[10px] text-charcoal-400">{article.date}</span>
                          </div>

                          <h4 className="text-lg font-heading font-bold text-charcoal-900 mb-2 group-hover:text-slate-600 transition-colors">
                            {article.title}
                          </h4>

                          <p className="text-charcoal-500 text-sm">
                            {article.excerpt}
                          </p>
                        </div>

                        {/* Arrow */}
                        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-charcoal-50 group-hover:bg-slate-100 transition-colors shrink-0">
                          <ArrowRight size={16} className="text-charcoal-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            NEWSLETTER CTA - Dark Section
            ============================================ */}
        <section className="py-24 lg:py-32 bg-slate-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-slate-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Left - Content */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-px bg-teal-500" />
                    <span className="text-teal-400 text-xs font-bold uppercase tracking-[0.2em]">
                      Stay Informed
                    </span>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6 leading-tight">
                    Weekly{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-slate-300">
                      Insights
                    </span>
                  </h2>

                  <p className="text-lg text-charcoal-300 leading-relaxed">
                    Get the latest resources, industry trends, and career tips delivered 
                    directly to your inbox. No spam, just valuable content.
                  </p>

                  <div className="flex items-center gap-6 mt-8 text-sm text-charcoal-400">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-teal-500" />
                      <span>4,500+ subscribers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award size={14} className="text-teal-500" />
                      <span>Top 10% open rate</span>
                    </div>
                  </div>
                </div>

                {/* Right - Form */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-charcoal-400 uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 text-white placeholder-charcoal-500 focus:outline-none focus:border-teal-500/50 transition-colors"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 98% 100%, 0% 100%)' }}
                      />
                    </div>

                    <button 
                      className="w-full px-8 py-4 bg-teal-500 hover:bg-teal-400 text-charcoal-900 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-3"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 98% 100%, 0% 100%)' }}
                    >
                      <Mail size={16} />
                      Subscribe Now
                      <ArrowRight size={14} />
                    </button>

                    <p className="text-xs text-charcoal-500 text-center">
                      Unsubscribe anytime. We respect your privacy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default ResourcesHub;
