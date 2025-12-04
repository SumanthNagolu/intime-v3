'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  Users,
  Zap,
  Coffee,
  Globe,
  Laptop,
  GraduationCap,
  TrendingUp,
  Briefcase,
  Rocket,
  Shield,
  Trophy,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/marketing/templates';

const OPEN_ROLES = [
  {
    title: 'Senior Technical Recruiter',
    department: 'Recruiting',
    location: 'Remote (USA)',
    type: 'Full-time',
    salary: '$70K - $95K + Commission',
    description: 'Drive full-cycle recruitment for technology positions across our client portfolio.',
    requirements: ['3+ years technical recruiting', 'ATS experience', 'Strong sourcing skills'],
    hot: true
  },
  {
    title: 'Account Executive - Enterprise',
    department: 'Sales',
    location: 'Remote (USA/Canada)',
    type: 'Full-time',
    salary: '$80K - $120K + Commission',
    description: 'Build relationships with Fortune 500 clients and drive new business.',
    requirements: ['5+ years B2B sales', 'Staffing industry preferred', 'Proven track record'],
    hot: true
  },
  {
    title: 'Guidewire Instructor',
    department: 'Academy',
    location: 'Remote / Hybrid',
    type: 'Full-time',
    salary: '$90K - $130K',
    description: 'Lead our flagship Guidewire training programs and mentor students.',
    requirements: ['5+ years Guidewire experience', 'Teaching/training experience', 'ACE certified'],
    hot: false
  },
  {
    title: 'Operations Manager',
    department: 'Operations',
    location: 'Hyderabad, India',
    type: 'Full-time',
    salary: 'Competitive (INR)',
    description: 'Oversee day-to-day operations of our India delivery center.',
    requirements: ['7+ years operations', 'Staffing industry', 'Team leadership'],
    hot: false
  },
  {
    title: 'Full-Stack Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    salary: '$100K - $140K',
    description: 'Build and maintain our internal platforms and client-facing tools.',
    requirements: ['React/Next.js', 'Node.js/Python', '4+ years experience'],
    hot: false
  },
  {
    title: 'Marketing Coordinator',
    department: 'Marketing',
    location: 'Remote (USA)',
    type: 'Full-time',
    salary: '$50K - $65K',
    description: 'Support digital marketing campaigns, content creation, and brand initiatives.',
    requirements: ['2+ years marketing', 'Social media', 'Content writing'],
    hot: false
  }
];

const BENEFITS = [
  { icon: Laptop, title: 'Remote-First', description: 'Work from anywhere. We trust you to deliver.' },
  { icon: Heart, title: 'Health Insurance', description: '100% covered medical, dental, and vision.' },
  { icon: Coffee, title: 'Unlimited PTO', description: 'Take the time you need. No questions asked.' },
  { icon: GraduationCap, title: 'Learning Budget', description: '$2,500/year for courses and certifications.' },
  { icon: TrendingUp, title: 'Equity Options', description: "Own a piece of the company you're building." },
  { icon: Globe, title: 'Global Team', description: 'Work with talented people across 3 continents.' }
];

const VALUES = [
  { 
    icon: Trophy, 
    title: 'Excellence', 
    description: "We don&apos;t settle for &apos;good enough.&apos; Every interaction matters.",
    accent: 'emerald'
  },
  { 
    icon: Users, 
    title: 'People First', 
    description: 'Our success is measured by the success of our people.',
    accent: 'forest'
  },
  { 
    icon: Zap, 
    title: 'Speed', 
    description: 'We move fast, make decisions quickly, and iterate constantly.',
    accent: 'gold'
  },
  { 
    icon: Shield, 
    title: 'Integrity', 
    description: 'We do the right thing, even when no one is watching.',
    accent: 'slate'
  }
];

export const JoinOurTeamPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNavbar />

      {/* ============================================
          COMPACT HERO SECTION - 50vh, No Scroll Flip
          ============================================ */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden py-20 lg:py-28">
        {/* Sophisticated Background - Emerald accent */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#0B1A14]" />
          
          {/* Organic gradient shapes - Emerald tints */}
          <div 
            className="absolute top-0 right-0 w-[60%] h-[80%] rounded-bl-[40%]"
            style={{
              background: 'radial-gradient(ellipse at 70% 30%, rgba(16, 185, 129, 0.12) 0%, transparent 60%)',
            }}
          />
          <div 
            className="absolute bottom-0 left-0 w-[50%] h-[60%] rounded-tr-[50%]"
            style={{
              background: 'radial-gradient(ellipse at 20% 80%, rgba(52, 211, 153, 0.06) 0%, transparent 50%)',
            }}
          />
          <div 
            className="absolute top-[30%] left-[40%] w-[30%] h-[40%] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(201, 169, 97, 0.04) 0%, transparent 60%)',
            }}
          />
          
          {/* Subtle geometric accent */}
          <div 
            className="absolute top-[15%] right-[8%] w-[200px] h-[200px] border border-emerald-500/10 rounded-full"
            style={{ transform: 'rotate(-15deg)' }}
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
          <div className="max-w-4xl">
            {/* Breadcrumb / Context */}
            <div className="flex items-center gap-3 mb-8">
              <Link href="/careers" className="text-charcoal-500 hover:text-emerald-400 text-sm transition-colors">
                Careers
              </Link>
              <ChevronRight size={14} className="text-charcoal-600" />
              <span className="text-emerald-400 text-sm font-medium">Join Our Team</span>
            </div>

            {/* Badge */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
                <Rocket size={16} className="text-emerald-400" />
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                  We&apos;re Hiring
                </span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-charcoal-400 text-sm">
                <span className="text-emerald-400 font-semibold">{OPEN_ROLES.length}</span> open positions
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-[0.95] mb-6">
              Build Your Career{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500">
                at InTime
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-charcoal-300/90 font-light max-w-2xl mb-10 leading-relaxed">
              Join a fast-growing team transforming the staffing industry. Work on challenging problems 
              with talented people who care about making a difference.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-8 text-sm">
              {[
                { icon: MapPin, label: 'Remote-first' },
                { icon: Users, label: '50+ team members' },
                { icon: Globe, label: 'USA, Canada, India' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-charcoal-400">
                  <item.icon size={16} className="text-emerald-500" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          OPEN POSITIONS SECTION
          ============================================ */}
      <section className="py-24 lg:py-28 bg-white relative overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.02)_0%,transparent_50%)]" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          {/* Section Header */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-px bg-gold-500" />
              <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                Open Roles
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-charcoal-900 mb-4">
              Current <span className="text-emerald-600">Opportunities</span>
            </h2>
            <p className="text-lg text-charcoal-500">
              Find your next role and join our mission to transform careers.
            </p>
          </div>

          {/* Job Cards */}
          <div className="space-y-4 max-w-4xl mx-auto">
            {OPEN_ROLES.map((role, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg border border-charcoal-100 transition-all duration-500"
              >
                {/* Accent bar */}
                <div className={`absolute top-0 left-0 w-1 h-full ${role.hot ? 'bg-emerald-500' : 'bg-charcoal-200'}`} />
                
                <div className="p-8 pl-10">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-heading font-bold text-charcoal-900 group-hover:text-emerald-700 transition-colors">
                          {role.title}
                        </h3>
                        {role.hot && (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                            Hiring Now
                          </span>
                        )}
                      </div>

                      <p className="text-charcoal-600 mb-4 leading-relaxed">
                        {role.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-charcoal-500 mb-4">
                        <span className="flex items-center gap-1.5">
                          <Briefcase size={14} className="text-emerald-500" />
                          {role.department}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-emerald-500" />
                          {role.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-emerald-500" />
                          {role.type}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <DollarSign size={14} className="text-emerald-500" />
                          {role.salary}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {role.requirements.map((req, j) => (
                          <span
                            key={j}
                            className="px-3 py-1.5 bg-charcoal-50 text-charcoal-600 text-xs rounded-sm"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      href={`mailto:careers@intimeesolutions.com?subject=Application: ${role.title}`}
                      className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                    >
                      Apply Now
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Don't see your role */}
          <div className="max-w-4xl mx-auto mt-12 p-8 bg-ivory rounded-xl border border-charcoal-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-lg font-heading font-bold text-charcoal-900 mb-2">
                  Don&apos;t see your role?
                </h3>
                <p className="text-charcoal-500">
                  We&apos;re always looking for talented people. Send us your resume.
                </p>
              </div>
              <Link
                href="mailto:careers@intimeesolutions.com"
                className="inline-flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-wider text-sm group"
              >
                Send Resume
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          BENEFITS SECTION
          ============================================ */}
      <section className="py-24 lg:py-28 bg-ivory relative overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(201,169,97,0.03)_0%,transparent_50%)]" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          {/* Section Header */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-px bg-gold-500" />
              <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                Why InTime
              </span>
              <div className="w-12 h-px bg-gold-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-charcoal-900 mb-4">
              Benefits & <span className="text-emerald-600">Perks</span>
            </h2>
            <p className="text-lg text-charcoal-500">
              We take care of our team so they can take care of our clients.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {BENEFITS.map((benefit, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-md border border-charcoal-100 transition-all duration-300"
              >
                {/* Accent bar */}
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                
                <div className="p-8 pl-10">
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center mb-5 group-hover:bg-emerald-100 transition-colors">
                    <benefit.icon size={24} className="text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-charcoal-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-charcoal-500 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          VALUES SECTION
          ============================================ */}
      <section className="py-24 lg:py-28 bg-charcoal-900 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-900/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold-900/20 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          {/* Section Header */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-px bg-gold-500" />
              <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em]">
                Our Foundation
              </span>
              <div className="w-12 h-px bg-gold-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-4">
              Values That <span className="text-emerald-400">Guide Us</span>
            </h2>
            <p className="text-lg text-charcoal-300">
              The principles that shape every decision we make.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {VALUES.map((value, i) => {
              const accentColors = {
                emerald: 'border-emerald-500/30',
                forest: 'border-forest-500/30',
                gold: 'border-gold-500/30',
                slate: 'border-slate-400/30'
              };
              const iconColors = {
                emerald: 'text-emerald-400',
                forest: 'text-forest-400',
                gold: 'text-gold-400',
                slate: 'text-slate-400'
              };
              
              return (
                <div
                  key={i}
                  className={`bg-white/5 backdrop-blur-sm rounded-xl p-8 border ${accentColors[value.accent as keyof typeof accentColors]} text-center hover:bg-white/10 transition-all duration-300`}
                >
                  <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-5">
                    <value.icon size={28} className={iconColors[value.accent as keyof typeof iconColors]} />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-white mb-2">
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
          TESTIMONIAL / CULTURE SECTION
          ============================================ */}
      <section className="py-24 lg:py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.02)_0%,transparent_50%)]" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-px bg-gold-500" />
              <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                Life at InTime
              </span>
            </div>

            {/* Large Quote */}
            <div className="relative">
              <Sparkles size={28} className="text-emerald-200 mb-6" />
              
              <blockquote className="text-2xl md:text-3xl font-heading font-bold text-charcoal-900 leading-tight mb-8">
                &quot;I came here because the interview felt like a real conversation, not a checklist.
                Two years in, that authenticity hasn&apos;t changed. We disagree, we debate, we build—and
                we actually ship.&quot;
              </blockquote>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                  RK
                </div>
                <div>
                  <div className="font-bold text-charcoal-900">Rahul Kumar</div>
                  <div className="text-charcoal-500">Engineering Lead, 2 years at InTime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-emerald-900 via-charcoal-900 to-charcoal-950 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-black text-white mb-6 leading-tight">
              Ready to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">
                Make an Impact
              </span>
              ?
            </h2>
            <p className="text-lg text-emerald-200/80 font-light max-w-xl mx-auto mb-10">
              Join our team and help us transform 10,000 careers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="mailto:careers@intimeesolutions.com"
                className="group px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-charcoal-900 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
              >
                <Briefcase size={18} />
                Send Your Resume
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/careers"
                className="px-10 py-5 border border-white/20 hover:border-emerald-500/40 text-white hover:text-emerald-400 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
              >
                Back to Careers
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default JoinOurTeamPage;
