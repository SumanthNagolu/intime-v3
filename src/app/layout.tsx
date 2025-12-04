import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

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
    <html lang="en">
      <body className="min-h-screen bg-cream antialiased font-body">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <main id="main-content">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
