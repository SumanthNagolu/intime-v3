import { Check, Clock, Shield, TrendingUp, Code2, Briefcase, Server, Network, Database } from 'lucide-react';
import Link from 'next/link';

export default function ITStaffingPage() {
  const PROCESS_STEPS = [
    {
      id: "01",
      title: "Understand",
      desc: "We don't just read JD's. We map your architecture, culture, and timeline constraints.",
      details: ["Discovery Call", "Technical Mapping", "Cultural Fit", "Budget Alignment"]
    },
    {
      id: "02",
      title: "Source",
      desc: "We don't post ads. We activate our pre-vetted bench of 500+ consultants.",
      details: ["AI Matching", "Manual Vetting", "Skill Verification", "Reference Checks"]
    },
    {
      id: "03",
      title: "Submit",
      desc: "We don't flood your inbox. We send 3 profiles. You interview 3. You hire 1.",
      details: ["Custom Presentation", "Skill Matrix", "Availability Lock", "Rate Negotiation"]
    },
    {
      id: "04",
      title: "Support",
      desc: "We don't disappear. We manage onboarding, performance, and retention.",
      details: ["Interview Ops", "Offer Management", "Onboarding", "Retention Tracking"]
    }
  ];

  const DOMAINS = [
    { name: 'Database Admin', icon: Database, desc: 'Oracle, MySQL, PostgreSQL, Mongo' },
    { name: 'Enterprise Systems', icon: Server, desc: 'SAP, Oracle, MS Dynamics' },
    { name: 'Network & Cloud', icon: Network, desc: 'AWS, Azure, Cisco, ITIL' },
    { name: 'Software Eng', icon: Code2, desc: 'Java, Python, .NET, Node.js' },
    { name: 'Project Mgmt', icon: Briefcase, desc: 'Agile, Scrum, SAFe, PMP' },
    { name: 'Quality Assurance', icon: Shield, desc: 'Selenium, Cypress, LoadRunner' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Hero */}
      <section className="py-24 border-b-2 border-black bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <span className="text-[#C87941] font-bold uppercase tracking-widest mb-4 block">Staffing v3.0</span>
            <h1 className="text-6xl font-heading font-bold mb-8 text-black">
              IT Staffing That Ships.<br/>
              <span className="italic font-serif">Reliably. Securely. Fast.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              From immediate contract needs to strategic permanent hires, we connect you with pre-vetted, transformation-ready IT professionals.
              <br/><br/>
              <span className="font-bold text-black">95% First-Submission Success. 48-Hour SLAs. No Excuses.</span>
            </p>
            <div className="flex gap-6">
              <Link href="/contact?type=staffing">
                <button className="bg-black text-white px-10 py-5 font-bold uppercase tracking-widest hover:bg-[#C87941] transition-colors">
                  Get Started Today
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The 4-Step Process */}
      <section className="py-24 border-b-2 border-black">
        <div className="container mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-4xl font-heading font-bold mb-4">The Methodology</h2>
            <p className="text-gray-600">How we deliver quality at speed.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step) => (
              <div key={step.id} className="bg-white border-2 border-black p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group">
                <div className="text-5xl font-heading font-bold text-gray-200 mb-6 group-hover:text-[#C87941] transition-colors">{step.id}</div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">{step.desc}</p>
                <ul className="space-y-2">
                  {step.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 bg-black"></div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Models */}
      <section className="py-24 bg-white border-b-2 border-black">
        <div className="container mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-4xl font-heading font-bold mb-4">Engagement Models</h2>
            <p className="text-gray-600">Flexible structures for every stage of growth.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contract */}
            <div className="border-2 border-black p-10">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Contract Staffing</h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Perfect for project-based needs and temporary spikes. Scale up or down instantly.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-[#C87941]" /> <span>Immediate Access</span></li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-[#C87941]" /> <span>Payroll Management</span></li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-[#C87941]" /> <span>Performance Monitoring</span></li>
              </ul>
            </div>

            {/* Contract-to-Hire */}
            <div className="border-2 border-black p-10 bg-black text-white">
              <div className="w-12 h-12 bg-white text-black flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Contract-to-Hire</h3>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                Try before you buy. Evaluate performance in the real world before committing.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-[#C87941]" /> <span>Reduced Hiring Risk</span></li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-[#C87941]" /> <span>Seamless Conversion</span></li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-[#C87941]" /> <span>70% Conversion Rate</span></li>
              </ul>
            </div>

            {/* Direct Placement */}
            <div className="border-2 border-black p-10">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Direct Placement</h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Find your next permanent leader. We headhunt the passive candidates others can't reach.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-[#C87941]" /> <span>90-Day Warranty</span></li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-[#C87941]" /> <span>Executive Search</span></li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-[#C87941]" /> <span>95% Retention</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Domains */}
      <section className="py-24 bg-[#F5F3EF]">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-heading font-bold mb-4">Domains & Expertise</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We specialize across the full IT landscape, from infrastructure to applications.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {DOMAINS.map((domain, i) => (
              <div key={i} className="bg-white p-6 flex items-start gap-4 border-2 border-transparent hover:border-black transition-colors">
                <domain.icon className="w-8 h-8 text-[#C87941]" />
                <div>
                  <h4 className="font-bold text-lg">{domain.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{domain.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
