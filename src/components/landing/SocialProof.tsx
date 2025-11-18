export function SocialProof() {
  const testimonials = [
    {
      quote: 'InTime uncovered $380K in opportunities we were missing every day. The cross-pollination feature is like having a business analyst on every call.',
      name: 'Sarah Chen',
      role: 'CEO, TechStaff Solutions',
      metric: '$380K new revenue',
    },
    {
      quote: 'We cut time-to-fill from 12 days to 2 days. Clients are blown away, and we are closing 3x more deals.',
      name: 'Michael Rodriguez',
      role: 'VP Operations, Apex Staffing',
      metric: '83% faster',
    },
    {
      quote: 'The 2-person pod model is genius. My team went from 8 placements/month to 32 placements/month with the same headcount.',
      name: 'Jennifer Wu',
      role: 'Founder, Global Talent Partners',
      metric: '4x volume',
    },
  ];

  return (
    <section className="py-32 bg-[#F5F3EF]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-24 pb-24 border-b-2 border-gray-300">
          {[
            { value: '50+', label: 'Staffing firms' },
            { value: '$2.4M', label: 'Revenue unlocked' },
            { value: '87%', label: 'Placement rate' },
            { value: '4.9/5', label: 'Customer rating' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl font-bold text-black mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-16">
          Real results from real firms
        </h2>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white border-2 border-gray-200 p-8">
              <div className="text-sm font-medium text-black mb-6 pb-6 border-b border-gray-200">
                {testimonial.metric}
              </div>

              <p className="text-gray-700 leading-relaxed mb-8">
                "{testimonial.quote}"
              </p>

              <div>
                <div className="font-medium text-black">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
