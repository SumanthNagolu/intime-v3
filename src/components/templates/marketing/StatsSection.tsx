'use client';

import React from 'react';

interface Stat {
  value: number | string;
  suffix?: string;
  prefix?: string;
  label: string;
  icon?: React.ReactNode;
}

interface StatsSectionProps {
  stats: Stat[];
  variant?: 'light' | 'dark';
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  stats,
  variant = 'light'
}) => {
  const bgClass = variant === 'dark'
    ? 'bg-charcoal-900 text-white'
    : 'bg-white';

  return (
    <section className={`py-20 ${bgClass}`}>
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              {stat.icon && (
                <div className={`mx-auto mb-4 ${variant === 'dark' ? 'text-gold-400' : 'text-forest-600'}`}>
                  {stat.icon}
                </div>
              )}
              <div className={`text-4xl md:text-5xl font-heading font-black mb-2 ${
                variant === 'dark' ? 'text-gold-400' : 'text-forest-600'
              }`}>
                {stat.prefix}
                {stat.value}
                {stat.suffix}
              </div>
              <div className={`text-sm uppercase tracking-widest ${
                variant === 'dark' ? 'text-charcoal-400' : 'text-charcoal-500'
              }`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
