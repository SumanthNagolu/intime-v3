'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  Clock,
  DollarSign,
  Search,
  CheckCircle2,
  Award,
  Calendar,
  User,
  Shield,
  Target,
  ChevronRight,
  Users,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/marketing/templates';

const AVAILABLE_CONSULTANTS = [
  {
    id: 'GW-001',
    name: 'Senior Guidewire Developer',
    experience: '8+ years',
    location: 'Dallas, TX',
    availability: 'Immediate',
    rate: '$110-125/hr',
    clearance: 'US Citizen',
    skills: ['PolicyCenter 10.x', 'ClaimCenter', 'Gosu', 'Java', 'REST APIs', 'AWS'],
    certifications: ['Guidewire ACE Certified', 'AWS Solutions Architect'],
    highlights: 'Led 3 greenfield implementations. Expert in complex integrations.',
    verified: true,
    featured: true
  },
  {
    id: 'CL-002',
    name: 'Cloud Solutions Architect',
    experience: '10+ years',
    location: 'Remote (USA)',
    availability: '2 weeks notice',
    rate: '$130-150/hr',
    clearance: 'Green Card',
    skills: ['AWS', 'Azure', 'Terraform', 'Kubernetes', 'Python', 'DevOps'],
    certifications: ['AWS Professional', 'Azure Solutions Architect', 'CKA'],
    highlights: 'Designed cloud infrastructure for 3 Fortune 500 companies.',
    verified: true,
    featured: true
  },
  {
    id: 'AI-003',
    name: 'AI/ML Engineer',
    experience: '6+ years',
    location: 'San Francisco, CA',
    availability: 'Immediate',
    rate: '$140-160/hr',
    clearance: 'H1B (Transfer OK)',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'MLOps', 'Databricks'],
    certifications: ['TensorFlow Developer', 'AWS ML Specialty'],
    highlights: 'Built ML pipelines processing 1M+ claims daily.',
    verified: true,
    featured: true
  },
  {
    id: 'SF-004',
    name: 'Salesforce Developer',
    experience: '5+ years',
    location: 'Chicago, IL',
    availability: 'Immediate',
    rate: '$85-100/hr',
    clearance: 'US Citizen',
    skills: ['Apex', 'Lightning', 'Salesforce DX', 'Integrations', 'CPQ'],
    certifications: ['Platform Developer II', 'Admin Certified'],
    highlights: 'Delivered 10+ Salesforce implementations.',
    verified: true,
    featured: false
  },
  {
    id: 'DA-005',
    name: 'Data Engineer',
    experience: '7+ years',
    location: 'New York, NY',
    availability: '1 week notice',
    rate: '$100-120/hr',
    clearance: 'Green Card',
    skills: ['Snowflake', 'dbt', 'Apache Spark', 'Python', 'SQL', 'Airflow'],
    certifications: ['Snowflake SnowPro', 'Databricks Data Engineer'],
    highlights: 'Built data lakes for major insurance carriers.',
    verified: true,
    featured: false
  },
  {
    id: 'PM-006',
    name: 'Technical Project Manager',
    experience: '12+ years',
    location: 'Remote (USA)',
    availability: 'Immediate',
    rate: '$95-115/hr',
    clearance: 'US Citizen',
    skills: ['Agile/Scrum', 'Guidewire', 'JIRA', 'Stakeholder Management', 'Budgeting'],
    certifications: ['PMP', 'CSM', 'SAFe Agilist'],
    highlights: 'Managed $50M+ transformation programs.',
    verified: true,
    featured: false
  },
  {
    id: 'QA-007',
    name: 'QA Automation Lead',
    experience: '8+ years',
    location: 'Austin, TX',
    availability: '2 weeks notice',
    rate: '$90-105/hr',
    clearance: 'Green Card',
    skills: ['Selenium', 'Cypress', 'Python', 'API Testing', 'Performance Testing'],
    certifications: ['ISTQB Advanced', 'AWS DevOps'],
    highlights: 'Built automation frameworks achieving 80% coverage.',
    verified: true,
    featured: false
  },
  {
    id: 'FS-008',
    name: 'Full-Stack Developer',
    experience: '6+ years',
    location: 'Remote (USA)',
    availability: 'Immediate',
    rate: '$95-115/hr',
    clearance: 'US Citizen',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'GraphQL'],
    certifications: ['AWS Developer Associate'],
    highlights: 'Shipped production apps used by 500K+ users.',
    verified: true,
    featured: false
  }
];

const STATS = [
  { value: '500+', label: 'Consultants' },
  { value: '48hrs', label: 'Avg. Start Time' },
  { value: 'Top 3%', label: 'Acceptance Rate' }
];

export const AvailableTalentPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTalent = AVAILABLE_CONSULTANTS.filter(consultant =>
    consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    consultant.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNavbar />

      {/* ============================================
          COMPACT HERO SECTION - 50vh, No Scroll Flip
          ============================================ */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden py-20 lg:py-28">
        {/* Sophisticated Background - Emerald accent (careers sub-page) */}
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
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-3 mb-8">
              <Link href="/careers" className="text-charcoal-500 hover:text-emerald-400 text-sm transition-colors">
                Careers
              </Link>
              <ChevronRight size={14} className="text-charcoal-600" />
              <span className="text-emerald-400 text-sm font-medium">Available Talent</span>
            </div>

            {/* Badge */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
                <Target size={16} className="text-emerald-400" />
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                  Pre-Vetted Talent
                </span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-charcoal-400 text-sm">
                <span className="text-emerald-400 font-semibold">{AVAILABLE_CONSULTANTS.length}+</span> consultants ready
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-[0.95] mb-6">
              Deployment-Ready{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500">
                Consultants
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-charcoal-300/90 font-light max-w-2xl mb-10 leading-relaxed">
              Access our bench of verified, enterprise-grade professionals. Every consultant is 
              thoroughly vetted, interviewed, and ready to deliver from day one.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-8 text-sm">
              {[
                { icon: Shield, label: '100% Verified' },
                { icon: Calendar, label: 'Start within 48 hours' },
                { icon: Award, label: 'Top 3% of applicants' }
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
          SEARCH BAR SECTION
          ============================================ */}
      <section className="py-8 bg-white border-b border-charcoal-100 sticky top-20 z-40">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search by role or skill (e.g., Guidewire, AWS, Python)..."
              className="w-full pl-12 pr-4 py-3 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURED CONSULTANTS SECTION
          ============================================ */}
      {filteredTalent.filter(t => t.featured).length > 0 && (
        <section className="py-24 lg:py-28 bg-ivory relative overflow-hidden">
          {/* Subtle background */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.02)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            {/* Section Header */}
            <div className="max-w-5xl mx-auto mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold-500" />
                <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                  Featured Talent
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-charcoal-900 mb-4">
                Top <span className="text-emerald-600">Consultants</span>
              </h2>
              <p className="text-lg text-charcoal-500">
                Our most sought-after professionals, available for immediate engagement.
              </p>
            </div>

            {/* Featured Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {filteredTalent.filter(t => t.featured).map(consultant => (
                <div
                  key={consultant.id}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg border border-charcoal-100 transition-all duration-500"
                >
                  {/* Accent bar */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                  
                  <div className="p-8 pl-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                        <User size={24} className="text-emerald-600" />
                      </div>
                      {consultant.verified && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 size={12} />
                          Verified
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-heading font-bold text-charcoal-900 mb-1 group-hover:text-emerald-700 transition-colors">
                      {consultant.name}
                    </h3>

                    <p className="text-sm text-emerald-600 font-medium mb-4">
                      {consultant.experience} experience
                    </p>

                    {/* Details */}
                    <div className="space-y-2 text-sm text-charcoal-500 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-emerald-500" />
                        {consultant.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-emerald-500" />
                        {consultant.availability}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-emerald-500" />
                        {consultant.rate}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {consultant.skills.slice(0, 4).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-charcoal-50 text-charcoal-600 rounded-sm text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {consultant.skills.length > 4 && (
                        <span className="px-2.5 py-1 bg-charcoal-100 text-charcoal-500 rounded-sm text-xs">
                          +{consultant.skills.length - 4}
                        </span>
                      )}
                    </div>

                    {/* CTA - Angled, not rounded */}
                    <Link
                      href={`/contact?consultant=${consultant.id}`}
                      className="block w-full text-center px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 97% 100%, 0% 100%)' }}
                    >
                      Request Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          ALL CONSULTANTS SECTION
          ============================================ */}
      <section className="py-24 lg:py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(201,169,97,0.02)_0%,transparent_50%)]" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          {/* Section Header */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-px bg-gold-500" />
              <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                Full Roster
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-charcoal-900 mb-4">
              All Available <span className="text-emerald-600">Consultants</span>
            </h2>
            <p className="text-lg text-charcoal-500">
              {filteredTalent.length} professionals matching your search criteria.
            </p>
          </div>

          {/* Consultant List */}
          <div className="space-y-4 max-w-5xl mx-auto">
            {filteredTalent.filter(t => !t.featured).map(consultant => (
              <div
                key={consultant.id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-elevation-sm hover:shadow-elevation-lg border border-charcoal-100 transition-all duration-500"
              >
                {/* Accent bar */}
                <div className="absolute top-0 left-0 w-1 h-full bg-charcoal-200 group-hover:bg-emerald-500 transition-colors" />
                
                <div className="p-8 pl-10">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-charcoal-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 transition-colors">
                        <User size={20} className="text-charcoal-500 group-hover:text-emerald-600 transition-colors" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-heading font-bold text-charcoal-900 group-hover:text-emerald-700 transition-colors">
                            {consultant.name}
                          </h3>
                          <span className="text-xs text-charcoal-400 font-mono">
                            {consultant.id}
                          </span>
                        </div>

                        <p className="text-sm text-emerald-600 font-medium mb-3">
                          {consultant.experience} • {consultant.clearance}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-charcoal-500 mb-4">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-emerald-500" />
                            {consultant.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-emerald-500" />
                            {consultant.availability}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <DollarSign size={14} className="text-emerald-500" />
                            {consultant.rate}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {consultant.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-charcoal-50 text-charcoal-600 rounded-sm text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <p className="text-sm text-charcoal-500 italic">
                          &quot;{consultant.highlights}&quot;
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/contact?consultant=${consultant.id}`}
                      className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
                    >
                      Request
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No results */}
          {filteredTalent.length === 0 && (
            <div className="max-w-5xl mx-auto text-center py-16">
              <div className="w-16 h-16 rounded-xl bg-charcoal-100 flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-charcoal-400" />
              </div>
              <h3 className="text-xl font-heading font-bold text-charcoal-900 mb-2">
                No matching consultants
              </h3>
              <p className="text-charcoal-500 mb-6">
                Try adjusting your search terms or contact us directly.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
              >
                Submit Requirements
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          TESTIMONIAL SECTION
          ============================================ */}
      <section className="py-24 lg:py-28 bg-ivory relative overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.02)_0%,transparent_50%)]" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-px bg-gold-500" />
              <span className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">
                Client Success
              </span>
            </div>

            {/* Large Quote */}
            <div className="relative">
              <Sparkles size={28} className="text-emerald-200 mb-6" />
              
              <blockquote className="text-2xl md:text-3xl font-heading font-bold text-charcoal-900 leading-tight mb-8">
                &quot;We needed a Guidewire expert urgently for our PolicyCenter migration. InTime
                delivered a verified consultant within 36 hours. The quality was exceptional—it
                felt like hiring from our own bench.&quot;
              </blockquote>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                  JM
                </div>
                <div>
                  <div className="font-bold text-charcoal-900">James Mitchell</div>
                  <div className="text-charcoal-500">VP of Engineering, Fortune 500 Insurer</div>
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
              Need a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">
                Specific Skill Set
              </span>
              ?
            </h2>
            <p className="text-lg text-emerald-200/80 font-light max-w-xl mx-auto mb-10">
              We have 500+ consultants in our network. Tell us what you need and we&apos;ll
              match you within 24 hours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="group px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-charcoal-900 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
              >
                <Briefcase size={18} />
                Submit Requirements
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/careers"
                className="px-10 py-5 border border-white/20 hover:border-emerald-500/40 text-white hover:text-emerald-400 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3"
              >
                <Users size={18} />
                Back to Careers
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-16 pt-12 border-t border-white/10">
              {STATS.map((stat, i) => (
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
  );
};

export default AvailableTalentPage;
