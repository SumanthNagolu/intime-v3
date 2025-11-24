import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Hero */}
      <section className="py-32 border-b-2 border-black bg-white">
        <div className="container mx-auto px-6">
          <span className="text-[#C87941] font-bold uppercase tracking-widest mb-4 block">Join the Elite</span>
          <h1 className="text-6xl font-heading font-bold mb-8">
            Don't Just Get a Job.<br/>
            <span className="italic font-serif">Get a Future.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-12">
            We are building the world's first automated talent engine. Whether you want to join our internal team or find your next consulting gig, you've found the right place.
          </p>
          <div className="flex gap-6">
             <Link href="/careers/open-positions">
                <button className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-[#C87941] transition-colors flex items-center gap-2">
                   Browse Roles <ArrowRight className="w-4 h-4" />
                </button>
             </Link>
             <Link href="/careers/join-team">
                <button className="bg-transparent border-2 border-black text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                   Internal Careers
                </button>
             </Link>
          </div>
        </div>
      </section>

      {/* Value Prop */}
      <section className="py-24 container mx-auto px-6">
         <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
               <h2 className="text-4xl font-heading font-bold mb-6">Why InTime?</h2>
               <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                 We are not a typical agency. We are a technology company that happens to do staffing. This means:
               </p>
               <ul className="space-y-6">
                  <li className="flex gap-4">
                     <span className="text-2xl font-bold text-[#C87941]">01</span>
                     <div>
                        <h3 className="font-bold text-xl">Meritocracy</h3>
                        <p className="text-gray-600">The best idea wins. Rank is irrelevant.</p>
                     </div>
                  </li>
                  <li className="flex gap-4">
                     <span className="text-2xl font-bold text-[#C87941]">02</span>
                     <div>
                        <h3 className="font-bold text-xl">Velocity</h3>
                        <p className="text-gray-600">We move fast. If you like red tape, you'll hate it here.</p>
                     </div>
                  </li>
                  <li className="flex gap-4">
                     <span className="text-2xl font-bold text-[#C87941]">03</span>
                     <div>
                        <h3 className="font-bold text-xl">Impact</h3>
                        <p className="text-gray-600">You aren't a cog. You are the engine.</p>
                     </div>
                  </li>
               </ul>
            </div>
            <div className="bg-gray-200 h-[500px] border-2 border-black flex items-center justify-center">
               <span className="text-gray-500 font-mono uppercase tracking-widest">Team Culture Photo</span>
            </div>
         </div>
      </section>
    </div>
  );
}


