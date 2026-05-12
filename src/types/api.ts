export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
  learningGoal?: string;
  level?: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  email?: string;
  userId?: string | number;
}

export interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  learningGoal?: string;
  level?: string;
}

// Vocabulary Types
export interface VocabularyWord {
  id: string;
  setId?: string;
  word: string;
  pronunciation: string;
  meaning: string;
  description: string;
  descriptionVi?: string;
  example: string;
  exampleVi?: string;
  collocation: string;
  relatedWords: string;
  note: string;
  type?: string;
  level?: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  lastReviewed?: Date;
  correctCount: number;
  incorrectCount: number;
}

export interface VocabularySet {
  id: string;
  name: string;
  description: string;
  tags: string[];
  words: VocabularyWord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningStats {
  totalWords: number;
  totalStudyRounds: number;
  wordsLearned: number;
  streak?: number;
  streakDays?: number;
  accuracy: number;
  dailyActivity: {
    date: string;
    count: number;
    accuracy?: number;
    newWordsLearned?: number;
    timeSpentSeconds?: number;
    retentionRate?: number;
    studySessions?: number;
  }[];
  retentionRate: number;
  levelEstimate?: string;
  last30DaysTimeSpent?: number;
  last30DaysNewWords?: number;
  last30DaysStudyDays?: number;
  totalTimeSpent?: number;
  totalStudyDays?: number;
}

export type SRSRating = 'again' | 'hard' | 'good' | 'easy';
