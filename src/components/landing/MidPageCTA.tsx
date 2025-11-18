'use client';

import { useState } from 'react';

export function MidPageCTA() {
  const [email, setEmail] = useState('');
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
    }, 3000);
  };

  return (
    <section className="py-32 bg-[#F5F3EF]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {!isSubmitted ? (
          <>
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
              Stop leaving money on the table
            </h2>
            <p className="text-xl text-gray-700 mb-12">
              Get the 5-Pillar Staffing Playbook and see exactly how much revenue you're missing.
            </p>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-6 py-4 border-2 border-gray-300 focus:border-black focus:outline-none text-gray-900"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSubmitting ? 'Sending...' : 'Get playbook →'}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-4">No credit card required</p>
            </form>
          </>
        ) : (
          <div className="py-12">
            <div className="text-6xl mb-4">✓</div>
            <h3 className="text-3xl font-bold text-black mb-2">Check your email</h3>
            <p className="text-gray-700">Playbook sent to {email}</p>
          </div>
        )}
      </div>
    </section>
  );
}
