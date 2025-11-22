/**
 * Student Certificates Page
 * Story: ACAD-023
 *
 * View, download, and share certificates
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Download,
  Share2,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Linkedin,
  Copy,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

export default function CertificatesPage() {
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const { data: certificates, isLoading, refetch } = trpc.certificates.getMyCertificates.useQuery();

  const generatePDFMutation = trpc.certificates.generatePDF.useMutation({
    onSuccess: (data) => {
      if (data.already_generated) {
        toast.info('Certificate already generated');
      } else {
        toast.success('Certificate generated successfully!');
      }
      setGeneratingId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to generate certificate: ${error.message}`);
      setGeneratingId(null);
    },
  });

  const handleGeneratePDF = async (certificateId: string) => {
    setGeneratingId(certificateId);
    generatePDFMutation.mutate({ certificate_id: certificateId });
  };

  const handleDownload = (pdfUrl: string, courseName: string) => {
    window.open(pdfUrl, '_blank');
    toast.success('Opening certificate...');
  };

  const handleLinkedInShare = async (certificateId: string) => {
    try {
      const { data } = await trpc.certificates.getLinkedInShareData.useQuery({
        certificate_id: certificateId,
      });

      if (data) {
        window.open(data.share_url, '_blank', 'width=600,height=600');
        toast.success('Opening LinkedIn share...');
      }
    } catch (error) {
      toast.error('Failed to get LinkedIn share data');
    }
  };

  const handleCopyVerificationLink = (certificateNumber: string) => {
    const verifyUrl = `${window.location.origin}/verify/${certificateNumber}`;
    navigator.clipboard.writeText(verifyUrl);
    toast.success('Verification link copied!');
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Certificates</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Certificates</h1>
        <Card className="p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h2>
          <p className="text-gray-600 mb-6">
            Complete a course to earn your first certificate!
          </p>
          <Link href="/students/courses">
            <Button>Browse Courses</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
        <p className="text-gray-600">
          View, download, and share your course completion certificates
        </p>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((cert: any) => {
          const course = cert.course;
          const isIssued = cert.status === 'issued';
          const isPending = cert.status === 'pending';
          const isFailed = cert.status === 'failed';
          const isGenerating = generatingId === cert.id;

          return (
            <Card key={cert.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Certificate Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6" />
                    <h3 className="font-semibold">Certificate of Completion</h3>
                  </div>
                  {isIssued && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Issued
                    </Badge>
                  )}
                  {isPending && (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-white border-0">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>

                <h4 className="text-xl font-bold mb-2">{course.title}</h4>

                <div className="flex items-center gap-2 text-sm text-purple-100">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Completed {new Date(cert.completion_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Certificate Body */}
              <div className="p-6">
                {/* Certificate Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Certificate #</span>
                    <span className="font-mono font-medium">{cert.certificate_number}</span>
                  </div>

                  {cert.grade_achieved && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Final Grade</span>
                      <span className="font-semibold text-green-600">
                        {cert.grade_achieved}%
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Issued</span>
                    <span className="font-medium">
                      {new Date(cert.issued_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {isIssued && cert.pdf_url && (
                    <>
                      <Button
                        onClick={() => handleDownload(cert.pdf_url, course.title)}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyVerificationLink(cert.certificate_number)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/verify/${cert.certificate_number}`)}`,
                              '_blank',
                              'width=600,height=600'
                            )
                          }
                        >
                          <Linkedin className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <a
                          href={`/verify/${cert.certificate_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Verification Page
                        </a>
                      </Button>
                    </>
                  )}

                  {isPending && (
                    <Button
                      onClick={() => handleGeneratePDF(cert.id)}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Generate Certificate
                        </>
                      )}
                    </Button>
                  )}

                  {isFailed && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-red-800 mb-2">Certificate generation failed</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGeneratePDF(cert.id)}
                        disabled={isGenerating}
                      >
                        Retry
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
