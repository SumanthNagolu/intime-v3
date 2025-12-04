import type { Metadata } from 'next';
import './globals.css';

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
      <body className="min-h-screen bg-ivory antialiased font-body">
        {children}
      </body>
    </html>
  );
}
