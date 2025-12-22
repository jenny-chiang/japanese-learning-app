export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type Language = 'zh' | 'en';

export enum FamiliarityLevel {
  DontKnow = 0,
  SoSo = 1,
  Know = 2,
  VeryFamiliar = 3
}

export type Word = {
  id: string;
  level: JLPTLevel;
  kanji: string;
  kana: string;
  meaning: string;
  exampleJa?: string;
  exampleTranslation?: string;
  familiarity: FamiliarityLevel;
  lastReviewedAt?: string;
  flagged?: boolean;
};

export type DiaryEntry = {
  id: string;
  createdAt: string;
  original: string;
  corrected?: string;
  explanations?: string[];
  vocabIds?: string[];
  grammarPoints?: string[];
};

export type UserSettings = {
  mainLevel: JLPTLevel;
  wordsPerDay: number;
  reminderTime?: string;
  notificationsEnabled: boolean;
  examDate?: string;
  language: Language;
};

export type TodayProgress = {
  todayWordCount: number;
  doneWordCount: number;
  diaryDone: boolean;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  requirement: number;
};

export type DailyStats = {
  wordsLearned: number;
  diaryWritten: boolean;
  completed: boolean;
  studyDuration: number;
};

export type LearningStats = {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  lastActiveDate?: string;
  dailyHistory: {
    [date: string]: DailyStats;
  };
};
