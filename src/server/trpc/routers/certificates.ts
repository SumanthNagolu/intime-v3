/**
 * Certificates tRPC Router
 * Story: ACAD-023
 *
 * Endpoints for:
 * - Viewing student certificates
 * - Downloading certificates
 * - Verifying certificates (public)
 * - Generating certificate PDFs
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateCertificatePDF, verifyCertificate } from '@/lib/certificates/generator';

export const certificatesRouter = router({
  /**
   * Get user's certificates
   */
  getMyCertificates: protectedProcedure.query(async ({ ctx }) => {
    const supabase = await createClient();

    const { data: certificates, error } = await (supabase.from as any)('student_certificates')
      .select(
        `
        *,
        course:courses(id, title, slug),
        enrollment:student_enrollments(enrolled_at, completed_at)
      `
      )
      .eq('student_id', ctx.userId)
      .order('issued_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch certificates: ${error.message}`);
    }

    return certificates || [];
  }),

  /**
   * Get certificate by ID
   */
  getCertificateById: protectedProcedure
    .input(z.object({ certificate_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      const { data: certificate, error } = await (supabase.from as any)('student_certificates')
        .select(
          `
          *,
          course:courses(id, title, slug),
          enrollment:student_enrollments(enrolled_at, completed_at)
        `
        )
        .eq('id', input.certificate_id)
        .eq('student_id', ctx.userId)
        .single();

      if (error || !certificate) {
        throw new Error('Certificate not found');
      }

      return certificate;
    }),

  /**
   * Generate certificate PDF (triggers background job)
   */
  generatePDF: protectedProcedure
    .input(z.object({ certificate_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Verify ownership
      const { data: certificate } = await (supabase.from as any)('student_certificates')
        .select('id, student_id, status, pdf_url')
        .eq('id', input.certificate_id)
        .eq('student_id', ctx.userId)
        .single();

      if (!certificate) {
        throw new Error('Certificate not found');
      }

      // If already generated, return existing URL
      if (certificate.status === 'issued' && certificate.pdf_url) {
        return {
          success: true,
          pdf_url: certificate.pdf_url,
          already_generated: true,
        };
      }

      // Generate PDF directly (for now - can be moved to background job)
      try {
        const pdfUrl = await generateCertificatePDF(input.certificate_id);

        return {
          success: true,
          pdf_url: pdfUrl,
          already_generated: false,
        };
      } catch (error: any) {
        throw new Error(`Failed to generate PDF: ${error.message}`);
      }
    }),

  /**
   * Get download URL for certificate
   */
  getDownloadUrl: protectedProcedure
    .input(z.object({ certificate_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      const { data: certificate } = await (supabase.from as any)('student_certificates')
        .select('id, student_id, pdf_url, status')
        .eq('id', input.certificate_id)
        .eq('student_id', ctx.userId)
        .single();

      if (!certificate) {
        throw new Error('Certificate not found');
      }

      if (certificate.status !== 'issued' || !certificate.pdf_url) {
        throw new Error('Certificate PDF not yet generated');
      }

      return {
        download_url: certificate.pdf_url,
      };
    }),

  /**
   * Verify certificate (public endpoint)
   */
  verify: publicProcedure
    .input(z.object({ certificate_number: z.string() }))
    .query(async ({ input }) => {
      const result = await verifyCertificate(input.certificate_number);

      if (!result) {
        return {
          is_valid: false,
          message: 'Certificate not found or invalid',
        };
      }

      return result;
    }),

  /**
   * Get LinkedIn share data
   */
  getLinkedInShareData: protectedProcedure
    .input(z.object({ certificate_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      const { data: certificate } = await (supabase.from as any)('student_certificates')
        .select(
          `
          *,
          course:courses(title),
          student:user_profiles!student_id(full_name)
        `
        )
        .eq('id', input.certificate_id)
        .eq('student_id', ctx.userId)
        .single();

      if (!certificate) {
        throw new Error('Certificate not found');
      }

      const course = certificate.course as any;
      const student = certificate.student as any;

      // LinkedIn share URL format
      const certUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${certificate.certificate_number}`;
      const shareText = `I'm excited to share that I've completed ${course.title} at InTime Training Academy!`;

      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`;

      return {
        share_url: linkedInUrl,
        share_text: shareText,
        certificate_url: certUrl,
        course_name: course.title,
        student_name: student.full_name,
        completion_date: certificate.completion_date,
      };
    }),

  /**
   * Admin: Get all certificates
   */
  adminGetAll: protectedProcedure
    .input(
      z.object({
        course_id: z.string().uuid().optional(),
        status: z.enum(['pending', 'issued', 'failed']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const supabase = await createClient();

      let query = (supabase.from as any)('student_certificates')
        .select(
          `
          *,
          student:user_profiles!student_id(id, full_name, email),
          course:courses(id, title),
          enrollment:student_enrollments(enrolled_at, completed_at)
        `,
          { count: 'exact' }
        )
        .order('issued_date', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.course_id) {
        query = query.eq('course_id', input.course_id);
      }

      if (input.status) {
        query = query.eq('status', input.status);
      }

      const { data: certificates, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch certificates: ${error.message}`);
      }

      return {
        certificates: certificates || [],
        total: count || 0,
      };
    }),
});
