'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Briefcase,
  Zap,
  Star,
  Globe,
  ChevronRight,
  Building2,
  Users
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/templates';

const CLIENT_JOBS = [
  {
    id: 1,
    title: 'Senior Guidewire Developer',
    client: 'Fortune 100 Insurance Company',
    location: 'Remote (USA)',
    type: 'Contract',
    rate: '$95 - $125/hr',
    duration: '12+ months',
    skills: ['PolicyCenter', 'ClaimCenter', 'Gosu', 'Java'],
    description: 'Lead development on greenfield PolicyCenter implementation for major P&C carrier.',
    featured: true,
    urgent: true
  },
  {
    id: 2,
    title: 'Cloud Solutions Architect',
    client: 'Global Insurance Carrier',
    location: 'Hybrid - Chicago, IL',
    type: 'Contract-to-Hire',
    rate: '$110 - $140/hr',
    duration: '6 months CTH',
    skills: ['AWS', 'Terraform', 'Kubernetes', 'Python'],
    description: 'Design and implement cloud infrastructure for enterprise insurance platform.',
    featured: true,
    urgent: false
  },
  {
    id: 3,
    title: 'AI/ML Engineer',
    client: 'InsurTech Startup',
    location: 'Remote (USA/Canada)',
    type: 'Full-time',
    rate: '$140K - $180K',
    duration: 'Permanent',
    skills: ['Python', 'TensorFlow', 'MLOps', 'NLP'],
    description: 'Build ML models for claims automation and fraud detection.',
    featured: true,
    urgent: true
  },
  {
    id: 4,
    title: 'Salesforce Developer',
    client: 'Regional Insurance Agency',
    location: 'Remote (USA)',
    type: 'Contract',
    rate: '$75 - $95/hr',
    duration: '6 months',
    skills: ['Apex', 'Lightning', 'Salesforce DX', 'Integration'],
    description: 'Customize Salesforce for agency management and policy tracking.',
    featured: false,
    urgent: false
  },
  {
    id: 5,
    title: 'DevOps Engineer',
    client: 'Insurance Software Vendor',
    location: 'Remote (USA)',
    type: 'Full-time',
    rate: '$120K - $150K',
    duration: 'Permanent',
    skills: ['Jenkins', 'Docker', 'AWS', 'Ansible'],
    description: 'Build and maintain CI/CD pipelines for SaaS insurance platform.',
    featured: false,
    urgent: false
  },
  {
    id: 6,
    title: 'Data Engineer',
    client: 'P&C Insurance Company',
    location: 'Hybrid - Hartford, CT',
    type: 'Contract',
    rate: '$85 - $105/hr',
    duration: '12 months',
    skills: ['Snowflake', 'dbt', 'Python', 'SQL'],
    description: 'Design data pipelines for actuarial and analytics teams.',
    featured: false,
    urgent: true
  },
  {
    id: 7,
    title: 'Technical Project Manager',
    client: 'Mutual Insurance Company',
    location: 'Remote (USA)',
    type: 'Contract',
    rate: '$80 - $100/hr',
    duration: '9 months',
    skills: ['Agile', 'Guidewire', 'JIRA', 'Stakeholder Management'],
    description: 'Lead Guidewire modernization program across multiple carriers.',
    featured: false,
    urgent: false
  },
  {
    id: 8,
    title: 'QA Automation Engineer',
    client: 'Insurance Technology Company',
    location: 'Remote (USA)',
    type: 'Full-time',
    rate: '$100K - $130K',
    duration: 'Permanent',
    skills: ['Selenium', 'Python', 'API Testing', 'CI/CD'],
    description: 'Build automated testing frameworks for insurance software products.',
    featured: false,
    urgent: false
  }
];

const FILTERS = {
  type: ['Contract', 'Contract-to-Hire', 'Full-time']
};

export const OpenPositionsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');

  const filteredJobs = CLIENT_JOBS.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = !selectedType || job.type === selectedType;
    return matchesSearch && matchesType;
  });

  const featuredJobs = filteredJobs.filter(j => j.featured);
  const regularJobs = filteredJobs.filter(j => !j.featured);

  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNavbar />

      {/* ============================================
          COMPACT HERO SECTION - 50vh, No Scroll Flip
          ============================================ */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden py-20 lg:py-28">
        {/* Sophisticated Background - Emerald accent (inherits from /careers) */}
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
              <span className="text-emerald-400 text-sm font-medium">Open Positions</span>
            </div>

            {/* Badge */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
                <Briefcase size={16} className="text-emerald-400" />
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                  Client Opportunities
                </span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-charcoal-400 text-sm">
                <span className="text-emerald-400 font-semibold">{CLIENT_JOBS.length}+</span> active roles
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-[0.95] mb-6">
              Open{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500">
                Positions
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-charcoal-300/90 font-light max-w-2xl mb-10 leading-relaxed">
              Browse active opportunities with our enterprise clients. Contract, contract-to-hire, 
              and permanent positions available with Fortune 500 companies.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-8 text-sm">
              {[
                { icon: Zap, label: '48-hour response' },
                { icon: Star, label: 'Top-tier clients' },
                { icon: Globe, label: 'Remote & hybrid' }
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
          SEARCH & FILTER - Sticky Bar
          ============================================ */}
      <section className="py-6 bg-white border-b border-charcoal-100 sticky top-20 z-40">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="text"
                placeholder="Search by title, skill, or keyword..."
                className="w-full pl-12 pr-4 py-3 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2">
              {FILTERS.type.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? '' : type)}
                  className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    selectedType === type
                      ? 'bg-emerald-600 text-white'
                      : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURED POSITIONS
          ============================================ */}
      {featuredJobs.length > 0 && (
        <section className="py-16 lg:py-20 bg-white relative overflow-hidden">
          {/* Subtle background */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.02)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-4xl mx-auto mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Featured
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-charcoal-900 mb-4">
                Priority <span className="text-emerald-600">Opportunities</span>
              </h2>
              <p className="text-lg text-charcoal-500">
                High-demand roles with expedited hiring processes.
              </p>
            </div>

            {/* Featured Job Cards */}
            <div className="space-y-4 max-w-4xl mx-auto">
              {featuredJobs.map(job => (
                <div
                  key={job.id}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg border border-charcoal-100 transition-all duration-500"
                >
                  {/* Accent bar - Emerald for featured */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                  
                  <div className="p-8 pl-10">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-heading font-bold text-charcoal-900 group-hover:text-emerald-700 transition-colors">
                            {job.title}
                          </h3>
                          {job.urgent && (
                            <span className="px-3 py-1 bg-red-50 text-red-600 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                              Urgent
                            </span>
                          )}
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                            Featured
                          </span>
                        </div>

                        <p className="text-emerald-600 font-medium text-sm mb-3">
                          {job.client}
                        </p>

                        <p className="text-charcoal-600 mb-4 leading-relaxed">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-charcoal-500 mb-4">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-emerald-500" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-emerald-500" />
                            {job.type}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <DollarSign size={14} className="text-emerald-500" />
                            {job.rate}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Building2 size={14} className="text-emerald-500" />
                            {job.duration}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill, j) => (
                            <span
                              key={j}
                              className="px-3 py-1.5 bg-charcoal-50 text-charcoal-600 text-xs rounded-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Link
                        href={`/contact?job=${job.id}`}
                        className="shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300"
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
          </div>
        </section>
      )}

      {/* ============================================
          ALL POSITIONS
          ============================================ */}
      <section className="py-16 lg:py-20 bg-ivory relative overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(201,169,97,0.03)_0%,transparent_50%)]" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          {/* Section Header */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-px bg-gold-500" />
              <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                All Roles
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-charcoal-900 mb-4">
              All <span className="text-emerald-600">Positions</span>
              <span className="text-charcoal-400 text-lg font-normal ml-4">
                ({filteredJobs.length} available)
              </span>
            </h2>
          </div>

          {/* Job Cards */}
          <div className="space-y-4 max-w-4xl mx-auto">
            {regularJobs.map(job => (
              <div
                key={job.id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-md border border-charcoal-100 transition-all duration-300"
              >
                {/* Accent bar */}
                <div className={`absolute top-0 left-0 w-1 h-full ${job.urgent ? 'bg-emerald-500' : 'bg-charcoal-200 group-hover:bg-emerald-400'} transition-colors`} />
                
                <div className="p-8 pl-10">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-heading font-bold text-charcoal-900 group-hover:text-emerald-700 transition-colors">
                          {job.title}
                        </h3>
                        {job.urgent && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                            Urgent
                          </span>
                        )}
                      </div>

                      <p className="text-emerald-600 font-medium text-sm mb-3">
                        {job.client}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-charcoal-500 mb-4">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-charcoal-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-charcoal-400" />
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <DollarSign size={14} className="text-charcoal-400" />
                          {job.rate}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, j) => (
                          <span
                            key={j}
                            className="px-2.5 py-1 bg-charcoal-100 text-charcoal-600 text-xs rounded-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      href={`/contact?job=${job.id}`}
                      className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-charcoal-900 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                    >
                      Apply
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Don't see the right fit */}
          <div className="max-w-4xl mx-auto mt-12 p-8 bg-white rounded-xl border border-charcoal-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-lg font-heading font-bold text-charcoal-900 mb-2">
                  Don't see the right fit?
                </h3>
                <p className="text-charcoal-500">
                  We have many more positions not listed here. Send us your resume.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-wider text-sm group"
              >
                Submit Resume
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
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
                Take the Next Step
              </span>
              ?
            </h2>
            <p className="text-lg text-emerald-200/80 font-light max-w-xl mx-auto mb-10">
              Our team will respond within 48 hours to discuss your career goals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="group px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-charcoal-900 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
              >
                <Users size={18} />
                Submit Your Profile
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

export default OpenPositionsPage;
