import { ArrowRight } from 'lucide-react';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <section className="py-24 border-b-2 border-black bg-white">
        <div className="container mx-auto px-6">
          <h1 className="text-6xl font-heading font-bold mb-8">Insights</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Trends, analysis, and opinions on the future of work.
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border-2 border-black p-0">
              <div className="h-48 bg-gray-200 border-b-2 border-black"></div>
              <div className="p-8">
                <span className="text-xs font-bold uppercase text-[#C87941] mb-2 block">Staffing Trends</span>
                <h3 className="text-xl font-bold mb-4">Why 2025 is the Year of the Hybrid Workforce</h3>
                <p className="text-gray-600 mb-6 text-sm">An analysis of return-to-office mandates vs remote productivity.</p>
                <button className="flex items-center gap-2 text-sm font-bold uppercase hover:text-[#C87941]">
                  Read More <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


