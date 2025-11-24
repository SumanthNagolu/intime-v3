import { Globe, ArrowRight, CheckSquare, MapPin, Flag, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function CrossBorderPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-24 bg-black text-white border-b-8 border-[#C87941]">
        <div className="container mx-auto px-6">
          <span className="text-[#C87941] font-bold uppercase tracking-widest mb-4 block">Global Mobility</span>
          <h1 className="text-6xl font-heading font-bold mb-8">
            Borders are Imaginary.<br/>
            <span className="text-[#C87941]">Talent is Universal.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mb-12">
            We navigate the complexities of international talent migration so you don't have to. Seamlessly move talent between India, Canada, and the USA.
          </p>
          <div className="flex gap-4">
            <Link href="/contact?type=cross-border">
              <button className="bg-white text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-[#C87941] hover:text-white transition-colors">
                Start Relocation
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* The Corridor */}
      <section className="py-24 bg-[#F5F3EF]">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-heading font-bold mb-4">The North American Corridor</h2>
            <p className="text-gray-600">A streamlined pipeline for high-skilled migration.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* H1B to Canada */}
            <div className="bg-white p-10 border-2 border-black relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-xs font-bold uppercase">Most Popular</div>
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-full mb-6 group-hover:bg-[#C87941] transition-colors">
                <span className="font-bold text-xl">US</span>
                <ArrowRight className="w-4 h-4 mx-1" />
                <span className="font-bold text-xl">CA</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">H1B to Canada</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Secure your future. We assist US-based H1B holders in migrating to Canada via the Global Talent Stream or Express Entry.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm font-bold"><CheckSquare className="w-4 h-4 text-[#C87941]" /> Same Time Zone</li>
                <li className="flex items-center gap-3 text-sm font-bold"><CheckSquare className="w-4 h-4 text-[#C87941]" /> PR in ~12 Months</li>
                <li className="flex items-center gap-3 text-sm font-bold"><CheckSquare className="w-4 h-4 text-[#C87941]" /> Spousal Work Permit</li>
              </ul>
            </div>

            {/* TN Visa */}
            <div className="bg-white p-10 border-2 border-black group">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-full mb-6 group-hover:bg-[#C87941] transition-colors">
                <span className="font-bold text-xl">CA</span>
                <ArrowRight className="w-4 h-4 mx-1" />
                <span className="font-bold text-xl">US</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">TN Visa Support</h3>
              <p className="text-gray-600 mb-6 text-sm">
                For Canadian & Mexican citizens. The fastest route to working in the US tech sector. We handle the placement and the paperwork.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm font-bold"><CheckSquare className="w-4 h-4 text-[#C87941]" /> Immediate Approval</li>
                <li className="flex items-center gap-3 text-sm font-bold"><CheckSquare className="w-4 h-4 text-[#C87941]" /> 3-Year Renewals</li>
                <li className="flex items-center gap-3 text-sm font-bold"><CheckSquare className="w-4 h-4 text-[#C87941]" /> Full Relocation Support</li>
              </ul>
            </div>

            {/* Global to NA */}
            <div className="bg-white p-10 border-2 border-black group">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-full mb-6 group-hover:bg-[#C87941] transition-colors">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Global to North America</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Direct sourcing from India and UAE for senior technical roles that cannot be filled locally.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm font-bold"><CheckSquare className="w-4 h-4 text-[#C87941]" /> LMIA Support</li>
                <li className="flex items-center gap-3 text-sm font-bold"><CheckSquare className="w-4 h-4 text-[#C87941]" /> ICT Transfers</li>
                <li className="flex items-center gap-3 text-sm font-bold"><CheckSquare className="w-4 h-4 text-[#C87941]" /> Soft-Landing Package</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Nearshore Value */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-heading font-bold mb-6">The Nearshore Advantage</h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Why struggle with 12-hour time differences? Canada offers world-class talent, cultural alignment, and overlapping time zones with the US.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="border-l-4 border-[#C87941] pl-6">
                  <h4 className="font-bold text-xl mb-2">Cost Efficient</h4>
                  <p className="text-sm text-gray-500">Save 30-40% compared to US-based equivalent talent due to currency exchange.</p>
                </div>
                <div className="border-l-4 border-[#C87941] pl-6">
                  <h4 className="font-bold text-xl mb-2">Retention</h4>
                  <p className="text-sm text-gray-500">Higher retention rates due to stable immigration pathways in Canada.</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 h-[400px] border-2 border-black flex items-center justify-center relative">
               {/* Abstract Map Placeholder */}
               <MapPin className="w-12 h-12 text-black absolute top-1/4 left-1/4" />
               <MapPin className="w-12 h-12 text-[#C87941] absolute top-1/3 right-1/3" />
               <span className="text-gray-400 font-mono uppercase tracking-widest mt-32">North American Map</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
