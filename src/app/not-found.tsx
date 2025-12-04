'use client';

/**
 * 404 Not Found Page
 *
 * Displayed when a route doesn't exist.
 * Styled to match the InTime marketing site design.
 */

import Link from 'next/link';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/marketing/templates';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <MarketingNavbar />

      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Number */}
            <div className="relative mb-8">
              <span className="text-[12rem] md:text-[16rem] font-heading font-black text-charcoal-100 leading-none select-none">
                404
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-forest-500 to-forest-600 flex items-center justify-center shadow-lg">
                  <Search size={40} className="text-white" />
                </div>
              </div>
            </div>

            {/* Message */}
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-charcoal-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-lg text-charcoal-500 mb-10 max-w-md mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
              Let&apos;s get you back on track.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-forest-600 to-forest-700 text-white rounded-full font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl hover:from-forest-700 hover:to-forest-800 transition-all"
              >
                <Home size={18} />
                Go to Homepage
              </Link>

              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-charcoal-700 border border-charcoal-200 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-charcoal-50 hover:border-charcoal-300 transition-all"
              >
                <ArrowLeft size={18} />
                Go Back
              </button>
            </div>

            {/* Quick Links */}
            <div className="pt-8 border-t border-charcoal-200">
              <p className="text-sm text-charcoal-400 mb-4">Popular destinations</p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { label: 'Academy', href: '/academy' },
                  { label: 'Solutions', href: '/solutions' },
                  { label: 'Industries', href: '/industries' },
                  { label: 'Careers', href: '/careers' },
                  { label: 'Contact', href: '/contact' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 bg-charcoal-100 text-charcoal-600 rounded-full text-sm font-medium hover:bg-forest-100 hover:text-forest-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-12 p-6 bg-gold-50 rounded-2xl border border-gold-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
                  <HelpCircle size={20} className="text-gold-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-charcoal-900 mb-1">Need help?</h3>
                  <p className="text-sm text-charcoal-600">
                    Can&apos;t find what you&apos;re looking for? Contact our team at{' '}
                    <a href="mailto:info@intimeesolutions.com" className="text-forest-600 hover:underline">
                      info@intimeesolutions.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
