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

export type KeyWord = {
  word: string;
  meaning: string;
};

export type AdvancedWord = {
  word: string;
  level: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
};

export type GrammarPoint = {
  pattern: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
};

export type DiaryEntry = {
  id: string;
  createdAt: string;
  original: string;
  corrected?: string;
  chineseSummary?: string; // 中文重述
  explanations?: string[];
  vocabIds?: string[];
  keyWords?: KeyWord[]; // 關鍵單字
  grammarPoints?: GrammarPoint[]; // 文法點（含例句）
  advancedWords?: AdvancedWord[]; // JLPT+1 進階單字
  advancedGrammar?: GrammarPoint[]; // JLPT+1 進階文法
  upgradedVersion?: string; // JLPT+1 升級版
};

export type UserSettings = {
  mainLevel: JLPTLevel;
  wordsPerDay: number;
  reminderTime?: string;
  notificationsEnabled: boolean;
  examDate?: string;
  language: Language;
  themeMode: 'light' | 'dark' | 'system';
  // 注意：geminiApiKey 已移至安全儲存（expo-secure-store），不再存在 AsyncStorage 中
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
