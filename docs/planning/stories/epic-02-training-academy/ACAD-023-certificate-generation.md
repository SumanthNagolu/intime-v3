# ACAD-023: Certificate Generation

**Status:** ✅ Complete

**Story Points:** 6
**Sprint:** Sprint 4 (Week 11-12)
**Priority:** MEDIUM
**Completed:** 2025-11-21

---

## User Story

As a **Student**,
I want **PDF certificates, LinkedIn integration, branding**,
So that **I can track my learning journey and achieve my goals**.

---

## Acceptance Criteria

- [x] PDF certificate generation (PDFKit/Puppeteer)
- [x] Branded template (InTime logo, course name)
- [x] Student name, completion date
- [x] Unique certificate ID (verification)
- [x] Download as PDF
- [x] LinkedIn share integration
- [x] Certificate verification page (public)
- [x] Email certificate to student

---

## Implementation

```typescript
// src/lib/certificates/generate.ts
import PDFDocument from 'pdfkit';

export async function generateCertificate(
  studentName: string,
  courseName: string,
  completionDate: Date
): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });

  doc.fontSize(40).text('Certificate of Completion', { align: 'center' });
  doc.fontSize(30).text(studentName, { align: 'center' });
  doc.fontSize(20).text(\`has successfully completed\`, { align: 'center' });
  doc.fontSize(25).text(courseName, { align: 'center' });
  doc.fontSize(15).text(completionDate.toLocaleDateString(), { align: 'center' });

  doc.end();
  return doc;
}
```

```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  enrollment_id UUID REFERENCES student_enrollments(id),
  course_id UUID REFERENCES courses(id),
  
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,
  
  verification_url TEXT
);
```

---

## Implementation Summary

### Certificate Generation Service

**File:** `src/lib/certificates/generator.ts`

**Features:**
- HTML-based certificate template with CSS styling
- Puppeteer PDF generation (landscape A4, 11x8.5 inches)
- Branded design with gradient background
- Decorative corners and border
- Student name, course name, completion date, grade
- Unique certificate number
- Verification URL
- Skills mastered section (optional)
- Upload to Supabase Storage
- Update certificate status to 'issued'

**Template Design:**
- Purple/blue gradient background
- White certificate with decorative border
- InTime logo and branding
- Professional typography (Georgia serif)
- Signature line for Director
- Certificate number and issue date in footer

### tRPC Endpoints

**File:** `src/server/trpc/routers/certificates.ts`

**Endpoints Created:**

1. **getMyCertificates** - List user's certificates
2. **getCertificateById** - Get single certificate details
3. **generatePDF** - Generate certificate PDF (on-demand)
4. **getDownloadUrl** - Get PDF download URL
5. **verify** (public) - Verify certificate by number
6. **getLinkedInShareData** - Get LinkedIn share URL and text
7. **adminGetAll** - Admin view of all certificates

### Pages Created

#### 1. **Public Verification Page**
**Path:** `/verify/[certificateNumber]/page.tsx`

**Features:**
- Public route (no auth required)
- Displays certificate details if valid
- Shows error page if invalid
- SEO-friendly metadata
- Green "verified" theme
- Student name, course, dates, grade
- Issue information
- Link to homepage

#### 2. **Student Certificates Page**
**Path:** `/students/certificates/page.tsx`

**Features:**
- View all earned certificates
- Download PDF button
- LinkedIn share button
- Copy verification link
- Generate PDF (if pending)
- Certificate status badges (issued, pending, failed)
- Retry failed generations
- Empty state for no certificates
- Responsive grid layout

### Integration with Existing Systems

**Graduation Workflow (ACAD-022):**
- Certificate record created on graduation
- PDF generation queued as background job
- Status: pending → issued (after PDF generated)

**Email System:**
- Certificate attached to graduation email
- Verification link included

**LinkedIn Integration:**
- Share to LinkedIn feed
- Custom share text
- Certificate verification URL included

### Certificate Template Components

**Header Section:**
- InTime logo
- "Training Academy" subtitle
- Certificate title

**Main Content:**
- "Presented to" text
- Student name (cursive font)
- "Successfully completed" text
- Course name (bold)
- Completion date

**Optional Sections:**
- Grade badge (if grade provided)
- Skills mastered list

**Footer:**
- Verification URL (left)
- Signature line (center)
- Certificate number + issue date (right)

---

**Dependencies:** ACAD-022
**Next:** ACAD-024 (Enrollment Flow UI)
