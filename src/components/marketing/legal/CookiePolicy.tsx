'use client';

import React from 'react';
import Link from 'next/link';
import { Cookie, ArrowLeft } from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/marketing/templates';

export const CookiePolicy: React.FC = () => {
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
              <Cookie size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Legal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
              Cookie Policy
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
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help websites
              remember information about your visit, making your next visit easier and the site more useful.
            </p>

            <h2>2. How We Use Cookies</h2>
            <p>InTime Solutions uses cookies to:</p>
            <ul>
              <li>Keep you signed in to your account</li>
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our website</li>
              <li>Improve our services based on usage patterns</li>
              <li>Show relevant content and advertisements</li>
            </ul>

            <h2>3. Types of Cookies We Use</h2>

            <h3>Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function properly. They enable basic features
              like page navigation and access to secure areas.
            </p>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>session_id</td>
                  <td>Maintains user session</td>
                  <td>Session</td>
                </tr>
                <tr>
                  <td>csrf_token</td>
                  <td>Security protection</td>
                  <td>Session</td>
                </tr>
              </tbody>
            </table>

            <h3>Functional Cookies</h3>
            <p>
              These cookies enable enhanced functionality and personalization, such as remembering your
              language preferences.
            </p>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>preferences</td>
                  <td>Stores user preferences</td>
                  <td>1 year</td>
                </tr>
                <tr>
                  <td>language</td>
                  <td>Language selection</td>
                  <td>1 year</td>
                </tr>
              </tbody>
            </table>

            <h3>Analytics Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our website by collecting and
              reporting information anonymously.
            </p>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>_ga</td>
                  <td>Google Analytics - User identification</td>
                  <td>2 years</td>
                </tr>
                <tr>
                  <td>_gid</td>
                  <td>Google Analytics - Session tracking</td>
                  <td>24 hours</td>
                </tr>
              </tbody>
            </table>

            <h3>Marketing Cookies</h3>
            <p>
              These cookies track visitors across websites to enable us to display relevant advertisements.
            </p>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>_fbp</td>
                  <td>Facebook pixel tracking</td>
                  <td>3 months</td>
                </tr>
                <tr>
                  <td>li_sugr</td>
                  <td>LinkedIn tracking</td>
                  <td>3 months</td>
                </tr>
              </tbody>
            </table>

            <h2>4. Third-Party Cookies</h2>
            <p>
              We may use third-party services that set their own cookies, including:
            </p>
            <ul>
              <li><strong>Google Analytics:</strong> For website analytics</li>
              <li><strong>Google Ads:</strong> For advertising</li>
              <li><strong>Facebook/Meta:</strong> For social media integration and advertising</li>
              <li><strong>LinkedIn:</strong> For professional networking and advertising</li>
              <li><strong>Stripe:</strong> For payment processing</li>
            </ul>

            <h2>5. Managing Cookies</h2>
            <h3>Browser Settings</h3>
            <p>
              Most browsers allow you to control cookies through their settings. You can:
            </p>
            <ul>
              <li>Block all cookies</li>
              <li>Accept all cookies</li>
              <li>Block third-party cookies</li>
              <li>Delete cookies when you close your browser</li>
              <li>Receive a notification before a cookie is set</li>
            </ul>

            <h3>Browser-Specific Instructions</h3>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies" target="_blank" rel="noopener noreferrer">Internet Explorer</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>

            <h3>Opt-Out Links</h3>
            <p>You can also opt out of specific tracking:</p>
            <ul>
              <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-Out</a></li>
              <li><a href="https://www.facebook.com/settings?tab=ads" target="_blank" rel="noopener noreferrer">Facebook Ad Preferences</a></li>
              <li><a href="https://www.linkedin.com/psettings/advertising" target="_blank" rel="noopener noreferrer">LinkedIn Ad Preferences</a></li>
            </ul>

            <h2>6. Consequences of Disabling Cookies</h2>
            <p>
              If you disable cookies, some features of our website may not function properly:
            </p>
            <ul>
              <li>You may need to log in repeatedly</li>
              <li>Your preferences may not be saved</li>
              <li>Some features may be unavailable</li>
              <li>You may see less relevant content</li>
            </ul>

            <h2>7. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. The latest version will always be posted
              on this page with the updated date.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please contact us at:
            </p>
            <ul>
              <li>Email: privacy@intimeesolutions.com</li>
              <li>Address: Dallas, TX</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CookiePolicy;
