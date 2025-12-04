'use client';

import React from 'react';
import Link from 'next/link';
import { Linkedin, Twitter, Youtube, Mail } from 'lucide-react';

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

interface FooterProps {
  columns?: FooterColumn[];
  socialLinks?: { label: string; href: string }[];
}

const defaultColumns: FooterColumn[] = [
  {
    title: 'Solutions',
    links: [
      { label: 'IT Staffing', href: '/solutions/staffing' },
      { label: 'Consulting', href: '/consulting' },
      { label: 'Cross-Border', href: '/solutions/cross-border' },
      { label: 'Training Academy', href: '/academy' },
      { label: 'Request Consultation', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/resources' },
      { label: 'Industries', href: '/industries' },
      { label: 'Open Positions', href: '/careers/open-positions' },
      { label: 'Available Talent', href: '/careers/available-talent' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About InTime', href: '/company/about' },
      { label: 'Careers', href: '/careers/join-our-team' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
];

export const Footer: React.FC<FooterProps> = ({
  columns = defaultColumns,
}) => {
  return (
    <footer className="bg-charcoal-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-forest-500 to-forest-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="font-heading font-bold italic text-xl text-gold-400">I</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-heading font-bold text-white">InTime</span>
                <span className="text-2xl font-heading font-medium text-gold-500 ml-1">Solutions</span>
              </div>
            </Link>

            <p className="text-charcoal-400 mb-6 max-w-sm leading-relaxed">
              The premier staffing ecosystem for technology professionals. From world-class training
              to executive placements—we build careers that matter.
            </p>

            {/* Office Locations */}
            <div className="space-y-4 text-sm">
              <div className="text-charcoal-300 font-medium mb-2">Global Offices</div>
              <div className="space-y-3 text-charcoal-400">
                <a href="tel:+13076502850" className="flex items-center gap-3 hover:text-gold-400 transition-colors">
                  <span className="text-base">🇺🇸</span>
                  <span>USA: +1 307-650-2850</span>
                </a>
                <a href="tel:+12892369000" className="flex items-center gap-3 hover:text-gold-400 transition-colors">
                  <span className="text-base">🇨🇦</span>
                  <span>Canada: +1 289-236-9000</span>
                </a>
                <a href="tel:+917981666144" className="flex items-center gap-3 hover:text-gold-400 transition-colors">
                  <span className="text-base">🇮🇳</span>
                  <span>India: +91 798-166-6144</span>
                </a>
              </div>
              <a href="mailto:info@intimeesolutions.com" className="flex items-center gap-3 hover:text-gold-400 transition-colors mt-4">
                <Mail size={16} />
                info@intimeesolutions.com
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {columns.map((column, i) => (
            <div key={i}>
              <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href}
                      className="text-charcoal-400 hover:text-gold-400 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-charcoal-800">
        <div className="container mx-auto px-6 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-charcoal-500 text-sm">
              &copy; {new Date().getFullYear()} InTime eSolutions. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-charcoal-800 flex items-center justify-center text-charcoal-400 hover:bg-gold-500 hover:text-charcoal-900 transition-all"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-charcoal-800 flex items-center justify-center text-charcoal-400 hover:bg-gold-500 hover:text-charcoal-900 transition-all"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-charcoal-800 flex items-center justify-center text-charcoal-400 hover:bg-gold-500 hover:text-charcoal-900 transition-all"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
