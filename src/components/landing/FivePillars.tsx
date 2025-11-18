export function FivePillars() {
  const pillars = [
    {
      number: '01',
      title: 'Training Academy',
      description: '8-week transformation program with project-based curriculum and 95% placement rate.',
    },
    {
      number: '02',
      title: 'Recruiting Services',
      description: '48-hour placement turnaround with pre-vetted talent pool and instant matching.',
    },
    {
      number: '03',
      title: 'Bench Sales',
      description: '30-60 day placement for bench consultants with automated job board posting.',
    },
    {
      number: '04',
      title: 'Talent Acquisition',
      description: 'Pipeline building through multi-channel sourcing and relationship nurturing.',
    },
    {
      number: '05',
      title: 'Cross-Border Solutions',
      description: 'International talent facilitation with visa processing and compliance support.',
    },
  ];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-5xl lg:text-6xl font-bold text-black mb-6">
          Five pillars.{' '}
          <span className="underline decoration-[#C87941] decoration-4 underline-offset-8">
            Infinite opportunities.
          </span>
        </h2>
        <p className="text-xl text-gray-700 mb-20 max-w-3xl">
          One platform powers your entire staffing operation. Each pillar strengthens the others.
        </p>

        {/* Pillars List */}
        <div className="space-y-6 mb-24">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className="border-2 border-gray-200 p-8 hover:border-black transition-colors"
            >
              <div className="flex items-start gap-8">
                <div className="text-4xl font-mono font-bold text-gray-300 flex-shrink-0">
                  {pillar.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-black mb-3">{pillar.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cross-Pollination */}
        <div className="border-2 border-black bg-black text-white p-12">
          <h3 className="text-3xl lg:text-4xl font-bold mb-6">Cross-pollination intelligence</h3>
          <p className="text-lg text-gray-200 mb-8 max-w-3xl leading-relaxed">
            Every interaction creates opportunities across all 5 pillars. A client placement call
            reveals training needs. A training graduate becomes a recruiting lead. One conversation
            generates multiple revenue streams.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">5.3x</div>
              <div className="text-sm text-gray-400">Opportunities per conversation</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-sm text-gray-400">Automated detection</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$847K</div>
              <div className="text-sm text-gray-400">Avg revenue recovered</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
