'use client';

import React from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Clock,
  MessageSquare,
  Building2,
  Users
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/templates';

const CONTACT_OPTIONS = [
  {
    icon: Users,
    title: 'Hire Talent',
    description: 'Looking to hire qualified technology professionals? Tell us about your needs.',
    cta: 'Start Hiring',
    href: '/contact/hire'
  },
  {
    icon: Building2,
    title: 'Enterprise Solutions',
    description: 'Custom staffing, training, or consulting solutions for your organization.',
    cta: 'Enterprise Inquiry',
    href: '/contact/enterprise'
  },
  {
    icon: MessageSquare,
    title: 'General Inquiry',
    description: 'Questions about our services, partnerships, or other topics.',
    cta: 'Get in Touch',
    href: '/contact/general'
  }
];

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="relative py-32 bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-forest-900 via-charcoal-900 to-charcoal-950" />
          <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-gold-600/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 mb-8">
              <MessageSquare size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Contact Us</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-black text-white leading-[0.95] mb-8">
              Let's{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                Connect
              </span>
            </h1>

            <p className="text-xl text-charcoal-300 font-light leading-relaxed mb-10 max-w-2xl">
              Ready to transform your workforce strategy? We're here to help.
              Choose the best way to reach us below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {CONTACT_OPTIONS.map((option, i) => {
              const Icon = option.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-10 shadow-elevation-md border border-charcoal-100/50 text-center"
                >
                  <div className="w-16 h-16 rounded-xl bg-forest-100 flex items-center justify-center mx-auto mb-6">
                    <Icon size={28} className="text-forest-600" />
                  </div>

                  <h3 className="text-xl font-heading font-bold text-charcoal-900 mb-4">
                    {option.title}
                  </h3>

                  <p className="text-charcoal-500 mb-6">
                    {option.description}
                  </p>

                  <Link
                    href={option.href}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-forest-600 to-forest-700 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-xl transition-all"
                  >
                    {option.cta}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Contact Info */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-charcoal-900 to-forest-900 rounded-3xl p-12">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-heading font-bold text-white mb-6">
                    Direct Contact
                  </h3>
                  <div className="space-y-6">
                    <a href="mailto:info@intimeesolutions.com" className="flex items-center gap-4 text-charcoal-300 hover:text-gold-400 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <Mail size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-charcoal-400 uppercase tracking-widest mb-1">Email</div>
                        <div className="font-medium">info@intimeesolutions.com</div>
                      </div>
                    </a>
                    <a href="tel:+1-888-555-0123" className="flex items-center gap-4 text-charcoal-300 hover:text-gold-400 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <Phone size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-charcoal-400 uppercase tracking-widest mb-1">Phone</div>
                        <div className="font-medium">+1 (888) 555-0123</div>
                      </div>
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-heading font-bold text-white mb-6">
                    Locations
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-charcoal-300">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-charcoal-400 uppercase tracking-widest mb-1">Headquarters</div>
                        <div className="font-medium">Dallas, TX</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-charcoal-300">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <Clock size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-charcoal-400 uppercase tracking-widest mb-1">Business Hours</div>
                        <div className="font-medium">Mon-Fri, 9AM-6PM CT</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
