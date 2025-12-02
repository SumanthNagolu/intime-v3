# V Students View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_students` |
| Schema | `public` |
| Purpose | Student enrollment and course progress information |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | YES | Unique identifier |
| email | text | YES | User email address |
| full_name | text | YES | User full name |
| student_enrollment_date | timestamptz | YES | student enrollment date |
| student_current_module | text | YES | student current module |
| student_course_progress | jsonb | YES | student course progress |
| student_graduation_date | timestamptz | YES | student graduation date |
| created_at | timestamptz | YES | Record creation timestamp |

## Definition

```sql
CREATE OR REPLACE VIEW v_students AS
 SELECT id,
    email,
    full_name,
    student_enrollment_date,
    student_current_module,
    student_course_progress,
    student_graduation_date,
    created_at
   FROM user_profiles
  WHERE ((student_enrollment_date IS NOT NULL) AND (deleted_at IS NULL))
  ORDER BY student_enrollment_date DESC;
```
