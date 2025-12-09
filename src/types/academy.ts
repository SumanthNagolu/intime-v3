// Academy Portal Types

// Core course types
export interface Course {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_hours: number
  xp_reward: number
  thumbnail_url?: string
  is_published: boolean
  created_at: string
  org_id: string
}

export interface CourseModule {
  id: string
  course_id: string
  title: string
  description?: string
  order_index: number
  xp_reward: number
}

export interface StudentEnrollment {
  id: string
  student_id: string
  course_id: string
  enrolled_at: string
  completed_at?: string
  progress_percent: number
}

export interface StudentProgress {
  readinessScore: number
  totalXP: number
  streakDays: number
  certificateCount: number
  coursesInProgress: number
  coursesCompleted: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  badge_icon: string
  xp_reward: number
  earned_at?: string
}

export interface Certificate {
  id: string
  student_id: string
  course_id: string
  issued_at: string
  certificate_number: string
  course?: {
    id: string
    title: string
  }
}

export interface Cohort {
  id: string
  org_id: string
  name: string
  description?: string
  start_date: string
  end_date?: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  created_at: string
}

export interface AcademyDashboardStats {
  totalCourses: number
  activeEnrollments: number
  certificatesIssued: number
  activeStudents: number
}
