import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CommandPaletteProvider } from '@/components/navigation/CommandPaletteProvider';
import { TRPCProvider } from '@/lib/trpc/Provider';

export const metadata: Metadata = {
  title: 'InTime Solutions - Enterprise Staffing & Consulting',
  description: 'Transform your workforce with InTime Solutions - Premier IT staffing, consulting, and training services.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="h-screen overflow-hidden bg-cream antialiased font-body">
        <TRPCProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <main id="main-content">
            {children}
          </main>
          <Toaster />
          <CommandPaletteProvider />
        </TRPCProvider>
      </body>
    </html>
  );
}
