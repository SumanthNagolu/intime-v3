# V Employees View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_employees` |
| Schema | `public` |
| Purpose | Current employees with department and performance information |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | YES | Unique identifier |
| email | text | YES | User email address |
| full_name | text | YES | User full name |
| employee_department | text | YES | employee department |
| employee_position | text | YES | employee position |
| employee_hire_date | timestamptz | YES | employee hire date |
| employee_manager_id | uuid | YES | employee manager id |
| employee_status | text | YES | employee status |

## Definition

```sql
CREATE OR REPLACE VIEW v_employees AS
 SELECT id,
    email,
    full_name,
    employee_department,
    employee_position,
    employee_hire_date,
    employee_manager_id,
    employee_status
   FROM user_profiles
  WHERE ((employee_hire_date IS NOT NULL) AND (employee_status = 'active'::text) AND (deleted_at IS NULL))
  ORDER BY employee_hire_date DESC;
```
