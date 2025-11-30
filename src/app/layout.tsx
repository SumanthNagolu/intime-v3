import type { Metadata } from 'next';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc/Provider';

export const metadata: Metadata = {
  title: 'InTime v3 - Multi-Agent Staffing Platform',
  description: 'Living organism platform for staffing business operations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 overflow-y-auto">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
