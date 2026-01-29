'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  Globe,
  GraduationCap,
  Users,
  Briefcase,
  ChevronRight,
  LineChart,
  Building2,
  Zap,
  CheckSquare,
  Quote
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/marketing/templates';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  const stats = {
    professionals: useCounter(2500, 2000),
    satisfaction: useCounter(98, 2000),
    placements: useCounter(1200, 2000),
    countries: useCounter(18, 1500)
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

  return (
    <div className="min-h-screen bg-cream selection:bg-gold-500/30 selection:text-charcoal-900">
      <MarketingNavbar />

      {/* ============================================
          HERO SECTION - Precision Grid
          ============================================ */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-charcoal-900">
        {/* Technical Grid Background */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `linear-gradient(#C9A961 1px, transparent 1px), linear-gradient(90deg, #C9A961 1px, transparent 1px)`,
            backgroundSize: '40px 40px' 
          }} 
        />
        
        {/* Radial Vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-charcoal-900 opacity-80" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-5xl">
            {/* Status Indicator */}
            <div className="inline-flex items-center gap-3 px-3 py-1.5 border border-white/10 bg-white/5 backdrop-blur-sm mb-8 rounded-xs">
              <div className="w-1.5 h-1.5 bg-success-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-charcoal-300">
                System Operational
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="text-[10px] font-mono text-gold-500">
                v3.0
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="mb-8">
              <span className="block text-[clamp(3rem,7vw,6rem)] font-heading font-black text-white leading-[0.9] tracking-tight">
                PRECISION
              </span>
              <span className="block text-[clamp(3rem,7vw,6rem)] font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-200 to-gold-500 leading-[0.9] tracking-tight">
                STAFFING
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-charcoal-300 font-light max-w-2xl mb-12 leading-relaxed border-l-2 border-gold-500 pl-6">
              Engineering the future of work with mathematical precision.
              High-performance talent deployment for enterprise-grade challenges.
            </p>

            {/* CTA Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mb-16">
              <Button 
                variant="premium" 
                size="lg" 
                className="h-14 w-full text-sm font-bold tracking-[0.15em] border-gold-500/50 hover:border-gold-500"
                asChild
              >
                <Link href="/academy">
                  <GraduationCap size={18} className="mr-3" />
                  INITIATE TRAINING
                </Link>
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 w-full text-sm font-bold tracking-[0.15em] text-white border-white/20 hover:bg-white/10 hover:text-white hover:border-white/40"
                asChild
              >
                <Link href="/contact">
                  <Building2 size={18} className="mr-3" />
                  ENTERPRISE ACCESS
                </Link>
              </Button>
            </div>

            {/* Technical Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/10">
              {[
                { label: 'Time to Fill', value: '48 HRS' },
                { label: 'Success Rate', value: '98.5%' },
                { label: 'Retention', value: '12 MO+' },
                { label: 'Global Reach', value: '18 Countries' },
              ].map((spec, i) => (
                <div key={i}>
                  <div className="text-[10px] font-mono text-charcoal-500 uppercase tracking-widest mb-1">
                    {spec.label}
                  </div>
                  <div className="text-lg font-mono font-bold text-gold-400">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          STATS DASHBOARD - Grid System
          ============================================ */}
      <section ref={statsSection.ref} className="py-24 bg-white border-b border-charcoal-100">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-charcoal-100 border border-charcoal-100">
            {[
              { value: stats.professionals.count, label: 'Active Personnel', suffix: '+', icon: Users },
              { value: stats.satisfaction.count, label: 'Client Satisfaction', suffix: '%', icon: Award },
              { value: stats.placements.count, label: 'Deployments', suffix: '', icon: CheckSquare },
              { value: stats.countries.count, label: 'Operations Centers', suffix: '', icon: Globe },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 group hover:bg-charcoal-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <stat.icon size={24} className="text-charcoal-400 group-hover:text-gold-500 transition-colors" />
                  <span className="text-[10px] font-mono text-charcoal-300">ID:0{i+1}</span>
                </div>
                <div className="text-4xl font-mono font-bold text-charcoal-900 mb-2 tracking-tighter">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-charcoal-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SERVICES GRID - Bento Style
          ============================================ */}
      <section className="py-24 lg:py-32 bg-cream">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
                Capabilities
              </span>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 leading-tight">
                Modular Talent <br />
                <span className="text-charcoal-400">Architecture</span>
              </h2>
            </div>
            <Button variant="outline" className="hidden md:flex">
              VIEW FULL SPECIFICATION <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Academy - Large Tile */}
            <div className="md:col-span-8 bg-charcoal-900 text-white p-8 md:p-12 relative overflow-hidden group rounded-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-12 h-12 border border-white/20 flex items-center justify-center mb-8 text-gold-500">
                    <GraduationCap size={24} />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-4">Training Academy</h3>
                  <p className="text-charcoal-300 max-w-md leading-relaxed mb-8">
                    An intensive 8-week calibration program designed to transform raw potential into enterprise-ready engineering talent.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                  <div>
                    <div className="text-3xl font-mono font-bold text-gold-500 mb-1">8</div>
                    <div className="text-[10px] uppercase tracking-wider text-charcoal-400">Weeks Duration</div>
                  </div>
                  <div>
                    <div className="text-3xl font-mono font-bold text-gold-500 mb-1">L4</div>
                    <div className="text-[10px] uppercase tracking-wider text-charcoal-400">Engineering Grade</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Staffing - Tall Tile */}
            <div className="md:col-span-4 bg-white border border-charcoal-200 p-8 md:p-12 relative group hover:shadow-sharp transition-all duration-300 rounded-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-forest-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              
              <div className="w-12 h-12 bg-forest-50 flex items-center justify-center mb-8 text-forest-600">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-4 text-charcoal-900">Precision Staffing</h3>
              <p className="text-charcoal-500 text-sm mb-8 leading-relaxed">
                Algorithmic matching of candidate capabilities to project requirements.
              </p>
              
              <ul className="space-y-4 mb-8">
                {['Contract', 'Contract-to-Hire', 'Direct Placement'].map((item) => (
                  <li key={item} className="flex items-center text-xs font-bold uppercase tracking-wider text-charcoal-700">
                    <div className="w-1.5 h-1.5 bg-forest-500 mr-3" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/solutions/staffing" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-forest-600 hover:text-forest-800">
                Access Pool <ChevronRight size={14} className="ml-1" />
              </Link>
            </div>

            {/* Bench Sales - Standard Tile */}
            <div className="md:col-span-4 bg-white border border-charcoal-200 p-8 hover:shadow-sharp transition-all duration-300 rounded-sm group">
              <div className="w-10 h-10 border border-charcoal-200 flex items-center justify-center mb-6 text-charcoal-900 group-hover:bg-charcoal-900 group-hover:text-white transition-colors">
                <Briefcase size={20} />
              </div>
              <h3 className="text-lg font-heading font-bold mb-2 text-charcoal-900">Bench Sales</h3>
              <p className="text-charcoal-500 text-sm mb-4">
                Immediate deployment of available consultants.
              </p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-charcoal-100">
                <span className="text-[10px] font-mono text-charcoal-400">AVAILABILITY: IMMEDIATE</span>
                <ArrowRight size={14} className="text-charcoal-900" />
              </div>
            </div>

            {/* Cross Border - Standard Tile */}
            <div className="md:col-span-4 bg-white border border-charcoal-200 p-8 hover:shadow-sharp transition-all duration-300 rounded-sm group">
              <div className="w-10 h-10 border border-charcoal-200 flex items-center justify-center mb-6 text-charcoal-900 group-hover:bg-charcoal-900 group-hover:text-white transition-colors">
                <Globe size={20} />
              </div>
              <h3 className="text-lg font-heading font-bold mb-2 text-charcoal-900">Global Mobility</h3>
              <p className="text-charcoal-500 text-sm mb-4">
                Seamless cross-border talent migration protocols.
              </p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-charcoal-100">
                <span className="text-[10px] font-mono text-charcoal-400">COVERAGE: WORLDWIDE</span>
                <ArrowRight size={14} className="text-charcoal-900" />
              </div>
            </div>

            {/* Consulting - Standard Tile */}
            <div className="md:col-span-4 bg-white border border-charcoal-200 p-8 hover:shadow-sharp transition-all duration-300 rounded-sm group">
              <div className="w-10 h-10 border border-charcoal-200 flex items-center justify-center mb-6 text-charcoal-900 group-hover:bg-charcoal-900 group-hover:text-white transition-colors">
                <LineChart size={20} />
              </div>
              <h3 className="text-lg font-heading font-bold mb-2 text-charcoal-900">Consulting</h3>
              <p className="text-charcoal-500 text-sm mb-4">
                Strategic technology implementation & guidance.
              </p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-charcoal-100">
                <span className="text-[10px] font-mono text-charcoal-400">TYPE: ADVISORY</span>
                <ArrowRight size={14} className="text-charcoal-900" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          WHY CHOOSE US - Technical Breakdown
          ============================================ */}
      <section className="py-24 bg-charcoal-900 text-white overflow-hidden relative">
        {/* Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{ 
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '20px 20px' 
          }} 
        />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <span className="text-gold-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
                System Advantages
              </span>
              <h2 className="text-4xl md:text-5xl font-heading font-black mb-8">
                Engineered for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-charcoal-500">
                  Performance
                </span>
              </h2>
              
              <div className="space-y-8">
                {[
                  {
                    title: 'Quality Verification',
                    desc: '7-stage vetting protocol ensuring top 3% talent retention.',
                    icon: ShieldCheck
                  },
                  {
                    title: 'Rapid Deployment',
                    desc: 'Standardized onboarding reducing time-to-productivity by 60%.',
                    icon: Zap
                  },
                  {
                    title: 'Predictive Matching',
                    desc: 'Data-driven role fit analysis minimizing turnover risk.',
                    icon: LineChart
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-12 h-12 border border-white/20 flex items-center justify-center shrink-0 group-hover:border-gold-500 group-hover:text-gold-500 transition-colors">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-lg font-heading font-bold mb-2 group-hover:text-gold-500 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-charcoal-400 text-sm leading-relaxed max-w-sm">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-0 right-0 w-full h-full border border-white/10 p-2">
                <div className="w-full h-full bg-charcoal-800 relative">
                  {/* Decorative UI Elements */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-6xl font-mono font-bold text-white/5">INTIME</div>
                  </div>
                  
                  {/* Stats Cards Floating */}
                  <div className="absolute top-1/4 right-8 bg-charcoal-900 border border-white/10 p-6 w-48 shadow-2xl">
                    <div className="text-xs text-charcoal-400 uppercase mb-2">Retention Rate</div>
                    <div className="text-3xl font-mono font-bold text-success-500">96.8%</div>
                    <div className="w-full h-1 bg-charcoal-700 mt-4">
                      <div className="w-[96%] h-full bg-success-500" />
                    </div>
                  </div>

                  <div className="absolute bottom-1/4 left-8 bg-charcoal-900 border border-white/10 p-6 w-48 shadow-2xl">
                    <div className="text-xs text-charcoal-400 uppercase mb-2">Avg. Salary</div>
                    <div className="text-3xl font-mono font-bold text-gold-500">$120k</div>
                    <div className="text-[10px] text-charcoal-500 mt-1">ENTRY LEVEL</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS - Executive Briefs
          ============================================ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
                Field Reports
              </span>
              <h2 className="text-4xl font-heading font-black text-charcoal-900">
                Success Verification
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "The Academy's calibration protocol is rigorous. The candidate we received was productive within 48 hours, surpassing our senior benchmark metrics.",
                author: "Michael Chen",
                role: "VP Engineering",
                company: "Capgemini",
                id: "RPT-042"
              },
              {
                text: "Cross-border logistics were handled with absolute precision. Visa processing time was reduced by 40% compared to standard agency performance.",
                author: "Sarah Jenkins",
                role: "Director of Talent",
                company: "Deloitte",
                id: "RPT-089"
              },
              {
                text: "InTime does not just supply headcount; they supply capability. Their bench sales team provided critical specialized resources during our migration phase.",
                author: "David Ross",
                role: "CTO",
                company: "Oracle",
                id: "RPT-113"
              }
            ].map((item, i) => (
              <div key={i} className="bg-cream p-8 border-l-2 border-charcoal-200 hover:border-gold-500 transition-colors group">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-mono text-charcoal-400 uppercase">{item.id}</span>
                  <Quote size={16} className="text-gold-500 opacity-50" />
                </div>
                <p className="text-charcoal-700 text-sm leading-relaxed mb-8 font-medium">
                  &ldquo;{item.text}&rdquo;
                </p>
                <div>
                  <div className="font-heading font-bold text-charcoal-900">{item.author}</div>
                  <div className="text-xs font-mono text-charcoal-500 uppercase mt-1">
                    {item.role} // {item.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA - Final Call
          ============================================ */}
      <section className="py-24 bg-forest-900 relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-8">
            Ready to <span className="text-gold-500">Deploy?</span>
          </h2>
          <p className="text-charcoal-300 max-w-xl mx-auto mb-12 text-lg">
            Initiate your transformation sequence. Whether scaling a team or upgrading your career, precision starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" className="bg-gold-500 text-charcoal-900 hover:bg-gold-400 h-14 px-8 text-sm font-bold tracking-[0.15em] rounded-xs" asChild>
              <Link href="/academy">
                START TRAINING
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white h-14 px-8 text-sm font-bold tracking-[0.15em] rounded-xs" asChild>
              <Link href="/contact">
                CONTACT SALES
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
