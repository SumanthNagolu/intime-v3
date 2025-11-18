import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-forest-900 to-slate-800 text-white overflow-hidden">
      {/* Subtle texture overlay (not dot matrix) */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Asymmetric 7/5 Layout (NOT Centered) */}
        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          {/* Content - 7 columns */}
          <div className="col-span-12 lg:col-span-7">
            <h2 className="font-heading text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your Staffing Business?
            </h2>
            <p className="font-body text-xl lg:text-2xl text-slate-200 mb-8 leading-relaxed">
              Join forward-thinking staffing leaders who are already scaling with InTime
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/get-started" className="btn-primary text-center">
                Start Your Free Trial
              </Link>
              <Link
                href="/contact"
                className="btn-secondary bg-transparent border-white text-white hover:bg-white/10 text-center"
              >
                Schedule a Demo
              </Link>
            </div>

            <p className="font-body text-forest-200 text-sm">
              No credit card required • 30-day free trial • Cancel anytime
            </p>
          </div>

          {/* Trust Indicators - 5 columns (NOT Centered) */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <div className="bg-white/5 border-l-4 border-amber-500 p-6">
              <h3 className="font-subheading font-semibold text-white mb-2">Enterprise Security</h3>
              <p className="font-body text-sm text-slate-300">SOC 2 compliant, GDPR ready</p>
            </div>

            <div className="bg-white/5 border-l-4 border-amber-500 p-6">
              <h3 className="font-subheading font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="font-body text-sm text-slate-300">Set up in hours, not weeks</p>
            </div>

            <div className="bg-white/5 border-l-4 border-amber-500 p-6">
              <h3 className="font-subheading font-semibold text-white mb-2">Expert Support</h3>
              <p className="font-body text-sm text-slate-300">24/7 staffing industry experts</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
