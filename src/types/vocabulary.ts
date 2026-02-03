export interface Word {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  audioUrl?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mastery: number; // 0-100
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  correctCount: number;
}

export interface WordBook {
  id: string;
  name: string;
  description: string;
  icon: string;
  wordCount: number;
  progress: number;
  category: 'exam' | 'daily' | 'business' | 'academic' | 'custom';
  level: string;
}

export interface StudySession {
  id: string;
  date: Date;
  mode: StudyMode;
  wordsStudied: number;
  correctCount: number;
  duration: number; // minutes
}

export type StudyMode = 
  | 'word-meaning' 
  | 'meaning-word' 
  | 'spelling' 
  | 'listening' 
  | 'sentence' 
  | 'flashcard';

export interface DailyGoal {
  newWords: number;
  reviewWords: number;
  studyMinutes: number;
}

export interface UserStats {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  streak: number;
  totalStudyDays: number;
  todayNewWords: number;
  todayReviewWords: number;
  todayStudyMinutes: number;
  weeklyProgress: number[];
}

export interface StudyPlan {
  id: string;
  bookId: string;
  dailyNewWords: number;
  dailyReviewWords: number;
  startDate: Date;
  targetDate: Date;
  isActive: boolean;
}
