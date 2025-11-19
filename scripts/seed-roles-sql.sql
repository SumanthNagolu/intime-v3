-- ============================================================================
-- Seed Initial System Roles
-- Description: Creates the core system roles needed for the application
-- Run this after applying migrations
-- Epic: FOUND-002 - Implement RBAC System
-- ============================================================================

-- Insert system roles (skip if they already exist)
INSERT INTO roles (name, display_name, description, is_system_role, hierarchy_level, color_code)
VALUES
  ('super_admin', 'Super Administrator', 'Full system access with all permissions', TRUE, 0, '#dc2626'),
  ('admin', 'Administrator', 'Administrative access to manage users and settings', TRUE, 1, '#ea580c'),
  ('recruiter', 'Recruiter', 'Manages candidates, placements, and client relationships', TRUE, 2, '#0891b2'),
  ('trainer', 'Trainer', 'Manages training courses and student progress', TRUE, 2, '#7c3aed'),
  ('student', 'Student', 'Enrolled in training academy courses', TRUE, 3, '#2563eb'),
  ('candidate', 'Candidate', 'Job seeker available for placement', TRUE, 3, '#16a34a'),
  ('employee', 'Employee', 'Internal team member', TRUE, 3, '#4f46e5'),
  ('client', 'Client', 'Hiring company representative', TRUE, 3, '#9333ea')
ON CONFLICT (name) DO NOTHING;

-- Verify roles were created
SELECT name, display_name, hierarchy_level, is_system_role
FROM roles
WHERE is_system_role = TRUE
ORDER BY hierarchy_level, name;
