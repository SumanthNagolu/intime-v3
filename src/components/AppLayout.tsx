'use client';

import { ReactNode } from 'react';
import { SystemBar } from './SystemBar';
import { Navbar } from './Navbar';
import { GlobalCommand } from './GlobalCommand';
import { AIMentor } from './AIMentor';
import { TwinWidgetWrapper } from './twin';

interface AppLayoutProps {
  children: ReactNode;
  showMentor?: boolean;
}

export const AppLayout = ({ children, showMentor = false }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-cream flex flex-col relative overflow-x-hidden">
      {/* Premium Mesh Gradient Background */}
      <div className="fixed inset-0 bg-mesh-premium opacity-50 pointer-events-none"></div>

      {/* Subtle Top Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-forest-500/5 via-gold-500/5 to-transparent blur-3xl pointer-events-none"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <SystemBar />
        <Navbar />
        <GlobalCommand />

        {/* Premium Main Content Area */}
        <main className="flex-1 container-premium py-12 mt-24 animate-fade-in">
          <div className="space-y-8">
            {children}
          </div>
        </main>

        {/* Premium Footer */}
        <footer className="mt-auto border-t border-charcoal-100 bg-white/50 backdrop-blur-sm">
          <div className="container-premium py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-forest rounded-lg flex items-center justify-center shadow-elevation-sm">
                  <span className="font-heading font-black text-sm gradient-text-gold">I</span>
                </div>
                <div>
                  <p className="text-caption text-charcoal-900 font-bold">InTime Solutions</p>
                  <p className="text-caption text-charcoal-500">Living Organism. Best of the Best.</p>
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

      {/* AI Twin Floating Widget - Always visible for authenticated users */}
      <TwinWidgetWrapper />
    </div>
  );
};
