'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '../shared/Badge';

interface HeroSectionProps {
  badge?: {
    text: string;
    icon?: React.ReactNode;
    live?: boolean;
  };
  headline: React.ReactNode;
  subheadline: string;
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
  variant?: 'default' | 'centered' | 'split';
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  badge,
  headline,
  subheadline,
  primaryCTA,
  secondaryCTA,
  variant = 'default'
}) => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-charcoal-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-900 via-charcoal-900 to-charcoal-950" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gold-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-forest-600/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/5 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-6 lg:px-12 py-24">
        <div className={variant === 'centered' ? 'max-w-4xl mx-auto text-center' : 'max-w-4xl'}>
          {/* Badge */}
          {badge && (
            <Badge variant="gold" pulse={badge.live} icon={badge.icon} className="mb-8">
              {badge.text}
            </Badge>
          )}

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-black text-white leading-[0.95] mb-8">
            {headline}
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-charcoal-300 font-light leading-relaxed mb-12 max-w-2xl">
            {subheadline}
          </p>

          {/* CTAs */}
          <div className={`flex flex-wrap gap-4 ${variant === 'centered' ? 'justify-center' : ''}`}>
            {primaryCTA && (
              <Link
                href={primaryCTA.href}
                className="px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg shadow-gold-500/20 hover:shadow-xl hover:shadow-gold-500/30 transition-all duration-300 flex items-center gap-3"
              >
                {primaryCTA.icon}
                {primaryCTA.text}
                <ArrowRight size={16} />
              </Link>
            )}
            {secondaryCTA && (
              <Link
                href={secondaryCTA.href}
                className="px-10 py-5 bg-white/10 text-white border border-white/20 rounded-full font-bold uppercase tracking-widest text-sm backdrop-blur-sm hover:bg-white/20 transition-all duration-300 flex items-center gap-3"
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

export default HeroSection;
