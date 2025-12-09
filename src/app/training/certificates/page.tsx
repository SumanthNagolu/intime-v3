'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Award, Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default function CertificatesPage() {
  const { data: certificates, isLoading } = trpc.academy.getCertificates.useQuery()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal-900">My Certificates</h1>
        <p className="text-charcoal-500 mt-1">View and download your earned certificates</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : certificates && certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {certificates.map((cert: any) => (
            <Card key={cert.id} className="overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-gold-400 to-gold-600" />
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gold-50 rounded-lg">
                    <Award className="w-8 h-8 text-gold-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg text-charcoal-900">
                      {cert.courses?.title || 'Certificate'}
                    </h3>
                    <p className="text-sm text-charcoal-500 mt-1">
                      Certificate #{cert.certificate_number}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-charcoal-500">
                      <Calendar className="w-4 h-4" />
                      <span>Issued {format(new Date(cert.issued_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="w-12 h-12 text-charcoal-300 mb-4" />
            <p className="text-charcoal-500">No certificates earned yet</p>
            <p className="text-sm text-charcoal-400 mt-1">Complete courses to earn certificates</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
