/**
 * Certificate Generation Service
 * Story: ACAD-023
 *
 * Generates PDF certificates using Puppeteer with HTML templates
 */

import puppeteer from 'puppeteer';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface CertificateData {
  certificateId: string;
  certificateNumber: string;
  studentName: string;
  courseName: string;
  completionDate: string;
  issueDate: string;
  grade?: number;
  skills?: string[];
}

/**
 * Generate certificate HTML template
 */
function generateCertificateHTML(data: CertificateData): string {
  const formattedCompletionDate = new Date(data.completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedIssueDate = new Date(data.issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Georgia', serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px;
    }

    .certificate {
      background: white;
      width: 1056px;
      height: 816px;
      margin: 0 auto;
      padding: 60px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      border: 20px solid #f8f9fa;
      position: relative;
    }

    .border-inner {
      border: 3px solid #667eea;
      height: 100%;
      padding: 40px;
      position: relative;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
    }

    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 10px;
    }

    .subtitle {
      font-size: 14px;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .title {
      text-align: center;
      font-size: 48px;
      font-weight: bold;
      color: #2c3e50;
      margin: 40px 0 30px 0;
      text-transform: uppercase;
      letter-spacing: 3px;
    }

    .presented-to {
      text-align: center;
      font-size: 18px;
      color: #6c757d;
      margin-bottom: 15px;
    }

    .student-name {
      text-align: center;
      font-size: 40px;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 30px;
      font-family: 'Brush Script MT', cursive;
    }

    .completion-text {
      text-align: center;
      font-size: 18px;
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .course-name {
      text-align: center;
      font-size: 28px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 30px;
    }

    .date-section {
      text-align: center;
      font-size: 16px;
      color: #6c757d;
      margin-bottom: 30px;
    }

    ${data.grade ? `
    .grade-section {
      text-align: center;
      margin-bottom: 30px;
    }

    .grade-badge {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 10px 30px;
      border-radius: 50px;
      font-size: 20px;
      font-weight: bold;
    }
    ` : ''}

    ${data.skills && data.skills.length > 0 ? `
    .skills-section {
      text-align: center;
      margin-bottom: 30px;
    }

    .skills-title {
      font-size: 14px;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }

    .skills-list {
      font-size: 16px;
      color: #2c3e50;
    }
    ` : ''}

    .footer {
      position: absolute;
      bottom: 40px;
      left: 40px;
      right: 40px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .signature-section {
      text-align: center;
      flex: 1;
    }

    .signature-line {
      border-top: 2px solid #2c3e50;
      width: 200px;
      margin: 0 auto 10px auto;
    }

    .signature-label {
      font-size: 12px;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .certificate-number {
      font-size: 10px;
      color: #adb5bd;
      text-align: right;
    }

    .verification-code {
      font-size: 10px;
      color: #adb5bd;
      text-align: left;
    }

    .decorative-corner {
      position: absolute;
      width: 60px;
      height: 60px;
      border: 3px solid #667eea;
    }

    .top-left {
      top: 0;
      left: 0;
      border-right: none;
      border-bottom: none;
    }

    .top-right {
      top: 0;
      right: 0;
      border-left: none;
      border-bottom: none;
    }

    .bottom-left {
      bottom: 0;
      left: 0;
      border-right: none;
      border-top: none;
    }

    .bottom-right {
      bottom: 0;
      right: 0;
      border-left: none;
      border-top: none;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="border-inner">
      <!-- Decorative corners -->
      <div class="decorative-corner top-left"></div>
      <div class="decorative-corner top-right"></div>
      <div class="decorative-corner bottom-left"></div>
      <div class="decorative-corner bottom-right"></div>

      <!-- Header -->
      <div class="header">
        <div class="logo">InTime</div>
        <div class="subtitle">Training Academy</div>
      </div>

      <!-- Title -->
      <div class="title">Certificate of Completion</div>

      <!-- Presented to -->
      <div class="presented-to">This certificate is proudly presented to</div>

      <!-- Student Name -->
      <div class="student-name">${data.studentName}</div>

      <!-- Completion Text -->
      <div class="completion-text">for successfully completing the course</div>

      <!-- Course Name -->
      <div class="course-name">${data.courseName}</div>

      <!-- Date -->
      <div class="date-section">
        Completed on ${formattedCompletionDate}
      </div>

      <!-- Grade (if provided) -->
      ${data.grade ? `
      <div class="grade-section">
        <div class="grade-badge">Final Grade: ${data.grade}%</div>
      </div>
      ` : ''}

      <!-- Skills (if provided) -->
      ${data.skills && data.skills.length > 0 ? `
      <div class="skills-section">
        <div class="skills-title">Skills Mastered</div>
        <div class="skills-list">${data.skills.join(' • ')}</div>
      </div>
      ` : ''}

      <!-- Footer -->
      <div class="footer">
        <div class="verification-code">
          Verify: intime.com/verify/${data.certificateNumber}
        </div>
        <div class="signature-section">
          <div class="signature-line"></div>
          <div class="signature-label">Director, Training Academy</div>
        </div>
        <div class="certificate-number">
          Certificate #${data.certificateNumber}<br>
          Issued: ${formattedIssueDate}
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate certificate PDF and upload to storage
 */
export async function generateCertificatePDF(certificateId: string): Promise<string> {
  const supabase = createAdminClient();

  try {
    // Get certificate data
    const { data: certificate, error: certError } = await supabase
      .from('student_certificates')
      .select(
        `
        *,
        student:user_profiles!student_id(full_name),
        course:courses(title)
      `
      )
      .eq('id', certificateId)
      .single();

    if (certError || !certificate) {
      throw new Error(`Certificate ${certificateId} not found`);
    }

    const student = certificate.student as any;
    const course = certificate.course as any;

    // Prepare certificate data
    const certData: CertificateData = {
      certificateId: certificate.id,
      certificateNumber: certificate.certificate_number,
      studentName: student.full_name || 'Student Name',
      courseName: course.title || 'Course Name',
      completionDate: certificate.completion_date,
      issueDate: certificate.issued_date,
      grade: certificate.grade_achieved,
      skills: certificate.skills_mastered || [],
    };

    // Generate HTML
    const html = generateCertificateHTML(certData);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set viewport for A4 landscape
    await page.setViewport({
      width: 1056,
      height: 816,
      deviceScaleFactor: 2,
    });

    // Load HTML
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      width: '11in',
      height: '8.5in',
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    // Upload to Supabase Storage
    const fileName = `certificates/${certificateId}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('certificates')
      .getPublicUrl(fileName);

    const pdfUrl = urlData.publicUrl;

    // Update certificate record
    await supabase
      .from('student_certificates')
      .update({
        pdf_url: pdfUrl,
        status: 'issued',
      })
      .eq('id', certificateId);

    console.log(`[Certificate] Generated PDF for certificate ${certificateId}: ${pdfUrl}`);

    return pdfUrl;
  } catch (error) {
    console.error(`[Certificate] Failed to generate PDF for ${certificateId}:`, error);

    // Update certificate status to failed
    await supabase
      .from('student_certificates')
      .update({
        status: 'failed',
      })
      .eq('id', certificateId);

    throw error;
  }
}

/**
 * Verify certificate by certificate number
 */
export async function verifyCertificate(certificateNumber: string) {
  const supabase = await createClient();

  const { data: certificate, error } = await supabase
    .from('student_certificates')
    .select(
      `
      *,
      student:user_profiles!student_id(full_name),
      course:courses(title)
    `
    )
    .eq('certificate_number', certificateNumber)
    .eq('status', 'issued')
    .single();

  if (error || !certificate) {
    return null;
  }

  const student = certificate.student as any;
  const course = certificate.course as any;

  return {
    certificate_number: certificate.certificate_number,
    student_name: student.full_name,
    course_name: course.title,
    completion_date: certificate.completion_date,
    issued_date: certificate.issued_date,
    grade: certificate.grade_achieved,
    is_valid: true,
  };
}
