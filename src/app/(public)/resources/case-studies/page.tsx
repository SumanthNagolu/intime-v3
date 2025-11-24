export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <section className="py-24 border-b-2 border-black bg-white">
        <div className="container mx-auto px-6">
          <h1 className="text-6xl font-heading font-bold mb-8">Case Studies</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Real results for real clients.
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6">
        <div className="space-y-8">
          {[
            { title: "Fortune 500 Insurer", result: "Saved $2M in Recruitment Costs" },
            { title: "Global Bank", result: "Deployed 50 Java Devs in 2 Weeks" },
            { title: "Healthcare Provider", result: "100% Compliance Rate Achieved" }
          ].map((caseStudy, i) => (
            <div key={i} className="bg-white border-2 border-black p-8 flex items-center justify-between hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div>
                <h3 className="text-2xl font-bold mb-2">{caseStudy.title}</h3>
                <p className="text-[#C87941] font-bold uppercase tracking-widest">{caseStudy.result}</p>
              </div>
              <button className="border-2 border-black px-6 py-3 font-bold text-sm uppercase hover:bg-black hover:text-white transition-colors">
                View Study
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


