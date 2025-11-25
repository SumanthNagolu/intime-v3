'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  Star,
  Globe,
  Award,
  Calendar,
  User,
  Briefcase,
  Shield
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/templates';

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

export const AvailableTalentPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTalent = AVAILABLE_CONSULTANTS.filter(consultant =>
    consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    consultant.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="relative py-32 bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-charcoal-900 to-charcoal-950" />
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-8">
              <User size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Available Talent</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-heading font-black text-white leading-[0.95] mb-8">
              Pre-Vetted{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-500">
                Consultants
              </span>
            </h1>

            <p className="text-xl text-charcoal-300 font-light leading-relaxed mb-10 max-w-2xl">
              Access our bench of {AVAILABLE_CONSULTANTS.length}+ deployment-ready professionals.
              Every consultant is verified, interviewed, and ready to start.
            </p>

            <div className="flex flex-wrap gap-6 text-charcoal-400 text-sm">
              <span className="flex items-center gap-2">
                <Shield size={16} className="text-forest-400" />
                100% Verified
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-forest-400" />
                Start within 48 hours
              </span>
              <span className="flex items-center gap-2">
                <Award size={16} className="text-forest-400" />
                Top 3% of applicants
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 bg-white border-b border-charcoal-100 sticky top-20 z-40">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search by role or skill (e.g., Guidewire, AWS, Python)..."
              className="w-full pl-12 pr-4 py-3 border border-charcoal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Talent Listings */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            {/* Featured Talent */}
            {filteredTalent.filter(t => t.featured).length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-heading font-bold text-charcoal-900 mb-6 flex items-center gap-2">
                  <Star size={18} className="text-gold-500 fill-gold-500" />
                  Featured Consultants
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTalent.filter(t => t.featured).map(consultant => (
                    <div
                      key={consultant.id}
                      className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
                          <User size={24} className="text-purple-600" />
                        </div>
                        {consultant.verified && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-forest-100 text-forest-700 rounded-full text-xs font-bold">
                            <CheckCircle2 size={12} />
                            Verified
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-heading font-bold text-charcoal-900 mb-1">
                        {consultant.name}
                      </h3>

                      <p className="text-sm text-purple-600 font-medium mb-3">
                        {consultant.experience} experience
                      </p>

                      <div className="space-y-2 text-sm text-charcoal-500 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          {consultant.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          {consultant.availability}
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={14} />
                          {consultant.rate}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {consultant.skills.slice(0, 4).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {consultant.skills.length > 4 && (
                          <span className="px-2 py-1 bg-charcoal-100 text-charcoal-600 rounded text-xs">
                            +{consultant.skills.length - 4} more
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/contact?consultant=${consultant.id}`}
                        className="block w-full text-center px-4 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-purple-700 transition-all"
                      >
                        Request Profile
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Talent */}
            <div>
              <h2 className="text-xl font-heading font-bold text-charcoal-900 mb-6">
                All Available Consultants ({filteredTalent.length})
              </h2>

              <div className="space-y-4">
                {filteredTalent.filter(t => !t.featured).map(consultant => (
                  <div
                    key={consultant.id}
                    className="bg-white rounded-2xl p-6 border border-charcoal-100 hover:border-purple-300 hover:shadow-elevation-md transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-charcoal-100 flex items-center justify-center shrink-0">
                          <User size={20} className="text-charcoal-600" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-heading font-bold text-charcoal-900">
                              {consultant.name}
                            </h3>
                            <span className="text-sm text-charcoal-500">
                              ({consultant.id})
                            </span>
                          </div>

                          <p className="text-sm text-purple-600 font-medium mb-3">
                            {consultant.experience} • {consultant.clearance}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-charcoal-500 mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {consultant.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {consultant.availability}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign size={14} />
                              {consultant.rate}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {consultant.skills.map((skill, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-charcoal-100 rounded text-xs text-charcoal-600"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          <p className="text-sm text-charcoal-500 italic">
                            "{consultant.highlights}"
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/contact?consultant=${consultant.id}`}
                        className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-purple-700 transition-all"
                      >
                        Request
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-900/30 to-charcoal-900">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-6">
              Need a Specific Skill Set?
            </h2>
            <p className="text-lg text-charcoal-300 mb-8">
              We have 500+ consultants in our network. Tell us what you need and
              we'll match you within 24 hours.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-all"
              >
                Submit Requirements
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/clients"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white/10 text-white border border-white/20 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/20 transition-all"
              >
                Learn About Our Process
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AvailableTalentPage;
