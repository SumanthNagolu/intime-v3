# ACAD-023: Certificate Generation

**Story Points:** 6
**Sprint:** Sprint 4 (Week 11-12)
**Priority:** MEDIUM

---

## User Story

As a **Student**,
I want **PDF certificates, LinkedIn integration, branding**,
So that **I can track my learning journey and achieve my goals**.

---

## Acceptance Criteria

- [ ] PDF certificate generation (PDFKit/Puppeteer)
- [ ] Branded template (InTime logo, course name)
- [ ] Student name, completion date
- [ ] Unique certificate ID (verification)
- [ ] Download as PDF
- [ ] LinkedIn share integration
- [ ] Certificate verification page (public)
- [ ] Email certificate to student

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

**Dependencies:** ACAD-022
**Next:** ACAD-024 (Enrollment Flow UI)
