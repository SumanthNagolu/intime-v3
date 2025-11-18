'use client';

import { useState } from 'react';

export function Hero() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail('');
      setName('');
    }, 3000);
  };

  return (
    <section className="bg-[#F5F3EF] min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          {/* Left Column - Headline */}
          <div className="lg:col-span-7">
            <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold text-black leading-[1.1] mb-8">
              Turn every conversation into{' '}
              <span className="underline decoration-[#C87941] decoration-4 underline-offset-8">
                5+ opportunities
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-12 max-w-2xl">
              InTime connects your entire staffing operation. One platform. Five revenue streams.
              Infinite cross-pollination.
            </p>

            <div className="space-y-6 text-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 bg-black rounded-full mt-3 flex-shrink-0" />
                <p className="text-lg">48-hour placement turnaround vs industry 7-14 days</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 bg-black rounded-full mt-3 flex-shrink-0" />
                <p className="text-lg">5.3x more leads per conversation</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 bg-black rounded-full mt-3 flex-shrink-0" />
                <p className="text-lg">87% placement rate within 60 days</p>
              </div>
            </div>
          </div>

          {/* Right Column - Simple Form */}
          <div className="lg:col-span-5">
            {!isSubmitted ? (
              <div className="bg-white border-2 border-black p-8 lg:p-10">
                <h2 className="text-2xl font-bold text-black mb-6">
                  Get your ROI calculator
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none text-gray-900"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                      Work email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none text-gray-900"
                      placeholder="john@company.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white font-medium py-4 px-6 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Get calculator →'}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    No credit card required
                  </p>
                </form>
              </div>
            ) : (
              <div className="bg-white border-2 border-black p-12 text-center">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="text-2xl font-bold text-black mb-2">Check your email</h3>
                <p className="text-gray-600">Calculator sent to {email}</p>
              </div>
            )}

            <p className="text-sm text-gray-600 mt-6 text-center">
              Or{' '}
              <button className="underline font-medium text-black hover:no-underline">
                schedule a 15-min call
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
