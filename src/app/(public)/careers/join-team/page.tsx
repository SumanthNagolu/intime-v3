import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function JoinTeamPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <section className="py-24 border-b-2 border-black bg-white">
        <div className="container mx-auto px-6">
          <h1 className="text-6xl font-heading font-bold mb-8">Join InTime</h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-8">
            Build the engine that powers the future of work.
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Recruiter Pods", desc: "High-volume, high-reward delivery roles." },
            { title: "Account Executives", desc: "Enterprise sales and relationship management." },
            { title: "Operations", desc: "HR, Finance, and Legal support." }
          ].map((role, i) => (
            <div key={i} className="bg-white border-2 border-black p-8 hover:bg-black hover:text-white transition-all group">
              <h3 className="text-2xl font-bold mb-4">{role.title}</h3>
              <p className="text-gray-500 group-hover:text-gray-400 mb-6">{role.desc}</p>
              <Link href="/careers/open-positions">
                <span className="text-sm font-bold uppercase tracking-widest underline decoration-[#C87941] decoration-2">View Roles</span>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


