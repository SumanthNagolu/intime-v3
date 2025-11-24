import { CheckSquare, ArrowRight, BookOpen, Users, Award } from 'lucide-react';
import Link from 'next/link';

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Hero */}
      <section className="py-24 border-b-2 border-black bg-white">
        <div className="container mx-auto px-6">
          <span className="text-[#C87941] font-bold uppercase tracking-widest mb-4 block">Talent Development</span>
          <h1 className="text-6xl font-heading font-bold mb-8">
            Training & <br/>Development
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-8">
            We don't just find talent. We create it. Our Academy bridges the gap between academic theory and enterprise reality through rigorous simulation.
          </p>
          <Link href="/academy">
            <button className="bg-black text-white px-10 py-5 font-bold uppercase tracking-widest hover:bg-[#C87941] transition-colors flex items-center gap-3">
              Visit InTime Academy <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-24 bg-black text-white border-b-2 border-[#C87941]">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h2 className="text-4xl font-heading font-bold mb-8">The "Living Organism" Methodology</h2>
          <p className="text-xl text-gray-400 leading-relaxed mb-12">
            Most bootcamps teach syntax. We teach survival. Our students don't just watch videos; they join a simulated 
            enterprise environment where they must deliver code, attend standups, and fix bugs under real deadlines.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white/10 p-6 border border-white/20">
              <BookOpen className="w-8 h-8 text-[#C87941] mb-4" />
              <h3 className="font-bold text-lg mb-2">Project-Based</h3>
              <p className="text-sm text-gray-400">No "Hello World". Students build insurance claim portals and CRM systems.</p>
            </div>
            <div className="bg-white/10 p-6 border border-white/20">
              <Users className="w-8 h-8 text-[#C87941] mb-4" />
              <h3 className="font-bold text-lg mb-2">Role-Played</h3>
              <p className="text-sm text-gray-400">Instructors act as "Product Owners". Students are "Junior Devs".</p>
            </div>
            <div className="bg-white/10 p-6 border border-white/20">
              <Award className="w-8 h-8 text-[#C87941] mb-4" />
              <h3 className="font-bold text-lg mb-2">Output-Focused</h3>
              <p className="text-sm text-gray-400">Graduation isn't based on time. It's based on shipped features.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="py-24 container mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-4xl font-heading font-bold mb-4">Training Tracks</h2>
          <p className="text-gray-600">Specialized curriculums for high-demand technologies.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          {/* Corporate */}
          <div>
             <h2 className="text-3xl font-heading font-bold mb-6 flex items-center gap-3">
               <Briefcase className="w-8 h-8" /> Corporate Training
             </h2>
             <p className="text-gray-600 mb-8 leading-relaxed">
               Upskill your existing workforce. We deploy our training pods to your organization to modernize skills in record time.
             </p>
             <div className="bg-white border-2 border-black p-8">
               <ul className="space-y-4">
                  <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-[#C87941]" /> <span className="font-bold">Custom Curriculum Design</span></li>
                  <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-[#C87941]" /> <span className="font-bold">On-Premise or Virtual</span></li>
                  <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-[#C87941]" /> <span className="font-bold">Team Assessment & Audits</span></li>
               </ul>
             </div>
          </div>
          
          {/* Individual */}
          <div>
             <h2 className="text-3xl font-heading font-bold mb-6 flex items-center gap-3">
               <Award className="w-8 h-8" /> Individual Academy
             </h2>
             <p className="text-gray-600 mb-8 leading-relaxed">
               For ambitious professionals. Join a cohort, survive the simulation, and get placed with our hiring partners.
             </p>
             <div className="space-y-4">
                {['Guidewire PolicyCenter', 'Salesforce Development', 'Full Stack Java', 'Data Engineering'].map((track) => (
                  <div key={track} className="flex items-center justify-between bg-white p-4 border border-gray-300 hover:border-[#C87941] transition-colors cursor-pointer group">
                    <span className="font-bold">{track}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#C87941]" />
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
