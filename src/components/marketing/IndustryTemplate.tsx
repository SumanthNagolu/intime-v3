import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight, CheckSquare } from 'lucide-react';

interface IndustryPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  stats: { label: string; value: string }[];
  challenges: { title: string; description: string }[];
  solutions: { title: string; description: string }[];
}

export default function IndustryTemplate({
  title,
  description,
  icon: Icon,
  stats,
  challenges,
  solutions
}: IndustryPageProps) {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Hero */}
      <section className="py-24 border-b-2 border-black bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center gap-8 mb-8">
            <div className="w-20 h-20 bg-black flex items-center justify-center text-white">
              <Icon className="w-10 h-10" />
            </div>
            <div>
              <span className="text-[#C87941] font-bold uppercase tracking-widest mb-2 block">Industry Expertise</span>
              <h1 className="text-5xl md:text-6xl font-heading font-bold text-black">{title}</h1>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
            {description}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-black text-white border-b-2 border-black">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i}>
              <div className="text-4xl font-heading font-bold text-[#C87941] mb-1">{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Challenges & Solutions */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Challenges */}
            <div>
              <h2 className="text-3xl font-heading font-bold mb-8">The Challenge</h2>
              <div className="space-y-8">
                {challenges.map((challenge, i) => (
                  <div key={i} className="bg-white border-l-4 border-gray-300 p-6">
                    <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                    <p className="text-gray-600">{challenge.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Solutions */}
            <div>
              <h2 className="text-3xl font-heading font-bold mb-8">The InTime Solution</h2>
              <div className="space-y-8">
                {solutions.map((solution, i) => (
                  <div key={i} className="bg-white border-2 border-black p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckSquare className="w-6 h-6 text-[#C87941]" />
                      <h3 className="text-xl font-bold">{solution.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-0">{solution.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white border-t-2 border-black text-center">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="text-4xl font-heading font-bold mb-6">Ready to Transform?</h2>
          <p className="text-gray-600 mb-10 text-lg">
            Let's discuss how our specialized {title} talent solutions can accelerate your business goals.
          </p>
          <Link href="/contact">
            <button className="bg-black text-white px-12 py-5 font-bold uppercase tracking-widest hover:bg-[#C87941] transition-colors flex items-center gap-3 mx-auto">
              Schedule Consultation
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}


