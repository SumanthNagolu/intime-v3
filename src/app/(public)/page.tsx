import Link from 'next/link';
import { ArrowRight, Zap, Globe, Users, Briefcase, GraduationCap, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b-2 border-black bg-[#F5F3EF] py-32 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-block bg-black text-white px-4 py-1 text-xs font-bold uppercase tracking-widest mb-8">
              System v3.0 Online
            </div>
            <h1 className="text-6xl md:text-8xl font-heading font-bold text-black mb-8 leading-[0.9] tracking-tight">
              Staffing. <br/>
              <span className="font-serif italic">Re-Engineered.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mb-12 leading-relaxed">
              We replaced the recruiter with an algorithm and the classroom with a simulation. 
              The result? <span className="text-black font-bold underline decoration-[#C87941] decoration-4 underline-offset-4">48-hour placements</span> and senior-grade talent on Day 1.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/contact">
                <button className="bg-black text-white px-10 py-5 font-bold uppercase tracking-widest hover:bg-[#C87941] transition-colors flex items-center gap-3">
                  Hire Talent
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/academy">
                <button className="bg-transparent border-2 border-black text-black px-10 py-5 font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                  Join Academy
                </button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Abstract decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full border-l-2 border-black hidden lg:block bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      </section>

      {/* Metrics Ticker */}
      <section className="border-b-2 border-black bg-black text-white py-12 overflow-hidden">
        <div className="container mx-auto px-6 flex flex-wrap justify-between items-center gap-8">
          {[
            { label: "Placement Speed", value: "48 Hours" },
            { label: "Placement Success", value: "95%" },
            { label: "Active Consultants", value: "500+" },
            { label: "Global Reach", value: "3 Countries" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-4xl font-heading font-bold text-[#C87941]">{stat.value}</span>
              <span className="text-xs uppercase tracking-widest text-gray-400 mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* The Three Pillars */}
      <section className="py-32 bg-white border-b-2 border-black">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-px bg-black border-2 border-black">
            {[
              {
                icon: Zap,
                title: "Velocity",
                desc: "Speed is a function of preparation. We don't search for candidates; we deploy them from our pre-vetted bench."
              },
              {
                icon: ShieldCheck,
                title: "Quality",
                desc: "We manufacture seniority. Our academy turns junior developers into senior architects through 7 years of simulated experience."
              },
              {
                icon: Globe,
                title: "Scale",
                desc: "Borders are imaginary. Our cross-border pipeline moves talent from India to Canada to the USA seamlessly."
              }
            ].map((pillar, i) => (
              <div key={i} className="bg-white p-12 hover:bg-[#F5F3EF] transition-colors group">
                <pillar.icon className="w-12 h-12 mb-8 text-black group-hover:text-[#C87941] transition-colors" strokeWidth={1.5} />
                <h3 className="text-2xl font-heading font-bold mb-4">{pillar.title}</h3>
                <p className="text-gray-600 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-32 bg-[#F5F3EF]">
        <div className="container mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-5xl font-heading font-bold mb-6">Our Architecture</h2>
            <p className="text-xl text-gray-600 max-w-2xl">
              A vertically integrated talent supply chain designed for the enterprise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1: Staffing */}
            <div className="bg-white border-2 border-black p-10 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <Briefcase className="w-10 h-10 mb-6" />
              <h3 className="text-3xl font-heading font-bold mb-4">IT Staffing</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-1.5 h-1.5 bg-[#C87941]"></div>
                  Contract & Direct Hire
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-1.5 h-1.5 bg-[#C87941]"></div>
                  Guidewire & Salesforce Specialists
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-1.5 h-1.5 bg-[#C87941]"></div>
                  24/7 Recruitment Engine
                </li>
              </ul>
              <Link href="/solutions/it-staffing" className="text-sm font-bold uppercase tracking-widest underline hover:text-[#C87941]">
                View Models
              </Link>
            </div>

            {/* Card 2: Academy */}
            <div className="bg-white border-2 border-black p-10 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <GraduationCap className="w-10 h-10 mb-6" />
              <h3 className="text-3xl font-heading font-bold mb-4">InTime Academy</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-1.5 h-1.5 bg-[#C87941]"></div>
                  8-Week Intensive Bootcamps
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-1.5 h-1.5 bg-[#C87941]"></div>
                  Real-world Project Simulation
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-1.5 h-1.5 bg-[#C87941]"></div>
                  Guaranteed Placement Support
                </li>
              </ul>
              <Link href="/academy" className="text-sm font-bold uppercase tracking-widest underline hover:text-[#C87941]">
                Explore Curriculum
              </Link>
            </div>

            {/* Card 3: Cross Border */}
            <div className="bg-white border-2 border-black p-10 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <Globe className="w-10 h-10 mb-6" />
              <h3 className="text-3xl font-heading font-bold mb-4">Cross-Border</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-1.5 h-1.5 bg-[#C87941]"></div>
                  H1B to Canada Migration
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-1.5 h-1.5 bg-[#C87941]"></div>
                  TN Visa Support
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-1.5 h-1.5 bg-[#C87941]"></div>
                  Global Talent Relocation
                </li>
              </ul>
              <Link href="/solutions/cross-border" className="text-sm font-bold uppercase tracking-widest underline hover:text-[#C87941]">
                Global Solutions
              </Link>
            </div>

            {/* Card 4: Consulting */}
            <div className="bg-white border-2 border-black p-10 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <Users className="w-10 h-10 mb-6" />
              <h3 className="text-3xl font-heading font-bold mb-4">Consulting</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-1.5 h-1.5 bg-[#C87941]"></div>
                  Digital Transformation
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-1.5 h-1.5 bg-[#C87941]"></div>
                  Cloud Migration Strategy
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-1.5 h-1.5 bg-[#C87941]"></div>
                  Enterprise Architecture
                </li>
              </ul>
              <Link href="/consulting" className="text-sm font-bold uppercase tracking-widest underline hover:text-[#C87941]">
                Our Expertise
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-black text-white py-32 text-center">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-heading font-bold mb-8">
            Stop Hiring Resumes.<br/>
            <span className="text-[#C87941]">Start Hiring Results.</span>
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            The old way is slow, expensive, and unpredictable. The InTime way is automated, vetted, and guaranteed.
          </p>
          <Link href="/contact">
            <button className="bg-white text-black px-12 py-6 font-bold uppercase tracking-widest hover:bg-[#C87941] hover:text-white transition-colors text-lg">
              Start Your Project
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}


