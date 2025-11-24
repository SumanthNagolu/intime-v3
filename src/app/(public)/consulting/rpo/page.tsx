import { Users, CheckSquare } from 'lucide-react';
import Link from 'next/link';

export default function RPOPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <section className="py-24 border-b-2 border-black bg-white">
        <div className="container mx-auto px-6">
          <h1 className="text-6xl font-heading font-bold mb-8">Recruitment Process Outsourcing</h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-8">
            We become your internal talent acquisition team. Scalable, compliant, and brand-aligned.
          </p>
          <Link href="/contact?type=consulting">
            <button className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-[#C87941] transition-colors">
              Discuss RPO
            </button>
          </Link>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-heading font-bold mb-6">Why RPO?</h2>
            <p className="text-gray-600 mb-6">
              Traditional agencies are transactional. RPO is strategic. We take ownership of your hiring metrics, reducing cost-per-hire and time-to-fill.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-[#C87941]" /> <span className="font-bold">Brand Ambassadorship</span></li>
              <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-[#C87941]" /> <span className="font-bold">Technology Stack Provided</span></li>
              <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-[#C87941]" /> <span className="font-bold">Scalable Recruiter Pods</span></li>
            </ul>
          </div>
          <div className="bg-black text-white p-10">
            <Users className="w-12 h-12 mb-6 text-[#C87941]" />
            <h3 className="text-2xl font-bold mb-4">Enterprise Grade</h3>
            <p className="text-gray-400">
              Designed for organizations hiring 50+ roles per year. We integrate seamlessly with your ATS and HRIS.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


