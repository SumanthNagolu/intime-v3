'use client';

import React from 'react';

interface SocialProofBarProps {
  brands: string[];
  label?: string;
}

export const SocialProofBar: React.FC<SocialProofBarProps> = ({
  brands,
  label = 'Trusted by leading enterprises'
}) => {
  return (
    <section className="py-12 bg-white border-b border-charcoal-100">
      <div className="container mx-auto px-6 lg:px-12">
        <p className="text-center text-sm text-charcoal-400 uppercase tracking-widest mb-8">
          {label}
        </p>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {brands.map((brand, i) => (
            <div
              key={i}
              className="text-charcoal-300 font-heading font-bold text-xl md:text-2xl hover:text-charcoal-500 transition-colors"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;
