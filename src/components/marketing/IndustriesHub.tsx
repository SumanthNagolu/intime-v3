'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Monitor,
  Heart,
  Building2,
  Factory,
  Cog,
  Brain,
  Scale,
  Warehouse,
  Truck,
  UtensilsCrossed,
  Users,
  Wifi,
  Car,
  ShoppingBag,
  Landmark,
  ArrowRight,
  CheckCircle2,
  Layers,
  ChevronRight,
  Globe,
  TrendingUp,
  Shield,
  Clock,
  Briefcase
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/templates';

const INDUSTRIES = [
  { icon: Monitor, title: 'Information Technology', href: '/industries/information-technology', description: 'Software development, cloud architecture, cybersecurity, and enterprise systems integration', accent: 'slate' },
  { icon: Heart, title: 'Healthcare', href: '/industries/healthcare', description: 'Clinical systems, health IT infrastructure, EMR/EHR, and medical device software', accent: 'blue' },
  { icon: Cog, title: 'Engineering', href: '/industries/engineering', description: 'Mechanical, electrical, civil engineering, and CAD/CAM specialists', accent: 'slate' },
  { icon: Factory, title: 'Manufacturing', href: '/industries/manufacturing', description: 'Production optimization, operations technology, and supply chain systems', accent: 'blue' },
  { icon: Building2, title: 'Financial Services', href: '/industries/financial-accounting', description: 'Banking technology, insurance platforms, and regulatory compliance systems', accent: 'slate' },
  { icon: Brain, title: 'AI/ML & Data Science', href: '/industries/ai-ml-data', description: 'Machine learning engineering, data analytics, and AI infrastructure', accent: 'blue' },
  { icon: Scale, title: 'Legal Technology', href: '/industries/legal', description: 'Legal tech platforms, eDiscovery, and compliance automation', accent: 'slate' },
  { icon: Warehouse, title: 'Warehouse & Distribution', href: '/industries/warehouse-distribution', description: 'WMS systems, inventory optimization, and fulfillment automation', accent: 'blue' },
  { icon: Truck, title: 'Logistics & Transportation', href: '/industries/logistics', description: 'TMS platforms, route optimization, and fleet management systems', accent: 'slate' },
  { icon: UtensilsCrossed, title: 'Hospitality', href: '/industries/hospitality', description: 'PMS systems, guest experience platforms, and travel technology', accent: 'blue' },
  { icon: Users, title: 'Human Resources', href: '/industries/human-resources', description: 'HRIS platforms, talent management, and workforce analytics', accent: 'slate' },
  { icon: Wifi, title: 'Telecom & Networks', href: '/industries/telecom-technology', description: '5G infrastructure, network engineering, and telecommunications systems', accent: 'blue' },
  { icon: Car, title: 'Automotive', href: '/industries/automobile', description: 'Connected vehicles, EV technology, and automotive software', accent: 'slate' },
  { icon: ShoppingBag, title: 'Retail & E-Commerce', href: '/industries/retail', description: 'E-commerce platforms, POS systems, and omnichannel solutions', accent: 'blue' },
  { icon: Landmark, title: 'Government & Public Sector', href: '/industries/government-public-sector', description: 'Federal IT modernization, state systems, and public safety technology', accent: 'slate' }
];

const CAPABILITIES = [
  {
    icon: Globe,
    title: 'Cross-Industry Expertise',
    description: 'Our consultants bring experience from multiple sectors, enabling innovative cross-pollination of best practices.'
  },
  {
    icon: Shield,
    title: 'Compliance-First Approach',
    description: 'Deep understanding of industry-specific regulations: HIPAA, SOX, GDPR, and sector-specific standards.'
  },
  {
    icon: Clock,
    title: 'Rapid Deployment',
    description: '48-hour average time to present qualified, industry-vetted candidates ready to contribute.'
  },
  {
    icon: TrendingUp,
    title: 'Domain Knowledge',
    description: 'Technical skills combined with business acumen specific to your industry vertical.'
  }
];

export const IndustriesHub: React.FC = () => {
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
        {/* Sophisticated Background - Slate/Blue tints for Industries */}
        <div className="absolute inset-0">
          {/* Base gradient - deep charcoal with slate undertones */}
          <div className="absolute inset-0 bg-[#0B1A14]" />
          
          {/* Organic gradient shapes - Slate/Blue accents */}
          <div 
            className="absolute top-0 right-0 w-[70%] h-[80%] rounded-bl-[40%]"
            style={{
              background: 'radial-gradient(ellipse at 70% 30%, rgba(45, 62, 80, 0.5) 0%, transparent 60%)',
            }}
          />
          <div 
            className="absolute bottom-0 left-0 w-[60%] h-[70%] rounded-tr-[50%]"
            style={{
              background: 'radial-gradient(ellipse at 20% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
            }}
          />
          <div 
            className="absolute top-[40%] left-[30%] w-[40%] h-[50%]"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(45, 62, 80, 0.2) 0%, transparent 70%)',
            }}
          />
          
          {/* Subtle geometric accents */}
          <div 
            className="absolute top-[20%] right-[10%] w-[300px] h-[300px] border border-slate-500/10 rounded-full"
            style={{ transform: 'rotate(-15deg)' }}
          />
          <div 
            className="absolute bottom-[15%] left-[5%] w-[200px] h-[200px] border border-blue-500/10 rounded-full"
          />
          <div 
            className="absolute top-[60%] right-[25%] w-[150px] h-[150px] border border-slate-400/5"
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
              <div className="w-10 h-10 rounded-lg bg-slate-500/20 flex items-center justify-center">
                <Layers size={20} className="text-slate-400" />
              </div>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-charcoal-400 text-sm tracking-wide">
                <span className="text-slate-400 font-semibold">15+</span> Industries Served
              </span>
            </div>

            {/* Main Headline - Distinctive typography */}
            <h1 className="mb-8">
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black text-white leading-[0.95] tracking-tight">
                Deep Expertise
              </span>
              <span className="block text-[clamp(2.5rem,6vw,5rem)] font-heading font-black leading-[0.95] tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-slate-400 to-blue-400">
                  Across Industries
                </span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-charcoal-300/90 font-light max-w-2xl mb-12 leading-relaxed">
              We don&apos;t just understand technology. We understand your industry&apos;s unique
              challenges, regulatory landscape, and competitive pressures.
            </p>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-16">
              <Link
                href="/contact"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-slate-500 hover:bg-slate-400 text-white font-bold text-sm uppercase tracking-wider transition-all duration-300"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
              >
                <Briefcase size={18} />
                Discuss Your Industry
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/solutions/staffing"
                className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 hover:border-slate-400/40 text-white hover:text-slate-300 font-medium text-sm uppercase tracking-wider transition-all duration-300"
              >
                <Globe size={18} />
                View All Solutions
              </Link>
            </div>

            {/* Key differentiators */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-charcoal-400">
              {[
                'Domain-Specific Vetting',
                'Compliance Expertise',
                'Sector-Aligned Talent'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-charcoal-500 hover:text-slate-400 transition-colors cursor-pointer group"
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
            INDUSTRIES GRID SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-ivory relative overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(45,62,80,0.03)_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.03)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Industry Verticals
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6 leading-tight">
                Specialized Talent for{' '}
                <span className="text-slate-600">Every Sector</span>
              </h2>
              <p className="text-lg text-charcoal-500 leading-relaxed">
                Our recruiters combine technical expertise with deep industry knowledge to deliver 
                candidates who understand your business from day one.
              </p>
            </div>

            {/* Industries Grid - Asymmetric layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
              {INDUSTRIES.map((industry, i) => {
                const Icon = industry.icon;
                const isSlate = industry.accent === 'slate';
                
                return (
                  <Link
                    key={i}
                    href={industry.href}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg transition-all duration-500"
                  >
                    {/* Left accent bar */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${isSlate ? 'bg-slate-500' : 'bg-blue-500'}`} />
                    
                    <div className="p-8">
                      <div className={`w-12 h-12 rounded-xl ${isSlate ? 'bg-slate-100' : 'bg-blue-50'} flex items-center justify-center mb-5`}>
                        <Icon size={24} className={isSlate ? 'text-slate-600' : 'text-blue-600'} />
                      </div>
                      
                      <h3 className={`text-lg font-heading font-bold text-charcoal-900 mb-3 transition-colors ${isSlate ? 'group-hover:text-slate-700' : 'group-hover:text-blue-700'}`}>
                        {industry.title}
                      </h3>
                      
                      <p className="text-charcoal-500 text-sm mb-5 leading-relaxed">
                        {industry.description}
                      </p>
                      
                      <div className={`flex items-center gap-2 font-bold uppercase tracking-wider text-xs ${isSlate ? 'text-slate-600' : 'text-blue-600'}`}>
                        View Expertise
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================
            CAPABILITIES SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-charcoal-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-900/40 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-900/20 rounded-full blur-[120px]" />
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
                  Industry Intelligence,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-blue-400">
                    Technical Excellence
                  </span>
                </h2>
                
                <p className="text-lg text-charcoal-300 mb-10 leading-relaxed">
                  We don&apos;t just match skills to job descriptions. We understand the nuances
                  of each industry—the regulatory requirements, the competitive dynamics,
                  and the critical success factors that separate good hires from great ones.
                </p>

                <div className="space-y-6">
                  {CAPABILITIES.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-500/20 flex items-center justify-center shrink-0">
                        <item.icon size={20} className="text-slate-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold mb-1">{item.title}</h4>
                        <p className="text-charcoal-400 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Stats Grid */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: '15+', label: 'Industries Served', icon: Layers },
                  { value: '98%', label: 'Client Retention', icon: CheckCircle2 },
                  { value: '2,500+', label: 'Placements Made', icon: Users },
                  { value: '48hr', label: 'Avg. Time to Fill', icon: Clock }
                ].map((stat, i) => (
                  <div 
                    key={i} 
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center"
                  >
                    <stat.icon size={24} className="text-slate-400 mx-auto mb-3" />
                    <div className="text-3xl md:text-4xl font-heading font-black text-white mb-1">
                      {stat.value}
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
            INDUSTRY FOCUS AREAS
            ============================================ */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Featured Sectors
                </span>
                <div className="w-12 h-px bg-gold-500" />
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6">
                High-Demand{' '}
                <span className="text-slate-600">Verticals</span>
              </h2>
              <p className="text-lg text-charcoal-500">
                Industries where our specialized expertise delivers exceptional results.
              </p>
            </div>

            {/* Featured Industry Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Monitor,
                  title: 'Technology',
                  description: 'From cloud architects to DevOps engineers, we staff the full stack of modern tech organizations.',
                  stats: ['500+ Active Consultants', 'All Major Platforms', 'Startup to Enterprise'],
                  accent: 'slate'
                },
                {
                  icon: Heart,
                  title: 'Healthcare',
                  description: 'HIPAA-trained professionals for clinical systems, health IT, and medical device development.',
                  stats: ['HIPAA Compliance', 'EMR/EHR Expertise', 'Regulatory Knowledge'],
                  accent: 'blue'
                },
                {
                  icon: Building2,
                  title: 'Financial Services',
                  description: 'Banking, insurance, and fintech specialists with SOX and regulatory compliance experience.',
                  stats: ['SOX Compliant', 'Trading Systems', 'Risk & Compliance'],
                  accent: 'slate'
                }
              ].map((item, i) => {
                const Icon = item.icon;
                const isSlate = item.accent === 'slate';
                
                return (
                  <div
                    key={i}
                    className="group relative bg-ivory rounded-2xl p-8 border border-charcoal-100 hover:shadow-elevation-lg transition-all duration-500"
                  >
                    {/* Top accent bar */}
                    <div className={`absolute top-0 left-8 right-8 h-1 ${isSlate ? 'bg-slate-500' : 'bg-blue-500'}`} />

                    <div className={`w-14 h-14 rounded-xl ${isSlate ? 'bg-slate-100' : 'bg-blue-50'} flex items-center justify-center mb-6`}>
                      <Icon size={28} className={isSlate ? 'text-slate-600' : 'text-blue-600'} />
                    </div>

                    <h3 className="text-2xl font-heading font-bold text-charcoal-900 mb-4">
                      {item.title}
                    </h3>

                    <p className="text-charcoal-500 leading-relaxed mb-6">
                      {item.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {item.stats.map((stat, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-charcoal-600">
                          <CheckCircle2 size={14} className={isSlate ? 'text-slate-500' : 'text-blue-500'} />
                          {stat}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`/industries/${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`inline-flex items-center gap-2 font-bold uppercase tracking-wider text-xs ${isSlate ? 'text-slate-600' : 'text-blue-600'}`}
                    >
                      View {item.title} Talent
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================
            CTA SECTION
            ============================================ */}
        <section className="py-24 lg:py-32 bg-slate-800 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-600/20 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-900/20 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-8 leading-tight">
                Don&apos;t See Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-blue-400">
                  Industry?
                </span>
              </h2>
              <p className="text-xl text-slate-300 font-light max-w-2xl mx-auto mb-12">
                Our expertise extends beyond these verticals. Contact us to discuss
                your sector&apos;s specific talent requirements.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/contact"
                  className="group px-10 py-5 bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                >
                  <Briefcase size={18} />
                  Schedule a Consultation
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/solutions/staffing"
                  className="px-10 py-5 border border-white/20 hover:border-slate-400/40 text-white hover:text-slate-300 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                >
                  <Globe size={18} />
                  View All Services
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

export default IndustriesHub;
