'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  TrendingUp,
  Shield,
  Users,
  BarChart3,
  Network,
  CheckCircle2,
  Code,
  Database,
  Settings,
  FileCheck,
  Workflow,
  Building2,
  Phone
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/templates';

const SERVICE_CATEGORIES = [
  {
    id: 'strategy',
    icon: TrendingUp,
    title: 'Strategy & Transformation',
    tagline: 'Chart your course to digital leadership',
    description: 'We help organizations navigate complex strategic decisions and execute transformational initiatives that drive sustainable growth.',
    services: [
      { name: 'Digital Transformation Strategy', description: 'End-to-end roadmaps for modernizing operations, technology, and customer experience.' },
      { name: 'M&A Due Diligence', description: 'Technology assessments, integration planning, and synergy identification for acquisitions.' },
      { name: 'Market Entry Strategy', description: 'Research-backed strategies for entering new markets, segments, or geographies.' },
      { name: 'Business Model Innovation', description: 'Reimagine revenue streams, value propositions, and go-to-market approaches.' },
      { name: 'Corporate Strategy', description: 'Portfolio optimization, competitive positioning, and long-term strategic planning.' }
    ],
    stats: [
      { value: '$2.5B+', label: 'Value Created' },
      { value: '150+', label: 'Transformations' },
      { value: '40%', label: 'Avg. Efficiency Gain' }
    ]
  },
  {
    id: 'technology',
    icon: Brain,
    title: 'Technology & Innovation',
    tagline: 'Architect your digital future',
    description: 'From cloud migrations to AI implementations, we design and deliver technology solutions that create competitive advantage.',
    services: [
      { name: 'Cloud Transformation', description: 'AWS, Azure, GCP migrations with architecture optimization and cost management.' },
      { name: 'Enterprise Architecture', description: 'Design scalable, secure, and efficient IT architectures aligned with business goals.' },
      { name: 'Legacy Modernization', description: 'Transform monolithic systems into modern, microservices-based architectures.' },
      { name: 'IT Strategy & Roadmapping', description: 'Align technology investments with business objectives and market trends.' },
      { name: 'Custom Software Development', description: 'Bespoke applications built with modern frameworks and best practices.' }
    ],
    stats: [
      { value: '500+', label: 'Cloud Migrations' },
      { value: '99.9%', label: 'Uptime Achieved' },
      { value: '60%', label: 'Cost Reduction' }
    ]
  },
  {
    id: 'risk',
    icon: Shield,
    title: 'Risk & Compliance',
    tagline: 'Protect what matters most',
    description: 'Navigate regulatory complexity and protect your organization from evolving cyber threats with our comprehensive risk management services.',
    services: [
      { name: 'Cybersecurity Assessment', description: 'Penetration testing, vulnerability assessments, and security architecture reviews.' },
      { name: 'Regulatory Compliance', description: 'GDPR, SOX, HIPAA, PCI-DSS compliance programs and audit preparation.' },
      { name: 'Risk Management Framework', description: 'Enterprise risk identification, assessment, and mitigation strategies.' },
      { name: 'Internal Audit', description: 'Process audits, control testing, and remediation guidance.' },
      { name: 'Business Continuity', description: 'Disaster recovery planning, backup strategies, and resilience testing.' }
    ],
    stats: [
      { value: '100%', label: 'Audit Success' },
      { value: '0', label: 'Breaches Post-Engagement' },
      { value: '85%', label: 'Risk Reduction' }
    ]
  },
  {
    id: 'workforce',
    icon: Users,
    title: 'Workforce Transformation',
    tagline: 'Build the teams of tomorrow',
    description: 'Design organizations that attract, develop, and retain top talent while enabling peak performance.',
    services: [
      { name: 'Organizational Design', description: 'Structure optimization, role clarity, and reporting alignment.' },
      { name: 'Talent Strategy', description: 'Workforce planning, recruitment optimization, and employer branding.' },
      { name: 'Leadership Development', description: 'Executive coaching, succession planning, and leadership programs.' },
      { name: 'HR Technology', description: 'HRIS implementation, Workday/SuccessFactors optimization, and analytics.' },
      { name: 'Change Management', description: 'Communication strategies, training programs, and adoption acceleration.' }
    ],
    stats: [
      { value: '35%', label: 'Productivity Gain' },
      { value: '50%', label: 'Turnover Reduction' },
      { value: '10K+', label: 'Leaders Developed' }
    ]
  },
  {
    id: 'process',
    icon: BarChart3,
    title: 'Process Optimization',
    tagline: 'Streamline for excellence',
    description: 'Eliminate waste, automate repetitive tasks, and optimize operations for maximum efficiency and quality.',
    services: [
      { name: 'Lean Six Sigma', description: 'Process improvement using DMAIC methodology and statistical analysis.' },
      { name: 'Process Mining', description: 'Data-driven process discovery and optimization using Celonis, UiPath, and similar tools.' },
      { name: 'Robotic Process Automation', description: 'RPA implementation for high-volume, rule-based processes.' },
      { name: 'Supply Chain Optimization', description: 'Inventory management, logistics, and supplier network optimization.' },
      { name: 'Cost Reduction Programs', description: 'Zero-based budgeting, spend analytics, and procurement optimization.' }
    ],
    stats: [
      { value: '70%', label: 'Process Time Reduction' },
      { value: '$500M+', label: 'Costs Saved' },
      { value: '200+', label: 'Bots Deployed' }
    ]
  },
  {
    id: 'data',
    icon: Network,
    title: 'Data & AI Strategy',
    tagline: 'Turn data into decisions',
    description: 'Unlock the value in your data with modern analytics, AI/ML solutions, and robust data governance.',
    services: [
      { name: 'Data Strategy & Governance', description: 'Data architecture, quality frameworks, and governance programs.' },
      { name: 'AI/ML Model Development', description: 'Custom machine learning models for prediction, classification, and optimization.' },
      { name: 'Business Intelligence', description: 'Dashboard development, KPI frameworks, and self-service analytics.' },
      { name: 'Predictive Analytics', description: 'Forecasting, propensity modeling, and risk scoring solutions.' },
      { name: 'Data Engineering', description: 'ETL pipelines, data lakes, and real-time streaming architectures.' }
    ],
    stats: [
      { value: '90%', label: 'Prediction Accuracy' },
      { value: '5x', label: 'Faster Insights' },
      { value: '100+', label: 'ML Models Deployed' }
    ]
  }
];

const CUSTOM_SOLUTIONS = [
  {
    icon: Code,
    title: 'Custom Software Development',
    description: 'Bespoke applications tailored to your unique business needs—from MVPs to enterprise platforms.',
    examples: ['Web applications', 'Mobile apps', 'APIs & integrations', 'Admin dashboards']
  },
  {
    icon: Database,
    title: 'Staff Augmentation',
    description: 'Skilled consultants embedded in your team—developers, architects, PMs, and analysts.',
    examples: ['Project-based', 'Long-term engagement', 'Team extension', 'Leadership roles']
  },
  {
    icon: Building2,
    title: 'RPO (Recruitment Process Outsourcing)',
    description: 'End-to-end recruitment management for high-volume or specialized hiring needs.',
    examples: ['Full-cycle recruiting', 'Sourcing only', 'Campus programs', 'Diversity initiatives']
  },
  {
    icon: Settings,
    title: 'System Integration',
    description: 'Connect disparate systems to create unified workflows and eliminate data silos.',
    examples: ['ERP integration', 'CRM connectivity', 'API development', 'Data synchronization']
  },
  {
    icon: FileCheck,
    title: 'Quality Assurance',
    description: 'Comprehensive testing services to ensure your software meets the highest standards.',
    examples: ['Manual testing', 'Automation', 'Performance testing', 'Security testing']
  },
  {
    icon: Workflow,
    title: 'HR Outsourcing',
    description: 'Complete HR operations management—payroll, benefits, compliance, and employee services.',
    examples: ['Payroll processing', 'Benefits admin', 'Compliance management', 'Employee helpdesk']
  }
];

export const ConsultingServicesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="relative py-32 bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-forest-900 via-charcoal-900 to-charcoal-950" />
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-forest-600/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-forest-500/10 text-forest-400 border border-forest-500/20 mb-8">
              <Building2 size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Our Services</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-heading font-black text-white leading-[0.95] mb-8">
              Enterprise-Grade{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-400 to-forest-500">
                Consulting Services
              </span>
            </h1>

            <p className="text-xl text-charcoal-300 font-light leading-relaxed mb-10 max-w-2xl">
              Comprehensive consulting across strategy, technology, risk, and operations.
              Same expertise as the Big 4—at 40-60% lower cost.
            </p>

            <Link
              href="/contact"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-all"
            >
              Request Proposal
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      {SERVICE_CATEGORIES.map((category, i) => (
        <section
          key={category.id}
          id={category.id}
          className={`py-24 ${i % 2 === 0 ? 'bg-white' : 'bg-charcoal-50'} scroll-mt-24`}
        >
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-start">
                {/* Left Column - Overview */}
                <div>
                  <div className="w-16 h-16 rounded-xl bg-forest-100 flex items-center justify-center mb-6">
                    <category.icon size={32} className="text-forest-600" />
                  </div>

                  <h2 className="text-3xl md:text-4xl font-heading font-black text-charcoal-900 mb-4">
                    {category.title}
                  </h2>

                  <p className="text-lg text-forest-600 font-medium mb-4">
                    {category.tagline}
                  </p>

                  <p className="text-charcoal-600 leading-relaxed mb-8">
                    {category.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6">
                    {category.stats.map((stat, j) => (
                      <div key={j} className="text-center">
                        <div className="text-2xl font-heading font-black text-forest-600 mb-1">
                          {stat.value}
                        </div>
                        <div className="text-xs text-charcoal-500 uppercase tracking-widest">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Services List */}
                <div className="bg-white rounded-2xl p-8 shadow-elevation-md border border-charcoal-100/50">
                  <h3 className="text-lg font-heading font-bold text-charcoal-900 mb-6">
                    Services Offered
                  </h3>

                  <div className="space-y-6">
                    {category.services.map((service, j) => (
                      <div key={j} className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 size={14} className="text-forest-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-charcoal-900 mb-1">
                            {service.name}
                          </h4>
                          <p className="text-sm text-charcoal-500">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-charcoal-100">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 text-forest-600 font-bold text-sm uppercase tracking-widest hover:gap-3 transition-all"
                    >
                      Discuss Your Needs
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Additional Services */}
      <section className="py-28 bg-charcoal-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-gold-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-black text-white mb-6">
              Additional <span className="text-gold-400">Services</span>
            </h2>
            <p className="text-lg text-charcoal-300 max-w-2xl mx-auto">
              Beyond consulting—we offer comprehensive solutions to support your growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {CUSTOM_SOLUTIONS.map((solution, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-gold-500/30 transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-xl bg-gold-500/20 flex items-center justify-center mb-6">
                  <solution.icon size={24} className="text-gold-400" />
                </div>

                <h3 className="text-lg font-heading font-bold text-white mb-3">
                  {solution.title}
                </h3>

                <p className="text-charcoal-400 text-sm leading-relaxed mb-4">
                  {solution.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {solution.examples.map((example, j) => (
                    <span
                      key={j}
                      className="px-3 py-1 bg-white/5 rounded-full text-xs text-charcoal-300"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-forest-900 to-charcoal-900">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-charcoal-300 mb-8">
              Contact us for a free 30-minute consultation to discuss your needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-all"
              >
                Schedule Consultation
                <ArrowRight size={16} />
              </Link>
              <a
                href="tel:+13076502850"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white/10 text-white border border-white/20 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/20 transition-all"
              >
                <Phone size={16} />
                +1 307-650-2850
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ConsultingServicesPage;
