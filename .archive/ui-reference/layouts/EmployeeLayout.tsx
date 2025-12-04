'use client';

import { ReactNode } from 'react';
import { EmployeeNavbar } from './EmployeeNavbar';
import { TwinWidgetWrapper } from '@/components/twin';

interface EmployeeLayoutProps {
  children: ReactNode;
}

export function EmployeeLayout({ children }: EmployeeLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0D0D0F] flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0F] via-[#141418] to-[#0D0D0F]" />
        <div
          className="absolute top-0 right-0 w-[70%] h-[60%] rounded-bl-[60%]"
          style={{
            background: 'radial-gradient(ellipse at 85% 15%, rgba(201, 169, 97, 0.08) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <EmployeeNavbar />

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/10 bg-[#0D0D0F]/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gold-500/20 rounded-lg flex items-center justify-center">
                  <span className="font-heading font-black text-sm text-gold-400">I</span>
                </div>
                <div>
                  <p className="text-sm text-white font-bold">InTime Solutions</p>
                  <p className="text-xs text-charcoal-500">Living Organism. Best of the Best.</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-charcoal-500">
                <a href="/privacy" className="hover:text-gold-400 transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-gold-400 transition-colors">Terms</a>
                <a href="/support" className="hover:text-gold-400 transition-colors">Support</a>
              </div>

              <p className="text-xs text-charcoal-600">
                © {new Date().getFullYear()} InTime. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

        {/* AI Twin Floating Widget */}
        <TwinWidgetWrapper />
      </div>
    </div>
  );
}

export default EmployeeLayout;
