import Link from 'next/link';
import { Briefcase, GraduationCap, Globe, Users, Zap, ShieldCheck, ArrowRight, CheckSquare } from 'lucide-react';

export default function ConsultingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-24 bg-[#F5F3EF] border-b-2 border-black">
        <div className="container mx-auto px-6">
          <span className="text-[#C87941] font-bold uppercase tracking-widest mb-4 block">Professional Services</span>
          <h1 className="text-6xl font-heading font-bold mb-8 text-black">
            Strategic Consulting
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-12">
            Beyond staffing. We provide end-to-end technology leadership to guide your digital transformation, from legacy modernization to cloud-native architecture.
          </p>
          <div className="flex gap-4">
            <Link href="/contact?type=consulting">
              <button className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-[#C87941] transition-colors flex items-center gap-2">
                Schedule Discovery <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Custom Software */}
          <div className="bg-white border-2 border-black p-10 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group">
             <CodeIcon className="w-12 h-12 mb-6 text-black group-hover:text-[#C87941] transition-colors" />
             <h3 className="text-2xl font-bold mb-4">Custom Software Development</h3>
             <p className="text-gray-600 mb-6 leading-relaxed">
               Building scalable, secure, and high-performance applications tailored to your unique business processes.
             </p>
             <ul className="space-y-2 mb-8">
               <li className="flex items-center gap-2 text-sm font-bold"><div className="w-1.5 h-1.5 bg-black"></div> Full Stack (React/Node/Java)</li>
               <li className="flex items-center gap-2 text-sm font-bold"><div className="w-1.5 h-1.5 bg-black"></div> Cloud Native (AWS/Azure)</li>
               <li className="flex items-center gap-2 text-sm font-bold"><div className="w-1.5 h-1.5 bg-black"></div> API-First Architecture</li>
             </ul>
             <Link href="/consulting/custom-software" className="text-sm font-bold uppercase tracking-widest underline decoration-2 hover:text-[#C87941]">
               Learn More
             </Link>
          </div>

          {/* QA */}
          <div className="bg-white border-2 border-black p-10 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group">
             <ShieldCheck className="w-12 h-12 mb-6 text-black group-hover:text-[#C87941] transition-colors" />
             <h3 className="text-2xl font-bold mb-4">Quality Assurance</h3>
             <p className="text-gray-600 mb-6 leading-relaxed">
               Ensuring reliability through rigorous automated and manual testing strategies. We shift testing left.
             </p>
             <ul className="space-y-2 mb-8">
               <li className="flex items-center gap-2 text-sm font-bold"><div className="w-1.5 h-1.5 bg-black"></div> Test Automation</li>
               <li className="flex items-center gap-2 text-sm font-bold"><div className="w-1.5 h-1.5 bg-black"></div> Performance Engineering</li>
               <li className="flex items-center gap-2 text-sm font-bold"><div className="w-1.5 h-1.5 bg-black"></div> Security Testing</li>
             </ul>
             <Link href="/consulting/quality-assurance" className="text-sm font-bold uppercase tracking-widest underline decoration-2 hover:text-[#C87941]">
               Learn More
             </Link>
          </div>

          {/* RPO */}
          <div className="bg-white border-2 border-black p-10 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group">
             <Users className="w-12 h-12 mb-6 text-black group-hover:text-[#C87941] transition-colors" />
             <h3 className="text-2xl font-bold mb-4">RPO (Recruitment Process Outsourcing)</h3>
             <p className="text-gray-600 mb-6 leading-relaxed">
               We become your internal talent acquisition team. Scalable, compliant, and brand-aligned hiring at scale.
             </p>
             <ul className="space-y-2 mb-8">
               <li className="flex items-center gap-2 text-sm font-bold"><div className="w-1.5 h-1.5 bg-black"></div> Scalable Recruiter Pods</li>
               <li className="flex items-center gap-2 text-sm font-bold"><div className="w-1.5 h-1.5 bg-black"></div> Brand Ambassadorship</li>
               <li className="flex items-center gap-2 text-sm font-bold"><div className="w-1.5 h-1.5 bg-black"></div> ATS Optimization</li>
             </ul>
             <Link href="/consulting/rpo" className="text-sm font-bold uppercase tracking-widest underline decoration-2 hover:text-[#C87941]">
               Learn More
             </Link>
          </div>

          {/* Digital Transformation */}
          <div className="bg-white border-2 border-black p-10 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group">
             <Zap className="w-12 h-12 mb-6 text-black group-hover:text-[#C87941] transition-colors" />
             <h3 className="text-2xl font-bold mb-4">Digital Transformation</h3>
             <p className="text-gray-600 mb-6 leading-relaxed">
               Modernizing legacy systems and processes to compete in the digital age.
             </p>
             <ul className="space-y-2 mb-8">
               <li className="flex items-center gap-2 text-sm font-bold"><div className="w-1.5 h-1.5 bg-black"></div> Legacy Migration</li>
               <li className="flex items-center gap-2 text-sm font-bold"><div className="w-1.5 h-1.5 bg-black"></div> Process Automation</li>
               <li className="flex items-center gap-2 text-sm font-bold"><div className="w-1.5 h-1.5 bg-black"></div> Data Strategy</li>
             </ul>
             <Link href="/contact?type=digital-transformation" className="text-sm font-bold uppercase tracking-widest underline decoration-2 hover:text-[#C87941]">
               Inquire
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
  )
}
