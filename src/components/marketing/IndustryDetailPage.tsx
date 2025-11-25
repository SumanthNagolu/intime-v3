'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Clock,
  Shield,
  TrendingUp,
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
  Wifi,
  Car,
  ShoppingBag,
  Landmark,
  Briefcase,
  Phone
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/templates';

export const INDUSTRIES_DATA: Record<string, {
  title: string;
  icon: React.ElementType;
  tagline: string;
  description: string;
  marketSize: string;
  keyRoles: string[];
  challenges: string[];
  solutions: string[];
  stats: { value: string; label: string }[];
  caseStudy?: { client: string; result: string; metric: string };
  certifications?: string[];
  color: string;
}> = {
  'information-technology': {
    title: 'Information Technology',
    icon: Monitor,
    tagline: 'Power your digital transformation with top tech talent',
    description: 'From enterprise software to cutting-edge AI, we provide technology professionals who drive innovation and deliver results. Our IT specialists have expertise across cloud platforms, cybersecurity, data engineering, and modern software development.',
    marketSize: '$5.2T',
    keyRoles: ['Software Engineers', 'Cloud Architects', 'DevOps Engineers', 'Data Scientists', 'Security Analysts', 'IT Project Managers', 'Full-Stack Developers', 'System Administrators'],
    challenges: ['Rapid technology evolution', 'Talent scarcity for emerging tech', 'Security and compliance requirements', 'Legacy system modernization', 'Remote team coordination'],
    solutions: ['Pre-vetted candidates with verified skills', 'Specialized training programs through InTime Academy', 'Security-cleared professionals available', 'Agile team augmentation', '48-hour placement SLA'],
    stats: [
      { value: '500+', label: 'IT Professionals Placed' },
      { value: '95%', label: 'Retention Rate' },
      { value: '48hrs', label: 'Avg. Time to Fill' }
    ],
    caseStudy: { client: 'Fortune 500 Insurance Carrier', result: 'Delivered 25-person Guidewire implementation team', metric: '6 months ahead of schedule' },
    certifications: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'CISSP', 'PMP'],
    color: 'forest'
  },
  'healthcare': {
    title: 'Healthcare & Life Sciences',
    icon: Heart,
    tagline: 'HIPAA-compliant talent for clinical and health IT',
    description: 'Healthcare demands professionals who understand both technology and the critical nature of patient care. We provide HIPAA-trained specialists experienced with Epic, Cerner, and modern health IT systems.',
    marketSize: '$4.5T',
    keyRoles: ['Health IT Specialists', 'Epic/Cerner Analysts', 'Clinical Data Analysts', 'Healthcare PMs', 'Biomedical Engineers', 'Compliance Officers', 'RCM Specialists'],
    challenges: ['HIPAA compliance requirements', 'EHR implementation complexity', 'Interoperability challenges', 'Data privacy concerns', 'Regulatory changes'],
    solutions: ['HIPAA-trained professionals', 'Epic/Cerner certified specialists', 'Clinical workflow expertise', 'Compliance-first approach', 'Healthcare background verification'],
    stats: [
      { value: '200+', label: 'Healthcare IT Placements' },
      { value: '100%', label: 'HIPAA Compliance' },
      { value: '0', label: 'Security Incidents' }
    ],
    certifications: ['Epic', 'Cerner', 'HIPAA', 'HL7 FHIR', 'CPHIMS'],
    color: 'rose'
  },
  'engineering': {
    title: 'Engineering',
    icon: Cog,
    tagline: 'PE-licensed professionals across all engineering disciplines',
    description: 'From mechanical to civil to electrical engineering, we connect you with licensed professionals who bring precision, expertise, and innovation to your projects.',
    marketSize: '$1.8T',
    keyRoles: ['Mechanical Engineers', 'Civil Engineers', 'Electrical Engineers', 'Aerospace Engineers', 'Structural Engineers', 'Process Engineers', 'CAD Designers'],
    challenges: ['PE licensing requirements', 'Industry-specific expertise', 'Project timeline pressures', 'Regulatory compliance', 'Cross-functional coordination'],
    solutions: ['PE-licensed professionals', 'Industry-specific experience', 'CAD/CAM proficiency', 'Regulatory expertise', 'Project-based engagement'],
    stats: [
      { value: '150+', label: 'Engineering Placements' },
      { value: '85%', label: 'PE Licensed' },
      { value: '30+', label: 'Industries Served' }
    ],
    certifications: ['PE', 'FE', 'AutoCAD', 'SolidWorks', 'Six Sigma'],
    color: 'slate'
  },
  'manufacturing': {
    title: 'Manufacturing',
    icon: Factory,
    tagline: 'Lean Six Sigma certified talent for production excellence',
    description: 'Manufacturing success requires operational excellence. We provide professionals trained in lean methodologies, quality management, and modern production technologies.',
    marketSize: '$2.3T',
    keyRoles: ['Plant Managers', 'Production Supervisors', 'Quality Engineers', 'Supply Chain Managers', 'Automation Engineers', 'Lean Consultants', 'Maintenance Technicians'],
    challenges: ['Supply chain disruptions', 'Quality control demands', 'Automation adoption', 'Workforce skill gaps', 'Safety compliance'],
    solutions: ['Lean Six Sigma certified pros', 'ERP/MES expertise', 'Safety-trained workforce', 'Automation specialists', 'Quality management experts'],
    stats: [
      { value: '100+', label: 'Manufacturing Placements' },
      { value: '40%', label: 'Efficiency Improvement' },
      { value: '90%', label: 'Safety Compliance' }
    ],
    certifications: ['Six Sigma', 'Lean', 'PMP', 'OSHA', 'SAP'],
    color: 'amber'
  },
  'financial-accounting': {
    title: 'Financial Services & Accounting',
    icon: Building2,
    tagline: 'SEC/FINRA compliant professionals for financial excellence',
    description: 'Financial services demand precision, compliance, and expertise. We provide CPA, CFA, and FINRA-licensed professionals who understand regulatory requirements.',
    marketSize: '$26T',
    keyRoles: ['Financial Analysts', 'CPAs', 'Risk Managers', 'Compliance Officers', 'Investment Analysts', 'Auditors', 'Treasury Managers', 'Blockchain Specialists'],
    challenges: ['Regulatory compliance', 'Market volatility', 'Digital transformation', 'Cybersecurity threats', 'Talent retention'],
    solutions: ['CPA/CFA certified professionals', 'FINRA-registered specialists', 'SOX compliance expertise', 'Fintech experience', 'Risk management pros'],
    stats: [
      { value: '250+', label: 'Finance Placements' },
      { value: '100%', label: 'Compliance Rate' },
      { value: '15+', label: 'Years Avg. Experience' }
    ],
    certifications: ['CPA', 'CFA', 'FINRA', 'SOX', 'CAMS'],
    color: 'emerald'
  },
  'ai-ml-data': {
    title: 'AI, ML & Data Science',
    icon: Brain,
    tagline: 'Production ML engineers with PyTorch, TensorFlow expertise',
    description: 'AI and data science require specialized talent that combines technical depth with business acumen. We provide ML engineers, data scientists, and AI specialists who deliver production-grade solutions.',
    marketSize: '$200B',
    keyRoles: ['ML Engineers', 'Data Scientists', 'AI Researchers', 'NLP Specialists', 'Computer Vision Engineers', 'MLOps Engineers', 'Data Engineers'],
    challenges: ['Scarcity of experienced talent', 'Production deployment complexity', 'Model governance', 'Ethical AI concerns', 'Data quality issues'],
    solutions: ['Production ML experience', 'End-to-end pipeline expertise', 'MLOps best practices', 'Research-to-production transition', 'GPU/cloud optimization'],
    stats: [
      { value: '100+', label: 'AI/ML Placements' },
      { value: '90%', label: 'Production Success' },
      { value: '50+', label: 'Models Deployed' }
    ],
    certifications: ['TensorFlow', 'PyTorch', 'AWS ML', 'GCP AI', 'Databricks'],
    color: 'violet'
  },
  'legal': {
    title: 'Legal',
    icon: Scale,
    tagline: 'Bar-certified attorneys and legal technology specialists',
    description: 'Legal services require professionals who understand both law and technology. We provide attorneys, paralegals, and legal tech specialists for law firms and corporate legal departments.',
    marketSize: '$350B',
    keyRoles: ['Attorneys', 'Paralegals', 'Legal Analysts', 'eDiscovery Specialists', 'Contract Managers', 'Compliance Attorneys', 'Legal Tech Specialists'],
    challenges: ['Document management', 'eDiscovery requirements', 'Compliance complexity', 'Technology adoption', 'Cost pressures'],
    solutions: ['Bar-certified professionals', 'eDiscovery expertise', 'Contract lifecycle management', 'Legal tech implementation', 'Compliance specialists'],
    stats: [
      { value: '75+', label: 'Legal Placements' },
      { value: '100%', label: 'Bar Certified' },
      { value: '40%', label: 'Cost Reduction' }
    ],
    certifications: ['Bar Certification', 'Relativity', 'CIPP', 'CCPA'],
    color: 'indigo'
  },
  'warehouse-distribution': {
    title: 'Warehouse & Distribution',
    icon: Warehouse,
    tagline: 'OSHA certified, forklift-trained distribution specialists',
    description: 'Distribution centers require skilled workers who prioritize safety and efficiency. We provide trained warehouse professionals for surge staffing and permanent roles.',
    marketSize: '$450B',
    keyRoles: ['Warehouse Managers', 'Logistics Coordinators', 'Forklift Operators', 'Inventory Specialists', 'Shipping/Receiving Clerks', 'WMS Administrators'],
    challenges: ['Seasonal demand fluctuations', 'Safety compliance', 'Technology adoption', 'Labor shortages', 'Efficiency pressures'],
    solutions: ['OSHA-trained workforce', 'Forklift certified operators', 'WMS expertise', 'Surge staffing capability', '24/7 availability'],
    stats: [
      { value: '500+', label: 'Warehouse Placements' },
      { value: '100%', label: 'OSHA Compliant' },
      { value: '24hr', label: 'Rapid Deployment' }
    ],
    certifications: ['OSHA', 'Forklift', 'HAZMAT', 'WMS'],
    color: 'orange'
  },
  'logistics': {
    title: 'Logistics & Supply Chain',
    icon: Truck,
    tagline: 'WMS/TMS certified supply chain and freight professionals',
    description: 'Supply chain excellence requires professionals who understand end-to-end logistics. We provide WMS/TMS experts, freight specialists, and supply chain strategists.',
    marketSize: '$1.6T',
    keyRoles: ['Supply Chain Managers', 'Logistics Analysts', 'Transportation Managers', 'Procurement Specialists', 'Demand Planners', 'S&OP Analysts'],
    challenges: ['Supply chain disruptions', 'Cost optimization', 'Visibility challenges', 'Sustainability requirements', 'Technology integration'],
    solutions: ['WMS/TMS expertise', 'End-to-end visibility', 'Cost optimization focus', 'Sustainability experts', 'Analytics capabilities'],
    stats: [
      { value: '120+', label: 'Supply Chain Placements' },
      { value: '25%', label: 'Cost Reduction' },
      { value: '99%', label: 'On-Time Delivery' }
    ],
    certifications: ['CSCP', 'CPIM', 'CLTD', 'SAP SCM'],
    color: 'cyan'
  },
  'hospitality': {
    title: 'Hospitality',
    icon: UtensilsCrossed,
    tagline: 'Hotel management and restaurant operations specialists',
    description: 'Hospitality success depends on exceptional service. We provide experienced hospitality professionals for hotels, restaurants, and travel technology companies.',
    marketSize: '$1.2T',
    keyRoles: ['Hotel Managers', 'Restaurant Managers', 'Event Coordinators', 'F&B Directors', 'Revenue Managers', 'Guest Services Managers'],
    challenges: ['Seasonal staffing', 'Service quality consistency', 'Technology adoption', 'Labor costs', 'Guest expectations'],
    solutions: ['Experienced hospitality pros', 'POS/PMS expertise', 'Multi-property experience', 'Service excellence training', 'Flexible staffing'],
    stats: [
      { value: '200+', label: 'Hospitality Placements' },
      { value: '4.8★', label: 'Avg. Guest Rating' },
      { value: '35%', label: 'Revenue Increase' }
    ],
    certifications: ['CHM', 'CHSP', 'ServSafe', 'PMS'],
    color: 'pink'
  },
  'human-resources': {
    title: 'Human Resources',
    icon: Users,
    tagline: 'HRIS certified talent in Workday and SuccessFactors',
    description: 'HR transformation requires professionals who understand both people and technology. We provide HRIS specialists, talent acquisition experts, and HR business partners.',
    marketSize: '$240B',
    keyRoles: ['HR Business Partners', 'HRIS Analysts', 'Recruiters', 'Compensation Analysts', 'L&D Specialists', 'Employee Relations Managers'],
    challenges: ['HRIS implementation', 'Employee experience', 'Compliance requirements', 'Talent retention', 'Remote workforce management'],
    solutions: ['Workday/SuccessFactors experts', 'Employee experience focus', 'Compliance specialists', 'Analytics capabilities', 'Change management expertise'],
    stats: [
      { value: '80+', label: 'HR Placements' },
      { value: '50%', label: 'Faster Implementations' },
      { value: '30%', label: 'Retention Improvement' }
    ],
    certifications: ['Workday', 'SuccessFactors', 'PHR/SPHR', 'SHRM'],
    color: 'teal'
  },
  'telecom-technology': {
    title: 'Telecom & Technology',
    icon: Wifi,
    tagline: '5G engineers and network architecture specialists',
    description: 'Telecommunications demands specialists who understand network infrastructure, 5G, and emerging connectivity technologies. We provide engineers and architects for carriers and ISPs.',
    marketSize: '$1.7T',
    keyRoles: ['Network Engineers', '5G Specialists', 'NOC Engineers', 'RF Engineers', 'OSS/BSS Analysts', 'Telecom PMs'],
    challenges: ['5G deployment', 'Network modernization', 'Security concerns', 'Regulatory compliance', 'Skill gaps'],
    solutions: ['5G expertise', 'Network architecture', 'Security specialists', 'Vendor certifications', 'Project management'],
    stats: [
      { value: '100+', label: 'Telecom Placements' },
      { value: '99.99%', label: 'Network Uptime' },
      { value: '50+', label: 'Carriers Served' }
    ],
    certifications: ['CCNA', 'CCNP', 'Nokia', 'Ericsson', '5G NR'],
    color: 'sky'
  },
  'automobile': {
    title: 'Automotive',
    icon: Car,
    tagline: 'Automotive engineers and EV specialists',
    description: 'The automotive industry is transforming with electric vehicles and autonomous technology. We provide engineers and specialists for OEMs and suppliers.',
    marketSize: '$3.5T',
    keyRoles: ['Automotive Engineers', 'EV Specialists', 'ADAS Engineers', 'Quality Engineers', 'Manufacturing Engineers', 'Embedded Systems Engineers'],
    challenges: ['EV transition', 'Autonomous systems', 'Supply chain pressures', 'Quality demands', 'Software integration'],
    solutions: ['EV/ADAS expertise', 'Embedded systems', 'Quality certifications', 'OEM experience', 'Agile automotive'],
    stats: [
      { value: '75+', label: 'Automotive Placements' },
      { value: '60%', label: 'EV Experience' },
      { value: '10+', label: 'OEMs Served' }
    ],
    certifications: ['IATF 16949', 'ASPICE', 'ISO 26262', 'CAN/LIN'],
    color: 'red'
  },
  'retail': {
    title: 'Retail & E-Commerce',
    icon: ShoppingBag,
    tagline: 'POS certified staff for seasonal and corporate roles',
    description: 'Retail success requires omnichannel expertise. We provide e-commerce specialists, merchandising experts, and store operations professionals.',
    marketSize: '$5.6T',
    keyRoles: ['E-Commerce Managers', 'Merchandisers', 'Store Managers', 'Category Managers', 'Supply Chain Analysts', 'Digital Marketing Managers'],
    challenges: ['Omnichannel integration', 'Seasonal fluctuations', 'Customer experience', 'Inventory management', 'Digital transformation'],
    solutions: ['E-commerce expertise', 'POS/WMS knowledge', 'Seasonal staffing', 'Customer experience focus', 'Analytics capabilities'],
    stats: [
      { value: '300+', label: 'Retail Placements' },
      { value: '40%', label: 'Sales Increase' },
      { value: '24hr', label: 'Seasonal Staffing' }
    ],
    certifications: ['Shopify', 'Magento', 'SAP Retail', 'Oracle Retail'],
    color: 'fuchsia'
  },
  'government-public-sector': {
    title: 'Government & Public Sector',
    icon: Landmark,
    tagline: 'Security-cleared talent for federal and state projects',
    description: 'Government projects require professionals with security clearances and compliance expertise. We provide cleared talent for federal, state, and local government agencies.',
    marketSize: '$2.1T',
    keyRoles: ['Program Managers', 'Systems Engineers', 'Security Specialists', 'Data Analysts', 'Policy Analysts', 'IT Specialists'],
    challenges: ['Security clearance requirements', 'Compliance complexity', 'Budget constraints', 'Procurement processes', 'Legacy modernization'],
    solutions: ['Security-cleared professionals', 'FedRAMP expertise', 'Government contracting experience', 'Compliance specialists', 'Agile in government'],
    stats: [
      { value: '150+', label: 'Gov Placements' },
      { value: '100%', label: 'Cleared Talent' },
      { value: '50+', label: 'Agencies Served' }
    ],
    certifications: ['Security Clearance', 'FedRAMP', 'CMMC', 'CompTIA Sec+'],
    color: 'blue'
  }
};

interface IndustryDetailPageProps {
  slug: string;
}

export const IndustryDetailPage: React.FC<IndustryDetailPageProps> = ({ slug }) => {
  const industry = INDUSTRIES_DATA[slug];

  if (!industry) {
    return (
      <div className="min-h-screen bg-ivory">
        <MarketingNavbar />
        <div className="container mx-auto px-6 py-32 text-center">
          <h1 className="text-4xl font-heading font-bold text-charcoal-900 mb-4">Industry Not Found</h1>
          <p className="text-charcoal-500 mb-8">The industry you're looking for doesn't exist.</p>
          <Link href="/industries" className="text-forest-600 font-bold">
            View All Industries →
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const Icon = industry.icon;
  const colorVariants: Record<string, { bg: string; text: string; border: string; light: string }> = {
    forest: { bg: 'bg-forest-600', text: 'text-forest-600', border: 'border-forest-500', light: 'bg-forest-100' },
    rose: { bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-500', light: 'bg-rose-100' },
    slate: { bg: 'bg-slate-600', text: 'text-slate-600', border: 'border-slate-500', light: 'bg-slate-100' },
    amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-500', light: 'bg-amber-100' },
    emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-500', light: 'bg-emerald-100' },
    violet: { bg: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-500', light: 'bg-violet-100' },
    indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-500', light: 'bg-indigo-100' },
    orange: { bg: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-500', light: 'bg-orange-100' },
    cyan: { bg: 'bg-cyan-600', text: 'text-cyan-600', border: 'border-cyan-500', light: 'bg-cyan-100' },
    pink: { bg: 'bg-pink-600', text: 'text-pink-600', border: 'border-pink-500', light: 'bg-pink-100' },
    teal: { bg: 'bg-teal-600', text: 'text-teal-600', border: 'border-teal-500', light: 'bg-teal-100' },
    sky: { bg: 'bg-sky-600', text: 'text-sky-600', border: 'border-sky-500', light: 'bg-sky-100' },
    red: { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-500', light: 'bg-red-100' },
    fuchsia: { bg: 'bg-fuchsia-600', text: 'text-fuchsia-600', border: 'border-fuchsia-500', light: 'bg-fuchsia-100' },
    blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-500', light: 'bg-blue-100' }
  };

  const colors = colorVariants[industry.color] || colorVariants.forest;

  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="relative py-32 bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal-800 via-charcoal-900 to-charcoal-950" />
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-forest-600/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold-600/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <Link
              href="/industries"
              className="inline-flex items-center gap-2 text-charcoal-400 hover:text-white transition-colors mb-8"
            >
              ← Back to Industries
            </Link>

            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${colors.light} mb-8`}>
              <Icon size={40} className={colors.text} />
            </div>

            <h1 className="text-5xl md:text-6xl font-heading font-black text-white leading-[0.95] mb-6">
              {industry.title}
            </h1>

            <p className="text-xl text-gold-400 font-medium mb-6">
              {industry.tagline}
            </p>

            <p className="text-lg text-charcoal-300 font-light leading-relaxed mb-8 max-w-3xl">
              {industry.description}
            </p>

            <div className="flex flex-wrap gap-6">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-all"
              >
                Request Talent
                <ArrowRight size={16} />
              </Link>
              <a
                href="tel:+13076502850"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white/10 text-white border border-white/20 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/20 transition-all"
              >
                <Phone size={16} />
                Talk to an Expert
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-white border-b border-charcoal-100">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className={`text-3xl font-heading font-black ${colors.text} mb-1`}>
                {industry.marketSize}
              </div>
              <div className="text-sm text-charcoal-500 uppercase tracking-widest">Market Size</div>
            </div>
            {industry.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className={`text-3xl font-heading font-black ${colors.text} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-sm text-charcoal-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Roles */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-heading font-black text-charcoal-900 mb-8">
              Key Roles We Fill
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {industry.keyRoles.map((role, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-4 rounded-xl ${colors.light}`}
                >
                  <Briefcase size={18} className={colors.text} />
                  <span className="font-medium text-charcoal-800">{role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Challenges & Solutions */}
      <section className="py-20 bg-charcoal-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Challenges */}
              <div>
                <h2 className="text-2xl font-heading font-bold text-charcoal-900 mb-6">
                  Industry Challenges
                </h2>
                <div className="space-y-4">
                  {industry.challenges.map((challenge, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-charcoal-200 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-charcoal-600 text-sm">{i + 1}</span>
                      </div>
                      <span className="text-charcoal-700">{challenge}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solutions */}
              <div>
                <h2 className="text-2xl font-heading font-bold text-charcoal-900 mb-6">
                  How We Solve Them
                </h2>
                <div className="space-y-4">
                  {industry.solutions.map((solution, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className={`${colors.text} shrink-0 mt-0.5`} />
                      <span className="text-charcoal-700">{solution}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      {industry.certifications && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-heading font-bold text-charcoal-900 mb-6 text-center">
                Our Certifications & Expertise
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {industry.certifications.map((cert, i) => (
                  <span
                    key={i}
                    className={`px-4 py-2 rounded-full ${colors.light} ${colors.text} font-medium text-sm`}
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Case Study */}
      {industry.caseStudy && (
        <section className="py-20 bg-charcoal-900">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 text-gold-400 text-xs font-bold uppercase tracking-widest mb-6">
                <Award size={14} />
                Case Study
              </div>
              <h2 className="text-3xl font-heading font-bold text-white mb-6">
                {industry.caseStudy.client}
              </h2>
              <p className="text-xl text-charcoal-300 mb-4">
                {industry.caseStudy.result}
              </p>
              <div className="inline-block bg-gold-500/20 px-6 py-3 rounded-xl">
                <span className="text-gold-400 font-bold">{industry.caseStudy.metric}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-forest-900 to-charcoal-900">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-6">
              Ready to Build Your {industry.title} Team?
            </h2>
            <p className="text-lg text-charcoal-300 mb-8">
              Get matched with pre-vetted professionals in 48 hours.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-all"
              >
                Request Talent
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/careers/available-talent"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white/10 text-white border border-white/20 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/20 transition-all"
              >
                Browse Available Talent
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default IndustryDetailPage;
