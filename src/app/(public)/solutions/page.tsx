import Link from 'next/link';
import { Briefcase, ArrowRight, CheckSquare } from 'lucide-react';

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <section className="py-24 border-b-2 border-black">
        <div className="container mx-auto px-6">
          <h1 className="text-6xl font-heading font-bold mb-8">Our Solutions</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            End-to-end talent lifecycle management. From training to placement to ongoing management.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6 grid gap-12">
          {/* Staffing */}
          <div className="bg-white border-2 border-black p-12 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Briefcase className="w-16 h-16 mb-8" />
              <h2 className="text-4xl font-heading font-bold mb-6">IT Staffing</h2>
              <p className="text-gray-600 text-lg mb-8">
                Rapid deployment of pre-vetted technical talent. We specialize in Guidewire, Salesforce, and Full Stack Development.
              </p>
              <ul className="space-y-4 mb-8">
                {['48-Hour SLA', 'Technical Vetting Included', 'Replacement Guarantee'].map(item => (
                  <li key={item} className="flex items-center gap-3 font-bold">
                    <CheckSquare className="w-5 h-5 text-[#C87941]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/solutions/it-staffing">
                <button className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-[#C87941] transition-colors flex items-center gap-2">
                  Learn More <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="bg-gray-100 h-full min-h-[300px] border-2 border-gray-200 flex items-center justify-center">
               <span className="text-gray-400 font-mono uppercase tracking-widest">Illustration Placeholder</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


