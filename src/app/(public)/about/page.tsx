import { ArrowRight, Users, History, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <section className="py-24 border-b-2 border-black">
        <div className="container mx-auto px-6 max-w-4xl">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C87941] mb-4 block">Our Philosophy</span>
          <h1 className="text-6xl font-heading font-bold mb-8 text-black">
            InTime is not software.<br/>
            It is a <span className="italic font-serif">living organism</span>.
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            We founded InTime on a single truth: The staffing industry is broken because it treats people like rows in a database. 
            We treat talent as a dynamic force. Our system doesn't just "find" candidates; it grows them, vets them, and deploys them with surgical precision.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <History className="w-12 h-12 mb-6 text-black" />
              <h3 className="text-2xl font-heading font-bold mb-4">Origin</h3>
              <p className="text-gray-600">
                Born from the frustration of enterprise hiring managers who were tired of "keyword matching" recruiters. We built the system we wished we had.
              </p>
            </div>
            <div>
              <Target className="w-12 h-12 mb-6 text-black" />
              <h3 className="text-2xl font-heading font-bold mb-4">Mission</h3>
              <p className="text-gray-600">
                To reduce the time-to-hire from months to hours, while simultaneously increasing the quality of talent through rigorous, simulation-based training.
              </p>
            </div>
            <div>
              <Users className="w-12 h-12 mb-6 text-black" />
              <h3 className="text-2xl font-heading font-bold mb-4">Culture</h3>
              <p className="text-gray-600">
                We are a team of engineers, educators, and data scientists. We believe in "Truth Over Trends" and "Results Over Promises."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


