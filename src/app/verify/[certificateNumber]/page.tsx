/**
 * Public Certificate Verification Page
 * Story: ACAD-023
 *
 * Allows anyone to verify a certificate by its number
 */

import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Calendar, Award, User, BookOpen } from 'lucide-react';
import { trpc } from '@/lib/trpc/server';

export default async function CertificateVerificationPage({
  params,
}: {
  params: { certificateNumber: string };
}) {
  // Call tRPC server-side to verify certificate
  const caller = trpc.createCaller({});

  let certificateData;
  try {
    certificateData = await caller.certificates.verify({
      certificate_number: params.certificateNumber,
    });
  } catch (error) {
    certificateData = { is_valid: false };
  }

  if (!certificateData || !certificateData.is_valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
            <p className="text-gray-600">
              The certificate number <strong>{params.certificateNumber}</strong> could not be
              verified.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Possible reasons:</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Invalid certificate number</li>
              <li>Certificate has been revoked</li>
              <li>Certificate not yet issued</li>
              <li>Typographical error in number</li>
            </ul>
          </div>

          <div className="mt-6">
            <a
              href="/"
              className="text-sm text-primary hover:underline"
            >
              Return to Homepage
            </a>
          </div>
        </Card>
      </div>
    );
  }

  const formattedCompletionDate = new Date(certificateData.completion_date).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  const formattedIssueDate = new Date(certificateData.issued_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-50">
      <Card className="max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Certificate Verified</h1>
              <p className="text-green-100">This is an authentic InTime certificate</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3 inline-block">
            <p className="text-xs text-green-100 mb-1">Certificate Number</p>
            <p className="text-lg font-mono font-bold">{certificateData.certificate_number}</p>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Student Name */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Student Name</p>
                <p className="font-semibold text-lg text-gray-900">
                  {certificateData.student_name}
                </p>
              </div>
            </div>

            {/* Course Name */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Course</p>
                <p className="font-semibold text-lg text-gray-900">
                  {certificateData.course_name}
                </p>
              </div>
            </div>

            {/* Completion Date */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Completion Date</p>
                <p className="font-semibold text-gray-900">{formattedCompletionDate}</p>
              </div>
            </div>

            {/* Grade */}
            {certificateData.grade && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Final Grade</p>
                  <p className="font-semibold text-lg text-gray-900">
                    {certificateData.grade}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Issue Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Issued By</p>
                <p className="font-medium text-gray-900">InTime Training Academy</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Issue Date</p>
                <p className="font-medium text-gray-900">{formattedIssueDate}</p>
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verified Authentic
            </Badge>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              This certificate was verified on {new Date().toLocaleDateString('en-US')}
            </p>
            <a
              href="https://intime.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              Learn more about InTime Training Academy
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { certificateNumber: string } }) {
  return {
    title: `Certificate Verification - ${params.certificateNumber}`,
    description: 'Verify the authenticity of an InTime Training Academy certificate',
  };
}
