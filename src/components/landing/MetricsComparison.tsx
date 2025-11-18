export function MetricsComparison() {
  const comparisons = [
    {
      metric: "Time to Placement",
      intime: { value: "48", unit: "hours" },
      industry: { value: "30", unit: "days" },
      improvement: "93% faster"
    },
    {
      metric: "Leads Per Conversation",
      intime: { value: "5.3", unit: "opportunities" },
      industry: { value: "1.2", unit: "opportunities" },
      improvement: "342% more"
    },
    {
      metric: "Training Completion Rate",
      intime: { value: "87%", unit: "" },
      industry: { value: "45%", unit: "" },
      improvement: "93% higher"
    },
    {
      metric: "60-Day Placement Rate",
      intime: { value: "87%", unit: "" },
      industry: { value: "52%", unit: "" },
      improvement: "67% higher"
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header - Left Aligned (Not Centered) */}
        <div className="mb-16">
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Data Over Decoration
          </h2>
          <p className="font-body text-xl text-slate-600 max-w-3xl">
            We don't make vague claims. Here's how InTime compares to industry averages with{' '}
            <span className="font-semibold text-forest-500">real metrics</span>.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {comparisons.map((comparison, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-forest-50 to-white border-l-4 border-forest-500 p-8 shadow-elevation-md"
            >
              <div className="font-subheading text-lg font-semibold text-slate-900 mb-6">
                {comparison.metric}
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Industry Average */}
                <div>
                  <div className="text-sm text-slate-500 mb-2">Industry Average</div>
                  <div className="font-mono text-3xl font-bold text-slate-300">
                    {comparison.industry.value}
                    {comparison.industry.unit && (
                      <span className="text-base font-normal ml-1">{comparison.industry.unit}</span>
                    )}
                  </div>
                </div>

                {/* InTime */}
                <div>
                  <div className="text-sm text-forest-500 font-semibold mb-2">InTime</div>
                  <div className="font-mono text-3xl font-bold text-amber-500">
                    {comparison.intime.value}
                    {comparison.intime.unit && (
                      <span className="text-base font-normal ml-1">{comparison.intime.unit}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-forest-200">
                <div className="inline-block bg-amber-500 text-slate-900 px-3 py-1 rounded-sm font-mono text-sm font-semibold">
                  {comparison.improvement}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Supporting Text */}
        <div className="mt-12 p-8 bg-slate-900 text-white rounded-lg">
          <p className="font-body text-lg leading-relaxed">
            <span className="text-amber-400 font-semibold">Real data.</span>{' '}
            These aren't projections or best-case scenarios. These are actual metrics from IntimeESolutions' operations over the past 12 months. Your results may vary, but the system is proven.
          </p>
        </div>
      </div>
    </section>
  );
}
