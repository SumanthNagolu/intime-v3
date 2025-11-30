'use client';

import { ReactNode } from 'react';
import { SystemBar } from './SystemBar';
import { Navbar } from './Navbar';
import { GlobalCommand } from './GlobalCommand';
import { AIMentor } from './AIMentor';
import { BiometricBackground } from './academy/BiometricBackground';
import { useBiometric } from '@/lib/store/academy-store';

interface AcademyLayoutProps {
  children: ReactNode;
  showMentor?: boolean;
}

/**
 * AcademyLayout - The Living Organism Container
 * 
 * Features:
 * - Dynamic BiometricBackground that responds to student performance
 * - Premium navigation and system bar
 * - AI Mentor integration
 * - Gamification-aware styling
 */
export function AcademyLayout({ children, showMentor = false }: AcademyLayoutProps) {
  const { score, state, theme } = useBiometric();

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden overflow-y-auto"
      data-biometric-state={state}
    >
      {/* Living Biometric Background */}
      <BiometricBackground biometricScore={score} />

      {/* Subtle Top Glow - responds to biometric state */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] blur-3xl pointer-events-none z-0 transition-colors duration-1000"
        style={{
          background: `radial-gradient(ellipse, ${theme.primaryColor}, transparent)`,
        }}
      />

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <SystemBar />
        <Navbar />
        <GlobalCommand />

        {/* Main Content Area */}
        <main className="flex-1 container-premium py-12 mt-24 animate-fade-in">
          <div className="space-y-8">
            {children}
          </div>
        </main>

        {/* Premium Footer */}
        <footer className="mt-auto border-t border-charcoal-100 bg-white/50 backdrop-blur-sm relative z-10">
          <div className="container-premium py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-elevation-sm transition-colors duration-1000"
                  style={{
                    background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
                  }}
                >
                  <span className="font-heading font-black text-sm text-white">I</span>
                </div>
                <div>
                  <p className="text-caption text-charcoal-900 font-bold">InTime Academy</p>
                  <p className="text-caption text-charcoal-500">Your Career Transformation</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-caption text-charcoal-500">
                <a href="/privacy" className="hover:text-forest-600 transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-forest-600 transition-colors">Terms</a>
                <a href="/support" className="hover:text-forest-600 transition-colors">Support</a>
              </div>

              <p className="text-caption text-charcoal-400">
                © {new Date().getFullYear()} InTime. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {showMentor && <AIMentor />}
    </div>
  );
}

