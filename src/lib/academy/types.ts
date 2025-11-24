export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string;
}

export interface Slide {
  title: string;
  bullets: string[];
  context?: string;
}

export interface LessonContent {
  theory: {
    slides: (string | Slide)[]; // URLs or text content for slides
    duration: string;
  };
  demo: {
    videoUrl: string;
    duration: string;
    transcript?: string;
  };
  quiz: {
    questions: QuizQuestion[];
    passingScore: number; // e.g., 80%
  };
  lab: {
    title: string;
    instructions: string;
    codeSnippet?: string;
    userStoryId: string; // Links to Blueprint
  };
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'locked';
  content: LessonContent;
  duration?: string;
  type?: 'standard' | 'lab' | 'quiz';
}

export interface Module {
  id: number;
  title: string;
  description?: string;
  progress: number; // 0-100
  week: string; // e.g. "Week 1"
  lessons: Lesson[];
}

export interface Persona {
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

export interface BlueprintItem {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  moduleRef: number;
  description: string;
  deliverables: string[]; // e.g., "Configured XML", "Gosu Class"
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastModified: Date;
}

export interface InterviewScriptLine {
  speaker: 'Interviewer' | 'SeniorDev';
  text: string;
  duration: number; // ms to read
}
