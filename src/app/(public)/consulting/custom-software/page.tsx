import { Code, Zap, CheckSquare } from 'lucide-react';
import Link from 'next/link';

export default function CustomSoftwarePage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <section className="py-24 border-b-2 border-black bg-white">
        <div className="container mx-auto px-6">
          <h1 className="text-6xl font-heading font-bold mb-8">Custom Software Development</h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-8">
            Building scalable, secure, and high-performance applications tailored to your unique business processes.
          </p>
          <Link href="/contact?type=consulting">
            <button className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-[#C87941] transition-colors">
              Start Project
            </button>
          </Link>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-heading font-bold mb-6">Full Cycle Development</h2>
            <p className="text-gray-600 mb-6">
              From concept to deployment, we handle every stage of the SDLC. We use agile methodologies to ensure rapid iteration and alignment with business goals.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-[#C87941]" /> <span className="font-bold">Requirement Analysis</span></li>
              <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-[#C87941]" /> <span className="font-bold">UI/UX Design</span></li>
              <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-[#C87941]" /> <span className="font-bold">DevOps & CI/CD</span></li>
            </ul>
          </div>
          <div className="bg-white border-2 border-black p-8">
            <h3 className="text-xl font-bold mb-4">Tech Stack</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2"><Code className="w-4 h-4" /> React / Next.js</div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Node.js / Python</div>
              <div className="flex items-center gap-2"><Code className="w-4 h-4" /> Java Spring Boot</div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> AWS / Azure</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


