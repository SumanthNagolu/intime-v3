'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Search,
  Filter,
  Briefcase,
  CheckCircle2,
  Zap,
  Star,
  Globe
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
  type: ['Contract', 'Contract-to-Hire', 'Full-time'],
  location: ['Remote', 'Hybrid', 'On-site'],
  rate: ['$50-75/hr', '$75-100/hr', '$100-125/hr', '$125+/hr']
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

  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="relative py-32 bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-900/20 via-charcoal-900 to-charcoal-950" />
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-gold-600/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 mb-8">
              <Briefcase size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Client Opportunities</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-heading font-black text-white leading-[0.95] mb-8">
              Open{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                Positions
              </span>
            </h1>

            <p className="text-xl text-charcoal-300 font-light leading-relaxed mb-10 max-w-2xl">
              Browse {CLIENT_JOBS.length}+ active opportunities with our enterprise clients.
              Contract, contract-to-hire, and permanent positions available.
            </p>

            <div className="flex flex-wrap gap-6 text-charcoal-400 text-sm">
              <span className="flex items-center gap-2">
                <Zap size={16} className="text-gold-400" />
                48-hour response time
              </span>
              <span className="flex items-center gap-2">
                <Star size={16} className="text-gold-400" />
                Top-tier clients
              </span>
              <span className="flex items-center gap-2">
                <Globe size={16} className="text-gold-400" />
                Remote & hybrid options
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-white border-b border-charcoal-100 sticky top-20 z-40">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="text"
                placeholder="Search by title, skill, or keyword..."
                className="w-full pl-12 pr-4 py-3 border border-charcoal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              {FILTERS.type.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? '' : type)}
                  className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    selectedType === type
                      ? 'bg-forest-600 text-white'
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

      {/* Job Listings */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            {/* Featured Jobs */}
            {filteredJobs.filter(j => j.featured).length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-heading font-bold text-charcoal-900 mb-6 flex items-center gap-2">
                  <Star size={18} className="text-gold-500 fill-gold-500" />
                  Featured Opportunities
                </h2>

                <div className="space-y-4">
                  {filteredJobs.filter(j => j.featured).map(job => (
                    <div
                      key={job.id}
                      className="bg-gradient-to-r from-gold-50 to-white rounded-2xl p-8 border-2 border-gold-200 hover:border-gold-400 transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-heading font-bold text-charcoal-900">
                              {job.title}
                            </h3>
                            {job.urgent && (
                              <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase">
                                Urgent
                              </span>
                            )}
                          </div>

                          <p className="text-forest-600 font-medium mb-3">
                            {job.client}
                          </p>

                          <p className="text-charcoal-600 mb-4">
                            {job.description}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-charcoal-500 mb-4">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {job.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign size={14} />
                              {job.rate}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-forest-100 text-forest-700 rounded-full text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <Link
                          href={`/contact?job=${job.id}`}
                          className="shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 rounded-full font-bold text-sm uppercase tracking-widest hover:shadow-lg transition-all"
                        >
                          Apply Now
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Jobs */}
            <div>
              <h2 className="text-xl font-heading font-bold text-charcoal-900 mb-6">
                All Positions ({filteredJobs.length})
              </h2>

              <div className="space-y-4">
                {filteredJobs.filter(j => !j.featured).map(job => (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl p-8 border border-charcoal-100 hover:border-forest-300 hover:shadow-elevation-md transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-heading font-bold text-charcoal-900">
                            {job.title}
                          </h3>
                          {job.urgent && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase">
                              Urgent
                            </span>
                          )}
                        </div>

                        <p className="text-forest-600 font-medium text-sm mb-3">
                          {job.client}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-charcoal-500 mb-4">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {job.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign size={14} />
                            {job.rate}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-charcoal-100 rounded text-xs text-charcoal-600"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Link
                        href={`/contact?job=${job.id}`}
                        className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-forest-600 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-forest-700 transition-all"
                      >
                        Apply
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
      <section className="py-20 bg-gradient-to-br from-gold-900/20 to-charcoal-900">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-6">
              Don't See the Right Fit?
            </h2>
            <p className="text-lg text-charcoal-300 mb-8">
              We have many more positions not listed here. Send us your resume and
              we'll match you with the perfect opportunity.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-all"
            >
              Submit Your Resume
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OpenPositionsPage;
