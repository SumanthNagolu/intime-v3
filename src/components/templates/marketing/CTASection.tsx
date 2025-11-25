'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  headline: string;
  highlightedText?: string;
  subheadline?: string;
  primaryCTA?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  variant?: 'gradient' | 'dark' | 'gold';
}

export const CTASection: React.FC<CTASectionProps> = ({
  headline,
  highlightedText,
  subheadline,
  primaryCTA,
  secondaryCTA,
  variant = 'gradient'
}) => {
  const bgClasses = {
    gradient: 'bg-gradient-to-br from-forest-900 to-charcoal-900',
    dark: 'bg-charcoal-900',
    gold: 'bg-gradient-to-br from-gold-500 to-gold-600'
  };

  const textClasses = variant === 'gold' ? 'text-charcoal-900' : 'text-white';
  const highlightClasses = variant === 'gold' ? 'text-forest-800' : 'text-gold-400';
  const subTextClasses = variant === 'gold' ? 'text-charcoal-700' : 'text-charcoal-300';

  return (
    <section className={`py-24 ${bgClasses[variant]} relative overflow-hidden`}>
      {/* Background Effects */}
      {variant !== 'gold' && (
        <>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-forest-600/10 rounded-full blur-[80px]" />
        </>
      )}

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl md:text-5xl font-heading font-black ${textClasses} mb-6`}>
            {headline}{' '}
            {highlightedText && (
              <span className={highlightClasses}>{highlightedText}</span>
            )}
          </h2>

          {subheadline && (
            <p className={`text-lg md:text-xl ${subTextClasses} mb-10 max-w-2xl mx-auto`}>
              {subheadline}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            {primaryCTA && (
              <Link
                href={primaryCTA.href}
                className={`px-10 py-5 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 ${
                  variant === 'gold'
                    ? 'bg-charcoal-900 text-white'
                    : 'bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900'
                }`}
              >
                {primaryCTA.icon}
                {primaryCTA.text}
                <ArrowRight size={16} />
              </Link>
            )}
            {secondaryCTA && (
              <Link
                href={secondaryCTA.href}
                className={`px-10 py-5 rounded-full font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3 ${
                  variant === 'gold'
                    ? 'bg-white/20 text-charcoal-900 hover:bg-white/30'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                {secondaryCTA.icon}
                {secondaryCTA.text}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
