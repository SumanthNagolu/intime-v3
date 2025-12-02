'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  BiometricState, 
  getBiometricTheme, 
  BIOMETRIC_TRANSITION 
} from '@/lib/academy/biometric';

interface BiometricBackgroundProps {
  biometricScore: number;
  className?: string;
}

// Particle component for apex state
function ApexParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number }>>([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      size: 2 + Math.random() * 4,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-emerald-400/30 animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Recovery pulse for ember state
function RecoveryPulse() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[200%] h-[200%] rounded-full opacity-20 animate-recovery-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.3) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}

// Ascent rising effect
function AscentRise() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/2 animate-rise"
        style={{
          background: 'linear-gradient(to top, rgba(16, 185, 129, 0.08), transparent)',
        }}
      />
    </div>
  );
}

export function BiometricBackground({ biometricScore, className }: BiometricBackgroundProps) {
  const state = useMemo<BiometricState>(() => {
    if (biometricScore >= 90) return 'apex';
    if (biometricScore >= 70) return 'ascent';
    if (biometricScore >= 40) return 'neutral';
    return 'ember';
  }, [biometricScore]);

  const theme = useMemo(() => getBiometricTheme(state), [state]);

  // Pulse animation class based on state
  const pulseClass = useMemo(() => {
    switch (state) {
      case 'ember': return 'animate-pulse-urgent';
      case 'neutral': return 'animate-pulse-slow';
      case 'ascent': return 'animate-pulse-calm';
      case 'apex': return 'animate-pulse-serene';
      default: return 'animate-pulse-slow';
    }
  }, [state]);

  return (
    <div 
      className={cn("fixed inset-0 pointer-events-none z-0", className)}
      data-biometric={state}
    >
      {/* Base layer - very subtle gradient */}
      <div 
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: state === 'ember' 
            ? 'linear-gradient(135deg, #FDFBF7 0%, #FEF2F2 100%)'
            : state === 'apex'
            ? 'linear-gradient(135deg, #FDFBF7 0%, #ECFDF5 100%)'
            : 'linear-gradient(135deg, #FDFBF7 0%, #F8F9FA 100%)',
        }}
      />

      {/* Primary ambient orb - top right */}
      <div 
        className={cn("absolute top-0 right-0 w-[70%] h-[80%] rounded-bl-[40%]", pulseClass)}
        style={{ 
          background: `radial-gradient(ellipse at 70% 30%, ${theme.primaryColor} 0%, transparent 60%)`,
          transition: BIOMETRIC_TRANSITION,
        }}
      />
      
      {/* Secondary ambient orb - bottom left */}
      <div 
        className={cn("absolute bottom-0 left-0 w-[60%] h-[70%] rounded-tr-[50%]", pulseClass)}
        style={{ 
          background: `radial-gradient(ellipse at 20% 80%, ${theme.secondaryColor} 0%, transparent 50%)`,
          transition: BIOMETRIC_TRANSITION,
          animationDelay: '1s',
        }}
      />

      {/* Tertiary orb - center accent */}
      <div 
        className="absolute top-1/3 left-1/3 w-[40%] h-[40%] opacity-50"
        style={{ 
          background: `radial-gradient(ellipse at 50% 50%, ${theme.secondaryColor} 0%, transparent 70%)`,
          transition: BIOMETRIC_TRANSITION,
        }}
      />

      {/* Geometric accent lines */}
      <div 
        className="absolute top-[15%] right-[8%] w-[350px] h-[350px] border rounded-full opacity-10 transition-colors duration-1000"
        style={{ 
          borderColor: theme.pulseColor,
          transform: 'rotate(-15deg)',
        }}
      />
      <div 
        className="absolute bottom-[20%] left-[5%] w-[180px] h-[180px] border rounded-full opacity-5 transition-colors duration-1000"
        style={{ borderColor: theme.pulseColor }}
      />

      {/* State-specific effects */}
      {state === 'apex' && <ApexParticles />}
      {state === 'ember' && <RecoveryPulse />}
      {state === 'ascent' && <AscentRise />}

      {/* Noise texture overlay for authenticity */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

// Export status indicator component
export function BiometricStatusIndicator({
  state,
  statusMessage,
  compact = false
}: {
  state: BiometricState;
  statusMessage: string;
  compact?: boolean;
}) {
  
  const dotClass = cn(
    "rounded-full",
    compact ? "w-1.5 h-1.5" : "w-2 h-2",
    state === 'apex' && "bg-emerald-400 animate-pulse",
    state === 'ascent' && "bg-forest-500 animate-pulse-slow",
    state === 'neutral' && "bg-gold-500 animate-pulse-slow",
    state === 'ember' && "bg-red-500 animate-pulse-urgent"
  );

  return (
    <div className="flex items-center gap-2">
      <div className={dotClass} />
      <span className={cn(
        "font-mono uppercase tracking-[0.2em]",
        compact ? "text-[8px]" : "text-[10px]",
        state === 'apex' && "text-emerald-600",
        state === 'ascent' && "text-forest-600",
        state === 'neutral' && "text-gold-600",
        state === 'ember' && "text-red-600"
      )}>
        {statusMessage}
      </span>
    </div>
  );
}














