'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  Database,
  Shield,
  Code,
  Brain,
  Layers,
  GitBranch,
  Award
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/marketing/templates';

const TECHNOLOGY_COMPETENCIES = [
  {
    category: 'Cloud Platforms',
    icon: Cloud,
    skills: [
      { name: 'Amazon Web Services (AWS)', level: 'Expert', certifications: ['Solutions Architect', 'DevOps Engineer', 'Security Specialty'] },
      { name: 'Microsoft Azure', level: 'Expert', certifications: ['Azure Administrator', 'Azure Developer', 'Azure Architect'] },
      { name: 'Google Cloud Platform', level: 'Advanced', certifications: ['Professional Cloud Architect', 'Data Engineer'] },
      { name: 'Multi-Cloud Strategy', level: 'Expert', certifications: [] }
    ]
  },
  {
    category: 'Enterprise Applications',
    icon: Layers,
    skills: [
      { name: 'Guidewire (PolicyCenter, BillingCenter, ClaimCenter)', level: 'Expert', certifications: ['ACE Certified'] },
      { name: 'Salesforce', level: 'Expert', certifications: ['Administrator', 'Developer', 'Architect'] },
      { name: 'SAP S/4HANA', level: 'Advanced', certifications: ['Certified Consultant'] },
      { name: 'Workday', level: 'Advanced', certifications: ['HCM Certified'] },
      { name: 'ServiceNow', level: 'Advanced', certifications: ['CSA', 'CIS'] }
    ]
  },
  {
    category: 'Data & Analytics',
    icon: Database,
    skills: [
      { name: 'Snowflake', level: 'Expert', certifications: ['SnowPro Core', 'SnowPro Advanced'] },
      { name: 'Databricks', level: 'Advanced', certifications: ['Data Engineer', 'ML Professional'] },
      { name: 'Tableau / Power BI', level: 'Expert', certifications: ['Desktop Specialist', 'Data Analyst'] },
      { name: 'Apache Spark / Kafka', level: 'Advanced', certifications: [] },
      { name: 'dbt / Airflow', level: 'Advanced', certifications: [] }
    ]
  },
  {
    category: 'AI & Machine Learning',
    icon: Brain,
    skills: [
      { name: 'TensorFlow / PyTorch', level: 'Expert', certifications: ['TensorFlow Developer'] },
      { name: 'OpenAI / LLMs', level: 'Expert', certifications: [] },
      { name: 'MLOps (MLflow, Kubeflow)', level: 'Advanced', certifications: [] },
      { name: 'Computer Vision', level: 'Advanced', certifications: [] },
      { name: 'NLP / Conversational AI', level: 'Expert', certifications: [] }
    ]
  },
  {
    category: 'Software Development',
    icon: Code,
    skills: [
      { name: 'Java / Spring Boot', level: 'Expert', certifications: ['Oracle Certified'] },
      { name: 'Python', level: 'Expert', certifications: ['PCEP', 'PCAP'] },
      { name: 'Node.js / TypeScript', level: 'Expert', certifications: [] },
      { name: 'React / Next.js', level: 'Expert', certifications: ['Meta Certified'] },
      { name: '.NET / C#', level: 'Advanced', certifications: ['Microsoft Certified'] }
    ]
  },
  {
    category: 'DevOps & Infrastructure',
    icon: GitBranch,
    skills: [
      { name: 'Kubernetes / Docker', level: 'Expert', certifications: ['CKA', 'CKAD'] },
      { name: 'Terraform / Infrastructure as Code', level: 'Expert', certifications: ['HashiCorp Certified'] },
      { name: 'CI/CD (Jenkins, GitHub Actions, GitLab)', level: 'Expert', certifications: [] },
      { name: 'Monitoring (Datadog, Prometheus, Grafana)', level: 'Advanced', certifications: [] }
    ]
  },
  {
    category: 'Cybersecurity',
    icon: Shield,
    skills: [
      { name: 'Penetration Testing', level: 'Expert', certifications: ['OSCP', 'CEH'] },
      { name: 'Cloud Security', level: 'Expert', certifications: ['AWS Security Specialty', 'CCSP'] },
      { name: 'Identity & Access Management', level: 'Expert', certifications: ['Okta Certified'] },
      { name: 'Compliance (SOC 2, ISO 27001, GDPR)', level: 'Expert', certifications: ['CISA', 'CISM'] }
    ]
  }
];

const METHODOLOGY_CERTIFICATIONS = [
  { name: 'Project Management Professional (PMP)', count: '25+' },
  { name: 'Certified Scrum Master (CSM)', count: '40+' },
  { name: 'SAFe Agilist', count: '15+' },
  { name: 'ITIL v4 Foundation', count: '30+' },
  { name: 'Six Sigma Black Belt', count: '12+' },
  { name: 'TOGAF Certified', count: '8+' }
];

const INDUSTRY_EXPERTISE = [
  'Insurance (P&C, Life, Health)',
  'Banking & Financial Services',
  'Healthcare & Life Sciences',
  'Retail & E-Commerce',
  'Manufacturing',
  'Technology & SaaS',
  'Energy & Utilities',
  'Government & Public Sector'
];

export const ConsultingCompetenciesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="relative py-32 bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-forest-900 via-charcoal-900 to-charcoal-950" />
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-forest-600/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gold-600/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 mb-8">
              <Award size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Our Competencies</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-heading font-black text-white leading-[0.95] mb-8">
              Deep Expertise,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                Certified Skills
              </span>
            </h1>

            <p className="text-xl text-charcoal-300 font-light leading-relaxed max-w-2xl">
              Our consultants bring verified expertise across 50+ technologies, 8+ industries,
              and all major cloud platforms. Every skill is battle-tested on real projects.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-white border-b border-charcoal-100">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-heading font-black text-forest-600 mb-2">500+</div>
              <div className="text-sm text-charcoal-500 uppercase tracking-widest">Certifications</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-heading font-black text-forest-600 mb-2">50+</div>
              <div className="text-sm text-charcoal-500 uppercase tracking-widest">Technologies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-heading font-black text-forest-600 mb-2">15+</div>
              <div className="text-sm text-charcoal-500 uppercase tracking-widest">Years Avg. Experience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-heading font-black text-forest-600 mb-2">100%</div>
              <div className="text-sm text-charcoal-500 uppercase tracking-widest">Delivery Success</div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Competencies */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-black text-charcoal-900 mb-6">
              Technology <span className="text-forest-600">Competencies</span>
            </h2>
            <p className="text-lg text-charcoal-500 max-w-2xl mx-auto">
              Our consultants maintain certifications across all major platforms and technologies.
            </p>
          </div>

          <div className="space-y-12 max-w-6xl mx-auto">
            {TECHNOLOGY_COMPETENCIES.map((category, i) => (
              <div key={i} className="bg-charcoal-50 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center">
                    <category.icon size={24} className="text-forest-600" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-charcoal-900">
                    {category.category}
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {category.skills.map((skill, j) => (
                    <div
                      key={j}
                      className="bg-white rounded-xl p-5 border border-charcoal-100"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-charcoal-900 flex-1">
                          {skill.name}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          skill.level === 'Expert'
                            ? 'bg-forest-100 text-forest-700'
                            : 'bg-gold-100 text-gold-700'
                        }`}>
                          {skill.level}
                        </span>
                      </div>
                      {skill.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {skill.certifications.map((cert, k) => (
                            <span
                              key={k}
                              className="px-2 py-1 bg-charcoal-100 rounded text-xs text-charcoal-600"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology & Industry */}
      <section className="py-28 bg-charcoal-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gold-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            {/* Methodology */}
            <div>
              <h2 className="text-3xl font-heading font-black text-white mb-8">
                Methodology <span className="text-gold-400">Certifications</span>
              </h2>

              <div className="space-y-4">
                {METHODOLOGY_CERTIFICATIONS.map((cert, i) => (
                  <div
                    key={i}
                    className="bg-white/5 rounded-xl p-5 border border-white/10 flex items-center justify-between"
                  >
                    <span className="text-white font-medium">{cert.name}</span>
                    <span className="px-3 py-1 bg-gold-500/20 rounded-full text-gold-400 text-sm font-bold">
                      {cert.count} certified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry Expertise */}
            <div>
              <h2 className="text-3xl font-heading font-black text-white mb-8">
                Industry <span className="text-gold-400">Expertise</span>
              </h2>

              <div className="space-y-3">
                {INDUSTRY_EXPERTISE.map((industry, i) => (
                  <div
                    key={i}
                    className="bg-white/5 rounded-xl p-5 border border-white/10 flex items-center gap-3"
                  >
                    <CheckCircle2 size={18} className="text-forest-400" />
                    <span className="text-white">{industry}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-forest-900 to-charcoal-900">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-6">
              Need Specialized Expertise?
            </h2>
            <p className="text-lg text-charcoal-300 mb-8">
              Tell us about your project and we&apos;ll match you with the right consultants.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-all"
              >
                Discuss Your Project
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/consulting/services"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white/10 text-white border border-white/20 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/20 transition-all"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ConsultingCompetenciesPage;
