#!/bin/bash

# Consolidate all migrations into a single SQL file
# This can be run directly in Supabase Dashboard SQL Editor

OUTPUT_FILE="ALL-MIGRATIONS.sql"

echo "-- ============================================================================" > $OUTPUT_FILE
echo "-- CONSOLIDATED MIGRATIONS - InTime v3" >> $OUTPUT_FILE
echo "-- Created: $(date +%Y-%m-%d)" >> $OUTPUT_FILE
echo "-- Description: All database migrations in execution order" >> $OUTPUT_FILE
echo "-- ============================================================================" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Add each migration file in order
for file in src/lib/db/migrations/00*.sql; do
  if [[ ! "$file" =~ rollback ]]; then
    echo "-- ============================================================================" >> $OUTPUT_FILE
    echo "-- FILE: $(basename $file)" >> $OUTPUT_FILE
    echo "-- ============================================================================" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
    cat "$file" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
  fi
done

# Add role seeding at the end
echo "-- ============================================================================" >> $OUTPUT_FILE
echo "-- SEED: System Roles" >> $OUTPUT_FILE
echo "-- ============================================================================" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

cat >> $OUTPUT_FILE << 'EOF'
-- Seed system roles
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
SELECT 'System roles created:' AS message;
SELECT name, display_name, hierarchy_level
FROM roles
WHERE is_system_role = TRUE
ORDER BY hierarchy_level, name;
EOF

echo "✅ Created $OUTPUT_FILE ($(wc -l < $OUTPUT_FILE) lines)"
echo ""
echo "📝 To apply all migrations:"
echo "   1. Open Supabase Dashboard → SQL Editor"
echo "   2. Create a new query"
echo "   3. Copy and paste the entire contents of $OUTPUT_FILE"
echo "   4. Click 'Run'"
echo ""
