export default function WhitepapersPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <section className="py-24 border-b-2 border-black bg-white">
        <div className="container mx-auto px-6">
          <h1 className="text-6xl font-heading font-bold mb-8">Whitepapers</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Deep dives into technology and talent strategy.
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          {[
            "The State of Guidewire Talent 2025",
            "AI in Recruitment: Beyond the Hype",
            "Cross-Border Migration Guide"
          ].map((paper, i) => (
            <div key={i} className="bg-white border-2 border-black p-10 flex flex-col items-center text-center">
              <div className="w-16 h-20 border-2 border-gray-300 mb-6 flex items-center justify-center bg-gray-50">PDF</div>
              <h3 className="text-xl font-bold mb-4">{paper}</h3>
              <button className="bg-black text-white px-8 py-3 font-bold uppercase text-xs hover:bg-[#C87941] transition-colors">
                Download
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


