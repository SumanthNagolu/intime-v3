-- Migration 011: Document Generation Service
-- Sprint 3: Workflow Engine & Core Services
-- Created: 2025-11-19
-- Purpose: Create document template and generation tracking tables

-- ========================================
-- 1. DOCUMENT_TEMPLATES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL, -- 'pdf', 'docx', 'html'
  category TEXT NOT NULL, -- 'certificate', 'offer_letter', 'report', 'invoice', 'resume'
  template_content TEXT NOT NULL, -- Handlebars template
  variables JSONB DEFAULT '{}'::jsonb NOT NULL, -- Expected variables with descriptions
  sample_data JSONB DEFAULT '{}'::jsonb, -- Sample data for preview
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT unique_template_name_per_org UNIQUE (org_id, name),
  CONSTRAINT valid_template_type CHECK (template_type IN ('pdf', 'docx', 'html'))
);

CREATE INDEX idx_document_templates_org_id ON document_templates(org_id);
CREATE INDEX idx_document_templates_category ON document_templates(category);
CREATE INDEX idx_document_templates_type ON document_templates(template_type);
CREATE INDEX idx_document_templates_active ON document_templates(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE document_templates IS 'Document templates for PDF/DOCX generation';
COMMENT ON COLUMN document_templates.template_content IS 'Handlebars template (HTML for PDF, custom for DOCX)';
COMMENT ON COLUMN document_templates.variables IS 'Expected variables: {"studentName": {"type": "string", "required": true}}';

-- ========================================
-- 2. GENERATED_DOCUMENTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES document_templates(id),
  entity_type TEXT NOT NULL, -- 'student', 'candidate', 'job', etc.
  entity_id UUID NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- bytes
  mime_type TEXT NOT NULL,
  generated_by UUID NOT NULL REFERENCES user_profiles(id),
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- Variables used, download count, etc.

  CONSTRAINT valid_mime_type CHECK (mime_type IN ('application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
);

CREATE INDEX idx_generated_documents_org_id ON generated_documents(org_id);
CREATE INDEX idx_generated_documents_template_id ON generated_documents(template_id);
CREATE INDEX idx_generated_documents_entity ON generated_documents(entity_type, entity_id);
CREATE INDEX idx_generated_documents_generated_at ON generated_documents(generated_at DESC);

COMMENT ON TABLE generated_documents IS 'Metadata for generated documents (files in Supabase Storage)';

-- ========================================
-- RLS POLICIES
-- ========================================

-- document_templates
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates in their org"
  ON document_templates FOR SELECT
  USING (org_id = auth_user_org_id() OR user_is_admin());

CREATE POLICY "Only admins can create templates"
  ON document_templates FOR INSERT
  WITH CHECK (user_is_admin());

CREATE POLICY "Only admins can update templates"
  ON document_templates FOR UPDATE
  USING (user_is_admin());

CREATE POLICY "Only admins can delete templates"
  ON document_templates FOR DELETE
  USING (user_is_admin());

-- generated_documents
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view generated documents in their org"
  ON generated_documents FOR SELECT
  USING (org_id = auth_user_org_id() OR user_is_admin());

CREATE POLICY "Users can create generated documents in their org"
  ON generated_documents FOR INSERT
  WITH CHECK (org_id = auth_user_org_id());

-- ========================================
-- TRIGGERS
-- ========================================

CREATE TRIGGER trigger_document_templates_updated_at
  BEFORE UPDATE ON document_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SEED DATA
-- ========================================

DO $$
DECLARE
  v_org_id UUID;
  v_admin_id UUID;
BEGIN
  -- Get default org and admin user
  SELECT id INTO v_org_id FROM organizations WHERE name = 'InTime Solutions' LIMIT 1;
  SELECT id INTO v_admin_id FROM user_profiles WHERE email LIKE '%admin%' ORDER BY created_at LIMIT 1;

  IF v_org_id IS NULL OR v_admin_id IS NULL THEN
    RAISE NOTICE 'Skipping document template seed data (org or admin not found)';
    RETURN;
  END IF;

  -- Completion Certificate (PDF)
  INSERT INTO document_templates (
    org_id, name, description, template_type, category, template_content, variables, sample_data, created_by
  ) VALUES (
    v_org_id,
    'Course Completion Certificate',
    'Certificate awarded to students upon course completion',
    'pdf',
    'certificate',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4 landscape; margin: 0; }
    body {
      font-family: Georgia, serif;
      text-align: center;
      padding: 80px 60px;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .certificate-header {
      font-size: 64px;
      font-weight: bold;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .certificate-subtitle {
      font-size: 32px;
      margin-bottom: 60px;
      opacity: 0.9;
    }
    .student-name {
      font-size: 48px;
      font-weight: bold;
      margin: 30px 0;
      padding: 20px;
      background: rgba(255,255,255,0.2);
      border-radius: 10px;
    }
    .course-info {
      font-size: 36px;
      margin: 40px 0;
    }
    .details {
      font-size: 24px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 60px;
      font-size: 20px;
    }
    .grade {
      font-size: 32px;
      font-weight: bold;
      color: #FFD700;
    }
  </style>
</head>
<body>
  <div class="certificate-header">CERTIFICATE OF COMPLETION</div>
  <div class="certificate-subtitle">InTime Training Academy</div>

  <p class="details">This certifies that</p>
  <div class="student-name">{{ studentName }}</div>

  <p class="details">has successfully completed</p>
  <div class="course-info"><strong>{{ courseName }}</strong></div>

  <p class="details">
    Completed on {{ completionDate }}<br>
    with a grade of <span class="grade">{{ grade }}%</span>
  </p>

  <div class="footer">
    <p>{{ instructorName }}<br>Lead Instructor</p>
  </div>
</body>
</html>',
    jsonb_build_object(
      'studentName', jsonb_build_object('type', 'string', 'required', true, 'description', 'Full name of student'),
      'courseName', jsonb_build_object('type', 'string', 'required', true, 'description', 'Name of course'),
      'completionDate', jsonb_build_object('type', 'string', 'required', true, 'description', 'Date in format "January 15, 2026"'),
      'grade', jsonb_build_object('type', 'number', 'required', true, 'description', 'Final grade percentage'),
      'instructorName', jsonb_build_object('type', 'string', 'required', true, 'description', 'Name of instructor')
    ),
    jsonb_build_object(
      'studentName', 'John Doe',
      'courseName', 'Guidewire PolicyCenter Fundamentals',
      'completionDate', 'January 15, 2026',
      'grade', 92,
      'instructorName', 'Jane Smith'
    ),
    v_admin_id
  ) ON CONFLICT (org_id, name) DO NOTHING;

  -- Offer Letter (PDF)
  INSERT INTO document_templates (
    org_id, name, description, template_type, category, template_content, variables, sample_data, created_by
  ) VALUES (
    v_org_id,
    'Job Offer Letter',
    'Formal offer letter for candidates',
    'pdf',
    'offer_letter',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      line-height: 1.6;
    }
    .letterhead {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #333;
      padding-bottom: 20px;
    }
    .company-name {
      font-size: 28px;
      font-weight: bold;
      color: #2c3e50;
    }
    .date {
      margin: 30px 0;
      text-align: right;
    }
    .section {
      margin: 20px 0;
    }
    .highlight {
      background: #f0f8ff;
      padding: 20px;
      border-left: 4px solid #3498db;
      margin: 20px 0;
    }
    .signature {
      margin-top: 60px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    table td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    table td:first-child {
      font-weight: bold;
      width: 200px;
    }
  </style>
</head>
<body>
  <div class="letterhead">
    <div class="company-name">{{ companyName }}</div>
  </div>

  <div class="date">{{ currentDate }}</div>

  <div class="section">
    <p>Dear {{ candidateName }},</p>

    <p>We are pleased to offer you the position of <strong>{{ jobTitle }}</strong> at {{ companyName }}.</p>

    <div class="highlight">
      <table>
        <tr><td>Position:</td><td>{{ jobTitle }}</td></tr>
        <tr><td>Salary:</td><td>${{ salary }}/year</td></tr>
        <tr><td>Start Date:</td><td>{{ startDate }}</td></tr>
        <tr><td>Location:</td><td>{{ location }}</td></tr>
      </table>
    </div>

    <p>This offer is contingent upon successful completion of background verification and reference checks.</p>

    <p>Please sign and return this letter by <strong>{{ responseDeadline }}</strong> to confirm your acceptance.</p>

    <p>We look forward to welcoming you to our team!</p>
  </div>

  <div class="signature">
    <p>Sincerely,</p>
    <p><strong>{{ signerName }}</strong><br>{{ signerTitle }}</p>
  </div>

  <div style="margin-top: 80px; border-top: 1px solid #333; padding-top: 20px;">
    <p><strong>Candidate Acceptance:</strong></p>
    <p>I accept the above offer of employment:</p>
    <p>_______________________________<br>Signature</p>
    <p>_______________________________<br>Date</p>
  </div>
</body>
</html>',
    jsonb_build_object(
      'candidateName', jsonb_build_object('type', 'string', 'required', true),
      'jobTitle', jsonb_build_object('type', 'string', 'required', true),
      'companyName', jsonb_build_object('type', 'string', 'required', true),
      'salary', jsonb_build_object('type', 'number', 'required', true),
      'startDate', jsonb_build_object('type', 'string', 'required', true),
      'location', jsonb_build_object('type', 'string', 'required', true),
      'responseDeadline', jsonb_build_object('type', 'string', 'required', true),
      'currentDate', jsonb_build_object('type', 'string', 'required', true),
      'signerName', jsonb_build_object('type', 'string', 'required', true),
      'signerTitle', jsonb_build_object('type', 'string', 'required', true)
    ),
    jsonb_build_object(
      'candidateName', 'Jane Smith',
      'jobTitle', 'Senior Guidewire Developer',
      'companyName', 'Tech Corp',
      'salary', 120000,
      'startDate', 'February 1, 2026',
      'location', 'Remote',
      'responseDeadline', 'January 25, 2026',
      'currentDate', 'January 15, 2026',
      'signerName', 'John Manager',
      'signerTitle', 'VP of Engineering'
    ),
    v_admin_id
  ) ON CONFLICT (org_id, name) DO NOTHING;

  RAISE NOTICE 'Document template seed data created successfully';
END $$;
