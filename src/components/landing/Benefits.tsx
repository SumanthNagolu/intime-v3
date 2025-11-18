export function Benefits() {
  const benefits = [
    {
      title: '2-Person Pod Structure',
      description: 'Senior + Junior pairs working collaboratively for maximum efficiency and knowledge transfer',
      stats: '2 placements per 2-week sprint',
      cardStyle: 'style-a', // Dark data card
    },
    {
      title: 'AI-Powered Automation',
      description: 'Living organism that learns from every interaction and automates repetitive tasks',
      stats: '70% time savings',
      cardStyle: 'style-b', // Left border emphasis
    },
    {
      title: 'Complete Data Ownership',
      description: 'Your data stays yours. Full control, export anytime, zero vendor lock-in',
      stats: '100% data control',
      cardStyle: 'style-a', // Dark data card
    },
    {
      title: 'Scale Without Chaos',
      description: 'Designed for 10x growth from day one. Add pods seamlessly without breaking systems',
      stats: '10x scalability',
      cardStyle: 'style-c', // Colored background
    },
    {
      title: 'Quality Over Speed',
      description: 'Best, only the best, nothing but the best. Our founding principle drives everything',
      stats: '95% client satisfaction',
      cardStyle: 'style-b', // Left border emphasis
    },
    {
      title: 'Real-Time Insights',
      description: 'Live dashboards, predictive analytics, and actionable intelligence at your fingertips',
      stats: 'Live metrics 24/7',
      cardStyle: 'style-c', // Colored background
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header - Left Aligned (Not Centered) */}
        <div className="mb-16">
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Why Staffing Leaders Choose InTime
          </h2>
          <p className="font-body text-xl text-slate-600 max-w-3xl">
            Built by staffing experts for staffing professionals who refuse to compromise on quality
          </p>
        </div>

        {/* Benefits Grid - Varied Card Styles (NOT All Identical) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => {
            // Style A: Dark data card
            if (benefit.cardStyle === 'style-a') {
              return (
                <div
                  key={index}
                  className="bg-slate-900 text-white p-8 border border-slate-700"
                >
                  <h3 className="font-subheading text-2xl font-bold text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="font-body text-slate-300 mb-6">
                    {benefit.description}
                  </p>
                  <div className="inline-block bg-amber-500 text-slate-900 px-4 py-2 font-mono text-sm font-semibold">
                    {benefit.stats}
                  </div>
                </div>
              );
            }

            // Style B: Left border emphasis
            if (benefit.cardStyle === 'style-b') {
              return (
                <div
                  key={index}
                  className="bg-white border-l-4 border-forest-500 shadow-elevation-md p-8 hover:shadow-elevation-lg transition-shadow"
                >
                  <h3 className="font-subheading text-2xl font-bold text-slate-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="font-body text-slate-600 mb-6">
                    {benefit.description}
                  </p>
                  <div className="inline-block bg-forest-100 text-forest-700 px-4 py-2 font-mono text-sm font-semibold">
                    {benefit.stats}
                  </div>
                </div>
              );
            }

            // Style C: Colored background
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-forest-50 to-white border border-forest-200 p-8"
              >
                <h3 className="font-subheading text-2xl font-bold text-slate-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="font-body text-slate-600 mb-6">
                  {benefit.description}
                </p>
                <div className="inline-block bg-amber-400 text-slate-900 px-4 py-2 font-mono text-sm font-semibold">
                  {benefit.stats}
                </div>
              </div>
            );
          })}
        </div>

        {/* Philosophy Quote - Asymmetric 8/4 Layout (NOT Centered) */}
        <div className="bg-forest-500 text-white p-8 lg:p-12">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8">
              <div className="font-heading text-5xl text-amber-400 mb-4">"</div>
              <blockquote className="font-heading text-2xl lg:text-3xl leading-relaxed mb-6">
                This is not just software. This is an organism that thinks with your principles,
                grows with your business, learns from every interaction, extends your capabilities,
                and scales your impact.
              </blockquote>
              <div className="font-body text-lg text-forest-100">
                — InTime Philosophy
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4 flex items-center justify-center">
              <div className="text-center">
                <div className="font-mono text-6xl font-bold text-amber-400 mb-2">
                  100%
                </div>
                <div className="font-body text-sm text-forest-100">
                  Living Organism
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
