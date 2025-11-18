export function ProblemSolution() {
  const problems = [
    'Client calls focus on one placement, missing 5+ other opportunities',
    'Industry average 7-14 days to fill roles loses deals to faster competitors',
    'Candidate data scattered across spreadsheets, CRMs, and email threads',
    'Hours wasted manually matching candidates to roles and services',
  ];

  const solutions = [
    {
      title: 'Cross-pollination intelligence',
      description: 'AI identifies opportunities across all 5 pillars during every conversation',
      metric: '5.3x more leads',
    },
    {
      title: '48-hour placements',
      description: 'Pre-qualified talent pool with instant matching',
      metric: '80% faster',
    },
    {
      title: 'Unified data platform',
      description: 'One source of truth for candidates, clients, and opportunities',
      metric: '100% visibility',
    },
    {
      title: 'Automated workflows',
      description: 'Smart automation for matching, outreach, and tracking',
      metric: '75% time saved',
    },
  ];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Problem Section */}
        <div className="mb-32">
          <h2 className="text-5xl lg:text-6xl font-bold text-black mb-6">
            You're leaving{' '}
            <span className="underline decoration-[#C87941] decoration-4 underline-offset-8">
              millions
            </span>{' '}
            on the table
          </h2>
          <p className="text-xl text-gray-700 mb-16 max-w-3xl">
            Traditional staffing operations miss 80% of potential revenue because they treat each service as a silo.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {problems.map((problem, index) => (
              <div key={index} className="border-l-4 border-black pl-6 py-4">
                <p className="text-lg text-gray-700 leading-relaxed">{problem}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 border-2 border-black p-8 text-center">
            <div className="text-6xl font-bold text-black mb-2">$847K</div>
            <p className="text-gray-700">
              Average annual revenue lost per staffing firm due to missed opportunities
            </p>
          </div>
        </div>

        {/* Solution Section */}
        <div>
          <h2 className="text-5xl lg:text-6xl font-bold text-black mb-6">
            AI-powered{' '}
            <span className="underline decoration-[#C87941] decoration-4 underline-offset-8">
              cross-pollination
            </span>
          </h2>
          <p className="text-xl text-gray-700 mb-16 max-w-3xl">
            InTime connects all 5 staffing pillars into one intelligent system.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <div key={index} className="border-2 border-gray-200 p-8 hover:border-black transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-black">{solution.title}</h3>
                  <div className="px-4 py-1 bg-black text-white text-sm font-medium whitespace-nowrap">
                    {solution.metric}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{solution.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
