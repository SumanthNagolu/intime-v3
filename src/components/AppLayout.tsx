'use client';

import { ReactNode } from 'react';
import { SystemBar } from './SystemBar';
import { Navbar } from './Navbar';
import { GlobalCommand } from './GlobalCommand';
import { FloatingGuruButton } from './academy/FloatingGuruButton';

interface AppLayoutProps {
  children: ReactNode;
  showMentor?: boolean;
  immersive?: boolean;
}

export const AppLayout = ({ children, showMentor = false, immersive = false }: AppLayoutProps) => {
  if (immersive) {
    return (
      <div className="h-dvh bg-ivory flex flex-col overflow-hidden">
        <SystemBar />
        <Navbar />
        <GlobalCommand />
        <main className="flex-1 flex flex-col min-h-0 mt-[104px]">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col pt-8">
      <SystemBar />
      <Navbar />
      <GlobalCommand />
      <main className="flex-1 container mx-auto px-6 py-12 mt-20 max-w-[1600px]">
        {children}
      </main>
      {showMentor && <FloatingGuruButton />}
    </div>
  );
};
