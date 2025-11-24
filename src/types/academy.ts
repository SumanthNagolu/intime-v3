/**
 * Academy Course System Types
 * Story: ACAD-001
 *
 * Multi-course catalog system supporting flexible curriculum hierarchy:
 * Course → Modules → Topics → Lessons
 */

/**
 * Course - Top-level training program
 * Examples: Guidewire PolicyCenter, Salesforce Admin, AWS Solutions Architect
 */
export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  total_modules: number;
  total_topics: number;
  estimated_duration_weeks: number;
  price_monthly: number | null;
  price_one_time: number | null;
  is_included_in_all_access: boolean;
  prerequisite_course_ids: string[] | null;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail_url: string | null;
  promo_video_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * CourseModule - High-level learning unit within a course
 * Examples: "Module 1: Insurance Fundamentals", "Module 2: Platform Basics"
 */
export interface CourseModule {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  description: string | null;
  module_number: number;
  estimated_duration_hours: number | null;
  prerequisite_module_ids: string[] | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * ModuleTopic - Specific lesson within a module
 * Examples: "1.1 Insurance Industry Overview", "2.3 Data Model Deep Dive"
 */
export interface ModuleTopic {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  description: string | null;
  topic_number: number;
  estimated_duration_minutes: number | null;
  content_type: 'video' | 'reading' | 'quiz' | 'lab' | 'project';
  prerequisite_topic_ids: string[] | null;
  is_published: boolean;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * TopicLesson - Granular content item within a topic
 * Examples: Video lectures, markdown readings, PDFs, quizzes, labs
 */
export interface TopicLesson {
  id: string;
  topic_id: string;
  title: string;
  lesson_number: number;
  content_type: 'video' | 'markdown' | 'pdf' | 'quiz' | 'lab' | 'external_link';
  content_url: string | null;
  content_markdown: string | null;
  duration_seconds: number | null;
  lab_environment_template: string | null;
  lab_instructions_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Extended types with relationships
 */

export interface CourseWithModules extends Course {
  modules: CourseModule[];
}

export interface ModuleWithTopics extends CourseModule {
  topics: ModuleTopic[];
}

export interface TopicWithLessons extends ModuleTopic {
  lessons: TopicLesson[];
}

export interface CompleteCourse extends Course {
  modules: Array<
    CourseModule & {
      topics: Array<
        ModuleTopic & {
          lessons: TopicLesson[];
        }
      >;
    }
  >;
}

/**
 * Form inputs for creating/updating courses
 */

export interface CreateCourseInput {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  estimated_duration_weeks: number;
  price_monthly?: number;
  price_one_time?: number;
  is_included_in_all_access?: boolean;
  prerequisite_course_ids?: string[];
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail_url?: string;
  promo_video_url?: string;
  is_published?: boolean;
  is_featured?: boolean;
}

export interface CreateModuleInput {
  course_id: string;
  slug: string;
  title: string;
  description?: string;
  module_number: number;
  estimated_duration_hours?: number;
  prerequisite_module_ids?: string[];
  is_published?: boolean;
}

export interface CreateTopicInput {
  module_id: string;
  slug: string;
  title: string;
  description?: string;
  topic_number: number;
  estimated_duration_minutes?: number;
  content_type: 'video' | 'reading' | 'quiz' | 'lab' | 'project';
  prerequisite_topic_ids?: string[];
  is_published?: boolean;
  is_required?: boolean;
}

export interface CreateLessonInput {
  topic_id: string;
  title: string;
  lesson_number: number;
  content_type: 'video' | 'markdown' | 'pdf' | 'quiz' | 'lab' | 'external_link';
  content_url?: string;
  content_markdown?: string;
  duration_seconds?: number;
  lab_environment_template?: string;
  lab_instructions_url?: string;
}

/**
 * Utility types for curriculum navigation
 */

export interface CurriculumProgress {
  course_id: string;
  total_modules: number;
  completed_modules: number;
  total_topics: number;
  completed_topics: number;
  current_module_number: number;
  current_topic_number: number;
  next_module_id: string | null;
  next_topic_id: string | null;
  is_completed: boolean;
}

export interface PrerequisiteCheck {
  is_met: boolean;
  missing_courses?: string[];
  missing_modules?: string[];
  missing_topics?: string[];
}

/**
 * ============================================
 * Academy UI Types (Frontend-specific)
 * Copied from academy prototype app
 * ============================================
 */

export interface AcademyQuizOption {
  id: string;
  text: string;
}

export interface AcademyQuizQuestion {
  id: string;
  question: string;
  options: AcademyQuizOption[];
  correctOptionId: string;
  explanation?: string;
}

export interface AcademySlide {
  title: string;
  bullets: string[];
  context?: string;
}

export interface AcademyLessonContent {
  theory: {
    slides: (string | AcademySlide)[]; // URLs or text content for slides
    duration: string;
  };
  demo: {
    videoUrl: string;
    duration: string;
    transcript?: string;
  };
  quiz: {
    questions: AcademyQuizQuestion[];
    passingScore: number; // e.g., 80%
  };
  lab: {
    title: string;
    instructions: string;
    codeSnippet?: string;
    userStoryId: string; // Links to Blueprint
  };
}

export interface AcademyLesson {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'locked';
  content: AcademyLessonContent;
  duration?: string;
  type?: 'standard' | 'lab' | 'quiz';
}

export interface AcademyModule {
  id: number;
  title: string;
  description?: string;
  progress: number; // 0-100
  week: string; // e.g. "Week 1"
  lessons: AcademyLesson[];
}

export interface AcademyPersona {
  name: string;
  title: string;
  experienceLevel: string;
  companies: {
    name: string;
    role: string;
    duration: string;
    description: string;
  }[];
  skills: string[];
  image: string;
}

export interface AcademyBlueprintItem {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  moduleRef: number;
  description: string;
  deliverables: string[]; // e.g., "Configured XML", "Gosu Class"
}

export interface AcademyChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface AcademyChatSession {
  id: string;
  title: string;
  messages: AcademyChatMessage[];
  lastModified: Date;
}

export interface AcademyInterviewScriptLine {
  speaker: 'Interviewer' | 'SeniorDev';
  text: string;
  duration: number; // ms to read
}

export interface AcademyCohortActivity {
  user: string;
  action: string;
  time: string;
  type: 'lab' | 'quiz' | 'milestone' | 'practice';
}
