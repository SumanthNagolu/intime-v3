'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
  highlight?: string;
  type?: string;
  rating?: number;
}

interface TestimonialsSectionProps {
  headline: string;
  highlightedText?: string;
  subheadline?: string;
  testimonials: Testimonial[];
  variant?: 'light' | 'dark';
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  headline,
  highlightedText,
  subheadline,
  testimonials,
  variant = 'light'
}) => {
  const isDark = variant === 'dark';

  return (
    <section className={`py-28 relative overflow-hidden ${
      isDark ? 'bg-charcoal-900' : 'bg-ivory'
    }`}>
      {isDark && (
        <div className="absolute inset-0 bg-gradient-to-br from-forest-900/20 to-charcoal-900" />
      )}

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-heading font-black mb-6 ${
            isDark ? 'text-white' : 'text-charcoal-900'
          }`}>
            {headline}{' '}
            {highlightedText && (
              <span className={isDark ? 'text-gold-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-gold-600'}>
                {highlightedText}
              </span>
            )}
          </h2>
          {subheadline && (
            <p className={`text-lg ${isDark ? 'text-charcoal-300' : 'text-charcoal-500'}`}>
              {subheadline}
            </p>
          )}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className={`rounded-2xl p-8 ${
                isDark
                  ? 'bg-white/5 backdrop-blur-sm border border-white/10'
                  : 'bg-white shadow-lg border border-charcoal-100/50'
              }`}
            >
              {/* Type Badge */}
              {testimonial.type && (
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 ${
                  isDark ? 'bg-gold-500/20 text-gold-400' : 'bg-forest-100 text-forest-600'
                }`}>
                  {testimonial.type}
                </span>
              )}

              {/* Quote Icon */}
              <Quote size={24} className={`mb-4 ${isDark ? 'text-gold-500/30' : 'text-charcoal-200'}`} />

              {/* Quote */}
              <p className={`mb-6 leading-relaxed ${isDark ? 'text-charcoal-300' : 'text-charcoal-600'}`}>
                "{testimonial.quote}"
              </p>

              {/* Rating */}
              {testimonial.rating && (
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className={j < testimonial.rating! ? 'text-gold-500 fill-gold-500' : 'text-charcoal-300'}
                    />
                  ))}
                </div>
              )}

              {/* Highlight */}
              {testimonial.highlight && (
                <div className={`inline-block px-4 py-2 rounded-lg text-sm font-bold mb-4 ${
                  isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {testimonial.highlight}
                </div>
              )}

              {/* Author */}
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-charcoal-100/20">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  isDark
                    ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-charcoal-900'
                    : 'bg-gradient-to-br from-forest-500 to-forest-700 text-white'
                }`}>
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-charcoal-900'}`}>
                    {testimonial.author}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-charcoal-400' : 'text-charcoal-500'}`}>
                    {testimonial.role}
                    {testimonial.company && `, ${testimonial.company}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
