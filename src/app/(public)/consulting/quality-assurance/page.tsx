import { Shield, CheckSquare } from 'lucide-react';
import Link from 'next/link';

export default function QAPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <section className="py-24 border-b-2 border-black bg-white">
        <div className="container mx-auto px-6">
          <h1 className="text-6xl font-heading font-bold mb-8">Quality Assurance</h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-8">
            Ensuring reliability through rigorous automated and manual testing strategies.
          </p>
          <Link href="/contact?type=consulting">
            <button className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-[#C87941] transition-colors">
              Get Audit
            </button>
          </Link>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Test Automation", desc: "Selenium, Cypress, Playwright frameworks." },
            { title: "Performance Testing", desc: "Load testing with JMeter and Gatling." },
            { title: "Security Testing", desc: "Vulnerability scanning and penetration testing." }
          ].map((service, i) => (
            <div key={i} className="bg-white border-2 border-black p-8">
              <Shield className="w-8 h-8 text-[#C87941] mb-4" />
              <h3 className="text-xl font-bold mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


