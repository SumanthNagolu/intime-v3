'use client';

import { ReactNode } from 'react';
import { SystemBar } from './SystemBar';
import { Navbar } from './Navbar';
import { GlobalCommand } from './GlobalCommand';
import { AIMentor } from './AIMentor';

interface AppLayoutProps {
  children: ReactNode;
  showMentor?: boolean;
}

export const AppLayout = ({ children, showMentor = false }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-ivory flex flex-col pt-8">
      <SystemBar />
      <Navbar />
      <GlobalCommand />
      <main className="flex-1 container mx-auto px-6 py-12 mt-20 max-w-[1600px]">
        {children}
      </main>
      {showMentor && <AIMentor />}
    </div>
  );
};
