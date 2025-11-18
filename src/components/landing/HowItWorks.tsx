export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Set Up Your Pods',
      description: 'Create your 2-person teams (Senior + Junior) and define their territories and specializations.',
      color: 'bg-blue-500',
    },
    {
      number: '02',
      title: 'Import Your Data',
      description: 'Seamlessly migrate existing candidates, clients, and opportunities. We handle the heavy lifting.',
      color: 'bg-purple-500',
    },
    {
      number: '03',
      title: 'Train the AI',
      description: 'InTime learns your business principles, workflows, and success patterns in the first week.',
      color: 'bg-pink-500',
    },
    {
      number: '04',
      title: 'Go Live & Scale',
      description: 'Start with one pod, see results in days, then scale to 10x without breaking systems.',
      color: 'bg-green-500',
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From setup to success in 4 simple steps
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transform -translate-y-1/2 z-0" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-8 relative"
              >
                <div className={`${step.color} text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg`}>
                  {step.number}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>

                <p className="text-gray-600">
                  {step.description}
                </p>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline visualization */}
        <div className="mt-16 bg-white rounded-xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Your 30-Day Journey
          </h3>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                D1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Day 1: Onboarding</h4>
                <p className="text-gray-600">Setup complete, data imported, team trained</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-purple-100 text-purple-600 rounded-full w-12 h-12 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                W1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Week 1: AI Learning</h4>
                <p className="text-gray-600">InTime learns your patterns, first placements made</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-pink-100 text-pink-600 rounded-full w-12 h-12 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                W2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Week 2-3: Optimization</h4>
                <p className="text-gray-600">Cross-pollination kicks in, efficiency increases 50%</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-green-100 text-green-600 rounded-full w-12 h-12 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                D30
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Day 30: Full Speed</h4>
                <p className="text-gray-600">2 placements per pod per sprint, ready to scale</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
