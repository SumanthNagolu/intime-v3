import { getAdminClient } from '@/lib/supabase/admin'
import { CheckCircle, XCircle, Award, Calendar, User, BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ certificateNumber: string }>
}

export default async function VerifyCertificatePage({ params }: Props) {
  const { certificateNumber } = await params
  const adminClient = getAdminClient()

  const { data: certificate } = await adminClient
    .from('certificates')
    .select(`
      id,
      certificate_number,
      verification_code,
      issued_at,
      pdf_url,
      path_enrollments:enrollment_id(
        user_profiles:user_id(first_name, last_name),
        learning_paths:path_id(title, slug)
      )
    `)
    .eq('certificate_number', certificateNumber)
    .single()

  const isValid = !!certificate
  const enrollment = certificate?.path_enrollments as {
    user_profiles: { first_name: string; last_name: string } | null
    learning_paths: { title: string; slug: string } | null
  } | null

  const studentName = enrollment?.user_profiles
    ? `${enrollment.user_profiles.first_name} ${enrollment.user_profiles.last_name}`.trim()
    : 'Unknown'
  const pathTitle = enrollment?.learning_paths?.title || 'Guidewire Developer Training'
  const issuedDate = certificate?.issued_at
    ? new Date(certificate.issued_at).toLocaleDateString('en-US', { dateStyle: 'long' })
    : null

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold text-charcoal-900">Certificate Verification</h1>
          <p className="text-sm text-charcoal-500 mt-1">InTime Academy</p>
        </div>

        {isValid ? (
          <div className="rounded-xl border border-green-200 bg-white shadow-elevation-md overflow-hidden">
            {/* Verified badge */}
            <div className="bg-green-50 px-6 py-4 border-b border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-800">Verified Certificate</p>
                  <p className="text-xs text-green-600">This certificate is authentic and valid</p>
                </div>
              </div>
            </div>

            {/* Certificate details */}
            <div className="p-6 space-y-5">
              <div className="text-center pb-4 border-b border-charcoal-100">
                <div className="w-14 h-14 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-7 h-7 text-gold-600" />
                </div>
                <h2 className="font-heading text-xl font-bold text-charcoal-900">{pathTitle}</h2>
                <p className="text-sm text-charcoal-500 mt-1">Certificate of Completion</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-charcoal-400" />
                  <div>
                    <p className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wider">Student</p>
                    <p className="text-sm font-semibold text-charcoal-900">{studentName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-charcoal-400" />
                  <div>
                    <p className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wider">Program</p>
                    <p className="text-sm font-semibold text-charcoal-900">{pathTitle}</p>
                  </div>
                </div>

                {issuedDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-charcoal-400" />
                    <div>
                      <p className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wider">Issued</p>
                      <p className="text-sm font-semibold text-charcoal-900">{issuedDate}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-charcoal-400" />
                  <div>
                    <p className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wider">Certificate Number</p>
                    <p className="text-sm font-mono font-semibold text-charcoal-900">{certificate.certificate_number}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-red-200 bg-white shadow-elevation-md overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-800">Certificate Not Found</p>
                  <p className="text-xs text-red-600">No certificate matches this number</p>
                </div>
              </div>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-charcoal-600">
                The certificate number <span className="font-mono font-semibold">{certificateNumber}</span> could not be verified.
              </p>
              <p className="text-xs text-charcoal-400 mt-2">
                Please check the number and try again, or contact support.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-charcoal-400">
            Powered by InTime Academy &bull; Guidewire Developer Training
          </p>
        </div>
      </div>
    </div>
  )
}
