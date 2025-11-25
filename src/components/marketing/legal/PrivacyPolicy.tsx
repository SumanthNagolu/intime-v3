'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/templates';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNavbar />

      {/* Header */}
      <section className="py-20 bg-charcoal-900">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-charcoal-400 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-forest-500/10 text-forest-400 border border-forest-500/20 mb-6">
              <Shield size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Legal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-charcoal-400">
              Last updated: January 1, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto prose prose-lg prose-charcoal">
            <h2>1. Introduction</h2>
            <p>
              InTime Solutions ("we," "our," or "us") respects your privacy and is committed to protecting
              your personal data. This privacy policy explains how we collect, use, disclose, and safeguard
              your information when you visit our website or use our services.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>We may collect personal information that you voluntarily provide, including:</p>
            <ul>
              <li>Name and contact information (email, phone number, address)</li>
              <li>Professional information (resume, work history, skills)</li>
              <li>Account credentials (username, password)</li>
              <li>Payment information (processed through secure third-party providers)</li>
              <li>Communication preferences</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <p>When you visit our website, we automatically collect:</p>
            <ul>
              <li>Device information (browser type, operating system)</li>
              <li>IP address and location data</li>
              <li>Usage data (pages visited, time spent, clicks)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use collected information for:</p>
            <ul>
              <li>Providing and improving our services</li>
              <li>Matching candidates with job opportunities</li>
              <li>Processing enrollments and payments for training programs</li>
              <li>Communicating with you about our services</li>
              <li>Analyzing usage patterns to improve user experience</li>
              <li>Complying with legal obligations</li>
            </ul>

            <h2>4. Information Sharing</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Clients:</strong> When you apply for positions or are submitted for roles</li>
              <li><strong>Service Providers:</strong> Third parties that help us operate our business</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or sales</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data.
              However, no method of transmission over the Internet is 100% secure, and we cannot guarantee
              absolute security.
            </p>

            <h2>6. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing</li>
              <li>Data portability</li>
              <li>Withdraw consent</li>
            </ul>

            <h2>7. Cookies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience. See our{' '}
              <Link href="/cookies" className="text-forest-600 hover:text-forest-700">Cookie Policy</Link>
              {' '}for more details.
            </p>

            <h2>8. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy
              practices of these external sites.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under 18 years of age. We do not knowingly
              collect personal information from children.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by
              posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have questions about this privacy policy, please contact us at:
            </p>
            <ul>
              <li>Email: privacy@intimeesolutions.com</li>
              <li>Address: Dallas, TX</li>
              <li>Phone: +1 (888) 555-0123</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
