'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FullScreenHeroProps {
  badge?: {
    icon: React.ReactNode;
    text: string;
  };
  title: React.ReactNode;
  subtitle: string;
  children?: React.ReactNode;
  variant?: 'default' | 'forest' | 'purple' | 'emerald' | 'gold';
  alignment?: 'center' | 'left';
  showScrollIndicator?: boolean;
  scrollText?: string;
  className?: string;
}

const variantConfig = {
  default: {
    gradient: 'from-forest-900 via-charcoal-900 to-charcoal-950',
    orb1: 'bg-gold-600/20',
    orb2: 'bg-forest-600/15',
    badgeColor: 'text-gold-400 border-gold-500/20 bg-white/5',
  },
  forest: {
    gradient: 'from-forest-900 via-charcoal-900 to-charcoal-950',
    orb1: 'bg-forest-500/20',
    orb2: 'bg-gold-600/12',
    badgeColor: 'text-forest-400 border-forest-500/20 bg-white/5',
  },
  purple: {
    gradient: 'from-purple-900/80 via-charcoal-900 to-charcoal-950',
    orb1: 'bg-purple-500/20',
    orb2: 'bg-gold-600/12',
    badgeColor: 'text-purple-400 border-purple-500/20 bg-white/5',
  },
  emerald: {
    gradient: 'from-emerald-900/70 via-charcoal-900 to-charcoal-950',
    orb1: 'bg-emerald-500/20',
    orb2: 'bg-gold-600/12',
    badgeColor: 'text-emerald-400 border-emerald-500/20 bg-white/5',
  },
  gold: {
    gradient: 'from-charcoal-900 via-charcoal-900 to-forest-950',
    orb1: 'bg-gold-500/25',
    orb2: 'bg-forest-600/15',
    badgeColor: 'text-gold-400 border-gold-500/20 bg-white/5',
  },
};

export const FullScreenHero: React.FC<FullScreenHeroProps> = ({
  badge,
  title,
  subtitle,
  children,
  variant = 'default',
  alignment = 'center',
  showScrollIndicator = true,
  scrollText = 'Discover More',
  className,
}) => {
  const config = variantConfig[variant];

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section
      className={cn(
        'hero-fullscreen relative bg-charcoal-900 overflow-hidden page-section',
        className
      )}
    >
      {/* Atmospheric Background */}
      <div className="absolute inset-0">
        {/* Base Gradient */}
        <div className={cn('absolute inset-0 bg-gradient-to-br', config.gradient)} />

        {/* Primary Orb - Gold/Accent */}
        <div
          className={cn(
            'hero-orb absolute w-[500px] h-[500px] md:w-[650px] md:h-[650px]',
            config.orb1
          )}
          style={{
            top: '15%',
            left: alignment === 'center' ? '20%' : '50%',
            animationDelay: '0s',
          }}
        />

        {/* Secondary Orb - Forest/Accent */}
        <div
          className={cn(
            'hero-orb absolute w-[400px] h-[400px] md:w-[550px] md:h-[550px]',
            config.orb2
          )}
          style={{
            bottom: '10%',
            right: alignment === 'center' ? '15%' : '60%',
            animationDelay: '2s',
          }}
        />

        {/* Subtle Grid Pattern - gives structure without feeling generic */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(201, 169, 97, 0.6) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(201, 169, 97, 0.6) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />

        {/* Noise Texture - adds authentic texture */}
        <div
          className="absolute inset-0 opacity-[0.35] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
          }}
        />

        {/* Vignette effect - adds depth and focus */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10, 10, 10, 0.4) 100%)'
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-28 pb-20 md:pt-36 md:pb-28">
        <div
          className={cn(
            'max-w-5xl',
            alignment === 'center' ? 'mx-auto text-center' : ''
          )}
        >
          {/* Badge */}
          {badge && (
            <div
              className={cn(
                'hero-badge inline-flex items-center gap-3 px-5 py-2.5 rounded-full backdrop-blur-md border mb-10 md:mb-12',
                config.badgeColor
              )}
            >
              <span className="text-current opacity-80">{badge.icon}</span>
              <span className="text-xs font-bold uppercase tracking-[0.2em]">
                {badge.text}
              </span>
            </div>
          )}

          {/* Main Headline */}
          <h1 className="hero-title text-hero-display font-heading font-black text-white mb-6 md:mb-8 tracking-tight">
            {title}
          </h1>

          {/* Subheadline */}
          <p
            className={cn(
              'hero-subtitle text-lg sm:text-xl md:text-2xl text-charcoal-300/90 font-light leading-relaxed mb-12 md:mb-14',
              alignment === 'center' ? 'max-w-3xl mx-auto' : 'max-w-2xl'
            )}
          >
            {subtitle}
          </p>

          {/* CTA Buttons */}
          {children && (
            <div
              className={cn(
                'hero-cta flex flex-col sm:flex-row gap-4 md:gap-5',
                alignment === 'center' ? 'items-center justify-center' : 'items-start'
              )}
            >
              {children}
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <button
          onClick={scrollToContent}
          className="scroll-indicator z-20"
          aria-label="Scroll to content"
        >
          <span className="scroll-indicator-text">{scrollText}</span>
          <ChevronDown size={24} className="scroll-indicator-icon" />
        </button>
      )}
    </section>
  );
};

// Gradient text component for consistent styling
interface GradientTextProps {
  children: React.ReactNode;
  variant?: 'gold' | 'forest' | 'purple' | 'emerald';
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  variant = 'gold'
}) => {
  const gradients = {
    gold: 'from-gold-300 via-gold-400 to-gold-500',
    forest: 'from-forest-300 via-forest-400 to-forest-500',
    purple: 'from-purple-300 via-purple-400 to-purple-500',
    emerald: 'from-emerald-300 via-emerald-400 to-emerald-500',
  };

  return (
    <span className={cn(
      'text-transparent bg-clip-text bg-gradient-to-r',
      gradients[variant]
    )}>
      {children}
    </span>
  );
};

export default FullScreenHero;
