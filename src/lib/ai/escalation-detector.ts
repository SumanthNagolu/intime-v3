/**
 * Escalation Detection Service
 * ACAD-014: Escalation Logic
 *
 * Automatically detect when students need human trainer assistance
 */

import type { AIMentorChat } from '@/types/ai-mentor';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Frustration keywords indicating student is stuck or upset
 */
const FRUSTRATION_KEYWORDS = [
  // Explicit frustration
  'frustrated',
  'frustrating',
  'confused',
  'confusing',
  'stuck',
  'lost',
  "don't understand",
  "doesn't make sense",
  'no idea',
  'clueless',

  // Negative sentiment
  'hate',
  'stupid',
  'dumb',
  'annoying',
  'terrible',
  'awful',
  'worst',

  // Giving up
  'quit',
  'give up',
  'giving up',
  "can't do this",
  'too hard',
  'impossible',

  // Desperate requests
  'please help',
  'need help',
  'help me',
  'someone help',
  'anyone',
] as const;

/**
 * Explicit trainer request keywords
 */
const TRAINER_REQUEST_KEYWORDS = [
  'talk to trainer',
  'speak to trainer',
  'human help',
  'real person',
  'actual person',
  'not ai',
  'not robot',
  'trainer please',
  'instructor help',
] as const;

/**
 * Question similarity threshold (0-1, Levenshtein distance ratio)
 */
const SIMILARITY_THRESHOLD = 0.7;

/**
 * Thresholds for escalation triggers
 */
export const ESCALATION_THRESHOLDS = {
  REPEATED_QUESTIONS: 5, // Same question asked 5+ times
  FRUSTRATION_KEYWORDS: 2, // 2+ frustration keywords in recent chats
  LOW_RATING_COUNT: 3, // 3+ ratings of 2 or below
  SESSION_DURATION_MINUTES: 30, // 30+ minutes on same topic
  QUESTION_COUNT: 15, // 15+ questions in single session
} as const;

// ============================================================================
// SIMILARITY DETECTION
// ============================================================================

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity ratio between two strings (0-1)
 */
function similarityRatio(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Check if two questions are similar
 */
function areSimilarQuestions(q1: string, q2: string): boolean {
  const normalized1 = q1.toLowerCase().trim();
  const normalized2 = q2.toLowerCase().trim();

  return similarityRatio(normalized1, normalized2) >= SIMILARITY_THRESHOLD;
}

// ============================================================================
// DETECTION LOGIC
// ============================================================================

/**
 * Detect repeated similar questions
 */
function detectRepeatedQuestions(chats: AIMentorChat[]): {
  detected: boolean;
  count: number;
  reason: string | null;
} {
  if (chats.length < ESCALATION_THRESHOLDS.REPEATED_QUESTIONS) {
    return { detected: false, count: 0, reason: null };
  }

  const questions = chats.map((c) => c.question);
  const clusters: string[][] = [];

  // Group similar questions together
  for (const question of questions) {
    let foundCluster = false;

    for (const cluster of clusters) {
      if (areSimilarQuestions(question, cluster[0])) {
        cluster.push(question);
        foundCluster = true;
        break;
      }
    }

    if (!foundCluster) {
      clusters.push([question]);
    }
  }

  // Find largest cluster
  const largestCluster = clusters.reduce(
    (max, cluster) => (cluster.length > max.length ? cluster : max),
    []
  );

  if (largestCluster.length >= ESCALATION_THRESHOLDS.REPEATED_QUESTIONS) {
    return {
      detected: true,
      count: largestCluster.length,
      reason: `Asked similar question ${largestCluster.length} times: "${largestCluster[0].substring(0, 50)}..."`,
    };
  }

  return { detected: false, count: largestCluster.length, reason: null };
}

/**
 * Detect frustration keywords in questions
 */
function detectFrustration(chats: AIMentorChat[]): {
  detected: boolean;
  count: number;
  keywords: string[];
  reason: string | null;
} {
  const foundKeywords: string[] = [];

  for (const chat of chats) {
    const questionLower = chat.question.toLowerCase();

    for (const keyword of FRUSTRATION_KEYWORDS) {
      if (questionLower.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    }
  }

  // Remove duplicates
  const uniqueKeywords = [...new Set(foundKeywords)];

  if (uniqueKeywords.length >= ESCALATION_THRESHOLDS.FRUSTRATION_KEYWORDS) {
    return {
      detected: true,
      count: uniqueKeywords.length,
      keywords: uniqueKeywords,
      reason: `Frustration detected (${uniqueKeywords.length} indicators): ${uniqueKeywords.slice(0, 3).join(', ')}`,
    };
  }

  return {
    detected: false,
    count: uniqueKeywords.length,
    keywords: uniqueKeywords,
    reason: null,
  };
}

/**
 * Detect explicit trainer requests
 */
function detectTrainerRequest(chats: AIMentorChat[]): {
  detected: boolean;
  reason: string | null;
} {
  for (const chat of chats) {
    const questionLower = chat.question.toLowerCase();

    for (const keyword of TRAINER_REQUEST_KEYWORDS) {
      if (questionLower.includes(keyword)) {
        return {
          detected: true,
          reason: `Explicit trainer request: "${chat.question.substring(0, 50)}..."`,
        };
      }
    }
  }

  return { detected: false, reason: null };
}

/**
 * Detect low ratings pattern
 */
function detectLowRatings(chats: AIMentorChat[]): {
  detected: boolean;
  count: number;
  reason: string | null;
} {
  const lowRatings = chats.filter((c) => c.studentRating !== null && c.studentRating <= 2);

  if (lowRatings.length >= ESCALATION_THRESHOLDS.LOW_RATING_COUNT) {
    return {
      detected: true,
      count: lowRatings.length,
      reason: `${lowRatings.length} low ratings (≤2 stars) - student dissatisfied with AI responses`,
    };
  }

  return { detected: false, count: lowRatings.length, reason: null };
}

/**
 * Detect excessive session duration on same topic
 */
function detectLongSession(chats: AIMentorChat[]): {
  detected: boolean;
  durationMinutes: number;
  reason: string | null;
} {
  if (chats.length === 0) {
    return { detected: false, durationMinutes: 0, reason: null };
  }

  const firstChat = chats[0];
  const lastChat = chats[chats.length - 1];

  const durationMs =
    new Date(lastChat.createdAt).getTime() - new Date(firstChat.createdAt).getTime();
  const durationMinutes = Math.floor(durationMs / 60000);

  if (durationMinutes >= ESCALATION_THRESHOLDS.SESSION_DURATION_MINUTES) {
    return {
      detected: true,
      durationMinutes,
      reason: `Session duration: ${durationMinutes} minutes on same topic - student may be struggling`,
    };
  }

  return { detected: false, durationMinutes, reason: null };
}

/**
 * Detect excessive question count in single session
 */
function detectExcessiveQuestions(chats: AIMentorChat[]): {
  detected: boolean;
  count: number;
  reason: string | null;
} {
  if (chats.length >= ESCALATION_THRESHOLDS.QUESTION_COUNT) {
    return {
      detected: true,
      count: chats.length,
      reason: `${chats.length} questions in single session - student may need deeper guidance`,
    };
  }

  return { detected: false, count: chats.length, reason: null };
}

// ============================================================================
// MAIN ESCALATION DETECTOR
// ============================================================================

export interface EscalationResult {
  shouldEscalate: boolean;
  confidence: number; // 0-1
  reasons: string[];
  triggers: {
    repeatedQuestions: boolean;
    frustration: boolean;
    trainerRequest: boolean;
    lowRatings: boolean;
    longSession: boolean;
    excessiveQuestions: boolean;
  };
  metadata: {
    repeatedQuestionCount?: number;
    frustrationKeywords?: string[];
    lowRatingCount?: number;
    sessionDurationMinutes?: number;
    questionCount?: number;
  };
}

/**
 * Analyze chat history and determine if escalation is needed
 */
export function detectEscalation(
  recentChats: AIMentorChat[],
  topicChats: AIMentorChat[]
): EscalationResult {
  const reasons: string[] = [];
  const triggers = {
    repeatedQuestions: false,
    frustration: false,
    trainerRequest: false,
    lowRatings: false,
    longSession: false,
    excessiveQuestions: false,
  };
  const metadata: EscalationResult['metadata'] = {};

  // 1. Check for repeated questions (use topic-level chats)
  const repeatedCheck = detectRepeatedQuestions(topicChats);
  if (repeatedCheck.detected && repeatedCheck.reason) {
    triggers.repeatedQuestions = true;
    reasons.push(repeatedCheck.reason);
    metadata.repeatedQuestionCount = repeatedCheck.count;
  }

  // 2. Check for frustration (use recent chats)
  const frustrationCheck = detectFrustration(recentChats);
  if (frustrationCheck.detected && frustrationCheck.reason) {
    triggers.frustration = true;
    reasons.push(frustrationCheck.reason);
    metadata.frustrationKeywords = frustrationCheck.keywords;
  }

  // 3. Check for explicit trainer request (use recent chats)
  const trainerRequestCheck = detectTrainerRequest(recentChats);
  if (trainerRequestCheck.detected && trainerRequestCheck.reason) {
    triggers.trainerRequest = true;
    reasons.push(trainerRequestCheck.reason);
  }

  // 4. Check for low ratings pattern (use topic-level chats)
  const lowRatingsCheck = detectLowRatings(topicChats);
  if (lowRatingsCheck.detected && lowRatingsCheck.reason) {
    triggers.lowRatings = true;
    reasons.push(lowRatingsCheck.reason);
    metadata.lowRatingCount = lowRatingsCheck.count;
  }

  // 5. Check session duration (use topic-level chats)
  const longSessionCheck = detectLongSession(topicChats);
  if (longSessionCheck.detected && longSessionCheck.reason) {
    triggers.longSession = true;
    reasons.push(longSessionCheck.reason);
    metadata.sessionDurationMinutes = longSessionCheck.durationMinutes;
  }

  // 6. Check excessive questions (use topic-level chats)
  const excessiveQuestionsCheck = detectExcessiveQuestions(topicChats);
  if (excessiveQuestionsCheck.detected && excessiveQuestionsCheck.reason) {
    triggers.excessiveQuestions = true;
    reasons.push(excessiveQuestionsCheck.reason);
    metadata.questionCount = excessiveQuestionsCheck.count;
  }

  // Calculate confidence based on number and type of triggers
  const triggerCount = Object.values(triggers).filter(Boolean).length;
  let confidence = 0;

  if (triggers.trainerRequest) {
    // Explicit request = highest confidence
    confidence = 1.0;
  } else if (triggerCount >= 3) {
    // 3+ triggers = high confidence
    confidence = 0.9;
  } else if (triggerCount === 2) {
    // 2 triggers = medium confidence
    confidence = 0.7;
  } else if (triggerCount === 1) {
    // 1 trigger = low confidence
    confidence = 0.5;
  }

  return {
    shouldEscalate: triggerCount > 0,
    confidence,
    reasons,
    triggers,
    metadata,
  };
}

/**
 * Generate escalation reason summary for database
 */
export function generateEscalationReason(result: EscalationResult): string {
  if (result.reasons.length === 0) {
    return 'Automatic escalation triggered';
  }

  return result.reasons.join(' | ');
}
