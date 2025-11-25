'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '../shared/Badge';

interface Feature {
  icon: React.ReactNode;
  badge?: { icon?: React.ReactNode; text: string };
  title: string;
  description: string;
  features?: string[];
  ctaText?: string;
  href?: string;
  accentColor?: 'gold' | 'forest' | 'slate' | 'emerald' | 'purple';
}

interface FeatureCardsProps {
  sectionBadge?: { icon?: React.ReactNode; text: string };
  headline: string;
  highlightedText?: string;
  subheadline?: string;
  features: Feature[];
  layout?: 'grid' | 'mixed';
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({
  sectionBadge,
  headline,
  highlightedText,
  subheadline,
  features,
  layout = 'grid'
}) => {
  const accentColors = {
    gold: 'bg-gold-100 text-gold-600 border-gold-200',
    forest: 'bg-forest-100 text-forest-600 border-forest-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200'
  };

  const accentBorders = {
    gold: 'hover:border-gold-300',
    forest: 'hover:border-forest-300',
    slate: 'hover:border-slate-300',
    emerald: 'hover:border-emerald-300',
    purple: 'hover:border-purple-300'
  };

  return (
    <section className="py-28 bg-ivory">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          {sectionBadge && (
            <Badge variant="forest" icon={sectionBadge.icon} className="mb-8">
              {sectionBadge.text}
            </Badge>
          )}

          <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6">
            {headline}{' '}
            {highlightedText && (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-gold-600">
                {highlightedText}
              </span>
            )}
          </h2>

          {subheadline && (
            <p className="text-lg text-charcoal-500 max-w-2xl mx-auto">
              {subheadline}
            </p>
          )}
        </div>

        {/* Features Grid */}
        <div className={`max-w-7xl mx-auto ${
          layout === 'mixed'
            ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'grid md:grid-cols-2 lg:grid-cols-3 gap-8'
        }`}>
          {features.map((feature, i) => {
            const color = feature.accentColor || 'gold';
            return (
              <div
                key={i}
                className={`group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-charcoal-100/50 ${accentBorders[color]} transition-all duration-500`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${accentColors[color]}`}>
                  {feature.icon}
                </div>

                {/* Badge */}
                {feature.badge && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal-100 text-charcoal-600 text-[10px] font-bold uppercase tracking-widest">
                      {feature.badge.icon}
                      {feature.badge.text}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-heading font-bold text-charcoal-900 mb-3 group-hover:text-forest-600 transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-charcoal-500 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Feature List */}
                {feature.features && feature.features.length > 0 && (
                  <ul className="space-y-2 mb-6">
                    {feature.features.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-charcoal-600">
                        <CheckCircle2 size={14} className="text-forest-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA */}
                {feature.ctaText && feature.href && (
                  <Link
                    href={feature.href}
                    className="inline-flex items-center gap-2 text-forest-600 font-bold text-sm uppercase tracking-widest group-hover:gap-3 transition-all"
                  >
                    {feature.ctaText}
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
