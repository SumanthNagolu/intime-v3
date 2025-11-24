'use client';

/**
 * Employee Screenshot Consent Page
 *
 * GDPR/CCPA compliance requirement for screenshot monitoring.
 * Employees must provide explicit consent before screenshot capture begins.
 */

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function ConsentPage() {
  const [loading, setLoading] = useState(false);
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleConsent = async (consent: boolean) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Please log in to continue');
        return;
      }

      // Store consent in user_profiles table
      const { error } = await supabase
        .from('user_profiles')
        .update({
          screenshot_consent: consent,
          screenshot_consent_date: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setHasConsented(consent);

      // Redirect after consent
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (hasConsented !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              {hasConsented ? '✅ Consent Recorded' : '❌ Consent Declined'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              {hasConsented
                ? 'Thank you. Screenshot monitoring will begin shortly.'
                : 'You have declined screenshot monitoring. Some features may be limited.'}
            </p>
            <p className="mt-4 text-sm">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-3xl mx-auto py-12">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Employee Screenshot Monitoring Consent</CardTitle>
              <Badge variant="destructive">Required</Badge>
            </div>
            <CardDescription>
              Please review and provide consent for productivity monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* What We Collect */}
            <div>
              <h3 className="font-semibold mb-2">📸 What We Collect</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Periodic screenshots of your desktop (every 30 seconds during work hours)</li>
                <li>Active window title at time of capture</li>
                <li>Machine name and operating system</li>
                <li>Timestamp of each screenshot</li>
              </ul>
            </div>

            {/* How We Use It */}
            <div>
              <h3 className="font-semibold mb-2">🤖 How We Use It</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>AI automatically classifies activities (coding, meetings, email, etc.)</li>
                <li>Generates daily productivity reports and insights</li>
                <li>Powers your personalized AI assistant with context</li>
                <li><strong>No human ever views your raw screenshots</strong> - AI only</li>
              </ul>
            </div>

            {/* Your Privacy Rights */}
            <div>
              <h3 className="font-semibold mb-2">🔒 Your Privacy Rights</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>You can pause/resume monitoring anytime from your dashboard</li>
                <li>Screenshots are encrypted and stored securely</li>
                <li>Data is automatically deleted after 90 days</li>
                <li>You can request deletion of all your data anytime</li>
                <li>Only aggregated metrics shared with managers - never raw images</li>
              </ul>
            </div>

            {/* Data Retention */}
            <div>
              <h3 className="font-semibold mb-2">⏱️ Data Retention</h3>
              <p className="text-sm text-muted-foreground">
                Screenshots: 90 days (soft delete) → 1 year (hard delete)
                <br />
                Aggregated reports: 2 years for performance reviews
              </p>
            </div>

            {/* Legal Compliance */}
            <div>
              <h3 className="font-semibold mb-2">⚖️ Legal Compliance</h3>
              <p className="text-sm text-muted-foreground">
                This system complies with GDPR, CCPA, and workplace monitoring laws.
                You have the right to access, rectify, or delete your personal data.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                <strong>Questions or Concerns?</strong>
                <br />
                Contact our Privacy Officer: privacy@intimesolutions.com
                <br />
                Or speak with HR about alternative arrangements.
              </p>
            </div>

            {/* Consent Buttons */}
            <div className="pt-6 space-y-3">
              <Button
                onClick={() => handleConsent(true)}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Processing...' : 'I Consent - Enable Monitoring'}
              </Button>
              <Button
                onClick={() => handleConsent(false)}
                disabled={loading}
                variant="outline"
                className="w-full"
                size="lg"
              >
                I Do Not Consent
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By clicking &quot;I Consent&quot;, you acknowledge that you have read and understood
                the above information and agree to screenshot monitoring.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm">Can my manager see my screenshots?</h4>
              <p className="text-sm text-muted-foreground">
                No. Only AI processes your screenshots. Managers see aggregated data only
                (e.g., &quot;coding: 65%, meetings: 20%&quot;). Raw screenshots are never shown to humans.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">What if I&apos;m working on personal tasks?</h4>
              <p className="text-sm text-muted-foreground">
                You can pause monitoring from your dashboard. Paused time is simply marked as
                &quot;offline&quot; - no questions asked.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">What happens if I decline?</h4>
              <p className="text-sm text-muted-foreground">
                Productivity features (timelines, AI assistant context) will be limited.
                You&apos;ll need to manually track your work for performance reviews.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Can I revoke consent later?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, anytime. Go to Settings → Privacy → Revoke Screenshot Consent.
                All your data will be deleted within 7 business days.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
